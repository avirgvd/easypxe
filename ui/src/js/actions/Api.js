
// import Rest, { headers, buildQuery, } from 'grommet/utils/Rest';
// import { initialize as initializeWatching, watch, disregard,
//   refresh } from './watch_renamed';
import fetch from 'isomorphic-fetch';

let _host = "";

if (process.env.NODE_ENV !== 'production') {
  // Code will be removed from production build.
  // _host = '192.168.1.101';
  _host  = '192.168.1.51';
  // _host  = '192.168.3.64';
  // _host = 'in.samarthainfo.com:8888';
}
else {
  _host = window.location.host
}

/*
Code copied from Grommet V1 grommet/utils/Rest
 */

// converts object to parameter array, handles arrays

export const headers = {
  'Accept': 'application/json',
  'Content-Type': 'application/json'
};

export function buildParams (object) {
  let params = [];
  if (object) {
    for (const property in object) {
      if (object.hasOwnProperty(property)) {
        const value = object[property];
        if (null !== value && undefined !== value) {
          if (Array.isArray(value)) {
            for (let i = 0; i < value.length; i++) {
              params.push(property + '=' + encodeURIComponent(value[i]));
            }
          } else {
            params.push(property + '=' + encodeURIComponent(value));
          }
        }
      }
    }
  }
  return params;
}

// joins params array and adds '?' prefix if needed
function buildQuery (object) {
  const params = (Array.isArray(object) ? object : buildParams(object));
  return (params.length > 0 ? `?${params.join('&')}` : '');
}

// reject promise of response isn't ok
function processStatus (response) {
  if (response.ok) {
    return Promise.resolve(response);
  } else {
    return Promise.reject(response.statusText || `Error ${response.status}`);
  }
}

/*
/*
END - Code copied from Grommet V1 grommet/utils/Rest
 */


const _headers = {
  ...headers,
  'X-API-Version': 200
};
let _webSocketUrl = undefined;

// XHR still for file upload progress
import request from 'superagent';
let _timeout = 20000;
// 20s, up from initial 10s due to use from slow mobile devices

// Configuration

export let pageSize = 20;
export let pollingInterval = 2000; // 2s
export let urlPrefix = '';

// export function configure (options) {
//   _host = options.host ? `https://${options.host}` : _host;
//   pageSize = options.pageSize || pageSize;
//   pollingInterval = options.pollingInterval || pollingInterval;
//   _webSocketUrl = options.webSocketUrl || _webSocketUrl;
//   urlPrefix = options.urlPrefix || urlPrefix;
//
//   initializeWatching(_webSocketUrl, _get);
// }

// export function updateHeaders (headers) {
//   _headers = {..._headers, ...headers};
//   Rest.setHeaders(headers);///
// }

// Internal help/generic functions

function _get (uri, params = {}) {
  const options = { method: 'GET', headers: _headers };
  // prevent IE11 to cache resources by adding a timestamp to query params
  params[new Date().getTime()] = '';
  const query = buildQuery(params);
  return fetch(`${_host}${urlPrefix}${uri}${query}`, options)
    .then(processStatus)
    .then(response => response.json());
}

function _post (uri, dataArg) {
  const data = (typeof dataArg === 'object') ?
    JSON.stringify(dataArg) : dataArg;
  const options = { method: 'POST', headers: _headers, body: data };
  //console.log('_post: ');
  //console.log('${_host}${urlPrefix}${uri}');
  return fetch(`${_host}${urlPrefix}${uri}`, options)
    .then(processStatus)
    .then(response => response.json());
}

function _put (uri, dataArg) {
  const data = (typeof dataArg === 'object') ?
    JSON.stringify(dataArg) : dataArg;
  const options = { method: 'PUT', headers: _headers, body: data };
  return fetch(`${_host}${urlPrefix}${uri}`, options)
    .then(processStatus)
    .then(response => response.json());
}

function _delete (uri) {
  //console.log("_delete: uri: ", uri);
  //console.log("_delete: _host: ", _host);
  //console.log("_delete: urlPrefix: ", urlPrefix);
  const options = { method: 'DELETE', headers: _headers };
  return fetch(`${_host}${urlPrefix}${uri}`, options)
    .then(response => response.json());
}

export function head (url, params) {
  const query = buildQuery(params);
  const options = { method: 'HEAD', headers: _headers };
  return fetch(`${_host}${urlPrefix}${url}${query}`, options);
}

// Index

export function getItems (params) {
  return _get('/rest/index/resources', params);
}

export function  getSearchSuggestions (text) {
  const params = { start: 0, count: Math.min(10, pageSize), query: text };
  return _get('/rest/index/search-suggestions', params);
}

// Item

export function getItem (uri) {
  return _get(uri);
}

// export function postItem (item) {
//   return _post(`/rest/${item.category}`, item).then(refresh);
// }
//
// export function putItem (item) {
//   return _put(item.uri, item).then(refresh);
// }

export function deleteItem (uri) {
  return _delete(uri);
  // return _delete(uri).then(refresh);
}

// Watching


export function getSoftware () {
  return _get('/rest/update');
}

export function postRestart () {
  return _post('/rest/restart');
}

export function putImage (image, file, progressHandler, handler) {
  // We need to keep using Rest until fetch() has a way to track long upload
  // progress. Since we don't do file uploading from mobile platforms,
  // we can get away with this.
  request.put(`${_host}${urlPrefix}${image.uri}`)
  .timeout(_timeout)
  .set({ ..._headers, "Content-Type": undefined})
  .field('uri', image.uri)
  .field('name', image.name)
  .field('status', image.status)
  .field('state', image.state)
  .field('created', image.created)
  .attach('file', file)
  .on('progress', progressHandler)
  .end(handler);
}

export function postRoute (route) {
  return _post(`/rest/route`, route);
}
