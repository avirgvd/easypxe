
import {
  NAV_ACTIVATE, NAV_ENABLE, NAV_RESPONSIVE
} from '../actions/actions';
import Immutable from 'immutable';
import {Storage, Resources, ServerCluster, AppsRounded, Deploy, Actions, Code, Network, Tasks, System} from 'grommet-icons';

import { createReducer } from './utils';
import {grommet} from "grommet";

let path_prefix = '/ui';
if (process.env.NODE_ENV === 'production') {
  // Code will be removed from production build.
  path_prefix = '/ui';
}
else {
  path_prefix = '/ui';
}

const initialState = {
  active: true, // start with nav active
  enabled: true, // start with nav disabled
  responsive: 'multiple',
  items: [
    { path: path_prefix + '/dashboard', label: 'Dashboard', icon: AppsRounded},
    { path: path_prefix + '/deploy', label: 'Deployment', icon: Deploy},
    { path: path_prefix + `/images`, label: 'Image Store', icon: Storage},
    { path: path_prefix + `/activity`, label: 'Tasks', icon: Tasks},
    { path: path_prefix + `/settings`, label: 'Settings', icon: System}
  ]
};

const handlers = {
  [NAV_ACTIVATE]: (_, action) => (
    { active: action.active, activateOnMultiple: undefined }
  ),

  [NAV_ENABLE]: (_, action) => (
    { enabled: action.enabled }
  ),

  [NAV_RESPONSIVE]: (state, action) => {

    //console.log("reducer nav: NAV_RESPONSIVE, ", action);
    const result = { responsive: action.responsive };
    if (action.responsive === 'single' && state.active) {
      result.active = false;
      result.activateOnMultiple = true;
    } else if (action.responsive === 'multiple' && state.activateOnMultiple) {
      result.active = true;
    }
    return result;
  }
};

export default createReducer(initialState, handlers);
