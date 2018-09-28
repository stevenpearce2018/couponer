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
            cols={this.props.cols || null}
            class={this.props.htmlFor}
            name={this.props.name || null}
            required={this.props.required || null}
            rows={this.props.rows || null}
            value = {this.props.textarea || null}
            onChange={this.props.onChange || null}
            className={this.props.className}
          >
          </textarea>
        </fieldset>
      );
    }
  };

  export default Textarea;