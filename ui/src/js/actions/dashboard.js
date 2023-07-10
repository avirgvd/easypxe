import {sptStorageDrives_Success} from "./deployservers";

require('es6-promise').polyfill();
import {getRESTApi} from '../api/server-rest';

export const DASHBOARD_LOAD_SUCCESS = 'DASHBOARD_LOAD_SUCCESS';
export const DASHBOARD_UNLOAD = 'DASHBOARD_UNLOAD';

export function loadDashboard() {
  //console.log("loadDashboard");
  return function (dispatch) {
    let url = '/rest/dashboard';
    getRESTApi(url)
      .then((response) => {
        //console.log("loadDashboard: response: ", response);
        //console.log("loadDashboard: response.result: ", response.result);
        dispatch(loadDashboard_Success(response));
      })
      .catch((err) => {
        console.log("loadDashboard: err: ", err);
      })
  };
}

export function loadDashboard_Success(result) {
  //console.log("loadIndex_Success: ", result);
  return {
    type: DASHBOARD_LOAD_SUCCESS,
    data: result
  };
}

export function unloadDashboard() {

  return function (dispatch) {
    dispatch({ type: DASHBOARD_UNLOAD });
  };
}
