import { proxyRefs, reactive, toRefs } from "@vue/reactivity";
import { hasOwn, isFunticon, ShapeFlags } from "@vue/shared";
import { initProps } from "./componentProps";

export let currentInstance; //当前执行的实例
export function setCurrentInstance(instance) {
  //track
  currentInstance = instance;
}
//给用户在setup中使用的
export function getCurrentInstance() {
  return currentInstance;
}

export function createComponentInstance(vnode) {
  //组件实例
  const instance = {
    data: null,
    isMounted: false,
    subTree: null,
    vnode,
    update: null, //组件的更新方法
    props: {},
    attrs: {},
    propsOptions: vnode.type.props || {},
    proxy: null,
    setupState: null,
    exposed: {},
    slots: {},
  };
  return instance;
}
const publicProperties = {
  $attrs: (i) => i.attrs,
  $props: (i) => i.props,
  $slots: (i) => i.slots,
};
const PublicInstancePropxyHandlers = {
  get(target, key) {
    let { data, props, setupState } = target;
    if (data && hasOwn(key, data)) {
      return data[key];
    } else if (hasOwn(key, props)) {
      return props[key];
    } else if (setupState && hasOwn(key, setupState)) {
      return setupState[key];
    }
    let getter = publicProperties[key];
    if (getter) {
      return getter(target);
    }
  },
  set(target, key, value) {
    let { data, props, setupState } = target;
    if (hasOwn(key, data)) {
      data[key] = value;
    } else if (hasOwn(key, props)) {
      return false;
    } else if (setupState && hasOwn(key, setupState)) {
      setupState[key] = value;
    }
    return true;
  },
};
function initSlots(instance, children) {
  let { vnode } = instance;
  if (vnode.shapeFlage && ShapeFlags.SLOTS_CHILDREN) {
    instance.slots = children; //将用户的插槽绑定到实例上
  }
}
export function setupComponent(instance) {
  const { type, props, children } = instance.vnode;
  //把用户传递props 解析成为attrs 和 propsOptions 放到实例上
  initProps(instance, props);
  initSlots(instance, children);
  //创建代理对象
  instance.proxy = new Proxy(instance, PublicInstancePropxyHandlers);
  let { data, setup } = type;
  if (setup) {
    const setupContext = {
      attrs: instance.attrs,
      emit: (event, ...args) => {
        const eventName = `on${event[0].toUpperCase()}${event.slice(1)}`;
        const handler = instance.vnode.props[eventName];
        console.log("instance:", instance);
        handler && handler(...args);
      },
      expose(exposed) {
        instance.exposed = exposed;
      },
      slots: instance.slots,
    };
    setCurrentInstance(instance);
    const setupResult = setup(instance.props, setupContext);
    setCurrentInstance(null);
    //説明seetup返回的是render函数
    if (isFunticon(setupResult)) {
      instance.render = setupResult;
    } else {
      //将返回结果作为了数据源
      instance.setupState = proxyRefs(setupResult);
    }
  }

  if (data) {
    //vue2的传递data
    if (isFunticon(data)) {
      //用户将pros转化成为data
      instance.data = reactive(data.call(instance.proxy));
    }
  }
  if (!instance.render) {
    instance.render = type.render;
  }
}
