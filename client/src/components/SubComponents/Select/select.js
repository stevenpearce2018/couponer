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
            className={this.props.htmlFor}
            name={this.props.name || ''}
            required={this.props.required || ''}
            value = {this.props.length}
            onChange={this.props.onChange || ''}
          >
            <option value='' disabled>Make Selection</option>
  
            {selectOptionsList}
          </select>
        </fieldset>
      );
    }
  };

  export default Select;