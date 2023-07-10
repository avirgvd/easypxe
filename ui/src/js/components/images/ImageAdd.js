
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import { addImage } from '../../actions/image';
import ImageForm from './ImageForm';
import {useHistory} from "react-router-dom";
import {push} from 'connected-react-router'

import history from '../../history';

const DEFAULT_IMAGE = {
  osType: '',
  file: '',
  name: '',
  imagePurpose: ''
};

class ImageAdd extends Component {

  constructor (props) {
    super(props);
    this._onSubmit = this._onSubmit.bind(this);
    this._onClose = this._onClose.bind(this);
  }

  _onSubmit (image, file) {
    const { router } = this.context;

    console.log("ImageAdd _onSubmit: image: ", image);
    console.log("ImageAdd _onSubmit: file: ", file);

    this.props.dispatch(addImage(image, file));
    // router.push({
    //   pathname: '/images',
    //   search: document.location.search
    // });
  }

  _onClose () {
    // let history = useHistory();

    //console.log("ImageAdd _onClose: ", history);

    history.push({
        pathname: '/ui/images',
      });

    // window.location.href = "/ui/images";
    // router.push({
    //   pathname: '/images',
    // });
  }

  render () {
    return (
      <ImageForm heading="Add Image" submitLabel="Add"
        image={DEFAULT_IMAGE} onSubmit={this._onSubmit} onClose={this._onClose}
        busyMessage={this.props.changing ? 'Adding' : null} />
    );
  }
}

ImageAdd.propTypes = {
  changing: PropTypes.bool.isRequired
};

ImageAdd.contextTypes = {
  router: PropTypes.object
};

let select = (state, props) => {
  return {
    changing: state.item.changing
  };
};

export default connect(select)(ImageAdd);
