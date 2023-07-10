/**
 * Created by govind on 9/5/18.
 */

import { SETTINGS_LOAD, SETTINGS_LOAD_SUCCESS, SETTINGS_UNLOAD } from '../actions/actions';
import { createReducer } from './utils';

const initialState = {
  settings: {
    logFilePath: "/usr/local/bma/log/bma.log",
    logLevel: "DEBUG",
    language: "English (US)",
    httpFileServer: "Local",
    themeMode: "Light",
                            deplQueueSize: 50,
    usersGroups: [
      {"name": "user1_1", "type": "User", "permission": "Administrator"},
      {"name": "user2", "type": "User", "permission": "Administrator"},
      {"name": "user3", "type": "User", "permission": "Administrator"},
      {"name": "adgroup1", "type": "Group", "permission": "Administrator"}
    ]
  },
  error: {}
};

const handlers = {
  // // [SETTINGS_LOAD]: (state, action) => {
  // //   console.log("reducers/settings: SETTINGS_LOAD action: ", action);
  // //   // var newState = {};
  // //   //
  // //   // newState = state
  // //   //   .setIn(['settings'], action.settings);
  // //   //
  // //   // return newState;
  // //   return {settings: action.settings};
  //
  // },
  [SETTINGS_LOAD_SUCCESS]: (state, action) => {
    console.log("reducers/settings: SETTINGS_LOAD_SUCCESS action: ", action);
    //console.log("reducers/settings: SETTINGS_LOAD_SUCCESS action: ", (action.settings));
    //console.log("reducers/settings: SETTINGS_LOAD_SUCCESS state: ", JSON.stringify(state));

    // var newState = state;
    // newState.settings = action.settings;
    // return newState;
    return {settings: action.settings, error: {}};

  },
  [SETTINGS_UNLOAD]: () => initialState
};

export default createReducer(initialState, handlers);
