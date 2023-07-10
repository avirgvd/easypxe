/**
 * Created by avireddi on 12/18/2021.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';

import {
  Meter,
  Paragraph,
  Box,
  Button,
  Footer,
  Form,
  Header,
  Heading,
  Text,
  DataTable, NameValueList, NameValuePair, Stack
} from 'grommet';
import { Notification, Value } from 'grommet-controls';
// import { getMessage } from 'grommet/utils/Intl';
import { FileSaver } from 'file-saver';

import Notification1 from '../components/Notification1'

import {
  saveDeploymentSettings, performDeployServers, unloadDeployServers
} from '../actions/deployservers';

import { loadTask } from '../actions/tasks';

import { pageLoaded } from './utils';
// import DocumentCsvIcon from 'grommet/components/icons/base/DocumentCsv';
import { saveAs } from 'file-saver';
import {More} from "grommet-icons";
import history from '../history';

class TaskDetails extends Component {

  constructor(props) {

    super(props);

    this.state = {
      activeState: 5,
      submitted: false,
  };

    this.handleClick = this.handleClick.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleBack= this.handleBack.bind(this);
  }

  componentDidMount() {
    pageLoaded('TaskDetails');
    console.log("TaskDetails: componentWillMount: ", this.props)
    //console.log("TaskDetails: window.location.pathname: ", window.location.pathname)
    let tasknumber = this.props.location.pathname.substr("/ui/taskdetails/".length);
    this.props.dispatch(loadTask(tasknumber));
    this.timerID = setInterval(
      () => this.props.dispatch(loadTask(tasknumber)),
      30000
    );
    // this.props.dispatch(loadDeployServers());
  }

  componentWillUnmount() {
    console.log("TaskDetails: componentWillUnmount: ");
    clearInterval(this.timerID);
    // this.props.dispatch(unloadDeployServers());
  }

  handleClick() {
    history.push({
      pathname: '/ui/activity'
    });
    // window.location.href = '/ui/activity';

  }

  handleClose(event, reason) {
    if (reason === 'clickaway') {
      return;
    }
    this.setState({isFail: false, isSuccess: false});
  }

  findEthPort(nic) {

  }

  handleBack() {
    //console.log("TaskDetails: handleBack: this.state.activeState: ", this.state.activeState);

    // This will navigate the page to previous page
    this.props.onBack(this.state.activeState);
  }

  onChildren(datum, index) {
    //console.log("onChildren: ", index);
    //console.log(datum);
    return (<Box direction="row" background={{"color": "accent-4"}} pad={{between: 'small'}} align="center">
      <Text truncate={false} margin="small"> {datum.bmcIPAddr}</Text>
      <Text truncate={false} margin="small">{datum.bmcUser}</Text>
      <Text truncate={false} margin="small">{datum.hostName}</Text>
      <Text truncate={false} margin="small">{datum['networks'][0].ipAddr}</Text>
      <Text truncate={false} margin="small"  weight="bold">{datum.progress * 10}% </Text>
      <Text truncate={false} margin="small">{datum.status}</Text>
      <Text truncate={false} margin="small">{datum.message}</Text>
    </Box>);
  }

  render() {
    console.log("render: TaskDetails: this.props: ", this.props);
    // console.log("render: TaskDetails: this.props.currentTask: ", this.props.currentTask);

    const { error, currentTask } = this.props;
    const { intl, router } = this.context;

    //console.log("TaskDetails: render: currentTask: ", currentTask)

    // skip render if current task is null
    if(!(currentTask && currentTask['type'] === "IMAGE_IMPORT"))
      return (<Box></Box>);

    let overallProgress = 0;
    let completedTasks = 0;
    let failedTasks = 0;
    let completedTasksStr = "";


    let notification;

    if(currentTask.status === "Error" || currentTask.status === "Failed") {
      notification = (<Notification1 status='error'
                                    message={currentTask['errorMsg']}
      />);
    }

    if(failedTasks > 0) {
      notification = (<Notification1 status='error'
                                    message="One or more hosts deployment failed"
      />);
    }

    console.log(currentTask)

    let elapsed_time = Math.floor((((currentTask.endTime - currentTask.startTime) * 1000000) / 3600) % 60 )
    // let elapsed_time = Math.floor(((currentTask.endTime - currentTask.startTime) / 60) % 60)
    let start_time = new Date(currentTask.startTime *1000)
    let end_time = new Date(currentTask.endTime *1000)
    let elapsed_time_h = end_time.getHours() - start_time.getHours()
    let elapsed_time_m = end_time.getMinutes() - start_time.getMinutes()
    let elapsed_time_s = end_time.getSeconds() - start_time.getSeconds()
    let elapsed_time_ms = end_time.getMilliseconds() - start_time.getMilliseconds()
    console.log("Elapsed time: ", elapsed_time_h)
    console.log("Elapsed time: ", elapsed_time_m)
    console.log("Elapsed time: ", elapsed_time_s)
    console.log("Elapsed time: ", elapsed_time_ms)
    let start_time_str = start_time.toLocaleDateString() + " " + start_time.toLocaleTimeString()
    let end_time_str = end_time.toLocaleDateString() + " " + end_time.toLocaleTimeString()


    return (
      <Box id="top2" fill="vertical" overflow="auto" align="start" flex="grow"  justify="start" direction="column" pad="large"  >
      <Form pad="large" >
          <Header >
                <Heading strong={true} level={3}>Task Details</Heading>
          </Header>
          {notification}
          <div>
            <NameValueList>
              <NameValuePair name="Image Name">
                <Text color="text-strong">{currentTask['data']['data']['name']}</Text>
              </NameValuePair>
              <NameValuePair name="Source File">
                <Text color="text-strong">{currentTask['data']['data']['file']}</Text>
              </NameValuePair>
              <NameValuePair name="Generated File Name">
                <Text color="text-strong">{currentTask['filepath']}</Text>
              </NameValuePair>
              <NameValuePair name="Image Type">
                <Text color="text-strong">{currentTask['data']['data']['osType']}</Text>
              </NameValuePair>
              <NameValuePair name="Start Time">
                <Text color="text-strong">{start_time_str}</Text>
              </NameValuePair>
              <NameValuePair name="End Time">
                <Text color="text-strong">{end_time_str}</Text>
              </NameValuePair>
              <NameValuePair name="Elapsed Time">
                <Text color="text-strong">{ elapsed_time } Secs</Text>
              </NameValuePair>
            <NameValuePair name="Overall Progress">
              <Box direction={"row"} gap={"small"}>
                <Stack anchor={"center"}>
                  <Meter size='small'
                         color="graph-0"
                         background="status-unknown"
                         type="bar"
                         value={currentTask.progress * 10}
                         a11yTitle="Progress"
                  />
                  <Text color="text-strong">{currentTask.progress * 10} %</Text>
                </Stack>
              </Box>
            </NameValuePair>
            </NameValueList>
          </div>
          <Footer pad={{vertical: 'medium'}} justify="between">
            <Button label='Close'
                    primary={true}
                    onClick={this.handleClick}
            />
          </Footer>
        </Form>
      </Box>
    );
  }
}

TaskDetails.defaultProps = {
  error: undefined,
  url: undefined
};

TaskDetails.propTypes = {
  dispatch: PropTypes.func.isRequired,
  error: PropTypes.object,
  url: PropTypes.object
};

TaskDetails.contextTypes = {
  router: PropTypes.object
};

const select = state => ({ ...state.tasks });
// let select = (state, props) => {
//   console.log("TaskDetails select: state: ", state);
//   console.log("TaskDetails select: props: ", props);
//   return {
//     uri: props.location.pathname.substr("/deployprogress/".length)
//   };
// };

export default connect(select)(TaskDetails);

