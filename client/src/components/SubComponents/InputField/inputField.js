import React, { Component } from 'react';

class InputField extends Component {
    render() {
      return (
      <div className="signupBox">
      <div className='inputLabel'>
      <label className='signupLabel' htmlFor={this.props.htmlFor}>
        <strong>{this.props.labelHTML}</strong>
        <div className="icon">{this.props.icon}</div>
      </label>
      </div>
      <input className='signupInput' name={this.props.name} type={this.props.type} placeholder={this.props.placeholder} onChange={this.props.onChange}/>
      </div>
      )
    }
  }

  export default InputField;