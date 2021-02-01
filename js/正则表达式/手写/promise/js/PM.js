class PM{
    static PENDING = "pending";
    static FULFULLED = "fulfilld";
    static REJAECTED = "rejected";
    constructor(executer){ 
        this.status = PM.PENDING;
        this.value = '';
        this.callBackList=[];
        //对错误进行一个捕获
        try{
            executer(this.fulfilled.bind(this),this.rejected.bind(this));
        }catch (err){
            this.rejected(err)
        }
      
    }
    fulfilled(reason){
        if(this.status === PM.PENDING){//防止状态发生改变
            this.status = PM.FULFULLED;
            this.value = reason;
            setTimeout(()=>{
                this.callBackList.map(callBack=>{
                    callBack.onFulFilled(reason)
                })
            }) 
        }
       
    }
    rejected(reason){
        if(this.status === PM.PENDING){//防止状态发生改变
            this. status = PM.REJAECTED;
            this.value = reason;
            setTimeout(()=>{
                this.callBackList.map(callBack=>{
                    callBack.onRejected(reason)
                    console.log(callBack);
                })
            })
      
        } 
    }
    then(onFulFilled=()=>{},onRejected=()=>{}){ 
        if(this.status === PM.PENDING){
            this.callBackList.push({
                onFulFilled:value=>{
                    try{
                        onFulFilled(value);
                    }catch(error){
                        onRejected(error);
                    }
                },
                onRejected:value=>{
                    try{
                        onRejected(value);
                    }catch(error){
                        onRejected(error);
                    }
                }
            });
        }

        if(this.status === PM.FULFULLED){//防止状态发生改变 
            setTimeout(()=>{
                try{
                    onFulFilled(this.value)
                }catch(error){
                    onRejected(error)
                }
               
            })  
        }
        if(this.status === PM.REJAECTED){//防止状态发生改变
            setTimeout(()=>{
                try{
                    onRejected(this.value)
                }catch(error){
                    onRejected(error)
                }
            })
        
         
        }
    }

    

}