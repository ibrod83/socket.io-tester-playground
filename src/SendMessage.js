import React from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

export default class SendMessage extends React.Component {
    state = {
        event: "",
        message: ""
    }

    onChange = (e) => {
        const name = e.target.name;
        const value = e.target.value;
        this.setState({
            [name]: value
        })
    }

    onSubmit = (e) => {
        e.preventDefault();
        // alert(this.state.address)
        this.props.onSubmit(this.state.event,this.state.message);
    }


    render() {
        return (
            <form onSubmit={this.onSubmit} autocomplete="off">

                <TextField
                    // id="outlined-password-input"
                    label="Event name"
                    required
                    // className={classes.textField}
                    onChange={this.onChange} value={this.state.event}
                    type="text"
                    fullWidth
                    name="event"
                    
                    // autoComplete="current-password"
                    margin="dense"
                    variant="outlined"
                />

                <TextField
                    // id="outlined-password-input"
                    label="Message"
                    required
                    // className={classes.textField}
                    onChange={this.onChange} value={this.state.message}
                    type="text"
                    fullWidth
                    name="message"
                    // autoComplete="current-password"
                    margin="dense"
                    variant="outlined"
                />

                <Button disabled={!this.props.connected} type="submit" variant="contained" color="primary" >
                    Send message
              </Button>
            </form>

        )
    }
}