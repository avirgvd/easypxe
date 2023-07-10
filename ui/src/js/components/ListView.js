import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';

import {
  Grid,
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Header,
  Heading,
  List,
  Text,
  Menu
} from 'grommet';

import {Add as AddIcon, AppsRounded, CircleAlert, Edit as EditIcon, UnorderedList, View} from 'grommet-icons';

import { pageLoaded } from '../screens/utils';
import {Edit} from "grommet-icons";
import history from '../history';
import Notification1 from "../components/Notification1";
import {loadItems, setView, unloadItems} from "../actions/listview";

class ListView extends Component {

  constructor(props){
    super(props);

    this._onSelect = this._onSelect.bind(this);
    this.setView = this.setView.bind(this);
    // this.render_items = this.render_items.bind(this);

    this.state = { view: "grid", errMsg: ""};
  }

  componentDidMount() {
    pageLoaded('ListView');
    console.log("ListView: componentDidMount: category: ", this.props.category);
    this.props.dispatch(loadItems(this.props.category));
    // this.props.dispatch(loadIntegrations());
  }

  componentWillUnmount() {
    console.log("ListView: componentWillUnmount: category: ", this.props.category);
    this.props.dispatch(unloadItems(this.props.category));
    // this.props.dispatch(unloadIntegrations());
  }

  _onSelect (selection) {
    // this.setState({ selection: selection });
  }

  setView(view){
    this.props.dispatch(setView(this.props.category, view))
  }

  render() {
    console.log("ListView: this.props: ", this.props);
    const { intl } = this.context;

    let list = this.props.renderItems();

    let actionMenu = this.props.actionMenu.map(item => (
      { label: item.label, onClick: item.action}
      // { label: item.label, onClick: () => {history.push({ pathname: item.action})}}
    ));

    return (
      <Box id="top2" fill overflow="auto" align="stretch" justify="start" direction="column" margin={"medium"} pad="small"  >
        <Header border={{"color":"separator1","size":"xsmall","side":"bottom"}} align="center" direction="row" justify="between" gap="xsmall" fill="horizontal">
          <Box align="center" justify="center" direction="row" gap={"small"}>
            <Heading  size="small" level={4}>
              {this.props.heading}
            </Heading>
            <Box  border={{"color":"separator1","size":"xsmall","side":"vertical"}}>
            <Menu
              label="Actions"
              items={actionMenu}
            />
            </Box>
          </Box>
          <Box align="center" justify="center" direction="row-responsive" gap="small" margin="small">
            <Button icon={<UnorderedList />} active={this.state.view === 'list'} primary={false} plain onClick={() => {this.setView('list')}}/>
            <Button icon={<AppsRounded />} active={this.state.view === 'grid'} primary={false} plain onClick={() => {this.setView('grid')}}/>
            <Button disabled plain />
            <Button disabled plain />
          </Box>
        </Header>
        {this.props.errMsg != "" &&
        (
          <Notification1
            status="warning"
            message={this.props.errMsg}
          />
        )
        }
        <br/>
        {list}
      </Box>
    );
  }
}

ListView.defaultProps = {
  error: undefined,
};

ListView.propTypes = {
  dispatch: PropTypes.func,
  error: PropTypes.object,
};

ListView.contextTypes = {
  intl: PropTypes.object,
  dispatch: PropTypes.func,
  renderItems: PropTypes.func,
  error: PropTypes.object,
};

const select = state => ({ ...state.listview });
// const select = (state) => {
//
//   console.log("photos:mapStateProps: state: ", state);
//   const category = '';
//
//   return {
//     category: category,
//     documents: state.documents.getIn(['categories', category])
//   };
// };


export default connect(select)(ListView);
