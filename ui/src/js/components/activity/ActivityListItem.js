
import React, { Component } from 'react';
import PropTypes from 'prop-types';

// import { List } from 'grommet';
// import ListItem from 'grommet/components/ListItem';
const List = props => <Box align="stretch" border='top' {...props} />;
const ListItem = props => (  <Box tag='li' border='bottom' pad='small' direction='row' justify='between' {...props}  />);

import { Box, Meter } from 'grommet';
// TODO The below status icon should be changed
import { StatusCritical as StatusIcon, StatusCritical as ErrorIcon } from 'grommet-icons';
// import Timestamp from 'grommet/components/Timestamp';
// import ErrorIcon from 'grommet-icons/icons/StatusCritical';

export default class ActivityListItem extends Component {

  render() {
    const { item, index, onlyActiveStatus, includeResource } = this.props;

    let separator;
    if (0 === index) {
      separator = 'horizontal';
    }

    let icon;
    if (! onlyActiveStatus ||
      'Active' === item.state || 'Locked' === item.state ||
      'Error' === item.state) {
      icon = <StatusIcon value={item.status} size="small" />;
    } else {
      icon = <StatusIcon value="blank" size="small" />;
    }

    let duration;
    // if (item.created && item.modified) {
    //   duration = Duration(item.created, item.modified);
    // }

    let percentComplete = 20;

    //console.log(item);

    let overallProgress = 0;
    let completedTasks = 0;
    let failedTasks = 0;

    let subItem;
    for (subItem of item.subTasks) {
      overallProgress += subItem.progress;
      if(subItem.status == "Complete")
        completedTasks += 1;
      else if(subItem.status == "Error" || subItem.status == "Fail")
        failedTasks += 1;
    }

    let totalTasks = item.subTasks.length

    if (totalTasks > 0) {
      // Calculate average progress
      overallProgress = overallProgress * 10 / totalTasks;
    }

    let completedTasksStr = (completedTasks) + " of " + (totalTasks);


    let state;
    if ('Error' === item.status || failedTasks > 0) {
      let errorMsg;
      if(failedTasks){
        errorMsg = "Error: One or more hosts deployment failed";
      }
      else{
        errorMsg = "Error: " + item.errorMsg;
      }


      state = (
        <Box direction="row" responsive={false} pad={{between: 'small'}}>
          <span>
            <Box tag='value' align="start" size="medium"
                   value={0} units="%"
                   icon={<ErrorIcon/>}
                   label= {errorMsg}
                   colorIndex='critical'
            />
          </span>
          <Box tag='timestamp' key="timestamp" value={item.startTime} align="end" />
        </Box>
      );
    } else {
      state = (
        <Box direction="row"
             pad={{between: 'small'}} align="center">
          <Meter size="small"
                 value={overallProgress || 0}
                 a11yTitle="Progress bar" />
          <Box tag='value' align="start" size="small"
                 value={overallProgress || 0} units="%" />
          <Box tag='label'> {completedTasksStr} completed</Box>
          <span className="secondary">{duration}</span>
          <Box tag='timestamp' key="timestamp" value={item.startTime} align="end" />
        </Box>
      );
    }


    let owner;
    if ('tasks' === item.category) {
      owner = (
        <span className="secondary">by {item.attributes.owner}</span>
      );
    }

    return (
      <ListItem key={item.taskId} align="start" justify="between" separator={separator}
        pad={{horizontal: 'medium', vertical: 'medium', between: 'medium'}}
        onClick={this.props.onClick} selected={this.props.selected}>
        <Box direction="row" pad={{between: 'small'}}>
          {icon}
          <span className="message">
            <b>Task: {item.name} (#{item.taskId})   {owner} </b>
          </span>
        </Box>
        <Box direction="row" pad={{between: 'small'}}>
          {state}
        </Box>
      </ListItem>
    );
  }
}

ActivityListItem.propTypes = {
  includeResource: PropTypes.bool,
  index: PropTypes.number,
  item: PropTypes.object.isRequired,
  onClick: PropTypes.func,
  onlyActiveStatus: PropTypes.bool,
  selected: PropTypes.bool
};
