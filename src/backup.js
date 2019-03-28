import React, { Component } from 'react';
// import Grid from '@material-ui/core/Grid';
import Alert from './Alert';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
// import DeleteSweepIcon from '@material-ui/icons/DeleteSweep';
// import Tooltip from '@material-ui/core/Tooltip';
import { observer } from 'mobx-react';
import Tabs from '@material-ui/core/Tabs';
// import Tab from '@material-ui/core/Tab';
import AppBar from '@material-ui/core/AppBar';
// import { withStyles } from '@material-ui/core/styles';
// import Fab from '@material-ui/core/Fab';
import RemovableTab from './Utilities/RemovableTab';
import AddIcon from '@material-ui/icons/Add';
// import ClearIcon from '@material-ui/icons/Clear';
// import { runInAction } from 'mobx';
import Messages from './Messages';
import RegisteredEvents from './RegisteredEvents';
import uuid from 'uuid';
import './App.scss';
// import Instance from './Instance';
import moment from 'moment';
import Header from './Header';
import AddEvent from './AddEvent'
import SendMessage from './MessageSending/SendMessage'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { blue, green, grey } from '@material-ui/core/colors';
import io from 'socket.io-client';
import store from './global';
import { handleAlertCloseAction, createAlertAction } from './global'
// import AbstractSocket from './websocket/AbstractSocket';
// import SocketIO from './websocket/SocketIO';
// import { Button } from '@material-ui/core';

const theme = createMuiTheme({
  palette: {
    primary: blue,
    success: green[600],
    pending: grey
  },
});



export default observer(
  class App extends Component {

    constructor(props) {

      super(props);

      const instance0 = this.generateInstance();
      // const instance1 = this.generateInstance();
      this.state = {
        instances: [instance0],//Each instance has its own socket messages and events. Represented by a tab.
        activeInstance: instance0.id//The instance represented by the active tab.
      }
    }

    // componentDidMount() {
    //   this.createMockMessages(100);
    // }

    createMockMessages = (num) => {

      // for (let ins of this.state.instances) {
      const messages = []
      for (let i = 0; i < num; i++) {
        messages.push({
          id: uuid(),
          owner: true,
          time: this.getTime(),
          eventName: this.state.activeInstance,
          args: [i + 1]

        })
      }
      // debugger;
      const { instances, instance } = this.getInstanceSlice(this.state.activeInstance);
      instance.messages = messages;
      this.setState(() => ({ instances }))
      // }

    }

    // getMessagesSlice = window.getMessagesSlice = (begin, end) => {
    //   const { instances, instance } = this.getInstanceSlice(this.state.activeInstance);
    //   const messages = instance.messages.slice(begin, end);
    //   // console.log(messages)
    //   return messages;
    // }




    getActiveInstance = () => {
      // debugger;
      console.log(this.state)
      return this.state.instances.filter(instance => instance.id === this.state.activeInstance)[0]
    }



    addInstance = () => {
      const instance = this.generateInstance();
      this.setState((state) => {
        return {
          instances: [...state.instances, instance],
          activeInstance: instance.id
        }
      })
    }

    doesInstanceExist(instanceId) {//Used by async operations.
      const instance = this.state.instances.filter(instance => instance.id === instanceId);
      if (instance.length > 0) {
        return true
      }
      return false;
    }


    generateInstance = () => {//Initial structure of an instance.

      const instance = {
        address: "ws://localhost:3003",
        id: uuid(),
        socket: null,
        configString: "",
        messages: [],
        // messages: fakeMessages,
        registeredEvents: {},
        anonymousEvents: {},
        allEventsChecked: false,
        connectionStatus: "disconnected"
      }

      return instance;
    }

    createConfigObjectFromString = (str) => {
      if (!str)
        return;

      let evalResult;
      eval(`evalResult = ${str}`);
      return evalResult

    }

    onHeaderValueChange = (name, val) => {

      const instanceId = this.state.activeInstance;//The connect function is relevant to the currently active instance(tab).

      const { instances, instance } = this.getInstanceSlice(instanceId);

      instance[name] = val;

      this.setState(() => ({ instances }));

    }

    // connectToWS = (address) => {

    //   console.log('connecting');


    //   const instanceId = this.state.activeInstance;//The connect function is relevant to the currently active instance(tab).

    //   const { instances, instance } = this.getInstanceSlice(instanceId);

    //   instance.connectionStatus = 'connecting';

    //   // const parsedConfig = this.createConfigObjectFromString(configString);

    //   this.setState(() => ({ instances }));

    //   if (instance.socket) {
    //     instance.socket.close();
    //   }

    //   const socket = new WebSocket(address);

    //   socket.addEventListener('open', () => {
    //     // console.log('yyoyoyoyoy connection!')
    //     const { instances, instance } = this.getInstanceSlice(instanceId);

    //     console.log('connected!')

    //     instance.connectionStatus = 'connected';
    //     instance.address = address;

    //     this.setState(() => ({ instances }));
    //   })

    //   socket.onmessage = (data) => {
    //     console.log('data', data)
    //   }


    // }


    connect = (address, configString) => {//Fired after a certain instance(tab) wants to create the initial connection
      // if(address.includes('ws:') || address.includes('wss:'))
      //   return this.connectToWS(address);

      console.log('connecting');


      const instanceId = this.state.activeInstance;//The connect function is relevant to the currently active instance(tab).

      const { instances, instance } = this.getInstanceSlice(instanceId);

      instance.connectionStatus = 'connecting';

      const parsedConfig = this.createConfigObjectFromString(configString);

      this.setState(() => ({ instances }));

      if (instance.socket) {
        instance.socket.disconnect();
      }

      var socket = instance.socket = parsedConfig ? io(address, parsedConfig) : io(address);
      // const abstractSocket = new AbstractSocket(new SocketIO());
      // const socket = instance.socket


      instance.originalOnevent = socket.onevent;//Create a reference to the original onevent function of SocketIO, to be used by the "listen to all events" mechanism.

      socket.on('connect', () => {

        const { instances, instance } = this.getInstanceSlice(instanceId);

        console.log('connected!')

        instance.connectionStatus = 'connected';
        instance.address = address;

        this.setState(() => ({ instances }));

      });


      socket.on('disconnect', (reason) => {
        console.log('reason', reason)
        if (reason === 'io server disconnect') {
          createAlertAction('error', 'Disconnected from the server');

          const instanceId = this.getInstanceBySocketId(socket.id).id;


          this.disconnectManually(instanceId);

        }
        // else the socket will automatically try to reconnect
      });


      socket.on('connect_error', (error) => {
        // console.log('Error connecting!', state)

        createAlertAction('error', 'Error connecting to the server');

      });


      socket.on('reconnect', (attemptNumber) => {

        const { instances, instance } = this.getInstanceSlice(instanceId);

        instance.connectionStatus = "connected";
        console.log('reconnected');

        store.alertOpen = false;

        this.setState(() => ({ instances }));

      });


      socket.on('reconnecting', (attemptNumber) => {
        console.log('reconnecting');

        const { instances, instance } = this.getInstanceSlice(instanceId);

        instance.connectionStatus = "reconnecting";

        this.setState(() => ({ instances }));

      });

      this.repeatEventRegistration(instance);//In case the user manually disconnected and reconnected, the events need to be re-registered.


    }



    repeatEventRegistration = (instance) => {
      if (Object.keys(instance.registeredEvents).length > 0) {//PROBLEM!!!!!!!! fix it
        console.log('re-registering events');
        for (let event of Object.keys(instance.registeredEvents)) {
          this.registerEvent(instance.id, event);
        }
      }

      if (instance.allEventsChecked) {
        this.listenToAllEvents(instance.id, true)
      }
    }


    registerEvent = (instanceId, eventName) => {

      const { instances, instance } = this.getInstanceSlice(instanceId);

      const socket = instance.socket;//The socket associated with this instance.

      if (socket) {
        this.registerEventToSocket(instanceId, socket, eventName)
      }

      instance.registeredEvents[eventName] = { name: eventName };//"instance" is not to be confused with the one from the callback scope.

      this.setState(() => ({ instances }));

    }



    registerEventToSocket = (instanceId, socket, eventName) => {
      socket.off(eventName);

      
      socket.on(eventName, (...args) => {
        console.log('on:', eventName, args)
        const lastArg = args[args.length - 1];
        const isFunction = this.isFunction(lastArg);

        if (isFunction) {
          lastArg();//If a callback was supplied from the server, it is invoked.
          var index = args.indexOf(lastArg);
          if (index > -1) {
            args.splice(index, 1);
          }

        }

        this.addMessageToState(instanceId, eventName, args, false)
      })
    }


    addMessageToState = (instanceId, eventName, args, owner, status) => {

      const messageId = uuid();

      const { instances, instance } = this.getInstanceSlice(instanceId);

      const time = this.getTime();
      // debugger;
      //*****UNDESRSTAND WHY THIS WASNT WORKING!!! */
      // instance.messages.push({ id: messageId, eventName, time, data, owner, status: 'pending' })//Adding a message to the instance.
      instance.messages = [...instance.messages, { id: messageId, eventName, time, args, owner, status }]

      this.setState(() => ({ instances }));

      return messageId;

    }


    getInstanceSlice = (id) => {//This function returns COPIES of both the entire instances array, and the specific instance object,
      //to be used in setState by the calling function.

      const instances = [...this.state.instances];//Copy the instances.

      let instance;
      instances.forEach((ins, index) => {
        if (ins.id === id) {
          instance = instances[index];//The actual instance
        }
      })
      return { instance, instances };//Return an object containing both.
    }




    listenToAllEvents = (instanceId, on) => {//Will make an instance listen to every incoming socketIO message, prompting addition of the message to the
      //instance.messages array.

      const { instance } = this.getInstanceSlice(instanceId);

      const socket = instance.socket;

      const that = this;

      if (on) {

        socket.onevent = function (packet) {//This intercepts the original onevent function, which gets fired on every incoming event.
          const eventName = packet.data[0];//Extracts the event name.

          const eventData = packet.data[1];//Extracts the data.

          that.registerAnonymousEvent(instanceId, eventName, eventData)//Registers the event

          instance.originalOnevent.call(this, packet);//Calls the original onevent function, for normal application flow. The reference was created after
          //socket initialization.

        };

      } else {
        // debugger;
        socket.onevent = instance.originalOnevent;

        that.unregisterAnonymousEvents(instanceId)

      }

    }



    registerAnonymousEvent = (instanceId, eventName) => {//This registers a callback for an event coming from SocketIO's Socket.prototype.onevent function.
      console.log('registering anonymous event:', eventName)

      const { instances, instance } = this.getInstanceSlice(instanceId);

      instance.anonymousEvents[eventName] = { name: eventName };

      const socket = instance.socket;

      if (socket) {

        this.registerEventToSocket(instanceId, socket, eventName)

      }

      this.setState(() => ({ instances }));

    }


    unregisterAnonymousEvents = (instanceId) => {//Clear all anonymous events for the given instance.
      // debugger;
      const { instances, instance } = this.getInstanceSlice(instanceId);

      const socket = instance.socket;

      for (let event in instance.anonymousEvents) {
        if (!instance.registeredEvents.hasOwnProperty(event)) {
          socket.off(event)
        }

      }
      instance.anonymousEvents = {}

      this.setState(() => ({ instances }));
    }



    onMessagesDelete = () => {//Fired when the user deletes all messages of an instance

      const instanceId = this.state.activeInstance;

      const { instances, instance } = this.getInstanceSlice(instanceId);

      instance.messages = [];

      this.setState(() => ({ instances }));

    }



    onConnectSubmit = (address, config) => {
      this.connect(address, config);
    }



    onDisconnectSubmit = () => {

      const instanceId = this.state.activeInstance;

      this.disconnectManually(instanceId);
    }



    disconnectManually = (instanceId) => {

      const { instances, instance } = this.getInstanceSlice(instanceId);

      const socket = instance.socket;

      console.log('disconnected manually')

      socket.disconnect();

      instance.connectionStatus = 'disconnected';

      this.setState(() => ({ instances }));
    }


    onMessageSubmit = (eventName, args, useCallback) => {
      const instanceId = this.state.activeInstance;

      const { instance } = this.getInstanceSlice(instanceId);

      const socket = instance.socket;

      const messageId = this.addMessageToState(instanceId, eventName, args, true, useCallback && 'pending');

      const callback = useCallback ? this.createAcknowledgementHandler(instanceId, messageId) : null;

      this.sendMessageToServer(socket, eventName, args, callback);
    }




    onMessageFail = (instanceId, messageId) => {//Fired when a message fails to receive a callback after a certain period of time.
      this.changeMessage(instanceId, messageId, { status: 'fail' })
    }




    createAcknowledgementHandler = (instanceId, messageId) => {//Creates the logic to handle the message success/failure.
      // debugger;
      var timeoutId = setTimeout(() => {//Timeout function that waits for the message callback.

        if (this.doesInstanceExist(instanceId)) {//This condition is to make sure, the instance still exists when the callback is fired.
          this.onMessageFail(instanceId, messageId);
        }

      }, 5000);

      return (callbackData) => {
        // debugger;
        clearTimeout(timeoutId);//Clear the timeout, so that an error is not fired.
        // debugger;
        console.log('response from callback', callbackData)
        // debugger;


        this.changeMessage(instanceId, messageId, { status: 'success', callbackData });


      }

      // this.sendMessageToServer(socket, eventName, args, callback);


    }



    sendMessageToServer = (socket, eventName, args, callback) => {//Emits the event.
      if (callback) {
        socket.emit(eventName, ...args, callback);//"data" can be multiple arguments.
      } else {
        socket.emit(eventName, ...args);//"data" can be multiple arguments.
      }


    }




    onMessageResend = (instanceId, messageId) => {//Fired when the user tries to resend a failed message.
      // debugger;

      this.changeMessage(instanceId, messageId, { status: 'pending' });

      const { instance } = this.getInstanceSlice(instanceId);

      const message = instance.messages.filter(message => message.id === messageId)[0];

      const eventName = message.eventName;

      const socket = instance.socket;

      const args = message.args;

      const callback = this.createAcknowledgementHandler(instanceId, messageId);

      this.sendMessageToServer(socket, eventName, args, callback);

    }




    changeMessage = (instanceId, messageId, obj) => {//Function that changes properties of a message(particularly "status").

      const { instances, instance } = this.getInstanceSlice(instanceId);

      // const multipleProps = typeof prop === 'object' && Array.isArray(prop);

      this.setState(() => {
        const messages = instance.messages.map((message) => {
          if (message.id === messageId) {

            return {
              ...message,
              ...obj
            }
          } else {
            return message;
          }
        })
        instance.messages = messages;
        return {
          instances
        }
      })
    }


    onEventSubmit = (instance, eventName) => {//Fired when a user adds an event listener manually.
      console.log(instance, eventName)
      this.registerEvent(instance, eventName);
    }



    onEventDelete = (name) => {//Fired when a user deletes an event listener manually.

      const instanceId = this.state.activeInstance;

      const { instances, instance } = this.getInstanceSlice(instanceId);

      const socket = instance.socket;

      socket.off(name);

      const oldEvents = instance.registeredEvents

      delete oldEvents[name];

      this.setState({
        instances
      })
    }


    getSocketByInstanceId = (instanceId) => {
      const instance = this.state.instances.filter(instance => instance.id === instanceId)[0];
      return instance.socket;
    }

    getInstanceBySocketId = (socketId) => {
      const instance = this.state.instances.filter(instance => instance.socket.id === socketId)[0];
      return instance;
    }



    handleAllEventsCheck = name => event => {//Fired when the user toggles the listen to all events checkbox on a particular instance.

      const { instances, instance } = this.getInstanceSlice(this.state.activeInstance);

      const checked = event.target.checked;

      instance.allEventsChecked = checked;

      this.setState(() => ({ instances }));

      this.listenToAllEvents(instance.id, checked);
    };



    getTime = () => {

      const unix = this.getMoment();
      return moment(unix * 1000).format('HH:mm');
    }



    getMoment = () => {

      return moment().unix();

    }

    isFunction = (functionToCheck) => {
      return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
    }



    handleAlertClose = (event, reason) => {
      handleAlertCloseAction(event, reason);
    };


    changeActiveInstance = (id) => {//Fired when user changes the tab.
      // debugger;
      this.setState(() => ({ activeInstance: id }))

    }


    createNewTab = () => {
      const instance = this.generateInstance();//When user creates a new tab, an instance is created(with socket as null).
      this.setState((state) => ({
        instances: [...state.instances, instance]
      }))

      this.changeActiveInstance(instance.id);

    }



    destroyInstance = (id) => {//Fired when a user destroys a tab.

      // e.stopPropagation();
      // debugger;
      console.log('destroy instance!')

      const { instances, instance } = this.getInstanceSlice(id);
      console.log(instance.socket);

      if (instance.socket) {//Disconnect the socket if exists.
        instance.socket.disconnect();
      }



      const tabIndex = instances.indexOf(instance);

      const tabLength = instances.length;

      let newIndex;

      if (tabLength - tabIndex === 1) {//Decide which tab will be active after update.
        newIndex = tabIndex - 1
      } else {
        newIndex = tabIndex
      }

      const newInstances = instances.filter(instance => instance.id !== id);//New instances array, without the deleted one.

      const lastInstance = newInstances[newIndex];

      this.setState({
        activeInstance: lastInstance.id,
        instances: newInstances,

      });

    }



    getTabAddress = (instance) => {//Get the address of the current tab. Needed for communication with the Header component, which also has its own independent "address" state.
      const address = instance.address;
      const connectionStatus = instance.connectionStatus;

      // debugger;
      if (connectionStatus === 'connected') {

        if (address.length > 14) {
          return address.slice(0, 14) + '...';
        } else {
          return address;
        }

      }

      else if (connectionStatus === 'disconnected') {
        return 'New connection'
      }
      else {
        return connectionStatus + '...'
      }
    }

    onScrollToBottom = () => {
      console.log('bottom!')
    }

    onScrollToTop = () => {
      console.log('Top!')
    }


    render() {

      const { instance, instances } = this.getInstanceSlice(this.state.activeInstance)//Get the currently active instance.

      // const { connectionStatus, allEventsChecked, registeredEvents, messages, address, configString } = instance;//Extract the props.
      const { connectionStatus, allEventsChecked, registeredEvents, address, configString } = instance;//Extract the props.

      // console.log('length from app render', messages.length)
      const activeInstanceId = instance.id;
      console.log('activeinstanceid', activeInstanceId)

      const tabIndex = instances.indexOf(instance);

      const firstInstance = instances[0]

      console.log('tab index', tabIndex)

      return (

        <MuiThemeProvider theme={theme}>
          <div id="wrapper">
            <AppBar color="default" position="static">
              <Tabs indicatorColor="primary" textColor="primary" value={tabIndex} onChange={this.handleChange}>
                {instances.map(instance =>
                  <RemovableTab
                    //  color="primary"
                    click={() => { this.changeActiveInstance(instance.id) }}
                    label={this.getTabAddress(instance)}
                    onClose={() => { this.destroyInstance(instance.id) }}
                    showIcon={instance.id !== firstInstance.id}
                  />

                )}

                <IconButton onClick={this.createNewTab} aria-label="New tab">
                  <AddIcon />
                </IconButton>

              </Tabs>
            </AppBar>

            <Header
              onAddressChange={(val) => { this.onHeaderValueChange('address', val) }}
              onConfigStringChange={(val) => { this.onHeaderValueChange('configString', val) }}
              key={activeInstanceId}
              address={address}
              configString={configString}
              connectionStatus={connectionStatus}
              onDisconnectSubmit={this.onDisconnectSubmit}
              onConnectSubmit={() => { this.onConnectSubmit(address, configString) }}//"address" and "configString" are declared in the top of render.
            >
            </Header>





            <div id="main">
              <div className="special_scroll" id="panel">

                <div id="send_messages">
                  <Typography gutterBottom variant="h6">Send messages</Typography>

                  <SendMessage connected={connectionStatus === 'connected'} onSubmit={this.onMessageSubmit}></SendMessage>

                </div>

                <div id="events">
                  <Typography gutterBottom variant="h6">Register events</Typography>

                  <FormControlLabel
                    control={
                      <Checkbox
                        disabled={connectionStatus !== 'connected'}
                        checked={allEventsChecked}
                        onChange={this.handleAllEventsCheck('allEventsChecked')}
                        value="allEventsChecked"
                        color="primary"
                      />
                    }

                    label="Listen to all incoming events"
                  />

                  <AddEvent connected={connectionStatus === 'connected'} onSubmit={(eventName) => { this.onEventSubmit(activeInstanceId, eventName) }}></AddEvent>
                  {Object.keys(registeredEvents).length > 0 && (

                    <div id="registered_events" >
                      <RegisteredEvents onEventDelete={this.onEventDelete} events={Object.values(registeredEvents)}></RegisteredEvents>
                    </div>

                  )}
                </div>
              </div>


              {/*Rendering all instances into the DOM and showing only one of them, for performance reasons(avoiding re-rendering of all Message components,
                 when the active instance changes). 
              */}
              {this.state.instances.map((instance) => {
                return <Messages
                  key={instance.id}
                  onScrollToTop={this.onScrollToTop}
                  onScrollToBottom={this.onScrollToBottom}
                  show={activeInstanceId === instance.id ? true : false}//Tell the component if it should be visible in the DOM
                  onMessagesDelete={this.onMessagesDelete}
                  onMessageResend={(messageId) => { this.onMessageResend(instance.id, messageId) }}
                  instanceId={instance.id}
                  messages={instance.messages} />

              })}

            </div>

          </div>
          <Alert nature={store.alertNature} handleAlertClose={this.handleAlertClose} open={store.alertOpen} content={store.alertContent} />

        </MuiThemeProvider>


      );
    }
  }
)



