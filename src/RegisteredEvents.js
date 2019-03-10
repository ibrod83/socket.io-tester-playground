import React from 'react';
import Event from './Event';
import Typography from '@material-ui/core/Typography';



const styles={
    marginBottom:'10px',
    marginTop:'10px'
}

export default (props) => {
    console.log('events from props',props.events)
    return(
        <div >
        <Typography variant="subtitle1" gutterBottom>
        Listening to events:
      </Typography>
            {props.events.map(event=><div style={styles}><Event onDelete={()=>{props.onEventDelete(event.name)}} name={event.name}></Event></div>)}
        </div>
     
    )

}