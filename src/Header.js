import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import SearchIcon from '@material-ui/icons/Search';
import CastConnectedIcon from '@material-ui/icons/CastConnected';
import { fade } from '@material-ui/core/styles/colorManipulator';
import Typography from '@material-ui/core/Typography';
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
    }
);

class Header extends React.Component {

    state = {
        address: "localhost:3001"
    }

    onChange = (e) => {
        const name = e.target.name;
        const value = e.target.value;
        this.setState({
            [name]: value
        })
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

    onConnectSubmit = (e) => {
        // e.preventDefault();
        // alert(this.state.address)
        this.props.onConnectSubmit(this.state.address);
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

    render() {
        const { classes,connectionStatus } = this.props;
        let address;
        let disabled;
        if(connectionStatus === 'connected' || connectionStatus === 'connecting' || connectionStatus === 'reconnecting'){
            address= this.props.address;
            disabled = true;
        }else{
            address= this.state.address;
            disabled= false;
        }
        return (
            <form autoComplete="off" onSubmit={this.onSubmit} className={classes.root}>
                <AppBar position="static">
                    <Toolbar>

                        <div className={classes.search}>
                            <div className={classes.searchIcon}>
                                {this.renderStatus()}

                            </div>
                            <InputBase
                                disabled={disabled}    
                                name="address"
                                value={address}
                                onChange={this.onChange}
                                // placeholder="localhost:3001"
                                classes={{
                                    root: classes.inputRoot,
                                    input: classes.inputInput,
                                }}
                            />
                        </div>
                        {this.renderButton()}

                    </Toolbar>
                </AppBar>
            </form>
        )
    }


}

export default withStyles(styles)(Header);