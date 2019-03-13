import React from 'react';

import CardContent from '@material-ui/core/CardContent';
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import CopyIcon from '@material-ui/icons/FileCopy';
import DoneIcon from '@material-ui/icons/Done';
import RefreshIcon from '@material-ui/icons/Refresh';

import { ObjectInspector } from 'react-inspector'
import { chromeLight } from 'react-inspector'
import { createAlertAction } from './global';
import Tooltip from '@material-ui/core/Tooltip';
// import { withStyles } from '@material-ui/core/styles';
// import { Button } from '@material-ui/core';

// const styles = theme => ({
//     success: {
//         color: theme.palette.success,
//     },
//     pending: {
//         color: theme.palette.pending
//     }
// });


class Message extends React.Component {

    getType = (message) => {
        // debugger;
        switch (typeof message) {
            case 'string':
                return 'String'
            case 'object':
                if (Array.isArray(message)) {
                    return 'Array';
                } else {
                    return 'Object';
                }
            case 'number':
                return 'Number';

            default:
                break;
        }
    }



    onDataCopy = (str) => {
        const el = document.createElement('textarea');  // Create a <textarea> element
        if (typeof str === 'object') {
            try {
                str = JSON.stringify(str);
            } catch (error) {

                return createAlertAction('error', 'Unable to copy');
            }

        }
        el.value = str;                                 // Set its value to the string that you want copied
        el.setAttribute('readonly', '');                // Make it readonly to be tamper-proof
        el.style.position = 'absolute';
        el.style.left = '-9999px';                      // Move outside the screen to make it invisible
        document.body.appendChild(el);                  // Append the <textarea> element to the HTML document
        const selected =
            document.getSelection().rangeCount > 0        // Check if there is any content selected previously
                ? document.getSelection().getRangeAt(0)     // Store selection if found
                : false;                                    // Mark as false to know no selection existed before
        el.select();                                    // Select the <textarea> content
        document.execCommand('copy');                   // Copy - only works as a result of a user action (e.g. click events)
        document.body.removeChild(el);                  // Remove the <textarea> element
        if (selected) {                                 // If a selection existed before copying
            document.getSelection().removeAllRanges();    // Unselect everything on the HTML document
            document.getSelection().addRange(selected);   // Restore the original selection
        }

        createAlertAction('success', 'Copied to clipboard!');

    }

    getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'grey'

            case 'success':
                return 'green'
            case 'fail':
                return 'red'
            default:
                break;
        }
    }

    onMessageResend = (id) => {
        this.props.onMessageResend(id);
    }

    shouldComponentUpdate(nextProps) {//To prevent unnecessary rendering, due to the new props.onMessageResend object.

        if (this.props.message !== nextProps.message) {
            return true;
        }

        return false;
    }





    // handleHover = () => {
    //     this.setState({ CopyButtonShown: !this.state.CopyButtonShown })
    // }


    render() {
        const { owner, data, id, time, status, eventName } = this.props.message;
        console.log('item rendering!', this.props)
        return (



            <Card >
                <CardContent style={{ padding: '15px' }}>
                    <Typography style={{ float: 'right' }} color="textSecondary" gutterBottom>
                        {time}
                    </Typography>

                    <Typography color="primary" gutterBottom>
                        {owner ? 'Sent' : 'Received'} event: {eventName}
                    </Typography>

                    <Typography color="textSecondary" gutterBottom>
                        Type: {this.getType(data)}
                    </Typography>
                    <ObjectInspector theme={{ ...chromeLight, ...({ TREENODE_FONT_SIZE: '18px', TREENODE_FONT_FAMILY: 'roboto,helvetica,arial' }) }} data={data} />

                    <div style={{ float: 'right', position: 'relative', left: '6px', bottom: '49px' }} >
                        <Tooltip title="Copy to clipboard">
                            <IconButton onClick={() => { this.onDataCopy(data) }} ><CopyIcon fontSize="small"></CopyIcon></IconButton>
                        </Tooltip>
                        {owner && (

                            <div style={{ textAlign: 'center' }}>
                                {status === 'fail' ? (
                                    <Tooltip title="Resend message">
                                        <IconButton style={{padding:'2px'}} onClick={() => { this.onMessageResend(id) }} aria-label="Resend message">
                                            <RefreshIcon style={{ color: 'red' }} />
                                        </IconButton>
                                    </Tooltip>
                                ) : (
                                        <DoneIcon style={{ color: this.getStatusColor(status) }}></DoneIcon>
                                    )
                                }

                            </div>




                        )}

                    </div>
                </CardContent>



            </Card>
        )
    }




}

// export default withStyles(styles)(Message);
export default Message;


// export default Message;

