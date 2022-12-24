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
  const invoker = () => invoker.value;
  invoker.value = iniriaValue;
  return invoker;
}
function patchEvent(el, key, nextdVlue) {
  const invokers = el._vei || (el._vei = {});
  const eventName = key.slice(2).toLowerCase();
  const exisitingInvoker = invokers[eventName];
  if (nextdVlue && exisitingInvoker) {
    exisitingInvoker.value = nextdVlue;
  } else {
    if (nextdVlue) {
      const invoker = invokers[eventName] = createInvoker(nextdVlue);
      el.addEventListener(eventName, invoker);
    } else if (exisitingInvoker) {
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
  } else if (/^on[A-Z]/.test(key)) {
    patchEvent(el, key, nextVlue);
  } else {
    patchAttr(el, key, nextVlue);
  }
};

// packages/shared/src/index.ts
function isObject(value) {
  return value !== null && typeof value === "object";
}
function isString(value) {
  return typeof value === "string";
}
var isArray = Array.isArray;

// packages/runtime-core/src/vnode.ts
function isVNode(vnode) {
  return vnode.__v__isVnode == true;
}
function isSameVNode(n1, n2) {
  return n1.type === n2.type && n1.key === n2.key;
}
function createVNode(type, props = null, children = null) {
  const shapeFlage = isString(type) ? 1 /* ELEMENT */ : 0;
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
    }
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
    debugger;
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
  const path = (n1, n2, container, anchor = null) => {
    if (n1 == n2) {
      return;
    }
    if (n1 && !isSameVNode(n1, n2)) {
      unmount(n1);
      n1 = null;
    }
    processElement(n1, n2, container, anchor);
  };
  const unmount = (vnode) => hostRemove(vnode.el);
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
  let result2 = [0];
  let resultLastIndex;
  let start;
  let end;
  let middle;
  let p = arr.slice(0);
  for (let i2 = 0; i2 < arr.length; i2++) {
    const arrI = arr[i2];
    if (arrI !== 0) {
      resultLastIndex = result2[result2.length - 1];
      if (arr[resultLastIndex] < arrI) {
        result2.push(i2);
        p[i2] = resultLastIndex;
        continue;
      }
      start = 0;
      end = result2.length - 1;
      while (start < end) {
        middle = (start + end) / 2 | 0;
        if (arr[result2[middle]] < arrI) {
          start = middle + 1;
        } else {
          end = middle;
        }
      }
      if (arrI < arr[result2[start]]) {
        p[i2] = result2[start - 1];
        result2[start] = i2;
      }
    }
  }
  let i = result2.length;
  let last = result2[i - 1];
  while (i-- > 0) {
    result2[i] = last;
    last = p[last];
  }
  return result2;
}
var result = getSequence([2, 5, 8, 4, 6, 7, 9, 3]);
console.log(result);

// packages/runtime-dom/src/index.ts
var renderOptions = Object.assign(nodeOps, { pathchProp });
console.log(renderOptions);
var render = (vnode, container) => {
  return createRenderer(renderOptions).render(vnode, container);
};
export {
  createRenderer,
  createVNode,
  h,
  isSameVNode,
  isVNode,
  render
};
//# sourceMappingURL=runtime-dom.esm.js.map
