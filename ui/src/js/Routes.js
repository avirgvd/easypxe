
import React, { Component } from 'react';

import Login from './screens/Login';
import Dashboard from './screens/Dashboard';
import Settings from './screens/Settings';
import NotFound from './screens/NotFound';
import Main from './components/Main';
import ImageIndex from './components/images/ImageIndex';
import ImageAdd from './components/images/ImageAdd';
import ImageEdit from './components/images/ImageEdit';
import ActivityIndex from './components/activity/ActivityIndex';
import About from './screens/About';
import TaskDetails from "./screens/TaskDetails";
import {Route, useRouteMatch} from 'react-router-dom';
import {Box} from "grommet";
import PXEBootItem from "./components/deployscreens/PXEBootItem";
import ImageSync from "./components/images/ImageSync";
import DeployServersPXE from "./screens/DeployServersPXE";

export default function () {
  // const { path } = useRouteMatch();
  let prefix = "/ui";

  if (process.env.NODE_ENV === 'production') {
    prefix = "/ui";
  }
  else {
    prefix = "/ui";
  }

  return (
    <Box id="routesbox" as="main" overflow="auto" flex="grow" fill="vertical" align="center" justify="between" direction="row" >
      <Route exact path={`/`} component={Main} />
      <Route exact path={`${prefix}/`} component={Main} />
      <Route exact path={`${prefix}/dashboard`} component={Dashboard} />
      <Route exact path={`${prefix}/login`} component={Login} />
      <Route exact path={`${prefix}/logout`} component={Login} />
      <Route path={`${prefix}/images/edit/*`} component={ImageEdit} />
      <Route path={`${prefix}/images/view/*`} component={ImageEdit} />
      <Route path={`${prefix}/images/add`} component={ImageAdd} />
      <Route path={`${prefix}/images/sync`} component={ImageSync} />
      <Route exact path={`${prefix}/images`} component={ImageIndex} />
      <Route path={`${prefix}/deploy`} component={DeployServersPXE} />
      <Route path={`${prefix}/deploy/addpxeitem`} component={PXEBootItem} />
      <Route path={`${prefix}/taskdetails/*`} component={TaskDetails} />
      <Route path={`${prefix}/activity`} component={ActivityIndex} />
      <Route path={`${prefix}/settings`} component={Settings} />
      <Route path={`${prefix}/about`} component={About} />
    </Box>
  );
}
