import React, { Component } from 'react';
// import Grid from '@material-ui/core/Grid';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import Items from './Items';
import RegisteredEvents from './RegisteredEvents';
import uuid from 'uuid';
import './App.scss';
import moment from 'moment';
import Header from './Header';
import AddEvent from './AddEvent'
import SendMessage from './MessageSending/SendMessage'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import blue from '@material-ui/core/colors/blue';
import io from 'socket.io-client';


const theme = createMuiTheme({
  palette: {
    primary: blue,
  },
});

// import MenuIcon from '@material-ui/icons/Menu';

// import {observer} from 'mobx-react';
// import state from './state';
let socket;



export default class App extends Component {

  constructor(props) {
    super(props);
    this.items = React.createRef();
  }

  state = {
    address: "",
    eventName: "",
    items: [],
    tab: 0,
    registeredEvents: {},
    connectionStatus: 'disconnected',
    alertOpen: false,
    alertContent:''
  }



  componentDidMount() {

    if (process.env.NODE_ENV === 'development') {
      this.addDummyDataForDevelopment();
    }

  }

  addDummyDataForDevelopment = () => {

    this.addItem('yoyo', "Lorem Ipsum is simply dummy text of the printing and typesetting industry.", true);
    // this.registerEvent('welcome')
    // this.registerEvent('welcome2')
    this.addItem('welcome', 'heyyyy', false);

    // this.registerEvent('welcome')

  }

  registerEvent = (eventName) => {
    if (socket) {
      socket.on(eventName, (data) => {
        this.addItem(eventName, data, false)
      })
      this.setState({
        registeredEvents: { ...this.state.registeredEvents, [eventName]: { name: eventName } }
      })
    }
  }

  addItem = (eventName, data, owner) => {
    const id = uuid();
    const time = this.getTime();
    this.setState((state, props) => ({
      ...state,
      items: [...state.items, { id, eventName, time, data, owner }]
    }))
    document.querySelector('#dummy').scrollIntoView({ behavior: 'smooth' })
  }



  onConnectSubmit = (address) => {
    this.connect(address);
  }

  onDisconnectSubmit = () => {
    socket.disconnect();
    this.setState({ connectionStatus: 'disconnected' })
  }

  onMessageSubmit = (eventName, message) => {
    this.addItem(eventName, message, true);
    this.emitEvent(eventName, message);
  }

  emitEvent = (eventName, message) => {
    socket.emit(eventName, message)
  }

  onChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    this.setState({
      [name]: value
    })
  }


  onEventSubmit = (eventName) => {
    console.log(eventName)
    this.registerEvent(eventName);
  }

  onEventDelete = (name) => {
    // this.setState()
    // debugger;
    socket.off(name);

    const oldEvents = { ...this.state.registeredEvents };
    delete oldEvents[name];
    this.setState({
      registeredEvents: oldEvents
    })
  }


  connect = (address) => {

    this.setState(()=>({
      connectionStatus:'connecting'
    }))

    if (socket) {
      socket.disconnect();
    }

    socket = window.socket = io(address);

    socket.on('connect', () => {
      console.log('connected!')
      this.setState({
        connectionStatus: 'connected',
        //  registeredEvents:{}
      })

      if (Object.keys(this.state.registeredEvents).length > 0) {
        console.log('re-registering events');
        for (let event of Object.keys(this.state.registeredEvents)) {
          this.registerEvent(event);
        }
      }

      if (process.env.NODE_ENV === 'development') {
        this.registerEvent('welcome')
        this.registerEvent('welcome2')
      }




    });

    socket.on('disconnect', (reason) => {
      console.log('reason', reason)
      // if (reason === 'io server disconnect') {
      //   // the disconnection was initiated by the server, you need to reconnect manually
      //   socket.connect();
      // }
      // else the socket will automatically try to reconnect
    });

    socket.on('connect_error', (error) => {
      console.log('Error connecting!')
      this.setState(()=>{
        return {
          alertContent:'Error connecting to the server',
          alertOpen:true
        }
      })
    });

    socket.on('reconnect', (attemptNumber) => {
      this.setState(()=>{
        return {
          alertContent:'',
          connectionStatus:'connected',
          alertOpen:false
        }
      })
    });

    // var onevent = socket.onevent;
    // socket.onevent = function (packet) {
    //   var args = packet.data || [];
    //   onevent.call(this, packet);    // original call
    //   packet.data = ["*"].concat(args);
    //   onevent.call(this, packet);      // additional call to catch-all
    // };

    // socket.on('*', (event, data) => {
    //   console.log(event, data)
    //   this.addItem(event, data)
    // })

    socket.on('reconnecting', (attemptNumber) => {
      this.setState(()=>{
        return {          
          connectionStatus:'reconnecting',          
        }
      })
    });
  }

  getTime = () => {
    // debugger;
    // console.log('unix',unix)
    const unix = this.getMoment();
    return moment(unix * 1000).format('HH:mm');
  }
  getMoment = () => {
    // console.log(moment().unix())
    return moment().unix();

  }

  handleTabChange = (event, tab) => {
    this.setState({ tab });
  };

  handleAlertClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    this.setState({ alertOpen: false });
  };


  render() {

    // console.log(Object.values(this.state.registeredEvents))

    return (

      <MuiThemeProvider theme={theme}>
        <div id="wrapper">
          <Header  connectionStatus={this.state.connectionStatus} onDisconnectSubmit={this.onDisconnectSubmit} onConnectSubmit={this.onConnectSubmit}></Header>

          <div id="main">

            <div className="special_scroll" id="panel">

              <div id="send_messages">
                <Typography gutterBottom variant="h6">Send messages</Typography>
                <SendMessage connected={this.state.connectionStatus === 'connected'} onSubmit={this.onMessageSubmit}></SendMessage>

              </div>


              <div id="events">
                <Typography gutterBottom variant="h6">Register events</Typography>
                <AddEvent connected={this.state.connectionStatus === 'connected'} onSubmit={this.onEventSubmit}></AddEvent>
                {Object.keys(this.state.registeredEvents).length > 0 && (

                  <div id="registered_events" >
                    <RegisteredEvents onEventDelete={this.onEventDelete} events={Object.values(this.state.registeredEvents)}></RegisteredEvents>
                  </div>

                )}
              </div>






            </div>

            <div className="special_scroll" ref={this.items} id="items">

              <Typography variant="h6" gutterBottom>
                Messages sent/received
          </Typography>
              <Items items={this.state.items} />
              <div style={{ float: "left", clear: "both" }} id="dummy">

              </div>
            </div>




          </div>



        </div>

        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          variant="error"
          open={this.state.alertOpen}
          autoHideDuration={10000000}
          onClose={this.handleAlertClose}
          ContentProps={{
            'aria-describedby': 'message-id',
          }}
          message={<span id="message-id">{this.state.alertContent}</span>}
          action={[
            <IconButton
              key="close"
              aria-label="Close"
              color="inherit"
              // className={classes.close}
              onClick={this.handleAlertClose}
            >
              <CloseIcon />
            </IconButton>,
          ]}
        />


      </MuiThemeProvider>


    );
  }
}







