import React from 'react';




const ObjectItem = (props) => {
    // console.log('props',props)


    return (


        <div>   
        &#123;
            {Object.keys(props.object).map((key) => {
                return (

                    <div>
                        <span >{key}: </span><span>{props.object[key]}</span>

                    </div>

                )
            })}

            &#125;	  
        </div>
    )



}

export default ObjectItem;



