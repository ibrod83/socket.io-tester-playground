import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Tab from '@material-ui/core/Tab';
import ClearIcon from '@material-ui/icons/Clear';


const StyledTab = withStyles({
    root: {
        textTransform: 'initial',
        minHeight: '50px',
        minWidth:'0px'
    },

})(Tab);

const StyledClearIcon = withStyles({
    root: {
        fontSize: '20px',
        position: 'absolute',
        top: '20px',
        right: '0px'
    },

})(ClearIcon);



const RemovableTab = (props) => {

    const onClose = (e) => {
        e.stopPropagation();
        props.onClose()
    }

    const onClick = (e) => {
        // e.stopPropagation();
        props.click && props.click();
    }

    return (
        <StyledTab
            {...props}
            onClick={onClick}
            label={props.label}
            icon={props.showIcon && <StyledClearIcon onClick={onClose}></StyledClearIcon>}
        >

        </StyledTab>
    )
}

export default RemovableTab;