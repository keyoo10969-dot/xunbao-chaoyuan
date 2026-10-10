/* 各幕传入数据、统一时长配置和界面回调即可复用。
   阅读时间不随减少动态效果设置缩短，仅 CSS 装饰动画减少。 */
window.CognitiveScanController = class {
  constructor(data, timing, callbacks) { this.data = data; this.timing = timing; this.callbacks = callbacks; this.timers = []; this.finished = false; }
  later(fn, delay) { this.timers.push(setTimeout(fn, delay)); }
  cancel() { this.timers.forEach(clearTimeout); this.timers = []; }
  start() { this.cancel(); this.finished = false; this.later(() => this.step(0), this.timing.title); }
  step(index) {
    if (this.finished) return;
    if (index === this.data.questions.length) {
      this.callbacks.onAll();
      this.later(() => this.showResult(), this.timing.hold);
      return;
    }
    this.callbacks.onStart(index);
    this.later(() => {
      this.callbacks.onMark(index);
      this.later(() => this.step(index + 1), this.timing.read);
    }, this.timing.light);
  }
  showResult() {
    this.callbacks.onResult();
    this.later(() => { this.callbacks.onButton(); this.finished = true; }, this.timing.result + this.timing.button);
  }
  fastForward() {
    this.cancel();
    this.data.questions.forEach((_, i) => this.callbacks.onMark(i));
    this.callbacks.onAll(); this.callbacks.onResult(); this.callbacks.onButton(); this.finished = true;
  }
};
