/* 第二幕：原版卡片观察 → 扫描记录 → 携 V1 继续走查。旧 V2 设计资产保留。 */
window.createChapter02 = env => {
  const data = window.Chapter02Data, ui = window.WalkthroughUI, card = window.TreasureCard;
  const { stage, view } = env;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let state = '', issueIndex = 0, version = 1, side = 'front', closingIndex = 0, timers = [], flipping = false, zoomReturn = null;
  const later = (fn, delay) => { timers.push(setTimeout(fn, delay)); };
  function cancel() {
    timers.forEach(clearTimeout); timers = []; flipping = false;
    view.querySelector('dialog')?.close();
    stage.classList.remove('card-morphing'); delete stage.dataset.hallCamera;
  }
  function render(html, className = 'chapter02-view') {
    stage.dataset.chapterState = state;
    env.render(html, className); card.bindImages(view);
  }
  const scene = (location, text, label = '继续', action = 'chapter02-next') => ({ chapterLabel: '第二幕 / 认识目标', location, speaker: '小美', text, buttonLabel: label, buttonAction: action });
  const primary = (label, action) => ui.button(label, action, 'chapter-primary');
  const zoomButton = '<button class="text-button card-zoom-button" data-action="card-zoom">放大查看 ↗</button>';
  function cardTools(flipAction = '') {
    view.querySelector('.card-under-controls').innerHTML = (flipAction ? ui.button(flipAction === 'card-back' ? '翻到背面' : '返回正面', flipAction, flipAction === 'card-back' ? 'chapter-primary' : '') : '') + zoomButton;
  }
  const sideHeading = (tag, title, text) => `<span class="eyebrow">${tag}</span><h1>${title}</h1><p>${text}</p>`;
  function start() {
    cancel(); env.cancelScan(); env.setProgress(1, 1); stage.dataset.chapter = '2';
    state = 'approach'; version = 1; side = 'front'; issueIndex = 0; closingIndex = 0;
    env.background('hall02');
    stage.style.setProperty('--hall-push', `${data.cameraTiming.push}ms`);
    stage.dataset.hallCamera = reduced ? 'stable' : 'environment';
    render(`${ui.heading(scene('走向三清殿', ''))}<button class="text-button camera-skip" data-action="hall-skip">跳过镜头动画 →</button>`, 'chapter02-view approach-view');
    if (!reduced) later(() => { stage.dataset.hallCamera = 'pushing'; }, data.cameraTiming.environment);
    later(() => settleHall(false), reduced ? data.cameraTiming.environment : data.cameraTiming.environment + data.cameraTiming.push);
  }
  function settleHall(skip) {
    if (state !== 'approach') return;
    timers.forEach(clearTimeout); timers = [];
    if (skip) stage.style.setProperty('--hall-push', '350ms');
    stage.dataset.hallCamera = 'stable'; state = 'approach-settling';
    const reveal = () => {
      state = 'approach-ready';
      render(ui.dialogue(scene('走向三清殿', '“前面就是三清殿了，先看看卡上要找谁吧！”', '查看寻宝卡')), 'chapter02-view approach-view');
      const button = view.querySelector('.continue'); button.hidden = true;
      later(() => { button.hidden = false; }, reduced ? 0 : data.cameraTiming.reveal + data.cameraTiming.settle);
    };
    if (skip && !reduced) later(reveal, 350); else reveal();
  }
  function workspace(left, right, options = {}) {
    return `<div class="card-workspace"><aside class="card-notes">${left}</aside><div class="treasure-card-host" id="card-host">${side === 'front' ? card.front(data, version) : card.back(data)}${options.zoomBelowCard ? zoomButton : ''}</div><aside class="card-context" id="card-context">${right}</aside></div>${options.zoom === false || options.zoomBelowCard ? '' : `<div class="card-under-controls">${zoomButton}</div>`}`;
  }
  function cardBackdrop() { env.background('heldCard02'); delete stage.dataset.hallCamera; }
  function v1() {
    cancel(); state = 'v1-observe'; version = 1; side = 'front'; cardBackdrop();
    render(workspace(sideHeading('V1 / 原版寻宝卡', '认识八位主神', '先看看卡上要找谁。'), ui.dialogueBox(scene('查看寻宝卡', '“金母元君、玉皇大帝、东华帝君……原来要找的是这八位啊。”')), {zoomBelowCard:true}), 'chapter02-view card-view');
  }
  function showIssue(index) {
    cancel(); state = 'v1-issue'; issueIndex = index;
    env.background('doubtCard02');
    render(ui.dialogue(scene('小美对寻宝卡产生疑惑', data.issues[index])), 'chapter02-view doubt-view');
  }
  function beginScan() {
    cancel(); stage.classList.add('frozen');
    env.changeScene(() => { stage.classList.remove('frozen'); env.scan(data.scan, { label: '继续走查', action: 'continue-chapter02', onContinue: () => walkthroughClosing(0) }); });
  }
  function walkthroughClosing() {
    cancel(); state = 'v1-closing'; closingIndex = 0; version = 1; side = 'front';
    env.background('doubtCard02');
    render(ui.dialogue(scene('带着疑惑进入三清殿', data.walkthroughClosing[0], '进入三清殿', 'continue-hunt')), 'chapter02-view doubt-view');
  }
  function iteration() {
    // 保留后续设计展示资产，正常走查不调用本分支。
    cancel(); state = 'iteration-v1'; version = 1; side = 'front'; cardBackdrop();
    render(workspace(sideHeading('设计迭代 / V1 → V2', '从断点出发', '先确认问题，再修改寻宝卡。') + '<div class="iteration-issue"><b>Q2｜人物小图难以辨认</b><p>识别线索不足</p></div><div class="iteration-issue"><b>Q3｜缺乏人物身份和观看意义</b><p>理解支持不足</p></div>', `<div class="iteration-plan"><span class="eyebrow">这一轮，优化卡片本身</span><h2>让人物看得清，<br>让寻找有意义。</h2><p>放大画像<br>增加识别提示<br>背面补充身份与观看意义</p>${primary('继续', 'card-upgrade')}</div>`), 'chapter02-view card-view iteration-view');
  }
  function upgrade() {
    if (state !== 'iteration-v1') return;
    state = 'upgrading'; version = 2; stage.dataset.chapterState = state; stage.classList.add('card-morphing');
    const element = view.querySelector('.treasure-card'); card.upgrade(element);
    view.querySelector('#card-context').innerHTML = '<div class="iteration-plan"><span class="eyebrow">正在调整正面</span><h2>先放大画像，<br>再补充识别提示。</h2><button class="text-button" data-action="upgrade-fast">快速完成调整 →</button></div>';
    later(() => card.revealHints(element), reduced ? 0 : 650);
    later(upgradeFinished, reduced ? 0 : 1200);
  }
  function upgradeFinished() {
    if (state !== 'upgrading') return;
    timers.forEach(clearTimeout); timers = []; state = 'v2-front'; stage.dataset.chapterState = state;
    stage.classList.remove('card-morphing'); card.revealHints(view.querySelector('.treasure-card'));
    frontControls();
  }
  function frontControls() {
    view.querySelector('#card-context').innerHTML = `<div class="iteration-plan"><span class="eyebrow">V2 / 正面</span><h2>更大的画像，<br>可补充的特征。</h2><p>姓名、贴签位置和编号贴纸区均保留。</p><small>识别标签待你提供正式资料后统一核对。</small></div>`;
    cardTools('card-back');
  }
  function flip(to) {
    if (flipping || !['v2-front', 'v2-back'].includes(state)) return;
    flipping = true;
    const host = view.querySelector('#card-host'); host.classList.add('paper-flipping');
    const delay = reduced ? 0 : 180;
    later(() => {
      side = to; state = to === 'front' ? 'v2-front' : 'v2-back'; stage.dataset.chapterState = state;
      host.innerHTML = side === 'front' ? card.front(data, 2) : card.back(data); card.bindImages(host);
      if (side === 'front') frontControls();
      else view.querySelector('#card-context').innerHTML = `<div class="iteration-plan"><span class="eyebrow">V2 / 背面</span><h2>八个观察入口，<br>形成初步理解。</h2><p>他是谁？<br>为什么值得看？<br>顺便看看</p><small>前两位展示介绍结构与通用观察提示；身份资料仍待核对，其余六位待补充。</small><div class="card-control-stack">${primary('查看优化对比', 'card-compare')}</div></div>`;
      if (side === 'back') cardTools('card-front');
    }, delay);
    later(() => { host.classList.remove('paper-flipping'); flipping = false; }, reduced ? 0 : 360);
  }
  function compare() {
    cancel(); state = 'comparison';
    render(`<div class="comparison-heading"><span class="eyebrow">认知走查 → 设计迭代</span><h1>改了哪里，为什么改。</h1></div><div class="comparison-grid"><section><span class="comparison-version">V1</span><h2>初始设计</h2><p>人物缩略图小<br>仅有人物姓名<br>缺少理解说明</p><span class="comparison-tag">Q2 线索不足 · Q3 关联不清</span></section><section><span class="comparison-version">V2</span><h2>优化设计</h2><p>放大人物形象<br>增加识别特征<br>背面补充身份与观看意义</p><span class="comparison-tag">支持辨认 · 建立观看意义</span></section></div><div class="comparison-next">${primary('继续', 'chapter02-closing')}</div>`, 'chapter02-view comparison-view');
  }
  function closing(index = 0) {
    cancel(); state = 'closing'; version = 2; side = 'front'; closingIndex = index;
    render(workspace(sideHeading('V2 / 优化后的寻宝卡', '重新理解任务', '由认知走查发现问题，再用设计补充支持。'), ui.dialogueBox(scene('', data.closing[index], index === 0 ? '继续' : '进入三清殿', index === 0 ? 'chapter02-next' : 'enter-hall'))), 'chapter02-view card-view');
  }
  function nextChapter() {
    cancel(); env.setProgress(2, 2, '下一步'); state = 'chapter03-placeholder';
    if (typeof env.enterChapter03 === 'function') { env.enterChapter03(); return; }
    env.background('hall02');
    render(`<div class="ending-content"><span class="eyebrow">第二幕 · 认知问题已记录</span><div class="chapter-number">03</div><h1>寻找目标</h1><p>小美带着最初的 V1 寻宝卡进入三清殿，<br>准备在真实壁画中寻找八位主神。</p><span class="pending-label">下一幕：暗光环境中的人物寻找。</span>${primary('重新体验第二幕', 'restart-chapter02')}</div>`, 'chapter02-view ending-view');
  }
  function zoom() {
    if (view.querySelector('dialog')) return;
    zoomReturn = document.activeElement;
    const dialog = document.createElement('dialog'); dialog.className = 'card-zoom-dialog';
    dialog.setAttribute('aria-label', `V${version} 寻宝卡${side === 'front' ? '正面' : '背面'}放大查看`);
    dialog.innerHTML = `<button class="text-button zoom-close" autofocus>关闭放大查看 ×</button>${side === 'front' ? card.front(data,version) : card.back(data)}`;
    view.append(dialog); card.bindImages(dialog);
    const close = () => { dialog.close(); dialog.remove(); zoomReturn?.focus(); };
    dialog.querySelector('.zoom-close').addEventListener('click', close);
    dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
    dialog.addEventListener('click', event => { if (event.target === dialog) close(); });
    dialog.showModal();
  }
  function next() {
    if (view.querySelector('dialog[open]')) return;
    if (state === 'approach') { settleHall(true); return; }
    if (state === 'approach-ready') env.crossfadeScene(v1);
    else if (state === 'v1-observe') showIssue(0);
    else if (state === 'v1-issue') { if (issueIndex < data.issues.length - 1) showIssue(issueIndex + 1); else beginScan(); }
    else if (state === 'closing' && closingIndex === 0) closing(1);
  }
  function handle(action) {
    if (view.querySelector('dialog[open]')) return;
    if (action === 'chapter02-next') next();
    else if (action === 'hall-skip') settleHall(true);
    else if (action === 'v1-observe-next' && state === 'v1-observe') showIssue(0);
    else if (action === 'card-zoom') zoom();
    else if (action === 'card-upgrade') upgrade();
    else if (action === 'upgrade-fast') upgradeFinished();
    else if (action === 'card-back') flip('back');
    else if (action === 'card-front') flip('front');
    else if (action === 'card-compare' && state === 'v2-back') env.changeScene(compare);
    else if (action === 'chapter02-closing' && state === 'comparison') env.changeScene(() => closing(0));
    else if (action === 'enter-hall' && state === 'closing' && closingIndex === 1) env.changeScene(nextChapter);
    else if (action === 'continue-hunt' && state === 'v1-closing') env.changeScene(nextChapter);
    else if (action === 'restart-chapter02' && state === 'chapter03-placeholder') env.changeScene(start);
  }
  function advance() {
    if (view.querySelector('dialog[open]')) return;
    if (state === 'approach') { settleHall(true); return; }
    const button = view.querySelector('.chapter-primary:not([hidden])') || view.querySelector('.dialogue .continue:not([hidden])') || view.querySelector('[data-action="v1-observe-next"]');
    if (button) handle(button.dataset.action);
  }
  function clickScene() { if (state === 'approach') settleHall(true); }
  return { start, iteration, handle, advance, clickScene, cancel };
};
