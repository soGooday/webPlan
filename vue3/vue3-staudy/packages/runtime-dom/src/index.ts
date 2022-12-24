// // 对元素可以进行节点操作
// import { nodeOps } from "./nodeOps";
// import { pathchProp } from "./pathProp";
// import { createRenderer } from "@vue/runtime-core";

// const renderOptions = Object.assign(nodeOps, { pathchProp });
// //dom 操作api
// console.log(renderOptions);

// export const render = (vnode, container) => {
//   // console.log(renderOptions.pathchProp);
//   return createRenderer(renderOptions).render(vnode, container);
// };

// // export const initCustomFormatter = () => {};
// // export const warn = () => {};

// export * from "@vue/runtime-core";



// 对元素可以进行节点操作
import { nodeOps } from "./nodeOps";
import { pathchProp } from "./pathProp";
import { createRenderer } from "@vue/runtime-core";

const renderOptions = Object.assign(nodeOps, { pathchProp });
//dom 操作api
console.log(renderOptions);

export const render = (vnode, container) => {
  // console.log(renderOptions.pathchProp);
  return createRenderer(renderOptions).render(vnode, container);
};

// export const initCustomFormatter = () => {};
// export const warn = () => {};

export * from "@vue/runtime-core";
