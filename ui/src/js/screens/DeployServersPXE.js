/**
 * Created by avireddi on .
 */
import React, {Component, useState} from 'react';
import { PropTypes } from 'prop-types';
import {connect} from 'react-redux';
import {
  Clear,
  Add as AddIcon,
  Gremlin,
  More,
  Trash as DeleteIcon,
  StatusCritical,
  FormClose,
  StatusGood
} from 'grommet-icons';
import {
  Box,
  Button,
  CheckBox,
  FormField,
  List,
  Table,
  TableBody,
  TableHeader,
  TableCell,
  TableRow,
  Text,
  Heading,
  Grid,
  Header,
  RadioButtonGroup,
  Form,
  Footer,
  Tip,
  Spinner,
  Select,
  NameValueList,
  NameValuePair,
  Notification, Layer
} from 'grommet';
import "../components/IPAddressInput";

import {
  saveDeploymentSettings, loadOSPackages, loadEthIfaces, getData
} from '../actions/deployservers';

import {pageLoaded} from './utils';
import PXEBootItem from "../components/deployscreens/PXEBootItem";
import IPAddressInput from "../components/IPAddressInput";
import {postRESTApi} from "../api/server-rest";
import {isJSONEmpty} from "../api/utils";

class DeployServersPXE extends Component {

  constructor(props) {

    super(props);

    this.state = {
      // localstorageconfiguration: false,
      notifLayerOpen: false,
      deleteAllLD: true,
      activeState: 6,
      validationError: "",
      // PXE Service State
      ethIfaces: [],
      // selectedEthIface: "",
      // startIPRange: "",
      // endIPRange: "",
      errors: {},
      notification: {'title': '', 'status': 'normal', 'msg': ''}, // 'status' param should have value compatibile with Notification control
      errorMsg: "",
      action: 'list',
      showItem: -1,
      pxeConf: {
        pxeServiceStatus: false,
        enableDHCP: true,
        network: {
          'reapply': false,
          'iface': '',
          'addr': '',
          'netmask': '',
          'broadcast': '',
          'gateway': '',
          'dhcpIPRange': {
            'startIPRange': '',
            'endIPRange': ""
          }
        },
        bootItems: [],
      },

      deleteHostConfirmDlg: false
    };

    this.onDHCPCheck = this.onDHCPCheck.bind(this);
    this.showItem = this.showItem.bind(this);
    this.validate = this.validate.bind(this);
    this.onSelectEthIface = this.onSelectEthIface.bind(this);
    this.onApplyPXEConf = this.onApplyPXEConf.bind(this);
    this.onIPAddrInput = this.onIPAddrInput.bind(this);
    this.onPXEServiceToggle = this.onPXEServiceToggle.bind(this);
    this._renderNotifLayer = this._renderNotifLayer.bind(this);
    this._renderLayer = this._renderLayer.bind(this);
    this.onAddPXEItem = this.onAddPXEItem.bind(this);
    this.handlePXEItem = this.handlePXEItem.bind(this);
    this.handleDeletePXEItem = this.handleDeletePXEItem.bind(this);
    this.handleCancelLayer = this.handleCancelLayer.bind(this);
    this.onCheck = this.onCheck.bind(this);
    this.onOrder = this.onOrder.bind(this);
    this.getPXEBootItemsTable = this.getPXEBootItemsTable.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.onCloseNotifLayer = this.onCloseNotifLayer.bind(this);
  }

  componentDidMount() {
    pageLoaded('DeployServersPXE');

    getData("/rest/pxe/conf", (res, err) => {
      console.log(res);
      if(res['error'].hasOwnProperty('msg'))
        this.setState({notifLayerOpen: true, notification: {'title': 'Loading PXE Configuration', 'status': 'critical', 'msg': res['error']['msg']}});
      if (!isJSONEmpty(res['result'])) {
        console.log(Object.keys(res['result']).length);
        this.setState({pxeConf: res['result']})
      }
    });

    getData("/rest/pxe/ifaces", (res, err) => {
      this.setState({"ethIfaces": res['data']})
    } );
  }

  componentWillUnmount() {
    //console.log("DeployServersPXE: componentWillUnmount: ")
  }

  handleCancel() {
    // console.log('clicked');
    // this.setState({open: true});
    this.props.onCancel();
  }


  onOrder(e){
    console.log("On Order: e: ", e);

    let pxe_conf = {...this.state.pxeConf};
    pxe_conf['bootItems'] = e.map((item, index) => {item['bootOrderId'] = index; return item});

    this.setState({"pxeConf": pxe_conf})
  }

  onCheck(event, value){
    console.log("onCheck event: ", event);
    console.log("onCheck value: ", value);

    let pxe_conf = {...this.state.pxeConf};

    let new_list = pxe_conf.bootItems.map(item => {
      console.log(item)

      if(item.bootOrderId === value.bootOrderId) {
        item.show = !item.show
        return item
      }
      else{
        return item
      }
    });

    pxe_conf['bootItems'] = new_list;

    this.setState({"pxeConf": pxe_conf});
  }

  getPXEBootItemsTable(){
    console.log("getHostsTable: ")

    let boot_table = (
        <List data={this.state.pxeConf.bootItems} onOrder={this.onOrder} >
          {(datum) => (
              <Tip content={datum.state} dropProps={{ align: { left: 'right' } }}>
                <Box direction="row-responsive" gap="medium" align="center">
                  <CheckBox disabled={datum.hasOwnProperty('delete')? true:false} key={datum} checked={datum.show} onChange={(e) => this.onCheck(e, datum)}/>
                  <Button label={"View"} id={datum.bootOrderId} onClick={() => {
                    this.showItem(datum.bootOrderId, datum)
                  }}/>
                  {(datum.hasOwnProperty("delete")) && (<Text color="grey" weight="lighter">{datum.displayText}</Text>)}
                  {(!datum.hasOwnProperty("delete")) && (<Text weight="bold">{datum.displayText}</Text>)}
                </Box>
              </Tip>
          )}
        </List>
    );

    return boot_table;
  }

  onAddPXEItem(){
    console.log("onAddPXEItem")
    this.setState({"action": 'add'})
  }

  handleDeletePXEItem(bootEntry){
    console.log("handleDeletePXEItem: ", bootEntry);
    let ordered_list = [];

    ordered_list = this.state.pxeConf.bootItems.map((item, index) => {
      if(item['bootOrderId'] == bootEntry['bootOrderId']){
        bootEntry['delete'] = true;
        bootEntry['show'] = false;
        return bootEntry;
      }
      else return item;
    });

    let pxeConf = {...this.state.pxeConf};
    pxeConf['bootItems'] = ordered_list;

    this.setState({"showItem": -1,"action": 'list', "pxeConf": pxeConf});
  }

  handlePXEItem(bootEntry){
    console.log("handlePXEItem: ", bootEntry);
    console.log("handlePXEItem: this.state.action ", this.state.action);

    let ordered_list = [];

    if(this.state.action == 'add'){
      let count = this.state.pxeConf.bootItems.length

      let new_boot_entry = {
        "displayText": bootEntry.displayText,
        "osPackage": bootEntry.osPackage,
        "kickstart": bootEntry.kickstart,
        "driversPack": bootEntry.driversPack,
        "show": true,
        "bootOrderId": count
      }

      ordered_list = this.state.pxeConf.bootItems;
      ordered_list.push(new_boot_entry);
    }
    else if(this.state.action == 'edit'){
      console.log("To edit: ", bootEntry)
      console.log("To edit to: ", this.state.pxeConf)

      ordered_list = this.state.pxeConf.bootItems.map((item, index) => {
        if(item['bootOrderId'] == bootEntry['bootOrderId'])
          return bootEntry
        else return item;
      });
    }

    let pxeConf = {...this.state.pxeConf};
    pxeConf['bootItems'] = ordered_list;

    this.setState({"showItem": -1,"action": 'list', "pxeConf": pxeConf});
  }

  handleCancelLayer(){
    this.setState({action: 'list', showItem: -1})
  }

  onCloseNotifLayer(){
    this.setState({notifLayerOpen: false})
  }
  _renderNotifLayer(){
    console.log(this.state)
    // If notification close clicked, notifLayerOpen will be set to false. then dont show layer
    if(!this.state.notifLayerOpen)
      return ""

    if(this.state.notification.status === "normal") {
      return (
          <Layer
              position="bottom"
              modal={false}
              margin={{ vertical: 'medium', horizontal: 'small' }}
              onEsc={this.onCloseNotifLayer}
              responsive={false}
              plain
          >
            <Box
                align="center"
                direction="row"
                gap="small"
                justify="between"
                round="medium"
                elevation="medium"
                pad={{ vertical: 'xsmall', horizontal: 'small' }}
                background="status-ok"
            >
              <Box align="center" direction="row" gap="xsmall">
                <StatusGood />
                <Text>
                  {this.state.notification.msg}
                </Text>
              </Box>
              <Button icon={<FormClose />} onClick={this.onCloseNotifLayer} plain />
            </Box>
          </Layer>)
    }
    else {
      return (
          <Layer
              position="bottom"
              modal={false}
              margin={{ vertical: 'medium', horizontal: 'small' }}
              onEsc={this.onCloseNotifLayer}
              responsive={false}
              plain
          >
            <Box
                align="center"
                direction="row"
                gap="small"
                justify="between"
                round="medium"
                elevation="medium"
                pad={{ vertical: 'xsmall', horizontal: 'small' }}
                background="status-critical"
            >
              <Box align="center" direction="row" gap="xsmall">
                <StatusCritical />
                <Text>
                  {this.state.notification.msg}
                </Text>
              </Box>
              <Button icon={<FormClose />} onClick={this.onCloseNotifLayer} plain />
            </Box>
          </Layer>)
    }
  }

  _renderLayer () {
    console.log("_renderLayer: : ", this.state)
    let layer = "";

    if (this.state.action === 'add') {
      layer = (
          <PXEBootItem
              action={"add"}
              handleAdd={this.handlePXEItem}
              handleCancel={this.handleCancelLayer}
          />
      );
    }
    else if (this.state.action === 'edit') {
      if(this.state.showItem < 0) {
        console.log("Invalid value to this.state.showItem: ", this.state.showItem);
        return undefined
      }

      layer = (
          <PXEBootItem
              action={"edit"}
              item={this.state.pxeConf.bootItems[this.state.showItem]}
              handleAdd={this.handlePXEItem}
              handleDelete={this.handleDeletePXEItem}
              handleCancel={this.handleCancelLayer}
          />
      );
    }

    return layer;
  }

  onPXEServiceToggle(event){
    console.log(event.target.checked)
    let pxe_conf = {...this.state.pxeConf}
    pxe_conf['pxeServiceStatus'] = event.target.checked;
    this.setState({"pxeConf": pxe_conf})

    let status = event.target.checked? "START": "STOP"
    let url = "/rest/pxe/service"
    postRESTApi(url, {"request": "statusChange", "status": status} )
        .then((response) => {

        })
        .catch((err) => {
          console.log(err)
        })
  }

  onIPAddrInput(event) {

    let pxe_conf = this.state.pxeConf

    if ( event.target.name === "start_ip" ){
      pxe_conf['network']['dhcpIPRange']['startIPRange'] = event.target.value;
      // this.setState({'startIPRange': event.target.value});
    }
    else if ( event.target.name === "end_ip" ){
      pxe_conf['network']['dhcpIPRange']['endIPRange'] = event.target.value;
      // this.setState({'endIPRange': event.target.value});
    }

    this.setState({'pxeConf': pxe_conf});
  }

  // 'addr': '',
  // 'netmask': '',
  // 'broadcast': '',
  // 'gateway': '',
  // 'dhcpIPRange': {
  //   'startIPRange': '',
  //   'endIPRange': ""
  // }
  validate(data){
    console.log("Validation: ", data)
    let network = data['network']
    // throw "Fake validation error"
    if (network['iface'] == ''){
      throw "Ethernet interface not specified"
    }
    else if (network['addr'] === ''){
      throw "IP address not found"
    }
    else if (network['netmask'] === ''){
      throw "Netmask not found"
    }
    else if (network['gateway'] === ''){
      throw "Network gateway address not found"
    }
    else if (network['broadcast'] === ''){
      throw "Network broadcast address not found"
    }
    else if (data['enableDHCP'] === true && network['dhcpIPRange']['startIPRange'] === ''){
      throw "DHCP IP range start not specified"
    }
    else if (data['enableDHCP'] === true && network['dhcpIPRange']['endIPRange'] === ''){
      throw "DHCP IP range end not specified"
    }
  }

  onApplyPXEConf(event, reApply=false){

    console.log("onApplyPXEConf: ", this.state.pxeConf);
    this.state.notifLayerOpen = false;

    let pxe_conf = this.state.pxeConf;

    try{
      this.validate(pxe_conf)
      this.setState({"notification": {'title': '', 'msg': ''}});
    }
    catch (ex){
      console.log("onApplyPXEConf: exception: ", ex)
      this.setState({notifLayerOpen: true, notification: {'title': 'Validation Error', 'status': 'critical', 'msg': ex}});
      return;
    }

    if(reApply){
      const res = confirm("Re-apply PXE configuration will delete existing PXE service and create from scratch. \n\nAre you sure?")
      console.log(res)
      if(!res)
        return;
    }

    pxe_conf['reapply'] = reApply;

    console.log("PXE Conf: ", pxe_conf);

    let url = "/rest/pxe/conf"
    postRESTApi(url, pxe_conf )
        .then((response) => {
          console.log("response: ", response)
          if(response['error'].hasOwnProperty('msg'))
            this.setState({notifLayerOpen: true, notification: {'title': 'Apply PXE Configuration', 'status': 'critical', 'msg': response['error']['msg']}});
          if(!isJSONEmpty(response['result']))
            this.setState({notifLayerOpen: true, pxeConf: response['result'],
              notification: {'title': 'Apply PXE Configuration', 'status': 'normal', 'msg': 'Successfully applied PXE configuration'}})
        })
        .catch((err) => {
          console.log(err)
        })
  }

  render() {
    // console.log("render: DeployServersPXE: this.props: ", this.props);
    // console.log("render: DeployServersPXE: this.state: ", this.state);

    let layerAddPXEItem = this._renderLayer();

    let layerErrorMsg = this._renderNotifLayer()

    const boot_items_table = this.getPXEBootItemsTable()

    return (
        <Box id="top2" fill align="start" flex="grow" justify="start" direction="column" pad="large">
        <Grid id="pxedepl"
              alignContent='start'
              responsive={true} justify="stretch"
              rows={['auto', 'auto', 'auto', 'auto', 'auto', 'auto']}
              columns={['auto', 'auto']}
              gap={"small"}
              areas={[
                { name: 'header', start: [0, 0], end: [1, 0] },
                { name: 'method-fields', start: [0, 1], end: [1, 1] },
                { name: 'os-fields', start: [0, 2], end: [1, 2] },
                { name: 'common-fields', start: [0, 3], end: [1, 3] },
                { name: 'hosts', start: [0, 4], end: [1, 4] },
                { name: 'footer', start: [0, 5], end: [1, 5] },
              ]}
        >
          {layerErrorMsg}
          {layerAddPXEItem}
          <Box gridArea="header">
            <Header direction={"column"} align={"stretch"} gap={"xsmall"} >
              <Heading level={4} size="small" strong={true}>Setup PXE Service</Heading>

            </Header>
          </Box>
          <Box gridArea='method-fields' justify='end' align={"end"} >
            <Box direction="row" align='center' gap='small' justify='center' pad={"small"} round='small'
                 background={{'color': 'brand'}}>
              {this.state.pxeConf.pxeServiceStatus && (
                  <Spinner
                      border={[
                        {side: 'all', color: 'white', size: 'medium'},
                        {side: 'right', color: 'brand', size: 'medium'},
                        {side: 'top', color: 'white', size: 'medium'},
                        {side: 'left', color: 'brand', size: 'medium'},
                      ]}
                  />
              )}
              {!this.state.pxeConf.pxeServiceStatus && (<Clear />)}
              <Text label='PXE Service' size='medium' weight='bold'
                    disabled={this.state.pxeConf.pxeServiceStatus}
              >PXE Service</Text>
              <CheckBox
                  label={this.state.pxeConf.pxeServiceStatus? "On": "Off"}
                  checked={this.state.pxeConf.pxeServiceStatus}
                  onChange={this.onPXEServiceToggle}
                  toggle
              />
            </Box>
          </Box>
          <Box  gridArea='common-fields'>
            {(this.state.notification.msg !== "") && (<Notification status={this.state.notification.status} title={this.state.notification.title} message={this.state.notification.msg}/>)}
            <Heading level={5} size="small" strong={true}>DHCP IP Address Range</Heading>
            <Box justify='start' direction='column' align='start' gap='medium' pad='small' elevation='medium' responsive wrap>
              < FormField label='Ethernet Interface'>
                <Select
                    name="eth"
                    placeholder={"Select"}
                    value={this.state.pxeConf.network.iface}
                    options={this.state.ethIfaces}
                    onChange={this.onSelectEthIface}
                    // onChange={({item}) => this.setState({"selectedEthIface": item})}
                    id="eth"
                />
              </FormField>
              <Box>
                <NameValueList>
                  <NameValuePair name="IP Address">
                    <Text color="text-strong">{this.state.pxeConf.network.addr}</Text>
                  </NameValuePair>
                  <NameValuePair name="Gateway">
                    <Text color="text-strong">{this.state.pxeConf.network.gateway}</Text>
                  </NameValuePair>
                  <NameValuePair name="Netmask">
                    <Text color="text-strong">{this.state.pxeConf.network.netmask}</Text>
                  </NameValuePair>
                  <NameValuePair name="Broadcast">
                    <Text color="text-strong">{this.state.pxeConf.network.broadcast}</Text>
                  </NameValuePair>
                </NameValueList>
              </Box>
              < FormField >
                <CheckBox
                  name="enable_dhcp"
                  label={"Enable Internal DHCP"}
                  id="enable_dhcp"
                  checked={this.state.pxeConf.enableDHCP}
                  onChange={this.onDHCPCheck}
                />
              </FormField>
              <Box direction={"row"} gap={"medium"}>
                < FormField label='Start IP Address'>
                  <IPAddressInput
                      name="start_ip"
                      value={this.state.pxeConf.network.dhcpIPRange.startIPRange}
                      onChange={this.onIPAddrInput}
                      disabled={!this.state.pxeConf.enableDHCP}
                      id="start_ip"
                  />
                </FormField>
                < FormField label='End IP Address'>
                  <IPAddressInput
                      name="end_ip"
                      value={this.state.pxeConf.network.dhcpIPRange.endIPRange}
                      onChange={this.onIPAddrInput}
                      disabled={!this.state.pxeConf.enableDHCP}
                      id="end_ip"
                  />
                </FormField>
              </Box>
            </Box>
          </Box>
          <Box gridArea='hosts' justify='start' align={"start"} gap={"small"}>
            <Heading level={5} size="small" strong={true}>PXE Boot Items</Heading>
            <Button icon={<AddIcon />} primary
                    size='small' label='Add PXE Boot Item' a11yTitle={`Add PXE Boot Item`}
                    onClick={this.onAddPXEItem} />
            {boot_items_table}
          </Box>
          <Box gridArea='footer'>
            <Footer pad={{vertical: 'medium'}} justify="between">
              <Button primary label={"Apply PXE Configuration"} onClick={this.onApplyPXEConf}></Button>
              {/*<Button label={"Reconfigure PXE"} onClick={(event) => {*/}
              {/*  this.onApplyPXEConf(event, true)*/}
              {/*}}></Button>*/}
              <Button label='Cancel'
                      reset
                      onClick={this.handleCancel}
              />
            </Footer>
          </Box>
        </Grid>
        </Box>
    );
  }

  onSelectEthIface(event) {
    console.log("onSelectEthIface: ", event.target.value);

    let pxe_conf = {...this.state.pxeConf};

    pxe_conf['network']['iface'] = event.target.value;

    this.setState({"pxeConf": pxe_conf});

    getData("/rest/pxe/ifaces/" + event.target.value, (res) => {
      console.log("onSelectEthIface: getData: result: ", res);
      let pxe_conf = {...this.state.pxeConf};
      // 'addr': '',
      //     'gateway': '',
      //     'netmask': '',
      //     'broadcast': '',
      pxe_conf['network']['addr'] = 'addr' in res['data']? res['data']['addr']:''
      pxe_conf['network']['gateway'] = 'gateway' in res['data']? res['data']['gateway']:''
      pxe_conf['network']['netmask'] = 'netmask' in res['data']? res['data']['netmask']:''
      pxe_conf['network']['broadcast'] = 'broadcast' in res['data']? res['data']['broadcast']:''

      this.setState({"pxeConf": pxe_conf});
    });

  }

  onDHCPCheck(){
    let pxe_conf = {...this.state.pxeConf};

    pxe_conf.enableDHCP = pxe_conf.enableDHCP? false:true;

    this.setState({'pxeConf': pxe_conf});

  }
  showItem(id, datum) {
    console.log("showItem: ", id);
    console.log("showItem: datum ", datum);
    this.setState({action: 'edit', showItem: id})
  }
}

DeployServersPXE.defaultProps = {
  error: undefined,
};

DeployServersPXE.propTypes = {
  dispatch: PropTypes.func.isRequired,
  error: PropTypes.object,
};

DeployServersPXE.contextTypes = {
  intl: PropTypes.object
};

const select = state => ({
});

export default connect(select)(DeployServersPXE);
