import { isFunticon, isObject } from "@vue/shared";
import { ReactiveEffect } from "./effect";
import { isReacitve } from "./reactive";

function traverse(source, set = new Set()) {
  if (!isObject(source)) {
    return source;
  }
  if (set.has(source)) {
    return source;
  }
  set.add(source);
  //考虑循环引用的问题 采用set 来解决此问题
  for (const key in source) {
    traverse(source[key], set); //递归取值  取值就能进行手机依赖
  }
  return source;
}

function doWatch(source, cd, options: any) {
  let getter;
  if (isReacitve(source)) {
    //最终都处理成为函数
    getter = () => traverse(source); //直接调用run的时候，直接执行函数 返回此函数的对象 只有访问属性 才能依赖收集
  } else if (isFunticon(source)) {
    getter = source;
  }
  let oldValue;
  let cleanup;
  const onCleanup = (userCd) => {
    cleanup = userCd;
  };
  //内部调用cd
  const job = () => {
    if (cd) {
      //watch api
      let newValue = effect.run(); //再次调用effect 此时调用回调
      if (cleanup) cleanup(); //先把之前的回调方法执行一下
      if (cd) cd(newValue, oldValue, onCleanup); //处理回调
      oldValue = newValue;
    } else {
      //watchEffect api
      effect.run();
    }
  };
  const effect = new ReactiveEffect(getter, job);
  //如果存在立即执行指令 就调取方法，进行执行
  if (options?.immediate) {
    return job();
  }
  oldValue = effect.run(); //保留老值
}
//watch 本身就是effect + 自定义scheduler
//watchEffect 是居于effect的封装 更方便 不需要写依赖数表
//有了watchEffect就不需要写依赖数据了
export function watch(source, cd, options: any) {
  doWatch(source, cd, options);
}
export function watchEffect(effect, cd, options: any) {
  doWatch(effect, null, options);
}
