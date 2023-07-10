import { createReducer } from './utils';

import { IMAGES_LOAD, IMAGES_UNLOAD, IMAGES_SUCCESS_LOAD, IMAGES_FAILURE_LOAD, IMAGE_LOAD_OS_TYPES, IMAGE_LOAD_OS_TYPES_SUCCESS,
  IMAGE_ADD, IMAGE_ADD_PROGRESS, IMAGE_ADD_UPLOADED,
  IMAGE_ADD_SUCCESS, IMAGE_ADD_FAILURE, IMAGE_DELETE_SUCCESS,
  IMAGE_UPDATE, IMAGE_UPDATE_PROGRESS, IMAGE_UPDATE_UPLOADED,
  IMAGE_UPDATE_SUCCESS, IMAGE_UPDATE_FAILURE,
  IMAGE_UNLOAD
} from '../actions/image';

const initialState = {
  images: [],
  osTypes: [],
  uploads: []
};

function progress (state, action) {
  // console.log("reducer/image: progress: action: ", action);
  // console.log("reducer/image: progress: state: ", state);
  let uploads = state.uploads.slice(0);
  // preserve 50% for the subsequent task of unpacking the file
  const percent = Math.round(action.loaded / action.total * 100);
  for (let i = 0; i < uploads.length; i++) {
    // console.log("reducer/image: uploads[i]: ", uploads[i]);
    if (uploads[i].file === action.file) {
      uploads[i].percent = percent;
      // console.log("reducer/image: uploads[i] later: ", uploads[i]);
      break;
    }
  }
  return { uploads: uploads };
}

function uploaded (state, action) {
  let uploads = state.uploads.slice(0);
  // Done, remove it.
  for (let i=0; i<uploads.length; i++) {
    if (uploads[i].file === action.file) {
      uploads[i].state = 'Uploaded';
      uploads[i].percent = 100;
      break;
    }
  }
  return { uploads: uploads };
}

function complete (state, action) {
  let uploads = state.uploads.slice(0);
  // Done, remove it.
  for (let i=0; i<uploads.length; i++) {
    if (uploads[i].file === action.file) {
      uploads[i].state = 'Completed';
      uploads[i].percent = 100;
      // uploads.splice(i, 1);
      break;
    }
  }
  return { uploads: uploads };
}

function fail (state, action) {
  //console.log("fail: action: ", action);
  let uploads = state.uploads.slice(0);
  // Done, remove it.
  for (let i=0; i<uploads.length; i++) {
    if (uploads[i].file === action.file) {
      uploads[i].state = 'Failed';
      uploads[i].error = action.error;

      break;
    }
  }
  return { uploads: uploads };
}

const handlers = {

  [IMAGES_LOAD]: (state, action) => {
    //console.log("Reducer IMAGES_LOAD: action: ", action);
    return {images: action.images};
  },
  [IMAGES_UNLOAD]: () => initialState,
  [IMAGE_UNLOAD]: () => initialState,
  [IMAGES_SUCCESS_LOAD]: (state, action) => {
    //console.log("Reducer IMAGES_SUCCESS_LOAD action: ", action);
    //console.log("Reducer IMAGES_SUCCESS_LOAD state: ", state);
    return {images: action.images};
  },
  [IMAGES_FAILURE_LOAD]: (state, action) => {
    //console.log("Reducer IMAGES_FAILURE_LOAD action: ", action);
    //console.log("Reducer IMAGES_FAILURE_LOAD state: ", state);
    return {error: action.error};
  },
  [IMAGE_LOAD_OS_TYPES]: (state, action) => ({ osTypes: [] }),
  [IMAGE_LOAD_OS_TYPES_SUCCESS]: (state, action) => {
    //console.log("reducer IMAGE_LOAD_OS_TYPES_SUCCESS: ", action.result)
    // trim properties
    // let osTypes = action.map((i) => {
    //   return {name: i.name, uri: i.uri, label: i.name, value: i.uri};
    // });
    return { osTypes: action.result };
  },

  [IMAGE_ADD]: (state, action) => {
     //console.log("IMAGE_ADD: action: ", action);
     //console.log("IMAGE_ADD: state: ", state);
    let uploads = state.uploads.slice(0);
    uploads.push({
      file: action.file,
      state: 'Uploading',
      status: 'unknown',
      message: 'Add',
      percent: 0
    });
    return { uploads: uploads };
  },

  [IMAGE_ADD_PROGRESS]: progress,

  [IMAGE_ADD_UPLOADED]: uploaded,

  [IMAGE_ADD_SUCCESS]: complete,

  // TODO: Would be good to do something more helpful with this.
  [IMAGE_ADD_FAILURE]: fail,

  [IMAGE_UPDATE]: (state, action) => {
    let uploads = state.uploads.slice(0);
    uploads.push({
      file: action.file,
      state: 'Uploading',
      status: 'unknown',
      message: 'Update',
      percent: 0
    });
    return { uploads: uploads };
  },
  [IMAGE_DELETE_SUCCESS]: (state, action) => {
  },
  [IMAGE_UPDATE_PROGRESS]: progress,

  [IMAGE_UPDATE_UPLOADED]: uploaded,

  [IMAGE_UPDATE_SUCCESS]: complete,

  // TODO: Would be good to do something more helpful with this.
  [IMAGE_UPDATE_FAILURE]: complete

};

export default createReducer(initialState, handlers);