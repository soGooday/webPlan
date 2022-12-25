import { reactive } from "@vue/reactivity";

export function initProps(instance, rawProps) {
  const props = {};
  const attrs = {};
  const options = instance.propsOptions;
  if (rawProps) {
    for (const key in rawProps) {
      const value = rawProps[key];
      if (key in options) {
        props[key] = value; //传递的属性
      } else {
        attrs[key] = value; //attr的属性
      }
    }
  }
  instance.props = reactive(props); //原则上props只要管理第一层就可以了
  instance.attrs = attrs;
}
