import React from 'react';
import SendMessageForm from './SendMessageForm';
// import uuid from 'uuid';
import Tabs from '@material-ui/core/Tabs';
// import Button from '@material-ui/core/Button';
import RemovableTab from '../Utilities/RemovableTab';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import AddIcon from '@material-ui/icons/Add';


export default class SendMessage extends React.Component {

    // state = {
    //     eventName: "yoyo",
    //     activeArg: 0,
    //     // timeout:5000,
    //     useCallback: false,
    //     args: [
    //         {
    //             message: "",
    //             type: 'String',
    //             error: false
    //         },
    //         // {
    //         //     message: "second message",
    //         //     type: 'String',
    //         //     error: false
    //         // }
    //     ]
    // }

    

    isObject = (value) => {//Returns the parsed object on success, false on failure.
        // debugger;
        let evalResult;
        try {
            eval(`evalResult = ${value}`) // if it doesn't throw it's a valid array or object
            if (typeof evalResult === 'object') {
                return evalResult;
            } else {
                return false;
            }
        } catch (e) {
            return false;
        }
    }

    isJson = (str) => {//Returns the parsed object on success, false on failure.
        // debugger;

        try {
            var obj = JSON.parse(str);
        } catch (e) {
            return false;
        }
        return obj;
    }

    // prepareFile = (fileObject)=>{

    // }

    onMessageChange = (arg, message) => {
        // debugger;
        const args = [...this.props.args];

        const index = args.indexOf(arg);



        let error = false;
        if (arg.type === 'Object') {
            const parsedMessage = this.isObject(message);
            if (!parsedMessage) {
                error = true;
            }
        }

        // else if (arg.type === 'File') {
        //     message = this.prepareFile(message);
        // }

        else if (arg.type === 'JSON') {
            const parsedMessage = this.isJson(message);
            if (!parsedMessage) {
                error = true;
            }
        }
        args[index].message = message;
        args[index].error = error;

        // this.props.onArgsChange = (args);
        this.props.onPropChange({args})
        
    }

    onEventChange = (eventName) => {


        this.props.onPropChange ({eventName})
        // this.setState({ eventName })
    }



    parseArg = (arg) => {

        switch (arg.type) {
            case 'Number':
                return parseInt(arg.message)
            // break;
            case 'Object':
                // debugger;
                let evalResult;
                eval(`evalResult = ${arg.message}`);
                return evalResult;
            default:
                break;
        }
        return arg.message;

    }

    onSubmit = () => {
        // debugger;
        let parsedArgs = [];

        const args = [...this.props.args];
        for (let arg of args) {
            const parsed = this.parseArg(arg);//Parse the message(with mutation, no new array).
            parsedArgs.push(parsed);//Push the parsed property.
        }

        

        this.props.onSubmit(this.props.eventName, parsedArgs, this.props.useCallback);
    }


    onArgChange = (e, value) => {
        // debugger;
        const arg = value;
        this.props.onPropChange({activeArg:arg})
        // this.setState({ activeArg: arg })
    }

    removeArg = (arg) => {
        // debugger;
        const args = [...this.props.args];
        const index = args.indexOf(arg);

        args.splice(index, 1);
        // this.setState(() => ({
        //     args,
        //     activeArg: args.length - 1
        // }))

        this.props.onPropChange({args,activeArg:args.length - 1})

    }

    addArgument = () => {

        const args = [...this.props.args];

        const initialLength = args.length;
            args.push({
                message: "",
                type: 'String',
                error: false
            })
        this.props.onPropChange({args,activeArg:initialLength});    
        // this.setState((state) => {
        //     const args = [...state.args];
        //     // debugger;
        //     const initialLength = args.length;
        //     args.push({
        //         message: "",
        //         type: 'String',
        //         error: false
        //     })

        //     return {
        //         args,
        //         activeArg: initialLength
        //     }
        // })
    }

    onTypeChange = (arg, type) => {
        const args = [...this.props.args];

        const index = args.indexOf(arg);
        args[index].type = type
        args[index].message = ""
        args[index].error = false;
        this.props.onPropChange({args})
        // this.setState((state) => {
        //     return {
        //         args
        //     }
        // })
    }

    // onTimeoutChange = (val)=>{
    //     this.setState({timeout:val})
    // }

    handleCheck = (checked) => {
        this.props.onPropChange({useCallback:checked})
        // this.setState({ useCallback: checked });
    }

    // renderSingleTab = () => {
    //     return <RemovableTab onClose={() => { return }} showIcon={false} name={0} label={`Argument ${1}`}></RemovableTab>
    // }

    renderMultiArgument = () => {

        return <Tabs
            value={this.props.activeArg}
            indicatorColor="primary"
            textColor="primary"
            onChange={this.onArgChange}
        >
            {this.props.args.map((arg, index) => {
                return <RemovableTab onClose={() => { this.removeArg(arg) }} showIcon={this.props.args.length > 1} key={index} name={index} label={`Argument ${index + 1}`}></RemovableTab>
            })}
            <Tooltip placement="right" enterDelay={350} title="Add an argument">
                <IconButton onClick={this.addArgument} aria-label="New tab">
                    <AddIcon />
                </IconButton>
            </Tooltip>

        </Tabs>

    }

    // renderSingleArgument = ()=>{
    //     return <RemovableTab onClose={() => { }} showIcon={false}  name={0} label={`Argument ${1}`}></RemovableTab>
    // }

    render() {
        const activeArg = this.props.args[this.props.activeArg]
        // debugger;
        const { message, error, type } = activeArg;
        const isSocketIO = this.props.multipleArguments;
        // debugger
        return (<div>



            {this.props.multipleArguments && this.renderMultiArgument() }

            <SendMessageForm
                message={message}
                type={type}
                useCallback={this.props.useCallback}
                error={error}
                formats={this.props.formats}
                eventNameOption={isSocketIO}
                callbackOption = {isSocketIO}
                // timeout={this.state.timeout}
                // onAddArgument={this.addArgument}
                onSubmit={() => { this.onSubmit(activeArg) }}
                onMessageChange={(message) => { this.onMessageChange(activeArg, message) }}
                onTypeChange={(type) => { this.onTypeChange(activeArg, type) }}
                onEventChange={this.onEventChange}
                onTimeoutChange={this.onTimeoutChange}
                handleCheck={this.handleCheck}
                eventName={this.props.eventName}
                connected={this.props.connected}></SendMessageForm>

        </div>



        )
    }
}







