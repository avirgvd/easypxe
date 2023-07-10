import { combineReducers } from 'redux';

import deployservers from './deployservers';
import dashboard from './dashboard';
import nav from './nav';
import session from './session';
import settings from './settings';
import image from './image';
import item from './item';
import tasks from './tasks';
import { connectRouter } from 'connected-react-router';
import listview from "./listview";


const createRootReducer = (history) => combineReducers({
  router: connectRouter(history),
  session,
  nav,
  dashboard,
  image,
  item,
  tasks,
  listview,
  deployservers,
  settings
})


export default createRootReducer
