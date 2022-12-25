import {
  isArray,
  isObject,
  isString,
  ShapeFlags,
} from "packages/shared/src/index";
export const Text = Symbol("text");
export const Fragment = Symbol("Fragment");
export function isVNode(vnode) {
  return vnode.__v__isVnode == true;
}
//相同的节点
export function isSameVNode(n1, n2) {
  return n1.type === n2.type && n1.key === n2.key;
}

/**
 *
 * @param type
 * @param props 是配置或者是子节点
 * @param children 类型 数组 字符串 空
 * @returns
 */
export function createVNode(type, props = null, children = null) {
  //组件
  //元素
  //文本
  //自定义组件 keep-alive
  //用标识来区分 对应的虚拟节点类型，这表示采用位运算的方式 方便组合

  //type 是字符串的话  就说明是节点属性
  const shapeFlage = isString(type)
    ? ShapeFlags.ELEMENT
    : isObject(type)
    ? ShapeFlags.COMPONENT
    : 0;

  //虚拟节点对应真是节点
  const vnode = {
    __v__isVnode: true, //虚拟节点的标识
    type,
    props,
    children,
    shapeFlage, //ShapeFlags 中每一个位置都表示一种类型
    key: props?.key, //小组你节点的key
    el: null, //对应真实节点
  };

  if (children) {
    let type = 0;
    if (isArray(children)) {
      //children可能是两种情况数组[vnode,'test',...]或者字符串'text'
      //数组
      type = ShapeFlags.ARRAY_CHILDREN;
    } else {
      //文本
      type = ShapeFlags.TEXT_CHILDREN;
    }
    //或等
    // vnode.shapeFlage = vnode.shapeFlage | type;
    vnode.shapeFlage |= type;
  }
  // if(isArray(props)){
  //   vnode.shapeFlage |=ShapeFlags.ARRAY_CHILDREN;
  // }
  return vnode;
}
