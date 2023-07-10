/**
 * Created by avireddi on 11/10/2021.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import {Heading, Box, Text, Button, Footer, FormField, TextInput, Select, TextArea, Spinner} from 'grommet';
import { Actions, StatusWarning } from 'grommet-icons';
import {getRESTApi, postRESTApi} from '../../api/server-rest';
import LayerForm from "../LayerForm";
import {IntegerInput, NumberInput} from "grommet-controls";
import IPAddressInput from "../IPAddressInput";
import {loadScripts, loadScripts_direct, saveDeploymentSettings, saveScreenData} from "../../actions/deployservers";

// Theme for spinner but not used
const themeWithAnimation = {

  spinner: {
    icon: Actions,
    container: {
      color: 'accent-2',
      align: 'center',
      justify: 'center',
      size: 'large',
      animation: { type: 'rotateLeft', duration: 900 },
    },
  },
};

class PXEBootItem extends Component {

  constructor (props) {
    super(props);
    this._onDelete = this._onDelete.bind(this);
    this._onSubmit = this._onSubmit.bind(this);
    this.loadOSPackages = this.loadOSPackages.bind(this);
    this.handleOSPackage = this.handleOSPackage.bind(this);
    this.handleAddHost = this.handleAddHost.bind(this);
    this.handleKickstart = this.handleKickstart.bind(this);
    this.handleDriversPack = this.handleDriversPack.bind(this);

    this.state = {
      errorMsg: "",
      osPackages: [],
      scripts: {},
      kickstart: "",
      bootEntry: {
        displayText: "",
        osPackage: "",
        kickstart: "",
        driversPack: "",
      },
    };

    this._handlePXEItem = this._handlePXEItem.bind(this);

  }

  componentDidMount() {

    if(this.props.action == 'edit') {
      this.setState({'bootEntry': this.props.item}) ;
    }

    this.loadOSPackages({'filter': 'purpose=pxe'})
  }

  handleAddHost(event){
    console.log("handleAddHost: this.state.bootEntry: ", this.state.bootEntry);
    this.props.handleAddHost(event, this.state.bootEntry);
  }

  handleCancelAddHost(event){
    this.props.handleCancelAddHost(event);
  }

  _handlePXEItem(event) {
    console.log("_handlePXEItem: event.target.value: ", event.target.value)
    console.log("_handlePXEItem: event.target: ", event.target.id)
    let boot_entry = {...this.state.bootEntry};
    if (event.target.id === 'bootentry') {
      boot_entry.displayText = event.target.value;
    }
    else if (event.target.id === 'ospackage') {
      boot_entry.osPackage = event.target.value;
    }

    // console.log("_handlePXEItem: updating the host: ", host)
    this.setState({bootEntry: boot_entry});
  }

  _onSubmit() {
    console.log("_onSubmit: ", this.state);
    const bootEntry = this.state.bootEntry;
    this.props.handleAdd(bootEntry);
  }

  _onDelete() {
    console.log("_onDelete: ", this.state);

    const res = confirm("Deleting this item permanently deletes the installation files from BMA file-server. \n\nAre you sure?")
    console.log(res)
    if(!res)
      return;

    const bootEntry = this.state.bootEntry;
    this.props.handleDelete(bootEntry);

  }

  loadOSPackages(params) {
    let url = '/rest/images/list';
    if(params)
      url = url + "?" + params['filter']
    getRESTApi(url)
        .then((response) => {
          console.log("loadOSPackages: response: ", response);
          this.setState({"osPackages": response.result});
        })
        .catch((err) => {
          console.log("loadOSPackages: err: ", err);
        })
  }

  handleOSPackage(event) {
    console.log("handleOSPackage: ", event.option)
    let boot_entry = {...this.state.bootEntry};
    boot_entry.osPackage = event.option

    this.setState({"bootEntry": boot_entry})

    let package1 = this.state.osPackages.filter(item => item.package === event.option);
    console.log("handleOSPackage: selected package: ", package1);

    // TODO: Donot get scripts as yet
    loadScripts_direct(package1[0]['osType'], (res) => {
      console.log("handleOSPackage: scripts: ", res);
      this.setState({scripts: res})
    });
  }

  handleDriversPack(event) {
    console.log("handleOSPackage: ", event.option)
    let boot_entry = {...this.state.bootEntry};
    boot_entry.driversPack = event.option

    this.setState({"bootEntry": boot_entry})

  }

  handleKickstart(event){
    let boot_entry = {...this.state.bootEntry};
    boot_entry.kickstart = event.option

    this.setState({"bootEntry": boot_entry})
  }

  render () {

    console.log("render: this.props: ", this.props);
    console.log("render: this.state: ", this.state);

    let ospList = [];
    let ksList = [];

    let bootEntry = this.state.bootEntry;
    // if(this.props.action == 'edit') {
    //   bootEntry = this.props.item;
    // }

    let ospPlaceHolderText = (this.state.osPackages.length >= 1)? "Select":"None";
    if(this.state.osPackages) {
      ospList = this.state['osPackages'].map((item, index) => (
          item.package
      ));
    }

    let ksPlaceHolderText = "None";
    if(this.state.scripts.hasOwnProperty('kickStarts') && this.state.scripts['kickStarts']){
      ksPlaceHolderText = "Default";

      // Make a copy of the array instead of reference
      ksList = this.state.scripts['kickStarts'].slice();
      ksList.unshift("Default");
    }

    let title = "";
    if(this.props.action === 'add')
      title = "Add PXE Boot Menu Item";
    else if(this.props.action === 'edit')
      title = "Edit PXE Boot Menu Item";

    if(bootEntry.hasOwnProperty('delete'))
      title = "PXE Boot Menu Item (Marked for Delete!)";


    return (
        <LayerForm
            title={title}
            titleTag={4}
            submitLabel="Submit "
            onClose={() => {}} onSubmit={this._onSubmit}
        >
          <FormField label='Boot Entry Name'>
            <TextInput
                id="bootentry"
                autoFocus={true}
                onChange={this._handlePXEItem}
                value={bootEntry.displayText}
            />
          </FormField>
          <Box gridArea='os-fields' justify='start' align={"start"}>
            <Heading level={5} size="small" strong={true}>OS Package</Heading>
            <Box justify='start' direction='column' align='start' gap='medium' pad='small' elevation='medium' responsive wrap>
              <FormField label='Select OS Package'>
                <Select id="ospackage"
                        placeHolder={ospPlaceHolderText}
                        options={ospList}
                        value={bootEntry.osPackage}
                        onChange={this.handleOSPackage} />
              </FormField>
              <FormField label='Select Kickstart Template'>
                <Select id="kickstart"
                        placeHolder={ksPlaceHolderText}
                        options={ksList}
                        value={bootEntry.kickstart}
                        onChange={this.handleKickstart}/>
              </FormField>
            </Box>
            <br/>
          </Box>
          <Box gridArea='os-fields' justify='start' align={"start"}>
            <Heading level={5} size="small" strong={true}>OS Drivers Package</Heading>
            <Box justify='start' direction='column' align='start' gap='medium' pad='small' elevation='medium' responsive wrap>
              <FormField label='Select OS Drivers Package'>
                <Select placeHolder={ospPlaceHolderText}
                        options={ospList}
                        value={bootEntry.driversPack}
                        onChange={this.handleDriversPack} />
              </FormField>
            </Box>
            <br/>
          </Box>
          <br/>
          <br/>
          <Footer pad={{vertical: 'medium'}} justify="between">
            <Button label='Save'
                    primary={true}
                    disabled={bootEntry.hasOwnProperty('delete')? true:false}
                    onClick={this._onSubmit}
            />
            {(this.props.action === 'edit') && (
                <Button label='Delete'
                        primary={true}
                        disabled={bootEntry.hasOwnProperty('delete')? true:false}
                        onClick={this._onDelete}
                />
            )}
            <Button label='Cancel'
                    primary={false}
                    onClick={this.props.handleCancel}
            />
          </Footer>
        </LayerForm>
    );
  }

}

PXEBootItem.defaultProps = {
  error: undefined,
};

PXEBootItem.propTypes = {
  dispatch: PropTypes.func,
  handleAdd: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired,
  error: PropTypes.object,
  heading: PropTypes.string,
};

PXEBootItem.contextTypes = {
  intl: PropTypes.object,
  dispatch: PropTypes.func,
  error: PropTypes.object,
  router: PropTypes.object
};

export default PXEBootItem;
