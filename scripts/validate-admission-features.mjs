import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = path.join(root, "admission-math-data");
const files = ["nitto_data.json", "march_data.json", "soukei_data.json"];
const taxonomy = JSON.parse(fs.readFileSync(path.join(dataDir, "taxonomy.json"), "utf8"));
const validTopicIds = new Set(taxonomy.topics.map((topic) => topic.topic_id));
const sourceProblems = files.flatMap((file) => JSON.parse(fs.readFileSync(path.join(dataDir, file), "utf8")).problems);
const catalog = JSON.parse(fs.readFileSync(path.join(dataDir, "catalog.json"), "utf8"));
const liteCatalog = JSON.parse(fs.readFileSync(path.join(dataDir, "catalog-lite.json"), "utf8"));

const errors = [];
const ids = new Set();
const requiredArrays = ["topic_ids", "concepts", "solution_steps", "representations", "common_mistakes", "similarity_keywords"];
const requiredDifficulty = ["knowledge_breadth", "strategy_choice", "logic_depth", "calculation_load", "time_pressure", "overall"];

for (const problem of sourceProblems) {
  if (!problem.problem_id || ids.has(problem.problem_id)) errors.push(`duplicate or missing id: ${problem.problem_id}`);
  ids.add(problem.problem_id);
  const features = problem.problem_features;
  if (!features) {
    errors.push(`missing features: ${problem.problem_id}`);
    continue;
  }
  for (const field of requiredArrays) {
    if (!Array.isArray(features[field]) || features[field].length === 0) errors.push(`${problem.problem_id}: invalid ${field}`);
  }
  if (features.solution_steps?.length < 4) errors.push(`${problem.problem_id}: too few solution steps`);
  if (features.common_mistakes?.length < 3) errors.push(`${problem.problem_id}: too few common mistakes`);
  if (features.topic_ids?.some((id) => !validTopicIds.has(id))) errors.push(`${problem.problem_id}: unknown topic id`);
  for (const field of requiredDifficulty) {
    const value = features.difficulty_profile?.[field];
    if (typeof value !== "number" || value < 1 || value > 5) errors.push(`${problem.problem_id}: invalid difficulty ${field}`);
  }
  if (!features.confidence?.level || !features.confidence?.limitations) errors.push(`${problem.problem_id}: incomplete confidence`);
  if (problem.problem_text_stored !== false) errors.push(`${problem.problem_id}: unexpected problem text status`);
}

if (sourceProblems.length !== 117) errors.push(`expected 117 source problems, got ${sourceProblems.length}`);
if (catalog.problems.length !== sourceProblems.length) errors.push("catalog/source count mismatch");
if (catalog.counts.feature_enriched !== sourceProblems.length) errors.push("catalog feature count mismatch");
if (catalog.feature_version !== "metadata-rule-v1") errors.push("catalog feature version mismatch");
if (liteCatalog.count !== sourceProblems.length || liteCatalog.problems.length !== sourceProblems.length) errors.push("lite catalog count mismatch");
if (!Array.isArray(liteCatalog.fields) || liteCatalog.fields.length !== 19) errors.push("lite catalog fields mismatch");
if (!liteCatalog.feature_templates || Object.keys(liteCatalog.feature_templates).length < 10) errors.push("lite catalog templates missing");
if (fs.statSync(path.join(dataDir, "catalog-lite.json")).size > 35000) errors.push("lite catalog exceeds 35 KB transfer target");

for (const [indexName, values] of Object.entries(catalog.indexes)) {
  for (const [key, problemIds] of Object.entries(values)) {
    for (const problemId of problemIds) {
      if (!ids.has(problemId)) errors.push(`${indexName}.${key}: unknown id ${problemId}`);
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({
    valid: true,
    problems: sourceProblems.length,
    enriched: catalog.counts.feature_enriched,
    confidence: catalog.counts.feature_confidence,
    categories: Object.keys(catalog.indexes.by_category).length,
    topic_ids: Object.keys(catalog.indexes.by_topic_id).length,
    representations: Object.keys(catalog.indexes.by_representation).length,
    lite_bytes: fs.statSync(path.join(dataDir, "catalog-lite.json")).size,
  }));
}
