/* 同一张卡片组件：V1 → V2 改变属性与内容可见性，保留人物节点。 */
window.TreasureCard = (() => {
  const ui = window.WalkthroughUI;
  function portrait(god) {
    return `<span class="portrait-frame"><img src="${ui.escape(god.image)}" alt="${ui.escape(god.name)}画像" draggable="false"><span class="portrait-fallback" hidden>${ui.escape(god.name)}</span></span>`;
  }
  function header(back = false) {
    return `<header class="card-header"><span class="card-museum">永乐宫 · 自主导览</span><h2>寻宝朝元</h2><p>${back ? '八个入口，认识一幅壁画' : '在《朝元图》中寻找 8 位主神'}</p><span class="card-seal" aria-hidden="true">朝元</span></header>`;
  }
  function entry(god, version, number) {
    return `<section class="god-entry${number ? ' recorded' : ''}" data-god="${ui.escape(god.id)}">${portrait(god)}<div class="god-copy"><h3>${ui.escape(god.name)}</h3><p class="recognition-hint" ${version === 1 ? 'hidden' : ''}>${ui.escape(god.recognition)}</p><div class="paste-slot">贴编号：<span aria-label="${number ? `已记录编号 ${number}，待核验` : '空白编号粘贴位置'}">${number || ''}</span></div></div></section>`;
  }
  function stickers(interactive = false) {
    return `<section class="sticker-strip" aria-label="可撕编号贴纸区${interactive ? '' : '，仅展示'}"><h3>可撕编号贴纸区</h3><div class="stickers">${Array.from({length:8}, (_,i)=>interactive ? `<button class="sticker" data-action="chapter03-sticker" data-number="${i+1}" aria-label="选择 ${i+1} 号贴纸" aria-pressed="false">${i+1}</button>` : `<span class="sticker">${i+1}</span>`).join('')}</div></section>`;
  }
  function front(data, version = 1, options = {}) {
    return `<article class="treasure-card" data-version="${version}" data-side="front" aria-label="V${version} 寻宝卡正面">${header()}<p class="card-instructions">请根据寻宝卡寻找对应人物，将现场编号贴至卡片对应位置。</p><div class="god-grid">${data.gods.map(god => entry(god, version, options.records?.[god.id])).join('')}</div>${stickers()}<p class="card-footnote">${ui.escape(options.footnote || '认识目标后，请前往三清殿寻找人物。')}</p></article>`;
  }
  function target(data, id, options = {}) {
    const god = data.gods.find(item => item.id === id);
    const version = options.version || 2;
    return `<article class="treasure-card target-card" data-version="${version}" data-side="front" aria-label="当前目标：${ui.escape(god.name)}">${header()}<p class="card-instructions">当前正在寻找的人物</p><div class="god-grid">${entry(god, version, options.number)}</div>${options.interactive ? stickers(true) : ''}</article>`;
  }
  function record(root, id, number) {
    const element = Array.from(root.querySelectorAll('[data-god]')).find(item => item.dataset.god === id);
    if (!element) return;
    element.classList.add('recorded');
    const slot = element.querySelector('.paste-slot span');
    slot.textContent = number;
    slot.setAttribute('aria-label', `已记录编号 ${number}，待核验`);
  }
  function profile(god) {
    return `<section class="back-profile"><h3>${ui.escape(god.name)}</h3><dl><dt>他是谁？</dt><dd>${ui.escape(god.introduction.identity)}</dd><dt>为什么值得看？</dt><dd>${ui.escape(god.introduction.significance)}</dd><dt>顺便看看</dt><dd>${ui.escape(god.introduction.surroundings)}</dd></dl></section>`;
  }
  function back(data) {
    return `<article class="treasure-card card-back" data-version="2" data-side="back" aria-label="V2 寻宝卡背面">${header(true)}<p class="card-overview">${ui.escape(data.overview)}</p><div class="back-profiles">${data.gods.slice(0,2).map(profile).join('')}</div><section class="remaining-profiles"><h3>其余六位 · 资料待补充</h3><p>${data.gods.slice(2).map(god=>ui.escape(god.name)).join(' / ')}</p><small>身份介绍 / 观看意义 / 周边观察提示</small></section><p class="card-footnote">从人物出发，继续观察周围的壁画。</p></article>`;
  }
  function upgrade(element) {
    element.dataset.version = '2';
    element.setAttribute('aria-label', 'V2 寻宝卡正面');
  }
  function revealHints(element) { element.querySelectorAll('.recognition-hint').forEach(hint => { hint.hidden = false; }); }
  function bindImages(root) {
    root.querySelectorAll('.portrait-frame img').forEach(img => {
      const failed = () => { img.hidden = true; img.nextElementSibling.hidden = false; };
      img.addEventListener('error', failed, {once:true});
      if (img.complete && !img.naturalWidth) failed();
    });
  }
  return { front, back, profile, upgrade, revealHints, bindImages, target, record };
})();
