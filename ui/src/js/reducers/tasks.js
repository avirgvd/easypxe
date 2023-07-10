import { TASKS_LOAD, TASKS_UNLOAD, TASK_LOAD, TASKS_LOAD_SUCCESS, TASK_LOAD_SUCCESS, TASK_UNLOAD } from '../actions/actions';
import { createReducer } from './utils';

const initialState = {
  tasks: [],
  currentTask: undefined
};

const handlers = {
  [TASKS_LOAD]: (state, action) => {
    if (!action.error) {
      action.payload.error = undefined;
      return action.payload;
    }
    return { error: action.payload };
  },
  [TASK_LOAD_SUCCESS]: (state, action) => {
    //console.log("TASK_LOAD_SUCCESS: ", action);
    return {currentTask: action.result.result};
  },
  [TASKS_LOAD_SUCCESS]: (state, action) => {
    console.log("TASKS_LOAD_SUCCESS: ", action);
    return {tasks: action.result.tasks, error: action.result.error, count: action.result.count, total: action.result.total};
  },
  [TASKS_UNLOAD]: () => initialState,
  [TASK_LOAD]: (state, action) => {
    if (!action.error) {
      action.payload.error = undefined;
      return action.payload;
    }
    return { error: action.payload };
  },
  [TASK_UNLOAD]: () => initialState
};

// export default createReducer(initialState, handlers);
export default function indexReducer (state = initialState, action) {
  let handler = handlers[action.type];
  if (!handler) return state;
  return { ...state, ...handler(state, action) };
}
