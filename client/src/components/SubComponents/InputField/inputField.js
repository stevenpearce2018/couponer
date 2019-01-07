import React from 'react';

const InputField = props => {
      return (
      <div className="signupBox">
      <div className='inputLabel'>
      <label className='signupLabel' htmlFor={props.labelHTML}>
        <strong>{props.labelHTML}</strong>
        <div className="icon">{props.icon}</div>
      </label>
      <input className='signupInput' id={props.labelHTML} name={props.name} type={props.type} placeholder={props.placeholder} onChange={props.onChange}/>
      </div>
      </div>
      )
  }

  export default InputField;