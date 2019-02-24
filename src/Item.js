import React from 'react';
// import { observer } from 'mobx-react';
import CardContent from '@material-ui/core/CardContent';
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
// import { withStyles } from '@material-ui/core/styles';
import ObjectItem from './ObjectItem';



const getContent = (message) => {
    if (typeof message === 'object' && !Array.isArray(message)) {
        return (
            <div>

                <Typography color="textSecondary" gutterBottom>
                    Type: Object
                </Typography>
                <Typography color="textPrimary" gutterBottom>
                   <ObjectItem object={message}></ObjectItem>
                </Typography>
            </div>

        )
    } else if (Array.isArray(message)) {
        return (
            <div>
                <Typography color="textSecondary" gutterBottom>
                    Type: Array
                </Typography>
                <Typography variant="h5" color="textPrimary" gutterBottom>

                    [{message.toString()}]
                </Typography>
            </div>
        )
    }


    else {
        return (
            <div>
                <Typography color="textSecondary" gutterBottom>
                    Type: String
         </Typography>
                <Typography variant="h5" color="textPrimary" gutterBottom>
                    {message}
                </Typography>
            </div>
        )

    }
}

const Item = (props) => {
    // console.log('props',props)


    return (



        <Card >
            <CardContent style={{padding:'15px'}}>
                <Typography style={{float:'right'}}   color="textSecondary" gutterBottom>
                    {props.time}
                </Typography>
                <Typography  color="primary" gutterBottom>
                    {props.owner ? 'Sent' : 'Received'} event: {props.eventName}
                </Typography>
                {getContent(props.data)}
            </CardContent>


           
        </Card>
    )

    // return (



    //     <div style={{ backgroundColor: '#3f51b5', borderRadius: '10px' }}>
    //         <Typography style={{ color: 'white' }} inline color="textSecondary" gutterBottom>
    //             {props.time}
    //         </Typography>
    //         <Typography style={{ color: 'white' }} color="primary" gutterBottom>
    //             {props.eventName}
    //         </Typography>


    //         {getContent(props.data)}
    //     </div>
    // )

}

export default Item;



// export default (props) => {
//     if (typeof props.data === 'object') {

//         return (
//             <p>
//                 <span style={{ color: 'navy' }}>{props.time}</span>
//                 {Object.keys(props.data).map((key) => {
//                     return (
//                         <p>

//                             <span onClick={props.onClick}>{key}: </span><span>{props.data[key]}</span>
//                         </p>
//                     )
//                 })}

//             </p>
//         )


//     } else {
//         return (

//             <p> <span style={{ color: 'navy' }}>{props.time}</span> {props.data}</p>
//         )
//     }

// }