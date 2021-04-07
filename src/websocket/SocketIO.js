
import { io } from "socket.io-client";

class SocketIO {
    socket = null;
    originalOnevent=null;
    nativeSocketIOEvents = ['connect', 'reconnect', 'reconnecting', 'disconnect','error', 'connect_error']//The "native" socketIO events will be handled 
    //differently in the "on" method.

    events = {}//A dictionary of events.

    connect(address, config) {
        // debugger;
        const socket = io(address, config);
        this.socket = socket;
        this.originalOnevent = socket.onevent;

        socket.on('connect', () => {
            this.id = socket.id;
             this.emit('connect') 
        })


        socket.on('disconnect', (reason) => {
            // debugger;
            if (this.events.disconnect) {
                if (reason === 'io server disconnect') {
                   this.emit('disconnect',1008) 
                } else if (reason === 'transport close') {
                  this.emit('disconnect',1006)  
                }
            }


        })


        socket.on('connecting', () => {
            this.emit('connecting')  
        })

        socket.on('reconnecting', () => {
            this.emit('reconnecting') 
        })

        socket.on('reconnect', () => {
            this.emit('reconnect')  
        })

        socket.on('connect_error', (error) => {
            // debugger;
             this.emit('error','Error connecting to the server');
        })

        socket.on('error', (error) => {
            if(typeof error === 'object'){
                this.emit('error','An error occurred')  
            }else{
               this.emit('error',error)
            }
            
        })
        return socket;
        // this.originalOnevent = socket.onevent;
        // return socket;

    }

    emit(eventName,...args){//Function that emits an event to the consumer module.
        if(this.events[eventName])
            this.events[eventName](...args);
    }

    off(eventName) {//Turns off an event listener.
        this.socket.off(eventName);
    }

    disconnect() {
       this.socket && this.socket.disconnect();
    }

    on(event, callback) {//This is the "on" function that is exposed to the consumer. It's not the native "on"!
        //  this.socket.on(event,callback);
        if(this.nativeSocketIOEvents.includes(event)){//If it's a native socketIO event, like "connect", interception is used.
           this.events[event] = callback;  
        }else{//If it's a custom user event, it's registered to socketIO.
            this.socket.on(event,callback);
        }
       
    }


    send({eventName,args}) {//Sends a message
        //  debugger;
        console.log(args)

        this.socket.emit(eventName,...args);
    }

    listenToAllEvents = (on, callback) => {//Will make an instance listen to every incoming socketIO message, prompting addition of the message to the
        // debugger;
        const that = this;

        if (on) {

            this.socket.onevent = function (packet) {//This intercepts the original onevent function, which gets fired on every incoming event.
                const eventName = packet.data[0];//Extracts the event name.  

                callback(eventName)//Registers the event

                that.originalOnevent.call(this, packet);//Calls the original onevent function, for normal application flow. The reference was created after
                //socket initialization.

            };

        } else {
            // debugger;
            this.socket.onevent = this.originalOnevent;

            //   that.unregisterAnonymousEvents(instanceId)

        }

    }


}

export default SocketIO;