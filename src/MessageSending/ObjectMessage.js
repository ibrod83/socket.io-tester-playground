import React from 'react';
import TextField from '@material-ui/core/TextField';

// import 'codemirror/lib/codemirror.css';
// import 'codemirror/theme/material.css';
// import 'codemirror/mode/javascript/javascript'
// import { Controlled as CodeMirror } from 'react-codemirror2'

const ObjectMessage = (props) => {

    // return (
    //     <div>
    //         <CodeMirror
    //             value={props.value}
    //             options={{ mode: { name: 'javascript', json: true } }}
    //             onBeforeChange={(editor, data, value) => {
    //                 props.onChange(value)
    //             }}
                
    //         />
    //     </div>
    // )


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