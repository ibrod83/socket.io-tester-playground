import React, { Component } from 'react';
import Alert from './Alert';
import Typography from '@material-ui/core/Typography';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { observer } from 'mobx-react';

import Messages from './Messages';
import RegisteredEvents from './RegisteredEvents';
import uuid from 'uuid';
import './App.scss';
import moment from 'moment';
import Header from './Header';
import AddEvent from './AddEvent'
import SendMessage from './MessageSending/SendMessage'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { blue, green, grey } from '@material-ui/core/colors';
import store from './global';
import { handleAlertCloseAction, createAlertAction } from './global'
import SocketIO from './websocket/SocketIO';
import NativeSocket from './websocket/NativeSocket';


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


      this.state = {
        address: "http://localhost:3001/multiple",
        // id: uuid(),//The unique identifier of the this.state.
        socket: null,
        configString: "",
        messages: [],//All messages sent/received in this this.state.
        args: [//The arguments that will be sent with the message(initial single argument of type string).
          {
            message: "",
            error: false,
            type: 'String'
          }
        ],
        shouldAutoResendMessage: false,
        autoResendMessages: {},//Dictionary by eventName
        useCallback: false,//Whether or not a "callback" should be used(relevant only for SocketIO).
        activeArg: 0,//The active argument.
        eventName: '',
        connectionType: 'SocketIO',//Either "SocketIO" or "native".
        // connectionType: 'native',//Either "SocketIO" or "native".
        registeredEvents: {},
        anonymousEvents: {},//Anonymous(those that the user didn't register) events are used for intercepting all incoming events, in SocketIO
        allEventsChecked: false,
        connectionStatus: "disconnected"//Disconnected, connected, reconnecting,reconnect,
      }
    }




    createConfigObjectFromString = (str) => {//Evaluates the optional configuration string as JS.
      if (!str)
        return;

      let evalResult;
      eval(`evalResult = ${str}`);
      return evalResult

    }

    connect = (address, configString) => {

      const connectionStatus = 'connecting';

      const parsedConfig = this.createConfigObjectFromString(configString);



      if (this.state.socket) {
        this.state.socket.disconnect();
      }

      // debugger;

      if (this.state.connectionType === 'native') {
        // debugger;
        var socket = new NativeSocket();
        socket.on('message',(data)=>{//If it's a native socket, only one event is relevant: "message".
          this.addMessageToState('message', [data], false)
        })
      } else {

        var socket = new SocketIO();
      }

      // debugger;
      this.setState(() => ({ socket, connectionStatus }));


      // debugger;
      parsedConfig ? socket.connect(address, parsedConfig) : socket.connect(address);
      // debugger;
      // console.log(typeof socket)
     
        // debugger;
        
    

      socket.on('connect', () => {



        console.log('connected!')



        this.setState(() => ({
          connectionStatus: 'connected',
          address
        }));

      });


      socket.on('disconnect', (reason) => {
        // debugger;
        console.log('reason', reason)
        if (reason === 1008) {
          createAlertAction('error', 'Disconnected from the server');

          this.disconnectManually();

        }
        // else the socket will automatically try to reconnect
      });


      socket.on('connecting', (error) => {


        console.log('connecting');


        this.setState(() => ({ connectionStatus: "connecting" }));

      });



      socket.on('error', (error) => {

        createAlertAction('error', error);

      });


      socket.on('reconnect', () => {
        const autoResendMessages = this.state.autoResendMessages;
        for(let i in autoResendMessages){
          const {eventName,args,useCallback} = autoResendMessages[i];
          this.submitMessage(eventName,args,useCallback);
        }
        console.log('reconnected');

        store.alertOpen = false;

        this.setState(() => ({ connectionStatus: "connected" }));

      });


      socket.on('reconnecting', () => {
        console.log('reconnecting');
        // debugger;



        this.setState(() => ({ connectionStatus: "reconnecting" }));

      });

      this.repeatEventRegistration();//In case the user manually disconnected and reconnected, the events need to be re-registered.


    }

    onConnectSubmit = (address, config, connectionType) => {
      // debugger;
      if (!this.validateAddress(address, connectionType))
        return createAlertAction('error', 'Invalid address')

      this.connect(address, config);
    }

    validateAddress = (address, connectionType) => {
      // debugger;
      if (connectionType === 'native') {
        if (!address.startsWith('ws:') && !address.startsWith('wss:'))
          return false;

        return true;
      }
      return true;
    }



    onDisconnectSubmit = () => {


      this.disconnectManually();
    }




    onConnectionTypeChange = (connectionType) => {
      console.log('type', connectionType)


      this.setState(() => ({
        connectionType
      }));
    }



    repeatEventRegistration = () => {
      if (Object.keys(this.state.registeredEvents).length > 0) {//PROBLEM!!!!!!!! fix it
        console.log('re-registering events');
        for (let event of Object.keys(this.state.registeredEvents)) {
          this.registerEvent(event);
        }
      }

      if (this.state.allEventsChecked) {
        this.listenToAllEvents(true)
      }
    }


    registerEvent = (eventName) => {


      const socket = this.state.socket;//The socket associated with this this.state.

      if (socket) {
        this.registerEventToSocket(socket, eventName)
      }


      this.setState(() => ({
        registeredEvents: {
          ...this.state.registeredEvents,
          [eventName]: { name: eventName }
        }
      }));

    }

    registerEventToSocket = (socket, eventName) => {
      socket.off(eventName);

      socket.on(eventName, (arg1, arg2, arg3) => {
        console.log('on:', eventName, arg1, arg2, arg3)
      })
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

        this.addMessageToState(eventName, args, false)
      })
    }


    addMessageToState = (eventName, args, owner, status) => {

      const messageId = uuid();

      const time = this.getTime();
      // debugger;
      //*****UNDESRSTAND WHY THIS WASNT WORKING!!! */
      // this.state.messages.push({ id: messageId, eventName, time, data, owner, status: 'pending' })//Adding a message to the this.state.

      this.setState(() => ({
        messages: [
          ...this.state.messages,
          { id: messageId, eventName, time, args, owner, status }
        ]
      }));

      return messageId;

    }




    listenToAllEvents = (on) => {//Will make an instance listen to every incoming socketIO message, prompting addition of the message to the
      //this.state.messages array.


      const socket = this.state.socket;


      // const that = this;

      if (on) {
        debugger;

        socket.listenToAllEvents(true, (eventName) => {//Passing a callback to be executed every time an anonymous event occurs.
          this.registerAnonymousEvent(eventName)//Registers the event
        })

      } else {
        // debugger;
        // socket.onevent = this.state.originalOnevent;

        socket.listenToAllEvents(false);

        this.unregisterAnonymousEvents()

      }

    }



    registerAnonymousEvent = (eventName) => {//This registers a callback for an event coming from SocketIO's Socket.prototype.onevent function.
      console.log('registering anonymous event:', eventName)



      const socket = this.state.socket;

      if (socket) {

        this.registerEventToSocket(socket, eventName)

      }

      this.setState(() => {
        return {
          anonymousEvents: {
            ...this.state.anonymousEvents,
            [eventName]: { name: eventName }
          }
        }
      })



    }


    unregisterAnonymousEvents = () => {//Clear all anonymous events for the given this.state.
      // debugger;

      const socket = this.state.socket;

      for (let event in this.state.anonymousEvents) {
        if (!this.state.registeredEvents.hasOwnProperty(event)) {
          socket.off(event)
        }

      }

      this.setState(() => ({ anonymousEvents: {} }));
    }



    onMessagesDelete = () => {//Fired when the user deletes all messages of an instance




      this.setState(() => ({ messages: [] }));

    }







    disconnectManually = () => {

      const socket = this.state.socket;

      console.log('disconnected manually')

      socket.disconnect();



      this.setState(() => ({
        connectionStatus: "disconnected"
      }));
    }

    createAutoResendMessage = (eventName, args, useCallback) => {
      const messageObject = {
        eventName,
        args,
        useCallback
      }

      this.setState(() => {
        const messages = { ...this.state.autoResendMessages }
        if (messages[eventName]) {
          messages[eventName] = messageObject;
          return {
            autoResendMessages: messages
          }
        } else {
          return {
            autoResendMessages: {
              ...this.state.autoResendMessages,
              [eventName]: messageObject
            }
          }
        }


      })
    }

    onMessageSubmit = (eventName, args, useCallback) => {
      this.submitMessage(eventName, args, useCallback)
      if (this.state.shouldAutoResendMessage) {
        this.createAutoResendMessage(eventName, args, useCallback);
      }else{
        if(this.state.autoResendMessages[eventName]){
          debugger;
          this.removeAutoResendMessage(eventName)
        }
        
      }
    }

    removeAutoResendMessage = (eventName)=>{
      const autoResendMessages = {...this.state.autoResendMessages};
      delete autoResendMessages[eventName];      
      this.setState(()=>{
        return {autoResendMessages};
      })
    }

    submitMessage = (eventName, args, useCallback) => {
      const socket = this.state.socket;

      const messageId = this.addMessageToState(eventName, args, true, useCallback && 'pending');

      const callback = useCallback ? this.createAcknowledgementHandler(messageId) : null;

      this.sendMessageToServer(socket, eventName, args, callback);
    }


    onMessageComponentPropChange = (newStateObj) => {

      const state = { ...this.state };

      for (let prop in newStateObj) {
        state[prop] = newStateObj[prop];
      }
      this.setState(() => ({ ...state }))
    }






    onMessageFail = (messageId) => {//Fired when a message fails to receive a callback after a certain period of time.
      this.changeMessage(messageId, { status: 'fail' })
    }




    createAcknowledgementHandler = (messageId) => {//Creates the logic to handle the message success/failure.
      // debugger;
      var timeoutId = setTimeout(() => {//Timeout function that waits for the message callback.

        this.onMessageFail(messageId);


      }, 5000);

      return (callbackData) => {
        // debugger;
        clearTimeout(timeoutId);//Clear the timeout, so that an error is not fired.
        // debugger;
        console.log('response from callback', callbackData)
        // debugger;


        this.changeMessage(messageId, { status: 'success', callbackData });


      }

      // this.sendMessageToServer(socket, eventName, args, callback);


    }



    sendMessageToServer = (socket, eventName, args, callback) => {//Emits the event.

      if (callback) {
        socket.send({ eventName, args: [...args, callback] });//"data" can be multiple arguments.
      } else {
        // debugger;
        socket.send({ eventName, args: [...args] });//"data" can be multiple arguments.
      }


    }




    onMessageResend = (messageId) => {//Fired when the user tries to resend a failed message.
      // debugger;

      this.changeMessage(messageId, { status: 'pending' });


      const message = this.state.messages.filter(message => message.id === messageId)[0];

      const eventName = message.eventName;

      const socket = this.state.socket;

      const args = message.args;

      const callback = this.createAcknowledgementHandler(messageId);

      this.sendMessageToServer(socket, eventName, args, callback);

    }




    changeMessage = (messageId, obj) => {//Function that changes properties of a message(particularly "status").



      this.setState(() => {
        const messages = this.state.messages.map((message) => {
          if (message.id === messageId) {

            return {
              ...message,
              ...obj
            }
          } else {
            return message;
          }
        })
        return {
          messages
        }
      })
    }


    onEventSubmit = (eventName) => {//Fired when a user adds an event listener manually.
      console.log(eventName)
      this.registerEvent(eventName);
    }



    onEventDelete = (name) => {//Fired when a user deletes an event listener manually.


      const socket = this.state.socket;

      socket.off(name);

      const oldEvents = { ...this.state.registeredEvents }

      delete oldEvents[name];

      this.setState({
        registeredEvents: oldEvents
      })
    }



    handleAllEventsCheck = name => event => {//Fired when the user toggles the listen to all events checkbox on a particular this.state.

      const checked = event.target.checked;

      this.setState(() => ({
        allEventsChecked: checked
      }));

      this.listenToAllEvents(checked);
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



    onScrollToBottom = () => {
      console.log('bottom!')
    }

    onScrollToTop = () => {
      console.log('Top!')
    }

    onHeaderValueChange = (name, val) => {


      this.setState(() => ({
        [name]: val
      }));

    }




    render() {


      const { connectionStatus, allEventsChecked, connectionType, eventName, args, activeArg, useCallback, registeredEvents, address, configString } = this.state;//Extract the props.


      return (

        <MuiThemeProvider theme={theme}>

          <div id="wrapper">


            <Header
              onConnectionTypeChange={this.onConnectionTypeChange}
              onAddressChange={(val) => { this.onHeaderValueChange('address', val) }}
              onConfigStringChange={(val) => { this.onHeaderValueChange('configString', val) }}
              // key={activeInstanceId}
              address={address}
              connectionType={connectionType}
              configString={configString}
              connectionStatus={connectionStatus}
              onDisconnectSubmit={this.onDisconnectSubmit}
              onConnectSubmit={() => { this.onConnectSubmit(address, configString, connectionType) }}//"address" and "configString" are declared in the top of render.
            >
            </Header>





            <div id="main">
              <div className="special_scroll" id="panel">

                <div id="send_messages">
                  <Typography gutterBottom variant="h6">Send messages</Typography>

                  <SendMessage
                    eventName={eventName}
                    activeArg={activeArg}
                    args={args}
                    useCallback={useCallback}
                    multipleArguments={connectionType === 'SocketIO'}
                    onPropChange={this.onMessageComponentPropChange}
                    showEventName={connectionType === 'SocketIO'}
                    connected={connectionStatus === 'connected'}
                    formats={connectionType === 'native' && [
                      'String',
                      'File',
                      'JSON'
                    ]}
                    onSubmit={
                      (eventName, args, useCallback) => {
                        this.state.connectionType === 'SocketIO' ?
                          this.onMessageSubmit(eventName, args, useCallback) :
                          this.onMessageSubmit('message', [args[0]])
                      }
                    }>
                  </SendMessage>

                </div>
                {connectionType === 'SocketIO' && <div id="events">
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

                  <AddEvent connected={connectionStatus === 'connected'} onSubmit={(eventName) => { this.onEventSubmit(eventName) }}></AddEvent>
                  {Object.keys(registeredEvents).length > 0 && (

                    <div id="registered_events" >
                      <RegisteredEvents onEventDelete={this.onEventDelete} events={Object.values(registeredEvents)}></RegisteredEvents>
                    </div>

                  )}
                </div>}

              </div>
              <Messages
                // key={this.state.id}
                onScrollToTop={this.onScrollToTop}
                onScrollToBottom={this.onScrollToBottom}
                show={true}//Tell the component if it should be visible in the DOM
                onMessagesDelete={this.onMessagesDelete}
                onMessageResend={(messageId) => { this.onMessageResend(messageId) }}
                // instanceId={this.state.id}
                messages={this.state.messages} />

            </div>

          </div>
          <Alert nature={store.alertNature} handleAlertClose={this.handleAlertClose} open={store.alertOpen} content={store.alertContent} />

        </MuiThemeProvider>


      );
    }
  }
)



