/* 仅保存本轮实际访问的节点；返回后重新推进，不预先执行未来任务。 */
window.NavigationHistory = class {
  constructor(){this.items=[];}
  get canBack(){return this.items.length>1;}
  get current(){return this.items.at(-1);}
  remember(key,snapshot){
    const item={key,snapshot};
    if(this.current?.key===key)this.items[this.items.length-1]=item;
    else this.items.push(item);
  }
  back(){if(!this.canBack)return null;this.items.pop();return this.current.snapshot;}
  clear(){this.items=[];}
  static isLocal(location){return location.protocol==='file:'||['localhost','127.0.0.1','::1','[::1]'].includes(location.hostname);}
};
