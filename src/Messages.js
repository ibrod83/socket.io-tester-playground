import React from 'react';
import Message from './Message';
// import { List } from "react-virtualized";
import DeleteSweepIcon from '@material-ui/icons/DeleteSweep';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';


export default class extends React.Component {


    constructor(props){
        super(props)
        this.messagesDiv = React.createRef()

        this.messagesList = React.createRef()
    }

    
    componentDidUpdate(prevProps) {

        if (this.props.instanceId !== prevProps.instanceId)
            return this.scrollToBottom();

        if (this.props.messages.length > 0 && prevProps.messages.length !== this.props.messages.length) {
            if (this.shouldScrollDown(this.props.messages[this.props.messages.length - 1])) {
                this.scrollToBottom();
            }

        }

    }



    shouldScrollDown(lastMessage) {
        // debugger;

        if (lastMessage.owner) {
            return true;
        } else if (this.messagesList.current.childNodes.length > 1) {//Check if there is more than one item first.

            const scrollHeight = this.messagesDiv.current.scrollHeight;

            const clientHeight = this.messagesDiv.current.clientHeight;

            const scrollTop = this.messagesDiv.current.scrollTop;

            const lastItemHeight = this.messagesList.current.childNodes[this.messagesList.current.childNodes.length - 1].offsetHeight

            const oneBeforeLastItemHeight = this.messagesList.current.childNodes[this.messagesList.current.childNodes.length - 2].offsetHeight

            if (clientHeight + scrollTop + lastItemHeight + oneBeforeLastItemHeight >= scrollHeight) {
                return true

            }
        }
        return false;
    }


    scrollToBottom = () => {

        this.messagesDiv.current.scrollTop = this.messagesDiv.current.scrollHeight;

    }

    // scrollToMessage = window.scroll = (id) => {
    //     const div = document.getElementById(`${id}`);
    //     div.scrollIntoView({ behavior: "smooth" });
    // }

    renderRow = ({ index, key, style }) => {
        return
    }

    onMessagesDelete = () => {
        this.props.onMessagesDelete();
    }



    // console.log(window.copy)
    render() {

        return (




            <div ref={this.messagesDiv} style={{display:this.props.show ? 'block': 'none'}}  className="special_scroll" id="messages">
                <Typography variant="h6" gutterBottom>
                    Messages sent/received        
                </Typography>
                {this.props.messages.length > 0 && (
                    <div style={{ float: 'right' }}>

                        <Tooltip title="Delete all messages">
                            <IconButton onClick={this.onMessagesDelete} aria-label="Delete">
                                <DeleteSweepIcon fontSize="small" color="secondary"></DeleteSweepIcon>
                            </IconButton>
                        </Tooltip>
                    </div>
                )}
                <ul ref={this.messagesList} id="messages_list" style={{ listStyle: 'none', paddingLeft: '0' }}>




                    {this.props.messages.map((message, index) => <li key={message.id} style={{ display: 'block', width: '100%', float: 'left', marginBottom: '15px', marginTop: '15px' }}><div
                        style={{
                            // display: 'inline-block',
                            float: message.owner ? 'left' : 'right',
                            width: '40%'

                        }}>
                        <Message onMessageResend={this.props.onMessageResend} message={message} >
                        </Message>
                    </div>
                    </li>)}

                </ul>
            </div>



        )
    }


}