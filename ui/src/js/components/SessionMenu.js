import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import {Text, Anchor, Menu, Box, Heading, Nav} from 'grommet';
import { User as UserIcon, Home, Notification, Help } from 'grommet-icons';
import {getHostName} from '../api/server-rest';
import {login, logout} from '../actions/session';
import history from '../history';

const userSession = {
  user: {
    name: "",
    thumbnail: ""
  },
  items: [
    {
      label: "Logout",
      href: "/ui/logout"
    }
  ]
};

const help = {
  user: {
    name: "",
    thumbnail: ""
  },
  items: [
    {
      label: "About",
      href: "/ui/about"
    },
    {
      label: "Help",
      onClick: () => {window.open("/ui/easypxe-help.html")}
    }
  ]
};

class SessionMenu extends Component {
  constructor(props) {
    super(props);
    this._onSessionMenuClick = this._onSessionMenuClick.bind(this);
    this._onLogout = this._onLogout.bind(this);
  }

  componentDidMount () {
    //console.log("SessionMenu: componentDidMount: ")
    //console.log("SessionMenu: componentDidMount: ", this.props.session.data)
    if (this.props.session.data.isAuthenticated == false){
      history.push({
        pathname: "/ui/login"
      })
    }
  }


  _onLogout(event) {
    //console.log("_onLogout: ");
    const { session } = this.props;
    event.preventDefault();
    this.props.dispatch(logout(session));
  }
  _onSessionMenuClick(item) {
    //console.log("_onSessionMenuClick: item: ", item);
    // event.preventDefault();

    if (item == "/ui/logout") {
      const { session } = this.props;
      // this.props.dispatch(logout(session));
      this.props.dispatch(
        logout(session, () => {
          history.push({pathname: '/ui/login'});
        })
      );

    }
  }

  render() {
    //console.log("render: SessionMenu: this.props: ", this.props);
    const { dropAlign, colorIndex, session} = this.props;

    //console.log("render: SessionMenu: session: ", session);

    if ( "error" in session && session.error.statusCode == 401) {
      //console.log("render: SessionMenu: received HTTP status 401: UNAUTHORIZED so redirect to Login");
      // window.location.href = "/ui/login";
    }

    return (
      <Nav direction="row" pad="xsmall">
        <Box margin="xxsmall" direction="row" align="center" >
          <Menu
          label={session.user}
          icon={<UserIcon/>}
          colorIndex={colorIndex}
          a11yTitle='Session'
          items={userSession.items.map(item => ({
            ...item,
            label: <Text size="small">{item.label}</Text>,
            onClick: () => {
              this._onSessionMenuClick(item.href)
            } // no-op
          }))}
        >
          {/*<Anchor href='/logout' onClick={this._onLogout} label='Logout' />*/}
        </Menu>
          <Menu
          label={session.user}
          icon={<Help/>}
          colorIndex={colorIndex}
          a11yTitle='Session'
          items={help.items}
        >
          {/*<Anchor href='/logout' onClick={this._onLogout} label='Logout' />*/}
        </Menu>
        </Box>
      </Nav>
    );
  }
}

SessionMenu.defaultProps = {
  colorIndex: undefined,
  dropAlign: undefined,
};

SessionMenu.propTypes = {
  colorIndex: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
  /*dropAlign: Menu.propTypes.dropAlign,*/
  session: PropTypes.object.isRequired
};

const select = state => ({
  session: state.session
});

export default connect(select)(SessionMenu);
