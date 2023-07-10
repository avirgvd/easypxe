/**
 * Created by avireddi on .
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';

import {
  Select,
  Box,
  Button,
  Footer,
  Header,
  Heading,
  Form,
  FormField,
  CheckBox,
  TextInput,
  TableRow, Table, Anchor, RadioButtonGroup, Grid, DataTable
} from 'grommet';
import {getRESTApi} from '../../api/server-rest'
import {
  saveDeploymentSettings,
  sptEthPorts,
  sptStorageDrives,
  loadSPTItems,
  loadOneViews,
  loadOSPackages, loadScripts, saveScreenData
} from '../../actions/deployservers';

import {Add as AddIcon, Trash as DeleteIcon} from 'grommet-icons';
import IPAddressInput from "../IPAddressInput";

class DeployScreen extends Component {

  constructor(props) {

    super(props);

    this.state = {
      activeState: 1,
      osPackages: [],
      deployServerSettings: {},
      screenData: {},
    };

    this.onIPAddrInput = this.onIPAddrInput.bind(this);
    this.loadNetworks = this.loadNetworks.bind(this);
    this.handleEnvSelection = this.handleEnvSelection.bind(this);
    this.handleKickstart = this.handleKickstart.bind(this);
    this.getKickStartsForOSPackage = this.getKickStartsForOSPackage.bind(this);
    this._onCheckListChange = this._onCheckListChange.bind(this);
    this.handleNetworkSettings = this.handleNetworkSettings.bind(this);
    this.handleOSPackage = this.handleOSPackage.bind(this);
    this._addHost = this._addHost.bind(this);
    this._deleteHost = this._deleteHost.bind(this);
    this.handleCancelAddHost = this.handleCancelAddHost.bind(this);
    this.handleAddHost = this.handleAddHost.bind(this);
    this.onNWSettingChange = this.onNWSettingChange.bind(this);
    this._onBulkDeploymentCheck = this._onBulkDeploymentCheck.bind(this);
    this._handleHostDetailsChange = this._handleHostDetailsChange.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleNext = this.handleNext.bind(this);
    this.handleBack = this.handleBack.bind(this);

    this.handleNext= this.handleNext.bind(this);

  }

  componentDidMount() {
    console.log("DeployScreen: componentWillMount: &&&&&&&&&&&&&&&&&&&&&&");

    this.props.dispatch(loadOneViews());
    this.loadNetworks();
    // this.props.dispatch(loadOSPackages({'filter': 'purpose=redfish'}));
    loadOSPackages({'filter': 'purpose=redfish'}, (res, err) => {
      console.log(res);
      this.setState({"osPackages": res});
    });
  }

  componentWillUnmount() {
    //console.log("DeployScreen: componentWillUnmount: ")
    // this.props.dispatch(unloadDeployServers());
  }

  loadNetworks() {
    let url = '/rest/env/list';
    getRESTApi(url)
      .then((response) => {
        console.log("loadNetworks: response: ", response);
        //console.log("loadNetworks: response.result: ", response.result);
        let screenData = {...this.props.screenData};
        screenData['envList'] = response.result;
        let nwEnvsList = [{"name": "User Defined", "mgmtNetwork": {}}]
        screenData['envList'] = nwEnvsList.concat(screenData['envList'])
        console.log("nwEnvsList: ", nwEnvsList)
        this.props.dispatch(saveScreenData(screenData));
      })
      .catch((err) => {
        //console.log("loadNetworks: err: ", err);
        let screenData = {...this.props.screenData};
        screenData['envList'] = [];
        this.props.dispatch(saveScreenData(screenData));
      })
  }

  handleClose(event, reason) {
    if (reason === 'clickaway') {
      return;
    }
    this.setState({isFail: false, isSuccess: false});
  }

  handleNext() {
    //console.log("DeployServerSynergy: handleNext: this.state.activeState: ", this.state.activeState);

    // This will navigate the page to next
    this.props.onNext();
  }

  handleBack() {
    //console.log("DeployServerSynergy: handleBack: this.state.activeState: ", this.state.activeState);
    // This will navigate the page to previous page
    this.props.onBack();
  }

  handleCancel() {
    //console.log("DeployServerSynergy: handleClose");
    this.props.onCancel();
  }

  handleOSPackage(event) {
    // this.props.dispatch(updateScreenData("screenData", "selectedOSP", event.option));
    var data = { ...this.props.deployServerSettings};
    data.osPackage = event.option;
    data.kickstart = "";
    this.props.dispatch(saveDeploymentSettings(data));
    this.getKickStartsForOSPackage(event.option);

  }

  handleKickstart(event){
    var data = {...this.props.deployServerSettings};
    data.kickstart = event.option;
    this.props.dispatch(saveDeploymentSettings(data));
  }

  getKickStartsForOSPackage(osPackage){
    console.log("getKickStartsForOSPackage: osPackage: ", osPackage);
    console.log("getKickStartsForOSPackage: this.props.screenData: ", this.props.screenData);
    console.log("getKickStartsForOSPackage: this.props.screenData.osPackages: ", this.state.osPackages);

    let package1 = this.state.osPackages.filter(item => item.package === osPackage);
    console.log("getKickStartsForOSPackage: package1: ", package1);
    this.props.dispatch(loadScripts(package1[0]['osType']));

  }

  onIPAddrInput(event) {
    //console.log("onIPAddrInput: ", event)
    let data = { ...this.props.deployServerSettings };

    if ( event.target.name === "start_ip" ){
      data['startIPRange'] = event.target.value;
    }
    else if ( event.target.name === "end_ip" ){
      data['endIPRange'] = event.target.value;
    }

    this.props.dispatch(saveDeploymentSettings(data));

  }

  handleNetworkSettings(event) {
    console.log("handleNetworkSettings: ", event.target.value)
    let deployServerSettings = {...this.props.deployServerSettings};
    deployServerSettings['hostIPAssignmentMode'] = event.target.value;
    this.props.dispatch(saveDeploymentSettings(deployServerSettings));
  }

  handleEnvSelection(event) {
    //console.log(event.value);
    let deployServerSettings = {...this.props.deployServerSettings};
    deployServerSettings['selectedEnv'] = event.value;
    this.props.dispatch(saveDeploymentSettings(deployServerSettings));
    // this.setState({selectedEnv: event.value})
  }

  handleAddHost(event, newhostdata){
    console.log("handleAddHost: this.state.newhostdata: ", this.state.newhostdata);
    var deplSettings = { ...this.props.deployServerSettings};
    var hosts = deplSettings.hostsdata;
    var newhost = { ...newhostdata };
    hosts.push(newhost);
    deplSettings['hostsdata'] = hosts;
    console.log("handleAddHost: adding the hosts: ", hosts);
    this.props.dispatch(saveDeploymentSettings(deplSettings));
    this.setState({addhost: false});
  }

  _onBulkDeploymentCheck (event) {
    this.setState({ ...this.state, "isbulk": event.target.checked });
  }

  _deleteHost(name) {
    // The input param 'name' will have serverprofile value for the selected hosts item
    console.log("DeployServerPage3: _deleteHost: ", name);
    var deplSettings = { ...this.props.deployServerSettings};
    var hosts = deplSettings.hostsdata;

    console.log("hosts: ", hosts);

    deplSettings['hostsdata'] = hosts.filter(host => host.serverProfile !== name);
    this.props.dispatch(saveDeploymentSettings(deplSettings));
  }

  handleCancelAddHost(event){
    console.log("handleCancelAddHost");
    this.setState({addhost: false});
  }

  onNWSettingChange (event) {
    console.log("_onInput: ", event.target.value);
    const attribute = event.target.getAttribute('id');

    const value = event.target.value;

    let data = { ...this.props.deployServerSettings};

    console.log("_onInput: selectedEnv", data['selectedEnv']);

    let screenData = {...this.props.screenData};

    let userDefinedEnv = screenData['envList'][0]

    if(attribute === 'subnetmask') {
      userDefinedEnv['mgmtNetwork']['subnetmask'] = value;
    }
    else if(attribute === 'gateway') {
      userDefinedEnv['mgmtNetwork']['gateway'] = value;
    }
    else if(attribute === 'dns') {
      userDefinedEnv['mgmtNetwork']['dns1'] = value;
    }
    else if(attribute === 'vlan') {
      userDefinedEnv['mgmtNetwork']['vlan'] = value;
    }
    data['selectedEnv'] = userDefinedEnv;
    console.log("_onInput: data: ", data);
    this.props.dispatch(saveDeploymentSettings(data));
  }

  _handleHostDetailsChange(event){
    console.log("handleHostDetails: event.target: ")
    console.log("handleHostDetails: event.target: ", event.target.value)
    console.log("handleHostDetails: event.target: ", event.target.id)
    let host = { ...this.state.newhostdata };

    if(event.target.id === 'serverprofile'){
      host.serverProfile = event.target.value;
    }
    else if(event.target.id === 'hostname'){
      host.hostName = event.target.value;
    }
    else if(event.target.id === 'ipaddr'){
      host.ipAddr = event.target.value;
    }

    console.log("handleHostDetails: updating the host: ", host)
    this.setState({newhostdata: host});
  }

  _addHost(event) {
    console.log("DeployServerPage3: _addHost: ", this.state.newhostdata);

    this.setState({addhost: true, newhostdata: {}});
  }

  _onCheckListChange(event) {
    console.log('_onCheckListChange: event: ');

    let data = { ...this.props.deployServerSettings};

    data['commonOSConfig']['createServerProfile'] = !data['commonOSConfig']['createServerProfile']

    this.props.dispatch(saveDeploymentSettings(data));
  }

  _renderLayer () {
    let addHostControls = "";
    let iloPasswordMismatch;

    return addHostControls;
  }

  render() {
    console.log("render: DeployScreen: this.props: ", this.props);
    console.log("render: DeployScreen: this.state: ", this.state);

    const { deployServerSettings, screenData } = this.props;

    let layerAddHost = this._renderLayer();

    let ospList = [];
    let ksList = [];

    let ospPlaceHolderText = (this.state.osPackages.length >= 1)? "Select":"None";
    if(this.state.osPackages) {
      ospList = this.state.osPackages.map((item, index) => (
        item.package
      ));
    }

    let ksPlaceHolderText = "None";
    if(screenData.scripts.hasOwnProperty('kickStarts') && screenData.scripts['kickStarts']){
      ksPlaceHolderText = "Default";

      // Make a copy of the array instead of reference
      ksList = screenData.scripts['kickStarts'].slice();
      ksList.unshift("Default");
    }

    let hoststable = this.props.getHostsTable(deployServerSettings);

    let address_range = ""
    let common_network_settings = "";
    let address_pool = "";
    //console.log("DeployVM: deployServerSettings", deployServerSettings);

    if (deployServerSettings['hostIPAssignmentMode'] === "Static-Range"){
      address_range = ((
        // <Box label='IP Range'>
          <div>
          <Heading level={5} size="small" strong={true}>IP Address Range</Heading>
          <Box justify='start' direction='column' align='stretch' gap='medium' pad='small' elevation='medium' responsive wrap>
            < FormField label='Start IP Address'>
              <IPAddressInput
                name="start_ip"
                value={deployServerSettings.startIPRange}
                onChange={this.onIPAddrInput}
                id="start_ip"
              />
            </FormField>
            < FormField label='End IP Address'>
              <IPAddressInput
                name="end_ip"
                value={deployServerSettings.endIPRange}
                onChange={this.onIPAddrInput}
                id="end_ip"
              />
            </FormField>
        </Box>
          </div>
      ));
    }

    if (deployServerSettings['hostIPAssignmentMode'] === "Address-Pool"){
      address_pool = (
          <div>
          <Heading level={5} size="small" strong={true}>IP Pool</Heading>
          <Box justify='start' direction='column' align='stretch' gap='medium' pad='small' elevation='medium' responsive wrap>
            <FormField label='Choose IP Address Pool'>
              <Select placeholder="Select Address Pool"
                      options={[]}
                      disabled={true}
              />
            </FormField>
          </Box>
          </div>
      )
    }

    if (deployServerSettings['hostIPAssignmentMode'] === "Static"
      || deployServerSettings['hostIPAssignmentMode'] === "Static-Range"
      || deployServerSettings['hostIPAssignmentMode'] === "Address-Pool") {

      common_network_settings = (
        <div>
          {address_range}
          {address_pool}
          <Heading level={5} size="small" strong={true}>Common Network Settings</Heading>
            <Box justify='start' direction='column' align='stretch' gap='medium' pad='small' elevation='medium' responsive wrap>

            <Box justify='start' align='stretch' direction='row' gap='medium' pad={'small'} responsive wrap>
              <FormField htmlFor="subnetmask" label='Subnet Mask'>
                <IPAddressInput id="subnetmask" value={deployServerSettings['selectedEnv']['mgmtNetwork']['subnetmask']}
                                onChange={this.onNWSettingChange}/>
              </FormField>
              <FormField htmlFor="gateway" label='Gateway'>
                <IPAddressInput id="gateway" ref="gateway" value={deployServerSettings['selectedEnv']['mgmtNetwork']['gateway']}
                                onChange={this.onNWSettingChange}/>
              </FormField>
            </Box>
            <Box justify='start' align='stretch' direction='row' gap='medium' pad={'small'} responsive wrap>
              <FormField htmlFor="dns" label='DNS'>
                <IPAddressInput id="dns" value={deployServerSettings['selectedEnv']['mgmtNetwork']['dns1']}
                                onChange={this.onNWSettingChange}/>
              </FormField>
              <FormField htmlFor="lan" label='VLAN'>
                <TextInput id="vlan" value={deployServerSettings['selectedEnv']['mgmtNetwork']['vlan']}
                           onChange={this.onNWSettingChange}/>
              </FormField>
            </Box>
            </Box>
        </div>
      );
    }

    let dhcp_only = false;
    let dhcp_only_msg = "";
    if(deployServerSettings.deploymentMode === 'dell_idrac9' ||
      deployServerSettings.deploymentMode === 'supermicro'){
      dhcp_only = true;
      dhcp_only_msg = "(Only DHCP is supported for the server type)"
    }

    console.log("before render")

    // Uncomment this below like when USB key/MicroSD support is available
    // sptDrives.push("Physical USB Key");

    return (
      <Grid id="bmcdepl"
            alignContent='start'
            responsive={true} justify="stretch"
            rows={['auto', 'auto', 'auto', 'auto', 'auto', 'auto']}
            columns={['auto', 'auto']}
            areas={[
              { name: 'header', start: [0, 0], end: [1, 0] },
              { name: 'method-fields', start: [0, 1], end: [1, 1] },
              { name: 'os-fields', start: [0, 2], end: [1, 2] },
              { name: 'common-fields', start: [0, 3], end: [1, 3] },
              { name: 'hosts', start: [0, 4], end: [1, 4] },
              { name: 'footer', start: [0, 5], end: [1, 5] },
            ]}
      >
        <Box gridArea="header">
          <Header >
            <Heading level={4} size="small" strong={true}>{this.props.heading}</Heading>
          </Header>
        </Box>
        <Box gridArea='method-fields' justify='start' align={"start"}>
          {this.props.children}
        </Box>
        <Box gridArea='os-fields' justify='start' align={"start"}>
          <Heading level={5} size="small" strong={true}>OS Package</Heading>
          <Box justify='start' direction='column' align='start' gap='medium' pad='small' elevation='medium' responsive wrap>
              <FormField label='Select OS Package'>
                <Select placeHolder={ospPlaceHolderText}
                        options={ospList}
                        value={deployServerSettings.osPackage}
                        onChange={this.handleOSPackage} />
              </FormField>
              <FormField label='Select Kickstart Template'>
                <Select placeHolder={ksPlaceHolderText}
                        options={ksList}
                        value={deployServerSettings.kickstart}
                        onChange={this.handleKickstart}/>
              </FormField>
            </Box>
          <br/>
        </Box>
        <Box gridArea='common-fields' justify='start' align={"start"}>
            <Heading level={5} size="small" strong={true}>Network Selection</Heading>
            <Box justify='start' direction='column' align='start' gap='medium' pad='small' elevation='medium' responsive wrap>
              <FormField  htmlFor="networks" label={'Host IP Assignment Method ' + dhcp_only_msg} >
                <RadioButtonGroup margin="small"
                                  name="IP Range"
                                  options={["DHCP", "Static", "Static-Range", "Address-Pool"]}
                                  disabled={dhcp_only}
                                  value={deployServerSettings['hostIPAssignmentMode']}
                                  onChange={this.handleNetworkSettings}
                />
              </FormField>
              <FormField htmlFor="networks" label='Environment'>
                <Select placeholder="User Specified"
                        options={screenData['envList']}
                        value={deployServerSettings['selectedEnv']}
                        labelKey="name"
                        disabled={dhcp_only}
                        valueKey={{ key: 'name', reduce: false }}
                        onChange={this.handleEnvSelection} />
              </FormField>
            </Box>
          <br/>
          {common_network_settings}
          <br/>
        </Box>
        <Box gridArea='hosts' justify='start' align={"start"} >
          <Form>
            <Heading level={5} size="small" strong={true}>Hosts</Heading>
              <Box justify='start' align='start' gap='small' pad='small' elevation='medium'>
                <Button icon={<AddIcon />} primary gap='xsmall' size='small' label='Add Host' a11yTitle={`Add Host`} onClick={this._addHost} />
                {layerAddHost}
                {hoststable}
              </Box>
          </Form>
        </Box>

        <Box gridArea='footer'>
          <Footer pad={{vertical: 'medium'}} justify="between">
            <Button label='Next'
                    type='submit'
                    primary={true}
                    onClick={this.handleNext}
            />
            <Button label='Prev'
                    primary={false}
                    onClick={this.handleBack}
            />
            <Button label='Cancel'
                    primary={false}
                    onClick={this.handleCancel}
            />
          </Footer>
        </Box>
      </Grid>
    );
  }
}

DeployScreen.defaultProps = {
  error: undefined,
  deployServerSettings: {},
  screenData: {},
};

DeployScreen.propTypes = {
  dispatch: PropTypes.func.isRequired,
  error: PropTypes.object,
  deployServerSettings: PropTypes.object,
  screenData: PropTypes.object
};

DeployScreen.contextTypes = {
  intl: PropTypes.object
};

// const select = state => ({ ...state.deployservers });
const select = state => ({ deployServerSettings: state.deployservers.deployServerSettings, screenData: state.deployservers.screenData });

export default connect(select)(DeployScreen);
