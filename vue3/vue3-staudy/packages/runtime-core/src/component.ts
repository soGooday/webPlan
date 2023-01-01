import { reactive } from "@vue/reactivity";
import { hasOwn, isFunticon } from "@vue/shared";
import { initProps } from "./componentProps";

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
  };
  return instance;
}
const publicProperties = {
  $attrs: (i) => i.attrs,
  $props: (i) => i.props,
};
const PublicInstancePropxyHandlers = {
  get(target, key) {
    let { data, props } = target;
    if (data && hasOwn(key, data)) {
      return data[key];
    } else if (hasOwn(key, props)) {
      return props[key];
    }
    let getter = publicProperties[key];
    if (getter) {
      return getter(target);
    }
  },
  set(target, key, value) {
    let { data, props } = target;
    if (hasOwn(key, data)) {
      data[key] = value;
    } else if (hasOwn(key, props)) {
      return false;
    }
    return true;
  },
};
export function setupComponent(instance) {
  const { type, props } = instance.vnode;
  //把用户传递props 解析成为attrs 和 propsOptions 放到实例上
  initProps(instance, props);
  //创建代理对象
  instance.proxy = new Proxy(instance, PublicInstancePropxyHandlers);
  let { data } = type;
  if (data) {
    //vue2的传递data
    if (isFunticon(data)) {
      //用户将pros转化成为data
      instance.data = reactive(data.call(instance.proxy));
    }
  }

  instance.render = type.render;
}
