import { isObject } from "@vue/shared";
import { mutableHandlers } from "./baseHandler";

export const enum ReactiveFlags {
  IS_REACTIVE = "__V_isReactive",
}

const reactiveMap = new Map();
export function reactive(target) {
  //不是对象就返回
  if (!isObject(target)) return target;
  //检查是不是reactive过的对象是不是又被套了一层reactive
  if (target[ReactiveFlags.IS_REACTIVE]) {
    return target;
  } 
  //检查知是不是存在之前的代理对象
  const exisitsProxy = reactiveMap.get(target);
  if (exisitsProxy) return exisitsProxy;
  //代理
  const proxy = new Proxy(target, mutableHandlers);
  //缓存代理过的对象 下次再行代理的时候直接拿出来使用
  reactiveMap.set(target, proxy);
  return proxy;
}
