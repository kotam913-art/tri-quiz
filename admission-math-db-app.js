(()=>{
  'use strict';

  const Model=window.AdmissionMathModel;
  const Store=window.AdmissionMathStore;
  const $=selector=>document.querySelector(selector);
  const $$=selector=>[...document.querySelectorAll(selector)];
  const PAGE_SIZE=20;

  const elements={
    browseView:$('#browseView'),
    printView:$('#printView'),
    browseHeading:$('#browseHeading'),
    filterForm:$('#filterForm'),
    keyword:$('#keywordFilter'),
    group:$('#groupFilter'),
    university:$('#universityFilter'),
    year:$('#yearFilter'),
    track:$('#trackFilter'),
    topic:$('#topicFilter'),
    difficulty:$('#difficultyFilter'),
    filterSummary:$('#filterSummary'),
    sort:$('#sortSelect'),
    resultKicker:$('#resultKicker'),
    resultCount:$('#resultCount'),
    resultDescription:$('#resultDescription'),
    loading:$('#loadingState'),
    error:$('#errorState'),
    empty:$('#emptyState'),
    resultList:$('#resultList'),
    loadMore:$('#loadMore'),
    recommendationPanel:$('#recommendationPanel'),
    recommendationReason:$('#recommendationReason'),
    recommendationList:$('#recommendationList'),
    printRecommendations:$('#printRecommendations'),
    printRecommendationList:$('#printRecommendationList'),
    printId:$('#printId'),
    printTitle:$('#printTitle'),
    studentId:$('#studentId'),
    printNote:$('#printNote'),
    draftCount:$('#draftCount'),
    draftCountBadge:$('#draftCountBadge'),
    selectedProblems:$('#selectedProblems'),
    savedPrintCount:$('#savedPrintCount'),
    savedPrintList:$('#savedPrintList'),
    savePrint:$('#savePrint'),
    newPrint:$('#newPrint'),
    suggestForPrint:$('#suggestForPrint'),
    printDraft:$('#printDraft'),
    clearDraft:$('#clearDraft'),
    toast:$('#toast')
  };

  const modeCopy={
    problems:{heading:'大問を探す',kicker:'PROBLEMS',description:'大問ごとの分野・必要技能・難度を表示します。'},
    exams:{heading:'試験区分を探す',kicker:'EXAMS',description:'学部・日程・数学区分と、利用できる公式資料を表示します。'},
    sources:{heading:'公式出典を探す',kicker:'OFFICIAL SOURCES',description:'11大学×5年度の公開状態と、大学公式ページを表示します。'}
  };

  const state={
    data:null,
    mode:'problems',
    visible:PAGE_SIZE,
    draft:Store?Store.loadDraft():null,
    toastTimer:null
  };

  function escapeHtml(value){
    return String(value??'').replace(/[&<>'"]/g,character=>({
      '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'
    })[character]);
  }

  function safeUrl(value){
    if(!value)return '';
    try{
      const parsed=new URL(value,location.href);
      return parsed.protocol==='https:'||parsed.protocol==='http:'?parsed.href:'';
    }catch(error){return ''}
  }

  function formatDate(value){
    if(!value)return '日程未確認';
    const date=new Date(`${value}T00:00:00`);
    if(Number.isNaN(date.getTime()))return String(value);
    return `${date.getFullYear()}年${date.getMonth()+1}月${date.getDate()}日`;
  }

  function formatTimestamp(value){
    const date=new Date(value);
    if(Number.isNaN(date.getTime()))return '';
    return `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
  }

  function confidenceClass(value){
    if(value==='高')return 'confidence-high';
    if(value==='中')return 'confidence-medium';
    return 'confidence-low';
  }

  function optionMarkup(value){
    return `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`;
  }

  function fillSelect(select,values,selected=''){
    select.innerHTML='<option value="">すべて</option>'+values.map(optionMarkup).join('');
    if(values.map(String).includes(String(selected)))select.value=String(selected);
  }

  function setupFilters(){
    const options=Model.getFilterOptions(state.data);
    fillSelect(elements.group,options.groups,elements.group.value);
    fillSelect(elements.year,options.years,elements.year.value);
    fillSelect(elements.track,options.tracksByMode[state.mode]||[],elements.track.value);
    fillSelect(elements.topic,options.topics,elements.topic.value);
    updateUniversityOptions(options);
  }

  function updateTrackOptions(){
    if(!state.data)return;
    const options=Model.getFilterOptions(state.data);
    fillSelect(elements.track,options.tracksByMode[state.mode]||[],elements.track.value);
  }

  function updateUniversityOptions(options=Model.getFilterOptions(state.data)){
    const selected=elements.university.value;
    const universities=elements.group.value
      ?options.universities.filter(university=>state.data.sources.some(source=>source.group===elements.group.value&&source.university===university))
      :options.universities;
    fillSelect(elements.university,universities,selected);
  }

  function currentFilters(){
    return {
      keyword:elements.keyword.value,
      group:elements.group.value,
      university:elements.university.value,
      year:elements.year.value,
      track:elements.track.value,
      topic:elements.topic.value,
      difficulty:elements.difficulty.value
    };
  }

  function updateFilterSummary(){
    const filters=currentFilters();
    const labels=[];
    if(filters.keyword)labels.push(`「${filters.keyword}」`);
    if(filters.group)labels.push(filters.group);
    if(filters.university)labels.push(filters.university);
    if(filters.year)labels.push(`${filters.year}年度`);
    if(filters.track)labels.push(filters.track);
    if(state.mode==='problems'&&filters.topic)labels.push(filters.topic);
    if(state.mode==='problems'&&filters.difficulty)labels.push(`難度${filters.difficulty}`);
    elements.filterSummary.textContent=labels.length?`${labels.length}条件`:'条件なし';
    elements.filterSummary.title=labels.join('、');
  }

  function resetFilters(render=true){
    elements.filterForm.reset();
    updateUniversityOptions();
    state.visible=PAGE_SIZE;
    if(render)renderResults();
  }

  function setMode(mode,{scroll=false}={}){
    state.mode=mode;
    $$('.view-tab').forEach(button=>{
      const active=button.dataset.mode===mode;
      button.classList.toggle('active',active);
      button.setAttribute('aria-pressed',String(active));
    });
    const printing=mode==='prints';
    elements.browseView.hidden=printing;
    elements.printView.hidden=!printing;
    if(printing){
      renderDraft();
    }else{
      const copy=modeCopy[mode];
      elements.browseHeading.textContent=copy.heading;
      elements.resultKicker.textContent=copy.kicker;
      elements.resultDescription.textContent=copy.description;
      $$('.problem-only').forEach(field=>field.hidden=mode!=='problems');
      updateTrackOptions();
      $$('#sortSelect option').forEach(option=>{
        if(option.value.startsWith('difficulty'))option.disabled=mode!=='problems';
      });
      if(mode!=='problems'&&elements.sort.value.startsWith('difficulty'))elements.sort.value='year-desc';
      if(mode!=='problems'){
        elements.topic.value='';
        elements.difficulty.value='';
        closeRecommendations();
      }
      state.visible=PAGE_SIZE;
      renderResults();
    }
    if(scroll)document.querySelector('.view-tabs').scrollIntoView({behavior:'smooth',block:'start'});
  }

  function badge(text,className=''){
    if(!text)return '';
    return `<span class="badge ${className}">${escapeHtml(text)}</span>`;
  }

  function externalLink(url,label){
    const valid=safeUrl(url);
    if(!valid)return '';
    return `<a href="${escapeHtml(valid)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)} ↗</a>`;
  }

  function problemCard(problem){
    const difficulty=Number(problem.difficulty_level);
    const difficultyWidth=Number.isFinite(difficulty)?Math.max(0,Math.min(100,difficulty/5*100)):0;
    const selected=state.draft&&state.draft.problem_ids.includes(problem.problem_id);
    const secondary=(problem.secondary_topics||[]).join('・')||'なし';
    return `
      <article class="problem-card" data-problem-card="${escapeHtml(problem.problem_id)}">
        <div class="card-top">
          <div>
            <p class="card-eyebrow">${escapeHtml(problem.university)}　${escapeHtml(problem.year)}年度</p>
            <h3>大問 ${escapeHtml(problem.question_no||'—')}｜${escapeHtml(problem.primary_topic)}</h3>
          </div>
          <span class="problem-id" title="Problem_ID">${escapeHtml(problem.problem_id)}</span>
        </div>
        <div class="badge-row">
          ${badge(problem.group,'group')}
          ${badge(problem.math_track,'track')}
          ${badge(problem.course)}
          ${badge(`信頼度 ${problem.difficulty_confidence}`,confidenceClass(problem.difficulty_confidence))}
        </div>
        <p class="skills">${escapeHtml(problem.skills_summary||'必要技能は未記載です。')}</p>
        <div class="difficulty-row" aria-label="難度 ${escapeHtml(problem.difficulty_level)}、${escapeHtml(problem.difficulty_label)}">
          <span>難度</span>
          <span class="difficulty-track" aria-hidden="true"><i style="--difficulty:${difficultyWidth}%"></i></span>
          <span class="difficulty-value">${escapeHtml(problem.difficulty_level)} / 5</span>
        </div>
        <dl class="meta-grid">
          <div><dt>主分野</dt><dd>${escapeHtml(problem.primary_topic)}</dd></div>
          <div><dt>関連分野</dt><dd>${escapeHtml(secondary)}</dd></div>
          <div><dt>対象</dt><dd>${escapeHtml(problem.faculty_scope||'未確認')}</dd></div>
          <div><dt>解答形式</dt><dd>${escapeHtml(problem.answer_format||'未確認')}</dd></div>
        </dl>
        <details class="record-details">
          <summary>出典・分類根拠・権利状態</summary>
          <p><strong>分類根拠：</strong>${escapeHtml(problem.source_evidence||problem.difficulty_basis||'公式資料に基づくメタデータ')}</p>
          <p><strong>難度根拠：</strong>${escapeHtml(problem.difficulty_basis||'未確認')}</p>
          <div class="rights-box"><strong>権利状態</strong>${escapeHtml(Model.displayValue(problem.rights_status))}<br>問題本文は保存していません。</div>
          <div class="source-links">${externalLink(problem.source_url,'公式出典を開く')}</div>
        </details>
        <div class="card-actions">
          <button class="card-button add-button ${selected?'added':''}" type="button" data-add-problem="${escapeHtml(problem.problem_id)}">${selected?'追加済み（外す）':'プリントに追加'}</button>
          <button class="card-button" type="button" data-recommend="${escapeHtml(problem.problem_id)}">類題を探す</button>
        </div>
      </article>`;
  }

  function examCard(exam){
    const method=exam.selection_method||exam.admission_method||exam.content_form||'数学試験';
    const links=[
      externalLink(exam.problem_url,'問題'),
      externalLink(exam.answer_url,'正答'),
      externalLink(exam.intent_url,'出題意図・解説'),
      externalLink(exam.landing_url,'公式案内')
    ].filter(Boolean).join('');
    return `
      <article class="record-card">
        <div class="card-top">
          <div>
            <p class="card-eyebrow">${escapeHtml(exam.university)}　${escapeHtml(exam.year)}年度</p>
            <h3>${escapeHtml(method)}</h3>
          </div>
          <span class="problem-id" title="Exam_ID">${escapeHtml(exam.exam_id)}</span>
        </div>
        <div class="badge-row">
          ${badge(exam.group,'group')}
          ${badge(exam.math_track,'track')}
          ${badge(formatDate(exam.exam_date))}
        </div>
        <dl class="meta-grid">
          <div><dt>対象学部・範囲</dt><dd>${escapeHtml(exam.faculty_scope||'未確認')}</dd></div>
          <div><dt>分類状態</dt><dd>${escapeHtml(Model.displayValue(exam.classification_status))}</dd></div>
          <div><dt>資料形式</dt><dd>${escapeHtml(Model.displayValue(exam.source_type||exam.content_form))}</dd></div>
          <div><dt>公開状態</dt><dd>${escapeHtml(Model.displayValue(exam.access))}</dd></div>
        </dl>
        ${exam.note?`<p class="record-description">${escapeHtml(exam.note)}</p>`:''}
        <div class="rights-box"><strong>権利状態</strong>${escapeHtml(Model.displayValue(exam.rights_status))}</div>
        <div class="source-links">${links||'<span class="badge">公式資料リンク未確認</span>'}</div>
      </article>`;
  }

  function sourceCard(source){
    const variants=(source.math_variants||[]).map(value=>badge(value,'track')).join('');
    return `
      <article class="record-card">
        <div class="card-top">
          <div>
            <p class="card-eyebrow">${escapeHtml(source.university)}　${escapeHtml(source.year)}年度</p>
            <h3>${escapeHtml(source.scope||'一般選抜・数学')}</h3>
          </div>
          <span class="problem-id" title="Source_ID">${escapeHtml(source.source_id)}</span>
        </div>
        <div class="badge-row">${badge(source.group,'group')}${variants}</div>
        <dl class="meta-grid">
          <div><dt>問題</dt><dd>${escapeHtml(Model.displayValue(source.problem_availability))}</dd></div>
          <div><dt>正答</dt><dd>${escapeHtml(Model.displayValue(source.answer_availability))}</dd></div>
          <div><dt>解説・出題意図</dt><dd>${escapeHtml(Model.displayValue(source.explanation_availability))}</dd></div>
          <div><dt>収録状態</dt><dd>${escapeHtml(Model.displayValue(source.coverage_status))}</dd></div>
        </dl>
        ${source.note?`<details class="record-details"><summary>補足情報</summary><p>${escapeHtml(source.note)}</p><p><strong>確認日：</strong>${escapeHtml(source.verified_at||'未確認')}</p></details>`:''}
        <div class="rights-box"><strong>権利状態</strong>${escapeHtml(Model.displayValue(source.rights_status))}</div>
        <div class="source-links">${externalLink(source.landing_url,'大学公式ページを開く')}</div>
      </article>`;
  }

  function renderResults(){
    updateFilterSummary();
    if(!state.data)return;
    const records=state.data[state.mode]||[];
    const filtered=Model.filterRecords(records,state.mode,currentFilters());
    const sorted=Model.sortRecords(filtered,elements.sort.value);
    elements.resultCount.textContent=String(sorted.length);
    elements.empty.hidden=sorted.length>0;
    const visible=sorted.slice(0,state.visible);
    elements.resultList.innerHTML=visible.map(record=>state.mode==='problems'?problemCard(record):state.mode==='exams'?examCard(record):sourceCard(record)).join('');
    elements.loadMore.hidden=visible.length>=sorted.length;
    if(!elements.loadMore.hidden)elements.loadMore.textContent=`続きを表示（残り${sorted.length-visible.length}件）`;
    syncAddButtons();
  }

  function recommendationCard(result){
    const problem=result.problem;
    const selected=state.draft.problem_ids.includes(problem.problem_id);
    return `
      <article class="recommend-card">
        <span class="card-eyebrow">${escapeHtml(problem.university)} ${escapeHtml(problem.year)}年度</span>
        <h3>大問 ${escapeHtml(problem.question_no)}｜${escapeHtml(problem.primary_topic)}</h3>
        <p>難度 ${escapeHtml(problem.difficulty_level)}／${escapeHtml(problem.math_track)}</p>
        <p class="match-reason">${escapeHtml(result.reason)}</p>
        <button class="card-button add-button ${selected?'added':''}" type="button" data-add-problem="${escapeHtml(problem.problem_id)}">${selected?'追加済み（外す）':'プリントに追加'}</button>
      </article>`;
  }

  function showRecommendations(anchorIds){
    const recommendations=Model.recommend(state.data.problems,anchorIds,6);
    elements.recommendationReason.textContent=recommendations.length?'主分野の一致と難度差から並べています。':'十分に近い類題候補が見つかりませんでした。';
    elements.recommendationList.innerHTML=recommendations.length?recommendations.map(recommendationCard).join(''):'<p class="selected-empty">別の大問を選んで、もう一度お試しください。</p>';
    elements.recommendationPanel.hidden=false;
    elements.recommendationPanel.scrollIntoView({behavior:'smooth',block:'start'});
  }

  function closeRecommendations(){
    elements.recommendationPanel.hidden=true;
    elements.recommendationList.innerHTML='';
  }

  function showToast(message){
    clearTimeout(state.toastTimer);
    elements.toast.textContent=message;
    elements.toast.hidden=false;
    state.toastTimer=setTimeout(()=>{elements.toast.hidden=true},2600);
  }

  function persistenceMessage(persisted,success){
    return persisted?success:'このブラウザでは端末保存を使えません。ページを閉じると消える場合があります。';
  }

  function toggleProblem(problemId){
    const selected=state.draft.problem_ids.includes(problemId);
    const result=selected?Store.removeProblem(problemId):Store.addProblem(problemId);
    state.draft=result.draft;
    renderDraft();
    showToast(persistenceMessage(result.persisted,selected?'プリント候補から外しました。':'プリント候補に追加しました。'));
  }

  function syncAddButtons(){
    if(!state.draft)return;
    $$('[data-add-problem]').forEach(button=>{
      const selected=state.draft.problem_ids.includes(button.dataset.addProblem);
      button.classList.toggle('added',selected);
      button.textContent=selected?'追加済み（外す）':'プリントに追加';
    });
  }

  function selectedProblemMarkup(problemId){
    const problem=state.data&&state.data.problemsById.get(problemId);
    if(!problem){
      return `<article class="selected-item"><div><h4>${escapeHtml(problemId)}</h4><p>現在のデータには見つかりません。</p></div><button type="button" data-remove-problem="${escapeHtml(problemId)}" aria-label="${escapeHtml(problemId)}を外す">×</button></article>`;
    }
    return `<article class="selected-item">
      <div><h4>${escapeHtml(problem.university)} ${escapeHtml(problem.year)}年度　大問${escapeHtml(problem.question_no)}｜${escapeHtml(problem.primary_topic)}</h4><p>Problem_ID: ${escapeHtml(problem.problem_id)}　難度 ${escapeHtml(problem.difficulty_level)}　${escapeHtml(problem.source_url?'公式出典あり':'出典未確認')}</p></div>
      <button type="button" data-remove-problem="${escapeHtml(problem.problem_id)}" aria-label="${escapeHtml(problem.primary_topic)}を外す">×</button>
    </article>`;
  }

  function savedPrintMarkup(print){
    return `<article class="saved-print">
      <h4>${escapeHtml(print.title||'名称未設定のプリント')}</h4>
      <p>${escapeHtml(print.print_id)}<br>${print.problem_ids.length}問${print.student_id?`／Student_ID: ${escapeHtml(print.student_id)}`:''}<br>更新 ${escapeHtml(formatTimestamp(print.updated_at))}</p>
      <div class="saved-print-actions">
        <button type="button" data-open-print="${escapeHtml(print.print_id)}">呼び出す</button>
        <button class="delete-saved" type="button" data-delete-print="${escapeHtml(print.print_id)}">削除</button>
      </div>
    </article>`;
  }

  function renderSavedPrints(){
    const prints=Store.loadPrints();
    elements.savedPrintCount.textContent=`${prints.length}件`;
    elements.savedPrintList.innerHTML=prints.length?prints.map(savedPrintMarkup).join(''):'<p class="saved-empty">まだ登録はありません。<br>大問を選び、「この端末に登録」を押してください。</p>';
  }

  function renderDraft(){
    if(!state.draft)return;
    const count=state.draft.problem_ids.length;
    elements.printId.textContent=state.draft.print_id;
    if(document.activeElement!==elements.printTitle)elements.printTitle.value=state.draft.title;
    if(document.activeElement!==elements.studentId)elements.studentId.value=state.draft.student_id;
    if(document.activeElement!==elements.printNote)elements.printNote.value=state.draft.note;
    elements.draftCount.textContent=`${count}問`;
    elements.draftCountBadge.textContent=`${count}問`;
    elements.selectedProblems.innerHTML=count?state.draft.problem_ids.map(selectedProblemMarkup).join(''):'<p class="selected-empty">大問が選ばれていません。<br>「大問を追加する」から問題を選んでください。</p>';
    elements.savePrint.disabled=count===0;
    elements.suggestForPrint.disabled=count===0||!state.data;
    elements.printDraft.disabled=count===0;
    elements.clearDraft.disabled=count===0;
    renderSavedPrints();
    syncAddButtons();
  }

  function saveDraftFields(){
    const result=Store.patchDraft({
      title:elements.printTitle.value,
      student_id:elements.studentId.value,
      note:elements.printNote.value
    });
    state.draft=result.draft;
  }

  function defaultPrintTitle(){
    if(!state.data)return '大学入試数学 プリント';
    const topics=state.draft.problem_ids.map(id=>state.data.problemsById.get(id)?.primary_topic).filter(Boolean);
    const primary=topics[0];
    return primary?`${primary} 入試演習`:'大学入試数学 プリント';
  }

  function savePrint(){
    if(!state.draft.problem_ids.length)return;
    saveDraftFields();
    if(!state.draft.title.trim()){
      state.draft.title=defaultPrintTitle();
      elements.printTitle.value=state.draft.title;
    }
    const result=Store.savePrint(state.draft);
    state.draft=result.record;
    renderDraft();
    showToast(persistenceMessage(result.persisted,'プリントをこの端末に登録しました。'));
  }

  function createNewPrint(){
    const hasContent=state.draft.problem_ids.length||state.draft.title||state.draft.student_id||state.draft.note;
    if(hasContent&&!confirm('新しいプリントに切り替えますか？ 現在の内容は、登録済みでなければ一覧に残りません。'))return;
    const result=Store.newDraft();
    state.draft=result.draft;
    elements.printRecommendations.hidden=true;
    renderDraft();
    showToast('新しいPrint_IDを作成しました。');
  }

  function suggestForPrint(){
    if(!state.data||!state.draft.problem_ids.length)return;
    const recommendations=Model.recommend(state.data.problems,state.draft.problem_ids,6);
    elements.printRecommendationList.innerHTML=recommendations.length?recommendations.map(recommendationCard).join(''):'<p class="selected-empty">十分に近い類題候補が見つかりませんでした。</p>';
    elements.printRecommendations.hidden=false;
    const context={
      rule_version:'topic-difficulty-v1',
      anchor_problem_ids:[...state.draft.problem_ids],
      generated_at:new Date().toISOString(),
      recommended_problem_ids:recommendations.map(result=>result.problem.problem_id)
    };
    const stored=Store.patchDraft({recommendation_context:context});
    state.draft=stored.draft;
    elements.printRecommendations.scrollIntoView({behavior:'smooth',block:'start'});
  }

  function clearDraftProblems(){
    if(!state.draft.problem_ids.length)return;
    if(!confirm('選択中の大問をすべて外しますか？'))return;
    const result=Store.clearProblems();
    state.draft=result.draft;
    elements.printRecommendations.hidden=true;
    renderDraft();
    showToast('選択中の大問をすべて外しました。');
  }

  function openSavedPrint(printId){
    const draft=Store.openPrint(printId);
    if(!draft){showToast('登録データを呼び出せませんでした。');return}
    state.draft=draft;
    elements.printRecommendations.hidden=true;
    renderDraft();
    showToast('登録済みプリントを呼び出しました。');
  }

  function deleteSavedPrint(printId){
    const record=Store.loadPrints().find(print=>print.print_id===printId);
    if(!record)return;
    if(!confirm(`「${record.title||record.print_id}」を登録済み一覧から削除しますか？`))return;
    const result=Store.deletePrint(printId);
    renderSavedPrints();
    showToast(persistenceMessage(result.persisted,'登録済みプリントを削除しました。'));
  }

  function bindDelegatedActions(container){
    container.addEventListener('click',event=>{
      const add=event.target.closest('[data-add-problem]');
      if(add){toggleProblem(add.dataset.addProblem);return}
      const recommend=event.target.closest('[data-recommend]');
      if(recommend)showRecommendations([recommend.dataset.recommend]);
    });
  }

  function bindEvents(){
    $$('.view-tab').forEach(button=>button.addEventListener('click',()=>setMode(button.dataset.mode)));
    elements.filterForm.addEventListener('input',()=>{state.visible=PAGE_SIZE;renderResults()});
    elements.filterForm.addEventListener('change',event=>{
      if(event.target===elements.group)updateUniversityOptions();
      state.visible=PAGE_SIZE;
      renderResults();
    });
    elements.sort.addEventListener('change',()=>{state.visible=PAGE_SIZE;renderResults()});
    $('#resetFilters').addEventListener('click',()=>resetFilters());
    $('#emptyReset').addEventListener('click',()=>resetFilters());
    elements.loadMore.addEventListener('click',()=>{state.visible+=PAGE_SIZE;renderResults()});
    $('#closeRecommendations').addEventListener('click',closeRecommendations);
    $('#retryLoad').addEventListener('click',loadData);
    bindDelegatedActions(elements.resultList);
    bindDelegatedActions(elements.recommendationList);
    bindDelegatedActions(elements.printRecommendationList);

    elements.selectedProblems.addEventListener('click',event=>{
      const remove=event.target.closest('[data-remove-problem]');
      if(remove)toggleProblem(remove.dataset.removeProblem);
    });
    elements.savedPrintList.addEventListener('click',event=>{
      const open=event.target.closest('[data-open-print]');
      if(open){openSavedPrint(open.dataset.openPrint);return}
      const remove=event.target.closest('[data-delete-print]');
      if(remove)deleteSavedPrint(remove.dataset.deletePrint);
    });
    [elements.printTitle,elements.studentId,elements.printNote].forEach(input=>input.addEventListener('input',saveDraftFields));
    elements.savePrint.addEventListener('click',savePrint);
    elements.newPrint.addEventListener('click',createNewPrint);
    elements.suggestForPrint.addEventListener('click',suggestForPrint);
    elements.printDraft.addEventListener('click',()=>{saveDraftFields();window.print()});
    elements.clearDraft.addEventListener('click',clearDraftProblems);
    $('#backToProblems').addEventListener('click',()=>setMode('problems',{scroll:true}));
    $('#closePrintRecommendations').addEventListener('click',()=>{elements.printRecommendations.hidden=true});
    window.addEventListener('beforeprint',saveDraftFields);
  }

  function updateStats(){
    const counts=state.data.counts;
    $('#sourceStat').textContent=String(counts.sources);
    $('#examStat').textContent=String(counts.exams);
    $('#problemStat').textContent=String(counts.problems);
    $('#topicStat').textContent=String(counts.topics);
  }

  async function loadData(){
    elements.loading.hidden=false;
    elements.error.hidden=true;
    elements.empty.hidden=true;
    elements.resultList.innerHTML='';
    elements.loadMore.hidden=true;
    try{
      if(!Model||!Store)throw new Error('required-script-missing');
      state.data=await Model.load();
      elements.loading.hidden=true;
      setupFilters();
      updateStats();
      renderDraft();
      setMode(state.mode);
    }catch(error){
      console.error(error);
      elements.loading.hidden=true;
      elements.error.hidden=false;
    }
  }

  if(!Store){
    elements.loading.hidden=true;
    elements.error.hidden=false;
    return;
  }
  bindEvents();
  renderDraft();
  loadData();
})();
