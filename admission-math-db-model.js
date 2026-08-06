(()=>{
  'use strict';

  const DATA_FILES=[
    'admission-math-data/nitto_data.json?v=1',
    'admission-math-data/march_data.json?v=1',
    'admission-math-data/soukei_data.json?v=1',
    'admission-math-data/taxonomy.json?v=1'
  ];
  const EXPECTED={sources:55,exams:67,problems:117,topics:39};
  const collator=new Intl.Collator('ja',{numeric:true,sensitivity:'base'});

  const valueLabels={
    official:'大学公式',
    official_guidance:'大学公式案内',
    official_index:'大学公式索引',
    official_legacy:'大学公式・旧年度',
    official_legacy_pdf:'大学公式・旧年度PDF',
    official_linked_external:'大学公式案内先',
    open:'公開',
    available:'公開あり',
    not_available:'公式配布なし',
    not_currently_indexed:'現行一覧に掲載なし',
    not_yet_listed:'未掲載',
    not_yet_available:'未公開',
    unavailable:'未収録',
    partial:'一部収録',
    partial_legacy_pdf:'旧年度PDFの一部',
    complete_for_listed_math_variants:'掲載区分を収録済み',
    index_missing:'公式索引未確認',
    metadata_link_only_no_copy_repost_edit:'メタデータ・リンクのみ（複製・転載・編集なし）',
    metadata_only_no_official_distribution:'メタデータのみ（公式配布なし）'
  };

  function normalizeText(value){
    return String(value??'').normalize('NFKC').toLocaleLowerCase('ja');
  }

  function joinValues(values){
    return values.flat(Infinity).filter(value=>value!==null&&value!==undefined).join(' ');
  }

  function unique(values){
    return [...new Set(values.filter(value=>value!==null&&value!==undefined&&String(value).trim()!==''))];
  }

  function optionSort(values){
    const groupOrder={'日東駒専':1,'MARCH':2,'早慶':3};
    return [...values].sort((a,b)=>{
      if(groupOrder[a]||groupOrder[b])return (groupOrder[a]||99)-(groupOrder[b]||99);
      if(typeof a==='number'&&typeof b==='number')return b-a;
      return collator.compare(String(a),String(b));
    });
  }

  function displayValue(value,fallback='未確認'){
    if(value===null||value===undefined||String(value).trim()==='')return fallback;
    return valueLabels[value]||String(value);
  }

  function difficultyBand(value){
    const number=Number(value);
    if(!Number.isFinite(number))return '';
    if(number>=4.6)return '5';
    if(number>=4)return '4';
    if(number>=3)return '3';
    if(number>=2)return '2';
    return '1';
  }

  function trackValue(record,mode){
    if(mode==='sources')return Array.isArray(record.math_variants)?record.math_variants:[];
    return [record.math_track||''];
  }

  function searchText(record,mode){
    if(mode==='problems'){
      return joinValues([
        record.problem_id,record.group,record.university,record.year,record.faculty_scope,
        record.math_track,record.question_no,record.course,record.primary_topic,
        record.secondary_topics||[],record.skills_summary,record.answer_format,
        record.difficulty_label,record.difficulty_confidence,record.source_evidence,
        record.rights_status
      ]);
    }
    if(mode==='exams'){
      return joinValues([
        record.exam_id,record.group,record.university,record.year,record.exam_date,
        record.admission_method,record.selection_method,record.faculty_scope,
        record.math_track,record.content_form,record.classification_status,record.note,
        record.rights_status
      ]);
    }
    return joinValues([
      record.source_id,record.group,record.university,record.year,record.scope,
      record.math_variants||[],record.problem_availability,record.answer_availability,
      record.explanation_availability,record.source_type,record.coverage_status,
      record.note,record.rights_status
    ]);
  }

  function filterRecords(records,mode,filters){
    const keyword=normalizeText(filters.keyword).trim();
    return records.filter(record=>{
      if(filters.group&&record.group!==filters.group)return false;
      if(filters.university&&record.university!==filters.university)return false;
      if(filters.year&&String(record.year)!==String(filters.year))return false;
      if(filters.track&&!trackValue(record,mode).includes(filters.track))return false;
      if(mode==='problems'&&filters.topic&&record.primary_topic!==filters.topic)return false;
      if(mode==='problems'&&filters.difficulty&&difficultyBand(record.difficulty_level)!==filters.difficulty)return false;
      if(keyword&&!normalizeText(searchText(record,mode)).includes(keyword))return false;
      return true;
    });
  }

  function sortRecords(records,sortKey){
    const copy=[...records];
    const stableText=(a,b)=>collator.compare(String(a.university||''),String(b.university||''))||collator.compare(String(a.problem_id||a.exam_id||a.source_id||''),String(b.problem_id||b.exam_id||b.source_id||''));
    return copy.sort((a,b)=>{
      if(sortKey==='year-asc')return Number(a.year)-Number(b.year)||stableText(a,b);
      if(sortKey==='difficulty-asc')return (Number(a.difficulty_level)||99)-(Number(b.difficulty_level)||99)||Number(b.year)-Number(a.year)||stableText(a,b);
      if(sortKey==='difficulty-desc')return (Number(b.difficulty_level)||-1)-(Number(a.difficulty_level)||-1)||Number(b.year)-Number(a.year)||stableText(a,b);
      if(sortKey==='university')return stableText(a,b)||Number(b.year)-Number(a.year);
      return Number(b.year)-Number(a.year)||stableText(a,b);
    });
  }

  function recommendationScore(candidate,anchor){
    const primaryMatch=candidate.primary_topic===anchor.primary_topic;
    const courseMatch=candidate.course===anchor.course;
    const candidateSecondary=new Set(candidate.secondary_topics||[]);
    const secondaryOverlap=(anchor.secondary_topics||[]).filter(topic=>candidateSecondary.has(topic));
    const difficultyDelta=Math.abs(Number(candidate.difficulty_level)-Number(anchor.difficulty_level));
    let score=0;
    if(primaryMatch)score+=70;
    if(courseMatch)score+=14;
    score+=secondaryOverlap.length*7;
    if(difficultyDelta<=.25)score+=25;
    else if(difficultyDelta<=.5)score+=20;
    else if(difficultyDelta<=1)score+=12;
    else if(difficultyDelta<=1.5)score+=5;
    if(candidate.math_track===anchor.math_track)score+=4;
    const reasons=[];
    if(primaryMatch)reasons.push(`主分野「${candidate.primary_topic}」が一致`);
    else if(courseMatch)reasons.push(`科目「${candidate.course}」が一致`);
    reasons.push(`難度差 ${difficultyDelta.toFixed(1)}`);
    if(secondaryOverlap.length)reasons.push(`関連分野 ${secondaryOverlap.join('・')}`);
    return {
      score,
      primary_topic_match:primaryMatch,
      difficulty_delta:Number(difficultyDelta.toFixed(2)),
      secondary_overlap:secondaryOverlap,
      reason:reasons.join('／')
    };
  }

  function recommend(problems,anchorIds,limit=6){
    const ids=new Set(anchorIds);
    const anchors=problems.filter(problem=>ids.has(problem.problem_id));
    if(!anchors.length)return [];
    return problems
      .filter(problem=>!ids.has(problem.problem_id))
      .map(problem=>{
        const matches=anchors.map(anchor=>({anchor,...recommendationScore(problem,anchor)}));
        const best=matches.sort((a,b)=>b.score-a.score)[0];
        return {
          problem,
          score:best.score,
          anchor_problem_id:best.anchor.problem_id,
          primary_topic_match:best.primary_topic_match,
          difficulty_delta:best.difficulty_delta,
          secondary_overlap:best.secondary_overlap,
          reason:best.reason,
          rule_version:'topic-difficulty-v1'
        };
      })
      .filter(result=>result.primary_topic_match||result.score>=38)
      .sort((a,b)=>b.score-a.score||a.difficulty_delta-b.difficulty_delta||Number(b.problem.year)-Number(a.problem.year)||collator.compare(a.problem.problem_id,b.problem.problem_id))
      .slice(0,limit);
  }

  function getFilterOptions(data){
    return {
      groups:optionSort(unique(data.sources.map(record=>record.group))),
      universities:optionSort(unique(data.sources.map(record=>record.university))),
      years:optionSort(unique(data.sources.map(record=>record.year))),
      tracksByMode:{
        problems:optionSort(unique(data.problems.map(record=>record.math_track))),
        exams:optionSort(unique(data.exams.map(record=>record.math_track))),
        sources:optionSort(unique(data.sources.flatMap(record=>record.math_variants||[])))
      },
      topics:optionSort(unique(data.problems.map(record=>record.primary_topic)))
    };
  }

  function enrichData(payloads){
    const collections=payloads.slice(0,3);
    const sources=collections.flatMap(data=>data.source_catalog||[]);
    const exams=collections.flatMap(data=>data.exams||[]);
    const rawProblems=collections.flatMap(data=>data.problems||[]);
    const taxonomy=payloads[3]||{};
    const examsById=new Map(exams.map(exam=>[exam.exam_id,exam]));
    const sourcesByKey=new Map(sources.map(source=>[`${source.university}|${source.year}`,source]));
    const problems=rawProblems.map(problem=>({
      ...problem,
      exam:examsById.get(problem.exam_id)||null,
      source:sourcesByKey.get(`${problem.university}|${problem.year}`)||null
    }));
    const counts={sources:sources.length,exams:exams.length,problems:problems.length,topics:(taxonomy.topics||[]).length};
    for(const [name,expected] of Object.entries(EXPECTED)){
      if(counts[name]!==expected)throw new Error(`data-count-mismatch:${name}:${counts[name]}:${expected}`);
    }
    if(problems.some(problem=>problem.problem_text_stored===true))throw new Error('problem-text-must-not-be-stored');
    return {
      sources,exams,problems,taxonomy,counts,
      problemsById:new Map(problems.map(problem=>[problem.problem_id,problem])),
      examsById,
      sourcesByKey
    };
  }

  async function load(){
    const responses=await Promise.all(DATA_FILES.map(async url=>{
      const response=await fetch(url,{cache:'no-cache'});
      if(!response.ok)throw new Error(`data-load-failed:${url}:${response.status}`);
      return response.json();
    }));
    return enrichData(responses);
  }

  window.AdmissionMathModel={
    load,
    displayValue,
    difficultyBand,
    filterRecords,
    sortRecords,
    getFilterOptions,
    recommend,
    normalizeText,
    dataFiles:[...DATA_FILES],
    expectedCounts:{...EXPECTED}
  };
})();
