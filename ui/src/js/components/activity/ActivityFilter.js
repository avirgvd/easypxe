
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import { Layer, Sidebar, Header, Button, Heading, Select, Box } from 'grommet';
import { Close as CloseIcon, StatusCritical as StatusIcon } from 'grommet-icons';

const StatusLabel = (props) => (
  <Box direction='row' align='center' pad={{ between: 'small' }}>
    <StatusIcon value={props.value} size='small' />
    <span>{props.label}</span>
  </Box>
);

class ActivityFilter extends Component {

  _change (name) {
    return (event) => {
      const { index } = this.props;
      let nextFilter = { ...index.filter };
      if (! event.option.value) {
        // user selected the 'All' option, which has no value, clear filter
        delete nextFilter[name];
      } else {
        // we get the new option passed back as an object,
        // normalize it to just a value
        nextFilter[name] = event.value.map(value => (
          typeof value === 'object' ? value.value : value)
        );
        if (nextFilter[name].length === 0) {
          delete nextFilter[name];
        }
      }
      // this.props.dispatch(filterIndex(index, nextFilter));
    };
  }

  render () {
    const { index } = this.props;
    const filter = index.filter || {};
    return (
      <Layer align='right' flush={true} closer={false}
        a11yTitle='Activity Filter'>
        <Sidebar size='medium'>
          <div>
            <Header size='large' justify='between' align='center'
              pad={{ horizontal: 'medium', vertical: 'medium' }}>
              <Heading level={2} margin='none'>Filter</Heading>
              <Button icon={<CloseIcon />} plain={true}
                onClick={this.props.onClose} />
            </Header>
            <Box tag='section' pad={{ horizontal: 'large', vertical: 'small' }}>
              <Heading level={3}>Status</Heading>
              <Select inline={true} multiple={true} options={[
                { label: 'All', value: undefined },
                { label: <StatusLabel value='critical' label='Critical' />,
                  value: 'critical' },
                { label: <StatusLabel value='warning' label='Warning' />,
                  value: 'warning' },
                { label: <StatusLabel value='ok' label='OK' />,
                  value: 'ok' },
                { label: <StatusLabel value='disabled' label='Disabled' />,
                  value: 'disabled' },
                { label: <StatusLabel value='unknown' label='Unknown' />,
                  value: 'unknown'}
              ]} value={filter.status} onChange={this._change('status')} />
            </Box>
            <Box tag='section' pad={{ horizontal: 'large', vertical: 'small' }}>
              <Heading level={3}>State</Heading>
              <Select inline={true} multiple={true} options={[
                { label: 'All', value: undefined },
                { label: 'Active', value: 'active' },
                { label: 'Locked', value: 'locked' },
                { label: 'Cleared', value: 'cleared' },
                { label: 'Running', value: 'running' },
                { label: 'Completed', value: 'completed' },
                { label: 'Error', value: 'error' }
              ]} value={filter.state} onChange={this._change('state')} />
            </Box>
            <Box tag='section' pad={{ horizontal: 'large', vertical: 'small' }}>
              <Heading level={3} >Category</Heading>
              <Select inline={true} multiple={true} options={[
                { label: 'All', value: undefined },
                { label: 'Alerts', value: 'alerts' },
                { label: 'Tasks', value: 'tasks' }
              ]} value={filter.category} onChange={this._change('category')} />
            </Box>
          </div>
        </Sidebar>
      </Layer>
    );
  }
}

ActivityFilter.propTypes = {
  index: PropTypes.object
};

let select = (state) => ({ index: state.index });

export default connect(select)(ActivityFilter);
