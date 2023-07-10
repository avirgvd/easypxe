/**
 * Created by avireddi on 12/18/2021.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Add as AddIcon, Trash as DeleteIcon, StatusWarning } from 'grommet-icons';
import {
    Anchor,
    Box,
    Button,
    Footer,
    FormField,
    Form,
    Header,
    Heading,
    CheckBox,
    Table,
    TableRow,
    TextInput,
    RadioButton,
    Select,
    RadioButtonGroup, DataTable, Layer, Grid, TableCell, TableHeader, TableBody
} from 'grommet';

import {
    saveDeploymentSettings, loadOSPackages, loadScripts, unloadDeployServers, loadNetworks_Success, saveScreenData
} from '../actions/deployservers';

import { pageLoaded } from './utils';
import {getRESTApi, postRESTApi} from "../api/server-rest";
import IPAddressInput from "../components/IPAddressInput";
import deployservers from "../reducers/deployservers";
import DeployScreen from "../components/deployscreens/DeployScreen";

class DeployVM extends Component {

    constructor(props) {

        super(props);

        this.state = {
            activeState: 4,

            deployServerSettings: {
                deploymentMode: 'vm',
                rmDetails: {
                    virtType: {},
                    virtMgr: {},
                    virtMgrsList: [],
                    vcenterDCs: [],
                    vcenterClusters: [],
                    vcenterHosts: [],
                    vcenterDC: {},
                    vcenterCluster: {},
                    vcenterHost: {},
                },
                hostIPAssignmentMode: "Static-Range",
                startIPRange: "",
                endIPRange: "",
                commonOSConfig: {},
                selectedEnv: {mgmtNetwork: {}},
                envList: [],
            },
            screenData: {},
            errors: {},
            isbulk: false,
            addhost: false,
            newhostdata:  { serverprofile: "", hostname: "", ipaddr: ''},
            hostsdata: [],
        };

        this.getHostsTable = this.getHostsTable.bind(this);
        this.onIPAddrInput = this.onIPAddrInput.bind(this);
        this.handleEnvSelection = this.handleEnvSelection.bind(this);
        this.handleNetworkSettings = this.handleNetworkSettings.bind(this);
        this.handleVCenterCluster = this.handleVCenterCluster.bind(this);
        this.handleDC = this.handleDC.bind(this);
        this.handleVirtMgr = this.handleVirtMgr.bind(this);
        this.handleVirtType = this.handleVirtType.bind(this);
        this.handleNext = this.handleNext.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleBack= this.handleBack.bind(this);
        this._addHost = this._addHost.bind(this);
        this._deleteHost = this._deleteHost.bind(this);
        this.handleCancelAddHost = this.handleCancelAddHost.bind(this);
        this.handleAddHost = this.handleAddHost.bind(this);
        this._onTextInput = this._onTextInput.bind(this);
        this._onBulkDeploymentCheck = this._onBulkDeploymentCheck.bind(this);
        this._handleHostDetailsChange = this._handleHostDetailsChange.bind(this);

    }

    componentDidMount() {
        pageLoaded('DeployVM');
        //console.log("DeployVM: componentDidMount: ", this.props.deployServerSettings)
        // this.setState({saveDeploymentSettings: this.props.deployServerSettings});
        // let list = this.loadNetworks();
    }

    componentWillUnmount() {
        //console.log("DeployVM: componentWillUnmount: ")
        // this.props.dispatch(unloadDeployServers());
    }

    handleNetworkSettings(event) {
        //console.log("handleNetworkSettings: ", event.target.value)
        let deployServerSettings = {...this.props.deployServerSettings};
        deployServerSettings['hostIPAssignmentMode'] = event.target.value;
        this.props.dispatch(saveDeploymentSettings(deployServerSettings));
    }

    handleVirtType(event) {
        // this.props.dispatch(updateScreenData("screenData", "selectedOSP", event.option));
        //console.log("handleVirtType: event: ", event)

        let url = '/rest/rm/list' + "?type=" + event.value['type'];
        getRESTApi(url)
          .then((response) => {
              //console.log("handleVirtType: get RM: ", response);
              //console.log("handleVirtType: get RM response.result: ", response.result);
              let deployServerSettings = {...this.props.deployServerSettings};
              deployServerSettings['rmDetails']['virtMgrsList'] = response.result;
              this.props.dispatch(saveDeploymentSettings(deployServerSettings));

          })
          .catch((err) => {
              //console.log("handleVirtType: get RM err: ", err);
              let deployServerSettings = {...this.props.deployServerSettings};
              deployServerSettings['rmDetails']['virtMgrsList'] = [];
              this.props.dispatch(saveDeploymentSettings(deployServerSettings));
          })

        let deployServerSettings = {...this.props.deployServerSettings};
        deployServerSettings['rmDetails']['virtType'] = event.value;
        this.props.dispatch(saveDeploymentSettings(deployServerSettings));
        // this.setState({virtType: event.value})
    }

    handleEnvSelection(event) {
        //console.log(event.value);
        let deployServerSettings = {...this.props.deployServerSettings};
        deployServerSettings['selectedEnv'] = event.value;
        this.props.dispatch(saveDeploymentSettings(deployServerSettings));
        // this.setState({selectedEnv: event.value})
    }

    handleVirtMgr(event) {
        // this.props.dispatch(updateScreenData("screenData", "selectedOSP", event.option));
        let url = '/rest/rm/' + event.value['alias'];
        let body = {
            query: {field: "datacenters"},
            filter: [{field: "datacenters", value: ""}]
        };

        // Get VCenter DataCenters
        postRESTApi(url,body)
          .then((response) => {
              console.log("handleVirtMgr: get RM: ", response);
              console.log("handleVirtMgr: get RM response.result: ", response.result);
              let deployServerSettings = {...this.props.deployServerSettings};
              deployServerSettings['rmDetails']['vcenterDCs'] = response.result;
              this.props.dispatch(saveDeploymentSettings(deployServerSettings));
              // this.props.dispatch(saveDeploymentSettings(deployServerSettings));
              // this.setState({vcenterDCs: response.result})

          })
          .catch((err) => {
              //console.log("handleVirtType: get RM err: ", err);
              let deployServerSettings = {...this.props.deployServerSettings};
              deployServerSettings['rmDetails']['vcenterDCs'] = [];
              this.props.dispatch(saveDeploymentSettings(deployServerSettings));
          })


        let deployServerSettings = {...this.props.deployServerSettings};
        deployServerSettings['rmDetails']['virtMgr'] = event.value;
        this.props.dispatch(saveDeploymentSettings(deployServerSettings));
        // this.setState({virtMgr: event.value})
    }

    handleDC(event) {
        // Get clusters under DC
        let url = '/rest/rm/' + this.props.deployServerSettings.rmDetails.virtMgr['alias'];
        let body = {
            query: {field: "clusters"},
            filter: [{field: "datacenters", value: event.value['name']}]
        };

        postRESTApi(url,body)
          .then((response) => {
              //console.log("handleVirtMgr: get RM: ", response);
              //console.log("handleVirtMgr: get RM response.result: ", response.result);
              let deployServerSettings = {...this.props.deployServerSettings};
              deployServerSettings['rmDetails']['vcenterClusters'] = response.result;
              this.props.dispatch(saveDeploymentSettings(deployServerSettings));
              // this.setState({vcenterClusters: response.result});
          })
          .catch((err) => {
              //console.log("handleVirtType: get RM err: ", err);
              let deployServerSettings = {...this.props.deployServerSettings};
              deployServerSettings['rmDetails']['vcenterClusters'] = [];
              this.props.dispatch(saveDeploymentSettings(deployServerSettings));
          })

        body = {
            query: {field: "vmtemplates"},
            filter: [{field: "datacenters", value: ""}]
        };
        // Get VM Templates
        postRESTApi(url,body)
          .then((response) => {
              //console.log("handleVirtMgr: get RM: ", response);
              //console.log("handleVirtMgr: get Templates response.result: ", response.result);
              let deployServerSettings = {...this.props.deployServerSettings};
              deployServerSettings['rmDetails']['vcenterVMTemplates'] = response.result;
              this.props.dispatch(saveDeploymentSettings(deployServerSettings));
              // this.props.dispatch(saveDeploymentSettings(deployServerSettings));
              // this.setState({vcenterDCs: response.result})

          })
          .catch((err) => {
              //console.log("handleVirtType: get RM err: ", err);
              let deployServerSettings = {...this.props.deployServerSettings};
              deployServerSettings['rmDetails']['vcenterVMTemplates'] = [];
              this.props.dispatch(saveDeploymentSettings(deployServerSettings));
          })


        let deployServerSettings = {...this.props.deployServerSettings};
        deployServerSettings['rmDetails']['vcenterDC'] = event.value;
        this.props.dispatch(saveDeploymentSettings(deployServerSettings));
        // this.setState({vcenterDC: event.value})
    }

    handleVCenterCluster(event) {
        // Get clusters under DC
        let url = '/rest/rm/' + this.props.deployServerSettings.rmDetails.virtMgr['alias'];
        let body = {
            query: {field: "hosts"},
            filter: [
                {field: "datacenters", value: this.props.deployServerSettings.rmDetails.vcenterDC['name']},
                {field: "clusters", value: event.value['name']},
            ]
        };

        postRESTApi(url,body)
          .then((response) => {
              //console.log("handleVirtMgr: get RM: ", response);
              //console.log("handleVirtMgr: get RM response.result: ", response.result);
              let deployServerSettings = {...this.props.deployServerSettings};
              deployServerSettings['rmDetails']['vcenterHosts'] = response.result;
              this.props.dispatch(saveDeploymentSettings(deployServerSettings));
              // this.setState({vcenterHosts: response.result})
          })
          .catch((err) => {
              //console.log("handleVirtType: get RM err: ", err);
              let deployServerSettings = {...this.props.deployServerSettings};
              deployServerSettings['rmDetails']['vcenterHosts'] = [];
              this.props.dispatch(saveDeploymentSettings(deployServerSettings));
              // this.setState({vcenterHosts: []})
          })

        let deployServerSettings = {...this.props.deployServerSettings};
        deployServerSettings['rmDetails']['vcenterCluster'] = event.value;
        this.props.dispatch(saveDeploymentSettings(deployServerSettings));
        // this.setState({vcenterCluster: event.value})
    }


    handleClose(event, reason) {
        if (reason === 'clickaway') {
            return;
        }
        this.setState({isFail: false, isSuccess: false});
    }

    handleNext() {
        //console.log("DeployVM: handleSubmit: this.state.activeState: ", this.state.activeState);
        //console.log("this.props.deployServerSettings: ", this.props.deployServerSettings);

        let data = { ...this.props.deployServerSettings};
        data['rmDetails'] = this.props.deployServerSettings['rmDetails'];

        this.props.dispatch(saveDeploymentSettings(data));

        this.props.onNext(this.state.activeState);
    }

    handleBack() {
        //console.log("DeployVM: handleBack: this.state.activeState: ", this.state.activeState);
        // This will navigate the page to previous page
        this.props.onBack(this.state.activeState);
    }

    handleCancel() {
        this.props.onCancel();
    }

    _onTextInput (event) {

        //console.log("_onInput: ", event.target.value);

        const attribute = event.target.getAttribute('id');

        const value = event.target.value;

        var data = { ...this.props.deployServerSettings};

        if(data['selectedEnv']['networkName'] !== "User Defined") {
            data['selectedEnv']['networkName'] = "User Defined";
        }

        if(attribute === 'subnetmask') {
            data['selectedEnv']['netmask'] = value;

        }
        else if(attribute === 'gateway') {
            data['selectedEnv']['gateway'] = value;
        }
        else if(attribute === 'dns') {
            data['selectedEnv']['dns'] = value;
        }
        else if(attribute === 'vlan') {
            data['selectedEnv']['vlan'] = value;
        }

        //console.log("_onInput: data: ", data);

        this.props.dispatch(saveDeploymentSettings(data));
    }

    _onBulkDeploymentCheck (event) {
        this.setState({ ...this.state, "isbulk": event.target.checked });
    }

    _handleHostDetailsChange(event){
        //console.log("handleHostDetails: event.target: ")
        //console.log("handleHostDetails: event.target: ", event.target.value)
        //console.log("handleHostDetails: event.target: ", event.target.id)
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

        //console.log("handleHostDetails: updating the host: ", host)
        this.setState({newhostdata: host});
    }

    _addHost(event) {
        //console.log("DeployVM: _addHost: ", this.state.newhostdata);

        this.setState({addhost: true, newhostdata: {}});
    }


    onIPAddrInput(event) {
        //console.log("onIPAddrInput: ", event)
        let data = this.props.deployServerSettings;

        if ( event.target.name === "start_ip" ){
            data['startIPRange'] = event.target.value;
        }
        else if ( event.target.name === "end_ip" ){
            data['endIPRange'] = event.target.value;
        }

        this.setState({deployServerSettings: data});

    }

    _renderLayer () {
        let addHostControls = "";
        let iloPasswordMismatch;

        if (this.state.addhost === true) {

            let heading = "Add Host";

            addHostControls =
              // <DeploymentAddHost onClose={this._onLayerClose}
              <DeploymentAddHost
                deployServerSettings={this.props.deployServerSettings}
                heading={heading}
                handleAddHost={this.handleAddHost}
                handleCancelAddHost={this.handleCancelAddHost}
              />
        }

        return addHostControls;
    }

    handleCancelAddHost(event) {
        //console.log("handleCancelAddHost");
        this.setState({addhost: false});
    }

    handleAddHost(event, newhostdata) {
        //console.log("handleAddHost: newhostdata: ", newhostdata);

        let deplSettings = {...this.props.deployServerSettings};
        let hosts = deplSettings.hostsdata;
        let newhost = {...newhostdata};
        hosts.push(newhost);
        deplSettings['hostsdata'] = hosts;
        //console.log("handleAddHost: adding the hosts: ", hosts);
        this.props.dispatch(saveDeploymentSettings(deplSettings));
        this.setState({addhost: false});

    }

    _deleteHost(name) {

        // if(this.state.deleteHostConfirmDlg === false) {
        //   // On delete, show the delete confirmation dialog first
        //   this.setState({ deleteHostConfirmDlg: true })
        // }
        // else{
        // The input param 'name' will have serverprofile value for the selected hosts item
        //console.log("DeployServersBMC: _deleteHost: ", name);
        let deplSettings = {...this.props.deployServerSettings};
        let hosts = deplSettings.hostsdata;

        const updatedhosts = hosts.filter(host => host.bmcIPAddr !== name);

        deplSettings['hostsdata'] = updatedhosts;
        this.props.dispatch(saveDeploymentSettings(deplSettings));
        this.setState({deleteHostConfirmDlg: false})

        // }

    }

    getHostsTable(deployServerSettings){
        console.log("getHostsTable: ", deployServerSettings)

        let hoststablerows = deployServerSettings['hostsdata'].map((row, index) => (
          <TableRow key={index}>
              <TableCell>
                  {row.hostName}
              </TableCell>
              <TableCell>
                  {row.ipAddr}
              </TableCell>
              <TableCell>
                  <Button id="567" icon={<DeleteIcon />}
                          onClick={this._deleteHost.bind(this, row.bmcIPAddr)}
                          href='#' />
              </TableCell>
          </TableRow>
        ));

        let hoststable = (
          <Box fill align="start" pad="small">
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableCell>
                              Hostname
                          </TableCell>
                          <TableCell>
                              IP Address
                          </TableCell>
                          <TableCell>

                          </TableCell>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {hoststablerows}
                  </TableBody>
              </Table>
          </Box>
        );

        return hoststable;
    }

    render() {
        console.log("render: DeployVM: this.props: ", this.props);
        //console.log("render: DeployVM: this.state: ", this.state);
        const {error, deployServerSettings, screenData} = this.props;

        const { intl } = this.context;

        let layerAddHost = this._renderLayer();
        let columns=([
            {"header":"Hostname","property":"hostName"},
            {"header":"Host IP","property":"ipAddr"}
        ]);
        let data = [
            {
                bmcIPAddr: "",
                hostName: "",
                ipAddr: ""
            }
        ]
        if (deployServerSettings.hostsdata.length > 0)
        {
            data = deployServerSettings.hostsdata.map((item, index) => (
              {
                  hostName: item.hostName,
                  ipAddr: item.ipAddr
              }
            ));
        }
        let hostsTable = (<DataTable
          columns={columns}
          gap="xsmall"
          pad="small"
          data={data}
        />);

        const layer = (this.state.deleteHostConfirmDlg)
          ? <Layer closer={false}
                   flush={false}
                   overlayClose={false}
                   align='top'
                   onClose={this._deleteHost}>
              <span style={{margin: '50px'}}></span>
          </Layer>
          : null;

        const hypervisors = [
            {type: "vcenter", label: "VMware vCenter"},
            {type: "esxi", label: "VMware ESXi"},
            {type: "hyperv", label: "Windows Hyper-V"},
            {type: "scvmm", label: "Microsoft SCVMM"}
        ]

        let method_fields = (
              <div>
                  <Heading level={5} size="small" strong={true}>Virtualization</Heading>
                  <Box justify='start' direction='column' align='stretch' gap='medium' pad='small' elevation='medium' responsive wrap>
                  <Box justify='start' align='start' direction='row' gap='medium' pad='small' responsive wrap>
                      <FormField label='Virtualization Type'>
                          <Select placeHolder="Select"
                                  options={hypervisors}
                                  value={deployServerSettings.rmDetails.virtType}
                                  labelKey="label"
                                  valueKey={{ key: 'type', reduce: false }}
                                  onChange={this.handleVirtType} />
                      </FormField>
                      <FormField label='Virtualization Manager'>
                          <Select placeHolder="Select"
                                  options={deployServerSettings.rmDetails.virtMgrsList}
                                  value={deployServerSettings.rmDetails.virtMgr}
                                  labelKey="alias"
                                  valueKey={{ key: 'alias', reduce: false }}
                                  onChange={this.handleVirtMgr} />
                      </FormField>
                      <br/>

                  </Box>
                  {deployServerSettings.rmDetails.virtMgr['rmType'] == 'vcenter' && (
                    <Box justify='start' align='start' direction='row' gap='medium' pad='small' responsive wrap>
                        <FormField label='Select VCenter Data Center'>
                            <Select placeHolder="Select"
                                    options={deployServerSettings.rmDetails.vcenterDCs}
                                    value={deployServerSettings.rmDetails.vcenterDC}
                                    labelKey="name"
                                    valueKey={{ key: 'name', reduce: false }}
                                    onChange={this.handleDC} />
                        </FormField>
                        <FormField label='Select VCenter Cluster'>
                            <Select placeHolder="Select"
                                    options={deployServerSettings.rmDetails.vcenterClusters}
                                    value={deployServerSettings.rmDetails.vcenterCluster}
                                    labelKey="name"
                                    valueKey={{ key: 'name', reduce: false }}
                                    onChange={this.handleVCenterCluster} />
                        </FormField>
                    </Box>
                  )}
                  {deployServerSettings.rmDetails.virtMgr['rmType'] == 'vcenter' && (
                  <Box justify='start' align='start' direction='row' gap='medium' pad='small' responsive wrap>
                  <FormField label='Select Target ESXi Host'>
                      <Select placeHolder="Select"
                              options={deployServerSettings.rmDetails.vcenterHosts}
                              value={deployServerSettings.rmDetails.vcenterHost}
                              labelKey="name"
                              valueKey={{ key: 'name', reduce: false }}
                              onChange={({ option }) => {
                                  let deployServerSettings = {...this.props.deployServerSettings};
                                  //console.log(deployServerSettings)
                                  deployServerSettings['rmDetails']['vcenterHost'] = option;
                                  this.props.dispatch(saveDeploymentSettings(deployServerSettings));
                              }} />
                  </FormField>
                  <FormField label='VM Template'>
                      <Select placeHolder="Select"
                              options={deployServerSettings.rmDetails.vcenterVMTemplates}
                              value={deployServerSettings.rmDetails.vcenterVMTemplate}
                              labelKey="name"
                              valueKey={{ key: 'name', reduce: false }}
                              onChange={({ option }) => {
                                  let deployServerSettings = {...this.props.deployServerSettings};
                                  //console.log(deployServerSettings)
                                  deployServerSettings['rmDetails']['vcenterVMTemplate'] = option;
                                  this.props.dispatch(saveDeploymentSettings(deployServerSettings));
                              }} />
                  </FormField>
                </Box>
                  )}
                  </Box>
              </div>
            );

        return (
          <DeployScreen
            heading={'VM Deployment'}
            onNext={this.handleNext}
            onBack={this.handleBack}
            onCancel={this.handleCancel}
            getHostsTable={this.getHostsTable}
          >
              {method_fields}
              <br/>
          </DeployScreen>
        );
    }
}

DeployVM.defaultProps = {
    error: undefined,
    deployServerSettings: {},
    screenData: {}
};

DeployVM.propTypes = {
    dispatch: PropTypes.func.isRequired,
    error: PropTypes.object,
    deployServerSettings: PropTypes.object,
    screenData: PropTypes.object
};

DeployVM.contextTypes = {
    intl: PropTypes.object
};

// const select = state => ({ ...state.deployservers });
const select = state => ({ deployServerSettings: state.deployservers.deployServerSettings, screenData: state.deployservers.screenData });

export default connect(select)(DeployVM);
