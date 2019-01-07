import React from 'react';
import Label from '../Label/label';

// Create component for textarea
const Textarea = props => {
      return (
        <fieldset>
          <Label
            hasLabel={props.hasLabel}
            htmlFor={props.htmlFor}
            label={props.label}
            className={props.className}
            icon={props.icon}
          />
  
          <textarea
            cols={props.cols || ''}
            name={props.name || ''}
            required={props.required || ''}
            rows={props.rows || ''}
            value = {props.textarea}
            onChange={props.onChange || ''}
            className={props.className}
          >
          </textarea>
        </fieldset>
      );
  };

  export default Textarea;