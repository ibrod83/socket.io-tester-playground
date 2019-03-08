import {observable} from 'mobx';



const schema = {
    alertOpen: false,
    alertNature:'error',
    alertContent: '',        
}

const state = observable(schema);

export default window.state = state;



export const handleAlertCloseAction = (event, reason) => {
  
    if (reason === 'clickaway') {
      return;
    }
    state.alertOpen=false;
  }; 

export const createAlertAction = (nature,message)=>{
  Object.assign(state,{
    alertOpen:true,
    alertNature:nature,
    alertContent:message
  })
}  


