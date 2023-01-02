import { isObject } from "@vue/shared";
import { track, trigger } from "./effect";
import { reactive, ReactiveFlags } from "./reactive";
import { isRef } from "./ref";

export const mutableHandlers = {
  //用户取值操作
  get(target, key, receiver) {
    //检查是不是reactive过的对象是不是又被套了一层reactive
    if (ReactiveFlags.IS_REACTIVE == key) {
      return true;
    }
    //将依赖进行收集 为effect而做的
    track(target, key);

    let r = Reflect.get(target, key, receiver); //处理this的指向

    if (isRef(r)) {
      console.log("r:", r);
      return r.value;
    }
    //检测当前是不是obj 是的话，需要再进行一遍代理 深代理 只有被读取的时候才会进行对应的深代理
    if (isObject(r)) {
      return reactive(r);
    }

    return r;
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
