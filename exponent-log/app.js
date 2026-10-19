(()=>{'use strict';
const $=s=>document.querySelector(s),id=new URLSearchParams(location.search).get('id'),task=EXPLOG_DATA.find(x=>x.id===id);
if(!task){$('#title').textContent='クイズが見つかりません';$('#start-box').hidden=true;$('.actions').hidden=true;return}
const key='explog-attempt-v1:'+id;let state={answers:task.questions.map(()=>''),start:0,done:false},clock;
try{const v=JSON.parse(localStorage.getItem(key)||'null');if(v&&Array.isArray(v.answers)&&v.answers.length===task.questions.length&&typeof v.start==='number'&&typeof v.done==='boolean')state=v}catch(e){}
const save=()=>{try{localStorage.setItem(key,JSON.stringify(state))}catch(e){}};
$('#title').textContent=task.title;document.title=task.title+' | 指数・対数';$('#unit').textContent=task.group+' / '+id.slice(-2);$('#subtitle').textContent=task.questions.length+'問 · 5分 · 元PDF '+task.sourcePages.join('・')+'ページ';$('#tip').textContent=task.tip;
function graph(log){
 const px=x=>log?50+x*70:220+x*62,py=y=>log?175-y*55:255-y*43;
 function curve(fn,a,b){let p='';for(let x=a;x<=b;x+=.025){const y=fn(x);if(py(y)<20||py(y)>310)continue;p+=(p?' L':'M')+px(x).toFixed(1)+','+py(y).toFixed(1)}return p}
 const paths=log?[curve(x=>Math.log2(x),.16,5),curve(x=>-Math.log2(x),.16,5)]:[curve(x=>3**x,-3,1.9),curve(x=>3**(-x),-1.9,3)];
 return '<svg class="graph" viewBox="0 0 440 330" role="img" aria-label="'+(log?'底2と底1/2の対数関数':'底3と底1/3の指数関数')+'のグラフ"><path d="M25,'+py(0)+'H420 M'+px(0)+',315V15" stroke="#637c87" fill="none"/><text x="415" y="'+(py(0)-10)+'">x</text><text x="'+(px(0)+10)+'" y="20">y</text><text x="'+(px(0)-15)+'" y="'+(py(0)+18)+'">0</text><text x="'+px(1)+'" y="'+(py(0)+18)+'">1</text><text x="'+(px(0)-17)+'" y="'+py(1)+'">1</text>'+paths.map((p,i)=>'<path d="'+p+'" fill="none" stroke="'+(i?'#a84478':'#187cb3')+'" stroke-width="3"/>').join('')+'</svg>'}
if(id==='explog-04'||id==='explog-12')$('#graph').innerHTML=graph(id==='explog-12');
function render(){
 $('#questions').innerHTML=task.questions.map((q,i)=>'<section class="question" data-i="'+i+'"><span class="qnum">問 '+(i+1)+'</span><h2>'+q.prompt+'</h2>'+(q.type==='number'?'<label>答え <input type="text" autocomplete="off" spellcheck="false" aria-label="問'+(i+1)+'の答え" maxlength="60"></label>':'<div class="choices">'+q.options.map((v,j)=>'<button type="button" class="choice" data-value="'+j+'" aria-pressed="false">'+v+'</button>').join('')+'</div>')+'<div class="feedback" hidden></div></section>').join('');
 document.querySelectorAll('.question').forEach((card,i)=>{
  const input=card.querySelector('input');if(input){input.value=state.answers[i];input.oninput=()=>{if(!state.start||state.done)return;state.answers[i]=input.value;save();progress()}}
  card.querySelectorAll('.choice').forEach(b=>{b.setAttribute('aria-pressed',String(state.answers[i]===b.dataset.value));b.onclick=()=>{if(!state.start||state.done)return;state.answers[i]=b.dataset.value;card.querySelectorAll('.choice').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));save();progress()}});
 });lock();progress();
}
function lock(){document.querySelectorAll('#questions input,#questions button').forEach(x=>x.disabled=!state.start||state.done);$('#grade').disabled=!state.start||state.done;$('#start-box').hidden=!!state.start}
function progress(){$('#progress').textContent=state.answers.filter(x=>String(x).trim()!=='').length+' / '+task.questions.length+'問 回答'}
function result(){const flags=ExpLogEngine.grade(task,state.answers),score=flags.filter(Boolean).length;
 document.querySelectorAll('.question').forEach((card,i)=>{const q=task.questions[i],box=card.querySelector('.feedback');box.hidden=false;box.innerHTML='<b class="'+(flags[i]?'ok':'ng')+'">'+(flags[i]?'○ 正解':'× 不正解')+'</b><p>正答：'+(q.type==='number'?q.answer:q.options[Number(q.answer)])+'</p><p>'+q.explanation+'</p>';card.querySelectorAll('.choice').forEach(b=>{b.classList.toggle('correct',b.dataset.value===q.answer);b.classList.toggle('wrong',b.dataset.value===state.answers[i]&&!flags[i])})});
 $('#result').hidden=false;$('#result').innerHTML='<strong>'+score+' / '+task.questions.length+'</strong><p>'+(score===task.questions.length?'全問正解です！ 下の提出欄で送信状況を確認してください。':'解説を確認して、リセットからもう一度挑戦できます。')+'</p>';
 if(score===task.questions.length){try{localStorage.setItem('explog-practice:'+id,'perfect')}catch(e){}}
 window.QuizSubmission?.graded(id,score,task.questions.length,state.answers);
}
function finish(){if(!state.start||state.done)return;state.done=true;save();clearInterval(clock);lock();result();$('#result').scrollIntoView({behavior:'smooth',block:'center'})}
function tick(){const left=Math.max(0,task.seconds-Math.floor((Date.now()-state.start)/1000));$('#timer').textContent=String(Math.floor(left/60)).padStart(2,'0')+':'+String(left%60).padStart(2,'0');$('#timer').classList.toggle('danger',left<=30);if(!left)finish()}
$('#start').onclick=()=>{state.start=Date.now();save();lock();tick();clock=setInterval(tick,250);$('#questions input,#questions button')?.focus()};$('#grade').onclick=finish;
$('#reset').onclick=()=>{if(state.start&&!state.done&&!confirm('入力した回答を消して、最初からやり直しますか？'))return;clearInterval(clock);state={answers:task.questions.map(()=>''),start:0,done:false};save();$('#result').hidden=true;$('#timer').textContent='05:00';$('#timer').classList.remove('danger');render();scrollTo({top:0,behavior:'smooth'})};
render();if(state.done){$('#timer').textContent='採点済み';result()}else if(state.start){tick();if(!state.done)clock=setInterval(tick,250)}
})();
