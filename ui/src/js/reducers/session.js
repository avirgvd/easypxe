import { createReducer } from './utils';
import {
  SESSION_LOAD, SESSION_LOGIN, SESSION_LOGIN_FAILURE, SESSION_LOGOUT
} from '../actions/actions';

const initialState = {
  data: {
    user: "",
    userName: "",
    token: "",
    rememberMe: false,
    isAuthenticated: false
  },
  error: {}
};

const handlers = {
  [SESSION_LOAD]: (state, action) => action.payload,
  [SESSION_LOGIN]: (state, action) => {
    //console.log("SESSION_LOGIN: action: ", action)
    return {data: action.data};
  },
  [SESSION_LOGIN_FAILURE]: (state, action) => {
    //console.log("SESSION_LOGIN_FAILURE: action: ", action)
    return { error: action.data.error, data: action.data.data };
  },
  [SESSION_LOGOUT]: () => ({})
};

export default createReducer(initialState, handlers);