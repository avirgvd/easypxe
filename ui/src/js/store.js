
// import { createBrowserHistory } from 'history';
import { applyMiddleware, compose, createStore } from 'redux';
import { routerMiddleware } from 'connected-react-router';
import createRootReducer from './reducers/root';
import thunk from 'redux-thunk';

import history from "./history";

export default function configureStore(preloadedState) {
  const store = createStore(
    createRootReducer(history), // root reducer with router state
    preloadedState,
    compose(
      applyMiddleware(
        thunk,
        // routerMiddleware(history)
        // ... other middlewares ...
      ),
    ),
  )

  return store
}
