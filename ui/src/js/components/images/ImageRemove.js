
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {Box, Button, Footer, FormField, Text} from "grommet";
import { connect } from 'react-redux';
import { deleteImage } from '../../actions/image';
// import LayerForm from 'grommet-templates/components/LayerForm';
import { Paragraph } from 'grommet';
import LayerForm from "../LayerForm";

class ImageRemove extends Component {

  constructor () {
    super();
    this._onRemove = this._onRemove.bind(this);
  }

  _onRemove () {
    console.log("ImageRemove: this.props.currentItem: ", this.props.image);
    const { router } = this.context;
    deleteImage({ category: 'images', sort: 'name:asc' },
      this.props.image.uri, (res, err) => {
          window.location.href = '/ui/images';
        });
    // router.push({
    //   pathname: '/images',
    //   search: document.location.search
    // });
    // window.location.href = '/ui/images';
  }

  render () {
    return (
      <LayerForm title="Remove Image"
                 submitLabel="Yes, Remove"
                 titleTag={4}
                 onClose={this.props.onClose} onSubmit={this._onRemove}>
        <br/>
        <Text>Are you sure you want to remove?</Text>
        <Footer pad={{vertical: 'medium'}} justify="between">
          <Button label='Yes'
                  primary={true}
                  onClick={this._onRemove}
          />
          <Button label='Cancel'
                  primary={false}
                  onClick={this.props.onClose}
          />
        </Footer>
      </LayerForm>
    );
  }
}

ImageRemove.propTypes = {
  onClose: PropTypes.func.isRequired,
  image: PropTypes.object.isRequired
};

ImageRemove.contextTypes = {
  router: PropTypes.object
};

export default connect()(ImageRemove);
