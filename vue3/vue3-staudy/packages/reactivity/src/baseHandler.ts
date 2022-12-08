import { activeEffect, track, trigger } from "./effect";
import { ReactiveFlags } from "./reactive";

export const mutableHandlers = {
  //用户取值操作
  get(target, key, receiver) {
    //检查是不是reactive过的对象是不是又被套了一层reactive
    if (ReactiveFlags.IS_REACTIVE == key) {
      return true;
    }
    //将依赖进行收集 为effect而做的
    track(target, key);

    return Reflect.get(target, key, receiver); //处理this的指向
  },
  //用户复制操作
  set(target, key, value, receiver) {
    //老值
    const oldValue = target[key];
    const t = Reflect.set(target, key, value, receiver);
    //老值与新值进行对比
    if (oldValue !== value) {
      trigger(target, key, value, oldValue);
    } 
    return t; //处理this的指向
  },
};
