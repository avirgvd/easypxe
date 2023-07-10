
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';

import { Box, Button} from 'grommet';
import { ServerCluster as Logo }  from 'grommet-icons';

import { navActivate } from '../actions/nav';

class NavControl extends Component {
  render() {
    const { name, nav: { active } } = this.props;

    let result;
    const title = <Box tag='title'>{name}</Box>;
    if (!active) {
      result = (
        <Button onClick={() => this.props.dispatch(navActivate(true))}>
          <Box
            direction='row'
            responsive={false}
            pad={{ between: 'small' }}
          >
            <Logo />
            {title}
          </Box>
        </Button>
      );
    } else {
      result = title;
    }
    return result;
  }
}

NavControl.defaultProps = {
  name: undefined,
  nav: {
    active: true, // start with nav active
    enabled: true, // start with nav disabled
    responsive: 'multiple'
  }
};

NavControl.propTypes = {
  dispatch: PropTypes.func.isRequired,
  name: PropTypes.string,
  nav: PropTypes.object
};

const select = state => ({
  nav: state.nav
});

export default connect(select)(NavControl);
