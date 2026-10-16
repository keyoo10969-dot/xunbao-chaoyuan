(() => {
  const content = window.WalkthroughContent;
  const ui = window.WalkthroughUI;
  const assessment = window.WalkthroughAssessment;
  const stage = document.querySelector('#stage');
  const view = document.querySelector('#view');
  const backdrop = document.querySelector('#backdrop');
  const progress = document.querySelector('#progress');
  const history = new window.NavigationHistory();
  let restoring = false, debugBuilding = false, debugSession = false, evidenceIndex = null;
  let cardReceived = false, cardReviewed = false;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let mode = 'opening', sceneIndex = 0, completed = 0, currentBackground = '', transitionId = 0;
  let activeTask = 0, activeTaskLabel = '当前', chapter02 = null, chapter03 = null, chapter04 = null, scanFollowup = {};
  Object.assign(content.assets, { hall02: window.Chapter02Data.assets.hall, heldCard02: window.Chapter02Data.assets.heldCard, doubtCard02: window.Chapter02Data.assets.doubt }, window.Chapter03Data.assets, window.Chapter04Data.assets);
  let firstCardLine = 0, firstCardZoomReturn = null;
  // 章节模块仍沿用原内部编号；只映射界面进度，不影响原扫描数据与样式选择器。
  const chapterIndex = value => value < 2 ? value : value - 1;
  let timers = [], scanFinished = false, scanController = null, scanData = content.scan01;
  function later(fn, delay) { const id = setTimeout(fn, delay); timers.push(id); }
  function cancelTimers() { timers.forEach(clearTimeout); timers = []; }
  function updateProgress() {
    progress.innerHTML = ui.progress(content.tasks, chapterIndex(completed), chapterIndex(activeTask), activeTaskLabel);
    const isVerificationChapter = stage.dataset.chapter === '4';
    progress.setAttribute('aria-label', isVerificationChapter ? '认知走查节点进度' : '任务进度');
    if (isVerificationChapter) {
      progress.title = '表示走查节点已检视，不代表寻宝挑战完成';
      progress.querySelectorAll('.done .sr-only').forEach(el => el.textContent = '已走查');
    } else progress.removeAttribute('title');
  }
  function background(key) {
    if (key === currentBackground) return;
    currentBackground = key;
    stage.dataset.background = key;
    const source = content.assets[key];
    backdrop.style.backgroundImage = `url("${source}")`;
    const probe = new Image();
    probe.onerror = () => { if (currentBackground === key) backdrop.style.backgroundImage = 'none'; };
    probe.src = source;
  }
  function render(html, className) {
    stage.dataset.mode = mode;
    view.className = `view ${className}`;
    view.innerHTML = html;
    updateProgress();
    rememberNode();
  }
  function opening() {
    history.clear(); debugSession = false; cardReceived = cardReviewed = false;
    delete stage.dataset.cardReceived;
    firstCardLine = 0;
    assessment.reset(); delete stage.dataset.assessedCount; delete stage.dataset.scanState; delete stage.dataset.reportEntered; stage.dataset.serviceVersion = 'V1';
    cancelTimers(); scanController?.cancel(); chapter02?.cancel(); chapter03?.cancel(); chapter04?.reset(); delete stage.dataset.recordCount; delete stage.dataset.camera; delete stage.dataset.chapter; delete stage.dataset.chapterState; activeTask = 0; activeTaskLabel = '当前'; transitionId++; mode = 'opening'; completed = 0; sceneIndex = 0;
    stage.classList.remove('frozen', 'transitioning'); background('opening');
    render(`<div class="opening-content"><p class="opening-kicker reveal" style="--delay:.15s">假设永乐宫推出一项新的自主导览活动</p><h1 class="opening-title reveal" style="--delay:.95s">寻宝朝元</h1><p class="opening-subtitle reveal" style="--delay:1.55s">根据寻宝卡中的线索，在《朝元图》中识别8位指定人物，完成寻宝任务。</p><div class="persona reveal" style="--delay:2.15s"><span class="eyebrow">这一次，跟随她的视角</span><h2>小美</h2><p>首次到访 · 无导游陪同 · 缺乏道教人物相关知识</p></div><div class="reveal start-wrap" style="--delay:2.85s">${ui.button('开始体验', 'start')}<span class="duration">第一阶段 · 约 1 分钟</span></div></div>`, 'opening-view');
  }
  function showScene() {
    const scene = content.scenes[sceneIndex];
    stage.dataset.chapter = '1';
    if (scene.discovery) { enterDiscovery(scene); return; }
    delete stage.dataset.camera;
    mode = 'story';
    background(scene.background);
    const shown = scene.buttonAction === 'claim-card' && cardReceived ? {...scene,buttonLabel:'查看寻宝卡',buttonAction:'first-card-open'} : scene;
    render(ui.dialogue(shown), 'story-view self-service-view');
  }
  function enterDiscovery(scene) {
    cancelTimers(); mode = 'discovery'; background(content.scenes[sceneIndex].background);
    const timing = content.timing.discovery;
    stage.style.setProperty('--camera-push', `${timing.push}ms`);
    stage.style.setProperty('--discovery-reveal', `${timing.reveal}ms`);
    stage.dataset.camera = reducedMotion ? 'stable' : 'environment';
    render(`${ui.heading(scene)}<button class="text-button camera-skip" data-action="discovery-skip">跳过镜头动画 →</button>`, 'discovery-view self-service-view');
    if (reducedMotion) { later(finishDiscovery, timing.environment); return; }
    later(() => { stage.dataset.camera = 'pushing'; }, timing.environment);
    later(finishDiscovery, timing.environment + timing.push);
  }
  function finishDiscovery(skip = false) {
    if (mode !== 'discovery') return;
    cancelTimers();
    if (skip) stage.style.setProperty('--camera-push', '350ms');
    stage.dataset.camera = 'stable'; mode = 'discovery-settling';
    const reveal = () => {
      mode = 'discovery-ready';
      const timing = content.timing.discovery;
      render(ui.dialogue(content.scenes[sceneIndex]), 'discovery-view self-service-view');
      const next = view.querySelector('.continue'); next.hidden = true;
      later(() => { next.hidden = false; }, reducedMotion ? 0 : timing.reveal + timing.settle);
    };
    if (skip && !reducedMotion) later(reveal, 350); else reveal();
  }
  function changeScene(fn) {
    const token = ++transitionId;
    stage.classList.add('transitioning');
    later(() => { if (token !== transitionId) return; fn(); stage.classList.remove('transitioning'); }, reducedMotion ? 0 : 350);
  }
  function crossfadeScene(fn) {
    const layer = document.createElement('div');
    layer.className = 'scene-crossfade';
    layer.style.backgroundImage = backdrop.style.backgroundImage;
    // 第四幕照片中的旧章纹遮挡也随原画面淡出，避免转场露出。
    if (mode === 'chapter04') {
      const sign = view.querySelector('.photo-card-sign');
      if (sign) {
        const copy = sign.cloneNode(true);
        copy.style.top = `calc(${getComputedStyle(sign).top} + 6.5cqw)`;
        layer.append(copy);
      }
    }
    stage.append(layer);
    changeScene(() => {
      fn();
      layer.classList.add('fading');
      later(() => layer.remove(), 700);
    });
  }
  function claimCard() {
    if (mode !== 'story' || sceneIndex !== content.scenes.length - 1) return;
    if (cardReceived) { showFirstCard(firstCardLine); return; }
    cardReceived = true; stage.dataset.cardReceived = 'true';
    crossfadeScene(handoff);
  }
  function handoff() {
    cancelTimers(); mode = 'handoff'; stage.dataset.chapter = '1'; background('card01');
    render(`<div class="received-card"><span class="eyebrow">自助领取完成</span><h2>寻宝卡已领取</h2>${ui.button('查看寻宝卡','first-card-open')}</div>`, 'story-view self-service-view received-view');
  }
  function stowCard() {
    if (mode !== 'first-card') return;
    if (!cardReviewed) { handoff(); return; }
    mode = 'card-stowed'; background('card01');
    render(ui.dialogue({chapterLabel:'第一幕 / 参加活动',location:'准备出发',speaker:'小美',text:'“明白啦，那就去三清殿找找看！”',buttonLabel:'继续',buttonAction:'scan'}) + '<button class="text-button card-reopen" data-action="first-card-open">查看寻宝卡 ↗</button>', 'story-view self-service-view');
  }
  function showFirstCard(index = 0) {
    if (!cardReceived) return;
    cancelTimers(); firstCardLine = index; mode = 'first-card'; background('card01');
    if (index === content.firstCardDialogues.length - 1) cardReviewed = true;
    const item = content.firstCardDialogues[index], last = index === content.firstCardDialogues.length - 1;
    const scene = {chapterLabel:'第一幕 / 参加活动',location:'领取并了解寻宝卡',speaker:item.speaker,text:item.text,buttonLabel:last?'收起寻宝卡':'继续',buttonAction:last?'card-stow':'first-card-next'};
    render(`<div class="card-workspace"><aside class="card-notes"><span class="eyebrow">第一幕 / 参加活动</span><h1>领取并了解寻宝卡</h1><p>寻找八位人物，记录对应编号。</p></aside><div class="treasure-card-host">${window.TreasureCard.front(window.Chapter02Data,1)}<button class="text-button card-zoom-button" data-action="first-card-zoom">放大查看 ↗</button></div><aside class="card-context">${ui.dialogueBox(scene)}</aside></div>${last ? '' : '<button class="text-button card-close" data-action="card-stow">收起寻宝卡 · 返回剧情</button>'}`, 'story-view card-view first-card-view');
    window.TreasureCard.bindImages(view);
  }
  function zoomFirstCard() {
    if (view.querySelector('dialog')) return;
    firstCardZoomReturn = document.activeElement;
    const dialog = document.createElement('dialog'); dialog.className = 'card-zoom-dialog'; dialog.setAttribute('aria-label','原版寻宝卡放大查看');
    dialog.innerHTML = `<button class="text-button zoom-close" autofocus>关闭放大查看 ×</button>${window.TreasureCard.front(window.Chapter02Data,1)}`;
    view.append(dialog); window.TreasureCard.bindImages(dialog);
    const close = () => { dialog.close(); dialog.remove(); firstCardZoomReturn?.focus(); };
    dialog.querySelector('.zoom-close').addEventListener('click',close);
    dialog.addEventListener('cancel',event => {event.preventDefault();close();}); dialog.showModal();
  }
  function enterScan() {
    if (mode !== 'card-stowed' || !cardReceived || !cardReviewed) return;
    cancelTimers(); mode = 'scan-transition'; stage.classList.add('frozen');
    changeScene(() => { stage.classList.remove('frozen'); startScan(content.scan01); });
  }
  function startScan(data, followup = {}, resumeFinished = false) {
    evidenceIndex = null;
    assessment.begin(data.number); stage.dataset.scanState = 'scanning';
    scanFollowup = followup;
    scanController?.cancel(); scanData = data; scanFinished = false;
    mode = 'scan'; background('scan'); render(ui.scan({...data, number:({'01':'01','03':'02','04':'03'})[data.number] || data.number, node:({'01':'参加活动','03':'入殿寻宝','04':'提交核验'})[data.number] || data.node}), 'scan-view');
    // 原样式按内部扫描ID选择，显示编号与样式ID分别映射。
    view.querySelector('.scan-outcome').dataset.scanNumber = data.number;
    stage.style.setProperty('--scan-light', `${content.timing.scan.light}ms`);
    stage.style.setProperty('--scan-result', `${content.timing.scan.result}ms`);
    scanController = new window.CognitiveScanController(data, content.timing.scan, {
      onStart: index => {
        const element = view.querySelector(`[data-question="${index}"]`);
        element.className = 'question scanning';
        view.querySelector('.scan-aura').dataset.pulse = String(index);
        document.querySelector('#scan-status').textContent = `正在检视 Q${index + 1} · ${data.questions[index].label}`;
      },
      onMark: markQuestion,
      onAll: () => {
        document.querySelector('#scan-status').textContent = '四问检视完成';
      },
      onResult: () => {
        const panel = document.querySelector('#scan-panel'); panel.hidden = false;
        panel.innerHTML = ui.result(data.result);
      },
      onButton: () => {
        assessment.record(data.number); stage.dataset.assessedCount = String(assessment.stats().nodes); stage.dataset.scanState = 'recorded';
        scanFinished = true;
        view.querySelectorAll('.question').forEach(element => { element.disabled = false; });
        document.querySelector('#scan-status').textContent = '检视完成 · 可点击四问查看判断依据';
        document.querySelector('#scan-fast').hidden = true;
        document.querySelector('#scan-next').innerHTML = ui.button(followup.label || '继续走查', followup.action || 'complete');
        rememberNode();
      }
    });
    if (resumeFinished) scanController.fastForward(); else scanController.start();
  }
  function markQuestion(index) {
    const item = scanData.questions[index];
    const element = view.querySelector(`[data-question="${index}"]`);
    element.className = `question ${item.status}`;
    element.querySelector('.q-state').textContent = item.status === 'success' ? '✓' : '⚠';
    element.setAttribute('aria-label', `Q${index + 1} ${item.label} ${item.status === 'success' ? '成功' : '认知断点'}，查看依据`);
  }
  function showEvidence(index) {
    evidenceIndex = index;
    view.querySelectorAll('.question').forEach((element, i) => element.classList.toggle('selected', i === index));
    document.querySelector('#scan-panel').innerHTML = ui.evidence(scanData.questions[index], index); rememberNode();
  }
  function ending() {
    cancelTimers(); scanController?.cancel(); completed = 1;
    chapter03.start();
  }
  function action(name) {
    if (stage.classList.contains('transitioning')) return;
    if (mode === 'chapter02') { chapter02.handle(name); return; }
    if (mode === 'chapter03') { chapter03.handle(name); return; }
    if (mode === 'chapter04') { chapter04.handle(name); return; }
    if (name === 'start' && mode === 'opening') changeScene(showScene);
    if (name === 'next' && (mode === 'story' || mode === 'discovery-ready')) { if (sceneIndex < content.scenes.length - 1) { sceneIndex++; const next = content.scenes[sceneIndex]; if (next.background !== currentBackground) changeScene(showScene); else showScene(); } else handoff(); }
    if (name === 'discovery-skip' && mode === 'discovery') finishDiscovery(true);
    if (view.querySelector('dialog[open]')) return;
    if (name === 'claim-card') claimCard();
    if (name === 'first-card-open' && ['handoff','card-stowed','story'].includes(mode) && cardReceived) crossfadeScene(() => showFirstCard(firstCardLine));
    if (name === 'card-stow') stowCard();
    if (name === 'first-card-next' && mode === 'first-card' && firstCardLine < content.firstCardDialogues.length - 1) showFirstCard(firstCardLine + 1);
    if (name === 'first-card-zoom' && mode === 'first-card') zoomFirstCard();
    if (name === 'scan') enterScan();
    if (name === 'scan-fast' && mode === 'scan') scanController.fastForward();
    if (name === (scanFollowup.action || 'complete') && mode === 'scan' && scanFinished) { changeScene(scanFollowup.onContinue || ending); return; }
    if (name === 'result' && mode === 'scan') { view.querySelectorAll('.question').forEach(element => element.classList.remove('selected')); document.querySelector('#scan-panel').innerHTML = ui.result(scanData.result); }
    if (name === 'restart' && mode === 'ending') opening();
  }
  function chapter03Action(control) {
    if (stage.classList.contains('transitioning')) return;
    if (control.dataset.action) chapter03.handle(control.dataset.action, control.dataset.number);
  }
  view.addEventListener('click', event => {
    const control = event.target.closest('[data-action], [data-question]');
    if (control?.dataset.action === 'navigation-previous') {goPrevious();return;}
    if (mode === 'chapter04') {
      if (stage.classList.contains('transitioning')) return;
      if (control && !control.disabled) chapter04.handle(control.dataset.action);
      else if (!control) chapter04.clickScene();
      return;
    }
    if (mode === 'chapter03') {
      if (control && !control.disabled) chapter03Action(control);
      else if (!control) chapter03.clickScene();
      return;
    }
    if (!control && mode === 'chapter02') { chapter02.clickScene(); return; }
    if (!control && mode === 'discovery') { finishDiscovery(true); return; }
    if (!control || control.disabled) return;
    if (control.dataset.question !== undefined) { if (scanFinished) showEvidence(Number(control.dataset.question)); return; }
    action(control.dataset.action);
  });
  document.addEventListener('keydown', event => {
    if (event.target.closest('.developer-navigation') || view.querySelector('dialog[open]') || event.repeat || !['ArrowRight', ' '].includes(event.key)) return;
    if (event.key === ' ' && event.target.closest('button')) return;
    event.preventDefault();
    if (mode === 'discovery') { finishDiscovery(true); return; }
    if (mode === 'chapter03') { if (!stage.classList.contains('transitioning')) chapter03.advance(); return; }
    if (mode === 'chapter04') { if (!stage.classList.contains('transitioning')) chapter04.advance(); return; }
    if (mode === 'chapter02') { if (!stage.classList.contains('transitioning')) chapter02.advance(); return; }
    const next = view.querySelector('.continue:not([hidden])') || view.querySelector('[data-action="scan"]') || view.querySelector('#scan-fast:not([hidden])');
    if (next) action(next.dataset.action);
  });
  stage.addEventListener('click', event => { if(event.target.closest('.developer-navigation'))return; if (mode === 'chapter04' && !event.target.closest('button') && !stage.classList.contains('transitioning')) chapter04.clickScene(); if (mode === 'chapter03' && !event.target.closest('button')) chapter03.clickScene(); if (mode === 'chapter02' && !event.target.closest('button')) chapter02.clickScene(); if (mode === 'discovery' && !event.target.closest('button')) finishDiscovery(true); });
  document.querySelector('#fullscreen').addEventListener('click', async () => {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await stage.requestFullscreen(); }
    catch { document.querySelector('#footer-hint').textContent = '请使用浏览器全屏功能展示'; }
  });
  document.addEventListener('fullscreenchange', () => document.querySelector('#fullscreen').setAttribute('aria-label', document.fullscreenElement ? '退出全屏' : '进入全屏'));
  chapter04 = window.createChapter04({
    stage, view, background, changeScene, crossfadeScene, scan: startScan, opening, checkpoint:rememberNode,
    cancelScan: () => { cancelTimers(); scanController?.cancel(); stage.querySelectorAll('.scene-crossfade').forEach(layer => layer.remove()); },
    setProgress: (done, current, label = '当前') => { completed = done; activeTask = current; activeTaskLabel = label; updateProgress(); },
    render: (html, className) => { mode = 'chapter04'; render(html, className); }
  });
  chapter03 = window.createChapter03({
    stage, view, background, changeScene, scan: startScan, opening, checkpoint:rememberNode,
    enterChapter04: records => {
      const previousImage = backdrop.style.backgroundImage;
      chapter04.start(records);
      const layer = document.createElement('div'); layer.className = 'scene-crossfade'; layer.style.backgroundImage = previousImage; stage.append(layer);
      requestAnimationFrame(() => requestAnimationFrame(() => layer.classList.add('fading')));
      later(() => layer.remove(), 700);
    },
    cancelScan: () => { cancelTimers(); scanController?.cancel(); stage.querySelectorAll('.scene-crossfade').forEach(layer => layer.remove()); },
    setProgress: (done, current, label = '当前') => { completed = done; activeTask = current; activeTaskLabel = label; updateProgress(); },
    render: (html, className) => { mode = 'chapter03'; render(html, className); }
  });
  function nodeKey() {
    if(['story','discovery','discovery-ready','discovery-settling'].includes(mode))return `story:${sceneIndex}`;
    if(mode==='first-card')return `first-card:${firstCardLine}`;
    if(mode==='scan')return `scan:${scanData.number}`;
    if(mode==='chapter03'){
      const s=chapter03.snapshot();
      // 镜头等待与随后的第一句对白是同一剧情节点，避免返回后又重建当前页。
      if(s.shot==='approach')return 'chapter03:approach';
      if(s.state.endsWith('-observe'))return `chapter03:${s.shot}:0`;
      return `chapter03:${s.shot}:${s.state.endsWith('-dialogue')?s.line:s.state}`;
    }
    if(mode==='chapter04'){const s=chapter04.snapshot();return `chapter04:${s.state}:${s.line}`;}
    return mode;
  }
  function captureNode(){
    const clone=view.cloneNode(true);clone.querySelectorAll('.navigation-previous,dialog').forEach(el=>el.remove());
    const fourthState=chapter04?.snapshot();
    if(mode==='chapter04')clone.querySelectorAll('.chapter04-primary,.dialogue .continue').forEach(button=>{button.disabled=button.dataset.action==='chapter04-end'&&fourthState.walkthroughEnded;});
    return {mode,sceneIndex,completed,activeTask,activeTaskLabel,cardReceived,cardReviewed,firstCardLine,
      background:currentBackground,html:clone.innerHTML,viewClass:view.className,dataset:{...stage.dataset},style:stage.getAttribute('style'),
      chapter03:chapter03?.snapshot(),chapter04:chapter04?.snapshot(),assessment:assessment.snapshot(),scanData,scanFollowup,scanFinished,evidenceIndex,debugSession};
  }
  function decorateNavigation(){
    view.querySelectorAll('.navigation-previous').forEach(el=>el.remove());
    if(history.canBack){
      const button=document.createElement('button');button.className='text-button navigation-previous';button.dataset.action='navigation-previous';button.textContent='← 上一步';
      const dialogue=view.querySelector('.story-dialogue');
      const group=view.querySelector('.action-navigation,.scan-actions,.walkthrough-v2-report footer,.record-explanation,.verification-copy');
      if(dialogue)dialogue.append(button);else if(mode==='scan'){button.classList.add('navigation-previous--floating','navigation-previous--scan');view.append(button);}else if(group)group.append(button);else{button.classList.add('navigation-previous--floating');view.append(button);}
    }
    stage.dataset.navigationNode=history.current?.key||'';
    stage.dataset.navigationDepth=String(history.items.length);
    stage.dataset.cardReceived=String(cardReceived);
    stage.dataset.stateSource=debugSession?'debug-simulation':'normal-play';
    stage.querySelector('.debug-state-banner')?.remove();
    if(debugSession){const banner=document.createElement('div');banner.className='debug-state-banner';banner.textContent='调试模拟状态 · 不计作正常游玩记录';stage.append(banner);}
  }
  function rememberNode(){
    if(!restoring&&!debugBuilding)history.remember(nodeKey(),captureNode());
    decorateNavigation();
  }
  function stopForNavigation(){
    transitionId++;cancelTimers();scanController?.cancel();chapter02?.cancel();chapter03?.cancel();chapter04?.cancel();
    stage.querySelectorAll('.scene-crossfade').forEach(el=>el.remove());stage.classList.remove('transitioning','frozen','card-morphing');
  }
  function goPrevious(){
    if(view.querySelector('dialog[open]'))return;
    const saved=history.back();if(!saved)return;
    restoring=true;stopForNavigation();
    const alreadyReceived = cardReceived, alreadyReviewed = cardReviewed;
    ({mode,sceneIndex,completed,activeTask,activeTaskLabel,cardReceived,cardReviewed,firstCardLine,scanData,scanFollowup,scanFinished,evidenceIndex,debugSession}=saved);
    cardReceived ||= alreadyReceived; cardReviewed ||= alreadyReviewed;
    chapter03.restoreState(saved.chapter03);chapter04.restoreState(saved.chapter04);assessment.restore(saved.assessment);
    for(const key of Object.keys(stage.dataset))delete stage.dataset[key];Object.assign(stage.dataset,saved.dataset);
    if(saved.style===null)stage.removeAttribute('style');else stage.setAttribute('style',saved.style);
    currentBackground='';background(saved.background);view.className=saved.viewClass;view.innerHTML=saved.html;window.TreasureCard.bindImages(view);updateProgress();
    for(const attr of ['camera','camera03Phase','camera04Phase','hallCamera'])if(stage.dataset[attr])stage.dataset[attr]='stable';
    if(mode==='scan'){startScan(scanData,scanFollowup,scanFinished);if(saved.evidenceIndex!==null)showEvidence(saved.evidenceIndex);}
    else if(mode==='story')showScene();
    else if(mode==='handoff')handoff();
    else if(mode==='chapter03')chapter03.resume();
    else if(mode==='chapter04')chapter04.resume();
    else if(mode.startsWith('discovery')){mode='discovery-ready';view.innerHTML=ui.dialogue(content.scenes[sceneIndex]);}
    view.classList.add('navigation-restored');restoring=false;rememberNode();view.querySelector('.navigation-previous')?.focus();
  }
  function setupDeveloperNavigation(){
    if(!window.NavigationHistory.isLocal(location))return;
    const panel=document.createElement('details');panel.className='developer-navigation';
    const nodes=[...content.scenes.map((scene,index)=>[`story:${index}`,`第一幕 · ${scene.location} / ${index+1} ${scene.speaker}`]),['handoff','第一幕 · 领取寻宝卡'],['first-card','第一幕 · 查看寻宝卡'],['approach','第二幕 · 走向三清殿'],['interior','第二幕 · 进入大殿'],...window.Chapter03Data.sequence.filter(shot=>shot!=='interior').map(shot=>[`shot:${shot}`,`第二幕 · ${window.Chapter03Data.shots[shot].location}`]),['records','第二幕 · 编号记录总结'],['submit','第三幕 · 提交核验'],['verification','第三幕 · 开始核验']];
    panel.innerHTML=`<summary>开发调试</summary><label>跳转节点<select aria-label="调试跳转节点">${nodes.map(([value,label])=>`<option value="${value}">${ui.escape(label)}</option>`).join('')}</select></label><button class="text-button" type="button">跳转（模拟状态） →</button><small>跳转会重置本轮记录与返回历史。重开游戏可退出模拟状态。</small>`;
    panel.querySelector('button').addEventListener('click',()=>debugJump(panel.querySelector('select').value));stage.append(panel);
  }
  function debugJump(target){
    if(!window.NavigationHistory.isLocal(location))return;
    debugBuilding=true;stopForNavigation();opening();history.clear();debugSession=true;
    const kind=target.split(':')[0];
    if(kind==='story'){sceneIndex=Number(target.split(':')[1]);showScene();}
    else if(kind==='handoff'){cardReceived=true;handoff();}
    else {
      cardReceived=true;stage.dataset.cardReceived='true';
      if(kind==='first-card')showFirstCard(0);
      else if(['approach','interior','shot','records'].includes(kind))chapter03.debugJump(kind,kind==='shot'?target.split(':')[1]:0);
      else chapter04.debugJump(kind);
    }
    debugBuilding=false;rememberNode();
  }
  window.Chapter02Data.gods.forEach(god => { const image = new Image(); image.src = god.image; });
  Object.values(content.assets).forEach(source => { const image = new Image(); image.src = source; });
  opening();
  setupDeveloperNavigation();
})();
