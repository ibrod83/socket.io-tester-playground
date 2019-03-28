class EventsDecorator {

    constructor(SocketIO) {
        this.decorated = SocketIO;
    }

    connect(address, config) {
        const socket = this.decorated.connect(address, config);
        this.socket = socket;
        // debugger;
        this.originalOnevent = socket.onevent;

    }


    disconnect() {
        this.decorated.disconnect();
    }

    on(event, callback) {
        this.decorated.on(event, callback);
    }

    off(eventName){
        this.decorated.off(eventName);
    }

   
    send({eventName,args}) {//eventName:String, args:Array
       
        // debugger;
        this.decorated.send(eventName,...args);
    }



    listenToAllEvents = (on, callback) => {//Will make an instance listen to every incoming socketIO message, prompting addition of the message to the
        debugger;
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

    off(eventName) {
        this.decorated.off(eventName);
    }
}

export default EventsDecorator;