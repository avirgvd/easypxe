import history from '../history';

require('es6-promise').polyfill();

import { deleteSession, postSession, getSession } from '../api/session';
import { updateHeaders, clearBrowserStorage } from '../api/utils';

const localStorage = window.localStorage;
export const SESSION_LOAD = 'SESSION_LOAD';
export const SESSION_LOGIN = 'SESSION_LOGIN';
export const SESSION_LOGIN_FAILURE = 'SESSION_LOGIN_FAILURE';
export const SESSION_LOGOUT = 'SESSION_LOGOUT';

export function initialize() {
  // //console.log("session: initialize");
  return (dispatch) => {
    const { isAuthenticated, token, themeMode } = localStorage;

    //console.log("initialize: ", localStorage);

    let data = {
      token: token,
      isAuthenticated: isAuthenticated == "true" ? true:false,
      themeMode: themeMode? themeMode:'dark'
    };
    if (token) {
      dispatch({
        type: SESSION_LOAD, payload: { data }
      });
    }
    // else {
    //   window.location = '/login';
    // }
  };
}

export function login(creds, done) {

  //console.log("creds: ", creds, "done: ", done);
  return dispatch => {
    postSession(creds)
      .then((payload) => {
        //console.log("login: payload: ", payload);

        if ('error' in payload && 'status' in payload['error']) {
          // if( payload['error']['status'] === 401) {
          clearBrowserStorage("login")
          let data = {
            data: {
              user: "",
              userName: "",
              token: "",
              isAuthenticated: false
            },
            error: {statusCode: payload.error.status, message: payload.error.statusText}
          };
          dispatch(loginFailure(data));
          done(false);

        } else {
          // updateHeaders({ Authorization: payload.access_token });
          //console.log("login: payload2: ");
          let data = {
            token: payload.access_token,
            isAuthenticated: true
          };
          // dispatch({ type: SESSION_LOGIN, data });
          dispatch(loginSuccess(data));
          //console.log("login: payload3: ");
          try {
            localStorage.isAuthenticated = "true";
            //console.log("login: payload4: ");
            localStorage.token = payload.access_token;
            //console.log("login: payload5: ");

          } catch (e) {
            //console.log("login: payload6: ", e);
            alert(
              'Unable to preserve session, probably due to being in private ' +
              'browsing mode.'
            );
          }
          //console.log("login: before done: ");
          done(true);
          //console.log("login: after done: ");
        }

      })
      .catch((err) => {
        //console.log("login failed: response: ", err);
        clearBrowserStorage("login2")
        let data = {
          data: {
            user: "",
            userName: "",
            token: "",
            isAuthenticated: false
          },
          error: {statusCode: err.status, message: err.statusText}
        };
        //console.log("login failed: data: ", data);
        dispatch(loginFailure(data));
        //console.log("after dispatch: ");
        done(false);
      })
  };
}

export function loginSuccess (data) {
  return { type: SESSION_LOGIN, data: data  }
}
export function loginFailure (data) {
  //console.log("loginFailure...")
  return { type: SESSION_LOGIN_FAILURE, data: data  }
}

export function validateToken(token, done) {
  //console.log("validateToken: ", token);
  return dispatch => (
    getSession(token)
      .then((response) => {
        console.log("validateToken: response: ", response);
        //console.log("validateToken: before done: ");
        // if ('error' in response && response.error['status'] === 401) {
        if ('error' in response && 'status' in response.error) {
          clearBrowserStorage("abc");
          let data = {
            data: {
              user: "abc",
              userName: "",
              token: "",
              isAuthenticated: false
            },
            error: { statusCode: response.error.status, message: response.error.statusText }
          };
          dispatch({
            type: SESSION_LOGIN_FAILURE,
            error: true,
            data
          })
          done(false)
        }
        else
          done(true);
        //console.log("validateToken: after done: ");
      })
      .catch((response) => {
        clearBrowserStorage("def")
        let data = {
          data: {
            user: "def",
            userName: "",
            token: "",
            isAuthenticated: false
          },
          error: { statusCode: response.status, message: response.statusText }
        };
        dispatch(loginFailure(data));
        done(false)
      } )
  );
}

export function logout(session) {
  //console.log("logout: session: ", session);
  return (dispatch) => {
    dispatch({ type: SESSION_LOGOUT });
    // deleteSession(session.data['token']);
    clearBrowserStorage("logout");
    window.location.href = '/ui/login'; // reload fully
  };
}
