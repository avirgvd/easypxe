
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Box, Meter } from 'grommet';
import { StatusCritical as StatusIcon, Next as NextIcon } from 'grommet-icons/icons/StatusCritical';
// import Timestamp from 'grommet/components/Timestamp';
// import Value from 'grommet/components/Value';
import Duration from '../../utils/Duration';
// import NextIcon from 'grommet-icons/icons/Next';

export default class ActivityTile extends Component {

  render() {
    const { item, includeResource } = this.props;

    let icon;
    if ('Active' === item.state || 'Locked' === item.state) {
      icon = <StatusIcon value={item.status} size="small" />;
    }

    let duration;
    if (item.created && item.modified) {
      duration = Duration(item.created, item.modified);
    }

    let state;
    if ('Running' === item.state) {
      state = (
        <span>
          <Meter size="small"
            value={item.percentComplete || 0}
            a11yTitle="Progress bar" />
          <Box tag='value' size="small" value={item.percentComplete || 0} units="%" />
          <span className="secondary">{duration}</span>
        </span>
      );
    } else {
      state = <Box tag='timestamp' className="secondary" value={item.created} />;
    }

    let resource;
    if (includeResource) {
      resource = <strong>{item.attributes.associatedResourceName}</strong>;
    }

    let owner;
    if ('tasks' === item.category) {
      owner = (
        <span className="secondary">by {item.attributes.owner}</span>
      );
    }

    return (
      <Box tag='tile' pad="small" separator="bottom"
        direction="row" justify="between" align="center" responsive={false}
        onClick={this.props.onClick} selected={this.props.selected}>
        <Box direction="column">
          {icon}
          {item.name}
          {resource}
          {owner}
          {state}
        </Box>
        <NextIcon />
      </Box>
    );
  }
}

ActivityTile.propTypes = {
  includeResource: PropTypes.bool,
  item: PropTypes.object.isRequired,
  onClick: PropTypes.func,
  selected: PropTypes.bool
};
