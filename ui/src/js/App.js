import React, {useState, useEffect} from 'react';
import {IntlProvider} from 'react-intl';
import {getCurrentLocale, getLocaleData} from './utils/Locale';
import {Provider} from 'react-redux';
import {Router} from 'react-router-dom';
import Routes from './Routes';
import {Box, Grid, Grommet} from 'grommet';
import {redefinit} from './theme';
import {redefinit as redefinit2} from './theme_local';
import configureStore from './store';
import history from './history';
import {initialize, validateToken} from './actions/session';
import NavSidebar from './components/NavSidebar';
import {AppHeader} from "./components/AppHeader";
import {loadSettings, loadSettings_store} from "./actions/settings";

const locale = getCurrentLocale();

// addLocaleData(en);
let messages;

try {
  messages = require(`./messages/${locale}`);
} catch (e) {
  messages = require('./messages/en-US');
}

const localeData = getLocaleData(messages, locale);
const localStorage = window.localStorage;

// listen for history changes and initiate routeChanged actions for them
history.listen((location) => {
  // const publish = store.getState().session.publishRoute;
  // store.dispatch(routeChanged(location, false));
});

const store = configureStore(/* provide initial state if any */)
store.dispatch(initialize(window.location.pathname));
const currentState = store.getState();

if (currentState.session.data['isAuthenticated'] == true) {
  store.dispatch(validateToken(currentState.session.data['token'], (tokenValid) => {
    console.log("tokenValid: ", tokenValid)
    if (tokenValid == false) {
      window.location.href = "/ui/login";
    }
    else{
    //  Get settings
    }
  }))
}

store.dispatch(loadSettings_store())

const userSession = {
  user: {
    name: " ",
    thumbnail: ""
  },
  items: [
    {
      label: "Logout",
      href: "#"
    }
  ]
};

export default function App() {
  //console.log("window.location.pathname: ", window.location.pathname);
  console.log("BMA APP loading");

  const {themeMode} = localStorage;

  const [settings, setSettings] = useState({})

  console.log("settings: ", settings)

  const currentState = store.getState();
  const {session} = currentState;

  // Update the app using side-effect when settings is available
  useEffect(() => {
    loadSettings((res, err) => {
      setSettings(res)
    })
  }, [])

  let themeModeSetting = settings.themeMode ? settings.themeMode.toLowerCase(): "light";
  let theme = settings.mode === "Local"? redefinit2:redefinit

  if (currentState.session.data['isAuthenticated'] && Object.keys(settings).length === 0){
    // If Settings not loaded yet then do not load the page.
    // Instead wait for loadSettings response
    // Exception is when session is not authenticated
    console.log(currentState.session.data['isAuthenticated'])
    return ""
  }

  let main_content = Routes();
  //console.log("App: main_content: ", main_content);

  let appIcon = "";
  if (process.env.NODE_ENV !== 'production') {
    // Code will be removed from production build.
    appIcon = "/img/BMA-PXE-banner.png";
  }
  else {
    appIcon = "/ui/img/BMA-PXE-banner.png";
  }

  return (
    <Grommet full={true} theme={theme} themeMode={themeModeSetting}>
      <Provider store={store}>
        <IntlProvider locale={localeData.locale} messages={localeData.messages}>
          <Router history={history}>
            {/*<id="top1" direction="row" align="start" pad="small" justify="start" fill="vertical"></>*/}
            <Grid id="grid" responsive={true} justify="stretch" fill
              rows={['auto', 'flex']}
              columns={['auto', 'flex']}
              areas={[
                { name: 'header', start: [0, 0], end: [1, 0] },
                { name: 'nav', start: [0, 1], end: [0, 1] },
                { name: 'main', start: [1, 1], end: [1, 1] },
              ]}
            >
              <Box elevation="medium" gridArea="header" >
                <AppHeader
                  appName="EasyPXE"
                  appIcon={appIcon}
                  userSession={userSession}
                  isAuthenticated={session.data['isAuthenticated']}
                />
              </Box>
              <Box id={"sidebar"} elevation="medium" gridArea="nav">
                <NavSidebar/>
              </Box>
              <Box gridArea="main">
                {main_content}
              </Box>
            </Grid>
          </Router>
        </IntlProvider>
      </Provider>
    </Grommet>
  );
}
