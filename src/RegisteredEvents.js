import React from 'react';

export default (props) => {
    console.log('events from props',props.events)
    return(
        <div >
            {props.events.map(event=><p>{event.name}</p>)}
        </div>
     
    )

}