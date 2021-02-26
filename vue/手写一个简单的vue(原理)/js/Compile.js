class Compile {
    constructor(data,vm,el) {
        this.$data = data;
        this.$vm = vm;
        this.$el = el;
        this.$elNode = document.querySelector(this.$el);

        if(this.$elNode){
            this.fragmentArry = this.getFragment(this.$elNode);
            this.compileElement(this.fragmentArry,this.$data)
            this.$elNode.appendChild(this.fragmentArry)
        }
    }

    /**
     * 得到元素碎片
     * @param el
     * @returns {DocumentFragment}
     */
    getFragment(el){
        const fragmentArry = document.createDocumentFragment();
        let childNode;
        while((childNode = el.firstChild)){
            fragmentArry.appendChild(childNode);
        }
        return fragmentArry;
    }

    /**
     *
     * @param fragmentArry 碎片
     * @param data 数据
     */
    compileElement(fragmentArry,data){
        let childNodes = fragmentArry.childNodes;
        let  reg = /\{\{(.*)\}\}/
        Array.from(childNodes).forEach(node => {

            if(this.isElement(node)){
                this.elementComplice(node,this.$vm)

            }else  if(this.isTextNode(node) && reg.test(node.textContent)){
                this.textComplice(this.$vm,node,RegExp.$1,reg,'text');
            }

            //取到文本你
            if(node.childNodes && node.childNodes.length>0){
                this.compileElement(node,data)
            }

        })
    }
    //是否为文本
    isTextNode(node){
        return  node.nodeType === 3
    }
    //是否为节点
    isElement(node) {
        return  node.nodeType === 1;
    }



    /**
     * 文本内容的更新
     * @param node
     * @param value
     */
    textUpdata(node,value){
        node.textContent = value ;
    }

    /**
     * 输入框的数值
     * @param node
     * @param value
     */
    modelUpdata(node, value) {
        node.value = value;
    }

    /**
     * 增加子节点
     * @param node
     * @param value
     */
    htmlUpdata(node, value){
        node.innerHTML = value
    }

    /**
     * 对文本节点进行编译
     * @param vm
     * @param node
     * @param key
     * @param reg
     */
    textComplice(vm,node,key,reg,type){
        this.updata(vm,node,key,type)
    }
    /**
     * 传入类型从而去寻找相关的数据
     * @param type
     */
    updata(vm,node,key,type){
        let updataFun = this[type+'Updata']

        updataFun && updataFun(node,vm[key])
        new Watcher(vm,key,(newValue)=>{
            updataFun && updataFun(node,newValue)
        })

    }

    /**
     *
     * @param node
     */
    elementComplice(node,vm){
        const nodeAttrs = node.attributes;

        Array.from(nodeAttrs).forEach(attrbute=>{
            const key = attrbute.name; //属性名
            const value = attrbute.value; // 属性值
            if(key === '@click' || key === 'v-on:click'){
                this.btnEvent(node,vm,value)
            }else if(key === 'v-model'){
                this.inputEvent(node,vm,value)
            }else if(key === 'v-text'){
                this.updata(vm,node,value,'text')
            }else if(key === 'v-html'){
                this.updata(vm,node,value,'html')
            }
        })
    }

    /**
     * 当按钮事件
     * @param node
     * @param vm
     */
    btnEvent(node,vm,methodName){
        let fun =  vm.$options.methods && vm.$options.methods[methodName];
        node.addEventListener('click',()=>{
            fun.call(vm);
            // console.log( vm.$options.methods)
        })
    }

    /**
     * 处理input输入框中的双向数据绑定
     * @param node
     * @param vm
     * @param parameter
     */
    inputEvent(node,vm,parameter){
        //将输入框的内容 放到绑定的变量里面
        this.updata(vm,node,parameter,"model")

        node.addEventListener('input',(e)=>{
            vm[parameter] = e.target.value;
        })
    }



}