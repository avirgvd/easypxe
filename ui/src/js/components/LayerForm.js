
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Box, Form, FormField, Header, Heading, Footer, Button, Layer } from 'grommet';
import { EmptyCircle as BusyIcon}  from 'grommet-icons';

export default class LayerForm extends Component {

  constructor (props) {
    super(props);
    this._onSubmit = this._onSubmit.bind(this);
  }

  _onSubmit (event) {
    event.preventDefault();
    this.props.onSubmit();
  }

  render () {
    const { submitLabel, onClose, title, compact, busy,
      secondaryControl, titleTag } = this.props;
    let control = "";
    if (busy) {
      const label = (true === busy ? '' : busy);
      control = (
        <Box direction="row" align="end"
             pad={{horizontal: 'medium', between: 'small'}}>
          <BusyIcon /><span className="secondary">{label}</span>
        </Box>
      );
    } else {
      control = (
        <Button type="submit" primary={true} label={submitLabel}
                onClick={this._onSubmit} />
      );
    }

    return (
      <Layer
        modal
        position="right"
        fill="vertical"
        responsive
        margin="medium"
        animate
      >
        <Box overflow="scroll" pad="medium">
        <Form onSubmit={this._onSubmit} >
          <Header>
            <Heading level={titleTag} margin='none'>{title}</Heading>
          </Header>
          <div>
            {this.props.children}
          </div>
          <Footer pad={{vertical: 'medium'}} justify="between">
            {/*{control}*/}
            {secondaryControl}
          </Footer>
        </Form>
        </Box>
      </Layer>
    );
  }
};

LayerForm.propTypes = {
  busy: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  compact: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  secondaryControl: PropTypes.node,
  submitLabel: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  titleTag: PropTypes.number
};

LayerForm.defaultProps = {
  titleTag: 'h1'
};
