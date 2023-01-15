import {
  currentInstance,
  getCurrentInstance,
  setCurrentInstance,
} from "./component";

export const enum LifecycleHoos {
  BERFOR_MONUT = "bm",
  MOUNTED = "m",
  BEFORE_UPDSTE = "bu",
  UPDATED = "u",
}

function createHook(type) {
  //type 是绑定到哪里的  hook就是用户传递的钩子
  //instanc【type】 = [hook,hook]
  return (hook, target = getCurrentInstance()) => {
    if (target) {
      //将实例从新恢复
      const wrapperHool = () => {
        setCurrentInstance(target);
        //执行费函数
        hook();
        //实例清空
        setCurrentInstance(null);
      };
      const hooks = target[type] || (target[type] = []);
      hooks.push(wrapperHool);
    }
    console.log("target:", target);
  };
}

export const onBerforMount = createHook(LifecycleHoos.BERFOR_MONUT);
export const onMounted = createHook(LifecycleHoos.MOUNTED);
export const onBerforUpdate = createHook(LifecycleHoos.BEFORE_UPDSTE);
export const onUpdated = createHook(LifecycleHoos.UPDATED);
