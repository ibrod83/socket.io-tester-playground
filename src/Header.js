import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import SearchIcon from '@material-ui/icons/Search';
import CastConnectedIcon from '@material-ui/icons/CastConnected';
import { fade } from '@material-ui/core/styles/colorManipulator';

import InputBase from '@material-ui/core/InputBase';


const styles = theme => (
    {
        root: {
            flexGrow: 1,
        },
        grow: {
            flexGrow: 1,
        },
        menuButton: {
            marginLeft: -12,
            marginRight: 20,
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

    onConnectSubmit = (e) => {
        e.preventDefault();
        // alert(this.state.address)
        this.props.onConnectSubmit(this.state.address);
    }

    onDisconnectSubmit = (e) => {
        e.preventDefault();
        // alert(this.state.address)
        this.props.onDisconnectSubmit();
    }

    render() {
        const { classes } = this.props;
        return (
            <form autoComplete="off" onSubmit={this.props.connected ? this.onDisconnectSubmit :  this.onConnectSubmit} className={classes.root}>
                <AppBar position="static">
                    <Toolbar>

                        <div className={classes.search}>
                            <div className={classes.searchIcon}>
                                {this.props.connected ?  <CastConnectedIcon></CastConnectedIcon>: <SearchIcon></SearchIcon> }
                               
                            </div>
                            <InputBase
                                name="address"
                                value={this.state.address}
                                onChange={this.onChange}
                                placeholder="localhost:3000"
                                classes={{
                                    root: classes.inputRoot,
                                    input: classes.inputInput,
                                }}
                            />
                        </div>
                        <Button type="submit" color="inherit">{this.props.connected ? 'Disconnect' : 'Connect'}</Button>
                    </Toolbar>
                </AppBar>
            </form>
        )
    }


}

export default withStyles(styles)(Header);