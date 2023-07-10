import {Box, MaskedInput, Text} from 'grommet';
import React, {Component} from "react";

export default class TipContent extends Component {

  constructor (props) {
    super(props);
  }

  // https://storybook.grommet.io/?path=/story/controls-tip-caret--caret
  render() {
    const { message } = this.props;

    return (
      <Box direction="row" align="center">
        <svg viewBox="0 0 22 22" version="1.1" width="22px" height="22px">
          <polygon
            fill="grey"
            points="6 2 18 12 6 22"
            transform="matrix(-1 0 0 1 30 0)"
          />
        </svg>
        <Box background="grey" direction="row" pad="small" round="xsmall">
          <Text color="accent-1">{message}</Text>
        </Box>
      </Box>
    );
  }
};

