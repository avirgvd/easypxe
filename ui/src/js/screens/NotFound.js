import React, { Component } from 'react';
import { PropTypes } from 'prop-types';

import { connect } from 'react-redux';

import { Box, Heading, Paragraph } from 'grommet';
// import Headline from 'grommet/components/Headline';

import { navEnable } from '../actions/nav';
import { pageLoaded } from './utils';

class NotFound extends Component {
  componentDidMount() {
    // pageLoaded('Not Found');
    this.props.dispatch(navEnable(false));
  }

  componentWillUnmount() {
    this.props.dispatch(navEnable(true));
  }

  render() {
    return (
      <Box full={true} align='center' justify='center'>
        <Box tag='headline' strong={true}>404</Box>
        <Heading>Oops...</Heading>
        <Paragraph size='large' align='center'>
          It seems that you are in the wrong route. Please check your URL and
          try again.
        </Paragraph>
      </Box>
    );
  }
}

NotFound.propTypes = {
  dispatch: PropTypes.func.isRequired
};

export default connect()(NotFound);
