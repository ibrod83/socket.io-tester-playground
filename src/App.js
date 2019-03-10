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
import { Button } from '@material-ui/core';

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
    // position:'absolute'
    // marginLeft: '90%',
    // marginBottom: '-20px',
    fontSize: '20px',
    position:'absolute',
    top:'20px',
    right:'0px'
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
        instances: [instance0],
        activeInstance: instance0.id
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


    generateInstance = () => {
      const instance = {
        address: "",
        id: uuid(),
        socket: null,
        messages: [],
        registeredEvents: {},
        anonymousEvents: {},
        allEventsChecked: false,
        connectionStatus: "disconnected"
      }

      return instance;
    }



    connect = (address) => {
      console.log('connecting');

      // const currentState = 

      const instanceId = this.state.activeInstance;//The connect function is relevant to the currently active instance(tab).

      const { instances, instance } = this.getInstanceSlice(instanceId);

      instance.connectionStatus = 'connecting';

      this.setState(() => ({ instances }));

      if (instance.socket) {
        instance.socket.disconnect();
      }

      const socket = instance.socket = io(address);

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
          socket.disconnect();
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
      instance.messages =  [...instance.messages, { id: messageId, eventName, time, data, owner, status: 'pending'} ]

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

    getInstanceReference = (id)=>{
      

      let instance;
      this.state.instances.forEach((ins, index) => {
        if (ins.id === id) {
          instance = this.state.instances[index];//The actual instance
        }
      })
      return { instance, instances:this.state.instances };//Return an object containing both.
    }
    


    listenToAllEvents = (instanceId, on) => {

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



    onMessagesDelete = () => {

      const instanceId = this.state.activeInstance;

      const { instances, instance } = this.getInstanceSlice(instanceId);

      instance.messages = [];

      this.setState(() => ({ instances }));

    }



    onConnectSubmit = (address) => {
      this.connect(address);
    }


    onDisconnectSubmit = () => {

      const instanceId = this.state.activeInstance;

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

      const callback = (data) => {
        // debugger;
        console.log('data from callback', data)
        this.changeMessage(instanceId, messageId, 'status', 'success');
      }

      this.sendMessageToServer(socket, eventName, data, callback);
    }


    sendMessageToServer = (socket, eventName, message, callback) => {

      socket.emit(eventName, message, callback)
    }




    changeMessage = (instanceId, messageId, prop, value) => {

      const { instances, instance } = this.getInstanceSlice(instanceId);

      this.setState(() => {
        const messages = instance.messages.map((message) => {
          if (message.id === messageId) {
            return {
              ...message,
              [prop]: value
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


    onEventSubmit = (instance, eventName) => {
      console.log(instance, eventName)
      this.registerEvent(instance, eventName);
    }



    onEventDelete = (name) => {

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



    handleAllEventsCheck = name => event => {

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

    changeActiveInstance = (id) => {
      this.setState(() => ({ activeInstance: id }))

    }

    createNewTab = () => {
      const instance = this.generateInstance();
      this.setState((state) => ({
        instances: [...state.instances, instance]
      }))

      this.changeActiveInstance(instance.id);

    }



    destroyInstance = (e, id) => {      

      e.stopPropagation();
      // debugger;
      console.log('destroy instance!')

      const { instances, instance } = this.getInstanceSlice(id);
      console.log(instance.socket);

      if(instance.socket){
        instance.socket.disconnect();
      }

      

      const tabIndex = instances.indexOf(instance);

      const tabLength = instances.length;

      let newIndex;

      if (tabLength - tabIndex === 1) {
        newIndex = tabIndex - 1
      }else{
        newIndex = tabIndex
      }

      const newInstances = instances.filter(instance => instance.id !== id);

      const lastInstance = newInstances[newIndex];

      this.setState({
        activeInstance: lastInstance.id,
        instances: newInstances,

      });
     
    }



    getTabAddress = (instance) => {
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

      const { instance, instances } = this.getInstanceSlice(this.state.activeInstance)

      const { connectionStatus, allEventsChecked, registeredEvents, messages, address } = instance;
      
      console.log('length from app render',messages.length)
      const activeInstanceId = instance.id;

      const tabIndex = instances.indexOf(instance);

      const firstInstance =  instances[0]

      console.log('tab index',tabIndex)

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
                    icon={instance.id !== firstInstance.id ? <StyledClearIcon onClick={(e) => { this.destroyInstance(e, instance.id) }}></StyledClearIcon> :null}
                  >

                  </StyledTab>






                )}

                <IconButton onClick={this.createNewTab} aria-label="New tab">
                  <AddIcon />
                </IconButton>

              </Tabs>
            </AppBar>

            <Header address={address} connectionStatus={connectionStatus} onDisconnectSubmit={this.onDisconnectSubmit} onConnectSubmit={this.onConnectSubmit}></Header>





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

                <Messages instanceId={activeInstanceId} messages={messages} />
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



