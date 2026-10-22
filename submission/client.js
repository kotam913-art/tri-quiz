(() => {
  'use strict';
  const cfg=window.QUIZ_SUBMISSION_CONFIG||{};
  const validEndpoint=/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(cfg.endpoint||'');
  const channel=Array.from(crypto.getRandomValues(new Uint8Array(20)),n=>n.toString(16).padStart(2,'0')).join('');
  const norm=v=>String(v==null?'':v).normalize('NFKC').trim();
  const googleOrigin=o=>/^https:\/\/(?:script|[a-z0-9-]+-script)\.googleusercontent\.com$/.test(o);
  let latest=null,panel,status,form,directLink,postButton,loginLink,busy=false,frame=null,bridge=null,bridgeOrigin='',timer,payload=null,retries=0,postSupported=false;
  function mount(){
    if(panel)return;
    panel=document.createElement('section');panel.dataset.quizSubmission='v5';
    panel.style.cssText='margin:16px auto;padding:18px;max-width:1000px;background:#eef5ff;border:2px solid #b6cdf0;border-radius:14px;color:#173b72;font:16px/1.6 system-ui;position:relative;z-index:2';
    panel.innerHTML=`<strong>満点達成の提出</strong><p>満点のときだけ先生へ送信します。同じ課題の加点は1回です。</p>
      <form style="display:flex;flex-wrap:wrap;gap:10px;align-items:end">
        <label>学年 <input name="grade" type="text" inputmode="numeric" required maxlength="2" style="width:60px;font-size:16px"></label>
        <label>組 <input name="group" type="text" inputmode="numeric" required maxlength="2" style="width:60px;font-size:16px"></label>
        <label>出席番号 <input name="number" type="text" inputmode="numeric" required maxlength="2" style="width:70px;font-size:16px"></label>
        <label>提出コード <input name="code" type="password" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" required maxlength="64" style="width:150px;font-size:16px"></label>
        <button type="submit">登録・再送</button>
      </form><p role="status" aria-live="polite"></p>
      <p><button data-post type="button" hidden style="display:none;padding:12px;background:#173b72;color:white;border:0;border-radius:8px;font:inherit;cursor:pointer">別画面で提出（再入力不要）</button></p>
      <p><a data-direct target="_blank" rel="noopener noreferrer" hidden style="display:none">番号を入力してGoogleの画面で提出する</a></p>
      <p><a data-login target="_blank" rel="noopener noreferrer">Googleの受付を開く</a></p>
      <p style="font-size:13px">自動提出が完了しない場合は、満点後に表示される別画面へのボタン・リンクから提出してください。提出結果はGoogleの画面で確認できます。Googleログインが必要かどうかは、先生の受付設定によります。</p>`;
    (document.querySelector('#submission-slot')||document.body).append(panel);form=panel.querySelector('form');status=panel.querySelector('[role=status]');directLink=panel.querySelector('[data-direct]');postButton=panel.querySelector('[data-post]');loginLink=panel.querySelector('[data-login]');
    if(validEndpoint)loginLink.href=cfg.endpoint;else loginLink.hidden=true;
    try{const v=JSON.parse(sessionStorage.getItem('quiz-student')||'{}');['grade','group','number'].forEach(k=>form.elements[k].value=v[k]||'')}catch(e){}
    status.textContent=validEndpoint?'学年・組・番号・提出コードを入力してください。満点になると送信します。':'自動提出の接続先は未設定です。現在は練習のみです。';
    form.addEventListener('submit',e=>{e.preventDefault();normalizeFields();if(!identity())return;remember();if(latest){retries=0;send()}else status.textContent='登録できました。まだ満点の結果がないため送信していません。満点になったら自動提出します。'});
    form.addEventListener('input',()=>{if(!busy){remember();updateDirect()}});
    directLink.addEventListener('click',e=>{updateDirect();if(!latest||!validEndpoint){e.preventDefault();return}status.textContent='Googleの別画面を開きました。そこで学年・組・番号・コードを入力して提出してください。完了は別画面で確認します。'});
    postButton.addEventListener('click',postDirect);
    // Prepare the iframe before the five-minute quiz; no identity or answers are sent.
    if(validEndpoint){connect();checkSupport()}
  }
  function normalizeFields(){['grade','group','number','code'].forEach(k=>form.elements[k].value=norm(form.elements[k].value))}
  function remember(){try{sessionStorage.setItem('quiz-student',JSON.stringify(Object.fromEntries(['grade','group','number'].map(k=>[k,norm(form.elements[k].value)]))))}catch(e){}}
  function identity(){
    const fields=['grade','group','number'],max=[6,30,99];
    for(let i=0;i<3;i++){const v=norm(form.elements[fields[i]].value);if(!/^\d+$/.test(v)||Number(v)<1||Number(v)>max[i]){status.textContent=['学年','組','出席番号'][i]+'を確認してください。';return false}}
    if(!norm(form.elements.code.value)){status.textContent='満点です。提出コードを入力して「登録・再送」を押してください。';return false}return true;
  }
  function updateDirect(){
    if(!directLink)return;const show=!!latest&&validEndpoint;
    for(const el of [directLink,postButton]){const visible=show&&(el!==postButton||postSupported);el.hidden=!visible;el.style.display=visible?'inline-block':'none'}
    // Only task and answers go into the fragment: no code, identity or credentials.
    if(latest&&validEndpoint)directLink.href=cfg.endpoint+'?mode=submit#'+encodeURIComponent(JSON.stringify({task:latest.task,answers:latest.answers}));
  }
  function postDirect(){
    if(!latest||!validEndpoint||!postSupported)return;normalizeFields();if(!identity())return;remember();
    // Native top-level form navigation does not depend on the embedded bridge or CORS.
    // Credentials are in the HTTPS POST body, never in a URL or browser storage.
    const post=document.createElement('form'),input=document.createElement('input');
    post.method='POST';post.action=cfg.endpoint;post.target='_blank';post.rel='noopener noreferrer';post.hidden=true;
    input.type='hidden';input.name='payload';input.value=JSON.stringify({...latest,student:Object.fromEntries(['grade','group','number','code'].map(k=>[k,form.elements[k].value]))});
    post.append(input);document.body.append(post);
    try{post.submit();status.textContent='Googleの別画面で提出結果を確認してください。「提出済み」と表示されれば完了です。'}
    catch(e){status.textContent='別画面を開けませんでした。番号を入力してGoogleの画面で提出するリンクを使ってください。'}
    setTimeout(()=>post.remove(),1000);
  }
  function finish(message){busy=false;clearTimeout(timer);form.querySelectorAll('input,button').forEach(x=>x.disabled=false);status.textContent=message;updateDirect()}
  function destroyFrame(){bridge=null;if(frame)frame.remove();frame=null}
  function checkSupport(){
    // Public, read-only metadata; no identity, credentials or answers in this request.
    const name='__quiz_status_'+channel,script=document.createElement('script');
    const cleanup=()=>{delete window[name];script.remove()};
    window[name]=data=>{if(data&&data.version===5&&data.post===true){postSupported=true;updateDirect()}cleanup()};
    script.onerror=cleanup;script.src=cfg.endpoint+'?mode=status&callback='+name;document.body.append(script);setTimeout(cleanup,45000);
  }
  function connect(){
    if(frame)return;
    frame=document.createElement('iframe');frame.hidden=true;frame.title='満点提出の接続';frame.src=cfg.endpoint+'?channel='+encodeURIComponent(channel)+'&origin='+encodeURIComponent(location.origin);document.body.append(frame);
  }
  function transmit(){clearTimeout(timer);timer=setTimeout(()=>finish('送信結果の確認ができていません。Googleの画面で提出し直してください。保存済みでも重複加点はされません。［応答待ち］'),90000);bridge.postMessage({type:'submit',channel,payload},bridgeOrigin)}
  function send(){
    if(busy||!latest||!validEndpoint)return;normalizeFields();updateDirect();if(!identity())return;
    payload={...latest,student:Object.fromEntries(['grade','group','number','code'].map(k=>[k,form.elements[k].value]))};busy=true;status.textContent='満点の結果を送信中です…';form.querySelectorAll('input,button').forEach(x=>x.disabled=true);
    if(bridge){transmit();return}
    timer=setTimeout(()=>{destroyFrame();finish('自動提出の受付から返事がありません。'+(postSupported?'「別画面で提出（再入力不要）」を押し':'「番号を入力してGoogleの画面で提出する」を開き')+'、Googleの画面で提出結果を確認してください。［接続待ち］')},45000);
    connect();
  }
  window.addEventListener('message',e=>{
    const d=e.data;if(!d||d.channel!==channel||!googleOrigin(e.origin))return;
    if(d.type==='ready'&&!bridge){bridge=e.source;bridgeOrigin=e.origin;if(d.version===5){postSupported=true;updateDirect()}if(busy)transmit()}
    if(d.type!=='result'||e.source!==bridge)return;
    if(d.ok){finish(d.duplicate?'この課題は提出済みです。重複加点はありません。':'提出済みです。満点の達成を記録しました。');return}if(!busy)return;
    if(d.retryable&&retries<2){retries++;finish('受付が混み合っています。少し待って自動で再送します。');busy=true;form.querySelectorAll('input,button').forEach(x=>x.disabled=true);setTimeout(()=>{busy=false;send()},2500+Math.random()*4000);return}
    finish(d.reason==='TASK'||(d.error==='提出内容が不正です。'&&latest?.task.startsWith('explog-'))?'先生側の提出受付コードの更新が必要です。先生に伝えてください。［課題未登録］':d.error||'送信できませんでした。Googleの画面で再送してください。');
  });
  window.QuizSubmission={graded(task,score,max,answers){const handle=()=>{mount();if(!(max>0&&score===max)){latest=null;updateDirect();if(!busy)status.textContent='今回は満点未満のため送信しません。リセットして再挑戦できます。';return}latest={task,answers:JSON.parse(JSON.stringify(answers))};retries=0;updateDirect();if(validEndpoint)send()};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',handle,{once:true});else handle()}};
  document.addEventListener('DOMContentLoaded',mount,{once:true});
})();
