import React from 'react';
import TextField from '@material-ui/core/TextField';


const NumberMessage = (props) => {

    

    return (
        <TextField
            // id="outlined-password-input"
            label="Message"
            required
            // className={classes.textField}
            onChange={(e)=>{props.onChange(e.target.value)}} value={props.value}
            type="number"
            fullWidth
            name="message"
            // autoComplete="current-password"
            margin="dense"
            variant="outlined"
        />
    )
}

export default NumberMessage;