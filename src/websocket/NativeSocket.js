

class NativeSocket {
    socket = null;

    address = null

    eventNameAdaptor = {
        connect: 'open',
        disconnect: 'close',
        message: 'message',
        error: 'error',
        connecting: 'connecting',
        reconnecting: 'reconnecting'
    }

    events = {}


    connect(address, config) {
        // debugger;
        this.shouldReconnect = true;
        if (this.socket) {
            // debugger;
            this.emit('reconnecting');
        } else {
            this.emit('connecting');
        }

        const socket = new WebSocket(address, config)

        this.address = address;

        this.socket = socket;

        socket.addEventListener('open', () => {
            this.emit('open');
        })

        socket.addEventListener('error', (event) => {


            this.emit('error', 'An error occurred');
        })

        socket.addEventListener('close', (e) => {
            // console.log('close code', e.code)
            // console.log('close reason', e.reason)
            // console.log('readystate', this.socket.readyState)

            if (e.code != 1000 && this.shouldReconnect == true) {
                this.connect(address)
            }
        })

        socket.addEventListener('message', ({ data }) => {
            // debugger;
            this.emit('message', data)
        })
        return socket;



    }

 

    disconnect() {
        // debugger;
        this.shouldReconnect = false;
        this.socket && this.socket.close();

    }

    on(originalEventName, callback) {
        //  debugger;
        if (this.eventNameAdaptor.hasOwnProperty(originalEventName)) {
            this.events[this.eventNameAdaptor[originalEventName]] = callback;
        }
        //  this.socket.addEventListener(adaptedEventName,callback);


    }

    emit(eventName, ...args) {//Function that emits an event to the consumer module.
        if (this.events[eventName])
            this.events[eventName](...args);
    }


    send({args}) {
        //  debugger;
        console.log(args)

        this.socket.send(args[0]);
    }


}

export default NativeSocket;