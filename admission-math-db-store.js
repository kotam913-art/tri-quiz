(()=>{
  'use strict';

  const PREFIX='tri-quiz:admission-math:v1';
  const DRAFT_KEY=`${PREFIX}:draft`;
  const PRINTS_KEY=`${PREFIX}:prints`;
  const memory=new Map();

  function now(){return new Date().toISOString()}

  function randomPart(){
    if(globalThis.crypto&&typeof globalThis.crypto.randomUUID==='function')return globalThis.crypto.randomUUID().slice(0,8).toUpperCase();
    return Math.random().toString(36).slice(2,10).toUpperCase();
  }

  function makePrintId(){
    const date=new Date();
    const stamp=[date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('');
    return `PRINT-${stamp}-${randomPart()}`;
  }

  function read(key,fallback){
    try{
      const value=localStorage.getItem(key);
      if(value!==null)return JSON.parse(value);
    }catch(error){}
    if(memory.has(key))return memory.get(key);
    return fallback;
  }

  function write(key,value){
    memory.set(key,value);
    try{
      localStorage.setItem(key,JSON.stringify(value));
      return true;
    }catch(error){return false}
  }

  function normalizeProblemIds(values){
    return [...new Set((Array.isArray(values)?values:[]).filter(value=>typeof value==='string'&&value.trim()))];
  }

  function normalizeDraft(value={}){
    const timestamp=now();
    return {
      schema_version:1,
      print_id:value.print_id||makePrintId(),
      title:String(value.title||''),
      student_id:String(value.student_id||''),
      problem_ids:normalizeProblemIds(value.problem_ids),
      note:String(value.note||''),
      recommendation_context:value.recommendation_context&&typeof value.recommendation_context==='object'?value.recommendation_context:null,
      created_at:value.created_at||timestamp,
      updated_at:value.updated_at||timestamp
    };
  }

  function loadDraft(){
    return normalizeDraft(read(DRAFT_KEY,{}));
  }

  function saveDraft(value){
    const draft=normalizeDraft({...value,updated_at:now()});
    const persisted=write(DRAFT_KEY,draft);
    return {draft,persisted};
  }

  function patchDraft(patch){
    return saveDraft({...loadDraft(),...patch});
  }

  function addProblem(problemId){
    const draft=loadDraft();
    return saveDraft({...draft,problem_ids:[...draft.problem_ids,problemId]});
  }

  function removeProblem(problemId){
    const draft=loadDraft();
    return saveDraft({...draft,problem_ids:draft.problem_ids.filter(id=>id!==problemId)});
  }

  function clearProblems(){
    return patchDraft({problem_ids:[],recommendation_context:null});
  }

  function newDraft(seed={}){
    const draft=normalizeDraft(seed);
    const persisted=write(DRAFT_KEY,draft);
    return {draft,persisted};
  }

  function loadPrints(){
    const values=read(PRINTS_KEY,[]);
    if(!Array.isArray(values))return [];
    return values.map(normalizeDraft).sort((a,b)=>String(b.updated_at).localeCompare(String(a.updated_at)));
  }

  function savePrint(value){
    const record=normalizeDraft({...value,updated_at:now()});
    const prints=loadPrints();
    const index=prints.findIndex(print=>print.print_id===record.print_id);
    if(index>=0)prints[index]=record;
    else prints.push(record);
    const persisted=write(PRINTS_KEY,prints);
    write(DRAFT_KEY,record);
    return {record,persisted};
  }

  function deletePrint(printId){
    const prints=loadPrints().filter(print=>print.print_id!==printId);
    return {prints,persisted:write(PRINTS_KEY,prints)};
  }

  function openPrint(printId){
    const found=loadPrints().find(print=>print.print_id===printId);
    if(!found)return null;
    const draft=normalizeDraft(found);
    write(DRAFT_KEY,draft);
    return draft;
  }

  window.AdmissionMathStore={
    loadDraft,
    saveDraft,
    patchDraft,
    addProblem,
    removeProblem,
    clearProblems,
    newDraft,
    loadPrints,
    savePrint,
    deletePrint,
    openPrint,
    makePrintId,
    schemaVersion:1,
    storagePrefix:PREFIX
  };
})();
