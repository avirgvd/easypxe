import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormField, TextInput, CheckBox } from 'grommet';
import { NumberInput, PasswordInput } from 'grommet-controls';

const DEFAULT_TITLE = 'EasyPXE Server';

export function getFormFieldByDatatype(field, label, datatype, defaultval, onChange ) {

	let inputControl;
	if(datatype === "text")
		inputControl = (<TextInput id={field} defaultValue={defaultval} onDOMChange={onChange}/>);
	else if(datatype === "password")
		inputControl = (<PasswordInput id={field} onChange={onChange}/>);
	else if(datatype === "bool")
		inputControl = (<CheckBox id={field} checked={defaultval} onChange={onChange}/>);
	else if(datatype === "number")
		inputControl = (<NumberInput id={field} defaultValue={defaultval} onChange={onChange}/>);

  return (
  			<FormField label={label} htmlFor={field}>
           		{inputControl}
            </FormField>
         );
}

