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

class Item extends React.PureComponent {
    // console.log('item rendering!',props)

    render(){
        console.log('item rendering!',this.props)
        return (



            <Card >
                <CardContent style={{padding:'15px'}}>
                    <Typography style={{float:'right'}}   color="textSecondary" gutterBottom>
                        {this.props.time}
                    </Typography>
                    <Typography  color="primary" gutterBottom>
                        {this.props.owner ? 'Sent' : 'Received'} event: {this.props.eventName}
                    </Typography>
                    {getContent(this.props.data)}
                </CardContent>
    
    
               
            </Card>
        )
    }
   

    

}

export default Item;



// export default (this.props) => {
//     if (typeof this.props.data === 'object') {

//         return (
//             <p>
//                 <span style={{ color: 'navy' }}>{this.props.time}</span>
//                 {Object.keys(this.props.data).map((key) => {
//                     return (
//                         <p>

//                             <span onClick={this.props.onClick}>{key}: </span><span>{this.props.data[key]}</span>
//                         </p>
//                     )
//                 })}

//             </p>
//         )


//     } else {
//         return (

//             <p> <span style={{ color: 'navy' }}>{this.props.time}</span> {this.props.data}</p>
//         )
//     }

// }