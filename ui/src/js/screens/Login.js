/*
Code taken from Form example from: https://design-system.hpe.design/templates/forms

 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {
    Box,
    Button,
    Form,
    FormField,
    Header,
    Footer,
    Text,
    TextInput,
} from 'grommet';

import {FormClose, FormNext, CircleAlert} from 'grommet-icons';

import version from "../version";

import {login} from '../actions/session';
import {navEnable} from '../actions/nav';
import {pageLoaded} from './utils';
import history from '../history';
import {loadSettings_store} from "../actions/settings";

const passwordRequirements = [
    {
        regexp: new RegExp('(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[#?!@$ %^&*-]).{8,}'),
        message: 'Password requirements not met.',
        status: 'error',
    },
];

const passwordRulesStrong = [
    {
        regexp: new RegExp('(?=.*?[A-Z])'),
        message: 'One uppercase letter',
        status: 'error',
    },
    {
        regexp: new RegExp('(?=.*?[a-z])'),
        message: 'One lowercase letter',
        status: 'error',
    },
    {
        regexp: new RegExp('(?=.*?[#?!@$ %^&*-])'),
        message: 'One special character',
        status: 'error',
    },
    {
        regexp: new RegExp('.{8,}'),
        message: 'At least 8 characters',
        status: 'error',
    },
];

const userValidation = [
    // {
    //   regexp: new RegExp('[^@ \\t\\r\\n]+@'),
    //   message: 'Enter a valid email address.',
    //   status: 'error',
    // },
    // {
    //   regexp: new RegExp('[^@ \\t\\r\\n]+@[^@ \\t\\r\\n]+\\.[^@ \\t\\r\\n]+'),
    //   message: 'Enter a valid email address.',
    //   status: 'error',
    // },
    // {
    //   regexp: new RegExp('[^@ \\t\\r\\n]+@[^@ \\t\\r\\n]+\\.[^@ \\t\\r\\n]+'),
    //   message: 'Enter a valid email address.',
    //   status: 'error',
    // },
];


class Login extends Component {
    constructor(props) {
        super(props);
        this._onSubmit = this._onSubmit.bind(this);
        this.onChange = this.onChange.bind(this);

        this.state = {
            creds: {username: "", password: ""},
            size: 'small',
            credentialError: false,
            showForgotPassword: false,
            redirect: "/deploy",
            loginSucceeded: false
        };
    }

    componentDidMount() {
        pageLoaded('Login');
        // this.state.size = useContext(ResponsiveContext);
        // this.props.dispatch(navEnable(false));

        //console.log("componentDidMount: window.location.pathname: ", window.location.pathname);

        // if (window.location.pathname == "/logout") {
        //   this.props.dispatch(logout(this.props.session));
        // }
        if (this.props.session.data['isAuthenticated'] == true) {
            //console.log("componentDidMount: Login: redirecting to ", this.state.redirect);
            // history.push({pathname: '/ui/dashboard'});
            history.push({pathname: '/ui/dashboard'});
        }
    }

    componentWillUnmount() {
        this.props.dispatch(navEnable(true));
    }

    onChange(values) {
        // console.log("Values: ", values);

        this.setState({creds: values});

    }

    _onSubmit(event) {
        event.preventDefault();
        // console.log("_onSubmit: this.state.creds: ", this.state.creds);
        this.props.dispatch(
            login(this.state.creds, (result) => {
                console.log("login success: ", result)
                if (result){
                    // history.push({pathname: '/ui/deploy'});
                    // window.location.href = '/ui/dashboard'
                    this.props.dispatch(loadSettings_store())
                    window.location.href = '/ui/dashboard'
                }
                else
                    history.push({pathname: '/ui/login'});
            })
        );
    }

    render() {
        // console.log("render: Login: this.props: ", this.props);
        const {session} = this.props;

        // console.log("Login: session", session);
        // console.log("Login: this.state", this.state);
        // console.log("Login: window.location.pathname: ", window.location.pathname);

        let notif = (<Box overflow="auto" align="center" flex="grow" background={{"color":"status-error","opacity":"medium"}} />);
        // console.log("size: ", this.state.size);

        if (session.data['isAuthenticated'] == true) {
            //console.log("Login: redirecting to ", this.state.redirect);
            // window.location.href = "/ui/deploy";
            // history.push({pathname: '/ui/deploy'});
        }
        else
        {
            if ("error" in session && 'statusCode' in session.error) {
                if (session.error['statusCode'] === 401) {
                    //console.log('Invalid credentials?')
                    // Previous attempt to login failed.
                    notif = (
                      <Box
                        animation="fadeIn"
                        align="center"
                        background="validation-critical"
                        direction="row"
                        gap="xsmall"
                        margin={{top: 'medium', bottom: 'medium'}}
                        pad="small"
                        round="4px"
                      >
                          <CircleAlert size="small"/>
                          <Text size="xsmall">Invalid credentials.</Text>
                      </Box>
                    )
                } else {
                    // For all other errors
                    //console.log('Other errors: ', session)
                    notif = (
                      <Box
                        animation="fadeIn"
                        align="center"
                        background="validation-critical"
                        direction="row"
                        gap="xsmall"
                        margin={{top: 'medium', bottom: 'medium'}}
                        pad="small"
                        round="4px"
                      >
                          <CircleAlert size="small"/>
                          <Text color='status-error' size="xsmall">{session.error['statusCode']}: {session.error['message']}</Text>
                      </Box>
                    )
                }
            }

        }

        return (
            <Box
                id="loginform"
                justify="stretch"
                align="stretch"
                fill
            >
                <Box
                    align="center"
                    justify="center"
                    pad="large"
                >
                    <Header
                        align="center"
                        gap="xxsmall"
                        direction="column"
                        pad={{horizontal: 'small', vertical: 'large'}}
                    >
                        <Text size="xxlarge" weight="bold">
                            EasyPXE Login
                        </Text>
                        <Text size="small">
                            v{version.version}
                        </Text>
                    </Header>
                    <Form
                        validate="submit"
                        value={this.state.creds}
                        onChange={this.onChange}
                        messages={{
                            required: 'This is a required field.',
                        }}
                        onSubmit={this._onSubmit}
                    >
                        <FormField
                            required
                            label="User"
                            name="username"
                            htmlFor="user-sign-in"
                            validate={userValidation}
                        >
                            <TextInput
                                id="user-sign-in"
                                name="username"
                                autoFocus={true}
                                value={this.state.creds.username}
                                placeholder="Enter user name"
                                type="text"
                            />
                        </FormField>
                        <FormField
                            required
                            label="Password"
                            htmlFor="password-sign-in"
                            name="password"
                        >
                            <TextInput
                                id="password-sign-in"
                                name="password"
                                value={this.state.creds.password}
                                placeholder="Enter your password"
                                type="password"
                            />
                        </FormField>
                        {notif}

                        <Box
                            justify="around"
                            direction="row"
                            margin={{top: 'medium', bottom: 'small'}}
                        >
                            <Button
                                label="Login"
                                icon={<FormNext/>}
                                reverse
                                align="start"
                                primary
                                margin="small"
                                type="submit"
                            />
                        </Box>
                    </Form>
                    <br/>
                    <br/>
                    <Footer
                        pad={{horizontal: 'xlarge'}}
                    >
                        <Text size="xxsmall">
                        </Text>
                    </Footer>
                </Box>
            </Box>
        );
    }
}

Login.defaultProps = {
    session: {
        error: undefined
    }
};

Login.propTypes = {
    colorIndex: PropTypes.string,
    dispatch: PropTypes.func.isRequired,
    /*dropAlign: Menu.propTypes.dropAlign,*/
    session: PropTypes.object.isRequired
};

const select = state => ({
    session: state.session
});

export default connect(select)(Login);
