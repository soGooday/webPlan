export let activeEffect;

//清理依赖的收集
function clearUpEffect(effect) {
  let { deps } = effect;
  //将依赖获取到
  for (let index = 0; index < deps.length; index++) {
    //清除依赖
    deps[index].delete(effect);
  }
  //数组长度归0
  effect.deps.length = 0;
}

class ReactiveEffect {
  public fn;
  public active = true; //是否激活
  public deps = []; //方法中有那些依赖项
  public parent = undefined;
  constructor(fn) {
    this.fn = fn;
  }

  run() {
    //未激活的状态
    if (!this.active) {
      return this.fn(); //直接执行
    }

    //其他意味着是激活的状态
    try {
      //tree树 父子关系
      this.parent = activeEffect;
      activeEffect = this;
      //清除之前的依赖收集
      clearUpEffect(this);
      return this.fn(); //执行方法 如果有代理就会触发代理
    } finally {
      //无论任何情况都会执行
      activeEffect = this.parent;
      this.parent = undefined;
    }
  }
  //停止effect
  stop() {
    //如果状态是活动的 就改为失活 同时清空所有的依赖
    if (this.active) {
      clearUpEffect(this);
      this.active = false;
      console.log("清除是有的");
    }
  }
}
//依赖收集 就是当前的effect变成全局的 稍后取值的时候可以拿到这个全局的effect
export function effect(fn) {
  const _effect = new ReactiveEffect(fn);
  _effect.run(); //默认让响应式的走一遍

  const runner = _effect.run.bind(_effect); //保证runner被调取的时候 this的指向不会丢失
  runner.effect = _effect;
  return runner;
}

/* let targetMap={
    depsMap:{
        key:[activeEffect,activeEffect]
   }
}*/
const targetMap = new WeakMap();
export function track(target, key) {
  if (!activeEffect) {
    //取值操作中 并未在effect中 就不需要进行收集
    return;
  }
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    //并未存储过 所以要存储下
    //WeakMap 只能是对象 但是我先要储存key  key是字符串
    targetMap.set(target, (depsMap = new Map()));
  }

  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }
  //是否需要进行收集
  let shouldTrack = !dep.has(activeEffect);
  if (shouldTrack) {
    //将对应的effect收集起来
    dep.add(activeEffect);
    //activeEffect也将对应的dep收集起来，也就是key值对应的effect的方法
    activeEffect.deps.push(dep); //后续需要通过effect来清理的时候可以去使用
    //一个属性对应多个effect  一个effect对应多个属性
    //属性与effect是多对多的关系
  }
}
// let activeEffect;
// effect(() => { //e1  el.parent = null
//   name;
//   effect(() => {//e2  el.parent = e1
//     age;
//   });//e2  activeEffect = e2.parent
//   address
// });

export function trigger(target, key, newValue, oldValue) {
  // waakMap:(obj:map(key:set(effect)))
  //获取target的map
  const depMap = targetMap.get(target);
  if (!depMap) return;
  //获取target的中key的集合
  const dep = depMap.get(key);
  if (dep) {
    //防止出现 //解释1
    const effects = [...dep];
    effects.forEach((effect) => {
      //当执行时 将effect方全局上 下面是为了处理掉 effect()中执行的方法，有改变量的值。而这个值同时又收集了这个依赖
      //例子
      // let data = reactive({name:haha,age:18})
      // effect(()=>{
      // data.name = guagua //触发收集的effect的依赖 运行
      // app.inntrtHTML = data.name 触发effect的依赖收集 本句与上句进行入了死循环
      // })
      if (activeEffect != effect) {
        effect.run(); //都会重新依赖收集
      }
    });
  }
}
//解释1
//默认执行了一个set。在当前的set中清空了某一个effect，又向set中添加了一项  例子如下
//使用了同一个地址
// let s = new Set(["a"]);
// s.forEach((item) => {
//   s.delete(item);
//   s.add(item);
// });
