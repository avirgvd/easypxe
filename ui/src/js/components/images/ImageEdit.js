
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import {loadItem} from '../../actions/listview';
import { updateImage } from '../../actions/ospackages';
import {Form, Footer, Header, Heading, Anchor, TextInput, FormField, Button, Box, Tip, Menu} from 'grommet';
import { Close as CloseIcon, Trash as TrashIcon } from 'grommet-icons';
import ImageRemove from './ImageRemove';
import { deleteImage } from '../../actions/image';
import { useHistory } from "react-router-dom";
import history from '../../history';

class ImageEdit extends Component {

  constructor (props) {
    super(props);
    this.onClose = this.onClose.bind(this);
    this._onRemove = this._onRemove.bind(this);
    this._onCopy = this._onCopy.bind(this);
    this._onRemoveOpen = this._onRemoveOpen.bind(this);
    this._onChange = this._onChange.bind(this);
    this._onRemoveClose = this._onRemoveClose.bind(this);
    this._onSubmit = this._onSubmit.bind(this);

    this.state = {
      errors: {},
      removing: false,
      heading: 'view' // or "edit"
    };
  }

  onClose() {
    //console.log("onClose: ")

    //console.log("history.location: ", history)

    history.push({
      pathname: '/ui/images'
    });
  }
  _onRemoveOpen () {
    this.setState({removing: true});
  }
  _onCopy () {
  }

  _onRemoveClose () {
    this.setState({removing: false});
  }

  _onRemove(){
    console.log("ImageEdit: this.props.currentItem: ", this.props.currentItem);
    // this.props.dispatch(deleteImage({ category: 'image', sort: 'name:asc' }, this.props.currentItem));
  }

  _onChange (event) {
    let image = { ...this.state.image };
    let errors = { ...this.state.errors };
    const attribute = event.target.getAttribute('name');
    const value = event.target.value;
    image[attribute] = value;
    delete errors[attribute];
    this.setState({ image: image, errors: errors });
  }

  componentDidMount() {
    console.log("ImageEdit componentDidMount: props: ", this.props);

    console.log("window.location.pathname: ", window.location.pathname);
    let url_parts = window.location.pathname.split("/");
    let form_type = url_parts[3];
    console.log("form_type: ", form_type)
    let item = "";
    let heading = "";
    if(form_type === "view"){
      item = url_parts[4];
      heading = "View Image Details";
      this.setState({heading: heading, item: item, formType: form_type});
      this.props.dispatch(loadItem("images", item))
    }
    else if (form_type === "edit") {
      item = url_parts[4];
      heading = "Edit Image Details";
      this.setState({heading: heading, item: item, formType: form_type});
      this.props.dispatch(loadItem("images", item))
    }
    else {
      heading = "Add Environment";
      this.setState({heading: heading, formType: "add"});
    }

  }

  componentWillUnmount () {
    // this.props.dispatch(unloadItem(this.props.image, false));
  }

  _onSubmit (image, file) {
    // let history = useHistory();
    // this.props.dispatch(updateImage(image, file));
    history.push({
      pathname: '/ui/images',
    });
    // window.location.href = '/ui/images';
  }

  render () {
    console.log("ImageEdit render: this.props: ", this.props);
    const { item, currentItem} = this.props;

    let image = currentItem;
    console.log("ImageEdit render: image: ", image);
    let removeControl;
    // if (this.props.removable) {
    if (true) {
      removeControl = (
        <Button icon={<TrashIcon />} label="Remove" onClick={this._onRemoveOpen}
                a11yTitle={`Remove ${image.name} Image`} plain={true} />
      );
    }
    let removeConfirm;
    if (this.state.removing) {
      removeConfirm = (
        <ImageRemove image={image} onClose={this._onRemoveClose} onSubmit={this._onRemove} />
      );
    }

    return (
      <Box id="top2" fill="vertical" overflow="auto" align="start" flex="grow"  justify="start" direction="column" margin={"medium"} pad="small"  >
        <Header border={{"color":"separator1","size":"xsmall","side":"bottom"}} align="center" direction="row" justify="start" gap="xsmall" fill="horizontal">
          <Heading  size="small" level={4}>
            {this.state.heading}
          </Heading>
          <Box  border={{"color":"separator1","size":"xsmall","side":"vertical"}}>
            <Menu
                label="Actions"
                items={[
                  { label: 'Copy', disabled: true, onClick: () => {this._onCopy()} },
                  { label: 'Delete', onClick: () => {this._onRemoveOpen()} }
                ]}
            />
          </Box>
        </Header>
        <Form onSubmit={this._onSubmit}>
          <br/>
          <div>
            <Tip content={image['package'] || ''} dropProps={{ align: { left: 'right' } }}>
              <FormField htmlFor="name" label="Image Name">

                  <TextInput ref="name" id="name" name="name" type="text"
                             value={image['package'] || ''} onChange={this._onChange} />
              </FormField>
            </Tip>
            <FormField htmlFor="ostype" label="Image Type" >
                <TextInput ref="ostype" id="ostype" name="ostype" type="text" disabled
                       value={image['osType'] || ''} onChange={this._onChange} />
              </FormField>
            <Tip content={image['source'] || ''} dropProps={{ align: { left: 'right' } }}>
            <FormField htmlFor="source" label="Source File" >
                <TextInput ref="source" id="source" name="source" type="text" disabled
                       value={image['source'] || ''}  />
              </FormField>
            </Tip>
            <Tip content={image['ISO_http_path'] || ''} dropProps={{ align: { left: 'right' } }}>
              <FormField htmlFor="isopath" label="Image File">
                <TextInput readOnly ref="ostype" id="ostype" name="ostype" type="text" disabled
                           value={image['ISO_http_path'] || ''}  />
              </FormField>
            </Tip>
            <Tip content={image['purpose'] || ''} dropProps={{ align: { left: 'right' } }}>
              <FormField htmlFor="purpose" label="Image Purpose">
                <TextInput readOnly ref="ostype" id="ostype" name="ostype" type="text" disabled
                           value={image['purpose'] || ''}  />
              </FormField>
            </Tip>
          </div>
          <Footer pad={{vertical: 'medium'}} justify="end">
            <Button disabledb primary={true} label="Close" onClick={this.onClose}/>
            {/*{removeControl}*/}
          </Footer>
        </Form>
        {removeConfirm}
      </Box>
    );
  }
}

ImageEdit.defaultProps = {
  error: {},
  currentItem: {},
};

ImageEdit.propTypes = {
  changing: PropTypes.bool.isRequired,
  image: PropTypes.object,
  uri: PropTypes.string,
  error: PropTypes.object,
  currentItem: PropTypes.object,
};

ImageEdit.contextTypes = {
  router: PropTypes.object
};

let select = (state, props) => {
  console.log("ImageEdit select: state: ", state);
  console.log("ImageEdit select: props: ", props);
  //console.log("ImageEdit select: props: ", window.location.pathname);
  //console.log("ImageEdit select: props uri: ", window.location.pathname.substr("/ui/images/edit/".length));
  const category = 'images';
  console.log("ImageEdit select: state.listview.getIn([\"categories\", category, \"currentItem\"]).toJS(): ", state.listview.getIn(["categories", category, "currentItem"]).toJS());

  return {
    changing: state.item.changing,
    category: category,
    // image: state.item.item || {},
    currentItem: state.listview.getIn(["categories", category, "currentItem"]).toJS(),
    error: state.listview.getIn(["categories", category, "error"]).toJS(),
    uri: window.location.pathname.substr("/ui/images/edit/".length)
  };
};

export default connect(select)(ImageEdit);
