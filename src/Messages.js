import React from 'react';
import Message from './Message';
import { List } from "react-virtualized";



export default class extends React.Component {


    componentDidMount() {
        this.messagesDiv = document.querySelector('#messages');//The scrolled container

        this.messagesList = document.querySelector('#messages_list');//The actual UL. The ID is set in the messages component.


    }


    // componentDidUpdate(prevProps) {
    //     // debugger;

    //     // console.log('prev props', prevProps)
    //     // console.log('current props', this.props)

    //     if (this.props.instanceId !== prevProps.instanceId)
    //         return this.scrollToBottom();

    //     if (this.props.messages.length > 0 && prevProps.messages.length !== this.props.messages.length) {
    //         if (this.shouldScrollDown(this.props.messages[this.props.messages.length - 1])) {
    //             this.scrollToBottom();
    //         }

    //     }

    // }



    shouldScrollDown(lastMessage) {

        if (lastMessage.owner) {
            return true;
        } else if (this.messagesList.childNodes.length > 1) {//Check if there is more than one item first.

            const scrollHeight = this.messagesDiv.scrollHeight;

            const clientHeight = this.messagesDiv.clientHeight;

            const scrollTop = this.messagesDiv.scrollTop;

            const lastItemHeight = this.messagesList.childNodes[this.messagesList.childNodes.length - 1].offsetHeight

            const oneBeforeLastItemHeight = this.messagesList.childNodes[this.messagesList.childNodes.length - 2].offsetHeight

            if (clientHeight + scrollTop + lastItemHeight + oneBeforeLastItemHeight >= scrollHeight) {
                return true

            }
        }
        return false;
    }


    scrollToBottom = () => {

        this.messagesDiv.scrollTop = this.messagesDiv.scrollHeight;

    }

    scrollToMessage = window.scroll = (id) => {
        const div = document.getElementById(`${id}`);
        div.scrollIntoView({ behavior: "smooth" });
    }

    renderRow = ({ index, key, style }) => {
        return
    }



    // console.log(window.copy)
    render() {

        const listHeight = 1000;
        const rowHeight = 123;
        const rowWidth = 1000;
        return (




            <ul id="messages_list" style={{ listStyle: 'none', paddingLeft: '0' }}>




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



        )
    }


}