import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = path.join(root, "admission-math-data");
const dataFiles = ["nitto_data.json", "march_data.json", "soukei_data.json"];
const taxonomy = JSON.parse(fs.readFileSync(path.join(dataDir, "taxonomy.json"), "utf8"));

const normalize = (value) => String(value ?? "")
  .normalize("NFKC")
  .replaceAll("Ⅰ", "I")
  .replaceAll("Ⅱ", "II")
  .replaceAll("Ⅲ", "III")
  .replace(/\s+/g, " ")
  .trim();

const unique = (items) => [...new Set(items.map(normalize).filter(Boolean))];
const includesAny = (text, words) => words.some((word) => text.includes(normalize(word)));
const clampHalf = (value) => Math.max(1, Math.min(5, Math.round(value * 2) / 2));
const courseTokens = (value) => normalize(value).match(/III|II|I|A|B|C/g) || [];

const categoryRules = [
  {
    category: "multi-topic",
    patterns: ["小問集合", "分野横断", "複数分野", "出題範囲横断"],
    concepts: ["複数単元の基礎事項", "設問ごとの解法選択", "正確な計算"],
    steps: ["各小問の分野を判定する", "対応する典型解法を選ぶ", "短い計算を正確に進める", "条件と答えを確認する"],
    mistakes: ["前問の条件を次の小問へ持ち込む", "分野判定を急いで不適切な公式を使う", "短い計算で符号を落とす"],
  },
  {
    category: "probability-counting",
    patterns: ["確率", "場合の数", "組合せ", "数え上げ"],
    concepts: ["標本空間", "場合分け", "順列・組合せ", "確率の加法・乗法"],
    steps: ["試行と条件を整理する", "重複しない場合分けを作る", "各場合を数え上げる", "全体との比または確率の和を求める"],
    mistakes: ["同じ結果を重複して数える", "順序を区別する場合としない場合を混同する", "条件付き確率の分母を誤る"],
  },
  {
    category: "vector",
    patterns: ["ベクトル", "位置ベクトル", "内積", "空間座標"],
    concepts: ["成分表示", "位置ベクトル", "内積", "一次結合"],
    steps: ["基準点または座標を設定する", "条件をベクトルの式に直す", "成分または内積を計算する", "幾何的条件へ戻して結論を確認する"],
    mistakes: ["始点と終点を逆にして符号を誤る", "内積が0となる条件を取り違える", "係数条件と位置関係を混同する"],
  },
  {
    category: "complex-number",
    patterns: ["複素数", "虚数", "極形式"],
    concepts: ["複素数の演算", "共役複素数", "絶対値と偏角", "複素数平面"],
    steps: ["複素数を適切な表示へ直す", "実部・虚部または絶対値・偏角を整理する", "方程式または図形条件を処理する", "複素数平面上の意味を確認する"],
    mistakes: ["虚数単位の符号計算を誤る", "偏角の範囲を落とす", "共役と絶対値の関係を取り違える"],
  },
  {
    category: "calculus-mixed",
    patterns: ["微分積分", "微分・積分", "微分法・積分法"],
    concepts: ["導関数", "増減と極値", "定積分", "面積・体積"],
    steps: ["関数と定義域を整理する", "微分して増減や接線を調べる", "必要な交点と積分区間を求める", "定積分から面積・体積または求値を行う"],
    mistakes: ["微分条件と積分条件を混同する", "積分区間の交点を確認しない", "面積計算で符号を処理し忘れる"],
  },
  {
    category: "integral",
    patterns: ["積分", "面積", "体積", "弧長"],
    concepts: ["原始関数", "定積分", "積分区間", "図形量"],
    steps: ["被積分関数と区間を決める", "符号や上下関係を確認する", "適切な積分法で計算する", "面積・体積などの意味に合わせて答える"],
    mistakes: ["積分定数と定積分を混同する", "上下関係の変化を見落とす", "回転体の半径を取り違える"],
  },
  {
    category: "differential",
    patterns: ["微分", "接線", "極値", "増減"],
    concepts: ["導関数", "接線", "増減表", "極値"],
    steps: ["関数と定義域を整理する", "導関数を求める", "条件式または増減を調べる", "接線・極値・グラフの情報を結論へつなぐ"],
    mistakes: ["接点の座標を代入し忘れる", "導関数の符号と関数値を混同する", "端点を含む最大・最小の比較を落とす"],
  },
  {
    category: "limit-series",
    patterns: ["極限", "無限級数"],
    concepts: ["数列・関数の極限", "収束条件", "無限級数", "評価"],
    steps: ["極限の型と収束条件を確認する", "式変形または評価を行う", "既知の極限や級数へ帰着する", "収束値と条件をまとめる"],
    mistakes: ["収束条件を示さず公式を使う", "無限大と極限値を通常の数のように扱う", "評価の不等号の向きを誤る"],
  },
  {
    category: "sequence",
    patterns: ["数列", "漸化式", "等差", "等比", "総和"],
    concepts: ["一般項", "漸化式", "数列の和", "初期条件"],
    steps: ["初項と規則を整理する", "漸化式または一般項の形を選ぶ", "必要なら和や差を取る", "初期条件と添字を確認する"],
    mistakes: ["添字を1つずらす", "初項を代入して定数を決め忘れる", "和の項数を誤る"],
  },
  {
    category: "trigonometry",
    patterns: ["三角関数", "三角比", "加法定理", "余弦定理", "正弦定理"],
    concepts: ["三角比・三角関数", "角の範囲", "加法定理", "方程式・図形への応用"],
    steps: ["角の範囲と図形条件を整理する", "使用する公式を選ぶ", "三角式を変形または方程式化する", "象限・符号・解の範囲を確認する"],
    mistakes: ["角の範囲から外れる解を残す", "象限による符号を誤る", "度数法と弧度法を混同する"],
  },
  {
    category: "exponential-logarithmic",
    patterns: ["指数", "対数", "常用対数"],
    concepts: ["指数法則", "対数法則", "底と真数の条件", "指数・対数方程式"],
    steps: ["底と定義域を確認する", "同じ底または対数の形へそろえる", "方程式・不等式を解く", "真数条件と解を照合する"],
    mistakes: ["真数条件を確認しない", "底が0と1の間の不等号反転を落とす", "対数の和と積の法則を逆に使う"],
  },
  {
    category: "coordinate-geometry",
    patterns: ["図形と方程式", "座標", "直線", "円の方程式", "曲線", "共有点"],
    concepts: ["座標設定", "直線・円・曲線の方程式", "共有点", "距離・領域"],
    steps: ["図形条件を座標と方程式で表す", "連立または判別式で関係を調べる", "必要な位置関係や個数を求める", "図形的な条件へ戻して確認する"],
    mistakes: ["図形上の点の条件を代入し忘れる", "判別式の等号条件を取り違える", "方程式の解と共有点の個数を無条件に同一視する"],
  },
  {
    category: "geometry",
    patterns: ["平面幾何", "平面図形", "空間図形", "三角形", "円と接線", "図形の性質"],
    concepts: ["図形条件の整理", "角・長さ・面積", "相似・合同", "円や三角形の定理"],
    steps: ["図に条件を書き込む", "使える定理と補助関係を見つける", "長さ・角・比を式にする", "条件を満たす配置か確認する"],
    mistakes: ["図から見える関係を証明せず使う", "相似の対応順を誤る", "複数の配置や場合を落とす"],
  },
  {
    category: "integer",
    patterns: ["整数", "格子点", "約数", "倍数"],
    concepts: ["整数条件", "約数・倍数", "合同・余り", "場合分け"],
    steps: ["整数条件を式にする", "因数分解・余り・範囲で候補を絞る", "場合分けして候補を検証する", "すべての整数解を確認する"],
    mistakes: ["負の整数や0を候補から落とす", "必要条件だけで十分と判断する", "場合分けの境界を重複または欠落させる"],
  },
  {
    category: "statistics-data",
    patterns: ["データ", "分散", "相関", "統計"],
    concepts: ["代表値", "分散・標準偏差", "相関", "標本と推測"],
    steps: ["データと求める量を整理する", "定義または公式へ代入する", "計算結果を比較・解釈する", "単位と条件を確認する"],
    mistakes: ["分散と標準偏差を混同する", "相関から因果関係を断定する", "標本と母集団の量を取り違える"],
  },
  {
    category: "algebra-equation",
    patterns: ["式", "方程式", "不等式", "因数分解", "整式", "2次関数", "二次関数"],
    concepts: ["式変形", "方程式・不等式", "因数分解", "解の条件"],
    steps: ["定義域と条件を整理する", "式を標準形へ変形する", "方程式・不等式を解く", "得られた解を元の条件で確認する"],
    mistakes: ["両辺を割る際に0の場合を落とす", "二乗して生じた余分な解を残す", "不等式変形で符号条件を確認しない"],
  },
];

const genericRule = {
  category: "general-mathematics",
  concepts: ["定義と条件", "式の整理", "典型解法", "結果の検算"],
  steps: ["与えられた条件を整理する", "必要な公式または定理を選ぶ", "式を立てて計算・論証する", "条件と答えを照合する"],
  mistakes: ["条件を読み落とす", "途中式の符号を誤る", "求める量と異なる値で終了する"],
};

const responseMode = (answerFormat) => {
  const text = normalize(answerFormat);
  if (includesAny(text, ["論証", "論述"])) return "proof";
  if (text.includes("記述")) return "written";
  if (text.includes("数値")) return "numeric-choice";
  if (text.includes("マーク")) return "choice";
  if (text.includes("計算")) return "short-calculation";
  return "unspecified";
};

const topicIdsFor = (problem, combinedText, isMulti) => {
  const course = normalize(problem.course);
  const problemCourseTokens = new Set(courseTokens(course));
  const scored = taxonomy.topics.map((topic) => {
    let score = 0;
    const major = normalize(topic.major);
    const minor = normalize(topic.minor);
    const taxonomyCourseTokens = courseTokens(topic.course);
    if (major && combinedText.includes(major)) score += 6;
    if (minor && combinedText.includes(minor)) score += 8;
    if (problemCourseTokens.size && taxonomyCourseTokens.length) {
      score += taxonomyCourseTokens.some((token) => problemCourseTokens.has(token)) ? 5 : -5;
    }
    for (const keyword of String(topic.keywords || "").split(",")) {
      if (keyword && combinedText.includes(normalize(keyword))) score += 2;
    }
    if (isMulti && topic.topic_id === "X-01") score += 10;
    if (!isMulti && topic.topic_id.startsWith("X-")) score -= 8;
    return { id: topic.topic_id, score };
  }).filter((item) => item.score >= 3).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  return (scored.length ? scored : [{ id: isMulti ? "X-01" : "X-02", score: 1 }]).slice(0, 2).map((item) => item.id);
};

const representationsFor = (text, category, mode) => {
  const values = ["symbolic"];
  if (includesAny(text, ["グラフ", "曲線", "座標", "共有点", "領域"])) values.push("graph-coordinate");
  if (includesAny(text, ["図形", "三角形", "円", "ベクトル", "空間", "面積", "体積"])) values.push("diagram-geometric");
  if (category === "probability-counting") values.push("case-table-tree");
  if (category === "statistics-data") values.push("table-statistical");
  if (mode === "proof") values.push("proof-text");
  return unique(values);
};

const difficultyProfileFor = (problem, flags, category, mode) => {
  const overall = Number(problem.difficulty_level) || 3;
  return {
    knowledge_breadth: clampHalf(overall + (flags.multi_topic ? 1 : -0.5)),
    strategy_choice: clampHalf(overall + (includesAny(normalize(problem.skills_summary), ["考察", "推測", "最小", "共有点", "論理"]) ? 0.5 : 0)),
    logic_depth: clampHalf(overall + (mode === "proof" ? 0.75 : 0) + (flags.case_split ? 0.25 : 0)),
    calculation_load: clampHalf(overall + (["integral", "calculus-mixed", "vector"].includes(category) ? 0.5 : 0) - (mode === "proof" ? 0.25 : 0)),
    time_pressure: clampHalf(overall + (flags.multi_topic ? 0.5 : 0) + (["choice", "numeric-choice"].includes(mode) ? 0.25 : 0)),
    overall,
  };
};

const confidenceFor = (problem, category, topicIds) => {
  const genericTopic = ["multi-topic", "general-mathematics"].includes(category);
  const hasEvidence = Boolean(normalize(problem.source_evidence));
  const topicMatch = topicIds[0]?.startsWith("X-") ? "low" : "medium";
  const solutionPattern = genericTopic ? "low" : "medium";
  const level = topicMatch === "low" || solutionPattern === "low" ? "low" : hasEvidence ? "medium" : "low";
  return {
    level,
    topic_match: topicMatch,
    solution_pattern: solutionPattern,
    difficulty_profile: normalize(problem.difficulty_confidence) || "不明",
    exact_statement: "unavailable",
    basis: "既存の分野・技能要約・解答形式・難易度・出典根拠から規則生成",
    source_scope: "metadata_only",
    limitations: "問題本文・具体的な式・数値条件・図の配置は保存されていないため推定しない",
  };
};

const enrich = (problem) => {
  const secondary = problem.secondary_topics || [];
  const combinedText = normalize([
    problem.primary_topic,
    ...secondary,
    problem.course,
    problem.math_track,
    problem.skills_summary,
    problem.answer_format,
    problem.source_evidence,
  ].filter(Boolean).join(" "));
  const primaryText = normalize([problem.primary_topic, ...secondary].join(" "));
  const rule = categoryRules.find((candidate) => includesAny(primaryText, candidate.patterns)) || genericRule;
  const mode = responseMode(problem.answer_format);
  const flags = {
    multi_topic: rule.category === "multi-topic" || includesAny(combinedText, ["複数分野", "分野横断", "小問集合"]),
    case_split: includesAny(combinedText, ["場合分け", "場合の数", "条件付き", "解の個数", "確率"]),
    parameter: includesAny(combinedText, ["文字を含む", "パラメータ", "実数条件", "最小値"]),
    graph_or_diagram: includesAny(combinedText, ["グラフ", "図形", "曲線", "座標", "ベクトル", "面積", "体積"]),
    proof_required: mode === "proof" || includesAny(combinedText, ["論証", "証明", "実証"]),
  };
  const topicIds = topicIdsFor(problem, combinedText, flags.multi_topic);
  const representations = representationsFor(combinedText, rule.category, mode);
  const taxonomyKeywords = taxonomy.topics
    .filter((topic) => topicIds.includes(topic.topic_id))
    .flatMap((topic) => [topic.major, topic.minor, ...String(topic.keywords || "").split(",")]);
  const similarityKeywords = unique([
    problem.primary_topic,
    ...secondary,
    problem.course,
    problem.math_track,
    ...rule.concepts,
    ...taxonomyKeywords,
  ]).slice(0, 24);

  return {
    schema_version: 1,
    derivation: "metadata-rule-v1",
    topic_ids: topicIds,
    category: rule.category,
    concepts: unique([...rule.concepts, ...secondary]).slice(0, 12),
    solution_steps: rule.steps,
    representations,
    response_mode: mode,
    structure_flags: flags,
    difficulty_profile: difficultyProfileFor(problem, flags, rule.category, mode),
    common_mistakes: rule.mistakes,
    similarity_keywords: similarityKeywords,
    archetype: `${rule.category}:${flags.multi_topic ? "multi" : "single"}:${mode}:${representations.join("+")}`,
    confidence: confidenceFor(problem, rule.category, topicIds),
  };
};

const stats = { total: 0, confidence: {}, categories: {}, topic_mapped: 0 };
for (const file of dataFiles) {
  const filePath = path.join(dataDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  data.problems = data.problems.map((problem) => {
    const problemFeatures = enrich(problem);
    stats.total += 1;
    stats.confidence[problemFeatures.confidence.level] = (stats.confidence[problemFeatures.confidence.level] || 0) + 1;
    stats.categories[problemFeatures.category] = (stats.categories[problemFeatures.category] || 0) + 1;
    if (problemFeatures.topic_ids.length > 0) stats.topic_mapped += 1;
    return { ...problem, problem_features: problemFeatures };
  });
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

if (stats.total !== 117 || stats.topic_mapped !== stats.total) {
  throw new Error(`Feature coverage failed: ${JSON.stringify(stats)}`);
}

console.log(JSON.stringify(stats));
