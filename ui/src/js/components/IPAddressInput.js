
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {Box, Form, FormField, Header, Heading, Footer, Button, Layer, MaskedInput} from 'grommet';
import { EmptyCircle as BusyIcon}  from 'grommet-icons';

const IPv4ElementExp = /^[0-1][0-9][0-9]$|^2[0-4][0-9]$|^25[0-5]$|^[0-9][0-9]$|^[0-9]$/;

export default class IPAddressInput extends Component {

  constructor (props) {
    super(props);
  }

  // https://storybook.grommet.io/?path=/story/input-maskedinput-ipv4-address--i-pv-4-masked-input
  render() {
    return (
      <MaskedInput
        mask={[
          {
            length: [1, 3],
            regexp: IPv4ElementExp,
            placeholder: '000',
          },
          { fixed: '.' },
          {
            length: [1, 3],
            regexp: IPv4ElementExp,
            placeholder: '000',
          },
          { fixed: '.' },
          {
            length: [1, 3],
            regexp: IPv4ElementExp,
            placeholder: '000',
          },
          { fixed: '.' },
          {
            length: [1, 3],
            regexp: IPv4ElementExp,
            placeholder: '000',
          }
        ]}
        id={this.props.id}
        name={this.props.name}
        value={this.props.value}
        disabled={this.props.disabled}
        onChange={this.props.onChange}
      />
    );
  }
};

