import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {Sidebar, Text, Box} from 'grommet';
import { Button } from 'grommet';
import { Nav } from 'grommet';
import version from "../version";
import {getRESTApi} from "../api/server-rest";
import history from '../history';

const SidebarButton = ({ icon, label, ...rest }) => (
    <Box align="start" justify="start" fill="horizontal" pad="small" direction="column" hoverIndicator >
      <Button
        id="sidebarbutton"
        plain
        alignSelf='start'
        hoverIndicator
        icon={icon}
        label={label}
        {...rest}
      >
      </Button>
    </Box>
);

class NavSidebar extends Component {

  constructor(props) {
    super(props);

    this.state = {
      serverVersion: "",
      serverConnected: false,
      activeLabel: ""
    }
  }

  componentDidMount() {
    console.log("NavSidebar: componentDidMount: ");

    getRESTApi("/rest/version")
      .then((response) => {
        //console.log("NavSidebar: componentDidMount: response: ", response);
        this.setState({serverVersion: response.version, serverConnected: true})
      })
      .catch((err) => {
        //console.log("NavSidebar: componentDidMount: err: ", err);
        this.setState({serverVersion: "", serverConnected: false})
        history.push({pathname: '/ui/login'});
        return;
      })
      if ( this.props.session.data['isAuthenticated'] == false ) {
        history.push({pathname: '/ui/login'});
      }

  }

  componentDidUpdate(prevProps, prevState, snapshot) {
  }

  render() {
    console.log("NavSidebar: render: this.props: ", this.props);

    // Dont show sidebase when session is not authorized.
    if ( this.props.session.data['isAuthenticated'] == false ) {
      return "";
    }

    // const { nav: { items } } = this.props;
    const { items }  = this.props.nav;
    //console.log("NavSidebar: render", items);
    //console.log("NavSidebar: render", items.length);

    // TODO Problem code. Need fix
    const links = items.map((page, index) => (
      <SidebarButton
        key={page.path}
        icon={<page.icon />}
        href={page.path}
        active={true}
        label={page.label}
        active={page.label === this.state.activeLabel}
        onClick={() => this.setState({activeLabel: page.label})}
      />
    ));

    // console.log("NavSidebar: render: ", this.state);
    // console.log("NavSidebar: render: ", version.version);

    return (
      <Sidebar id="sidebar" direction="column" background="background-contrast"
               header={
                 <Box tag='title' a11yTitle='Close Menu'/>
               }
               footer={
                 <Box justify="end" align="end" direction="column"  full="horizontal">
                   <Box tag='label'><Text size="xsmall">EasyPXE UI: v{version.version}</Text></Box>
                   { this.state.serverConnected && (
                     <Box tag='label'><Text size="xsmall">EasyPXE Server: v{this.state.serverVersion}</Text></Box>
                   )}
                   { !this.state.serverConnected && (
                     <Box tag='label'><Text size="xsmall">EasyPXE Server: Not connected</Text></Box>
                   )}
                 </Box>
               }
               pad={{ left: 'medium', right: 'large', vertical: 'small' }}
      >
        <Nav gap="none">
          {links}
        </Nav>
      </Sidebar>
    );

  }
}

NavSidebar.defaultProps = {
  nav: {
    active: true, // start with nav active
    enabled: true, // start with nav disabled
    responsive: 'multiple'
  }
};

NavSidebar.propTypes = {
  dispatch: PropTypes.func.isRequired,
  session: PropTypes.object.isRequired,
  nav: PropTypes.shape({
    items: PropTypes.arrayOf(PropTypes.shape({
      path: PropTypes.string,
      label: PropTypes.string
    }))
  })
};

const select = state => ({
  nav: state.nav,
  session: state.session
});

export default connect(select)(NavSidebar);
