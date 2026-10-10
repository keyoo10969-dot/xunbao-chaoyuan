(() => {
  const content = window.WalkthroughContent;
  const ui = window.WalkthroughUI;
  const assessment = window.WalkthroughAssessment;
  const stage = document.querySelector('#stage');
  const view = document.querySelector('#view');
  const backdrop = document.querySelector('#backdrop');
  const progress = document.querySelector('#progress');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let mode = 'opening', sceneIndex = 0, completed = 0, currentBackground = '', transitionId = 0;
  let activeTask = 0, activeTaskLabel = '当前', chapter02 = null, chapter03 = null, chapter04 = null, scanFollowup = {};
  Object.assign(content.assets, { hall02: window.Chapter02Data.assets.hall, heldCard02: window.Chapter02Data.assets.heldCard, doubtCard02: window.Chapter02Data.assets.doubt }, window.Chapter03Data.assets, window.Chapter04Data.assets);
  let timers = [], scanFinished = false, scanController = null, scanData = content.scan01;
  function later(fn, delay) { const id = setTimeout(fn, delay); timers.push(id); }
  function cancelTimers() { timers.forEach(clearTimeout); timers = []; }
  function updateProgress() {
    progress.innerHTML = ui.progress(content.tasks, completed, activeTask, activeTaskLabel);
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
  }
  function opening() {
    assessment.reset(); delete stage.dataset.assessedCount; delete stage.dataset.scanState; delete stage.dataset.reportEntered; stage.dataset.serviceVersion = 'V1';
    cancelTimers(); scanController?.cancel(); chapter02?.cancel(); chapter03?.cancel(); chapter04?.reset(); delete stage.dataset.recordCount; delete stage.dataset.camera; delete stage.dataset.chapter; delete stage.dataset.chapterState; activeTask = 0; activeTaskLabel = '当前'; transitionId++; mode = 'opening'; completed = 0; sceneIndex = 0;
    stage.classList.remove('frozen', 'transitioning'); background('opening');
    render(`<div class="opening-content"><p class="opening-kicker reveal" style="--delay:.15s">永乐宫推出一项新的自主导览活动</p><h1 class="opening-title reveal" style="--delay:.95s">寻宝朝元<span>《朝元图》的另一种打开方式</span></h1><p class="opening-subtitle reveal" style="--delay:1.55s">通过寻找《朝元图》中的 8 位主神，<br>带着目标去认识这幅壁画。</p><div class="persona reveal" style="--delay:2.15s"><span class="eyebrow">这一次，跟随她的视角</span><h2>小美</h2><p>第一次来到永乐宫 / 没有导游<br>缺乏道教艺术背景</p><blockquote>想知道《朝元图》到底“牛”在哪里。</blockquote></div><div class="reveal start-wrap" style="--delay:2.85s">${ui.button('开始体验', 'start')}<span class="duration">第一阶段 · 约 1 分钟</span></div></div>`, 'opening-view');
  }
  function showScene() {
    const scene = content.scenes[sceneIndex];
    if (scene.discovery) { enterDiscovery(scene); return; }
    delete stage.dataset.camera;
    mode = 'story';
    background(scene.background); render(ui.dialogue(scene), 'story-view');
  }
  function enterDiscovery(scene) {
    cancelTimers(); mode = 'discovery'; background('discovery');
    const timing = content.timing.discovery;
    stage.style.setProperty('--camera-push', `${timing.push}ms`);
    stage.style.setProperty('--discovery-reveal', `${timing.reveal}ms`);
    stage.dataset.camera = reducedMotion ? 'stable' : 'environment';
    render(`${ui.heading(scene)}<button class="text-button camera-skip" data-action="discovery-skip">跳过镜头动画 →</button>`, 'discovery-view');
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
      render(ui.dialogue(content.scenes[sceneIndex]), 'discovery-view');
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
  function handoff() {
    mode = 'handoff'; background('booth');
    render(`<div class="handoff-focus" aria-hidden="true"></div><div class="handoff-caption story-dialogue"><div class="speaker speaker--narrator">旁白</div><p>工作人员把寻宝卡递给小美。</p>${ui.button('继续', 'scan', 'continue--compact')}</div>`, 'handoff-view');
    later(enterScan, 1400);
  }
  function enterScan() {
    if (mode !== 'handoff') return;
    cancelTimers(); mode = 'scan-transition'; stage.classList.add('frozen');
    changeScene(() => { stage.classList.remove('frozen'); startScan(content.scan01); });
  }
  function startScan(data, followup = {}) {
    assessment.begin(data.number); stage.dataset.scanState = 'scanning';
    scanFollowup = followup;
    scanController?.cancel(); scanData = data; scanFinished = false;
    mode = 'scan'; background('scan'); render(ui.scan(data), 'scan-view');
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
      }
    });
    scanController.start();
  }
  function markQuestion(index) {
    const item = scanData.questions[index];
    const element = view.querySelector(`[data-question="${index}"]`);
    element.className = `question ${item.status}`;
    element.querySelector('.q-state').textContent = item.status === 'success' ? '✓' : '⚠';
    element.setAttribute('aria-label', `Q${index + 1} ${item.label} ${item.status === 'success' ? '成功' : '认知断点'}，查看依据`);
  }
  function showEvidence(index) {
    view.querySelectorAll('.question').forEach((element, i) => element.classList.toggle('selected', i === index));
    document.querySelector('#scan-panel').innerHTML = ui.evidence(scanData.questions[index], index);
  }
  function ending() { cancelTimers(); scanController?.cancel(); completed = 1; chapter02.start(); }
  function action(name) {
    if (stage.classList.contains('transitioning')) return;
    if (mode === 'chapter02') { chapter02.handle(name); return; }
    if (mode === 'chapter03') { chapter03.handle(name); return; }
    if (mode === 'chapter04') { chapter04.handle(name); return; }
    if (name === 'start' && mode === 'opening') changeScene(showScene);
    if (name === 'next' && (mode === 'story' || mode === 'discovery-ready')) { if (sceneIndex < content.scenes.length - 1) { sceneIndex++; const next = content.scenes[sceneIndex]; if (next.background !== currentBackground) changeScene(showScene); else showScene(); } else handoff(); }
    if (name === 'discovery-skip' && mode === 'discovery') finishDiscovery(true);
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
    if (event.repeat || !['ArrowRight', ' '].includes(event.key)) return;
    if (event.key === ' ' && event.target.closest('button')) return;
    event.preventDefault();
    if (mode === 'discovery') { finishDiscovery(true); return; }
    if (mode === 'chapter03') { if (!stage.classList.contains('transitioning')) chapter03.advance(); return; }
    if (mode === 'chapter04') { if (!stage.classList.contains('transitioning')) chapter04.advance(); return; }
    if (mode === 'chapter02') { if (!stage.classList.contains('transitioning')) chapter02.advance(); return; }
    const next = view.querySelector('.continue:not([hidden])') || view.querySelector('[data-action="scan"]') || view.querySelector('#scan-fast:not([hidden])');
    if (next) action(next.dataset.action);
  });
  stage.addEventListener('click', event => { if (mode === 'chapter04' && !event.target.closest('button') && !stage.classList.contains('transitioning')) chapter04.clickScene(); if (mode === 'chapter03' && !event.target.closest('button')) chapter03.clickScene(); if (mode === 'chapter02' && !event.target.closest('button')) chapter02.clickScene(); if (mode === 'discovery' && !event.target.closest('button')) finishDiscovery(true); });
  document.querySelector('#fullscreen').addEventListener('click', async () => {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await stage.requestFullscreen(); }
    catch { document.querySelector('#footer-hint').textContent = '请使用浏览器全屏功能展示'; }
  });
  document.addEventListener('fullscreenchange', () => document.querySelector('#fullscreen').setAttribute('aria-label', document.fullscreenElement ? '退出全屏' : '进入全屏'));
  chapter04 = window.createChapter04({
    stage, view, background, changeScene, crossfadeScene, scan: startScan, opening,
    cancelScan: () => { cancelTimers(); scanController?.cancel(); stage.querySelectorAll('.scene-crossfade').forEach(layer => layer.remove()); },
    setProgress: (done, current, label = '当前') => { completed = done; activeTask = current; activeTaskLabel = label; updateProgress(); },
    render: (html, className) => { mode = 'chapter04'; render(html, className); }
  });
  chapter03 = window.createChapter03({
    stage, view, background, changeScene, scan: startScan, opening,
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
  chapter02 = window.createChapter02({
    stage, view, background, changeScene, crossfadeScene, scan: startScan, enterChapter03: chapter03.start,
    cancelScan: () => { cancelTimers(); scanController?.cancel(); stage.querySelectorAll('.scene-crossfade').forEach(layer => layer.remove()); },
    setProgress: (done, current, label = '当前') => { completed = done; activeTask = current; activeTaskLabel = label; updateProgress(); },
    render: (html, className) => { mode = 'chapter02'; render(html, className); }
  });
  window.Chapter02Data.gods.forEach(god => { const image = new Image(); image.src = god.image; });
  Object.values(content.assets).forEach(source => { const image = new Image(); image.src = source; });
  opening();
})();
