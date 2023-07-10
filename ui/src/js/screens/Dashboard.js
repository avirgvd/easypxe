import React, { Component, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

// import { Anchor } from 'grommet';
// import Article from 'grommet/components/Article';
import {
  Box, Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader, DataTable,
  Distribution,
  Grid,
  Header,
  Heading,
  Meter, NameValueList, NameValuePair,
  Stack,
  Text
} from 'grommet';

import NavControl from '../components/NavControl';
import {
  loadDashboard, unloadDashboard
} from '../actions/dashboard';

import { pageLoaded } from './utils';
import {Cube, Package, Resources, Services, Storage} from "grommet-icons";
import history from "../history";
import ActivityIndex from "../components/activity/ActivityIndex";


const Identifier = ({ children, title, subTitle, size, ...rest }) => (
    <Box gap="small" align="center" direction="row" pad="small" {...rest}>
      {children}
      <Box>
        <Text size={size} weight="bold">
          {title}
        </Text>
        <Text size={size}>{subTitle}</Text>
      </Box>
    </Box>
);

class Dashboard extends Component {
  constructor (props) {
    super(props);

    // const total = 100;
    // const [active, setActive] = useState(0);
    // const [label, setLabel] = useState('');
    // const [highlight, setHighlight] = useState(false);

    // this._onClickTitle = this._onClickTitle.bind(this);
    // this._onCloseNav = this._onCloseNav.bind(this);
    // this._onSearchChange = this._onSearchChange.bind(this);
    // this._onSearchSelect = this._onSearchSelect.bind(this);
    // this._onClickUtilization = this._onClickUtilization.bind(this);
    // this._onGraphicSize = this._onGraphicSize.bind(this);
    //
    // this._setDocumentTitle(props);
    this.state = {
      graphicSize: 'small',
      cpuIndex: 0,
      memoryIndex: 0,
      storageIndex: 0,
      highlight: true,
      active: 0,
      total: 0,
      label: ""
    };
  }


  componentDidMount() {
    pageLoaded('Dashboard');
    console.log("Dashboard: componentDidMount");
    this.props.dispatch(loadDashboard());
  }

  componentWillUnmount() {
    // this.props.dispatch(unloadDashboard());
  }

  render() {
    const { error, data } = this.props;
    //console.log("Dashboard: render(): this.props: ", this.props);
    console.log("Dashboard: render(): data: ", data);
    const { intl } = this.context;

    const {active, total, label} = this.state;

    let ovTargets = [
      {value: data.ovCount, label: 'Available', color: 'status-ok'},
      {value: 0, label: 'Offline', color: 'status-critical'}
    ];

    let osPackages = [{value: 0, label: "None", color: 'unset'}];

    if(data.osPackages.stats.length > 0) {
      osPackages = data.osPackages.stats.map((item, index) => (
        {value: item.count, label: item.osType, color: 'graph-'.concat(index)}
      ));
    }

    let storageData = [
      {value: 427, label: 'In use', colorIndex: 'accent-1'},
      {value: 573, label: 'Available', colorIndex: 'unset'}
    ];

    console.log("Storage Stats: ", data.storageStats)

    let statusColor = "red";
    if(data.pxeStatus.pxe && data.pxeStatus.samba)
      statusColor = "green"

    return (
      <Box id="top2" fill="vertical" overflow="auto" align="start"  justify="start" direction="column" pad="medium" fill responsive wrap >
        <Header direction="row" justify="between" size="large"
                pad={{ horizontal: 'medium', between: 'small' }}>
          <NavControl />
        </Header>
        <Grid id="grid" responsive={true} justify="stretch" pad='xsmall' fill='horizontal'
              rows={['auto', 'fit', 'full']}
              columns={['full']}
              areas={[
                { name: 'header', start: [0, 0], end: [0, 0] },
                { name: 'dashboard', start: [0, 1], end: [0, 1] },
                { name: 'dashboard_table', start: [0, 2], end: [0, 2] },
              ]}
        >
          <Box gridArea="header" >
            <Header justify="between" pad={"small"}>
              <Heading level={4} margin="none">Dashboard</Heading>
            </Header>
          </Box>
          <Box gap='xlarge' gridArea="dashboard" direction='row'>
            <Box justify='start' align="center" direction='column'>
              <Card>
              <CardBody pad="small">
                <Identifier
                    title="Images"
                    subTitle="Image Store"
                    size="small"
                >
                  <Package/>
                </Identifier>
              <Stack anchor="center">
                <Meter type="circle" thickness="medium" max={data.osPackages.total}
                       size={this.state.graphicSize} values={osPackages} />
                <Box align="center">
                  <Box direction="column" align="center" pad={{ bottom: 'xsmall' }}>
                    <Text size="large" weight="bold">
                      {data.osPackages.total}
                    </Text>
                    <Text>Total</Text>
                  </Box>
                </Box>
                <Box align="center">
                  <Box direction="column" align="center" pad={{ bottom: 'xsmall' }}>
                    <Text size="large" weight="bold">
                      {data.osPackages.total}
                    </Text>
                    <Text>Total</Text>
                  </Box>
                </Box>
              </Stack>
              </CardBody>
                <CardFooter pad={{ horizontal: 'medium', vertical: 'small' }}>
                  <Text size="xsmall">{"Images Count"}</Text>
                </CardFooter>
              </Card>
            </Box>

            <Box justify='start' align="center" direction='column'>
              <Card key="storage">
                <CardBody pad="small">
                  <Identifier
                      title="Storage"
                      subTitle="Image Store"
                      size="small"
                  >
                    <Storage/>
                  </Identifier>
              <Stack anchor="center">
                <Meter
                  type="pie"
                  background="light-2"
                  values={[
                    {
                      value: data.storageStats.used,
                      onHover: (over) => {
                        this.setState({"active": over ? data.storageStats.used : 0});
                        this.setState({"label": over ? 'in use' : undefined});
                      },
                      onClick: () => {
                        this.setState({
                          highlight: !highlight
                        });
                      },
                    },
                    {
                      value: data.storageStats.free,
                      onHover: (over) => {
                        this.setState({"active": over ? data.storageStats.free : 0});
                        this.setState({"label": over ? 'available' : undefined});
                      },
                    },
                  ]}
                  max={data.storageStats.total}
                  size="small"
                  thickness="medium"
                />
                <Box align="center">
                  <Box direction="row" align="center" pad={{ bottom: 'xsmall' }}>
                    <Text size="xxlarge" weight="bold">
                      {active || data.storageStats.total}
                    </Text>
                    <Text>GB</Text>
                  </Box>
                  <Text>{label || 'Total'}</Text>
                </Box>
              </Stack>
                </CardBody>
                <CardFooter pad={{ horizontal: 'medium', vertical: 'small' }}>
                  {/*<Text size="xsmall">{storageFooter}</Text>*/}
                  <Text size="xsmall"><b>{data.storageStats.free} GB</b> available</Text>
                </CardFooter>
              </Card>
            </Box>
            <Box justify='start' align="center" direction='column'>
              <Card background={{"color":statusColor}} >
                <CardBody pad="small" >
                  <Identifier
                      title="PXE Services"
                      subTitle="Health Information"
                      size="small"
                  >
                    <Services/>
                  </Identifier>
                  <Box pad={'small'} justify={"start"}>
                  <NameValueList nameProps={{"width":"xsmall"}} valueProps={{"width":"small"}}>
                    <NameValuePair name="PXE">
                      <Text weight={"bold"}>{data.pxeStatus.pxe == 1? "Running": "Not Running"}</Text>
                    </NameValuePair>
                    <NameValuePair name="Samba">
                      <Text weight={"bold"}>{data.pxeStatus.samba == 1? "Running": "Not Running"}</Text>
                    </NameValuePair>
                  </NameValueList>
                  </Box>
                </CardBody>
                <CardFooter pad={{ horizontal: 'medium', vertical: 'small' }}>
                  <Text size="xsmall">{""}</Text>
                </CardFooter>
              </Card>
            </Box>
          </Box>
          <Box gridArea="dashboard_table">
            <Heading level={4}>Running Tasks</Heading>
            {/*<ActivityIndex tableOnly={true}/>*/}
          </Box>
        </Grid>
      </Box>
    );
  }
}

Dashboard.defaultProps = {
  error: undefined,
  dashboardData: {}
};

Dashboard.propTypes = {
  dispatch: PropTypes.func.isRequired,
  error: PropTypes.object,
  dashboardData: PropTypes.object
};

Dashboard.contextTypes = {
  intl: PropTypes.object
};

const select = state => ({ ...state.dashboard });

export default connect(select)(Dashboard);
