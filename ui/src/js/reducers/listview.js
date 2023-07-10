
import {ITEMS_LOAD_SUCCESS, ITEMS_LOAD_FAILURE,ITEM_LOAD_SUCCESS, ITEM_LOAD_FAILURE, CHANGE_LIST_VIEW} from '../actions/listview';
import { createReducer } from './utils';
import Immutable, {fromJS} from 'immutable';

// const initialState {
const initialState = Immutable.fromJS({
  categories: {
    "rm": {
      view: "grid",
      currentItem: {},
      error: {},
      items: []
    },
    "images": {
      view: "list",
      currentItem: {},
      error: {},
      items: []
    },
    "images-sync": {
      view: "list",
      currentItem: {},
      error: {},
      items: []
    },
    "env": {
      view: "grid",
      currentItem: {},
      error: {},
      items: []
    }
  },
  result: {}
});

const handlers = {
  [ITEMS_LOAD_SUCCESS]: (state, action) => {
    console.log("Reducer ITEMS_LOAD_SUCCESS action: ", action);
    console.log("Reducer ITEMS_LOAD_SUCCESS state: ", state);

    let newState = {};
    if(action.category) {
      newState = state
        .setIn(
          ['categories', action.category, 'items'],
          fromJS(action.items)
        )
        .setIn(
          ['categories', action.category, 'error'],
            fromJS(action.error)
        )
    }
    return newState
  },
  [ITEMS_LOAD_FAILURE]: (state, action) => {
    console.log("Reducer ITEMS_LOAD_FAILURE action: ", action);
    console.log("Reducer ITEMS_LOAD_FAILURE state: ", state);
    let newState = {};
    if(action.category) {
      newState = state
          .setIn(
              ['categories', action.category, 'items'],
              fromJS([])
          )
          .setIn(
              ['categories', action.category, 'error'],
              fromJS(action.error)
          )
    }
    return newState

  },
  [ITEM_LOAD_SUCCESS]: (state, action) => {
    console.log("Reducer ITEM_LOAD_SUCCESS action: ", action);
    console.log("Reducer ITEM_LOAD_SUCCESS state: ", state);

    let newState = {};
    if(action.category) {
      newState = state
          .setIn(
              ['categories', action.category, 'currentItem'],
              fromJS(action.currentItem)
          )
    }
    return newState
  },
  [ITEM_LOAD_FAILURE]: (state, action) => {
    console.log("Reducer ITEM_LOAD_FAILURE action: ", action);
    console.log("Reducer ITEM_LOAD_FAILURE state: ", state);
    let newState = {};
    if(action.category) {
      newState = state
          .setIn(
              ['categories', action.category, 'currentItem'],
              fromJS({})
          )
          .setIn(
              ['categories', action.category, 'error'],
              fromJS(action.error)
          )
    }
    return newState

  },
  [CHANGE_LIST_VIEW]: (state, action) => {
    console.log("Reducer CHANGE_LIST_VIEW action: ", action);
    console.log("Reducer CHANGE_LIST_VIEW state: ", state);
    let newState = {};
    if(action.category) {
      newState = state
          .setIn(
              ['categories', action.category, 'view'],
              action.view
          )
    }
    return newState
  },
};

// export default createReducer(initialState, handlers);

export default function listviewReducer (state = initialState, action) {
  let handler = handlers[action.type];

  // console.log("listviewReducer ", action);
  if (!handler) return state;

  // return exact immutable state that is returned by handler
  return handler(state, action);
};
