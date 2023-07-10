import React from "react";

import {Anchor, Box, Button, Heading, Image, TextInput} from "grommet";
import SessionMenu from "./SessionMenu";

export const AppHeader = ({
                            appName,
                            appIcon,
                            userSession,
                            onToggleSidebar,
                            isAuthenticated
                          }) => (
  <Box
    id="appbar"
    direction="row"
    background="background-contrast"
    align="center"
    justify="between"
    responsive={true}
  >
    <Button onClick={onToggleSidebar}>
        <Box pad={{"left":"small", "vertical": "xsmall"}} direction="column" width="xsmall" >
          <Anchor href="/ui">
            <Image fill fit="contain" src={appIcon} />
          </Anchor>
        </Box>
    </Button>

    <Box id="appbar-2" direction="row" align="center" gap="medium">

      {isAuthenticated && (
        <SessionMenu dropAlign={{ bottom: 'bottom' }} />
      )}
    </Box>
  </Box>
);
