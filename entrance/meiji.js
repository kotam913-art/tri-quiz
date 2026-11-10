'use strict';
(() => {
  const range = (a,b) => Array.from({length:b-a+1},(_,i)=>a+i);
  const allChapters = (...ns) => ns.flatMap(n=>range((n-1)*8+1,n*8));
  const R = (ch,a=1,b=8) => range((ch-1)*8+a,(ch-1)*8+b);
  const COURSES=[{id:'meiji',label:'全学部統一・理工学部',total:108,papers:[
    {id:'all',label:'2025年度 全学部統一（数学Ⅰ・Ⅱ・A・B・C）',url:'https://sukyojuku.com/wp-content/uploads/2026/01/Meiji_2025_mat_Q_01.pdf',groups:[
      ['I','小問集合｜対数・数列・接線・三角比','対数の条件を満たす整数の組、隣接項の比を使う数列、曲線外の点を通る接線、三角置換で求める最小値。','計算を整え、対数の条件・数列の変形・接線の通過条件・角の範囲をそれぞれ式にする。',[...R(1),...R(4),...R(5),...R(7),...range(97,100)]],
      ['II','3つの放物線｜頂点・共有点・面積','文字を含む放物線の頂点と平行移動、曲線どうしの共有点、2種類の面積が等しくなる条件を扱う。','平方完成と因数分解で位置関係を決め、上下関係を確認して面積を求め、文字の条件を解く。',[...R(1),...R(2),...R(8),101]],
      ['III','円・直交・三角形の内心','円上の点と直交条件から座標を決め、三角比・辺の比・内接円の半径・内心の位置ベクトルまで求める。','距離・内積・円の式をつなぎ、図形の条件を座標と内分の式に直す。',[...R(1),...R(6),102]]
    ]},
    {id:'sci',label:'2025年度 理工学部',url:'https://sukyojuku.com/wp-content/uploads/2026/01/Meiji_2025_mat_Q_03.pdf',groups:[
      ['I','小問集合｜複素数・積分・整式・確率','複素数の累乗と三角比、部分積分・置換積分、整式の余りと共通解、二次関数の条件を使う確率。','極形式・積分方法の選択・余りの係数比較・判別式を使い分け、条件を作ってから計算や数え上げに進む。',[...R(1),...R(2,1,6),...R(3),...R(4,1,2),...R(5,1,2),...R(9),...R(10),...range(103,106)]],
      ['II','三角形に接する円と半径の値域','角の二等分線を使って円の中心を表し、辺や半径を三角比で表して、接点の位置から定義域と値域を求める。','内分・余弦定理・接線と半径の直交をつなぎ、端点を含むか確認しながら平方完成で半径の範囲を決める。',[...R(2,1,4),...R(2,7,8),...R(5),...R(6),...R(11),107]],
      ['III','数Ⅲの微分｜極値・変曲点・距離・接線','分数を含む関数の極値と変曲点、点と直線の距離の最小値、原点を通る接線を求める。','定義域を分け、因数分解と符号表で増減・凹凸を判断し、距離や通過条件を関数の式へ直す。',[...R(1,1,5),...R(7),...R(12),108]]
    ]}
  ]}];
  const app=document.getElementById('app'), notice=document.getElementById('notice');
  const cache=new Map(); let sequence=0;
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const key=c=>'entrance:meiji:2025-v1';
  function readState(c){
    const state={version:1,lastGroup:null,ratings:{},notes:{}};
    try{
      const raw=JSON.parse(localStorage.getItem(key(c)));
      if(raw?.version===1){
        for(let i=1;i<=c.total;i++){
          if(['ok','review'].includes(raw.ratings?.[i]))state.ratings[i]=raw.ratings[i];
          if(typeof raw.notes?.[i]==='string')state.notes[i]=raw.notes[i].slice(0,6000);
        }
        if(typeof raw.lastGroup==='string')state.lastGroup=raw.lastGroup;
      }
    }catch{notice.textContent='記録を読み込めませんでした。保存が制限されていないか確認してください。';}
    return state;
  }
  function save(c,s){try{localStorage.setItem(key(c),JSON.stringify(s));}catch{notice.textContent='記録を保存できません。このページを閉じると今回の記録が失われる可能性があります。';}}
  function stats(s,ids){return {done:ids.filter(i=>s.ratings[i]).length,ok:ids.filter(i=>s.ratings[i]==='ok').length,review:ids.filter(i=>s.ratings[i]==='review').length};}
  function progress(s,ids){const t=stats(s,ids);return `取り組み済み ${t.done}/${ids.length}問　自力 ${t.ok}問　復習 ${t.review}問`;}
  function paint(content,data){
    app.innerHTML=content;
    if(data)app.querySelectorAll('[data-formula]').forEach(img=>{img.src=data.assets[img.dataset.formula];});
    window.scrollTo(0,0);
  }
  function flattened(c){return c.papers.flatMap(p=>p.groups.map(g=>({id:`${p.id}-${g[0]}`,no:g[0],title:g[1],format:g[2],goal:g[3],ids:g[4],exam:p.label,url:p.url})));}
  function courseHome(c,data,s){
    const groups=flattened(c), t=stats(s,range(1,c.total));
    document.title=`明治大学｜大問別ステップ演習`;
    paint(`<section class="hero"><span class="eyebrow">MEIJI UNIVERSITY / MATHEMATICS</span><h1>明治大学</h1><p>2025年度｜全学部統一・理工学部<br>入試の大問を選んで、必要な演習をまとめて確認。</p><div class="chips"><span>${groups.length}つの大問</span><span>全${c.total}問</span><span>解答・途中式付き</span></div></section><section class="panel"><h2>取り組む大問を選ぶ</h2><p>出題形式と到達目標を見て選択すると、その大問に必要な演習を一括表示します。</p><div class="stats"><div><strong>${t.done}<small> / ${c.total}</small></strong><span>取り組み済み</span></div><div><strong>${t.ok}</strong><span>自力で解けた</span></div><div><strong>${t.review}</strong><span>復習が必要</span></div></div><p class="muted">共通する演習は複数の大問に登場します。同じ問題番号の記録・メモは共有され、重複して数えません。確認演習12題も、対応する大問に組み込んでいます。</p>${groups.some(g=>g.id===s.lastGroup)?`<a class="resume primary" href="#${s.lastGroup}">前回の大問を開く →</a>`:''}</section>${c.papers.map(p=>`<section class="exam-section"><h2>${p.label}</h2><p class="muted">出題形式は対象の原本の要約です。下の演習は、必要な計算・考え方を分解した学習用の問題です。</p><div class="exam-grid">${groups.filter(g=>g.exam===p.label).map(g=>`<a class="exam-card" href="#${g.id}"><span class="step">大問 ${g.no}</span><h3>${g.title}</h3><span class="format-label">入試での出題形式</span><p>${g.format}</p><div class="target"><strong>到達目標</strong><p>${g.goal}</p></div><p class="muted">${progress(s,g.ids)}</p><span class="go">演習 ${g.ids.length}問をまとめて見る →</span></a>`).join('')}</div></section>`).join('')}<section class="panel"><h2>教材について</h2><p class="muted">2025年度の全学部統一・理工学部の2冊に向けて作成した108題です。全学部統一の別冊「数学Ⅲ」は含みません。各問の「問○」は、元の教材の通し番号を指します。各大問の中で問題と解答を確認できます。</p><details><summary>全${c.total}問の印刷</summary><div class="actions"><button id="printq">問題を印刷</button><button id="printa">解答を印刷</button></div></details></section>`,data);
    document.getElementById('printq').onclick=()=>printView(c,data,s,false);
    document.getElementById('printa').onclick=()=>printView(c,data,s,true);
  }
  function questionCard(q,s){
    const r=s.ratings[q.number];
    return `<article class="exercise question-card" id="q${q.number}"><div class="question-heading"><h3>問${q.number}　<span class="step">${q.level}</span></h3><span class="status-pill" data-status="${q.number}">${r==='ok'?'自力で解けた':r==='review'?'復習が必要':'未記録'}</span></div><div class="source-body">${q.question}</div><details class="answer-details"><summary>答え・途中式を確認する</summary><div class="source-body source-solution">${q.solution}</div><div class="rating"><button data-rate="ok" data-q="${q.number}" aria-pressed="${r==='ok'}" class="${r==='ok'?'selected':''}">自力で解けた</button><button data-rate="review" data-q="${q.number}" aria-pressed="${r==='review'}" class="${r==='review'?'selected':''}">復習が必要</button></div><p class="muted small">解説を見て分かった場合は「復習が必要」に。記録は後から変更できます。</p></details><details><summary>自分のメモ${s.notes[q.number]?'（記録あり）':''}</summary><label for="memo-${q.number}">問${q.number}のメモ（自動保存）</label><textarea id="memo-${q.number}" data-note="${q.number}" maxlength="6000" placeholder="詰まった計算・次に気を付けたいこと">${esc(s.notes[q.number]||'')}</textarea></details></article>`;
  }
  function groupView(c,data,s,g){
    s.lastGroup=g.id;save(c,s);
    const chapters=data.chapters.filter(ch=>g.ids.some(n=>data.questions[n-1].chapter===ch.number));
    document.title=`明治大学 ${c.label}｜大問${g.no} ${g.title}`;
    paint(`<div class="coursebar"><h1>明治大学｜${c.label}<br><span class="muted">${g.exam}｜大問 ${g.no}</span></h1><a class="back-link" href="#">大問一覧へ</a></div><section class="panel goal-panel"><span class="step">この大問のゴール</span><h2>${g.title}</h2><strong>入試での出題形式（要約）</strong><p>${g.format}</p><div class="target"><strong>到達目標</strong><p>${g.goal}</p></div><a href="${g.url}" target="_blank" rel="noopener">対象の過去問PDFで大問 ${g.no}を確認 ↗</a></section><section class="panel"><h2>この大問に向けた演習：全${g.ids.length}問</h2><p id="group-progress" role="status">${progress(s,g.ids)}</p><p class="muted">下に全問を表示しています。紙やノートに解き、各問の解答を開いて確認してください。</p><ol class="outline">${chapters.map(ch=>`<li>${esc(ch.title)}（${g.ids.filter(n=>data.questions[n-1].chapter===ch.number).length}問）</li>`).join('')}</ol><div class="actions"><button id="open-all">解答をすべて開く</button><button id="close-all">解答をすべて閉じる</button><button id="print-current">この演習を印刷</button></div><p class="muted small">「問○」は、教材全体の通し番号です。元の教材と共通のため、前の問題を使う問いも番号から確認できます。</p></section>${chapters.map(ch=>`<section class="exercise-section"><h2>${ch.number}　${esc(ch.title)}</h2>${ch.intro?`<div class="source-body chapter-intro">${ch.intro}</div>`:''}${g.ids.filter(n=>data.questions[n-1].chapter===ch.number).map(n=>questionCard(data.questions[n-1],s)).join('')}</section>`).join('')}<section class="panel"><h2>演習を終えたら、入試の大問へ</h2><p>一通り解いたら、「${g.exam}」大問 ${g.no}に挑戦してください。翌日、到達・確認の問いを解答なしで解き直すと、定着を確かめられます。</p><div class="actions"><a href="${g.url}" target="_blank" rel="noopener">対象の過去問PDFを開く ↗</a><a href="#">大問一覧に戻る →</a></div></section>`,data);
    app.querySelectorAll('[data-rate]').forEach(b=>b.onclick=()=>{
      const n=Number(b.dataset.q),v=b.dataset.rate;s.ratings[n]=v;save(c,s);
      app.querySelector(`[data-status="${n}"]`).textContent=v==='ok'?'自力で解けた':'復習が必要';
      app.querySelectorAll(`[data-q="${n}"]`).forEach(x=>{x.classList.toggle('selected',x.dataset.rate===v);x.setAttribute('aria-pressed',String(x.dataset.rate===v));});
      document.getElementById('group-progress').textContent=progress(s,g.ids);
    });
    app.querySelectorAll('[data-note]').forEach(el=>el.oninput=()=>{s.notes[Number(el.dataset.note)]=el.value;save(c,s);});
    document.getElementById('open-all').onclick=()=>app.querySelectorAll('.answer-details').forEach(d=>d.open=true);
    document.getElementById('close-all').onclick=()=>app.querySelectorAll('.answer-details').forEach(d=>d.open=false);
    document.getElementById('print-current').onclick=()=>printView(c,data,s,false,g);
  }
  function printView(c,data,s,answer,g=null){
    const ids=g?g.ids:range(1,c.total);
    const chapters=data.chapters.filter(ch=>ids.some(n=>data.questions[n-1].chapter===ch.number));
    paint(`<div class="no-print"><h1>印刷用 ${answer?'解答・途中式':'問題'}</h1><p>表示を確認してから印刷してください。</p><div class="actions"><button class="primary" id="print-now">印刷する</button><button id="back">${g?'演習に戻る':'大問一覧に戻る'}</button></div></div><h1 class="print-only archive-print-title">明治大学｜${c.label} ${answer?'解答':'演習'}</h1>${g?`<p>${g.exam} 大問${g.no}｜${g.title}</p>`:''}${chapters.map((ch,i)=>`<section class="${i?'print-section':''}"><h2>${ch.number}　${esc(ch.title)}</h2>${!answer&&ch.intro?`<div class="source-body chapter-intro">${ch.intro}</div>`:''}${ids.filter(n=>data.questions[n-1].chapter===ch.number).map(n=>{const q=data.questions[n-1];return `<div class="print-item"><h3>問${n}　${q.level}</h3><div class="source-body">${answer?q.solution:q.question}</div>${answer?'':'<div class="space"></div>'}</div>`;}).join('')}</section>`).join('')}`,data);
    document.getElementById('back').onclick=()=>g?groupView(c,data,s,g):courseHome(c,data,s);
    document.getElementById('print-now').onclick=async()=>{
      const imgs=[...app.querySelectorAll('img')];
      await Promise.all(imgs.map(img=>img.decode().catch(()=>{})));
      if(imgs.some(img=>!img.naturalWidth)){notice.textContent='一部の数式を読み込めませんでした。戻って再読み込みしてください。';return;}
      window.print();
    };
  }
  async function route(){
    const current=++sequence;
    const groupId=location.hash.slice(1);
    const c=COURSES[0];
    paint('<section class="panel"><p>問題・解答を読み込んでいます。</p></section>');
    try{
      if(!cache.has(c.id))cache.set(c.id,Promise.all([1,2,3].map(i=>fetch(`data/meiji-${i}.json?v=1`).then(r=>{if(!r.ok)throw new Error('data');return r.json();}))).then(parts=>({id:'meiji',total:108,questions:parts.flatMap(p=>p.questions).sort((a,b)=>a.number-b.number),chapters:[...new Map(parts.flatMap(p=>p.chapters).map(ch=>[ch.number,ch])).values()].sort((a,b)=>a.number-b.number),assets:Object.assign({},...parts.map(p=>p.assets))})));
      const data=await cache.get(c.id);
      if(current!==sequence)return;
      const s=readState(c),g=flattened(c).find(x=>x.id===groupId);
      if(g)groupView(c,data,s,g);else courseHome(c,data,s);
    }catch{
      cache.delete(c.id);
      if(current!==sequence)return;
      paint('<section class="panel"><h1>教材を読み込めませんでした</h1><p>通信状況を確認して、もう一度読み込んでください。</p><div class="actions"><button id="retry">もう一度読み込む</button><a href="#">大問一覧へ</a></div></section>');
      document.getElementById('retry').onclick=route;
    }
  }
  window.addEventListener('hashchange',route);
  route();
})();
