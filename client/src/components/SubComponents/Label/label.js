import React from 'react';


const Label = props => props.hasLabel === 'true' && props.icon ? <label htmlFor={props.htmlFor}>{props.label}<img className='icon' src={props.icon} alt="Icon used to decorate form labels"></img></label> : <label htmlFor={props.htmlFor}>{props.label}</label>;

export default Label;