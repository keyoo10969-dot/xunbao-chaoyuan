/* 第三幕：观察 → 记录认知断点 → 简洁过渡 → 记录总结。继续复用原场景与寻宝卡。 */
window.createChapter03 = env => {
  const data = window.Chapter03Data, gods = window.Chapter02Data, ui = window.WalkthroughUI, card = window.TreasureCard;
  const { stage, view } = env, example = data.teachingExample;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let state = '', shot = '', line = 0, records = {}, timers = [], zoomReturn = null;
  const later = (fn, delay) => timers.push(setTimeout(fn, delay));
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }
  function cancel() {
    clearTimers(); view.querySelector('dialog')?.close();
    delete stage.dataset.camera03; delete stage.dataset.camera03Phase; delete stage.dataset.hallCamera;
  }
  const primary = (label, action) => ui.button(label, action, 'chapter03-primary');
  const badge = () => '<div class="teaching-caption">教学示例 · 编号对应待核对 · 正确性等待核验</div>';
  const scene = (text, label = '继续', action = 'chapter03-next', speaker = '小美') => ({ chapterLabel: '第二幕 / 入殿寻宝', location:data.shots[shot]?.location || '寻找目标', speaker, text, buttonLabel:label, buttonAction:action });
  function render(html, className = 'chapter03-view') {
    stage.dataset.chapterState = state; stage.dataset.recordCount = Object.keys(records).length;
    env.render(html, className); card.bindImages(view);
  }
  function skipControl() { return ''; }
  function animateCamera(kind, duration) {
    stage.dataset.camera03 = kind; stage.dataset.camera03Phase = reduced ? 'stable' : 'pushing';
    stage.style.setProperty('--camera03-duration', `${duration}ms`);
    if (!reduced) later(() => {
      stage.dataset.camera03Phase = 'stable'; view.querySelector('[data-action="chapter03-camera-skip"]')?.remove();
    }, duration);
  }
  function start() {
    cancel(); env.cancelScan(); records = {}; shot = 'approach'; line = 0; state = 'approach';
    env.setProgress(2,2); stage.dataset.chapter = '3'; env.background('hall02');
    const timing = window.Chapter02Data.cameraTiming;
    stage.style.setProperty('--hall-push', `${timing.push}ms`); stage.dataset.hallCamera = reduced ? 'stable' : 'environment';
    const approach = {chapterLabel:'第二幕 / 入殿寻宝',location:'走向三清殿',speaker:'小美',text:''};
    render(ui.heading(approach) + '<button class="text-button camera-skip" data-action="chapter03-hall-skip">跳过镜头动画 →</button>', 'chapter03-view approach-view');
    if (!reduced) later(() => {stage.dataset.hallCamera = 'pushing';}, timing.environment);
    later(() => settleApproach(false), reduced ? timing.environment : timing.environment + timing.push);
  }
  function settleApproach(skip = false) {
    if (state !== 'approach') return;
    clearTimers(); state = 'approach-settling';
    const timing = window.Chapter02Data.cameraTiming;
    if (skip) stage.style.setProperty('--hall-push','350ms');
    stage.dataset.hallCamera = 'stable';
    const reveal = () => {
      state = 'approach-ready';
      render(ui.dialogue({chapterLabel:'第二幕 / 入殿寻宝',location:'走向三清殿',speaker:'小美',text:'“前面就是三清殿了，带着寻宝卡进去看看吧。”',buttonLabel:'进入三清殿',buttonAction:'chapter03-enter-interior'}), 'chapter03-view approach-view');
      const button = view.querySelector('.continue'); button.hidden = true;
      later(() => {button.hidden = false;}, reduced ? 0 : timing.reveal + timing.settle);
    };
    if (skip && !reduced) later(reveal,350); else reveal();
  }
  function enterInterior() {
    cancel(); env.cancelScan(); records = {}; shot = 'interior'; line = 0; state = 'interior-observe';
    env.setProgress(2, 2); stage.dataset.chapter = '3'; env.background('interior03');
    stage.dataset.camera03 = 'interior'; stage.dataset.camera03Phase = 'environment';
    render(ui.heading(scene('')), 'chapter03-view interior-view');
    later(() => { animateCamera('interior', data.timing.interior); showDialogue('interior', 0); }, data.timing.environment);
  }
  function enterShot(nextShot) {
    cancel(); shot = nextShot; line = 0;
    const setup = data.shots[shot];
    env.background(setup.background);
    animateCamera(setup.camera, data.timing[setup.camera]);
    if (shot === 'confused') {
      state = 'confused-observe';
      render(ui.heading(scene('')) + skipControl(), 'chapter03-view confused-view');
      later(() => showDialogue('confused', 0), data.timing.expression);
    } else showDialogue(shot, 0);
  }
  function showDialogue(nextShot, index) {
    shot = nextShot; line = index; state = `${shot}-dialogue`;
    const item = (shot === 'retry' ? data.walkthroughRetry : data.dialogues[shot])[index], text = typeof item === 'string' ? item : item.text;
    env.background(item.background || data.shots[shot]?.background);
    let label = '继续', action = 'chapter03-next';
    if (shot === 'interior' && index === data.dialogues.interior.length - 1) label = '开始寻宝';
    if (shot === 'retry' && index === data.walkthroughRetry.length - 1) label = '查看记录总结';
    render(ui.dialogue(scene(text, label, action, typeof item === 'string' ? '小美' : item.speaker)) + skipControl(), `chapter03-view ${shot}-view`);
  }

  function stabilizeCamera() {
    if (!['environment','pushing'].includes(stage.dataset.camera03Phase)) return;
    const observing = state.endsWith('-observe');
    clearTimers(); stage.style.setProperty('--camera03-duration', '350ms'); stage.dataset.camera03Phase = 'stable';
    view.querySelector('[data-action="chapter03-camera-skip"]')?.remove();
    if (observing) showDialogue(shot, 0);
  }
  function beginScan() {
    cancel(); state = 'scan'; stage.classList.add('frozen');
    env.changeScene(() => { stage.classList.remove('frozen'); env.scan(data.scan, { label:'继续走查', action:'continue-chapter03', onContinue:nextChapter }); });
  }
  function continueRecording() {
    cancel(); shot = 'retry'; env.background('confused03'); showDialogue('retry',0);
  }
  function progress() {
    cancel(); state = 'progress-complete';
    records = { ...example.recordedNumbers };
    render(`<div class="record-summary"><div class="record-card"><div class="treasure-card-host">${card.front(gods,window.WalkthroughAssessment.cardVersion,{records,footnote:'编号已记录，匹配正确性待工作人员核验。'})}</div><button class="text-button" data-action="chapter03-card-zoom">放大查看 ↗</button></div><section class="record-explanation"><span class="eyebrow">编号记录完成 · 等待核验</span><h1 id="record-count">8 / 8 已记录</h1><p>编号记录已完成，进度可见，匹配正确性等待工作人员检验</p>${primary('继续走查','chapter03-complete')}</section></div>${badge()}`, 'chapter03-view record-view');
  }
  function nextChapter() {
    cancel(); env.setProgress(3,3,'下一步'); state = 'chapter04-placeholder';
    if (typeof env.enterChapter04 === 'function') { env.enterChapter04(records); return; }
    env.background('booth');
    render(`<div class="ending-content"><span class="eyebrow">第二幕 · 走查与记录完成</span><div class="chapter-number">03</div><h1>提交核验</h1><p>小美带着填满编号的原版寻宝卡，来到殿后核对点，请工作人员核验。</p><span class="pending-label">下一幕：核对记录是否正确。</span>${primary('重新体验第三幕','restart-chapter03')}<button class="text-button chapter03-home" data-action="chapter03-home">返回首页 →</button></div>`, 'chapter03-view ending-view');
  }
  function zoom() {
    if (view.querySelector('dialog')) return;
    zoomReturn = document.activeElement;
    const dialog = document.createElement('dialog'); dialog.className = 'card-zoom-dialog'; dialog.setAttribute('aria-label',`已记录编号的 V${window.WalkthroughAssessment.cardVersion} 寻宝卡放大查看`);
    dialog.innerHTML = `<button class="text-button zoom-close" autofocus>关闭放大查看 ×</button>${card.front(gods,window.WalkthroughAssessment.cardVersion,{records,footnote:'已记录的编号尚未经过工作人员核验。'})}`;
    view.append(dialog); card.bindImages(dialog);
    const close = () => { dialog.close(); dialog.remove(); zoomReturn?.focus(); };
    dialog.querySelector('.zoom-close').addEventListener('click',close);
    dialog.addEventListener('cancel',event => { event.preventDefault(); close(); }); dialog.showModal();
  }
  function next() {
    if (!state.endsWith('-dialogue')) return;
    const lines = shot === 'retry' ? data.walkthroughRetry : data.dialogues[shot];
    if (line < lines.length - 1) {
      const currentBackground = lines[line].background || data.shots[shot]?.background;
      const nextBackground = lines[line + 1].background || data.shots[shot]?.background;
      if (currentBackground !== nextBackground) { cancel(); env.changeScene(() => showDialogue(shot,line+1)); }
      else showDialogue(shot,line+1);
      return;
    }
    if (shot === 'retry') { env.changeScene(progress); return; }
    const nextShot = data.sequence[data.sequence.indexOf(shot) + 1];
    if (nextShot) env.changeScene(() => enterShot(nextShot)); else env.changeScene(continueRecording);
  }

  function handle(action, payload) {
    if (view.querySelector('dialog[open]')) return;
    if (action === 'chapter03-hall-skip') settleApproach(true);
    else if (action === 'chapter03-enter-interior' && state === 'approach-ready') env.changeScene(enterInterior);
    else if (action === 'chapter03-next') next();
    else if (action === 'chapter03-camera-skip') stabilizeCamera();
    else if (action === 'chapter03-complete' && state === 'progress-complete') beginScan();
    else if (action === 'restart-chapter03' && state === 'chapter04-placeholder') env.changeScene(start);
    else if (action === 'chapter03-home' && state === 'chapter04-placeholder') env.changeScene(env.opening);
    else if (action === 'chapter03-card-zoom' && state === 'progress-complete') zoom();
  }
  function advance() {
    if (view.querySelector('dialog[open]')) return;
    if (state === 'approach') { settleApproach(true); return; }
    if (state.endsWith('-observe')) { stabilizeCamera(); return; }
    const button = view.querySelector('.chapter03-primary:not([hidden])') || view.querySelector('.dialogue .continue:not([hidden])');
    if (button) handle(button.dataset.action);
  }
  function clickScene() { if (state === 'approach') settleApproach(true); else if (state.endsWith('-observe')) stabilizeCamera(); }
  const snapshot = () => ({state,shot,line,records:{...records}});
  function restoreState(saved) {cancel();({state,shot,line}=saved);records={...saved.records};}
  function resume() {
    if (['approach','approach-settling'].includes(state)) {state='approach';settleApproach(true);}
    else if (state.endsWith('-observe')) {stage.dataset.camera03Phase='stable';showDialogue(shot,0);}
  }
  function debugJump(kind,index) {
    start();
    if(kind==='interior')enterInterior();
    else if(kind==='shot'&&data.sequence.includes(index))enterShot(index);
    else if(kind==='records'){cancel();env.background('confused03');progress();}
  }
  return { start, cancel, handle, advance, clickScene, snapshot, restoreState, resume, debugJump };
};
