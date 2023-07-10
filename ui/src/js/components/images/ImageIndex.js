
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { loadImageOsTypes, loadImages, unloadImages, queryIndex, moreIndex
} from '../../actions/image';
import {
  Box,
  Header,
  Anchor,
  List,
  Heading,
  Text,
  Meter,
  Button,
  Menu,
  Card,
  CardHeader,
  CardBody,
  CardFooter, Grid, Spinner
} from 'grommet';
import {Add as AddIcon, AppsRounded, CircleAlert, Edit, More, UnorderedList, View} from 'grommet-icons';
import NavControl from '../NavControl';
import history from '../../history';
import Notification1 from "../Notification1";
import ListView from "../ListView";

class ImageIndex extends Component {

  constructor (props) {
    super(props);
    this.syncImages = this.syncImages.bind(this);
    this._onSearch = this._onSearch.bind(this);
    this._onMore = this._onMore.bind(this);
    this._onSelect = this._onSelect.bind(this);
    this.render_items = this.render_items.bind(this);
    this.state = { image: {}, searchText: '', errMsg: '', category: 'images'};
  }

  componentDidMount () {
    // this.props.dispatch(loadImages({ category: 'images', sort: 'name:asc' }));
    console.log("componentDidMount: window.location.pathname: ", window.location.pathname);

  }

  componentWillUnmount () {
    // this.props.dispatch(unloadImages());
  }

  _onSearch (event) {
    const { index } = this.props;
    const searchText = event.target.value;
    this.setState({ searchText });
    // const query = new Query(searchText);
    // this.props.dispatch(queryIndex(index, query));
    this.props.dispatch(queryIndex(index, {}));
  }

  _onMore () {
    const { index } = this.props;
    this.props.dispatch(moreIndex(index));
  }

  _onSelect (selection) {
    // this.setState({ selection: selection });
  }

  render_items(){

    const { data } = this.props;
    console.log("render_items: items: ", data["items"]);
    console.log("render_items: error: ", data["error"]);
    console.log("render_items: view: ", data["view"]);
    let items = data['items'].filter(item => (
        !item.hasOwnProperty("syncStatus")
        || item.syncStatus === "In-Sync"
        || item.syncStatus === "Syncing"
        || item.syncStatus === "Local"
    ));

    let error = data['error']
    let view = data['view']

    if(view === "list") {
      return (
          <List
              onClickItem={this._onSelect}
              background={"text-xweak"}
              focus={false}
              data={items}
              primaryKey={(item) => (
                  <Box direction={"row"} justify={"between"}>
                    <Text key={item.package} size="large">
                      {item.package} (<b>{item.osType}</b>)
                    </Text>
                    {( !item.hasOwnProperty('syncStatus') || item.syncStatus === "In-Sync" || item.syncStatus === "Local") && (
                        <Button plain={true}
                            key={item.uri}
                            margin="xsmall"
                            type="button"
                            icon={<View />}
                            hoverIndicator
                            onClick={() => {history.push({ pathname: `/ui/images/view/${item.uri}`})}}/>)}
                    {item.syncStatus === "Syncing" && (
                        <Spinner
                            border={[
                              {side: 'all', color: 'white', size: 'medium'},
                              {side: 'right', color: 'background-contrast', size: 'medium'},
                              {side: 'top', color: 'white', size: 'medium'},
                              {side: 'left', color: 'background-contrast', size: 'medium'},
                            ]}
                        />)}
                  </Box>
              )}
              onMouseOver={() => {}}
          />);
    }
    else {
      if(view !== "grid") {
        console.log("Unsupported view type [", + view + "] Using default view");
      }

      console.log("List: ", items)

      let cards = "";
      if(items && items.length > 0){
        cards = items.map((value, index) => (

            <Card key={index} background={{"color":"background-contrast"}} >
              <CardHeader pad="medium">
                <Text weight='bold' level={2}>{value['name']} ({value['osType']})</Text>
              </CardHeader>
              <CardBody pad="medium">
                <Text><b>Package:</b>   {value['package']}</Text>
                <Text><b>Type:</b>   {value['osType']}</Text>
              </CardBody>
              <CardFooter justify={"end"} pad={{horizontal: "small"}} background="light-2">
                <Button
                    icon={<View color="blue"/>}
                    hoverIndicator
                    onClick={() => {history.push({pathname: '/ui/images/view/' + value.uri})}}
                />
              </CardFooter>
            </Card>

        ));
      }
      return (
          <Box id="top3" overflow="visible" align="start" flex="grow"  justify="start" pad="medium"  >
            <Grid gap="medium" columns={{ count: 3, size: 'small' }}>
              {cards}
            </Grid>
          </Box>
      );
    }

  }

  render() {
    console.log("ImageIndex: this.props: ", this.props);
    console.log("ImageIndex: this.state: ", this.state);
    const { data } = this.props;
    console.log("ImageIndex: items: ", data["items"]);
    const { intl } = this.context;

    let error = data['error']

    // const rendered_items = this.render_items("grid")
    let errMsg = "";

    if (error && error.hasOwnProperty("status")) {
      //  Error loading networks
      errMsg = error['msg'];
    }

    return (
        <ListView
            // list={list}
            heading={"Images"}
            category={this.state.category}
            actionMenu={[
                {'label': 'Add', 'action': () => {history.push({ pathname: '/ui/images/add'})}},
                // {'label': 'Sync View', 'action':  () => {history.push({ pathname: '/ui/images/sync'})}},
            ]}
            errMsg={errMsg}
            renderItems={this.render_items}
        />
    );
  }

  syncImages() {
    console.log("Sync the images");

  }
};

ImageIndex.defaultProps = {
  error: undefined,
  // images: [],
  // osTypes: [],
  // uploads: [],
  data: {}
};

ImageIndex.propTypes = {
  dispatch: PropTypes.func,
  error: PropTypes.object,
  // images: PropTypes.arrayOf(PropTypes.object),
  // osTypes: PropTypes.arrayOf(PropTypes.object),
  // uploads: PropTypes.arrayOf(PropTypes.object),
  data: PropTypes.object
};

ImageIndex.contextTypes = {
  intl: PropTypes.object,
  dispatch: PropTypes.func,
  error: PropTypes.object,
  // images: PropTypes.arrayOf(PropTypes.object),
  // osTypes: PropTypes.arrayOf(PropTypes.object),
  // uploads: PropTypes.object,
  data: PropTypes.object
};

// const select = state => ({ ...state.images });
// let select = (state, props) => {
//   //console.log("select state: ", state);
//   return {
//     images: state.image.images,
//     error: state.image.error,
//     uploads: state.image.uploads,
//     osTypes: state.image.osTypes
//   };
// };

const select = (state) => {

  console.log("ImageIndex: select: ", state);
  const category = 'images';

  return {
    category: category,
    data: state.listview.getIn(['categories', category]).toJS()
  };
};

export default connect(select)(ImageIndex);
