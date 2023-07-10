
import { postRoute } from './Api';

// route
export const ROUTE_CHANGED = 'ROUTE_CHANGED';
export const ROUTE_MASTER_CHANGED = 'ROUTE_MASTER_CHANGED';
export const ROUTE_MASTER_UNLOAD = 'ROUTE_MASTER_UNLOAD';
export const ROUTE_PLAY = 'ROUTE_PLAY';
export const ROUTE_STOP = 'ROUTE_STOP';

const ROUTE_WATCH = 'route';

export function routeChanged (location, publish) {

  //console.log("routeChanged: location: ", location)
  //console.log("routeChanged: publish: ", publish)
  return function (dispatch) {
    // publish first to preserve order of changes
    if (publish) {
      postRoute({ category: 'route', pathname: location.pathname });
    }
    dispatch({ type: ROUTE_CHANGED, location: location, at: new Date() });
  };
}