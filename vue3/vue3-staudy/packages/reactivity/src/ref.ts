import { isObject } from "@vue/shared";
import { activeEffect, trackEffect, triggerEffect } from "./effect";
import { reactive } from "./reactive";

export function ref(value) {
  return new RefImpl(value);
}

function toReactive(value) {
  return isObject(value) ? reactive(value) : value;
}
class RefImpl {
  public dep = undefined;
  public _value;
  public _v_isRef = true;
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
