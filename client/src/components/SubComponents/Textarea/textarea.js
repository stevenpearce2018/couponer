import React, { Component } from 'react';
import Label from '../Label/label';

// Create component for textarea
class Textarea extends Component {
    render() {
      return (
        <fieldset>
          <Label
            hasLabel={this.props.hasLabel}
            htmlFor={this.props.htmlFor}
            label={this.props.label}
            className={this.props.className}
            icon={this.props.icon}
          />
  
          <textarea
            cols={this.props.cols || ''}
            name={this.props.name || ''}
            required={this.props.required || ''}
            rows={this.props.rows || ''}
            value = {this.props.textarea}
            onChange={this.props.onChange || ''}
            className={this.props.className}
          >
          </textarea>
        </fieldset>
      );
    }
  };

  export default Textarea;