import React from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import { withStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import Checkbox from '@material-ui/core/Checkbox';
import FormHelperText from '@material-ui/core/FormHelperText';
import Tooltip from '@material-ui/core/Tooltip';
import InfoIcon from '@material-ui/icons/Info';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import Select from '@material-ui/core/Select';
import StringMessage from './StringMessage';
import NumberMessage from './NumberMessage';
import FileMessage from './FileMessage';
import BooleanMessage from './BooleanMessage';
import ObjectMessage from './ObjectMessage';
import { Typography } from '@material-ui/core';
import { formatMs } from '@material-ui/core/styles/transitions';



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


class SendMessageForm extends React.Component {

    defaultFormats = ['File', 'String', 'Number', 'JSON', 'Boolean', 'Object'];

    onEventChange = (e) => {

        const event = e.target.value;
        // debugger;
        // this.setState({ event })
        this.props.onEventChange(event);
    }

    onMessageChange = (message) => {

        this.props.onMessageChange(message);
    }


    onSubmit = (e) => {
        // debugger;
        e.preventDefault();

        this.props.onSubmit();
    }

    handleTypeChange = (e) => {
        // debugger;
        this.props.onTypeChange(e.target.value)
    }

    handleCheck = name => event => {
        this.props.handleCheck(event.target.checked);
    };

    // onTimeoutChange = (e)=>{
    //     const val = e.target.value;
    //     this.props.onTimeoutChange(val);
    // }
    addArgument = () => this.props.onAddArgument();


    render() {

        const { classes } = this.props;
        // debugger;
        if (this.props.formats) {

            var formats= this.props.formats;
            // debugger;
        } else {
            var formats = this.defaultFormats
        }




        return (
            <form className={classes.root} onSubmit={this.onSubmit} autoComplete="off">
                {this.props.callbackOption && <div style={{ display: 'inline-flex', width: '100%' }}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={this.props.useCallback}
                                onChange={this.handleCheck('checkedA')}
                                value="checkedA"
                                color="primary"
                            />

                        }
                        label="Wait for callback"
                    >

                    </FormControlLabel>
                    {/*<TextField
                    style={{maxWidth:'100px',height:'30px'}}
                    // id="outlined-password-input"
                    label="Milliseconds"
                    required
                    disabled={!this.props.useCallback}
                    // className={classes.textField}
                    onChange={this.onTimeoutChange} value={2000}
                    type="number"
                    fullWidth
                    name="message"
                    value={this.props.timeout}
                    // autoComplete="current-password"
                    margin="normal"
                    variant="outlined"
                   />*/}
                    <Tooltip enterDelay={350} placement="right" title={<Typography style={{ color: 'white' }}>
                        Will send a callback function with every message, as the last parameter.
                        If this callback isn't invoked after 5 seconds, the message's status will change to 'fail', allowing you to resend it.
                        If the callback is called with some data, it will be presented in the message. Make sure your server is set to handle this.
                </Typography>}>
                        <InfoIcon style={{ marginTop: '10px' }} color="default"></InfoIcon>
                    </Tooltip>

                </div>}

                {this.props.eventNameOption && <TextField
                    // id="outlined-password-input"
                    label="Event name"
                    required
                    // className={classes.textField}
                    onChange={this.onEventChange} value={this.props.eventName}
                    type="text"
                    fullWidth
                    name="event"

                    // autoComplete="current-password"
                    margin="dense"
                    variant="outlined"
                />}

                <FormControl className={classes.formControl}>
                    <InputLabel htmlFor="age-simple">Format</InputLabel>
                    <Select
                        value={this.props.type}
                        onChange={this.handleTypeChange}
                        inputProps={{
                            name: 'age',
                            id: 'age-simple',
                        }}
                    >

                        {formats.map((format) => {
                            return <MenuItem value={format}>{format}</MenuItem>
                        })}




                    </Select>
                    <FormHelperText>Select message type</FormHelperText>
                </FormControl>
                {this.props.type === 'String' && <StringMessage onChange={this.onMessageChange} value={this.props.message} />}

                {this.props.type === 'Number' && <NumberMessage onChange={this.onMessageChange} value={this.props.message} />}
                {this.props.type === 'Object' && <ObjectMessage error={this.props.error} onChange={this.onMessageChange} value={this.props.message} />}
                {this.props.type === 'JSON' && <ObjectMessage JSON error={this.props.error} onChange={this.onMessageChange} value={this.props.message} />}
                {this.props.type === 'File' && <FileMessage onChange={this.onMessageChange} value={this.props.message} />}
                {this.props.type === 'Boolean' && <BooleanMessage onChange={this.onMessageChange} value={typeof this.props.message === 'boolean' ? this.props.message : true} />}

                <Button disabled={!this.props.connected || this.props.error} type="submit" variant="contained" color="primary" >
                    Send
              </Button>
            </form>

        )
    }
}

export default withStyles(styles)(SendMessageForm);
