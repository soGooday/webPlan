import { reactive, ReactiveEffect } from "@vue/reactivity";
import { hasOwn, ShapeFlags } from "@vue/shared";
import { createComponentInstance, setupComponent } from "./component";
import { initProps } from "./componentProps";
import { queueJob } from "./scheduler";
import { Fragment, isSameVNode, Text } from "./vnode";

export function createRenderer(options) {
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
    nextSibling: hostNextSibling,
    // setScopeId: hostSetScopeId = NOOP,
    // insertStaticContent: hostInsertStaticContent,
  } = options;
  /**
   * 检测子节点
   * @param children 子节点
   * @param el 要挂载的荣区
   */
  const mountChildren = (children, el) => {
    for (let index = 0; index < children.length; index++) {
      //因为是第一个渲染，所以第一个参数是空
      path(null, children[index], el);
    }
  };
  /**
   * 移除指定节点下的子节点
   * @param children
   */
  const unmountChildren = (children) => {
    for (let index = 0; index < children.length; index++) {
      //因为是第一个渲染，所以第一个参数是空
      unmount(children[index]);
    }
  };
  /**
   * 挂载节点
   * @param vnode
   * @param container
   */
  const mountElement = (vnode, container, anchor) => {
    const { type, props, children, shapeFlage } = vnode;

    //将创建的节点保存起来
    const el = hostCreateElement(type);
    vnode.el = el;

    //增加属性
    if (props) {
      for (const key in props) {
        hostPatchProp(el, key, null, props[key]);
      }
    }
    //子节点是数组
    if (ShapeFlags.ARRAY_CHILDREN & shapeFlage) {
      //检测子节点
      mountChildren(children, el);
    } else if (ShapeFlags.TEXT_CHILDREN & shapeFlage) {
      //子节点是一个文本
      hostSetElementText(el, children);
    }

    hostInsert(el, container, anchor);
  };
  /**
   * 比较新老节点的属性
   * @param oldProps
   * @param newprops
   * @param el
   */
  const patchProps = (oldProps, newprops, el) => {
    //属性不相同的地址
    if (oldProps !== newprops) {
      //遍历新的属性
      for (const key in newprops) {
        const prev = oldProps[key]; //老属性
        const next = newprops[key]; // 新属性
        //如果新老属性不同，就说明要发生变化了
        if (prev !== next) {
          //用新的盖掉老的
          // debugger;
          hostPatchProp(el, key, prev, next);
        }
      }
      //遍历老的
      for (const key in oldProps) {
        //新属性中的值 在老属性中并不存在
        if (!(key in newprops)) {
          const prev = oldProps[key]; //老属性
          //将老属性去除
          hostPatchProp(el, key, prev, null);
        }
      }
    }
  };
  const pathKeyChildren = (c1, c2, el) => {
    //全量的diff算法，对比过程深度遍历，先遍历父亲，在遍历孩子，从父到子 都要对比一边
    //目前是没有优化对比，没有关心 只对比变化的部分 blockTree patch Flages
    //同级对比 父父对比 子子对比 孙孙对比 采用的是深部遍历

    let i = 0; //默认从0开始
    //当前的使用的例子是下面，所以这三个值是这样的 i = 0 , el = 2，e2 =3

    //c1 = [a,b,c]
    //c2 = [a,b,c,d]

    let e1 = c1.length - 1;
    let e2 = c2.length - 1;
    //从前面开始比较
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i];

      //遍历是不是他同一个节点
      if (isSameVNode(n1, n2)) {
        //标签类型 与 id相同 需要遍历当前节点的属性以及当前节点的子节点
        path(n1, n2, el); //深度遍历
      } else {
        //如果不是同一个节点 就不需要对比了
        break;
      }
      i++;
    }
    // 按照上面的例子 最终执行完毕
    //变量的值分别是 i=2 el=2 e2=3

    //从尾部开始比较
    //c1 = [a,b,  ,e,d]
    //c2 = [a,b, c,e,d]
    // debugger;
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2];

      //遍历是不是他同一个节点
      if (isSameVNode(n1, n2)) {
        //标签类型 与 id相同 需要遍历当前节点的属性以及当前节点的子节点
        path(n1, n2, el); //深度遍历
      } else {
        //如果不是同一个节点 就不需要对比了
        break;
      }
      e1--;
      e2--;
    }
    //变量的值分别是 i=2 el=1 e2=2

    //a b
    //a b c i=2 el=1 e2=2

    //   a b
    // c a b i=0 el=-1 e2=1
    //我想要知道 我添加还是删除 ？ 1 比 e1 大说明新的长 老的短
    //通序列 挂载
    if (i > e1) {
      if (i <= e2) {
        while (i <= e2) {
          // 看下 如果e2的值移動往前插入，那么e2的下一个值一定是存在的，意味着向前插入
          //如果e2的值没有动，那么下一个就是空，意味着是向后插入的

          const nextPos = e2 + 1;
          //vue2 是看下下一个元素存不存在
          //vue3 是看下一个元素的长度 是否越界
          const anchor = nextPos < c2.length ? c2[nextPos].el : null;
          path(null, c2[i], el, anchor); //做判断 决定插入是向前还是向后
          i++;
        }
      }
    }

    //老的大于新增的数量
    // a b c d
    // a b      i =2 e1=3 e2=1

    // a b c d
    //     a b      i =0 e1=1 e2=-1
    else if (i > e2) {
      while (i <= e1) {
        //删除比新的多的量
        unmount(c1[i]);
        i++;
      }
    } else {
      //老的数量小于新的
      // a b c d e   f g
      // a b e c d h f g   i= 2 e1 =4 e2=5

      //转化为了
      // c d e
      // e c d h
      let s1 = i;
      let s2 = i;
      // i=2 e1=4 e2=5;
      //如何复用老节点
      const keyToNewIndexMap = new Map();
      //将新的节点中的数据保存起来
      for (let i = s2; i <= e2; i++) {
        const vnode = c2[i];
        keyToNewIndexMap.set(vnode.key, i);
      }
      // e c d h 新的长度
      const toBepathed = e2 - s2 + 1;
      const newIndexToOldMapIndex = new Array(toBepathed).fill(0); //[0, 0, 0, 0];
      //有了新的映射表后，去老的中查找一下，看看是不是选在，存在说明可以复用

      for (let i = s1; i <= e1; i++) {
        const vnode = c1[i];
        let newIndex = keyToNewIndexMap.get(vnode.key);
        //不存在说明老的里面没有
        if (newIndex === undefined) {
          //没有的话 就可以进行删除
          unmount(vnode);
        } else {
          //新的中存在，就将数组中的对应位置从0 改为其对应位置上i+1 因为i有可能是0 对应的位置是老索引+1
          newIndexToOldMapIndex[newIndex - s2] = i + 1;
          //如果能复用就比较两个节点
          path(vnode, c2[newIndex], el);
        }
      }
      //[5,3,4,0]
      //[0,1,2,3]
      //seq=[1,2]
      //写到这里 我们已经复用了节点 并且更新的复用节点的属性，差移动操作，和新的里面有老的里面没有的操作
      const seq = getSequence(newIndexToOldMapIndex);
      let j = seq.length - 1;

      // debugger; //a b e c d h f g
      for (let i = toBepathed - 1; i >= 0; i--) {
        const nextIndex = s2 + i; //下一个元素
        const nextChild = c2[nextIndex]; //先拿到h

        //看下 h 后面是否有值
        const anchor = nextIndex + 1 < c2.length ? c2[nextIndex + 1].el : null;
        if (newIndexToOldMapIndex[i] == 0) {
          //将新增的元素插到f前面
          path(null, nextChild, el, anchor);
        } else {
          if (i !== seq[j]) {
            //倒叙插入
            hostInsert(nextChild.el, el, anchor);
          } else {
            j--; //不做移動跳過就好
          }

          //这个插入操作比较暴力，做个一次整体的移动，但是我们需要优化不动的那一项
          //[5,3,4,0] -》 [3,4]
          //索引为1和2的不移动
          //例子
          //[2,5,8,6,7,9]  找递增序列中最长的 2 5 6 7 9 不需要连续
        }
      }
    }
  };
  /**
   * 比较子节点的新老属性 从而更新属性
   * @param n1 老节点
   * @param n2 新节点
   * @param el 容器
   */
  const patchChildren = (n1, n2, el) => {
    const c1 = n1.children; //老子节点
    const c2 = n2.children; //新子节点

    const prevShapeFlag = n1.shapeFlage; //老节点型
    const shapeFlage = n2.shapeFlage; //新节点类型

    //新    旧
    //文本  数组
    //文本  文本
    //文本  空
    //数组  数组 （最复杂了diff算法）
    //数组  文本
    //数组  空
    //空    数组
    //空    文本
    //空    空

    //情况一 新子节点是文本
    //文本  数组
    //文本  文本
    //文本  空
    if (ShapeFlags.TEXT_CHILDREN & shapeFlage) {
      //文本  数组
      //老子节点是数组
      if (ShapeFlags.ARRAY_CHILDREN & prevShapeFlag) {
        //移除老的子节点
        unmountChildren(c1);
      }
      //文本  文本
      //文本  空
      if (c1 !== c2) {
        hostSetElementText(el, c2);
      }
    } else {
      //情况二 新子节点是数组
      //数组  数组 （最复杂了diff算法）
      //数组  文本
      //数组  空
      //老子节是数组
      if (ShapeFlags.ARRAY_CHILDREN & prevShapeFlag) {
        if (ShapeFlags.ARRAY_CHILDREN & shapeFlage) {
          //新子节点是数组
          //数组  数组 （最复杂了diff算法）
          pathKeyChildren(c1, c2, el);
        } else {
          //老是数组 新的不是数组 就删除
          unmountChildren(c1);
        }
      } else {
        //如果老的是文本，就清空一下，为下面挂数组做清除文本工作
        //数组  文本
        if (ShapeFlags.TEXT_CHILDREN & prevShapeFlag) {
          hostSetElementText(el, "");
        }
        //新的是数组
        if (ShapeFlags.ARRAY_CHILDREN & shapeFlage) {
          mountChildren(c2, el);
        }
      }
    }
  };
  /**
   * 对新老节点进行处理
   * @param n1 老节点
   * @param n2  新节点
   */
  const pathElement = (n1, n2) => {
    // debugger;
    let el = (n2.el = n1.el);
    const oldprops = n1.props || [];
    const newprops = n2.props || [];
    //对属性进行修改
    patchProps(oldprops, newprops, el);
    //对节点及其它的子节点内容进行比较与修改
    patchChildren(n1, n2, el);
  };
  /**
   * 处理节点
   * @param n1 节点1
   * @param n2 节点2
   * @param container 挂载点
   */
  const processElement = (n1, n2, container, anchor) => {
    if (n1 == null) {
      //初次更新
      mountElement(n2, container, anchor);
    } else {
      //diff 算法
      // debugger;
      pathElement(n1, n2);
    }
  };
  /**
   * 對文本的處理
   * @param n1
   * @param n2
   * @param container
   */
  const processText = (n1, n2, el) => {
    if (n1 == null) {
      hostInsert((n2.el = hostCreateText(n2.children)), el);
    } else {
      let el = (n2.el = n1.el);
      if (n1.children !== n2.children) {
        //更新文本
        hostSetText(el, n2.children);
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
    //如何挂载节点 vnode指代的是组件的虚拟节点  subTree render函数返回的虚拟节点
    // debugger;
    // console.log("vnode.type:", vnode.type);
    // const state = reactive(data());
    //创建实例
    const instance = (vnode.component = createComponentInstance(vnode)); //让虚拟节点知道对应的组件
    //给实例赋值
    setupComponent(instance);
    //创建组件的effect
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
    debugger
    //属性更新
    updateProps(instance.props, next.props);
    //插槽更新
  };
  const setupRenderEffect = (instance, container, anchor) => {
    let { render } = instance;
    const componentFun = () => {
      if (!instance.isMounted) {
        //第一次挂载
        const subTree = render.call(instance.proxy); //这里会做依赖收集 数据发生变化会再次调用effect
        path(null, subTree, container, anchor);
        instance.subTree = subTree; //第一渲染产生的vnode
        instance.isMounted = true;
      } else {
        // debugger;
        // let { next } = instance;
        if (instance.next) {
          debugger;
          updateComponentPreRender(instance, instance.next);
        } 
        //后续组件更新
        const subTree = render.call(instance.proxy); //这里会做依赖收集 数据发生变化会再次调用effect
        path(instance.subTree, subTree, container, anchor); //将第一次的更新节点与本次的节点对比更新起来
        instance.subTree = subTree; //将本次的虚拟节点收集起来，下次对比使用
      }
    };

    const effect = new ReactiveEffect(componentFun, () => {
      //异步更新
      queueJob(instance.update);
    });
    //更新方法
    let update = (instance.update = effect.run.bind(effect));
    update();
  };
  const hasPropsChange = (prevProps = {}, nextvProps = {}) => {
    let l1 = Object.keys(prevProps);
    let l2 = Object.keys(nextvProps);
    if (l1.length !== l2.length) return true;
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
    if (prevChilder || nextChilder) return true;
    if (prevProps === nextvProps) return false;
    return hasPropsChange(prevProps, nextvProps);
  };
  const updateComonent = (n1, n2) => {
    //复用组件
    let instance = (n2.component = n1.component);
    //对比属性与插槽 是不是需要进行更新
    if (shouldCompontUpdate(n1, n2)) {
      debugger;
      instance.next = n2;
      instance && instance.update();
    }
  };
  const processComponent = (n1, n2, container, anchor = null) => {
    if (n1 == null) {
      //组件创建
      mountComponent(n2, container, anchor);
    } else {
      //组件更新  指代组件行书 插槽更新
      debugger;
      updateComonent(n1, n2);
    }
  };
  /**
   * 开始diff算法 每增加一个类型 就要考虑 初始化 更新 删除
   * @param n1 老节点
   * @param n2 新节点
   * @param container 节点挂载容器
   * @returns
   */
  const path = (n1, n2, container, anchor = null) => {
    if (n1 == n2) {
      return;
    }
    //如果n1 n2都有值，但是类型不容 删除n1
    if (n1 && !isSameVNode(n1, n2)) {
      //将n1卸载掉
      unmount(n1);
      //n1 置空
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
        if (shapeFlage & ShapeFlags.ELEMENT) {
          //对节点的处理
          processElement(n1, n2, container, anchor);
        } else if (shapeFlage & ShapeFlags.COMPONENT) {
          processComponent(n1, n2, container, anchor);
        }
    }
  };
  const unmount = (vnode) => {
    //碎片节点 直接删除子节点
    if (vnode.type === Fragment) {
      return unmountChildren(vnode.children);
    }
    //正常的节点删除当前的节点就行
    hostRemove(vnode.el);
  };
  /**
   * 虚拟渲染节点
   * @param vnode  虚拟节点
   * @param container 节点挂载容器
   */
  const render = (vnode, container) => {
    debugger
    console.log(1)
    //检测传递回来的vnode是null 就说明是卸载
    if (vnode == null) {
      //只有之前使用的渲染的方法，才能进行卸载，要不然无法卸载
      if (container._vnode) {
        unmount(container._vnode);
      }
    } else {
      // debugger;
      //初次渲染 更新
      path(container._vnode || null, vnode, container);
    }
    //将虚拟节点防止在container下面 进行保存
    container._vnode = vnode;
  };
  return {
    //createRenderer 可以使用用户自定的渲染方法
    //createRenderer 返回一个render方法，接受虚拟节点与容器
    render: render,
  };
}

/**
 * 最常递增子序列
 * @param {Array} arr
 * @returns
 */
function getSequence(arr) {
  let len = arr.length;
  let result = [0];

  let resultLastIndex;
  let start;
  let end;
  let middle;
  let p = arr.slice(0);
  for (let i = 0; i < arr.length; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      resultLastIndex = result[result.length - 1];
      if (arr[resultLastIndex] < arrI) {
        result.push(i);

        p[i] = resultLastIndex; //最后一项 记住前一项的索引
        continue;
      }

      start = 0;
      end = result.length - 1;
      while (start < end) {
        middle = ((start + end) / 2) | 0; //向下取整
        if (arr[result[middle]] < arrI) {
          start = middle + 1;
        } else {
          end = middle;
        }
      }
      if (arrI < arr[result[start]]) {
        p[i] = result[start - 1]; //最后一项 记住前一项的索引
        result[start] = i;
      }
    }
  }
  let i = result.length;
  let last = result[i - 1]; //最后一项索引

  while (i-- > 0) {
    result[i] = last; //最后一项的索引来追溯
    last = p[last]; //用p中的索引 来引导追溯
  }

  return result;
}
// let result = getSequence([2, 5, 8, 4, 6, 7, 9, 3]);
// console.log(result);
