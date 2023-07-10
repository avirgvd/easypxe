/**
 * Created by govind on 9/5/18.
 */

import React, { Component } from 'react';
import { PropTypes } from 'prop-types';

import { connect } from 'react-redux';

import {
  Anchor,
  Box,
  Header,
  Heading,
  Form,
  FormField,
  Footer,
  Button,
  Select,
  Text,
  RadioButtonGroup,
  Tabs,
  Tab,
  TableCell,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  Layer,
  TextInput,
  CheckBox, DropButton
} from 'grommet';
import {SettingsOption, DocumentDownload, Storage, UserSettings, Edit } from 'grommet-icons';
import {NumberInput} from "grommet-controls";
import {
  loadSettings, saveSettings
} from '../actions/settings';
import LayerForm from "../components/LayerForm";

class Settings extends Component {

  constructor (props) {
    super(props);

    this.onSetCentral = this.onSetCentral.bind(this);
    this.onChangeCentral = this.onChangeCentral.bind(this);
    this.onChangeMode = this.onChangeMode.bind(this);
    this.handleAddGroup = this.handleAddGroup.bind(this);
    this.handleAddUser = this.handleAddUser.bind(this);
    this.handleCloseLayer = this.handleCloseLayer.bind(this);
    this.onAddUser = this.onAddUser.bind(this);
    this.onAddGroup = this.onAddGroup.bind(this);
    this.handleAddDirectory = this.handleAddDirectory.bind(this);
    this.onAddDirectory = this.onAddDirectory.bind(this);
    this.handleDeplQueueSize = this.handleDeplQueueSize.bind(this);
    this.setThemeMode = this.setThemeMode.bind(this);
    this.handleButton = this.handleButton.bind(this);
    this.onListClick = this.onListClick.bind(this);
    this.onFormClose = this.onFormClose.bind(this);
    this.renderGeneralSettings = this.renderGeneralSettings.bind(this);
    this.renderUsersAccounts = this.renderUsersAccounts.bind(this);
    this.renderDataStorage = this.renderDataStorage.bind(this);
    this.state = {
      themeModes: ['Light', 'Dark'],
      layerAddUser: "",
      layerAddGroup: "",
      layerAddDirectory: "",
      theme: "Light",
      selected: -1, selectedItemProps: {},
      settings: {},
      bmaCentralIP: "",
      bmaCentralUsr: "",
      bmaCentralPwd: ""
    };
  }

  handleDeplQueueSize(event, value){
    //console.log("handleDeplQueueSize: ", value);
  }

  handleButton(event) {
    //console.log("handleButton: event: ", event)
    //console.log("handleButton: event[label]: ", event.target.id)

  }

  onListClick(event) {
    //console.log("Settings: onListClick: event.target: ", event);
    this.setState({ selected: event.index, selectedItemProps: event.data});
  }

  onFormClose(event) {
    //console.log("Settings: onFormClose: event.target: ", event);
    this.setState({ selected: -1, selectedItemProps: {}});
  }

  componentDidMount() {
    //console.log("Settings: componentDidMount");
    loadSettings((res, err) => {
      console.log("res: ", res)
      console.log("err: ", err)
      this.setState({'settings': res})
    });
  }

  componentWillUnmount() {
    //console.log("Settings: componentWillUnmount: ");
    // this.setState({ selected: -1, selectedItemProps: {}});
    // const { match: { params }, dispatch } = this.props;
    // dispatch(unloadSettings(params.id));
  }

  onSetCentral(event){

    let settings = { ...this.state.settings};

    settings['central'] = {
      "bmaCentralIP": this.state['settings']['central'].bmaCentralIP,
      "bmaCentralUsr": this.state['settings']['central'].bmaCentralUsr,
      "bmaCentralPwd": this.state['settings']['central'].bmaCentralPwd,
    }

    saveSettings(settings, (res, err) => {
      console.log(res);
      this.setState({settings: res['result']})
    });

  }
  onChangeCentral(event){

    console.log(event.target.id)

    let settings = { ...this.state.settings};

    if(event.target.id === "bma-central-ip"){
      settings['central']['bmaCentralIP'] = event.target.value
    }
    else if(event.target.id === "bma-central-usr"){
      settings['central']['bmaCentralUsr'] = event.target.value
    }
    else if(event.target.id === "bma-central-pwd"){
      settings['central']['bmaCentralPwd'] = event.target.value
    }
    this.setState({settings: settings})
  }

  onChangeMode(event){
    console.log(event.target.value)
    let settings = { ...this.state.settings};
    settings['mode'] = event.target.value;
    if (settings['mode'] === 'Local' && !settings.hasOwnProperty('central')){
      settings['central'] = {"bmaCentralIP": "", "bmaCentralPwd": "", "bmaCentralUsr": ""}
    }

    // this.props.dispatch(saveSettings(settings));
    saveSettings(settings, (res, err) => {
      console.log(res);
      this.setState({settings: res['result']})
      window.location.href='/ui/settings';
    });
  }

  setThemeMode(event) {
    let settings = { ...this.state.settings};

    console.log("setThemeMode: event.target.value: ", event.target.value);
    console.log("setThemeMode", settings);

    settings['themeMode'] = event.target.value

    try {
      localStorage.themeMode = settings['themeMode'];
    } catch (e) {
      console.log("Failed to save themeMode setting ", e);
    }

    // this.props.dispatch(saveSettings(settings));
    saveSettings(settings, (res, err) => {
      window.location.href='/ui/settings';
    });
  }

  renderGeneralSettings(settings){
    console.log("renderGeneralSettings: ", settings);

    let support_dump_link = "https://192.168.1.101/rest/supportdump"

    return (
        <Form  pad='large'>
          <div>
            {/*<Box pad={"small"} justify={"stretch"} margin={"small"} elevation={"small"}>*/}
            {/*  <FormField label="BMA Mode">*/}
            {/*    <Select*/}
            {/*        name="mode"*/}
            {/*        options={['Central', 'Local']}*/}
            {/*        label="BMA Mode"*/}
            {/*        value={this.state['settings']['mode']}*/}
            {/*        onChange={this.onChangeMode}*/}
            {/*    />*/}
            {/*  </FormField>*/}
            {/*  <br/>*/}
            {/*  {(this.state['settings']['mode'] === 'Local' && this.state['settings'].hasOwnProperty('central'))&& (*/}
            {/*      <Box align={"start"} justify={"between"}>*/}
            {/*        <FormField id={"bma-central-ip"} label={"BMA Central IP"} value={this.state['settings']['central']['bmaCentralIP']} onChange={this.onChangeCentral}></FormField>*/}
            {/*        <FormField id={"bma-central-usr"} label={"User"} value={this.state['settings']['central']['bmaCentralUsr']} onChange={this.onChangeCentral}></FormField>*/}
            {/*        <FormField id={"bma-central-pwd"} label={"Password"} value={this.state['settings']['central']['bmaCentralPwd']} onChange={this.onChangeCentral}></FormField>*/}
            {/*        <Box fill align={"start"} justify={"between"} direction={"row"}>*/}
            {/*          <Button primary label={"Apply"} onClick={this.onSetCentral}></Button>*/}
            {/*          <Button primary label={"Test"} ></Button>*/}
            {/*        </Box>*/}
            {/*      </Box>*/}

            {/*  )}*/}
            {/*</Box>*/}
            <FormField label="UI Theme">
              <RadioButtonGroup
                  name="theme"
                  options={this.state.themeModes}
                  value={this.state['settings']['themeMode']}
                  onChange={this.setThemeMode}
              />
            </FormField>
            <br/>
            <FormField label="Log File Path">
              <Text margin="small">{this.state['settings'].logFilePath}</Text>
            </FormField>
            <br/>
            <FormField label="Log Level">
              <Select
                  options={['CRITICAL', 'ERROR', 'WARNING', 'INFO', 'DEBUG']}
                  value={this.state['settings'].logLevel}
              />
            </FormField>
            <br/>
            <FormField label="Language">
              <Select
                  options={['English (US)']}
                  value={this.state['settings'].language}
              />
            </FormField>
            <br/>
            <FormField label="HTTP File Server">
              <Select
                  options={['Local', 'External']}
                  value={this.state['settings'].httpFileServer}
              />
            </FormField>
            <br/>
            {/*<FormField label="Deployment Queue Size">*/}
            {/*  <NumberInput*/}
            {/*    id="queue_size"*/}
            {/*    a11yIncrement="Increase queue size"*/}
            {/*    a11yDecrement="Decrease queue size"*/}
            {/*    step={1}*/}
            {/*    value={this.state['settings'].deplQueueSize}*/}
            {/*    onChange={this.handleDeplQueueSize}*/}
            {/*  />*/}
            {/*</FormField>*/}
            <br/>
            <br/>
            <Anchor icon={<DocumentDownload/>}
                    primary={false} label='Download Support Dump' href={support_dump_link}/>
          </div>
          <Footer pad={{vertical: 'medium'}} justify="between">
            <Button id='revert' label='Revert'
                    type='button'
                    primary={true}
                    onClick={this.handleButton}
            />
            <Button id='defaults' label='Defaults'
                    type='button'
                    primary={true}
                    onClick={this.handleButton}
            />
          </Footer>
        </Form>
    );
  }

  renderUsersAccounts(settings){

    let users_groups = "";
    settings['usersGroups'] = [];

    users_groups = settings['usersGroups'].map((row, index) => (
        <TableRow key={index}>
          <TableCell>
            {row.name}
          </TableCell>
          <TableCell>
            {row.type}
          </TableCell>
          <TableCell>
            {row.permission}
          </TableCell>
          <TableCell>
            <Button id="567" icon={<Edit />}
                    href='#' />
          </TableCell>
        </TableRow>
    ));

    return (
        <Form  pad='large'>
          <Header>
            <Box direction="row" gap="small" pad="small">
              <Button label="Add User" onClick={this.onAddUser}></Button>
              <Button label="Add Group" onClick={this.onAddGroup}></Button>
              <Button label="Add Directory" onClick={this.onAddDirectory}></Button>
              {this.state.layerAddUser}
              {this.state.layerAddGroup}
              {this.state.layerAddDirectory}
            </Box>
          </Header>

          <Box align="start" pad="small">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>
                    Name
                  </TableCell>
                  <TableCell>
                    Type
                  </TableCell>
                  <TableCell>
                    Permission
                  </TableCell>
                  <TableCell>
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users_groups}
              </TableBody>
            </Table>
          </Box>

          <Footer pad={{vertical: 'medium'}} justify="between">
          </Footer>
        </Form>
    );
  }

  renderDataStorage(settings){

    return (
        <Form  pad='large'>
          <Footer pad={{vertical: 'medium'}} justify="between">
            <Button id='revert' label='Revert'
                    type='button'
                    primary={true}
                    onClick={this.handleButton}
            />
            <Button id='defaults' label='Defaults'
                    type='button'
                    primary={true}
                    onClick={this.handleButton}
            />
          </Footer>
        </Form>
    );
  }

  render() {
    console.log("Settings: this.props: ", this.props);
    //console.log("Settings: this.state: ", this.state);
    // const { error, settings} = this.props;
    const settings = this.state.settings;
    const error = this.state.error;
    const {selected, selectedItemProps} = this.state;

    let general_settings = this.renderGeneralSettings(settings)
    let users_settings = this.renderUsersAccounts(settings)
    let data_settings = this.renderDataStorage(settings)
    console.log("Settings: this.props: 2");

    return (
        <Box id="settings" fill="vertical" overflow="auto" align="start" flex="grow"
             justify="start" direction="column" pad="large"  >
          <Tabs>
            <Tab autoFocus={true} title="General Settings" icon={<SettingsOption/>}>
              <Box justify='start' align='start' direction='row' gap='medium' pad='small'
                   elevation='medium' responsive wrap>
                {general_settings}
              </Box>
            </Tab>
            <Tab title="Users and Groups" icon={<UserSettings/>}>
              <Box justify='start' align='start' direction='row' gap='medium' pad='small'
                   elevation='medium' responsive wrap>
                {users_settings}
              </Box>
            </Tab>
            <Tab title="Data and Storage" icon={<Storage/>}>
              <Box justify='start' align='start' direction='row' gap='medium' pad='small'
                   elevation='medium' responsive wrap>
                {data_settings}
              </Box>
            </Tab>
          </Tabs>

        </Box>
    );
  }

  onAddGroup() {

    let body = (
        <Box justify='start' align="stretch" direction="column" fill="horizontal" pad={"small"}>
          <Form>
            <Box justify='start' align="start" direction="column" gap="small" pad="small"
                 border={{"side": "bottom", "color": "background-contrast"}} responsive wrap>
              <FormField label="Login name">
                <TextInput></TextInput>
              </FormField>
              <FormField label="Full name">
                <TextInput></TextInput>
              </FormField>
            </Box>
            <Heading level={5}>Permissions</Heading>
            <Box justify='start' align="stretch" direction="row" gap="small" pad="small"
                 border={{"side": "bottom", "color": "background-contrast"}} responsive wrap>
              <FormField label="Role">
                <Select options={["Administrator", "Backup Administrator", "Read Only"]}></Select>
              </FormField>
              <FormField label="Scope">
                <Select options={["Administrator", "Backup Administrator", "Read Only"]}></Select>
              </FormField>
            </Box>
            <br/>
            <Footer>
              <Button label="Add" onClick={this.handleAddGroup}></Button>
              <Button label="Cancel" onClick={this.handleCloseLayer}></Button>
            </Footer>
          </Form>
        </Box>
    );

    let layer = this.renderLayerForm("Add Group", body);

    this.setState({"layerAddGroup": layer});

  }

  onAddDirectory() {

    let body = (
        <Form>
          <Box justify='start' align="start" direction="column" gap="small" pad="small"
               border={{"side": "bottom", "color": "background-contrast"}} responsive wrap>
            <FormField label="Directory">
              <TextInput></TextInput>
            </FormField>
            <FormField label="Directory type">
              <Select options={["Active Directory", "OpenLDAP", "OAuth2"]}></Select>
            </FormField>
            <FormField label="Base DN">
              <TextInput></TextInput>
            </FormField>
            <FormField label="Directory Binding">
              <Select options={["User Account", "Service Account"]}></Select>
            </FormField>
          </Box>
          <br/>
          <Footer>
            <Button label="Add" onClick={this.handleAddDirectory}></Button>
            <Button label="Cancel" onClick={this.handleCloseLayer}></Button>
          </Footer>
        </Form>
    );

    let layer = this.renderLayerForm("Add Directory Server", body);

    this.setState({"layerAddDirectory": layer});

  }

  renderLayerForm(heading, body) {

    let layer = (
        <Layer title="Add Directory Service" position="center" modal margin="medium" >
          <Box pad={{"horizontal":"small"}} background={{"color": "background-contrast"}}
               border={{"side": "bottom", "color": "background-contrast"}}>
            <Heading level={4}>{heading}</Heading>
          </Box>
          <Box justify='start' align='stretch' direction='column' gap='small'
               fill="horizontal" pad={"small"} overflow="auto" responsive wrap gap="large"
               width="large" height="large" margin="medium" fill="vertical">
            {body}
          </Box>
        </Layer>
    );

    return layer;

  }

  onAddUser() {

    let body = (
        <Form>
          <Box justify='start' align="start" direction="column" gap="small" pad="small"
               border={{"side": "bottom", "color": "background-contrast"}} responsive wrap>
            <FormField label="Login name">
              <TextInput></TextInput>
            </FormField>
            <FormField label="Full name">
              <TextInput></TextInput>
            </FormField>
            <FormField label="Initial password">
              <TextInput></TextInput>
            </FormField>
            <FormField label="Confirm name">
              <TextInput></TextInput>
            </FormField>
          </Box>
          <Heading level={5}>Permissions</Heading>
          <Box justify='start' align="stretch" direction="row" gap="small" pad="small"
               border={{"side": "bottom", "color": "background-contrast"}} responsive wrap>
            <FormField label="Role">
              <Select options={["Administrator", "Backup Administrator", "Read Only"]}></Select>
            </FormField>
            <FormField label="Scope">
              <Select options={["Administrator", "Backup Administrator", "Read Only"]}></Select>
            </FormField>
          </Box>
          <Heading level={5}>Contact</Heading>
          <Box justify='start' align="start" direction="column" gap="small" pad="small"
               border={{"side": "bottom", "color": "background-contrast"}} responsive wrap>
            <FormField label="Email">
              <TextInput></TextInput>
            </FormField>
            <FormField label="Office Phone">
              <TextInput></TextInput>
            </FormField>
            <FormField label="Mobile Phone">
              <TextInput></TextInput>
            </FormField>
          </Box>
          <br/>
          <Footer pad="medium">
            <Button label="Add" onClick={this.handleAddUser}></Button>
            <Button label="Cancel" onClick={this.handleCloseLayer}></Button>
          </Footer>
        </Form>
    );

    let layer = this.renderLayerForm("Add User", body);

    this.setState({"layerAddUser": layer});
  }

  handleCloseLayer() {
    this.setState({"layerAddUser": "", "layerAddGroup": "", "layerAddDirectory": ""})
  }

  handleAddUser() {
    this.setState({"layerAddUser": "", "layerAddGroup": "", "layerAddDirectory": ""})

  }

  handleAddGroup() {
    this.setState({"layerAddUser": "", "layerAddGroup": "", "layerAddDirectory": ""})
  }

  handleAddDirectory() {
    this.setState({"layerAddUser": "", "layerAddGroup": "", "layerAddDirectory": ""})
  }

  handleAddDirectory() {

  }
}

Settings.defaultProps = {
  error: undefined,
  settings: undefined
};

Settings.propTypes = {
  dispatch: PropTypes.func.isRequired,
  error: PropTypes.object,
  match: PropTypes.object.isRequired,
  settings: PropTypes.object
};

const select = state => ({ ...state.settings });

export default connect(select)(Settings);
