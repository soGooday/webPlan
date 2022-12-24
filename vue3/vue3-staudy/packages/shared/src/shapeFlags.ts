export const enum ShapeFlags {
  ELEMENT = 1, //虚拟节点是一个元素
  FUNCTIONAL_COMPONENT = 1 << 1, //函数式组件
  STATEFUL_COMPONENT = 1 << 2, //普通组件
  TEXT_CHILDREN = 1 << 3, //儿子是文本的
  ARRAY_CHILDREN = 1 << 4, //儿子是数组的
  SLOTS_CHILDREN = 1 << 5, //插槽
  TELEPORT = 1 << 6, //
  SUSPENSE = 1 << 7,
  COMPONENT_SHOULD_KEEP_ALIVE = 1 << 8, //keep-alive
  COMPONENT_KEPT_ALIVE = 1 << 9, //keep-alive
  COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT, //是函数式组件或者是普通组件
}

// << 0000 0001<<1 == 0000 0010 移位

// |
// 0000 0010
// 0000 0001
//     |
// 0000 0011

//使用大范围范围数 与 小的数 > 0 ? 说明大的数包含小的数 : 大数不包含小的数
// &
// 0000 0010
// 0000 0011
//     &
// 0000 0011
