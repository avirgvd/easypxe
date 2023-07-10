import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Box } from 'grommet';
import NavSidebar from './NavSidebar';
import { navResponsive } from '../actions/nav';
import history from '../history';


class Main extends Component {
  constructor() {
    super();
    this._onResponsive = this._onResponsive.bind(this);
  }

  componentDidMount() {
    history.push('/ui/login');
  }

  _onResponsive(responsive) {
    this.props.dispatch(navResponsive(responsive));
  }

  render() {
    const { session,
      nav: { active: navActive, enabled: navEnabled, responsive }
    } = this.props;

    //console.log("Main render: this.props: : ", this.props);
    //console.log("Main render: session: : ", session);

    let isAuthenticated = session.data['isAuthenticated']

    if (isAuthenticated == false) {
      this.props.history.push('/ui/login')
    }

    const includeNav = (navActive && navEnabled);
    let nav1;
    if (includeNav) {
      nav1 = <NavSidebar />;
    }

    //console.log("nav: ", this.props.nav);
    //console.log("nav1: ", nav1);
    //console.log("this.props.children: ", this.props.children);
    const priority = (includeNav && responsive === 'single' ? 'left' : 'right');

    // const size = React.useContext(ResponsiveContext);

    return (
      <Box justify="between"></Box>
      /*<Grommet centered={false}>*/

      /*</Grommet>*/
    );
  }
}

Main.defaultProps = {
  nav: {
    active: true, // start with nav active
    enabled: true, // start with nav disabled
    responsive: 'multiple'
  }
};

Main.propTypes = {
  dispatch: PropTypes.func.isRequired,
  nav: PropTypes.shape({
    active: PropTypes.bool,
    enabled: PropTypes.bool,
    responsive: PropTypes.string
  })
};

const select = state => ({
  nav: state.nav,
  session: state.session
});

export default connect(select)(Main);
