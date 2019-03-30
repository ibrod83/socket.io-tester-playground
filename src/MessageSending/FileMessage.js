import React from 'react';
import TextField from '@material-ui/core/TextField';


const FileMessage = (props) => {
    let realInput = null;
    // debugger;
    const onFileChange = (e) => {
        // debugger;
        if (e.target.files.length == 0) {
            return
        }
        props.onChange(e.target.files[0])
    }

    const onClick = (e) => {
        e.target.value = null
    }

    return (
        <div style={{ marginBottom: '10px' }}>
            <input
                style={{display:'none'}}
                ref={(input) => { realInput = input; }}
                // accept="image/*"
                // className={classes.input}
                id="raised-button-file"                
                type="file"
                // value="chuj"
                onChange={onFileChange}
                onClick={onClick}
            />
            <input type="button" value="Select file" onClick={()=>{realInput.click()}} />{props.fileName}

        </div>

    )
}

export default FileMessage;