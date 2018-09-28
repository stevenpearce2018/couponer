import React, { Component } from 'react';
import Label from '../Label/label';

// Create component for select input
class Select extends Component {
    render() {
      // Get all options from option prop
      const selectOptions = this.props.options.split(', ');
  
      // Generate list of options
      const selectOptionsList = selectOptions.map((selectOption, index) => {
        return <option key={index} value={index}>{selectOption}</option>
      });
  
      return (
        <fieldset>
          <Label
            hasLabel={this.props.hasLabel}
            htmlFor={this.props.htmlFor}
            label={this.props.label}
            className={this.props.className}
          />
          
          <select
            defaultValue=''
            class={this.props.htmlFor}
            name={this.props.name || null}
            required={this.props.required || null}
            value = {this.props.length || null}
            onChange={this.props.onChange || null}
          >
            <option value='' disabled>Make Selection</option>
  
            {selectOptionsList}
          </select>
        </fieldset>
      );
    }
  };

  export default Select;