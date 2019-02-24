import React, { Component } from 'react';
// import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Items from './Items';
import RegisteredEvents from './RegisteredEvents';
import uuid from 'uuid';
import './App.scss';
import moment from 'moment';
import Header from './Header';
import AddEvent from './AddEvent'
import SendMessage from './MessageSending/SendMessage'

// import MenuIcon from '@material-ui/icons/Menu';

// import {observer} from 'mobx-react';
// import state from './state';
import io from 'socket.io-client';
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
    connected: false
  }



  componentDidMount() {
    this.addItem('yoyo', "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.", true);
    setTimeout(() => {
      this.addItem('welcome', 'heyyyy', false);
    }, 0)
    // this.addItem('yoyo','heyyyy',false);
    // this.addItem('yoyo','heyyyy',false);
    // 
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

    this.setState({
      items: [...this.state.items, {id, eventName, time, data, owner }]
    })

    document.querySelector('#dummy').scrollIntoView({ behavior: 'smooth' })

  }



  onConnectSubmit = (address) => {
    this.connect(address);
  }

  onDisconnectSubmit = () => {
    socket.disconnect();
    this.setState({ connected: false })
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

  onEventDelete= (name)=>{
    // this.setState()
    // debugger;
    socket.off(name);

    const oldEvents = {...this.state.registeredEvents};
    delete oldEvents[name];
    this.setState({
      registeredEvents:oldEvents
    })
  }


  connect = (address) => {

    if (socket) {
      socket.disconnect();
    }

    socket = window.socket = io(address);

    socket.on('connect', () => {
      console.log('connected!')
      this.setState({
         connected: true,
        //  registeredEvents:{}
         })

      if(Object.keys(this.state.registeredEvents).length > 0 ){
        console.log('re-registering events');
        for(let event of Object.keys(this.state.registeredEvents)){
          this.registerEvent(event);
        }
      }   
      this.registerEvent('welcome')
      this.registerEvent('welcome2')
      // this.addItem('yoyo', { name: 'john', age: 35 })
      // this.addItem('yoyo', ['hey', 'hey again', 3])
      // this.addItem('yoyo', "i'm just a simple string!")
    });

    socket.on('disconnect', (reason) => {
      console.log('reason',reason)
      // if (reason === 'io server disconnect') {
      //   // the disconnection was initiated by the server, you need to reconnect manually
      //   socket.connect();
      // }
      // else the socket will automatically try to reconnect
    });

    socket.on('connect_error', (error) => {
      console.log('Error connecting!')
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

    // socket.on('reconnecting', (attemptNumber) => {
    //   // ...
    //   if(socket){

    //   }
    // });
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

  render() {

    // console.log(Object.values(this.state.registeredEvents))

    return (




      <div id="wrapper">
        <Header connected={this.state.connected} onDisconnectSubmit={this.onDisconnectSubmit} onConnectSubmit={this.onConnectSubmit}></Header>

        <div id="main">

          <div className="special_scroll" id="panel">

            <div id="send_messages">  
              <Typography gutterBottom variant="title">Send messages</Typography>
              <SendMessage connected={this.state.connected} onSubmit={this.onMessageSubmit}></SendMessage>

            </div>


            <div id="events">
            <Typography gutterBottom variant="title">Register events</Typography>  
              <AddEvent connected={this.state.connected} onSubmit={this.onEventSubmit}></AddEvent>
              {Object.keys(this.state.registeredEvents).length > 0 && (

                <div id="registered_events" >
                  <RegisteredEvents onEventDelete={this.onEventDelete} events={Object.values(this.state.registeredEvents)}></RegisteredEvents>
                </div>

              )}
            </div>






          </div>

          <div className="special_scroll" ref={this.items} id="items">
         
            <Typography    variant="title" gutterBottom>
              Messages sent/received
            </Typography>
            <Items items={this.state.items} />
            <div style={{ float: "left", clear: "both" }} id="dummy">

            </div>
          </div>




        </div>



      </div>

    );
  }
}







