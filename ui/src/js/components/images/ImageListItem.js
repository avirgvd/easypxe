
import React, { Component } from 'react';
import { PropTypes } from 'prop-types';
import { Anchor, Box } from 'grommet';
import { connect } from 'react-redux';
// import ListItem from 'grommet/components/ListItem';
const List = props => <Box align="stretch" border='top' {...props} />;
const ListItem = props => (<Box align="stretch" border='bottom' pad='small' direction='row' justify='between' {...props} />);

// import Anchor from 'grommet/components/Anchor';
import { Edit as EditIcon } from 'grommet-icons';

class ImageListItem extends Component {

  render() {
    let { item, index, role } = this.props;

    //console.log("ImageListItem: item: ", item);
    //console.log("ImageListItem: index: ", index);
    let edit;
    if ('read only' !== role) {
      edit = (
        <Anchor icon={<EditIcon />} href={`/ui/images/edit/${item.uri}`}
          a11yTitle={`Edit ${item.package} Image`} />
      );
    }

    return (
      <ListItem direction="row" align="center" justify="between"
        separator={index === 0 ? 'horizontal' : 'bottom'}
        pad={{horizontal: 'medium', vertical: 'small', between: 'medium'}}
        responsive={false}
        onClick={this.props.onClick} selected={this.props.selected}>
        <span>{item.package} ({item.osType})</span>
        {edit}
      </ListItem>
    );
  }
}

ImageListItem.propTypes = {
  index: PropTypes.number,
  item: PropTypes.object.isRequired,
  onClick: PropTypes.func,
  selected: PropTypes.bool
};

let select = (state) => {
  return {
    role: state.session.role
  };
};

export default connect(select)(ImageListItem);
