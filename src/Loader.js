import React from 'react';
// import { withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';



function Loader(props) {
//   const { classes } = props;
  return (
    <div>
     
      <CircularProgress size={21}  color="inherit" />
    </div>
  );
}


export default Loader;