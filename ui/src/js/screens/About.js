/**
 * Created by govind on 9/5/18.
 */

import React, { Component } from 'react';

import {
  Anchor,
  Box,
  Header,
  Heading,
  Card,
  Form,
  FormField,
  TextInput,
  RadioButton,
  Footer,
  Button,
  Select, Text, RadioButtonGroup, Grid
} from 'grommet';
import {DocumentConfig, DocumentDownload, LinkPrevious} from 'grommet-icons';

import {
  loadSettings, saveSettings
} from '../actions/settings';
import {AppHeader} from "../components/AppHeader";
import {ServerCluster as GrommetIcon} from "grommet-icons/icons";
import NavSidebar from "../components/NavSidebar";

class About extends Component {

  constructor (props) {
    super(props);
  }

  render() {

    return (
      <Box id="settings" fill="vertical" overflow="auto" align="start" flex="grow"  justify="start" direction="column" pad="large"  >
        <Grid id="grid" responsive={true} justify="stretch" fill
              rows={['auto', 'auto', 'small']}
              columns={['full']}
              gap="none"
              areas={[
                { name: 'header', start: [0, 0], end: [0, 0] },
                { name: 'main', start: [0, 1], end: [0, 1] },
                { name: 'footer', start: [0, 2], end: [0, 2] },
              ]}
        >
          <Box gridArea="header" >
          </Box>
          <Box gridArea="main">
          </Box>
          <Box gridArea="footer">
            <Text>
              EasyPXE
            </Text>
            <Text>
              Open sourced by <a href="https://www.redefinit.com/" target="_blank" rel="noopener noreferrer">RedefinIT Technologies.</a>
            </Text>
          </Box>
        </Grid>



      </Box>
    );
  }
}

export default About
