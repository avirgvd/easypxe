import history from '../history';

require('es6-promise').polyfill();
import {getRESTApi, postRESTApi} from '../api/server-rest';

export const DEPLOYSERVERS_LOAD = 'DEPLOYSERVERS_LOAD';
export const DEPLOYSERVERS_SAVE = 'DEPLOYSERVERS_SAVE';
export const DEPLOYSERVERS_SERVERPOOLS_LOAD = 'DEPLOYSERVERS_SERVERPOOLS_LOAD';
export const DEPLOYSERVERS_SCREENDATA_SAVE = 'DEPLOYSERVERS_SCREENDATA_SAVE';
export const DEPLOYSERVERS_UNLOAD = 'DEPLOYSERVERS_UNLOAD';
export const DEPLOYSERVERS_OVLIST_LOAD = 'DEPLOYSERVERS_OVLIST_LOAD';
export const DEPLOYSERVERS_SPT_LIST = 'DEPLOYSERVERS_SPT_LIST';
export const DEPLOYSERVERS_SPT_DRIVES_LIST = 'DEPLOYSERVERS_SPT_DRIVES_LIST';
export const DEPLOYSERVERS_SPT_ETHPORTS_LIST = 'DEPLOYSERVERS_SPT_ETHPORTS_LIST';
export const DEPLOYSERVERS_UPDATE_SCREENDATA = 'DEPLOYSERVERS_UPDATE_SCREENDATA';
export const DEPLOYSERVERS_OSP_LOAD = 'DEPLOYSERVERS_OSP_LOAD';
export const DEPLOYSERVERS_DEPLOY_STATUS = 'DEPLOYSERVERS_DEPLOY_STATUS';
export const DEPLOYSERVERS_NETWORKS_LOAD = 'DEPLOYSERVERS_NETWORKS_LOAD';
export const DEPLOYSERVERS_KICKSTARTS_LOAD = 'DEPLOYSERVERS_KICKSTARTS_LOAD';
export const DEPLOYSERVERS_KICKSTARTS_CLEAR = 'DEPLOYSERVERS_KICKSTARTS_CLEAR';

export function performDeployServers(reqBody) {

  return dispatch => {

    let url = '/rest/deploy';
    // postRESTApi(url, bodyData).then(response => {
    //   console.log("performDeployServers: ", JSON.stringify(response));
    //   console.log("performDeployServers: ", JSON.stringify(response.result));
    //   dispatch(deployStatus(response.result));
    // });

    postRESTApi(url, reqBody)
      // .then(function (response) {
      //   console.log("performDeployServers: response: ", response);
      //   return response.json();
      // })
      .then(function (result) {
        //console.log("performDeployServers: result: ", JSON.stringify(result));
        dispatch(deployStatus(result));
        // TODO Fix this history handling
        history.push('/ui/deployprogress/' + result['result']['taskId']);
        // window.location.href = `/ui/deployprogress/${result['result']['taskID']}`;
      })
      .catch(function (ex) {
      //console.log("performDeployServers: Exception: ", ex);
    });
  };
}

export function loadDeployServers(state) {
  return { type: DEPLOYSERVERS_LOAD , state: state};
}

export function loadServerPools() {

  return dispatch => {
    let url = '/rest/respools/list';
    getRESTApi(url)
      .then((response) => {
        //console.log("loadDeployServers: response: ", response);
        //console.log("loadDeployServers: response.result: ", response.result);
        dispatch(loadServerPools_Success(response.result));
      })
      .catch((err) => {
        //console.log("loadDeployServers: err: ", err);
      })
  };
}

export function loadRMServerProfiles(alias, ovSPTName, callback) {

  let url = '/rest/rm/serverprofiles?ovname=' + alias + '&spt=' + ovSPTName;
  console.log("loadRMServerProfiles: action url: ", url)
  getRESTApi(url)
      .then((response) =>{
        callback(response['result'])
      })
      .catch((err) => {
        callback(undefined)
      })

  return undefined;
}

export function discoverRMResource(alias, sp, callback) {

  let url = '/rest/rm/discover?ovname=' + alias + '&sp=' + sp;
  console.log("discoverRMResource: action url: ", url)
  getRESTApi(url)
      .then((response) =>{
        console.log(response);
        callback(response['result']);
      })
      .catch((err) => {
        callback(undefined)
      })

  return undefined;
}

export function loadOneViews() {

  return dispatch => {
    let url = '/rest/rm/list';
    getRESTApi(url)
      .then((response) => {
        //console.log("loadDeployServers: response: ", response);
        //console.log("loadDeployServers: response.result: ", response.result);
        dispatch(loadOneViews_Success(response.result));
      })
      .catch((err) => {
        //console.log("loadDeployServers: err: ", err);
      })
  };
}

export function loadOSPackages(params, callback) {

    let url = '/rest/images/list';
    if(params)
      url = url + "?" + params['filter']

    getRESTApi(url)
      .then((response) => {
        //console.log("loadOSPackages: response: ", response);
        //console.log("loadOSPackages: response.result: ", response.result);
        callback(response.result, {})
      })
      .catch((err) => {
        //console.log("loadOSPackages: err: ", err);
          callback({}, {"msg": err})
      })
}



export function loadNetworks_Success (result) {
  return { type: DEPLOYSERVERS_NETWORKS_LOAD, env: result };
}

export function clearKickstarts() {
  return { type: DEPLOYSERVERS_KICKSTARTS_CLEAR };
}

export function loadScripts(osType) {

  return dispatch => {

    let url = '/rest/scripts/list?ostype=' + osType;
    getRESTApi(url)
      .then((response) => {
        console.log("loadKickstarts: response: ", response);
        //console.log("loadKickstarts: response.result: ", response.result);
        dispatch(loadKickstarts_Success(response.result[0]));
      })
      .catch((err) => {
        //console.log("loadKickstarts: err: ", err);
      })
  };
}

export function loadScripts_direct(osType, callback) {

    let url = '/rest/scripts/list?ostype=' + osType;
    getRESTApi(url)
      .then((response) => {
        console.log("loadScripts_direct: response: ", response);
        console.log("loadScripts_direct: response.result: ", response["result"]);
        callback(response["result"][0]);
      })
      .catch((err) => {
        callback({})
      })
}

export function getData(url, callback){
    getRESTApi(url)
        .then((response) => {
            console.log("getData: response: ", response);
            callback(response);
        })
        .catch((err) => {
            callback({}, {})
        })

}

// export function loadEthIfaces(callback){
//     let url = '/rest/pxe/ifaces';
//     getRESTApi(url)
//         .then((response) => {
//             console.log("loadEthIfaces: response: ", response);
//             console.log("loadEthIfaces: response.result: ", response["result"]);
//             callback(response["result"], {});
//         })
//         .catch((err) => {
//             callback([], {})
//         })
//
// }

export function loadKickstarts_Success (result) {
  return { type: DEPLOYSERVERS_KICKSTARTS_LOAD, scripts: result };
}

export function loadSPTItems (ovAlias) {

  return dispatch => {
    let url = '/rest/rm/spt/list?ovalias=' + ovAlias;
    getRESTApi(url)
      .then((response) => {
        console.log("loadSPTItems: response: ", response);
        //console.log("loadSPTItems: response.result: ", response.result);
        dispatch(loadSPTItems_Success(response.result));
      })
      .catch((err) => {
        //console.log("loadImageOsTypes: err: ", err);
      })
  };
}

export function sptEthPorts (ovAlias, sptName) {

  return dispatch => {
    let url = '/rest/rm/spt/connections?ovname=' + ovAlias + "&spt=" + sptName;

    getRESTApi(url)
      .then((response) => {
        //console.log("loadSPTItems: response: ", response);
        //console.log("loadSPTItems: response.result: ", response.result);
        dispatch(sptEthPorts_Success(response.result));
      })
      .catch((err) => {
        //console.log("loadSPTItems: err: ", err);
      })
  };
}

export function sptStorageDrives (ovAlias, sptName) {

  return dispatch => {
    let url = '/rest/rm/spt/drives?ovname=' + ovAlias + "&spt=" + sptName;
    getRESTApi(url)
      .then((response) => {
        console.log("loadSPTItems: response: ", response);
        //console.log("loadSPTItems: response.result: ", response.result);
        dispatch(sptStorageDrives_Success(response.result));
      })
      .catch((err) => {
        //console.log("loadSPTItems: err: ", err);
      })
  };
}


export function sptEthPorts_Success (sptList) {
  return { type: DEPLOYSERVERS_SPT_ETHPORTS_LIST, list: sptList };
}
export function sptStorageDrives_Success (sptList) {
  return { type: DEPLOYSERVERS_SPT_DRIVES_LIST, list: sptList };
}
export function loadSPTItems_Success (sptList) {
  return { type: DEPLOYSERVERS_SPT_LIST, list: sptList };
}

export function updateScreenData (section, param, value) {
  return { type: DEPLOYSERVERS_UPDATE_SCREENDATA, update: {"section": section, "param": param, "value": value}};
}

export function saveDeploymentSettings (deployServerSettings) {
  // console.log("saveDeploymentSettings: ", deployServerSettings);
  return { type: DEPLOYSERVERS_SAVE, deployServerSettings: deployServerSettings };
}
export function saveScreenData (screenData) {
  console.log("saveScreenData: ", screenData);
  return { type: DEPLOYSERVERS_SCREENDATA_SAVE, screenData: screenData };
}

export function unloadDeployServers (searchText) {
  return { type: DEPLOYSERVERS_UNLOAD };
}

export function loadServerPools_Success (result) {
  return { type: DEPLOYSERVERS_SERVERPOOLS_LOAD, ovList: result };
}

export function loadOneViews_Success (result) {
  return { type: DEPLOYSERVERS_OVLIST_LOAD, ovList: result };
}

export function deployStatus (result) {
  return { type: DEPLOYSERVERS_DEPLOY_STATUS, status: result };
}

export function loadOSPackages_Success (result) {
  return { type: DEPLOYSERVERS_OSP_LOAD, osPackages: result };
}

