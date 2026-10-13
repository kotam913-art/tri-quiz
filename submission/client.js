(() => {
  'use strict';
  let latest=null, panel, status, form, busy=false, bridge=null, bridgeOrigin='', frame=null, timer;
  const channel=crypto.randomUUID();
  const cfg=window.QUIZ_SUBMISSION_CONFIG||{};
  const validEndpoint=/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(cfg.endpoint||'');
  const titles={basic:'三角比 基本',angle:'角度・単位円',trig:'三角関数 思考ステップ',radian:'弧度法・2つの角'};
  function mount(){
    if(panel)return;
    panel=document.createElement('section');
    panel.style.cssText='margin:16px auto;padding:18px;max-width:1000px;background:#eef5ff;border:2px solid #b6cdf0;border-radius:14px;color:#173b72;font:16px system-ui;position:relative;z-index:2';
    panel.innerHTML='<strong>満点達成の提出</strong><p>満点のときだけ先生へ送信します。同じ課題の加点は1回です。</p><form style="display:flex;flex-wrap:wrap;gap:10px;align-items:end"><label>学年 <input name="grade" type="number" min="1" max="6" required style="width:60px"></label><label>組 <input name="group" type="number" min="1" max="30" required style="width:60px"></label><label>出席番号 <input name="number" type="number" min="1" max="99" required style="width:70px"></label><label>提出コード <input name="code" type="password" autocomplete="off" required maxlength="64" style="width:150px"></label><button type="submit">登録・再送</button></form><p role="status" aria-live="polite"></p>';
    document.body.append(panel);form=panel.querySelector('form');status=panel.querySelector('[role=status]');
    try{const v=JSON.parse(sessionStorage.getItem('quiz-student')||'{}');['grade','group','number'].forEach(k=>form.elements[k].value=v[k]||'')}catch(e){}
    status.textContent=validEndpoint?'学年・組・番号・先生から受け取った提出コードを入力してください。':'自動提出は準備中です。現在は練習のみで、先生には送信されません。';
    form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;remember();if(latest)send();else status.textContent='入力できました。満点になったら自動で提出します。'});
    form.addEventListener('input',()=>{if(!busy)remember()});
  }
  function remember(){try{sessionStorage.setItem('quiz-student',JSON.stringify(Object.fromEntries(['grade','group','number'].map(k=>[k,form.elements[k].value]))))}catch(e){}}
  function finish(message){busy=false;clearTimeout(timer);form.querySelectorAll('input,button').forEach(x=>x.disabled=false);status.textContent=message;}
  function transmit(){bridge.postMessage({type:'submit',channel,payload:{...latest,student:Object.fromEntries(['grade','group','number','code'].map(k=>[k,form.elements[k].value]))}},bridgeOrigin)}
  function send(){
    if(busy||!latest||!validEndpoint)return;
    if(!form.checkValidity()){status.textContent='満点です。学年・組・番号・提出コードを入力して「登録・再送」を押してください。';return}
    busy=true;status.textContent='満点の結果を送信中です…';
    form.querySelectorAll('input,button').forEach(x=>x.disabled=true);
    timer=setTimeout(()=>{bridge=null;if(frame)frame.remove();frame=null;finish('送信確認ができませんでした。「登録・再送」で再送してください。重複加点はされません。')},30000);
    if(bridge){transmit();return}
    frame=document.createElement('iframe');frame.hidden=true;frame.title='満点提出の接続';
    frame.src=cfg.endpoint+'?channel='+encodeURIComponent(channel)+'&origin='+encodeURIComponent(location.origin);document.body.append(frame);
  }
  window.addEventListener('message',e=>{
    const d=e.data;
    if(!d||d.channel!==channel||!/^https:\/\/(?:script|[a-z0-9-]+-script)\.googleusercontent\.com$/.test(e.origin))return;
    if(d.type==='ready'&&busy){bridge=e.source;bridgeOrigin=e.origin;transmit()}
    if(d.type==='result'&&e.source===bridge&&busy)finish(d.ok?(d.duplicate?'この課題は提出済みです。追加の加点はありません。':'提出済みです。満点の達成を記録しました。'):(d.error||'送信できませんでした。再送してください。'));
  });
  window.QuizSubmission={graded(task,score,max,answers){
    const handle=()=>{mount();if(score!==max){latest=null;if(!busy)status.textContent='今回は満点未満のため送信しません。リセットして再挑戦できます。';return}
      latest={task,answers:JSON.parse(JSON.stringify(answers))};if(validEndpoint)send();};
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',handle,{once:true});else handle();
  }};
  document.addEventListener('DOMContentLoaded',mount,{once:true});
})();
