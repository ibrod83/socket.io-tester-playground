import React from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

export default class AddEvent extends React.Component {
    state = {
        event: ""
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
        this.props.onSubmit(this.state.event);
    }

   
    render() {
        return (
            <form onSubmit={this.onSubmit} >
                    
                <TextField                  
                    label="Event name"
                    required               
                    onChange={this.onChange} value={this.state.event} 
                    type="text"
                    fullWidth
                    name="event"                
                    margin="dense"
                    variant="outlined"
                />
                <Button disabled={!this.props.connected} type="submit" variant="contained" color="primary" >
                    Register
                </Button>
            </form>

        )
    }
}