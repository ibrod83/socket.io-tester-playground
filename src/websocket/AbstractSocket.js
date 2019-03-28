


class AbstractSocket{
    constructor(ConcreteSocket){
        this.concrete = ConcreteSocket;
    }

    connect(address,config){
        this.concrete.connect(address,config);
    }

    disconnect(){
        this.concrete.disconnect();
    }

    on(event,callback){
        this.concrete.on(event,callback);
    }

    off(eventName){
        this.concrete.off(eventName);
    }

    listenToAllEvents(on,callback){
        this.concrete.listenToAllEvents(on,callback)
    }    
    
    send({eventName,args}){
        debugger;
        this.concrete.send({eventName,args});
    }


}

export default AbstractSocket;