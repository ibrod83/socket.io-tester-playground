import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
// import TextField from '@material-ui/core/TextField';
import ObjectMessage from './MessageSending/ObjectMessage';
import SettingsIcon from '@material-ui/icons/Settings';
import CastConnectedIcon from '@material-ui/icons/CastConnected';
import { fade } from '@material-ui/core/styles/colorManipulator';
import Typography from '@material-ui/core/Typography';
import Modal from '@material-ui/core/Modal';
import Select from '@material-ui/core/Select';
// import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
// import NativeSelect from '@material-ui/core/NativeSelect';

import InputLabel from '@material-ui/core/InputLabel';


import Loader from './Loader'


import InputBase from '@material-ui/core/InputBase';


const styles = theme => (
    {
        root: {
            flexGrow: 1,
        },

        search: {
            position: 'relative',
            borderRadius: theme.shape.borderRadius,
            backgroundColor: fade(theme.palette.common.white, 0.15),
            '&:hover': {
                backgroundColor: fade(theme.palette.common.white, 0.25),
            },
            marginRight: theme.spacing.unit * 2,
            marginLeft: 0,
            width: '100%',
            [theme.breakpoints.up('sm')]: {
                marginLeft: theme.spacing.unit * 3,
                width: 'auto',
            },
        },
        
        searchIcon: {
            width: theme.spacing.unit * 9,
            height: '100%',
            position: 'absolute',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        inputRoot: {
            color: 'inherit',
            width: '100%',
        },
        inputInput: {

            paddingTop: theme.spacing.unit,
            paddingRight: theme.spacing.unit,
            paddingBottom: theme.spacing.unit,
            paddingLeft: theme.spacing.unit * 10,
            transition: theme.transitions.create('width'),
            width: '100%',           
            [theme.breakpoints.up('md')]: {
                width: 200,
            },
        },
        inputInputQuery: {


            paddingTop: theme.spacing.unit,
            paddingRight: theme.spacing.unit,
            paddingBottom: theme.spacing.unit,
            paddingLeft: theme.spacing.unit,
            transition: theme.transitions.create('width'),
            width: '100%',
            [theme.breakpoints.up('md')]: {
                width: 200,
            },
        },
        paper: {
            position: 'absolute',
            width: theme.spacing.unit * 50,
            backgroundColor: theme.palette.background.paper,
            boxShadow: theme.shadows[5],
            padding: theme.spacing.unit * 4,
            outline: 'none',
        }
    }
);

class Header extends React.Component {

    state = {
        address: "localhost:3001",
        configOpen: false,
        configString: "",
        configError: false
    }

    onChange = (e) => {
        // const name = e.target.name;
        const value = e.target.value;
        // this.setState({
        //     [name]: value
        // })
        this.props.onAddressChange(value);
    }

    onSubmit = (e) => {
        e.preventDefault();

        switch (this.props.connectionStatus) {
            case 'connected':
            case 'reconnecting':
            case 'connecting':
                this.onDisconnectSubmit();

                break;
            case 'disconnected':
                this.onConnectSubmit();
                break;
            default:
                break;
        }
    }

    isObject = (value, returnParsed = false) => {//Returns the parsed object on success, false on failure.
        // debugger;
        let evalResult;
        try {
            eval(`evalResult = ${value}`) // if it doesn't throw it's a valid array or object
            if (typeof evalResult === 'object') {
                return returnParsed ? evalResult : true;
            } else {
                return false;
            }
        } catch (e) {
            return false;
        }
    }

    onConnectSubmit = (e) => {

        // let config;
        let value = this.props.configString;
        if (value !== "") {
            const isObject = this.isObject(value);
            // console.log('options', config)
            if (!isObject) {
                return alert('Invalid configuration object!');
            }
            // value = parsedObject;
        }

        // e.preventDefault();
        // alert(this.state.address)
        this.props.onConnectSubmit(this.state.address, value ? value : null);
    }

    onDisconnectSubmit = (e) => {
        // e.preventDefault();
        // alert(this.state.address)
        this.props.onDisconnectSubmit();
    }

    renderButton = () => {
        switch (this.props.connectionStatus) {
            case 'connected':
                return <Button type="submit" color="inherit">Disconnect</Button>;
            case 'reconnecting':
            case 'connecting':
                return <Button type="submit" color="inherit">Cancel</Button>;
            case 'disconnected':
                return <Button type="submit" color="inherit">Connect</Button>;
            // case 'connecting':
            //     return <Typography color="inherit" variant="subtitle1" >Connecting...</Typography>;
            // default:

        }

    }

    renderStatus = () => {
        switch (this.props.connectionStatus) {

            case 'reconnecting':
            case 'connecting':
                return <Loader></Loader>;
            case 'disconnected':
                return <SearchIcon></SearchIcon>;
            case 'connected':
                return <CastConnectedIcon></CastConnectedIcon>;
            default:
                return '';

        }
    }

    toggleConfig = () => {
        this.setState({ configOpen: !this.state.configOpen })
    }

    onConfigStringChange = (configString) => {
        console.log(configString);
        const isObject = this.isObject(configString);
        this.setState({ configError: !isObject })
        this.props.onConfigStringChange(configString);
    }


    handleModalClose = () => {
        this.setState((state) => {
            return { configOpen: !state.configOpen }
        })
    }

    onConnectionTypeChange = name => event => {
        // debugger;
        this.props.onConnectionTypeChange(event.target.value)
    };





    render() {

        const { classes, address, configString, connectionStatus, connectionType } = this.props;

        let disabled;

        if (connectionStatus === 'connected' || connectionStatus === 'connecting' || connectionStatus === 'reconnecting') {
            disabled = true;
        } else {
            disabled = false;
        }


        return (
            <form autoComplete="off" onSubmit={this.onSubmit} className={classes.root}>
                <AppBar position="static">
                    <Toolbar>
                        <FormControl >
                            <InputLabel htmlFor="age-native-simple">Connection type</InputLabel>
                            <Select
                                disabled={disabled}
                                native
                                value={connectionType}
                                onChange={this.onConnectionTypeChange('type')}
                                inputProps={{
                                    name: 'connectionType',
                                    id: 'connection_type',
                                }}
                            >

                                <option value={'SocketIO'}>SocketIO</option>
                                <option value={'native'}>Native socket</option>

                            </Select>
                        </FormControl>
                        <div className={classes.search}>
                            <div className={classes.searchIcon}>
                                {this.renderStatus()}

                            </div>
                            <InputBase
                                disabled={disabled}
                                name="address"
                                value={address}
                                
                                autoFocus
                                // autoComplete={'on'}
                                onChange={this.onChange}
                                // placeholder="localhost:3001"
                                classes={{
                                    root: classes.inputRoot,
                                    input: classes.inputInput,
                                    
                                }}
                            />

                        </div>




                        <Tooltip title="Add configuration">

                            <IconButton
                                disabled={disabled}
                                key="close"
                                aria-label="Close"
                                color="inherit"
                                // className={classes.close}
                                onClick={this.handleModalClose}
                            >
                                <SettingsIcon />
                            </IconButton>
                        </Tooltip>






                        <Modal
                            // style={getModalStyle()}
                            // className={classes.paper}
                            aria-labelledby="simple-modal-title"
                            aria-describedby="simple-modal-description"
                            open={this.state.configOpen}
                            onClose={this.handleModalClose}
                        >
                            <div style={{ top: '50%', left: '50%', transform: `translate(-${50}%, -${50}%)` }} className={classes.paper}>
                                <Typography variant="h5">Provide a configuration object to the socket. The string will be evaluated into a JS object</Typography>
                                <ObjectMessage value={configString} error={this.state.configError} onChange={this.onConfigStringChange}></ObjectMessage>
                                <Button onClick={this.handleModalClose} color="primary">Confirm</Button>
                            </div>

                        </Modal>





                        {this.renderButton()}

                    </Toolbar>

                </AppBar>

            </form>
        )
    }


}

export default withStyles(styles)(Header);