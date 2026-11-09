'use strict';
(() => {
  const range = (a,b) => Array.from({length:b-a+1},(_,i)=>a+i);
  const allChapters = (...ns) => ns.flatMap(n=>range((n-1)*8+1,n*8));
  const COURSES = [
    {id:'kyuhi',label:'給費生',total:48,brief:'複素数・指数不等式から、微積分・領域の最小値へ。',papers:[
      {id:'K',label:'2026年度 給費生（2026K−4）',groups:[
        ['1','小問集合｜複素数・指数・図形・確率','複素数の分数計算、指数不等式、直方体内の三角形、二次方程式の実数解を条件にした確率。','分母の実数化・指数の置換・三平方と余弦定理・判別式を、それぞれ使えるようにする。',allChapters(1,2,3,4)],
        ['2','増減・接線・囲まれた面積','関数の増減を調べ、条件に合う接線と曲線で囲まれた部分の面積を求める。','導関数の符号から増減を判断し、接点を選び、交点と上下関係を確認して積分する。',allChapters(5)],
        ['3','不等式の領域と最小値','複数の不等式が表す領域で、文字を含む式の最小値を場合分けして求める。','境界の交点・頂点を求め、目的式の係数による場合分けまで処理する。',allChapters(6)]
      ]}
    ]},
    {id:'sogo',label:'総合型・適性検査',total:64,brief:'数と式・確率・数列を固め、座標と三角関数の大問へ。',papers:[
      {id:'G',label:'2026年度 総合型選抜・適性検査型（2026G−T）',groups:[
        ['1','小問集合｜根号・確率・対数・数列','整数部分と小数部分、玉を入れ替える操作の確率、常用対数と桁数、等差数列と絶対値の和。','根号の範囲・操作後の状態・桁数の条件・符号が変わる位置を、式にして処理する。',allChapters(1,2,3,4)],
        ['2','放物線・直線・外接円の座標','放物線と直線の交点や条件を求め、直角三角形の外接円と座標の関係を扱う。','点を通る条件で直線を決め、再交点・垂直条件・斜辺の中点から円までつなげる。',allChapters(5,6)],
        ['3','三角方程式と置換後の微積分','三角方程式の解の個数・和を求め、三角関数を多項式に置き換えて最小値と面積を扱う。','角の範囲を追って全解を数え、置換後の変数の範囲・増減・面積を正しく扱う。',allChapters(7,8)]
      ]}
    ]},
    {id:'ippan',label:'一般・全学部＋前期文系',total:64,brief:'共通の基本計算から、それぞれの試験の図形・微積分へ。',papers:[
      {id:'A',label:'2026年度 全学部（2026A−4）',groups:[
        ['1','小問集合｜根号・対数・実根・確率','根号を含む対称式、対数の計算、実根の個数、組合せや確率を扱う小問集合。','根号と絶対値・対数の条件・相加相乗平均・余事象を整理して使い分ける。',allChapters(1,2,3,4)],
        ['2','円に内接する四角形と面積','円に内接する四角形で、辺・角・外接円や面積の関係を扱う。','余弦定理・正弦定理・対角の和をつなぎ、長さと面積を求める。',allChapters(5)],
        ['3','放物線と直線｜根の差・距離・面積','放物線と直線の交点を使い、根の差・弦の長さ・囲まれる部分の面積を求める。','解と係数の関係から根の差を作り、座標の距離と定積分へつなげる。',allChapters(6)]
      ]},
      {id:'B',label:'2026年度 前期文系（2026B−4）',groups:[
        ['1','小問集合｜対数・根号・相加相乗・確率','対数方程式、根号を含む式、相加相乗平均を使う条件、さいころや組合せの確率。','真数条件・絶対値の符号・等号条件・場合の数を、一つずつ確実に処理する。',allChapters(1,2,3,4)],
        ['2','三角関数を二次関数にする','三角関数を置き換え、変数の範囲を調べて最大・最小や角度の条件を求める。','合成・置換・値域・平方完成をつなぎ、求めた値を元の角度に戻す。',allChapters(7)],
        ['3','2つの放物線の共通接線と面積','2つの放物線に共通する接線を求め、その直線と曲線で囲まれる部分の面積を求める。','接点パラメータと重解条件で共通接線を決め、境界が変わる位置で積分を分ける。',allChapters(8)]
      ]}
    ]}
  ];
  const app=document.getElementById('app'), notice=document.getElementById('notice');
  const cache=new Map(); let sequence=0;
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const key=c=>`entrance:kanagawa:${c.id}:v1`;
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
  function flattened(c){return c.papers.flatMap(p=>p.groups.map(g=>({id:`${p.id}-${g[0]}`,no:g[0],title:g[1],format:g[2],goal:g[3],ids:g[4],exam:p.label})));}
  function hub(){
    document.title='神奈川大学｜大問別ステップ演習';
    paint(`<section class="hero"><span class="eyebrow">UNIVERSITY ENTRANCE / MATHEMATICS</span><h1>神奈川大学</h1><p>入試方式を選んで、大問のゴールから演習へ。</p><div class="chips"><span>2026年度・4種類の試験</span><span>12の大問</span><span>全176問・解答付き</span></div></section><section class="panel"><h2>取り組む入試方式を選ぶ</h2><p>作成済みのステップ演習を、給費生・総合型・一般の3コースにまとめています。各コースでは、入試の出題形式を見て大問を選べます。</p></section><div class="course-grid">${COURSES.map(c=>`<a class="course-card" href="#${c.id}"><span class="step">神奈川大学｜2026年度</span><h2>${c.label}</h2><p>${c.brief}</p><p class="muted">${progress(readState(c),range(1,c.total))}</p><span class="go">${flattened(c).length}つの大問・演習${c.total}問を見る →</span></a>`).join('')}</div><section class="panel"><h2>進め方</h2><p>大問を選ぶと、その大問に必要な問題をすべて表示します。基礎→接続→到達→確認の順に解き、解答・途中式で確かめてください。</p><p class="muted">掲載内容は、以前作成した神奈川大学の3コースの演習です。問題番号は元の教材と共通です。大学公式の教材ではありません。</p></section>`);
  }
  function courseHome(c,data,s){
    const groups=flattened(c), t=stats(s,range(1,c.total));
    document.title=`神奈川大学 ${c.label}｜大問別ステップ演習`;
    paint(`<div class="coursebar"><h1>神奈川大学｜${c.label}</h1><a class="back-link" href="#">入試方式の一覧へ</a></div><section class="hero"><span class="eyebrow">KANAGAWA UNIVERSITY / MATHEMATICS</span><h1>${c.label}</h1><p>入試の大問を選んで、必要な演習をまとめて確認。</p><div class="chips"><span>${groups.length}つの大問</span><span>全${c.total}問</span><span>解答・途中式付き</span></div></section><section class="panel"><h2>取り組む大問を選ぶ</h2><p>出題形式と到達目標を見て選択すると、その大問に必要な演習を一括表示します。</p><div class="stats"><div><strong>${t.done}<small> / ${c.total}</small></strong><span>取り組み済み</span></div><div><strong>${t.ok}</strong><span>自力で解けた</span></div><div><strong>${t.review}</strong><span>復習が必要</span></div></div>${c.id==='ippan'?'<p class="muted">全学部と前期文系の大問1は、共通する32問を使います。同じ問題の記録は共有され、重複して数えません。</p>':''}${groups.some(g=>g.id===s.lastGroup)?`<a class="resume primary" href="#${c.id}/${s.lastGroup}">前回の大問を開く →</a>`:''}</section>${c.papers.map(p=>`<section class="exam-section"><h2>${p.label}</h2><p class="muted">出題形式は対象の原本の要約です。下の演習は、必要な計算・考え方を分解した学習用の問題です。</p><div class="exam-grid">${groups.filter(g=>g.exam===p.label).map(g=>`<a class="exam-card" href="#${c.id}/${g.id}"><span class="step">大問 ${g.no}</span><h3>${g.title}</h3><span class="format-label">入試での出題形式</span><p>${g.format}</p><div class="target"><strong>到達目標</strong><p>${g.goal}</p></div><p class="muted">${progress(s,g.ids)}</p><span class="go">演習 ${g.ids.length}問をまとめて見る →</span></a>`).join('')}</div></section>`).join('')}<section class="panel"><h2>教材について</h2><p class="muted">2026年度の対象資料に向けて作成した演習です。各問の「問○」は、元の教材の通し番号を指します。各コースの中で問題と解答を確認できます。</p><details><summary>全${c.total}問の印刷</summary><div class="actions"><button id="printq">問題を印刷</button><button id="printa">解答を印刷</button></div></details></section>`,data);
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
    document.title=`神奈川大学 ${c.label}｜大問${g.no} ${g.title}`;
    paint(`<div class="coursebar"><h1>神奈川大学｜${c.label}<br><span class="muted">${g.exam}｜大問 ${g.no}</span></h1><a class="back-link" href="#${c.id}">大問一覧へ</a></div><section class="panel goal-panel"><span class="step">この大問のゴール</span><h2>${g.title}</h2><strong>入試での出題形式（要約）</strong><p>${g.format}</p><div class="target"><strong>到達目標</strong><p>${g.goal}</p></div></section><section class="panel"><h2>この大問に向けた演習：全${g.ids.length}問</h2><p id="group-progress" role="status">${progress(s,g.ids)}</p><p class="muted">下に全問を表示しています。紙やノートに解き、各問の解答を開いて確認してください。</p><ol class="outline">${chapters.map(ch=>`<li>${esc(ch.title)}（${g.ids.filter(n=>data.questions[n-1].chapter===ch.number).length}問）</li>`).join('')}</ol><div class="actions"><button id="open-all">解答をすべて開く</button><button id="close-all">解答をすべて閉じる</button><button id="print-current">この演習を印刷</button></div><p class="muted small">「問○」は、このコース全体の通し番号です。元の教材と共通のため、前の問題を使う問いも番号から確認できます。</p></section>${chapters.map(ch=>`<section class="exercise-section"><h2>${ch.number}　${esc(ch.title)}</h2>${ch.intro?`<div class="source-body chapter-intro">${ch.intro}</div>`:''}${g.ids.filter(n=>data.questions[n-1].chapter===ch.number).map(n=>questionCard(data.questions[n-1],s)).join('')}</section>`).join('')}<section class="panel"><h2>演習を終えたら、入試の大問へ</h2><p>一通り解いたら、お手元の「${g.exam}」大問 ${g.no}に挑戦してください。翌日、到達・確認の問いを解答なしで解き直すと、定着を確かめられます。</p><a href="#${c.id}">大問一覧に戻る →</a></section>`,data);
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
    paint(`<div class="no-print"><h1>印刷用 ${answer?'解答・途中式':'問題'}</h1><p>表示を確認してから印刷してください。</p><div class="actions"><button class="primary" id="print-now">印刷する</button><button id="back">${g?'演習に戻る':'大問一覧に戻る'}</button></div></div><h1 class="print-only archive-print-title">神奈川大学｜${c.label} ${answer?'解答':'演習'}</h1>${g?`<p>${g.exam} 大問${g.no}｜${g.title}</p>`:''}${chapters.map((ch,i)=>`<section class="${i?'print-section':''}"><h2>${ch.number}　${esc(ch.title)}</h2>${!answer&&ch.intro?`<div class="source-body chapter-intro">${ch.intro}</div>`:''}${ids.filter(n=>data.questions[n-1].chapter===ch.number).map(n=>{const q=data.questions[n-1];return `<div class="print-item"><h3>問${n}　${q.level}</h3><div class="source-body">${answer?q.solution:q.question}</div>${answer?'':'<div class="space"></div>'}</div>`;}).join('')}</section>`).join('')}`,data);
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
    const [courseId,groupId]=location.hash.slice(1).split('/');
    const c=COURSES.find(x=>x.id===courseId);
    if(!c){hub();return;}
    paint('<section class="panel"><p>問題・解答を読み込んでいます。</p></section>');
    try{
      if(!cache.has(c.id))cache.set(c.id,fetch(`data/kanagawa-${c.id}.json?v=1`).then(r=>{if(!r.ok)throw new Error('data');return r.json();}));
      const data=await cache.get(c.id);
      if(current!==sequence)return;
      const s=readState(c),g=flattened(c).find(x=>x.id===groupId);
      if(g)groupView(c,data,s,g);else courseHome(c,data,s);
    }catch{
      cache.delete(c.id);
      if(current!==sequence)return;
      paint('<section class="panel"><h1>教材を読み込めませんでした</h1><p>通信状況を確認して、もう一度読み込んでください。</p><div class="actions"><button id="retry">もう一度読み込む</button><a href="#">入試方式の一覧へ</a></div></section>');
      document.getElementById('retry').onclick=route;
    }
  }
  window.addEventListener('hashchange',route);
  route();
})();
