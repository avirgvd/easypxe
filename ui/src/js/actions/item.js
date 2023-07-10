
import {getRESTApi} from '../api/server-rest';

export const ITEM_LOAD = 'ITEM_LOAD';
export const ITEM_LOAD_SUCCESS = 'ITEM_LOAD_SUCCESS';
export const ITEM_LOAD_FAILURE = 'ITEM_LOAD_FAILURE';
export const ITEM_UNLOAD = 'ITEM_UNLOAD';
export const ITEM_ADD = 'ITEM_ADD';
export const ITEM_ADD_SUCCESS = 'ITEM_ADD_SUCCESS';
export const ITEM_ADD_FAILURE = 'ITEM_ADD_FAILURE';
export const ITEM_UPDATE = 'ITEM_UPDATE';
export const ITEM_UPDATE_SUCCESS = 'ITEM_UPDATE_SUCCESS';
export const ITEM_UPDATE_FAILURE = 'ITEM_UPDATE_FAILURE';
export const ITEM_REMOVE = 'ITEM_REMOVE';
export const ITEM_REMOVE_SUCCESS = 'ITEM_REMOVE_SUCCESS';
export const ITEM_REMOVE_FAILURE = 'ITEM_REMOVE_FAILURE';
export const ITEM_LOAD_ACTIVITY = 'ITEM_LOAD_ACTIVITY';
export const ITEM_LOAD_ACTIVITY_SUCCESS = 'ITEM_LOAD_ACTIVITY_SUCCESS';
export const ITEM_LOAD_ACTIVITY_FAILURE = 'ITEM_LOAD_ACTIVITY_FAILURE';
export const ITEM_UNLOAD_ACTIVITY = 'ITEM_UNLOAD_ACTIVITY';
export const ITEM_LOAD_ASSCOCIATED = 'ITEM_LOAD_ASSCOCIATED';
export const ITEM_LOAD_ASSOCIATED_SUCCESS = 'ITEM_LOAD_ASSOCIATED_SUCCESS';
export const ITEM_UNLOAD_ASSOCIATED = 'ITEM_UNLOAD_ASSOCIATED';

const ITEM_WATCH = 'item';
const ITEM_WATCH_ASSOCIATED = 'item associated';
const ITEM_WATCH_ACTIVITY = 'item activity';

export function loadItem (uri) {
  //console.log("loadItem: uri: ", uri)
  return function (dispatch) {
    dispatch({ type: ITEM_LOAD, uri: uri });
    getRESTApi(uri)
      .then((response) => {
        //console.log("loadItem: response: ", response);
        //console.log("loadItem: response.result: ", response.result);
        dispatch(loadItemSuccess(response.result));
      })
      .catch((err) => {
        //console.log("loadItem: err: ", err);
        dispatch(loadItemFailure(err));
      })
  };
}

export function loadItemSuccess (item) {
  //console.log("loadItemSuccess: item: ", item);
  return { type: ITEM_LOAD_SUCCESS, item: item };
}

export function loadItemFailure (error) {
  return { type: ITEM_LOAD_FAILURE, error: error };
}

