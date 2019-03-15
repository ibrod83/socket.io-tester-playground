import React, { Component } from 'react';
// import Grid from '@material-ui/core/Grid';
import Alert from './Alert';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import DeleteSweepIcon from '@material-ui/icons/DeleteSweep';
import Tooltip from '@material-ui/core/Tooltip';
import { observer } from 'mobx-react';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import AppBar from '@material-ui/core/AppBar';
import { withStyles } from '@material-ui/core/styles';
// import Fab from '@material-ui/core/Fab';

import AddIcon from '@material-ui/icons/Add';
import ClearIcon from '@material-ui/icons/Clear';
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
// import { Button } from '@material-ui/core';

const theme = createMuiTheme({
  palette: {
    primary: blue,
    success: green[600],
    pending: grey
  },
});

const StyledTab = withStyles({
  root: {
    textTransform: 'initial',
    minHeight: '50px'
  },
})(Tab);

const StyledClearIcon = withStyles({
  root: {
    fontSize: '20px',
    position: 'absolute',
    top: '20px',
    right: '0px'
  },

})(ClearIcon);



export default observer(
  class App extends Component {

    constructor(props) {
      super(props);
      // this.messages = React.createRef();
      const instance0 = this.generateInstance();
      // const instance1 = this.generateInstance();
      this.state = {
        instances: [instance0],//Each instance has its own socket messages and events. Represented by a tab.
        activeInstance: instance0.id//The instance represented by the active tab.
      }
    }


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
      // var fakeMessages=[];
      // for(let i=0;i<100;i++){
      //   fakeMessages.push({
      //     data:'yoyoyo',
      //     eventName:'welcome',
      //     id:uuid()
      //   })
      // }
      const instance = {
        address: "http://localhost:3001",
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
   

    connect = (address,configString) => {//Fired after a certain instance(tab) wants to create the initial connection
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

        socket.off(eventName);//Remove any existing listener for that event on this socket, to prevent duplication.

        socket.on(eventName, (data) => {//Register the event with the given socket.

          this.addMessageToState(instanceId, eventName, data, false)

        })
      }

      instance.registeredEvents[eventName] = { name: eventName };//"instance" is not to be confused with the one from the callback scope.

      this.setState(() => ({ instances }));

    }


    addMessageToState = (instanceId, eventName, data, owner) => {

      const messageId = uuid();

      const { instances, instance } = this.getInstanceSlice(instanceId);

      const time = this.getTime();
      //*****UNDESRSTAND WHY THIS WASNT WORKING!!! */
      // instance.messages.push({ id: messageId, eventName, time, data, owner, status: 'pending' })//Adding a message to the instance.
      instance.messages = [...instance.messages, { id: messageId, eventName, time, data, owner, status: 'pending' }]

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
        socket.off(eventName);
        socket.on(eventName, (data) => {
          console.log('on:', eventName)
          this.addMessageToState(instanceId, eventName, data, false)
        })
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


    onMessageSubmit = (eventName, data) => {
      const instanceId = this.state.activeInstance;

      const { instance } = this.getInstanceSlice(instanceId);

      const socket = instance.socket;

      const messageId = this.addMessageToState(instanceId, eventName, data, true);

      this.createMessageHandler(instanceId, socket, messageId, eventName, data);
    }




    onMessageFail = (instanceId, messageId) => {//Fired when a message failed to receive a callback after a certain period of time.
      this.changeMessage(instanceId, messageId, {status:'fail'})
    }




    createMessageHandler = (instanceId, socket, messageId, eventName, data) => {//Creates the logic to handle the message success/failure.

      var timeoutId = setTimeout(() => {//Timeout function that waits for the message callback.

        if (this.doesInstanceExist(instanceId)) {//This condition is to make sure, the instance still exists when the callback is fired.
          this.onMessageFail(instanceId, messageId);
        }

      }, 2000);

      const callback = (data) => {
        clearTimeout(timeoutId);//Clear the timeout, so that an error is not fired.
        // debugger;
        console.log('data from callback', data)
        // debugger;


        this.changeMessage(instanceId, messageId, {status:'success'});


      }

      this.sendMessageToServer(socket, eventName, data, callback);


    }



    sendMessageToServer = (socket, eventName, data, callback) => {//Emits the event.
      socket.emit(eventName, data, callback);
    }




    onMessageResend = (instanceId, messageId) => {//Fired when the user tries to resend a failed message.
      // debugger;

      this.changeMessage(instanceId, messageId, {status:'pending'});

      const { instance } = this.getInstanceSlice(instanceId);

      const message = instance.messages.filter(message => message.id === messageId)[0];

      const eventName = message.eventName;

      const socket = instance.socket;

      const data = message.data;

      this.createMessageHandler(instanceId, socket, messageId, eventName, data)

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



    handleAlertClose = (event, reason) => {
      handleAlertCloseAction(event, reason);
    };


    changeActiveInstance = (id) => {//Fired when user changes the tab.
      this.setState(() => ({ activeInstance: id }))

    }


    createNewTab = () => {
      const instance = this.generateInstance();//When user creates a new tab, an instance is created(with socket as null).
      this.setState((state) => ({
        instances: [...state.instances, instance]
      }))

      this.changeActiveInstance(instance.id);

    }



    destroyInstance = (e, id) => {//Fired when a user destroys a tab.

      e.stopPropagation();
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


    render() {

      const { instance, instances } = this.getInstanceSlice(this.state.activeInstance)//Get the currently active instance.

      const { connectionStatus, allEventsChecked, registeredEvents, messages, address, configString } = instance;//Extract the props.

      console.log('length from app render', messages.length)
      const activeInstanceId = instance.id;

      const tabIndex = instances.indexOf(instance);

      const firstInstance = instances[0]

      console.log('tab index', tabIndex)

      return (

        <MuiThemeProvider theme={theme}>
          <div id="wrapper">
            <AppBar color="default" position="static">
              <Tabs indicatorColor="primary" textColor="primary" value={tabIndex} onChange={this.handleChange}>
                {instances.map(instance =>

                  <StyledTab

                    // style={{ textTransform: 'initial' }}
                    onClick={() => { this.changeActiveInstance(instance.id) }}
                    label={this.getTabAddress(instance)}
                    icon={instance.id !== firstInstance.id ? <StyledClearIcon onClick={(e) => { this.destroyInstance(e, instance.id) }}></StyledClearIcon> : null}
                  >

                  </StyledTab>






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
              onConnectSubmit={()=>{this.onConnectSubmit(address,configString)}}//"address" and "configString" are declared in the top of render.
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

              <div className="special_scroll" id="messages">

                <Typography variant="h6" gutterBottom>
                  Messages sent/received
       {messages.length > 0 && (
                    <div style={{ float: 'right' }}>

                      <Tooltip title="Delete all messages">
                        <IconButton onClick={this.onMessagesDelete} aria-label="Delete">
                          <DeleteSweepIcon fontSize="small" color="secondary"></DeleteSweepIcon>
                        </IconButton>
                      </Tooltip>
                    </div>
                  )}

                </Typography>

                <Messages onMessageResend={(messageId) => { this.onMessageResend(activeInstanceId, messageId) }} instanceId={activeInstanceId} messages={messages} />
                <div style={{ float: "left", clear: "both" }} id="dummy">

                </div>

              </div>
            </div>

          </div>
          <Alert nature={store.alertNature} handleAlertClose={this.handleAlertClose} open={store.alertOpen} content={store.alertContent} />

        </MuiThemeProvider>


      );
    }
  }
)



