
import React, {Component, useState} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import {
  loadTasks
} from '../../actions/tasks';

import {Box, Button, Header, Heading, Meter, DataTable, Text, TextInput as Search, Stack} from 'grommet';

import ActivityTile from './ActivityTile';
import {Select, Trash, More, Grid} from "grommet-icons";
import history from '../../history';

class ActivityGlobalTile extends ActivityTile {
}

ActivityGlobalTile.defaultProps = {
  includeResource: true
};



class ActivityIndex extends Component {

  constructor(props) {
    super(props);
    this.onAction = this.onAction.bind(this);
    this.onChildren = this.onChildren.bind(this);
    this._onSearch = this._onSearch.bind(this);
    this._onMore = this._onMore.bind(this);
    this._onFilterActivate = this._onFilterActivate.bind(this);
    this._onFilterDeactivate = this._onFilterDeactivate.bind(this);
    this._onSelect = this._onSelect.bind(this);
    this._onDeselect = this._onDeselect.bind(this);
    this.renderTasks = this.renderTasks.bind(this);
    this.setSelect = this.setSelect.bind(this);
    this.state = {searchText: '', deleteButton: true};
  }

  componentDidMount() {
    console.log("ActivityIndex: componentDidMount: ");
    this.props.dispatch(loadTasks());

    this.timerID = setInterval(
      () => this.props.dispatch(loadTasks()),
      30000
    );
  }

  componentWillUnmount() {
    console.log("ActivityIndex: componentWillUnmount: ");
    clearInterval(this.timerID);
  }

  setSelect(selected, datum){
    console.log("setSelected: selected: ", selected);

  }

  renderTasks(tasks, readonly=false){

    const columns = [
      {
        property: 'taskId',
        header: "Task ID",
        primary: true,
        align: 'end',
      },
      {
        property: 'type',
        header: 'Type',
        align: 'end',
      },
      {
        property: 'name',
        header: 'Name',
        align: 'end',
      },
      {
        property: 'date',
        header: 'Date',
        render: (datum) =>
            datum.startTime && new Date(datum.startTime).toISOString(),
        align: 'end',
      },
      {
        property: 'status',
        header: 'Status',
        align: 'end',
      },
      {
        property: 'percent',
        header: 'Percent Complete',
        render: ({ percent }) => (
            <Box pad={{ vertical: 'xsmall' }}>
              <Meter
                  color="accent-1"
                  values={[{ value: percent }]}
                  background={{ color: "dark-1", opacity: "weak" }}
                  thickness="small"
                  size="small"
              />
            </Box>
        ),
      }
    ];

    let DATA = tasks.map(value => (
        {
          taskId: value['taskId'],
          type: value['type'],
          name: value['name'],
          startTime: value['startTime'],
          status: value['status'],
          percent: value['progress']*10,
        }
    ));

    if(readonly){
      return (
          <DataTable
              columns={columns}
              data={DATA}
              step={100}
              pad={{ horizontal: 'small', vertical: 'xsmall' }}
              background={{
                header: { color: 'dark-3', opacity: 'strong' },
                body: ['light-1', 'light-3'],
                footer: { color: 'dark-3', opacity: 'strong' },
              }}
              border={{ body: 'bottom' }}
              onClickRow={(event) => {
                console.log("ActivityIndex onClickRow: ", event.datum);
                if(event.datum['type'] == "DEPLOYMENT"){
                  history.push({pathname: `/ui/deployprogress/${event.datum.taskId}`})
                }
                else if(event.datum['type'] == "IMAGE_IMPORT"){
                  history.push({pathname: `/ui/taskdetails/${event.datum.taskId}`})
                }
              }}
          />
      );

    }
    else {
      return (
          <DataTable
              columns={columns}
              data={DATA}
              step={100}
              select={this.state.select}
              onSelect={this.setSelect}
              pad={{ horizontal: 'small', vertical: 'xsmall' }}
              background={{
                header: { color: 'dark-3', opacity: 'strong' },
                body: ['light-1', 'light-3'],
                footer: { color: 'dark-3', opacity: 'strong' },
              }}
              border={{ body: 'bottom' }}
              onClickRow={(event) => {
                console.log("ActivityIndex onClickRow: ", event.datum);
                if(event.datum['type'] == "DEPLOYMENT"){
                  history.push({pathname: `/ui/deployprogress/${event.datum.taskId}`})
                }
                else if(event.datum['type'] == "IMAGE_IMPORT"){
                  history.push({pathname: `/ui/taskdetails/${event.datum.taskId}`})
                }
              }}
          />
      );

    }
  }

  _onSearch(event) {
    const {tasks} = this.props;
    const searchText = event.target.value;
    this.setState({searchText});
    // const query = new Query(searchText);
    // this.props.dispatch(queryIndex(index, query));
  }

  _onMore() {
    const {tasks} = this.props;
    // this.props.dispatch(moreIndex(index));
  }

  _onFilterActivate() {
    this.setState({filterActive: true});
  }

  _onFilterDeactivate() {
    this.setState({filterActive: false});
  }

  _onSelect(event) {

  }

  _onDeselect() {
    this.setState({selection: undefined});
  }

  onChildren(datum, index) {
    // console.log("onChildren: ", index);
    // console.log(datum);
    return (
      <Box key={index} direction="row" background={{"color": "accent-4"}} pad={{between: 'small'}} align="center">
      <Text truncate={false} margin="small"> <b>Task ID:</b> {datum.taskId}</Text>
      <Text truncate={false} margin="small"><b>Name:</b> {datum.name}</Text>
      <Text truncate={false} margin="small">{datum.message}</Text>
      <Text truncate={false} margin="small">{datum.errorMsg}</Text>
      <Meter size="small"
             color="green"
             value={datum.progress * 10}
             a11yTitle="Progress bar" />
      <Text truncate={false} margin="small"  weight="bold">{datum.progress * 10}% </Text>
      <Box tag='label'> {1} completed</Box>
      <Text truncate={false} margin="small">{datum.status}</Text>
    </Box>);
  }

  onAction(datum, index) {
    // console.log("onAction: ", index);
    // console.log("onAction: ", datum);

    if(datum['type'] === "IMAGE_IMPORT"){
      //console.log("Image import task details");
      return (<Button plain={false}
                      key={index}
                      margin="xsmall"
                      type="button"
                      icon={<More />}
                      onClick={() => history.push({pathname: `/ui/taskdetails/${datum.taskId}`})}/>);
    }
    else if (datum['type'] === "DEPLOYMENT"){
      return (<Button plain={false}
                      key={index}
                      margin="xsmall"
                      type="button"
                      icon={<More />}
                      onClick={() => history.push({pathname: `/ui/deployprogress/${datum.taskId}`})}/>);
    }

  }

  render() {
    console.log("render: ActivityIndex: this.props: ", this.props);
    const {tasks} = this.props;
    const {filterActive, searchText, selection} = this.state;



    if(this.props.tableOnly){
      return this.renderTasks(tasks['tasks'], true);
    }
    else {
      let tasks_table = this.renderTasks(tasks['tasks']);
      // TODO improve the rendering
      return (
          <Box align="stretch" pad="small" overflow="auto" flex="grow" fill="vertical">
            <Header pad={{ horizontal: 'small' }}>
                  <Heading size="small" level={4} strong={false} >Tasks</Heading>
            </Header>
            <Box direction={"column"} flex margin={"small"} gap={"small"} pad={"small"} >
              <Box direction="row" align={"end"} gap={"small"}>
                <Button autoFocus={true} icon={<Select/>} label={"Select Items"}></Button>
                <Button icon={<Trash/>} label={"Delete Selected"} disabled={this.state.deleteButton}/>
              </Box>
              <Box>
                {tasks_table}
              </Box>
            </Box>
          </Box>
      );
    }

  }
}

ActivityIndex.propTypes = {
  tasks: PropTypes.object
};

ActivityIndex.contextTypes = {
  // router: PropTypes.object,
  tasks: PropTypes.object
};

// let select = (state, props) => ({
//   tasks: state.tasks
// });

let select = (state, props) => {
  console.log("ActivityIndex select state: ", state);
  return {
    tasks: state.tasks,
  };
};


export default connect(select)(ActivityIndex);
