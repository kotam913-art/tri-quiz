(()=>{
  'use strict';
  const DATA=window.RADIAN_QUIZ_DATA;
  const UI=window.RadianQuizUI;
  const KEY='tri-quiz:radian-angle-pairs-2026:v5';
  const LIMIT=300;
  const $=selector=>document.querySelector(selector);
  const timer=$('#timer');
  const progress=$('#progress');
  const overlay=$('#overlay');
  const submit=$('#submit');
  const reset=$('#reset');
  const result=$('#result');
  let state={conversions:{},pairs:{}};
  let startAt=0;
  let timerId=null;
  let locked=false;

  function save(){
    try{localStorage.setItem(KEY+':state',JSON.stringify(state))}catch(error){}
  }
  function store(suffix,value){
    try{localStorage.setItem(KEY+suffix,String(value))}catch(error){}
  }
  function load(suffix,fallback=''){
    try{return localStorage.getItem(KEY+suffix)||fallback}catch(error){return fallback}
  }
  function clearStored(){
    try{[':state',':start',':done'].forEach(suffix=>localStorage.removeItem(KEY+suffix))}catch(error){}
  }
  function ensureState(){
    if(!state||typeof state!=='object')state={};
    if(!state.conversions||typeof state.conversions!=='object')state.conversions={};
    if(!state.pairs||typeof state.pairs!=='object')state.pairs={};
    DATA.pairs.forEach(q=>{if(!Array.isArray(state.pairs[q.id]))state.pairs[q.id]=[]});
  }
  function answeredCount(){
    const conversions=DATA.conversions.filter(q=>Boolean(state.conversions[q.id])).length;
    const pairs=DATA.pairs.filter(q=>state.pairs[q.id].length===2).length;
    return conversions+pairs;
  }
  function updateProgress(){
    progress.textContent=`${answeredCount()} / 11`;
  }
  function updateConversion(q){
    const card=document.querySelector(`[data-id="${q.id}"]`);
    const selected=state.conversions[q.id]||'';
    card.querySelectorAll('.option').forEach(button=>button.classList.toggle('selected',button.dataset.value===selected));
  }
  function updatePair(q){
    const card=document.querySelector(`[data-id="${q.id}"]`);
    const selected=state.pairs[q.id];
    card.querySelectorAll('.quadrant-hit').forEach(button=>button.classList.toggle('selected',selected.includes(Number(button.dataset.quadrant))));
    UI.drawCircle(card.querySelector('svg'),selected,q,false);
  }
  function updateAll(){
    DATA.conversions.forEach(updateConversion);
    DATA.pairs.forEach(updatePair);
    updateProgress();
  }
  function bindEvents(){
    DATA.conversions.forEach(q=>{
      const card=document.querySelector(`[data-id="${q.id}"]`);
      card.querySelectorAll('.option').forEach(button=>button.addEventListener('click',()=>{
        if(locked)return;
        state.conversions[q.id]=button.dataset.value;
        save();
        updateConversion(q);
        updateProgress();
      }));
    });
    DATA.pairs.forEach(q=>{
      const card=document.querySelector(`[data-id="${q.id}"]`);
      const note=card.querySelector('.limit-note');
      card.querySelectorAll('.quadrant-hit').forEach(button=>button.addEventListener('click',event=>{
        if(locked)return;
        const quadrant=Number(button.dataset.quadrant);
        const selected=state.pairs[q.id];
        const index=selected.indexOf(quadrant);
        note.textContent='';
        if(index>=0)selected.splice(index,1);
        else if(selected.length<2)selected.push(quadrant);
        else{note.textContent='これ以上は置けません。取り消す場所をもう一度タップしよう。';if(event.detail>0)button.blur();return}
        selected.sort((a,b)=>a-b);
        save();
        updatePair(q);
        updateProgress();
        if(event.detail>0)button.blur();
      }));
    });
  }
  function sameAngles(selected,answers){
    return selected.length===answers.length&&answers.every(angle=>selected.includes(angle));
  }
  function grade(){
    let total=0;
    DATA.conversions.forEach(q=>{
      const card=document.querySelector(`[data-id="${q.id}"]`);
      const selected=state.conversions[q.id]||'';
      const ok=selected===q.answer;
      if(ok)total++;
      card.querySelectorAll('.option').forEach(button=>{
        button.classList.remove('selected');
        button.classList.toggle('correct',button.dataset.value===q.answer);
        button.classList.toggle('wrong',button.dataset.value===selected&&!ok);
      });
      card.querySelector('.score').textContent=`${ok?1:0} / 1`;
      card.querySelector('.answer-panel').classList.add('show');
    });
    DATA.pairs.forEach(q=>{
      const card=document.querySelector(`[data-id="${q.id}"]`);
      const selected=state.pairs[q.id];
      const ok=sameAngles(selected,q.quadrants);
      if(ok)total++;
      card.querySelectorAll('.quadrant-hit').forEach(button=>{
        const quadrant=Number(button.dataset.quadrant);
        button.classList.remove('selected');
        button.classList.toggle('correct',selected.includes(quadrant)&&q.quadrants.includes(quadrant));
        button.classList.toggle('wrong',selected.includes(quadrant)&&!q.quadrants.includes(quadrant));
        button.classList.toggle('missed',!selected.includes(quadrant)&&q.quadrants.includes(quadrant));
      });
      card.querySelector('.score').textContent=`${ok?1:0} / 1`;
      card.querySelector('.pair-answer').classList.add('show');
      UI.drawCircle(card.querySelector('svg'),selected,q,true);
    });
    $('#total').textContent=`${total} / 11`;
    $('#message').textContent=total===11?'全問正解です。弧度法も単位円もばっちりです！':total>=8?'よくできています。正答の三角形の位置も確認しよう。':total>=5?'あと一歩です。符号から位置を絞ると見つけやすくなります。':'正答を見ながら、三角形の位置を確認しよう。';
    result.classList.add('show');
  }
  function lock(value){
    locked=value;
    document.querySelectorAll('.option,.quadrant-hit').forEach(button=>button.disabled=value);
    submit.disabled=value;
    reset.textContent=value?'リセットしてもう一度':'リセット';
  }
  function secondsLeft(){
    return Math.max(0,LIMIT-Math.floor((Date.now()-startAt)/1000));
  }
  function tick(){
    const seconds=secondsLeft();
    timer.textContent=`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
    if(seconds===0)finish('timeout');
  }
  function runTimer(){
    clearInterval(timerId);
    tick();
    timerId=setInterval(tick,250);
  }
  function finish(reason){
    if(locked||!startAt)return;
    clearInterval(timerId);
    save();
    store(':done',reason);
    grade();
    lock(true);
    if(reason==='timeout')timer.textContent='00:00';
    result.scrollIntoView({behavior:'smooth'});
  }
  function resetAll(){
    clearInterval(timerId);
    clearStored();
    state={conversions:{},pairs:{}};
    ensureState();
    startAt=0;
    locked=false;
    document.querySelectorAll('.correct,.wrong,.missed,.selected,.show,.graded').forEach(element=>element.classList.remove('correct','wrong','missed','selected','show','graded'));
    document.querySelectorAll('.score').forEach(element=>element.textContent='— / 1');
    document.querySelectorAll('.limit-note').forEach(element=>element.textContent='');
    $('#total').textContent='0 / 11';
    $('#message').textContent='';
    timer.textContent='05:00';
    updateAll();
    lock(false);
    submit.disabled=true;
    overlay.classList.remove('hide');
    scrollTo({top:0,behavior:'smooth'});
  }

  UI.render(DATA);
  try{state=JSON.parse(load(':state','{}'))||{}}catch(error){state={}}
  ensureState();
  bindEvents();
  updateAll();
  $('#start').addEventListener('click',()=>{
    startAt=Date.now();
    store(':start',startAt);
    overlay.classList.add('hide');
    lock(false);
    runTimer();
  });
  submit.addEventListener('click',()=>finish('done'));
  reset.addEventListener('click',resetAll);
  startAt=Number(load(':start','0'));
  const done=load(':done');
  if(startAt){
    overlay.classList.add('hide');
    if(done){grade();lock(true);timer.textContent=done==='timeout'?'00:00':'提出済'}
    else if(secondsLeft()<=0)finish('timeout');
    else{lock(false);runTimer()}
  }else{
    lock(false);
    submit.disabled=true;
  }
})();
