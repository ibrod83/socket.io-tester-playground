import React from 'react';
import Chip from '@material-ui/core/Chip';
import EventIcon from '@material-ui/icons/Event';
import { withStyles } from '@material-ui/core/styles';


const styles = theme => ({
   
    chip: {
    //   fontSize:'10px'
    },
  });

const Event = (props) => {
    const { classes } = props;

    return (
        <Chip
            label={props.name}
          
            className={classes.chip}
            color="primary"
            icon={<EventIcon/>}
            onDelete={props.onDelete}
            variant="outlined"
        />
    )
}

export default withStyles(styles)(Event);
