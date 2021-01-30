class PM {
    static PENDING = "pending";
    static FULFULLED = "fulfilld";
    static REJAECTED = "rejected";
    constructor(executer) {
        this.status = PM.PENDING;
        this.value = '';
        this.callBackList = [];
        //对错误进行一个捕获
        try {
            executer(this.fulfilled.bind(this), this.rejected.bind(this));
        } catch (err) {
            this.rejected(err)
        }

    }
    fulfilled(reason) {
        if (this.status === PM.PENDING) {//防止状态发生改变
            this.status = PM.FULFULLED;
            this.value = reason;
            setTimeout(() => {
                this.callBackList.map(callBack => {
                    callBack.onFulFilled(reason)
                })
            })
        }

    }
    rejected(reason) {
        if (this.status === PM.PENDING) {//防止状态发生改变
            this.status = PM.REJAECTED;
            this.value = reason;
            setTimeout(() => {
                this.callBackList.map(callBack => {
                    callBack.onRejected(reason) 
                })
            })

        }
    }
    then(onFulFilled,onRejected) {
        if(typeof onFulFilled !== 'function'){
            onFulFilled=()=> this.value;
        }
        if(typeof onRejected !== 'function'){
            onRejected=()=> this.value;
        }
        return new PM((resolve, reject) => {
            if (this.status === PM.PENDING) {
                this.callBackList.push({ 
                    onFulFilled: value => {
                        this.parse(onFulFilled(value),resolve,reject);  
                    },
                    onRejected: value => {
                        this.parse(onRejected(value),resolve,reject);   
                    }
                });
            } 
            if (this.status === PM.FULFULLED) {//防止状态发生改变 
                setTimeout(() => {
                    this.parse(onFulFilled(this.value),resolve,reject); 

                })
            }
            if (this.status === PM.REJAECTED) {//防止状态发生改变
                setTimeout(() => {
                    this.parse(onRejected(this.value),resolve,reject);  
                })


            }
        })


    }
    parse(result,resolve,reject){ 
        try { 
            if(result instanceof PM){
             result.then(resolve,reject)
            } else{
             resolve(result)
            }
         } catch (error) { 
             reject(error)
         }

    }


}