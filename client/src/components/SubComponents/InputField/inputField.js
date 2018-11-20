import React, { Component } from 'react';

class InputField extends Component {
    render() {
      return (
      <div className="signupBox">
      <div className='inputLabel'>
      <label className='signupLabel' for={this.props.labelHTML}>
        <strong>{this.props.labelHTML}</strong>
        <div className="icon">{this.props.icon}</div>
      </label>
      <input className='signupInput' id={this.props.labelHTML} name={this.props.name} type={this.props.type} placeholder={this.props.placeholder} onChange={this.props.onChange}/>
      </div>
      </div>
      )
    }
  }

  export default InputField;