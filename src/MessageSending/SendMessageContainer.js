import React from 'react';
import SendMessage from './SendMessage';

export default class SendMessageContainer {

    onEventChange = (e) => {

        const event = e.target.value;

        this.setState({ event })
    }

    onSubmit = (e) => {
        // debugger;
        e.preventDefault();
        let value = this.state.message;
        // this.validateInput(value)
        switch (this.state.type) {
            case 'Number':
                value = parseInt(value)
                break;
            case 'Object':
                // debugger;
                let evalResult;
                eval(`evalResult = ${value}`);
                value = evalResult;
            default:
                break;
        }


        // alert(this.state.address)
        this.props.onSubmit(this.state.event, value);
    }

    render() {
        return (

            <form  onSubmit={this.onSubmit} autoComplete="off">

                <Button disabled={!this.props.connected || this.state.error} type="submit" variant="contained" color="primary" >
                    Send
                </Button>

            </form>



        )
    }
}