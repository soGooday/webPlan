class Vue {
    constructor($options) {
        this.$options = $options;
        this.$el = this.$options.el;
        this.$data = this.$options.data;

        this.observer(this.$data);

        new Compile(this.$data,this,this.$el)

        if($options.created){
            this.$created = $options.created;
            this.createdFun(this.$created)
            this.$created();
        }
        // this.$methods = $options.methods; 
        // if($options.methods){
        //     this.$methods = $options.methods;
        //     this.methodsFun(this.$methods)
        // }

    }

    /**
     * 传入当前的data 并对类型进行处理
     * @param data
     */
    observer(data){
        if(!data || typeof data !== 'object' || data === null ){
            return
        }
        Object.keys(data).forEach(key=>{
            this.defindReactive(data,key,data[key]);
            this.proxyData(data,key,this);
        })
        //数据代理

    }

    /**
     * 处理依赖收集
     * @param obj 作用域
     * @param key 健
     * @param value 值
     */
    defindReactive(obj,key,value){
        this.observer(value);
        const dep = new Dep();
        Object.defineProperty(obj,key,{
            get() {
                Dep.targer && dep.addDep(Dep.targer);
                return value;
            },
            set(newValue) {
                if( newValue === value){
                    return
                }
                // console.log(`发现了${key}发生了变化，之前值：${value},现在的数据是:${newValue}`)
                value = newValue;
                dep.notefiy()
            }
        })
    }
    proxyData(data,key,vm) {
        // proxyData(data, key, vm)
        Object.defineProperty(vm, key, {
            get() {
                return data[key]
            },
            set(newValue) {
                data[key] = newValue;
            }
        })
    }
    createdFun(created){
        created.call(this.$options);
    }
    methodsFun(methods){
        Array.from(methods).forEach(method=>{
            method.call(this.$options)
        })

    }
}

//观察者模式
class Dep{
    constructor(){
        this.deps = [];
    }
    addDep(value){
        this.deps.push(value);
    }
    notefiy(){
        this.deps.forEach(watcher =>{
            watcher.updata();
        })
    }
}
class Watcher {
    constructor(vm,key,BACKFUN) {
        this.vm = vm ;
        this.key = key;
        this.BACKFUN = BACKFUN;

        Dep.targer = this;
        this.vm[this.key]//触发依赖的收集
        Dep.targer = null;
    }
    updata(){
        this.BACKFUN.call(this.vm,this.vm[this.key])
    }
}