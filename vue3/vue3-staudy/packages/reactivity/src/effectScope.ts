// import { EffectScope } from "vue";
export let activeEffectScope;

class EffectScope {
  public active = true;
  public effects = []; //這個是手機内部的effect
  public parent;
  public scopes; //這個是收集作用域的
  constructor(detached = false) {
    //是獨立的就是不在進行手機依賴
    if (!detached && activeEffectScope) {
      activeEffectScope.scopes || (activeEffectScope.scopes = [].push(this));
    }
  }
  public run(fn) {
    if (this.active) {
      try {
        this.parent = activeEffectScope;
        activeEffectScope = this;
        return fn();
      } finally {
        //清空
        activeEffectScope = this.parent;
        this.parent = null;
      }
    }
  }
  public stop() {
    if (this.active) {
      for (let index = 0; index < this.effects.length; index++) {
        this.effects[index].stop(); //讓每一個儲存的effect全部終止
      }
      this.active = false;
    }
    if (this.scopes) {
      for (let index = 0; index < this.scopes.length; index++) {
        this.scopes[index].stop(); //調用作用域的stop
      }
    }
  }
}
export function recordEffectScope(effect) {
  if (activeEffectScope && activeEffectScope.active) {
    activeEffectScope.effects.push(effect);
  }
}
export function effectScope(detached) {
  return new EffectScope(detached);
}
