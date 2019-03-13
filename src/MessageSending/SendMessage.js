import React from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import { withStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';

import Select from '@material-ui/core/Select';
import StringMessage from './StringMessage';
import NumberMessage from './NumberMessage';
import ObjectMessage from './ObjectMessage';


const styles = theme => ({
    // root: {
    //     display: 'flex',
    //     flexWrap: 'wrap',
    // },
    formControl: {
        margin: theme.spacing.unit,
        minWidth: 120,
    },
    selectEmpty: {
        marginTop: theme.spacing.unit * 2,
    },
});


class SendMessage extends React.Component {
    state = {
        // event: process.env.NODE_ENV ===  'development' ? "yoyo" : '',
        event: "",
        message: "",
        tab: 'String',
        error: false
    }

    onEventChange = (e) => {

        const event = e.target.value;

        this.setState({ event })
    }

    onMessageChange = (message) => {
        let error = false;
        if (this.state.tab === 'Object') {
            const parsedMessage = this.isObject(message);
            if (!parsedMessage) {
                error = true;
            }
        }

        if (this.state.tab === 'JSON') {
            const parsedMessage = this.isJson(message);
            if (!parsedMessage) {
                error = true;
            }
        }
        this.setState({ message, error });
    }

    isObject = (value) => {//Returns the parsed object on success, false on failure.
        // debugger;
        let evalResult;
        try {
            eval(`evalResult = ${value}`) // if it doesn't throw it's a valid array or object
            if (typeof evalResult === 'object') {
                return evalResult;
            } else {
                return false;
            }
        } catch (e) {
            return false;
        }
    }

    isJson = (str) => {//Returns the parsed object on success, false on failure.
        // debugger;
        
        try {
            var obj = JSON.parse(str);
        } catch (e) {
            return false;
        }
        return obj;
    }

    onSubmit = (e) => {
        // debugger;
        e.preventDefault();
        let value = this.state.message;
        // this.validateInput(value)
        switch (this.state.tab) {
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

    handleTabChange = (e) => {
        this.setState({ tab: e.target.value,message:"",error:false })
    }


    render() {

        const { classes } = this.props;

        return (
            <form className={classes.root} onSubmit={this.onSubmit} autoComplete="off">
                <TextField
                    // id="outlined-password-input"
                    label="Event name"
                    required
                    // className={classes.textField}
                    onChange={this.onEventChange} value={this.state.event}
                    type="text"
                    fullWidth
                    name="event"

                    // autoComplete="current-password"
                    margin="dense"
                    variant="outlined"
                />
                <FormControl className={classes.formControl}>
                    <InputLabel htmlFor="age-simple">Format</InputLabel>
                    <Select
                        value={this.state.tab}
                        onChange={this.handleTabChange}
                        inputProps={{
                            name: 'age',
                            id: 'age-simple',
                        }}
                    >

                        <MenuItem value={'String'}>String</MenuItem>
                        <MenuItem value={'Number'}>Number</MenuItem>
                        <MenuItem value={'Object'}>Object</MenuItem>
                        <MenuItem value={'JSON'}>JSON</MenuItem>

                    </Select>
                    <FormHelperText>Select message type</FormHelperText>
                </FormControl>
                {this.state.tab === 'String' && <StringMessage onChange={this.onMessageChange} value={this.state.message} />}

                {this.state.tab === 'Number' && <NumberMessage onChange={this.onMessageChange} value={this.state.message} />}
                {this.state.tab === 'Object' && <ObjectMessage error={this.state.error} onChange={this.onMessageChange} value={this.state.message} />}
                {this.state.tab === 'JSON' && <ObjectMessage JSON error={this.state.error} onChange={this.onMessageChange} value={this.state.message} />}


                <Button disabled={!this.props.connected || this.state.error} type="submit" variant="contained" color="primary" >
                    Send
              </Button>
            </form>

        )
    }
}

export default withStyles(styles)(SendMessage);
