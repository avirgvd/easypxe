
import { refresh, getItem, pollingInterval } from './Api';
import {getRESTApi} from '../api/server-rest';
import {loadImageOsTypesSuccess} from "./image";

// Tasks
export const TASKS_LOAD = 'TASKS_LOAD';
export const TASKS_LOAD_SUCCESS = 'TASKS_LOAD_SUCCESS';
export const TASK_LOAD_SUCCESS = 'TASK_LOAD_SUCCESS';
export const TASKS_UNLOAD = 'TASKS_UNLOAD';
export const TASK_LOAD = 'TASK_LOAD';
export const TASK_UNLOAD = 'TASK_UNLOAD';


export function loadTasks() {
  //console.log("action loadTasks");
  return function (dispatch) {
    let url = '/rest/tasks';
    getRESTApi(url)
      .then((response) => {
        //console.log("loadTasks: response: ", response);
        //console.log("loadTasks: response.result: ", response.result);
        dispatch(loadTasks_Success({tasks: response.tasks, error: response.error}));
      })
      .catch((err) => {
        //console.log("loadImageOsTypes: err: ", err);
        dispatch(loadTasks_Success({error: err}));
      })
    // getRESTApi(url, function(result){
    //   console.log("action loadTasks: ",  (result));
    //   dispatch(loadTasks_Success(result));
    //
    // });
  };
}

export function loadTasks_Success(result) {
  //console.log("loadTasks_Success: ", result);
  return {
    type: TASKS_LOAD_SUCCESS,
    result: result
  };
}


export function loadTask(tasknumber) {
  console.log("action loadTask: ", tasknumber);
  return function (dispatch) {
    let url = '/rest/tasks/' + tasknumber;
    getRESTApi(url)
      .then((response) => {
        console.log("loadTask: response: ", response);
        // console.log("loadTask: response.result: ", response.result);
        dispatch(loadTask_Success(response));
      })
      .catch((err) => {
        //console.log("loadTask: err: ", err);
      })
  };
}



export function loadTask_Success(result) {
  //console.log("loadTask_Success: ", result);
  return {
    type: TASK_LOAD_SUCCESS,
    result: result
  };
}




