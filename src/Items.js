import React from 'react';
import Item from './Item';


export default (props) => {

    return (
        <ul style={{ listStyle: 'none', paddingLeft: '0' }}>




            {props.items.map((item, index) => <li style={{ display: 'block', width: '100%', float: 'left' }}><div
                style={{
                    // display: 'inline-block',
                    float: item.owner ? 'left' : 'right',
                    width:'40%'
                    
                }}>
                <Item owner={item.owner} eventName={item.eventName} time={item.time} data={item.data} >
                </Item>
            </div>
            </li>)}

        </ul>

    )

}