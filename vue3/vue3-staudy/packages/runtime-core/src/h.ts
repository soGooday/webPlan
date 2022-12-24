//提供多样的api 通过参数来区分

import { isArray, isObject } from "@vue/shared";
import { createVNode, isVNode } from "./vnode";

export function h(type, propsOrChildren?, children?) {
  const l = arguments.length;

  //h(type,{}) 有{}属性
  //h(type,h('span')) => h(type,[h('span')]) 有一个span的子元素
  //h(type,[]) 有[]个子元素
  //h(type,'text')
  if (l == 2) {
    //第二个参数是对象
    if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
      //第一个对象是个vnode的虚拟节点类型
      if (isVNode(propsOrChildren)) {
        ///h(type,h('span')) => h(type,[h('span')])
        return createVNode(type, null, [propsOrChildren]);
      }
      //说明propsOrChildren是一个参数项
      // h(type,{}) 有{}属性
      return createVNode(type, propsOrChildren);
    } else {
      // debugger;
      //数组或者是文本
      //h(type,[]) 有[]个子元素
      //h(type,'text')
      return createVNode(type, null, propsOrChildren);
    }
  } else {
    if (l > 3) {
      //h('div',{},'a','b','c')  这样操作第二个参数必须是属性 第一格式标签的类型
      //错误的例子h('div','a','b','c') ）
      children = Array.from(arguments).slice(2);
    } else if (l === 3 && isVNode(children)) {
      ///h(type,{},h('span')) => h(type,{},[h('span')])
      children = [children];
    }
    return createVNode(type, propsOrChildren, children);
  }
}
