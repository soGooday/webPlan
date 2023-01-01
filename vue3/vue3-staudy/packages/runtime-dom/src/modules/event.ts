function createInvoker(iniriaValue) {
  const invoker = () => invoker.value();
  invoker.value = iniriaValue; //后续只能要更新value就能更换函数了
  console.log(invoker.value)
  return invoker;
}
//事件对用的函数更新
export function patchEvent(el, key, nextdVlue) {
  //vue event invoker 检测之前有无缓存的方法
  const invokers = el._vei || (el._vei = {});

  //onClick => click
  const eventName = key.slice(2).toLowerCase();

  //if nextdVlue == null 且绑定过事件 则需要将事件移除
  const exisitingInvoker = invokers[eventName];

  //更新事件 传递回来了新的函数 && 并且之前选在缓存
  if (nextdVlue && exisitingInvoker) {
    //将缓存对应的函数 进行更换为这个次新的函数
    exisitingInvoker.value = nextdVlue;
    console.log('EVENT1:',el, key, nextdVlue)
  } else {
    if (nextdVlue) {
      console.log('EVENT2:',el, key, nextdVlue)
      //缓存创建的invoker 并未存在方法，则进行创建并缓存起来
      const invoker = (invokers[eventName] = createInvoker(nextdVlue));
      el.addEventListener(eventName, invoker);
      console.log('onclick:',invoker,invokers[eventName])
    } else if (exisitingInvoker) {
      console.log('EVENT3:',el, key, nextdVlue)
      //之前存在函数 但是这次并未传递回来函数，说明事件及其对应的函数被删除了
      //则删除事件对应的函数
      el.removeEventListener(eventName, exisitingInvoker);
      //删除事件的缓存
      invokers[eventName] = null;
    }
  }
}
