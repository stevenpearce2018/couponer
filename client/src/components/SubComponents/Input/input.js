import React, { Component } from 'react';
import Label from '../Label/label';

class Input extends Component {
    render() {
      return (
        <fieldset>
          <Label
            hasLabel={this.props.hasLabel}
            htmlFor={this.props.htmlFor}
            label={this.props.label}
            icon={this.props.icon}
          />
  
          <input
            className={this.props.htmlFor}
            name={this.props.name}
            max={this.props.max || ''}
            min={this.props.min || ''}
            placeholder={this.props.placeholder || ''}
            required={this.props.required || ''}
            step={this.props.step || ''}
            type={this.props.type || 'text'}
            onChange={this.props.onChange || ''}
          />
        </fieldset>
      );
    }
}

export default Input;