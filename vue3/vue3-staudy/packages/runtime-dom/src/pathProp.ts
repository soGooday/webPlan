import { patchAttr } from "./modules/attr";
import { patchClass } from "./modules/class";
import { patchEvent } from "./modules/event";
import { patchStyle } from "./modules/style";

export const pathchProp = (el, key, prevValue, nextVlue) => {
  //class stytle event attr

  if (key === "class") {
    //class  直接把最近的class串传递进去
    patchClass(el, nextVlue);
  } else if (key === "style") {
    //{color:'red',fontSize:12}{color:'red'}
    //style
    patchStyle(el, prevValue, nextVlue);
  } else if (/^on[A-Z]/.test(key)) {
    //event
    //事件操作 ？ addEventListener : removeEventListener
    // @click="fn1" @click="fn2"
    patchEvent(el, key, nextVlue);
  } else {
    //attr
    patchAttr(el, key, nextVlue);
  }
};
