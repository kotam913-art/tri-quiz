'use strict';
(function(global){
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const refPattern=()=>/(?<!大)問\s*(\d+)((?:[・、〜～~-]\s*\d+)*)/g;
  function references(text){return [...String(text).matchAll(refPattern())].flatMap(m=>(m[1]+m[2]).match(/\d+/g).map(Number));}
  function cleanIntro(html){return String(html||'').replace(/<p\b[^>]*>[\s\S]*?<\/p>/g,p=>/^(原本|接続先|全学|理工)/.test(p.replace(/<[^>]*>/g,'').trim())?'':p);}
  function rewrite(text,map){return String(text||'').replace(/この章/g,'このステップ').replace(refPattern(),(whole,first,tail)=>'演習'+(first+tail).replace(/\d+/g,n=>{const local=map.get(Number(n));if(!local)throw new Error('この大問に含まれない参照：'+whole);return local;}));}
  function compile(data,g){
    const byId=new Map(data.questions.map(q=>[Number(q.id),q]));
    const sections=g.sections||g.ids.reduce((out,id)=>{const q=byId.get(id);if(!q)throw new Error('Missing exercise '+id);let section=out.find(x=>x.chapter===q.chapter);if(!section){section={chapter:q.chapter,ids:[]};out.push(section);}section.ids.push(id);return out;},[]);
    const ids=sections.flatMap(s=>s.ids);
    if(!ids.length||new Set(ids).size!==ids.length)throw new Error('演習の重複または空の大問');
    const local=new Map(ids.map((id,i)=>[id,i+1]));
    function numberMap(q){return data.references==='chapter'?new Map(ids.map(id=>byId.get(id)).filter(x=>x.chapter===q.chapter).map(x=>[x.position,local.get(Number(x.id))])):local;}
    const result=sections.map((s,si)=>{
      const ch=data.chapters.find(x=>x.number===(s.chapter??byId.get(s.ids[0]).chapter));
      const questions=s.ids.map(id=>{const q=byId.get(id);const map=numberMap(q);return {...q,local:local.get(id),question:rewrite(q.question,map),solution:rewrite(q.solution,map)};});
      const intro=cleanIntro(s.intro??ch?.intro??'');
      return {title:s.title??ch?.title??'演習',intro:rewrite(intro,data.references==='chapter'?numberMap(byId.get(s.ids[0])):local),questions,step:si+1};
    });
    return {...g,ids,sections:result,questions:result.flatMap(s=>s.questions)};
  }
  function stats(state,ids){return {done:ids.filter(id=>state.ratings[id]).length,ok:ids.filter(id=>state.ratings[id]==='ok').length,review:ids.filter(id=>state.ratings[id]==='review').length};}
  function storeFor(storage,scope,legacyKey,offset=0){
    const prefix='entrance:isolated:v2:'+scope;
    const parse=k=>{try{return JSON.parse(storage.getItem(k));}catch{return null;}};
    return {
      read(pack){
        const state={version:2,ratings:{},notes:{}};
        const raw=parse(prefix+':'+pack.id);
        const legacy=parse(legacyKey);
        // The old shared record can only be attributed to the last selected large question.
        const source=raw?.version===2?raw:legacy?.version===1&&legacy.lastGroup===pack.id?legacy:null;
        for(const id of pack.ids){const oldId=raw?.version===2?id:Number(id)+offset;if(['ok','review'].includes(source?.ratings?.[oldId]))state.ratings[id]=source.ratings[oldId];if(typeof source?.notes?.[oldId]==='string')state.notes[id]=source.notes[oldId].slice(0,6000);}
        return state;
      },
      save(pack,state){storage.setItem(prefix+':'+pack.id,JSON.stringify(state));storage.setItem(prefix+':last',JSON.stringify(pack.id));},
      last(){return parse(prefix+':last')??parse(legacyKey)?.lastGroup??null;}
    };
  }
  const Core={compile,references,cleanIntro,rewrite,stats,storeFor};
  if(typeof module!=='undefined'&&module.exports){module.exports=Core;return;}
  global.GroupPractice={...Core,mount};
  function mount(config){
    const app=document.getElementById('app'),notice=document.getElementById('notice');
    const loads=new Map();let sequence=0,mathQueue=Promise.resolve();
    const courseLink=c=>config.hub?'#'+c.id:'#';
    const groupLink=(c,g)=>'#'+(config.hub?c.id+'/':'')+g.id;
    function sourceGroups(c){return c.papers.flatMap(p=>p.groups.map(g=>({id:p.id+'-'+g[0],no:g[0],title:g[1],format:g[2],goal:g[3],ids:g[4],exam:p.label,url:p.url,sections:g[5]})));}
    function record(c){return storeFor(localStorage,config.id+':'+c.id,c.legacyKey,c.legacyOffset||0);}
    function read(c,p){try{return record(c).read(p);}catch{return {version:2,ratings:{},notes:{}};}}
    function save(c,p,s){try{record(c).save(p,s);}catch{notice.textContent='このブラウザに記録を保存できません。今回の記録はページを閉じると失われる可能性があります。';}}
    function progress(s,ids){const t=stats(s,ids);return `取り組み済み ${t.done}/${ids.length}問　自力 ${t.ok}問　復習 ${t.review}問`;}
    function typeset(){
      if(!config.math)return;
      mathQueue=mathQueue.then(async()=>{if(global.MathJax?.startup?.promise){await global.MathJax.startup.promise;await global.MathJax.typesetPromise?.([app]);}}).catch(()=>{notice.textContent='数式の表示に失敗しました。再読み込みしてください。';});
    }
    const mathScript=document.getElementById('mathjax');
    if(mathScript){mathScript.addEventListener('load',typeset);mathScript.addEventListener('error',()=>{notice.textContent='数式を読み込めませんでした。通信状況を確認して再読み込みしてください。';});}
    function paint(html,data){
      global.MathJax?.typesetClear?.([app]);app.innerHTML=html;
      if(data)app.querySelectorAll('[data-formula]').forEach(img=>{img.src=data.assets[img.dataset.formula];});
      typeset();window.scrollTo(0,0);
    }
    const content=(text,kind)=>kind==='math'?`<div class="math question">${esc(text).replace(/&lt;br&gt;/g,'<br>')}</div>`:text;
    function hub(){
      document.title=config.university+'｜大問別演習';
      paint(`<section class="hero"><span class="eyebrow">UNIVERSITY ENTRANCE / MATHEMATICS</span><h1>${esc(config.university)}</h1><p>入試方式を選び、取り組みたい大問へ。</p><div class="chips"><span>3つの入試方式</span><span>大問ごとに完結する演習</span></div></section><section class="panel"><h2>入試方式を選ぶ</h2><p>各大問の問題・解答・学習記録は、その大問の中で完結します。</p></section><div class="course-grid">${config.courses.map(c=>`<a class="course-card" href="#${c.id}"><span class="step">${esc(config.university)}</span><h2>${esc(c.label)}</h2><p>${esc(c.brief||'')}</p><span class="go">${sourceGroups(c).length}つの大問から選ぶ →</span></a>`).join('')}</div>`);
    }
    function home(c,data,packs){
      document.title=config.university+'｜大問別演習';
      let last;try{last=record(c).last();}catch{}
      paint(`${config.hub?`<div class="coursebar"><h1>${esc(config.university)}｜${esc(c.label)}</h1><a href="#" class="back-link">入試方式の一覧へ</a></div>`:''}<section class="hero"><span class="eyebrow">UNIVERSITY ENTRANCE / MATHEMATICS</span><h1>${esc(config.university)}</h1><p>${esc(c.label)}<br>出題形式を見て、大問を選んでください。</p><div class="chips"><span>${packs.length}大問</span><span>大問内で完結</span><span>問題・解答を一括表示</span></div></section><section class="panel"><h2>取り組む大問を選ぶ</h2><p>選んだ大問に関係する演習だけを、その大問の順番で表示します。</p><p class="muted">演習番号・進捗・メモは大問ごとに独立しています。他の大問を解いた記録は反映しません。</p>${packs.some(p=>p.id===last)?`<a class="resume primary" href="${groupLink(c,packs.find(p=>p.id===last))}">前回取り組んだ大問を開く →</a>`:''}</section>${c.papers.map(p=>`<section class="exam-section"><h2>${esc(p.label)}</h2><div class="exam-grid">${packs.filter(g=>g.exam===p.label).map(g=>`<a class="exam-card" href="${groupLink(c,g)}"><span class="step">大問 ${esc(g.no)}</span><h3>${esc(g.title)}</h3><span class="format-label">入試での出題形式</span><p>${esc(g.format)}</p><div class="target"><strong>到達目標</strong><p>${esc(g.goal)}</p></div><p class="muted">${progress(read(c,g),g.ids)}</p><span class="go">この大問の演習 ${g.ids.length}問を見る →</span></a>`).join('')}</div></section>`).join('')}<section class="panel"><h2>教材について</h2><p>${esc(config.about)}</p><p class="muted">元のステップ演習から大問に必要な問題を選び、その大問の中で完結する順番と番号に整理しています。大学公式の教材ではありません。</p></section>`,data);
    }
    function card(q,s){
      const rating=s.ratings[q.id];
      return `<article class="exercise question-card" id="exercise-${q.local}" data-local="${q.local}" data-source="${q.id}"><div class="question-heading"><h3>演習${q.local}　<span class="step">${esc(q.level)}</span></h3><span class="status-pill" data-status="${q.id}">${rating==='ok'?'自力で解けた':rating==='review'?'復習が必要':'未記録'}</span></div><div class="source-body">${content(q.question,q.kind)}</div><details class="answer-details"><summary>この問題の答え・途中式</summary><div class="source-body source-solution">${content(q.solution,q.kind)}</div><div class="rating"><button data-rate="ok" data-q="${q.id}" aria-pressed="${rating==='ok'}" class="${rating==='ok'?'selected':''}">自力で解けた</button><button data-rate="review" data-q="${q.id}" aria-pressed="${rating==='review'}" class="${rating==='review'?'selected':''}">復習が必要</button></div></details><details><summary>この問題のメモ${s.notes[q.id]?'（記録あり）':''}</summary><label for="memo-${q.local}">演習${q.local}のメモ（この大問内に保存）</label><textarea id="memo-${q.local}" data-note="${q.id}" maxlength="6000">${esc(s.notes[q.id]||'')}</textarea></details></article>`;
    }
    function group(c,data,p){
      const s=read(c,p);save(c,p,s);
      document.title=`${config.university}｜${p.exam} 大問${p.no}`;
      paint(`<div class="coursebar"><h1>${esc(config.university)}<br><span class="muted">${esc(p.exam)}｜大問 ${esc(p.no)}</span></h1><a class="back-link" href="${courseLink(c)}">大問一覧へ</a></div><section class="panel goal-panel"><span class="step">選んだ大問：${esc(p.no)}</span><h2>${esc(p.title)}</h2><strong>入試での出題形式（要約）</strong><p>${esc(p.format)}</p><div class="target"><strong>到達目標</strong><p>${esc(p.goal)}</p></div></section><section class="panel"><h2>この大問の演習：全${p.ids.length}問</h2><p id="group-progress" role="status">${progress(s,p.ids)}</p><p>下に、この大問の問題をすべて表示しています。演習1から最後まで、このページ内で取り組めます。</p><ol class="outline">${p.sections.map(b=>`<li>${esc(b.title)}（${b.questions.length}問）</li>`).join('')}</ol><div class="actions"><button id="open-all">この大問の解答をすべて開く</button><button id="close-all">解答をすべて閉じる</button><button id="print-current">この大問を印刷</button><button id="print-answers">この大問の解答を印刷</button></div><p class="muted small">文中の「演習○」は、このページ内の番号です。進捗とメモも、この大問だけに保存されます。</p></section>${p.sections.map(b=>`<section class="exercise-section"><h2>ステップ${b.step}｜${esc(b.title)}</h2>${b.intro?`<div class="source-body chapter-intro">${b.intro}</div>`:''}${b.questions.map(q=>card(q,s)).join('')}</section>`).join('')}<section class="panel"><h2>この大問の仕上げ</h2><p>解答を閉じて解き直したら、${esc(p.exam)}の大問 ${esc(p.no)}に挑戦してください。</p><div class="actions"><a href="${courseLink(c)}">大問一覧に戻る</a></div></section>`,data);
      app.querySelectorAll('[data-rate]').forEach(b=>b.onclick=()=>{const id=b.dataset.q,v=b.dataset.rate;s.ratings[id]=v;save(c,p,s);app.querySelector(`[data-status="${id}"]`).textContent=v==='ok'?'自力で解けた':'復習が必要';app.querySelectorAll(`[data-q="${id}"]`).forEach(x=>{x.classList.toggle('selected',x.dataset.rate===v);x.setAttribute('aria-pressed',String(x.dataset.rate===v));});document.getElementById('group-progress').textContent=progress(s,p.ids);});
      app.querySelectorAll('[data-note]').forEach(el=>el.oninput=()=>{s.notes[el.dataset.note]=el.value;save(c,p,s);});
      document.getElementById('open-all').onclick=()=>app.querySelectorAll('.answer-details').forEach(d=>d.open=true);
      document.getElementById('close-all').onclick=()=>app.querySelectorAll('.answer-details').forEach(d=>d.open=false);
      document.getElementById('print-current').onclick=()=>printPack(c,data,p,false);
      document.getElementById('print-answers').onclick=()=>printPack(c,data,p,true);
    }
    function printPack(c,data,p,answers){
      paint(`<div class="no-print"><h1>この大問の${answers?'解答':'問題'}を印刷</h1><p>${esc(p.exam)}｜大問 ${esc(p.no)}</p><div class="actions"><button id="print-now">印刷する</button><button id="back">この大問の演習に戻る</button></div></div><h1 class="print-only">${esc(config.university)}｜${esc(p.exam)} 大問${esc(p.no)}</h1>${p.sections.map((b,i)=>`<section class="${i?'print-section':''}"><h2>${esc(b.title)}</h2>${!answers&&b.intro?`<div class="source-body chapter-intro">${b.intro}</div>`:''}${b.questions.map(q=>`<div class="print-item"><h3>演習${q.local}</h3><div class="source-body">${content(answers?q.solution:q.question,q.kind)}</div>${answers?'':'<div class="space"></div>'}</div>`).join('')}</section>`).join('')}`,data);
      document.getElementById('back').onclick=()=>group(c,data,p);
      document.getElementById('print-now').onclick=async()=>{await mathQueue;const imgs=[...app.querySelectorAll('img')];await Promise.all(imgs.map(img=>img.decode().catch(()=>{})));if(imgs.some(img=>!img.naturalWidth)){notice.textContent='数式を読み込めませんでした。戻って再読み込みしてください。';return;}window.print();};
    }
    async function route(){
      const current=++sequence;
      const parts=location.hash.slice(1).split('/');
      const c=config.hub?config.courses.find(c=>c.id===parts[0]):config.courses[0];
      const groupId=config.hub?parts[1]:parts[0];
      if(!c){hub();return;}
      paint('<section class="panel"><p>この教材を読み込んでいます。</p></section>');
      try{
        if(!loads.has(c.id))loads.set(c.id,Promise.resolve(config.load(c)));
        const data=await loads.get(c.id);if(sequence!==current)return;
        const packs=sourceGroups(c).map(g=>compile(data,g));
        const selected=packs.find(p=>p.id===groupId);
        if(selected)group(c,data,selected);else home(c,data,packs);
      }catch(error){loads.delete(c.id);if(sequence!==current)return;console.error(error);paint('<section class="panel"><h1>教材を読み込めませんでした</h1><p>再読み込みして、もう一度お試しください。</p><button id="retry">もう一度読み込む</button></section>');document.getElementById('retry').onclick=route;}
    }
    window.addEventListener('hashchange',route);route();
  }
})(globalThis);
