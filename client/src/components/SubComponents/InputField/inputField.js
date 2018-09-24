import React, { Component } from 'react';

class InputField extends Component {
    constructor(props) {
      super(props)
    }
    render() {
      return (
      <div className="signupBox">
      <div className='inputLabel'>
      <label className='signupLabel' htmlFor={this.props.htmlFor}>
        <strong>{this.props.labelHTML}</strong>
      </label>
      </div>
      <input className='signupInput' type={this.props.type} placeholder={this.props.placeholder} onChange={this.props.onChange} required/>
      </div>
      )
    }
  }

  export default InputField;