
import { putImage, getItems, pageSize, refresh } from './Api';

import {getRESTApi, deleteRESTApi, postImage, postBinFile, postRESTApi} from '../api/server-rest';
import {clearBrowserStorage} from "../api/utils";
import history from "../history";
import {deployStatus} from "./deployservers";
require('es6-promise').polyfill();


// Images
IMAGES_UNLOAD
export const IMAGES_LOAD = 'IMAGES_LOAD';
export const IMAGES_UNLOAD = 'IMAGES_UNLOAD';
export const IMAGES_SUCCESS_LOAD = 'IMAGES_SUCCESS_LOAD';
export const IMAGES_FAILURE_LOAD = 'IMAGES_FAILURE_LOAD';
export const IMAGE_LOAD_OS_TYPES = 'IMAGE_LOAD_OS_TYPES';
export const IMAGE_LOAD_OS_TYPES_SUCCESS = 'IMAGE_LOAD_OS_TYPES_SUCCESS';
export const IMAGE_LOAD_OS_TYPES_FAILURE = 'IMAGE_LOAD_OS_TYPES_FAILURE';
export const IMAGE_ADD = 'IMAGE_ADD';
export const IMAGE_ADD_PROGRESS = 'IMAGE_ADD_PROGRESS';
export const IMAGE_ADD_UPLOADED = 'IMAGE_ADD_UPLOADED';
export const IMAGE_ADD_SUCCESS = 'IMAGE_ADD_SUCCESS';
export const IMAGE_DELETE_SUCCESS = 'IMAGE_DELETE_SUCCESS';
export const IMAGE_ADD_FAILURE = 'IMAGE_ADD_FAILURE';
export const IMAGE_UPDATE = 'IMAGE_UPDATE';
export const IMAGE_UPDATE_PROGRESS = 'IMAGE_UPDATE_PROGRESS';
export const IMAGE_UPDATE_UPLOADED = 'IMAGE_UPDATE_UPLOADED';
export const IMAGE_UPDATE_SUCCESS = 'IMAGE_UPDATE_SUCCESS';
export const IMAGE_UPDATE_FAILURE = 'IMAGE_UPDATE_FAILURE';
export const IMAGE_UNLOAD = 'IMAGE_UNLOAD';
export const IMAGES_SUCCESS_DELETE = 'IMAGES_SUCCESS_DELETE';


export function loadImageOsTypes (searchText) {
  return function (dispatch) {
    dispatch({ type: IMAGE_LOAD_OS_TYPES });
    let uri = "/rest/ostype/list"

    getRESTApi(uri)
      .then((response) => {
        //console.log("loadImageOsTypes: response: ", response);
        //console.log("loadImageOsTypes: response.result: ", response.result);
        dispatch(loadImageOsTypesSuccess(response.result));
      })
      .catch((err) => {
        //console.log("loadImageOsTypes: err: ", err);
      })
  };
}

export function loadImageOsTypesSuccess (result) {
  return { type: IMAGE_LOAD_OS_TYPES_SUCCESS, result: result };
}

export function loadImageOsTypesFailure (error) {
  return { type: IMAGE_LOAD_OS_TYPES_FAILURE, error: error };
}

export function syncImages(callback){

}

export function syncImage(uri) {
  let url = "/rest/images/sync"
  postRESTApi(url, {"uri": uri})
      .then(function (result) {
      })
      .catch(function (ex) {
      });
}

export function addImage (image, file) {
  console.log("action/addImage: image: ", image);
  // console.log("action/addImage: file: ", file);
  return function (dispatch) {
    dispatch({ type: IMAGE_ADD, file: file.name });
    // postImage still uses REST instead of fetch() since fetch() doesn't
    // support file upload progress events.
    postBinFile(image, file,
      (event) => {
        // progress handler
        //console.log("action/image addImage: ", event);
        const data = event.result.data
        //console.log("action/image addImage data: ", data);
        dispatch(addImageProgress(file.name, data['end'], data['size']));
      },
      (err, res) => {
        //console.log("addImage: err: ", err);
        //console.log("addImage: res: ", res);
        // if (err || !res.ok) {
        if (err) {
          dispatch(addImageFailure(file.name, String(err ? err : res.body.error)));
        } else {
          dispatch(addImageUploaded(file.name));
          // refresh();
          // we received a task uri, wait for it to complete
          // watchTask(res.body.taskUri)
          // .then(task => dispatch(addImageSuccess(file.name, image)))
          // .catch(error => dispatch(addImageFailure(error)));
        }
      }
    );
    // postImage(image, file,
    //   (event) => {
    //     // progress handler
    //     console.log("action/image addImage: ", event);
    //     dispatch(addImageProgress(file.name, event.loaded, event.total));
    //   },
    //   (err, res) => {
    //     console.log("addImage: err: ", err);
    //     console.log("addImage: res: ", res);
    //     // if (err || !res.ok) {
    //     if (err || res.body.error) {
    //       dispatch(addImageFailure(file.name, String(err ? err : res.body.error)));
    //     } else {
    //       dispatch(addImageUploaded(file.name));
    //       // refresh();
    //       // we received a task uri, wait for it to complete
    //       // watchTask(res.body.taskUri)
    //       // .then(task => dispatch(addImageSuccess(file.name, image)))
    //       // .catch(error => dispatch(addImageFailure(error)));
    //     }
    //   }
    // );
  };
}

export function addImageProgress (file, loaded, total) {
  //console.log("image: addImageProgress: ", total);
  return { type: IMAGE_ADD_PROGRESS, file: file, loaded: loaded, total: total };
}

export function addImageUploaded (file) {
  return { type: IMAGE_ADD_UPLOADED, file: file };
}

export function addImageSuccess (file, image) {
  return { type: IMAGE_ADD_SUCCESS, file: file, image: image };
}

export function addImageFailure (file, err) {
  return { type: IMAGE_ADD_FAILURE, file: file, error: err };
}

export function updateImage (image, file) {
  return function (dispatch) {
    dispatch({ type: IMAGE_UPDATE, file: file.name });
    putImage(image, file,
      (event) => {
        // progress handler
        dispatch(updateImageProgress(file.name, event.loaded, event.total));
      },
      (err, res) => {
        if (err || !res.ok) {
          dispatch(addImageFailure(file.name, res.body || {message: res.text}));
        } else {
          dispatch(updateImageUploaded(file.name));
          // refresh();
        //   // we received a task uri, wait for it to complete
        //   watchTask(res.body.taskUri)
        //   .then(task => dispatch(updateImageSuccess(file.name, image)))
        //   .catch(error => dispatch(updateImageFailure(error)));
        }
      }
    );
  };
}

export function updateImageProgress (file, loaded, total) {
  return {
    type: IMAGE_UPDATE_PROGRESS, file: file, loaded: loaded, total: total
  };
}

export function updateImageUploaded (file) {
  return { type: IMAGE_UPDATE_UPLOADED, file: file };
}

export function updateImageSuccess (image) {
  return { type: IMAGE_UPDATE_SUCCESS, image: image };
}

export function updateImageFailure (error) {
  return { type: IMAGE_UPDATE_FAILURE, error: error };
}

export function loadImages (query) {
  //console.log("action loadImages");

  return dispatch => {

    let uri = "/rest/" + query['category'] + "/list";

    getRESTApi(uri)
      .then((response) => {
        //console.log("loadImages: response: ", response);
        dispatch(loadImages_Success(response));
      })
      .catch((err) => {
        //console.log("loadImages: err: ", err);
        dispatch(loadImages_Failure(err));
      })

    // getRESTApi(uri, function(result){
    //   console.log("action loadImages : result: ", (result));
    //   dispatch(loadImages_Success(result));
    // });

  };
}
export function deleteImage (query, file, callback) {
  //console.log("action deleteImage");

    let uri = "/rest/" + query['category'] + "/" + file;

    deleteRESTApi(uri, (err, res) => {
      console.log("deleteImage: res: ", res);
      console.log("deleteImage: err: ", err);
      callback({'result': res, 'error': err});
    });
}

export function loadImages_Success(response) {
  return {
    type: IMAGES_SUCCESS_LOAD,
    images: response.result,
    error: response.error
  };
}
export function loadImages_Failure(response) {
  return {
    type: IMAGES_FAILURE_LOAD,
    error: response
  };
}

export function deleteImage_Success(result) {
  return {
    type: IMAGES_SUCCESS_DELETE,
    result: result
  };
}

export function unloadImage(){
  return {type: IMAGE_UNLOAD}
}

export function unloadImages () {
  return { type: IMAGES_UNLOAD };
}

export function queryIndex (index, query) {
//  TODO: Add code
}

export function moreIndex (index) {
//  TODO: Add code
}