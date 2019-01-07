import React, { Component } from 'react';
import Label from '../Label/label';

// Create component for select input
const Select = props => {
      // Get all options from option prop
      const selectOptions = props.options.split(', ');
  
      // Generate list of options
      const selectOptionsList = selectOptions.map((selectOption, index) => {
        return <option key={index} value={index}>{selectOption}</option>
      });
  
      return (
        <fieldset>
          <Label
            hasLabel={props.hasLabel}
            htmlFor={props.htmlFor}
            label={props.label}
            className={props.className}
          />
          
          <select
            defaultValue=''
            className={props.htmlFor}
            name={props.name || ''}
            required={props.required || ''}
            value = {props.length}
            onChange={props.onChange || ''}
          >
            <option value='' disabled>Make Selection</option>
  
            {selectOptionsList}
          </select>
        </fieldset>
      );
  };

  export default Select;