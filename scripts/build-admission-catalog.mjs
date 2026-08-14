import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = path.join(root, "admission-math-data");
const sources = [
  ["日東駒専", "nitto_data.json"],
  ["MARCH", "march_data.json"],
  ["早慶", "soukei_data.json"],
];

const datasets = sources.map(([group, file]) => ({
  group,
  file,
  data: JSON.parse(fs.readFileSync(path.join(dataDir, file), "utf8")),
}));
const taxonomy = JSON.parse(fs.readFileSync(path.join(dataDir, "taxonomy.json"), "utf8"));

const problems = datasets.flatMap(({ group, data }) =>
  data.problems.map((problem) => ({
    ...problem,
    group: problem.group || group,
    search_text: [
      problem.university,
      problem.year,
      problem.faculty_scope,
      problem.math_track,
      problem.course,
      problem.primary_topic,
      ...(problem.secondary_topics || []),
      problem.skills_summary,
      problem.difficulty_label,
    ].filter(Boolean).join(" ").normalize("NFKC"),
  }))
);

const ids = new Set();
for (const problem of problems) {
  if (!problem.problem_id || ids.has(problem.problem_id)) {
    throw new Error(`Duplicate or missing problem_id: ${problem.problem_id}`);
  }
  ids.add(problem.problem_id);
}

const addIndex = (index, key, problemId) => {
  if (!key) return;
  const normalizedKey = String(key).normalize("NFKC");
  (index[normalizedKey] ||= []).push(problemId);
};

const indexes = {
  by_group: {},
  by_university: {},
  by_course: {},
  by_topic: {},
  by_difficulty: {},
};

for (const problem of problems) {
  addIndex(indexes.by_group, problem.group, problem.problem_id);
  addIndex(indexes.by_university, problem.university, problem.problem_id);
  addIndex(indexes.by_course, problem.course, problem.problem_id);
  addIndex(indexes.by_topic, problem.primary_topic, problem.problem_id);
  for (const topic of problem.secondary_topics || []) {
    addIndex(indexes.by_topic, topic, problem.problem_id);
  }
  addIndex(indexes.by_difficulty, problem.difficulty_level, problem.problem_id);
}

const catalog = {
  schema_version: 1,
  generated_at: "2026-08-14",
  purpose: "ChatGPTプロジェクト内で自作プリントの近似過去問を高速検索するための統合索引",
  usage_note: "問題本文は保存していない。primary_topic、skills_summary、difficulty_level等で候補を選び、source_urlを出典として示す。",
  counts: {
    total_problems: problems.length,
    by_group: Object.fromEntries(sources.map(([group]) => [group, problems.filter((item) => item.group === group).length])),
  },
  taxonomy,
  indexes,
  exams: datasets.flatMap(({ data }) => data.exams || []),
  source_catalog: datasets.flatMap(({ data }) => data.source_catalog || []),
  problems,
};

fs.writeFileSync(
  path.join(dataDir, "catalog.json"),
  `${JSON.stringify(catalog, null, 2)}\n`,
  "utf8"
);

console.log(JSON.stringify(catalog.counts));
