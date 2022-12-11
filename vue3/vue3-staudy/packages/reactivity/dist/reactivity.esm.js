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

// packages/shared/src/index.ts
function isObject(value) {
  return value !== null && typeof value === "object";
}
function isFunticon(value) {
  return typeof value === "function";
}

// packages/reactivity/src/baseHandler.ts
var mutableHandlers = {
  get(target, key, receiver) {
    if ("__V_isReactive" /* IS_REACTIVE */ == key) {
      return true;
    }
    track(target, key);
    let r = Reflect.get(target, key, receiver);
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

// packages/reactivity/src/ref.ts
function ref(value) {
  return new RefImpl(value);
}
function toReactive(value) {
  return isObject(value) ? reactive(value) : value;
}
var RefImpl = class {
  constructor(rawValue) {
    this.rawValue = rawValue;
    this.dep = void 0;
    this._v_isRef = true;
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
export {
  ReactiveEffect,
  ReactiveFlags,
  activeEffect,
  computed,
  effect,
  isReacitve,
  reactive,
  ref,
  track,
  trackEffect,
  trigger,
  triggerEffect,
  watch,
  watchEffect
};
//# sourceMappingURL=reactivity.esm.js.map
