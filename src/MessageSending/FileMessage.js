import React from 'react';
import TextField from '@material-ui/core/TextField';


const FileMessage = (props) => {
    // debugger;
    const onFileChange  = (e)=>{
        // debugger;
        props.onChange(e.target.files[0]) 
    }

    return (
        <div style={{marginBottom:'10px'}}>
            <input
                // accept="image/*"
                // className={classes.input}
                id="raised-button-file"
                multiple
                type="file"
                // value="chuj"
                onChange={onFileChange}
            />
        </div>
        
    )
}

export default FileMessage;