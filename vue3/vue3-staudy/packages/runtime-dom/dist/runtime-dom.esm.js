// packages/runtime-dom/src/nodeOps.ts
var nodeOps = {
  createElement(tagName) {
    console.log("tagName:", tagName);
    return document.createElement(tagName);
  },
  insert(child, parent, anchor) {
    parent.insertBefore(child, anchor || null);
  },
  remove(child) {
    const parent = child.parentNode;
    if (parent) {
      parent.removeChild(child);
    }
  },
  querySelector(selector) {
    return document.querySelector(selector);
  },
  parentNode(node) {
    return node.parentNode;
  },
  nextSibling(node) {
    return node.nextSibling;
  },
  setElementText(el, text) {
    el.textContent = text;
  },
  createText(text) {
    return document.createTextNode(text);
  },
  setText(node, text) {
    node.nodeValue = text;
  }
};

// packages/runtime-dom/src/modules/attr.ts
var patchAttr = (el, key, value) => {
  if (value == null) {
    el.removeAttribute(key);
  } else {
    el.setAttribute(key, value);
  }
};

// packages/runtime-dom/src/modules/class.ts
var patchClass = (el, value) => {
  if (value == null) {
    el.removeAttribute("class");
  } else {
    el.className = value;
  }
};

// packages/runtime-dom/src/modules/event.ts
function createInvoker(iniriaValue) {
  const invoker = () => invoker.value();
  invoker.value = iniriaValue;
  console.log(invoker.value);
  return invoker;
}
function patchEvent(el, key, nextdVlue) {
  const invokers = el._vei || (el._vei = {});
  const eventName = key.slice(2).toLowerCase();
  const exisitingInvoker = invokers[eventName];
  if (nextdVlue && exisitingInvoker) {
    exisitingInvoker.value = nextdVlue;
    console.log("EVENT1:", el, key, nextdVlue);
  } else {
    if (nextdVlue) {
      console.log("EVENT2:", el, key, nextdVlue);
      const invoker = invokers[eventName] = createInvoker(nextdVlue);
      el.addEventListener(eventName, invoker);
      console.log("onclick:", invoker, invokers[eventName]);
    } else if (exisitingInvoker) {
      console.log("EVENT3:", el, key, nextdVlue);
      el.removeEventListener(eventName, exisitingInvoker);
      invokers[eventName] = null;
    }
  }
}

// packages/runtime-dom/src/modules/style.ts
var patchStyle = (el, prev, next = null) => {
  if (!next) {
    return el.removeAttribute("style");
  }
  const style = el.style;
  for (const key in next) {
    style[key] = next[key];
  }
  for (const key in prev) {
    if (next[key] == null) {
      style[key] == null;
    }
  }
};

// packages/runtime-dom/src/pathProp.ts
var pathchProp = (el, key, prevValue, nextVlue) => {
  if (key === "class") {
    patchClass(el, nextVlue);
  } else if (key === "style") {
    patchStyle(el, prevValue, nextVlue);
  } else if (/^on[A-Za-z]/.test(key)) {
    patchEvent(el, key, nextVlue);
  } else {
    patchAttr(el, key, nextVlue);
  }
};

// packages/shared/src/index.ts
function isObject(value) {
  return value !== null && typeof value === "object";
}
function isFunticon(value) {
  return typeof value === "function";
}
function isString(value) {
  return typeof value === "string";
}
var isArray = Array.isArray;
var ownProperty = Object.prototype.hasOwnProperty;
var hasOwn = (key, value) => ownProperty.call(value, key);
function invokeArrayFn(fns) {
  fns.forEach((fn) => {
    fn();
  });
}

// packages/runtime-core/src/vnode.ts
var Text = Symbol("text");
var Fragment = Symbol("Fragment");
function isVNode(vnode) {
  return vnode.__v__isVnode == true;
}
function isSameVNode(n1, n2) {
  return n1.type === n2.type && n1.key === n2.key;
}
function createVNode(type, props = null, children = null) {
  const shapeFlage = isString(type) ? 1 /* ELEMENT */ : isObject(type) ? 6 /* COMPONENT */ : 0;
  const vnode = {
    __v__isVnode: true,
    type,
    props,
    children,
    shapeFlage,
    key: props == null ? void 0 : props.key,
    el: null
  };
  if (children) {
    let type2 = 0;
    if (isArray(children)) {
      type2 = 16 /* ARRAY_CHILDREN */;
    } else if (isObject(children)) {
      type2 = 32 /* SLOTS_CHILDREN */;
    } else {
      type2 = 8 /* TEXT_CHILDREN */;
    }
    vnode.shapeFlage |= type2;
  }
  return vnode;
}

// packages/runtime-core/src/h.ts
function h(type, propsOrChildren, children) {
  const l = arguments.length;
  if (l == 2) {
    if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
      if (isVNode(propsOrChildren)) {
        return createVNode(type, null, [propsOrChildren]);
      }
      return createVNode(type, propsOrChildren);
    } else {
      return createVNode(type, null, propsOrChildren);
    }
  } else {
    if (l > 3) {
      children = Array.from(arguments).slice(2);
    } else if (l === 3 && isVNode(children)) {
      children = [children];
    }
    return createVNode(type, propsOrChildren, children);
  }
}

// packages/reactivity/src/effectScope.ts
var activeEffectScope;
var EffectScope = class {
  constructor(detached = false) {
    this.active = true;
    this.effects = [];
    if (!detached && activeEffectScope) {
      activeEffectScope.scopes || (activeEffectScope.scopes = [].push(this));
    }
  }
  run(fn) {
    if (this.active) {
      try {
        this.parent = activeEffectScope;
        activeEffectScope = this;
        return fn();
      } finally {
        activeEffectScope = this.parent;
        this.parent = null;
      }
    }
  }
  stop() {
    if (this.active) {
      for (let index = 0; index < this.effects.length; index++) {
        this.effects[index].stop();
      }
      this.active = false;
    }
    if (this.scopes) {
      for (let index = 0; index < this.scopes.length; index++) {
        this.scopes[index].stop();
      }
    }
  }
};
function recordEffectScope(effect2) {
  if (activeEffectScope && activeEffectScope.active) {
    activeEffectScope.effects.push(effect2);
  }
}
function effectScope(detached) {
  return new EffectScope(detached);
}

// packages/reactivity/src/effect.ts
var activeEffect;
function clearUpEffect(effect2) {
  let { deps } = effect2;
  for (let index = 0; index < deps.length; index++) {
    deps[index].delete(effect2);
  }
  effect2.deps.length = 0;
}
var ReactiveEffect = class {
  constructor(fn, scheduler) {
    this.active = true;
    this.deps = [];
    this.parent = void 0;
    this.scheduler = void 0;
    this.fn = fn;
    this.scheduler = scheduler;
    recordEffectScope(this);
  }
  run() {
    if (!this.active) {
      return this.fn();
    }
    try {
      this.parent = activeEffect;
      activeEffect = this;
      clearUpEffect(this);
      return this.fn();
    } finally {
      activeEffect = this.parent;
      this.parent = void 0;
    }
  }
  stop() {
    if (this.active) {
      clearUpEffect(this);
      this.active = false;
      console.log("\u6E05\u9664\u662F\u6709\u7684");
    }
  }
};
function effect(fn, opention = {}) {
  const _effect = new ReactiveEffect(fn, opention.scheduler);
  _effect.run();
  const runner = _effect.run.bind(_effect);
  runner.effect = _effect;
  return runner;
}
var targetMap = /* @__PURE__ */ new WeakMap();
function track(target, key) {
  if (!activeEffect) {
    return;
  }
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
  }
  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, dep = /* @__PURE__ */ new Set());
  }
  trackEffect(dep);
}
function trackEffect(dep) {
  let shouldTrack = !dep.has(activeEffect);
  if (shouldTrack) {
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
  }
}
function trigger(target, key, newValue, oldValue) {
  const depMap = targetMap.get(target);
  if (!depMap)
    return;
  const dep = depMap.get(key);
  triggerEffect(dep);
}
function triggerEffect(dep) {
  if (dep) {
    const effects = [...dep];
    effects.forEach((effect2) => {
      if (activeEffect != effect2) {
        if (!effect2.scheduler) {
          effect2.run();
        } else {
          effect2.scheduler();
        }
      }
    });
  }
}

// packages/reactivity/src/ref.ts
function ref(value) {
  return new RefImpl(value);
}
function isRef(value) {
  return !!(value && value.__v_isRef);
}
function toReactive(value) {
  return isObject(value) ? reactive(value) : value;
}
var RefImpl = class {
  constructor(rawValue) {
    this.rawValue = rawValue;
    this.dep = void 0;
    this.__v_isRef = true;
    this._value = toReactive(rawValue);
  }
  get value() {
    if (activeEffect) {
      trackEffect(this.dep || (this.dep = /* @__PURE__ */ new Set()));
    }
    return this._value;
  }
  set value(newValue) {
    if (newValue != this._value) {
      this._value = toReactive(newValue);
      this.rawValue = newValue;
      triggerEffect(this.dep);
    }
  }
};
var ObjectRefImpl = class {
  constructor(target, key) {
    this.__v_isRef = true;
    this._objact = target;
    this._key = key;
  }
  get value() {
    return this._objact[this._key];
  }
  set value(_value) {
    this._objact[this._key] = _value;
  }
};
function toRef(target, key) {
  return new ObjectRefImpl(target, key);
}
function toRefs(objact) {
  const ret = {};
  for (const key in objact) {
    ret[key] = toRef(objact, key);
  }
  return ret;
}
function proxyRefs(objactWithRefs) {
  return new Proxy(objactWithRefs, {
    get(target, key, receiver) {
      let v = Reflect.get(target, key, receiver);
      console.log("v :", isRef(v), v);
      return isRef(v) ? v.value : v;
    },
    set(target, key, value, receiver) {
      const oldValue = target[key];
      if (isRef(oldValue)) {
        oldValue.value = value;
        return true;
      }
      return Reflect.set(target, key, value, receiver);
    }
  });
}

// packages/reactivity/src/baseHandler.ts
var mutableHandlers = {
  get(target, key, receiver) {
    if ("__V_isReactive" /* IS_REACTIVE */ == key) {
      return true;
    }
    track(target, key);
    let r = Reflect.get(target, key, receiver);
    if (isRef(r)) {
      console.log("r:", r);
      return r.value;
    }
    if (isObject(r)) {
      return reactive(r);
    }
    return r;
  },
  set(target, key, value, receiver) {
    const oldValue = target[key];
    const t = Reflect.set(target, key, value, receiver);
    if (oldValue !== value) {
      trigger(target, key, value, oldValue);
    }
    return t;
  }
};

// packages/reactivity/src/reactive.ts
var ReactiveFlags = /* @__PURE__ */ ((ReactiveFlags2) => {
  ReactiveFlags2["IS_REACTIVE"] = "__V_isReactive";
  return ReactiveFlags2;
})(ReactiveFlags || {});
function isReacitve(target) {
  return !!(target && target["__V_isReactive" /* IS_REACTIVE */]);
}
var reactiveMap = /* @__PURE__ */ new Map();
function reactive(target) {
  if (!isObject(target))
    return target;
  if (target["__V_isReactive" /* IS_REACTIVE */]) {
    return target;
  }
  const exisitsProxy = reactiveMap.get(target);
  if (exisitsProxy)
    return exisitsProxy;
  const proxy = new Proxy(target, mutableHandlers);
  reactiveMap.set(target, proxy);
  return proxy;
}

// packages/reactivity/src/computed.ts
var noop = () => {
};
var ComputedRefImpl = class {
  constructor(getter, setter) {
    this.effect = void 0;
    this.__v_isRef = true;
    this._diry = true;
    this._value = "";
    this.getter = getter;
    this.setter = setter;
    this.effect = new ReactiveEffect(getter, () => {
      this._diry = true;
      triggerEffect(this.dep);
    });
  }
  get value() {
    if (activeEffect) {
      trackEffect(this.dep || (this.dep = /* @__PURE__ */ new Set()));
    }
    if (this._diry) {
      this._value = this.effect.run();
      this._diry = false;
    }
    return this._value;
  }
  set value(newValue) {
    this.setter(newValue);
  }
};
function computed(getterOrOpentions) {
  let onlayGetter = isFunticon(getterOrOpentions);
  let getter;
  let setter;
  if (onlayGetter) {
    getter = getterOrOpentions;
    setter = noop;
  } else {
    getter = getterOrOpentions.get;
    setter = getterOrOpentions.set || noop;
  }
  return new ComputedRefImpl(getter, setter);
}

// packages/reactivity/src/watch.ts
function traverse(source, set = /* @__PURE__ */ new Set()) {
  if (!isObject(source)) {
    return source;
  }
  if (set.has(source)) {
    return source;
  }
  set.add(source);
  for (const key in source) {
    traverse(source[key], set);
  }
  return source;
}
function doWatch(source, cd, options) {
  let getter;
  if (isReacitve(source)) {
    getter = () => traverse(source);
  } else if (isFunticon(source)) {
    getter = source;
  }
  let oldValue;
  let cleanup;
  const onCleanup = (userCd) => {
    cleanup = userCd;
  };
  const job = () => {
    if (cd) {
      let newValue = effect2.run();
      if (cleanup)
        cleanup();
      if (cd)
        cd(newValue, oldValue, onCleanup);
      oldValue = newValue;
    } else {
      effect2.run();
    }
  };
  const effect2 = new ReactiveEffect(getter, job);
  if (options == null ? void 0 : options.immediate) {
    return job();
  }
  oldValue = effect2.run();
}
function watch(source, cd, options) {
  doWatch(source, cd, options);
}
function watchEffect(effect2, cd, options) {
  doWatch(effect2, null, options);
}

// packages/runtime-core/src/componentProps.ts
function initProps(instance, rawProps) {
  const props = {};
  const attrs = {};
  const options = instance.propsOptions;
  if (rawProps) {
    for (const key in rawProps) {
      const value = rawProps[key];
      if (key in options) {
        props[key] = value;
      } else {
        attrs[key] = value;
      }
    }
  }
  instance.props = reactive(props);
  instance.attrs = attrs;
}

// packages/runtime-core/src/component.ts
var currentInstance;
function setCurrentInstance(instance) {
  currentInstance = instance;
}
function getCurrentInstance() {
  return currentInstance;
}
function createComponentInstance(vnode) {
  const instance = {
    data: null,
    isMounted: false,
    subTree: null,
    vnode,
    update: null,
    props: {},
    attrs: {},
    propsOptions: vnode.type.props || {},
    proxy: null,
    setupState: null,
    exposed: {},
    slots: {}
  };
  return instance;
}
var publicProperties = {
  $attrs: (i) => i.attrs,
  $props: (i) => i.props,
  $slots: (i) => i.slots
};
var PublicInstancePropxyHandlers = {
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
  }
};
function initSlots(instance, children) {
  let { vnode } = instance;
  if (vnode.shapeFlage && 32 /* SLOTS_CHILDREN */) {
    instance.slots = children;
  }
}
function setupComponent(instance) {
  const { type, props, children } = instance.vnode;
  initProps(instance, props);
  initSlots(instance, children);
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
      slots: instance.slots
    };
    setCurrentInstance(instance);
    const setupResult = setup(instance.props, setupContext);
    setCurrentInstance(null);
    if (isFunticon(setupResult)) {
      instance.render = setupResult;
    } else {
      instance.setupState = proxyRefs(setupResult);
    }
  }
  if (data) {
    if (isFunticon(data)) {
      instance.data = reactive(data.call(instance.proxy));
    }
  }
  if (!instance.render) {
    instance.render = type.render;
  }
}

// packages/runtime-core/src/scheduler.ts
var queue = [];
var isFlushing = false;
var resolvePromise = Promise.resolve();
var queueJob = (job) => {
  if (!queue.includes(job)) {
    queue.push(job);
  }
  if (!isFlushing) {
    isFlushing = true;
    resolvePromise.then(() => {
      isFlushing = false;
      let copy = queue.slice(0);
      queue.length = 0;
      for (let index = 0; index < copy.length; index++) {
        const job2 = copy[index];
        job2();
      }
    });
  }
};

// packages/runtime-core/src/renderer.ts
function createRenderer(options) {
  const {
    insert: hostInsert,
    remove: hostRemove,
    pathchProp: hostPatchProp,
    createElement: hostCreateElement,
    createText: hostCreateText,
    createComment: hostCreateComment,
    setText: hostSetText,
    setElementText: hostSetElementText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling
  } = options;
  const mountChildren = (children, el) => {
    for (let index = 0; index < children.length; index++) {
      path(null, children[index], el);
    }
  };
  const unmountChildren = (children) => {
    for (let index = 0; index < children.length; index++) {
      unmount(children[index]);
    }
  };
  const mountElement = (vnode, container, anchor) => {
    const { type, props, children, shapeFlage } = vnode;
    const el = hostCreateElement(type);
    vnode.el = el;
    if (props) {
      for (const key in props) {
        hostPatchProp(el, key, null, props[key]);
      }
    }
    if (16 /* ARRAY_CHILDREN */ & shapeFlage) {
      mountChildren(children, el);
    } else if (8 /* TEXT_CHILDREN */ & shapeFlage) {
      hostSetElementText(el, children);
    }
    hostInsert(el, container, anchor);
  };
  const patchProps = (oldProps, newprops, el) => {
    if (oldProps !== newprops) {
      for (const key in newprops) {
        const prev = oldProps[key];
        const next = newprops[key];
        if (prev !== next) {
          hostPatchProp(el, key, prev, next);
        }
      }
      for (const key in oldProps) {
        if (!(key in newprops)) {
          const prev = oldProps[key];
          hostPatchProp(el, key, prev, null);
        }
      }
    }
  };
  const pathKeyChildren = (c1, c2, el) => {
    let i = 0;
    let e1 = c1.length - 1;
    let e2 = c2.length - 1;
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i];
      if (isSameVNode(n1, n2)) {
        path(n1, n2, el);
      } else {
        break;
      }
      i++;
    }
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2];
      if (isSameVNode(n1, n2)) {
        path(n1, n2, el);
      } else {
        break;
      }
      e1--;
      e2--;
    }
    if (i > e1) {
      if (i <= e2) {
        while (i <= e2) {
          const nextPos = e2 + 1;
          const anchor = nextPos < c2.length ? c2[nextPos].el : null;
          path(null, c2[i], el, anchor);
          i++;
        }
      }
    } else if (i > e2) {
      while (i <= e1) {
        unmount(c1[i]);
        i++;
      }
    } else {
      let s1 = i;
      let s2 = i;
      const keyToNewIndexMap = /* @__PURE__ */ new Map();
      for (let i2 = s2; i2 <= e2; i2++) {
        const vnode = c2[i2];
        keyToNewIndexMap.set(vnode.key, i2);
      }
      const toBepathed = e2 - s2 + 1;
      const newIndexToOldMapIndex = new Array(toBepathed).fill(0);
      for (let i2 = s1; i2 <= e1; i2++) {
        const vnode = c1[i2];
        let newIndex = keyToNewIndexMap.get(vnode.key);
        if (newIndex === void 0) {
          unmount(vnode);
        } else {
          newIndexToOldMapIndex[newIndex - s2] = i2 + 1;
          path(vnode, c2[newIndex], el);
        }
      }
      const seq = getSequence(newIndexToOldMapIndex);
      let j = seq.length - 1;
      for (let i2 = toBepathed - 1; i2 >= 0; i2--) {
        const nextIndex = s2 + i2;
        const nextChild = c2[nextIndex];
        const anchor = nextIndex + 1 < c2.length ? c2[nextIndex + 1].el : null;
        if (newIndexToOldMapIndex[i2] == 0) {
          path(null, nextChild, el, anchor);
        } else {
          if (i2 !== seq[j]) {
            hostInsert(nextChild.el, el, anchor);
          } else {
            j--;
          }
        }
      }
    }
  };
  const patchChildren = (n1, n2, el) => {
    const c1 = n1.children;
    const c2 = n2.children;
    const prevShapeFlag = n1.shapeFlage;
    const shapeFlage = n2.shapeFlage;
    if (8 /* TEXT_CHILDREN */ & shapeFlage) {
      if (16 /* ARRAY_CHILDREN */ & prevShapeFlag) {
        unmountChildren(c1);
      }
      if (c1 !== c2) {
        hostSetElementText(el, c2);
      }
    } else {
      if (16 /* ARRAY_CHILDREN */ & prevShapeFlag) {
        if (16 /* ARRAY_CHILDREN */ & shapeFlage) {
          pathKeyChildren(c1, c2, el);
        } else {
          unmountChildren(c1);
        }
      } else {
        if (8 /* TEXT_CHILDREN */ & prevShapeFlag) {
          hostSetElementText(el, "");
        }
        if (16 /* ARRAY_CHILDREN */ & shapeFlage) {
          mountChildren(c2, el);
        }
      }
    }
  };
  const pathElement = (n1, n2) => {
    let el = n2.el = n1.el;
    const oldprops = n1.props || [];
    const newprops = n2.props || [];
    patchProps(oldprops, newprops, el);
    patchChildren(n1, n2, el);
  };
  const processElement = (n1, n2, container, anchor) => {
    if (n1 == null) {
      mountElement(n2, container, anchor);
    } else {
      pathElement(n1, n2);
    }
  };
  const processText = (n1, n2, el) => {
    if (n1 == null) {
      hostInsert(n2.el = hostCreateText(n2.children), el);
    } else {
      let el2 = n2.el = n1.el;
      if (n1.children !== n2.children) {
        hostSetText(el2, n2.children);
      }
    }
  };
  const processFragment = (n1, n2, el) => {
    if (n1 == null) {
      mountChildren(n2.children, el);
    } else {
      pathKeyChildren(n1.children, n2.children, el);
    }
  };
  const mountComponent = (vnode, container, anchor = null) => {
    const instance = vnode.component = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance, container, anchor);
  };
  const updateProps = (prevProps, nextProps) => {
    for (const key in nextProps) {
      prevProps[key] = nextProps[key];
    }
    for (const key in prevProps) {
      if (!(key in nextProps)) {
        delete prevProps[key];
      }
    }
  };
  const updateComponentPreRender = (instance, next) => {
    instance.next = null;
    instance.vnode = next;
    updateProps(instance.props, next.props);
    instance.slots = next.children;
  };
  const setupRenderEffect = (instance, container, anchor) => {
    let { render: render3 } = instance;
    const componentFun = () => {
      const { bm, m } = instance;
      if (!instance.isMounted) {
        if (bm) {
          invokeArrayFn(bm);
        }
        const subTree = render3.call(instance.proxy, instance.proxy);
        path(null, subTree, container, anchor);
        instance.subTree = subTree;
        instance.isMounted = true;
        if (m) {
          invokeArrayFn(m);
        }
      } else {
        let { next, bu, u } = instance;
        if (next) {
          updateComponentPreRender(instance, next);
        }
        if (bu) {
          invokeArrayFn(bu);
        }
        const subTree = render3.call(instance.proxy, instance.proxy);
        path(instance.subTree, subTree, container, anchor);
        instance.subTree = subTree;
        if (u) {
          invokeArrayFn(u);
        }
      }
    };
    const effect2 = new ReactiveEffect(componentFun, () => {
      queueJob(instance.update);
    });
    let update = instance.update = effect2.run.bind(effect2);
    update();
  };
  const hasPropsChange = (prevProps = {}, nextvProps = {}) => {
    let l1 = Object.keys(prevProps);
    let l2 = Object.keys(nextvProps);
    if (l1.length !== l2.length)
      return true;
    for (let index = 0; index < l1.length; index++) {
      const key = l2[index];
      if (prevProps[key] !== nextvProps[key]) {
        return true;
      }
    }
    return false;
  };
  const shouldCompontUpdate = (n1, n2) => {
    const { props: prevProps, children: prevChilder } = n1;
    const { props: nextvProps, children: nextChilder } = n2;
    if (prevChilder || nextChilder)
      return true;
    if (prevProps === nextvProps)
      return false;
    return hasPropsChange(prevProps, nextvProps);
  };
  const updateComonent = (n1, n2) => {
    let instance = n2.component = n1.component;
    if (shouldCompontUpdate(n1, n2)) {
      instance.next = n2;
      instance && instance.update();
    }
  };
  const processComponent = (n1, n2, container, anchor = null) => {
    if (n1 == null) {
      mountComponent(n2, container, anchor);
    } else {
      updateComonent(n1, n2);
    }
  };
  const path = (n1, n2, container, anchor = null) => {
    if (n1 == n2) {
      return;
    }
    if (n1 && !isSameVNode(n1, n2)) {
      unmount(n1);
      n1 = null;
    }
    let { shapeFlage, type } = n2;
    switch (type) {
      case Text:
        processText(n1, n2, container);
        break;
      case Fragment:
        processFragment(n1, n2, container);
      default:
        if (shapeFlage & 1 /* ELEMENT */) {
          processElement(n1, n2, container, anchor);
        } else if (shapeFlage & 6 /* COMPONENT */) {
          processComponent(n1, n2, container, anchor);
        }
    }
  };
  const unmount = (vnode) => {
    if (vnode.type === Fragment) {
      return unmountChildren(vnode.children);
    }
    hostRemove(vnode.el);
  };
  const render2 = (vnode, container) => {
    if (vnode == null) {
      if (container._vnode) {
        unmount(container._vnode);
      }
    } else {
      path(container._vnode || null, vnode, container);
    }
    container._vnode = vnode;
  };
  return {
    render: render2
  };
}
function getSequence(arr) {
  let len = arr.length;
  let result = [0];
  let resultLastIndex;
  let start;
  let end;
  let middle;
  let p = arr.slice(0);
  for (let i2 = 0; i2 < arr.length; i2++) {
    const arrI = arr[i2];
    if (arrI !== 0) {
      resultLastIndex = result[result.length - 1];
      if (arr[resultLastIndex] < arrI) {
        result.push(i2);
        p[i2] = resultLastIndex;
        continue;
      }
      start = 0;
      end = result.length - 1;
      while (start < end) {
        middle = (start + end) / 2 | 0;
        if (arr[result[middle]] < arrI) {
          start = middle + 1;
        } else {
          end = middle;
        }
      }
      if (arrI < arr[result[start]]) {
        p[i2] = result[start - 1];
        result[start] = i2;
      }
    }
  }
  let i = result.length;
  let last = result[i - 1];
  while (i-- > 0) {
    result[i] = last;
    last = p[last];
  }
  return result;
}

// packages/runtime-core/src/apiLifecycle.ts
var LifecycleHoos = /* @__PURE__ */ ((LifecycleHoos2) => {
  LifecycleHoos2["BERFOR_MONUT"] = "bm";
  LifecycleHoos2["MOUNTED"] = "m";
  LifecycleHoos2["BEFORE_UPDSTE"] = "bu";
  LifecycleHoos2["UPDATED"] = "u";
  return LifecycleHoos2;
})(LifecycleHoos || {});
function createHook(type) {
  return (hook, target = getCurrentInstance()) => {
    if (target) {
      const wrapperHool = () => {
        setCurrentInstance(target);
        hook();
        setCurrentInstance(null);
      };
      const hooks = target[type] || (target[type] = []);
      hooks.push(wrapperHool);
    }
    console.log("target:", target);
  };
}
var onBerforMount = createHook("bm" /* BERFOR_MONUT */);
var onMounted = createHook("m" /* MOUNTED */);
var onBerforUpdate = createHook("bu" /* BEFORE_UPDSTE */);
var onUpdated = createHook("u" /* UPDATED */);

// packages/runtime-dom/src/index.ts
var renderOptions = Object.assign(nodeOps, { pathchProp });
console.log(renderOptions);
var render = (vnode, container) => {
  return createRenderer(renderOptions).render(vnode, container);
};
export {
  Fragment,
  LifecycleHoos,
  ReactiveEffect,
  ReactiveFlags,
  Text,
  activeEffect,
  activeEffectScope,
  computed,
  createComponentInstance,
  createRenderer,
  createVNode,
  currentInstance,
  effect,
  effectScope,
  getCurrentInstance,
  h,
  isReacitve,
  isRef,
  isSameVNode,
  isVNode,
  onBerforMount,
  onBerforUpdate,
  onMounted,
  onUpdated,
  proxyRefs,
  reactive,
  recordEffectScope,
  ref,
  render,
  setCurrentInstance,
  setupComponent,
  toRef,
  toRefs,
  track,
  trackEffect,
  trigger,
  triggerEffect,
  watch,
  watchEffect
};
//# sourceMappingURL=runtime-dom.esm.js.map
