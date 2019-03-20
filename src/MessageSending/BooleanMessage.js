import React from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';

const BooleanMessage = (props) => {
    console.log('props.value',props.value)
    return (
       <div>
            <Select
                // open={this.state.open}
                // onClose={this.handleClose}
                // onOpen={this.handleOpen}
                
                onChange={(e)=>{
                    // debugger;
                    props.onChange(e.target.value)
                }}
                value={props.value}
    
                // inputProps={{
                //   name: 'age',
                //   id: 'demo-controlled-open-select',
                // }}
              >
               
                <MenuItem value={true}>True</MenuItem>
                <MenuItem value={false}>False</MenuItem>
               
              </Select>
       </div>
    )
}

export default BooleanMessage;