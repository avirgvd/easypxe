import {
  DEPLOYSERVERS_LOAD,
  DEPLOYSERVERS_SAVE,
  DEPLOYSERVERS_OVLIST_LOAD,
  DEPLOYSERVERS_SPT_LIST,
  DEPLOYSERVERS_SPT_ETHPORTS_LIST,
  DEPLOYSERVERS_SPT_DRIVES_LIST,
  DEPLOYSERVERS_UPDATE_SCREENDATA,
  DEPLOYSERVERS_OSP_LOAD,
  DEPLOYSERVERS_DEPLOY_STATUS,
  DEPLOYSERVERS_NETWORKS_LOAD,
  DEPLOYSERVERS_UNLOAD,
  DEPLOYSERVERS_KICKSTARTS_LOAD,
  DEPLOYSERVERS_KICKSTARTS_CLEAR, DEPLOYSERVERS_SCREENDATA_SAVE, DEPLOYSERVERS_SERVERPOOLS_LOAD
} from '../actions/deployservers';

import { createReducer } from './utils';

const initialState = {
  deployServerSettings: {
    "name": "notitle",
    "origin": 3,
    "activeState": 0,
    "firmwareOnly": false,
    "firmwareBundle": "",
    "startIPRange": "",
    "endIPRange": "",
    "osPackage": "",
    "osInstallDest": "LocalDrive|BFS",
    commonOSConfig: {
      "hostIPAssignmentMode": "Static",
      "networkName": "",
      "netmask": "",
      "gateway": "",
      "NIC1": "",
      "NIC2": "",
      "odDrive": "",
      "ntp": "",
      "dns": "",
      "vlan": "",
      "rootPWD": "",
    },
    hostsdata: [
    ]
  },
  screenData: {
    "osPackages": [],
    "scripts": []
  },
  deployProgressData: {}
};

const handlers = {
  [DEPLOYSERVERS_LOAD]: (state, action) => {
    //console.log("InitialState: ", initialState);
    return action.state;
  },
  [DEPLOYSERVERS_SAVE]: (state, action) => {
    //console.log("DEPLOYSERVERS_SAVE: action: ", action);
    return {deployServerSettings: action.deployServerSettings};
  },
  [DEPLOYSERVERS_SCREENDATA_SAVE]: (state, action) => {
    console.log("DEPLOYSERVERS_SCREENDATA_SAVE: action: ", action);
    return {screenData: action.screenData};
  },
  [DEPLOYSERVERS_SERVERPOOLS_LOAD]: (state, action) => {
    //console.log("DEPLOYSERVERS_SERVERPOOLS_LOAD: action: ", action);
    let screenData = { ...state.screenData};
    screenData.serverPools = action.serverPools;
    return {screenData: screenData};
  },
  [DEPLOYSERVERS_OVLIST_LOAD]: (state, action) => {
    //console.log("DEPLOYSERVERS_OVLIST_LOAD: action: ", action);
    let screenData = { ...state.screenData};
    screenData.ovList = action.ovList;
    return {screenData: screenData};
  },
  [DEPLOYSERVERS_DEPLOY_STATUS]: (state, action) => {
    //console.log("DEPLOYSERVERS_DEPLOY_STATUS: action: ", action);
    let deployProgressData = { ...state.deployProgressData};
    deployProgressData.status = action.status;
    return {deployProgressData: deployProgressData};
  },
  [DEPLOYSERVERS_SPT_LIST]: (state, action) => {
    //console.log("DEPLOYSERVERS_SPT_LIST: action: ", action);
    let screenData = { ...state.screenData};
    screenData.sptList = action.list;
    return {screenData: screenData};
  },
  [DEPLOYSERVERS_SPT_ETHPORTS_LIST]: (state, action) => {
    //console.log("DEPLOYSERVERS_SPT_ETHPORTS_LIST: action: ", action);
    let screenData = { ...state.screenData};
    screenData.sptEthPorts = action.list;
    return {screenData: screenData};
  },
  // [DEPLOYSERVERS_SPT_ETHPORTS_LIST]: (state, action) => {
  //   //console.log("DEPLOYSERVERS_SPT_ETHPORTS_LIST: action: ", action);
  //   let screenData = { ...state.screenData};
  //   screenData.sptEthPorts = action.list;
  //   return {screenData: screenData};
  // },
  [DEPLOYSERVERS_UPDATE_SCREENDATA]: (state, action) => {
    //console.log("DEPLOYSERVERS_UPDATE_SCREENDATA: action: ", action);
    let data
    if (action.update.section === "screenData"){
      data = { ...state.screenData};
      data[action.update.param] = action.update.value;
      return {screenData: data};
    }
  },
  [DEPLOYSERVERS_SPT_DRIVES_LIST]: (state, action) => {
    //console.log("DEPLOYSERVERS_SPT_DRIVES_LIST: action: ", action);
    let screenData = { ...state.screenData};
    screenData.sptDrivesList = action.list;
    return {screenData: screenData};
  },
  // [DEPLOYSERVERS_SPT_DRIVES_LIST]: (state, action) => {
  //   console.log("DEPLOYSERVERS_SPT_DRIVES_LIST: action: ", action);
  //   let screenData = { ...state.screenData};
  //   screenData.sptDrivesList = action.list;
  //   return {screenData: screenData};
  // },
  [DEPLOYSERVERS_OSP_LOAD]: (state, action) => {
    //console.log("DEPLOYSERVERS_OSP_LOAD: action: ", action);
    let screenData = { ...state.screenData};
    screenData.osPackages = action.osPackages;
    return {screenData: screenData};
  },
  [DEPLOYSERVERS_NETWORKS_LOAD]: (state, action) => {
    //console.log("DEPLOYSERVERS_NETWORKS_LOAD: action: ", action);
    let screenData = { ...state.screenData};
    screenData.envList = action.env;
    return {screenData: screenData};
  },
  [DEPLOYSERVERS_KICKSTARTS_LOAD]: (state, action) => {
    //console.log("DEPLOYSERVERS_KICKSTARTS_LOAD: action: ", action);
    let screenData = { ...state.screenData};
    screenData.scripts = action.scripts;
    return {screenData: screenData};
  },
  [DEPLOYSERVERS_KICKSTARTS_CLEAR]: (state, action) => {
    //console.log("DEPLOYSERVERS_KICKSTARTS_CLEAR: action: ", action);
    let screenData = { ...state.screenData};
    screenData.scripts = [];
    return {screenData: screenData};
  },
  [DEPLOYSERVERS_UNLOAD]: () => initialState,

};

export default createReducer(initialState, handlers);
