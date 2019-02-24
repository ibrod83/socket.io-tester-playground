import React from 'react';
import TextField from '@material-ui/core/TextField';


const ObjectMessage = (props) => {

   


    return (
        <TextField
            // id="outlined-password-input"
            label="Object message"
            required
            error={props.error}
            multiline
            rows={10}
            // className={classes.textField}
            onChange={(e)=>{props.onChange(e.target.value)}} value={props.value}
            type="text"
            fullWidth
            name="message"

            // autoComplete="current-password"
            margin="dense"
            variant="outlined"
        />
    )
}

export default ObjectMessage;