// import RequestWatcher from './request-watcher';
import fetch from "isomorphic-fetch";
import history from "../history";
const superagent = require('superagent');

let _headers = {
  'Accept': 'application/json',
  'Content-Type': 'application/json'
};
const localStorage = window.localStorage;

let _hostname;

if (process.env.NODE_ENV !== 'production') {
  // Code will be removed from production build.
  // _hostname  = '192.168.1.101';
  _hostname  = '192.168.1.51';
  // _hostname  = '192.168.3.64';
  // _hostname  = 'in.samarthainfo.com:8888';
}
else {
  _hostname = window.location.host
}

export function isJSONEmpty(json) {
  if (Object.keys(json).length == 0)
    return true
  else
    return false
}

export function clearBrowserStorage(user) {
  //console.log("clearBrowserStorage: ");

  try {
    localStorage.isAuthenticated = "false";
    localStorage.token = "";
    localStorage.user = user;
  } catch (e) {
    //console.log("clearBrowserStorage: failed: ", e);
  }
}

export function headers(upload = false) {
  const { isAuthenticated, token } = localStorage;

  if (isAuthenticated && token && token != "") {

    let jwt_token = "JWT " + token

    if(upload) {
      _headers = {
        'Accept': 'application/json',
        'Authorization': jwt_token
      };
    }
    else {
      _headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': jwt_token
      };
    }

  }

  return _headers;
}
export function upload_headers() {
  const { isAuthenticated, token } = localStorage;

  if (isAuthenticated && token && token != "") {

    let jwt_token = "JWT " + token

    _headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': jwt_token
    };
  }

  return _headers;
}



export function rest_call(uri, options) {
  console.log("rest_call: url: ", uri)
  //console.log("rest_call: _hostname: ", _hostname)
  // console.log("rest_call: options: ", options)

  let url = 'https://' + _hostname + uri;
  console.log(url)
  return fetch(url, options)
    .then((response) => {
      console.log("rest_call: ", response);

      if (!response.ok) {
        // console.log("rest_call fail: json: ", json);
        console.log("rest_call fail: response: ", response);
        if(response.status === 401){
          let error = { status: 401, msg: "Unauthorized", statusText: "Unauthorized"}
          return ({error: error, result: {}});
        }
        let error = { status: response.status, statusText: response.statusText, msg: response.statusText}
        return ({result: {}, error: error});
      }
      else{
        console.log("rest_call: ok ");
        // return Promise.resolve(response)
        return response.json()
      }
    })
    .catch((err) => {
        console.log("fetch error: ", err);
        //console.log("rest_call fail exception: ", err);
        let error = { status: 800, statusText: err.toString()}
        // return Promise.reject({error: error});
        return Promise.reject(error);
      // return err;
      }
    );
}

export function rest_delete_call(uri, options, callback) {
  console.log("rest_delete_call: url: ", uri)
  //console.log("rest_delete_call: _hostname: ", _hostname)
  options['headers'][ 'Content-Type'] = 'application/json'

  //console.log("rest_delete_call: options: ", options)

  let url = 'https://' + _hostname + uri;

  superagent
      .delete(url)
      .set({ ...options['headers']})
      .end(callback);
      // .end(function (err, res) {
      //   console.log("rest_delete_call: superagent res: ", res)
      //   console.log("rest_delete_call: superagent err: ", err)
      //   if(!err) {
      //     return Promise.resolve(res.body)
      //     // return res.body;
      //   }
      //   else {
      //     //TODO - untested code block
      //     let error = { status: err.status, statusText: err.statusText}
      //     return Promise.reject(error);
      //     // return ({error: error});
      //   }
      //
      // });

  // console.log(url)
  // return fetch(url, options)
  //   .then((response) => {
  //     // console.log("rest_call: ", json);
  //     console.log("rest_delete_call: ", response);
  //
  //     if (!response.ok) {
  //       // console.log("rest_call fail: json: ", json);
  //       console.log("rest_delete_call fail: response: ", response);
  //       let error = { status: response.status, statusText: response.statusText}
  //       return ({error: error});
  //     }
  //     else{
  //       // let data = response.json();
  //       // console.log("rest_call: ", data);
  //       // return Promise.resolve(response)
  //       return response.json()
  //     }
  //   })
  //   .catch((err) => {
  //       console.log(err);
  //       console.log("rest_delete_call fail exception: ", err);
  //       let error = { status: 800, statusText: err.toString()}
  //       // return Promise.reject({error: error});
  //       return Promise.reject(error);
  //     // return err;
  //     }
  //   );
}

export function download_file(uri, options) {
  //console.log("download_file: url: ", uri)
  //console.log("download_file: _hostname: ", _hostname)
  //console.log("download_file: options: ", options)

  let url = 'https://' + _hostname + uri;
  //console.log(url)
  return fetch(url, options);
}

export function parseJSON(response) {
  //console.log("parseJSON: ", response);
  if (response.ok) {
    return response.json();
  }
  return Promise.reject(response);
}

export function updateHeaders(newHeaders) {
  _headers = { ..._headers, newHeaders };
  Object.keys(_headers).forEach((key) => {
    if (undefined === _headers[key]) {
      delete _headers[key];
    }
  });
}

// export const requestWatcher = new RequestWatcher();
