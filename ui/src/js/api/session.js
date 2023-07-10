import { headers, rest_call } from './utils';
import fetch from "isomorphic-fetch";

// export function postSession1(email, password) {
//   const options = {
//     headers: headers(),
//     method: 'POST',
//     body: JSON.stringify({ email, password })
//   };
//
//   return fetch('/rest/sessions', options)
//     .then(parseJSON);
// }
//
// export function deleteSession(session) {
//   const options = {
//     headers: headers(),
//     method: 'DELETE'
//   };
//
//   return fetch(session.uri, options)
//     .then(parseJSON);
// }


export function postSession(creds) {

  let header = headers();

  console.log("postSession: ", creds);
  const options = {
    method: 'POST',
    headers: header,
    body: JSON.stringify(creds)
  };
  let url = '/auth';

  return rest_call(url, options);
  // return fetch('http://' + _hostname + url, options)
  //   .then(parseJSON)
  //   .then(({json, response}) => {
  //     if (!response.ok) {
  //       console.log("postSession fail");
  //       return Promise.reject(json)
  //     }
  //     return json
  //   })
  //   .catch(err => console.log("postSession fail: ", err));
}

export function getSession(token) {

  console.log("getSession: ", token);

  let header = headers();
  // header['Authorization'] = token;
  //console.log("getSession: headers: ", header);

  const options = {
    method: 'GET',
    headers: header,
  };
  let url = '/rest/sessions';

  return rest_call(url, options);
  // return fetch('http://' + _hostname + url, options)
  //   .then(parseJSON)
  //   .then(({json, response}) => {
  //     if (!response.ok) {
  //       console.log("getSession fail: json: ", json);
  //       console.log("getSession fail: response: ", response);
  //       let error = { status: err.status, statusText: err.statusText}
  //       return Promise.reject({error: error});
  //     }
  //     return json
  //   })
  //   .catch((err) => {
  //     console.log("getSession fail exception: ", err);
  //     let error = { status: err.status, statusText: err.statusText}
  //     return Promise.reject({error: error});
  //   }
  //   );;
}



export function deleteSession(token) {
  //console.log("deleteSession token: ", token);

  const options = {
    headers: headers(),
    method: 'DELETE'
  };

  let url = '/rest/sessions/' + token;

  return rest_call(url, options);

  // return fetch('http://' + _hostname + url, options)
  //   .then(parseJSON)
  //   .then(({json, response}) => {
  //     if (!response.ok) {
  //       console.log("deleteSession fail");
  //       return Promise.reject(json)
  //     }
  //     return json
  //   })
  //   .catch(err => console.log("deleteSession fail: ", err));;
}
