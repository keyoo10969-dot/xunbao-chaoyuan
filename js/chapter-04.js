/* 第四幕复用卡片、扫描和舞台；任务结果与认知走查结论分别记录，未通过不能盖章。 */
window.createChapter04 = env => {
  const data=window.Chapter04Data, gods=window.Chapter02Data, ui=window.WalkthroughUI, card=window.TreasureCard, assessment=window.WalkthroughAssessment;
  const {stage,view}=env, reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let state='', shot='submit', line=0, records={}, verified=new Map(), checkingId=null, verificationComplete=false, feedbackShown=false, scanComplete=false, remedyShown=false, walkthroughEnded=false, recordsComplete=false, verificationPassed=false, stamped=false, activityComplete=false, timers=[], lockedUntil=0, zoomReturn=null;
  const later=(fn,delay)=>timers.push(setTimeout(fn,delay));
  const primary=(label,action)=>ui.button(label,action,'chapter04-primary');
  function clearTimers(){timers.forEach(clearTimeout);timers=[];}
  function cancel(){clearTimers();view.querySelector('dialog')?.close();delete stage.dataset.camera04;delete stage.dataset.camera04Phase;delete stage.dataset.stampPhase;}
  function reset(){cancel();records={};verified.clear();recordsComplete=verificationPassed=stamped=activityComplete=verificationComplete=feedbackShown=scanComplete=remedyShown=walkthroughEnded=false;checkingId=null;lockedUntil=0;state='';for(const key of ['recordsComplete','verifiedCount','correctCount','incorrectCount','verificationComplete','verificationPassed','stampComplete','activityComplete','feedbackShown','scanComplete','remedyShown','walkthroughEnded'])delete stage.dataset[key];}
  const correctCount=()=>[...verified.values()].filter(Boolean).length;
  function sync(){Object.assign(stage.dataset,{chapterState:state,recordCount:String(Object.keys(records).length),recordsComplete:String(recordsComplete),verifiedCount:String(verified.size),correctCount:String(correctCount()),incorrectCount:String(verified.size-correctCount()),verificationComplete:String(verificationComplete),verificationPassed:String(verificationPassed),stampComplete:String(stamped),activityComplete:String(activityComplete),feedbackShown:String(feedbackShown),scanComplete:String(scanComplete),remedyShown:String(remedyShown),walkthroughEnded:String(walkthroughEnded)});}
  function guard(){
    lockedUntil=performance.now()+data.timing.dialogueGuard;
    const buttons=[...view.querySelectorAll('.chapter04-primary,.dialogue .continue')];buttons.forEach(button=>button.disabled=true);
    later(()=>buttons.forEach(button=>{if(button.isConnected)button.disabled=false;}),data.timing.dialogueGuard);
  }
  function render(html,cls='chapter04-view'){sync();env.render(html,cls);card.bindImages(view);decorateCard();guard();}
  function scene(text='',label='继续',action='chapter04-next',speaker='小美'){
    return {chapterLabel:'第三幕 / 提交核验',location:({approach:'发现任务核对点',submit:'来到核验点',verification:'工作人员核验编号',feedback:'工作人员说明结果',remedy:'工作人员提供补救建议',closing:'小美回应'})[state.split('-')[0]]||'来到核验点',speaker,text,buttonLabel:label,buttonAction:action};
  }
  function mask(){return ['submit','verification'].includes(shot)?`<div class="photo-card-sign ${shot}-card-sign" aria-hidden="true">待核验</div>`:'';}
  function cameraControl(){return '';}
  function animateCamera(kind){stage.dataset.camera04=kind;stage.dataset.camera04Phase=reduced?'stable':'pushing';stage.style.setProperty('--camera04-time',`${data.timing[kind]}ms`);if(!reduced)later(()=>{stage.dataset.camera04Phase='stable';view.querySelector('[data-action="chapter04-camera-skip"]')?.remove();},data.timing[kind]);}
  function start(incoming,{preview=false}={}){
    reset();env.cancelScan();
    // 有正常剧情记录时绝不以预览数据覆盖，也不从卡片顺序推断编号。
    const source=incoming===undefined&&preview?data.previewRecords:incoming;
    if(!source||!gods.gods.every(g=>Number.isInteger(source[g.id])&&source[g.id]>=1&&source[g.id]<=8)){
      stage.dataset.chapter='4';state='missing-records';env.setProgress(3,3);
      render(`<div class="ending-content"><h1>等待完整的寻宝记录</h1><p>请先完成第三幕的八处编号记录，再进入核验。</p>${primary('返回序幕','chapter04-restart')}</div>`);return;
    }
    records=Object.freeze(Object.fromEntries(gods.gods.map(g=>[g.id,source[g.id]])));recordsComplete=true;
    stage.dataset.chapter='4';env.setProgress(3,3);shot='approach';line=0;state='approach-observe';env.background('approach04');
    stage.dataset.camera04='submit';stage.dataset.camera04Phase='environment';
    render(ui.heading(scene())+mask()+cameraControl(),'chapter04-view submit04-view');
    later(()=>{animateCamera('submit');dialogue('approach',0);},data.timing.environment);
  }
  function dialogue(group,index){
    line=index;state=`${group}-dialogue`;
    const item=data.dialogues[group][index];let label='继续';
    if(group==='submit'&&index===data.dialogues.submit.length-1)label='开始核验';
    if(group==='feedback'&&index===data.dialogues.feedback.length-1){feedbackShown=true;}
    if(group==='closing')label='继续';
    render(ui.dialogue(scene(item.text,label,group==='closing'?'chapter04-finish':'chapter04-next',item.speaker))+mask()+cameraControl(),`chapter04-view ${shot}04-view`);
  }
  function stabilizeCamera(){
    if(!['environment','pushing'].includes(stage.dataset.camera04Phase))return;
    const observing=state.endsWith('-observe');clearTimers();stage.style.setProperty('--camera04-time','350ms');stage.dataset.camera04Phase='stable';
    view.querySelector('[data-action="chapter04-camera-skip"]')?.remove();
    if(observing)dialogue(shot,0);else guard();
  }
  function enterShot(kind){cancel();shot=kind;env.background(kind==='verification'?'verification04':'feedback04');animateCamera(kind);if(kind==='verification'){verificationUI();beginVerification();}else dialogue('feedback',0);}
  function cardHTML(){return card.front(gods,assessment.cardVersion,{records,footnote:verificationComplete?'八处记录已核对，本次暂未通过核验，未盖章。':'编号来自第三幕记录，等待工作人员确认。'});}
  function decorateCard(root=view){
    root.querySelectorAll('.god-entry').forEach(entry=>{
      const id=entry.dataset.god, checked=verified.has(id), passed=verified.get(id);
      entry.classList.toggle('verification-passed',checked&&passed);entry.classList.toggle('verification-failed',checked&&!passed);entry.classList.toggle('verification-checking',id===checkingId);
      let status=entry.querySelector('.verification-state');
      if(checked){if(!status){status=document.createElement('small');status.className='verification-state';entry.querySelector('.god-copy').append(status);}status.textContent=passed?'✓ 匹配正确':'⚠ 匹配错误';}else status?.remove();
      entry.querySelector('.paste-slot span').setAttribute('aria-label',`已记录编号 ${records[id]}${checked?passed?'，模拟匹配正确':'，模拟匹配错误':''}`);
    });
  }
  function workspace(right){
    return `<div class="verification-workspace"><div class="verification-card"><div class="treasure-card-host">${cardHTML()}</div><button class="text-button" data-action="chapter04-card-zoom">放大查看 ↗</button></div><section class="verification-copy" id="verification-context">${right}</section></div>`;
  }
  function verificationUI(){
    cancel();state='verification-ready';
    render(workspace(`<span class="eyebrow">第三幕 · 提交核验</span><h1>核对八处编号</h1><h2>8/8 已记录，等待工作人员确认。</h2><p>小美已经完成八处人物匹配，现在需要核对记录是否正确。</p>${primary('开始核验','verification-start')}`),'chapter04-view verification-card-view');
  }
  function beginVerification(){
    if(state!=='verification-ready')return;clearTimers();state='verifying';checkingId=gods.gods[0].id;sync();decorateCard();
    view.querySelector('[data-action="chapter04-card-zoom"]').disabled=true;
    view.querySelector('#verification-context').innerHTML='<span class="eyebrow">第三幕 · 工作人员核验</span><h1>逐项核对编号</h1><strong class="verification-counter" id="verification-count">0 / 8</strong><p id="verification-status" role="status">正在核对第一处记录。</p><button class="text-button" data-action="verification-fast">快速完成核验 →</button>';
    gods.gods.forEach((god,index)=>later(()=>markVerified(index),data.timing.check*(index+1)));
  }
  function markVerified(index){
    if(state!=='verifying')return;const god=gods.gods[index];if(verified.has(god.id))return;
    const passed=records[god.id]===data.verification.expectedNumbers[god.id];verified.set(god.id,passed);checkingId=gods.gods[index+1]?.id||null;decorateCard();sync();
    view.querySelector('#verification-count').textContent=`${verified.size} / 8 已核对`;
    view.querySelector('#verification-status').textContent=`${god.name}：${passed?'匹配正确':'匹配错误'}。`;
    if(verified.size===8){state='verification-hold';sync();view.querySelector('[data-action="verification-fast"]')?.remove();view.querySelector('#verification-status').textContent='八处记录均已核对，正在汇总结果。';later(verificationFinished,data.timing.resultHold);}
  }
  function fastVerification(){if(state!=='verifying')return;clearTimers();gods.gods.forEach((_,index)=>markVerified(index));}
  function verificationFinished(){
    if(state!=='verification-hold')return;clearTimers();verificationComplete=true;verificationPassed=correctCount()===8;stamped=activityComplete=false;state='verification-result';sync();
    view.querySelector('.card-footnote').textContent='八处记录已核对，本次暂未通过核验，未盖章。';
    view.querySelector('#verification-context').innerHTML=`<span class="eyebrow">核验结果</span><strong class="verification-counter">${correctCount()} / 8 <span>匹配正确</span></strong><h2 class="verification-error-title">发现${8-correctCount()}处匹配错误</h2><p>8处编号已记录</p><p>${correctCount()}处匹配正确</p><p>${8-correctCount()}处匹配错误</p><p>本次暂未通过核验</p><p class="verification-task-state">暂未通过 · 不能盖章</p>${primary('查看核验反馈','verification-feedback')}`;
    view.querySelector('[data-action="chapter04-card-zoom"]').disabled=false;env.checkpoint?.();guard();
  }
  function beginScan(){
    if(!verificationComplete||!feedbackShown||!remedyShown||state!=='closing-dialogue')return;
    cancel();state='scan-hold';sync();view.querySelector('.continue').disabled=true;
    later(()=>{state='scan';sync();stage.classList.add('frozen');env.changeScene(()=>{stage.classList.remove('frozen');env.scan(data.scan,{label:'继续',action:'chapter04-scan-complete',onContinue:returnFromScan});});},data.timing.feedbackHold);
  }
  function returnFromScan(){cancel();scanComplete=true;shot='feedback';env.background('feedback04');walkthroughEnd();}
  function walkthroughEnd(){
    cancel();state='walkthrough-end';walkthroughEnded=false;env.setProgress(4,4);
    render(`<section class="ending-content walkthrough-final"><span class="eyebrow">评估者视角</span><h1>本轮认知走查结束</h1><p>三个剧情节点已完成演示，认知问题已记录。</p><div class="walkthrough-final-actions">${primary('结束走查','chapter04-end')}${primary('再次走查','chapter04-restart')}</div></section>`,'chapter04-view final-end-view');
  }
  function finishWalkthrough(){
    if(state!=='walkthrough-end'||walkthroughEnded)return;
    cancel();walkthroughEnded=true;sync();
    view.querySelector('[data-action="chapter04-end"]').disabled=true;env.checkpoint?.();
  }
  function zoom(){
    if(view.querySelector('dialog')||['verifying','verification-hold'].includes(state))return;
    zoomReturn=document.activeElement;const dialog=document.createElement('dialog');dialog.className='card-zoom-dialog';dialog.setAttribute('aria-label','寻宝卡编号与模拟核验状态放大查看');
    dialog.innerHTML=`<button class="text-button zoom-close" autofocus>关闭放大查看 ×</button>${cardHTML()}`;view.append(dialog);card.bindImages(dialog);decorateCard(dialog);
    const close=()=>{dialog.close();dialog.remove();zoomReturn?.focus();};dialog.querySelector('.zoom-close').addEventListener('click',close);dialog.addEventListener('cancel',event=>{event.preventDefault();close();});dialog.showModal();
  }
  function next(){
    if(state==='approach-dialogue'){env.crossfadeScene(()=>{cancel();shot='submit';env.background('submit04');animateCamera('submit');dialogue('submit',0);});}
    else if(state==='submit-dialogue'){if(line<data.dialogues.submit.length-1)dialogue('submit',line+1);else env.crossfadeScene(()=>enterShot('verification'));}
    else if(state==='feedback-dialogue'){if(line<data.dialogues.feedback.length-1)dialogue('feedback',line+1);else dialogue('remedy',0);}
    else if(state==='remedy-dialogue'){if(line<data.dialogues.remedy.length-1)dialogue('remedy',line+1);else{remedyShown=true;dialogue('closing',0);}}
  }
  function handle(action){
    if(view.querySelector('dialog[open]'))return;
    const fast=['chapter04-camera-skip','verification-fast'].includes(action);
    if(!fast&&performance.now()<lockedUntil)return;
    if(action==='chapter04-next')next();
    else if(action==='chapter04-camera-skip')stabilizeCamera();
    else if(action==='verification-start')beginVerification();
    else if(action==='verification-fast')fastVerification();
    else if(action==='verification-feedback'&&state==='verification-result')env.crossfadeScene(()=>enterShot('feedback'));
    else if(action==='chapter04-finish'&&state==='closing-dialogue'&&remedyShown)beginScan();
    else if(action==='chapter04-card-zoom'&&['verification-ready','verification-result'].includes(state))zoom();
    else if(action==='chapter04-end')finishWalkthrough();
    else if(action==='chapter04-restart'&&['missing-records','walkthrough-end'].includes(state))env.changeScene(env.opening);
  }
  function advance(){
    if(state==='walkthrough-end'||view.querySelector('dialog[open]'))return;
    if(state.endsWith('-observe')){stabilizeCamera();return;}
    const button=view.querySelector('.chapter04-primary:not(:disabled)')||view.querySelector('.dialogue .continue:not(:disabled)')||view.querySelector('[data-action="verification-fast"]');if(button)handle(button.dataset.action);
  }
  function clickScene(){if(state.endsWith('-observe'))stabilizeCamera();}
  const snapshot=()=>({state,shot,line,records:{...records},verified:[...verified],checkingId,verificationComplete,feedbackShown,scanComplete,remedyShown,walkthroughEnded,recordsComplete,verificationPassed,stamped,activityComplete});
  function restoreState(saved){
    cancel();({state,shot,line,checkingId,verificationComplete,feedbackShown,scanComplete,remedyShown,walkthroughEnded,recordsComplete,verificationPassed,stamped,activityComplete}=saved);
    records=Object.freeze({...saved.records});verified=new Map(saved.verified);lockedUntil=0;
  }
  function resume(){if(['approach-observe','submit-observe'].includes(state)){stage.dataset.camera04Phase='stable';dialogue(shot,0);}}
  function debugJump(kind){start(undefined,{preview:true});if(kind==='verification'){shot='verification';env.background('verification04');verificationUI();}}
  return {start,cancel,reset,handle,advance,clickScene,snapshot,restoreState,resume,debugJump};
};
