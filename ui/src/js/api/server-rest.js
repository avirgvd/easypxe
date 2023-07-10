
/** Wrapper for REST API calls to server */

import {urlPrefix} from "../actions/Api";

require('es6-promise').polyfill();
import fetch from 'isomorphic-fetch';
import {headers, parseJSON, rest_call, download_file, rest_delete_call} from './utils';
import request from 'superagent';
import { v4 as uuidv4 } from 'uuid';

//timeout for 1 hour = 3600*1000 ms
let _timeout = 3600000;

//let _hostname = window.location.host.replace('80', '5000')
// let _hostname = window.location.host + ':5000'
let _hostname;

if (process.env.NODE_ENV !== 'production') {
  // Code will be removed from production build.
  _hostname  = '192.168.1.51';
  // _hostname  = '192.168.3.64';
  // _hostname  = '192.168.1.101';
  // _hostname  = 'in.samarthainfo.com:8888';
}
else {
  _hostname = window.location.host
}

export function getHostName(){
  return _hostname;
}

export function getRESTApi(url, callback) {

  // console.log('getRESTApi URL: ', 'https://' + _hostname + url);

  let header = headers();

  let options = {
    method: "GET",
    headers: header
  };

  return rest_call(url, options);

}

export function downloadFile(url, mimetype, callback) {

  //console.log('downloadFile URL: ', 'https://' + _hostname + url);

  let header = headers();
  header['Accept'] = mimetype;
  header["Content-Type"] = mimetype;

  let options = {
    method: "GET",
    headers: header
  };

  return download_file(url, options);

}

export function deleteRESTApi(url, callback) {

  //console.log('deleteRESTApi URL: ', 'https://' + _hostname + url);

  let header = headers(true);
  // header['Content-Length'] = 0;

  //console.log(header)


  let options = {
    method: "delete",
    headers: header,
    body: JSON.stringify({})
  };

  return rest_delete_call(url, options, callback);

  // return fetch('https://' + _hostname + url, restRequest);

  // return request(options);
  // request(options, function (error, response, body) {
  //   // console.log('error:', error); // Print the error if one occurred
  //   // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
  //   // console.log('body:', typeof(body)); // Print the HTML for the Google homepage.
  //   // console.log('body:', body); // Print the HTML for the Google homepage.
  //   callback(JSON.parse(body));
  // });

}

export function postRESTApi(url, reqBody) {

  console.log("postRESTApi: url:", url);
  console.log("postRESTApi: reqBody:", reqBody);
  let header = headers();

  let options = {
    method: "POST",
    headers: header,
    body: JSON.stringify(reqBody)
  };

  return rest_call(url, options);
  // console.log('URL: ', 'https://' + _hostname + url);
  // console.log('REST request: ', JSON.stringify(restRequest));

  // return fetch('https://' + _hostname + url, restRequest);

}

export function postRESTApi2(url, reqBody) {

  //console.log("postRESTApi: url:", url);
  //console.log("postRESTApi: reqBody:", reqBody);
  let header = headers();

  let options = {
    method: "POST",
    headers: header,
    body: reqBody
  };

  return rest_call(url, options);
  // console.log('URL: ', 'https://' + _hostname + url);
  // console.log('REST request: ', JSON.stringify(restRequest));

  // return fetch('https://' + _hostname + url, restRequest);

}

export async function postBinFile(image, file, progressHandler, handler) {

  console.log("postBinFile: image: ", image);

  const size = file.size;

  //console.log("postBinFile: file size: ", size);
  const chunk_size = 10000000; // chunk size = 10MB

  let start = 0;
  let end = 0;

  if(size < chunk_size)
    end = size;
  else
    end = chunk_size;

  let uri = '/rest/uploadchunks';
  let url = 'https://' + _hostname + uri;
  while( end <= size) {
    //console.log("inside loop: start: ", start);

    //console.log("inside loop: end: ", end);

    let slice = file.slice(start, end);

    let progress = {'start': start, 'end': end, 'size': size};

    let header = headers(true);
    header['Content-Type'] = 'application/octet-stream';
    header['data'] = JSON.stringify(image);
    header['progress'] = JSON.stringify(progress);

    //console.log("postBinFile: header: ", header);

    let options = {
      method: "POST",
      headers: header,
      body: slice
    };

    //console.log("before fetch ", progress)
    let response = await fetch(url, options);
    //console.log("after fetch ", progress)

    //console.log("Fetch response: ", response)
    let json = await response.json();
    progressHandler(json);
    //console.log("Fetch response json: ", json)

    start += chunk_size;
    end = start + chunk_size;

    if(start > size){
      //console.log("reached end")
      handler(undefined, json)
      break;
    }

    if (end > size){
      //console.log("end: ", end);
      //console.log("start: ", start);
      //console.log("size: ", size);
      end = size;
    }
  }

}

async function rest_send_chunk (data, progress, blob){
  //console.log("rest_send_chunk: _hostname: ", _hostname);

  let uri = '/rest/uploadchunks';

  let url = 'https://' + _hostname + uri;

  let header = headers(true);
  header['Content-Type'] = 'application/octet-stream';
  header['data'] = JSON.stringify(data);
  header['progress'] = JSON.stringify(progress);

  //console.log("rest_send_chunk: header: ", header);

  let options = {
    method: "POST",
    headers: header,
    body: blob
  };

  let response = await fetch(url, options);
  //console.log("Fetch response: ", response)

  let json = await response.json();

  //console.log("json result: ", json)

  return json;
}

// https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Async_await
function postBlob(data, progress, blob) {

  // content-type = application/octet-stream
  //console.log("postBlob: blob.size: ", blob.size)

  let header = headers(true);

  let uri = '/rest/uploadchunks';

  header['Content-Type'] = 'application/octet-stream';
  header['data'] = JSON.stringify(data);
  header['progress'] = JSON.stringify(progress);

  //console.log("postBlob: header: ", header);

  let options = {
    method: "POST",
    headers: header,
    body: blob
  };

  rest_send_chunk(uri, options)
    .catch(e => {
      //console.log("postBlob exception: ", e);
      throw "Failed to upload due to exception: " + e.toString()
    })

}

export function postImage (image, file, progressHandler, handler) {
  // We need to keep using XHR until fetch() has a way to track long upload
  // progress. Since we don't do file uploading from mobile platforms,
  // we can get away with this.
  //console.log("postImage: ", image);
  //console.log("postImage: json: ", JSON.stringify(image));
  //console.log(`${_hostname}/rest/upload`);
  let header = headers(true);


  request.post(`https://${_hostname}/rest/upload`)
    .timeout(_timeout)
    // remove Content-Type since we're sending a file
    .set(header)
    .field('data', JSON.stringify(image))
    .attach('file', file)
    .on('progress', progressHandler)
    .end(handler);
}