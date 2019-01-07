import React from 'react';
import Label from '../Label/label';

const Input = props => {
      return (
        <fieldset>
          <Label
            hasLabel={props.hasLabel}
            htmlFor={props.htmlFor}
            label={props.label}
            icon={props.icon}
          />
  
          <input
            className={props.htmlFor}
            name={props.name}
            max={props.max || ''}
            min={props.min || ''}
            placeholder={props.placeholder || ''}
            required={props.required || ''}
            step={props.step || ''}
            type={props.type || 'text'}
            onChange={props.onChange || ''}
          />
        </fieldset>
      );
}

export default Input;