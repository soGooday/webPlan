import { isFunticon } from "@vue/shared";
import {
  activeEffect,
  ReactiveEffect,
  trackEffect,
  triggerEffect,
} from "./effect";

const noop = () => {};

class ComputedRefImpl {
  public dep;
  public effect = undefined;
  public __v_isRef = true; //有这个字段的话 就证明一定要使用  .value来取值
  public _diry = true; //是不是脏值
  public _value = ""; //缓存的值
  public getter;
  public setter;
  constructor(getter, setter) {
    this.getter = getter; 
    this.setter = setter;
    this.effect = new ReactiveEffect(getter, () => {
      //使用调取函数处理 自定义如果收集的依赖发生了变化 启用自定义函数
      this._diry = true;
      //触发收集的effect的依赖
      triggerEffect(this.dep);
    });
  }
  // class 的属性访问器   Object.defineProperty(实例,value,{get})
  get value() {
    if (activeEffect) {
      //如果存在这个值说明 计算属性在effect函数中被使用
      //需要让计算属性进行了收集这个effect
      //用户取值发生依赖收集
      trackEffect(this.dep || (this.dep = new Set()));
    }

    if (this._diry) {
      //取值才执行，并且把值存储起来
      this._value = this.effect.run();
      this._diry = false; //意味着是脏了
    }
    return this._value;
  }

  set value(newValue) {
    this.setter(newValue);
  }
}

export function computed(getterOrOpentions) {
  let onlayGetter = isFunticon(getterOrOpentions);

  let getter;
  let setter;
  //方法 或者是 对象
  if (onlayGetter) {
    getter = getterOrOpentions;
    setter = noop;
  } else {
    getter = getterOrOpentions.get;
    setter = getterOrOpentions.set || noop;
  }

  //getter = 方法必须存在
  return new ComputedRefImpl(getter, setter);
}
