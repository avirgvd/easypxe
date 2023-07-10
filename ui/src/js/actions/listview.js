import {getRESTApi, deleteRESTApi, postRESTApi} from '../api/server-rest';
require('es6-promise').polyfill();

export const ITEMS_LOAD_SUCCESS = 'ITEMS_LOAD_SUCCESS';
export const ITEMS_LOAD_FAILURE = 'ITEMS_LOAD_FAILURE';
export const ITEM_LOAD_SUCCESS = 'ITEM_LOAD_SUCCESS';
export const ITEM_LOAD_FAILURE = 'ITEM_LOAD_FAILURE';
export const ITEMS_UNLOAD = 'ITEMS_UNLOAD';
export const CHANGE_LIST_VIEW = 'CHANGE_LIST_VIEW';

export function setView(category, view){
  console.log("setView: view: ", view)
  return {
    type: CHANGE_LIST_VIEW,
    view: view,
    category: category
  };
}

export function loadItems(category){

  console.log("Get list by category: ", category);

  return dispatch => {
    let uri = "/rest/list/" + category;

    getRESTApi(uri)
      .then((response) => {
        console.log("loadItems: response: ", response);
        console.log("loadItems: category: ", category);
        if(response.hasOwnProperty("error") && response['error'].hasOwnProperty('status')) {
          dispatch(loadItems_Failure({category: category, error: response['error']}));
        }
        else{
          dispatch(loadItems_Success({category: response['result']['category'], items: response['result']['result'], error: response.error}));
        }
      })
      .catch((err) => {
        console.log("loadItems: err: ", err);
        dispatch(loadItems_Failure({error: err}));
      })
  }
}

export function loadItems_Success(result) {
  console.log("loadItems_Success: ", result);
  return {
    type: ITEMS_LOAD_SUCCESS,
    error: result["error"],
    items: result["items"],
    category: result['category']
  };
}

export function loadItems_Failure(result) {
  console.log("loadItems_Failure: ", result);
  return {
    type: ITEMS_LOAD_FAILURE,
    error: result['error'],
    category: result['category']
  };
}

export function loadItem(category, name) {
  console.log("loadItem: name: ", name)
  console.log("loadItem: category: ", category)
  return function (dispatch) {
    let uri = '/rest/' + category + '/' + name;
    getRESTApi(uri)
        .then((response) => {
          console.log("loadItem: response: ", response);
          if(response.hasOwnProperty("error") && response.error.hasOwnProperty("status")){
            dispatch(loadItem_Failure(category, response.error));
          }
          //console.log("loadItem: response.result: ", response.result);
          dispatch(loadItem_Success(category, response.result));
        })
        .catch((err) => {
          console.log("loadItem: err: ", err);
          dispatch(loadItem_Failure(category, err));
        })
  };
}

export function loadItem_Success(category, result) {
  //console.log("loadNetwork_Success: result: ", result);
  return { type: ITEM_LOAD_SUCCESS, category: category, currentItem: result };
}

export function loadItem_Failure(category, result) {
  //console.log("loadNetwork_Failure: result: ", result);
  return { type: ITEM_LOAD_FAILURE, category: category, error: result };
}

export function unloadItems() {

  return { type: ITEMS_UNLOAD };
}
