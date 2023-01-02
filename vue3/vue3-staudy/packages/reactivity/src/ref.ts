import { isObject } from "@vue/shared";
import { activeEffect, trackEffect, triggerEffect } from "./effect";
import { reactive } from "./reactive";

export function ref(value) {
  return new RefImpl(value);
}
export function isRef(value) { 
  return !!(value && value.__v_isRef);
}
function toReactive(value) {
  return isObject(value) ? reactive(value) : value;
}
class RefImpl {
  public dep = undefined;
  public _value;
  public __v_isRef = true;
  constructor(public rawValue) {
    this._value = toReactive(rawValue);
  }

  get value() {
    //依赖收集
    if (activeEffect) {
      trackEffect(this.dep || (this.dep = new Set()));
    }
    return this._value;
  }
  set value(newValue) {
    if (newValue != this._value) {
      //更新
      this._value = toReactive(newValue);
      this.rawValue = newValue;
      //触发依赖更新
      triggerEffect(this.dep);
    }
  }
}

class ObjectRefImpl {
  private __v_isRef = true;
  private _objact;
  private _key;
  //这里不是proxy 是Objact.defineProperty
  constructor(target, key) {
    this._objact = target;
    this._key = key;
  }
  get value() {
    return this._objact[this._key];
  }
  set value(_value) {
    this._objact[this._key] = _value;
  }
}
export function toRef(target, key) {
  return new ObjectRefImpl(target, key);
}
export function toRefs(objact) {
  const ret = {};

  for (const key in objact) {
    ret[key] = toRef(objact, key);
  }
  return ret;
}
//自动帮助.value
export function proxyRefs(objactWithRefs) {
  return new Proxy(objactWithRefs, {
    get(target, key, receiver) {
      let v = Reflect.get(target, key, receiver);
      console.log("v :", isRef(v), v);
      return isRef(v) ? v.value : v;
    },
    set(target, key, value, receiver) {
      const oldValue = target[key];
      // if (oldValue.__v_isRef) {
      if (isRef(oldValue)) {
        oldValue.value = value;
        return true;
      }
      return Reflect.set(target, key, value, receiver);
    },
  });
}
