import React from 'react';
import { css } from 'styled-components';
import { Ascending } from 'grommet-icons/icons/Ascending';
import { Blank } from 'grommet-icons/icons/Blank';
import { CircleAlert } from 'grommet-icons/icons/CircleAlert';
import { Descending } from 'grommet-icons/icons/Descending';
import { FormDown } from 'grommet-icons/icons/FormDown';
import { FormUp } from 'grommet-icons/icons/FormUp';
import { Unsorted } from 'grommet-icons/icons/Unsorted';
import {CircleQuestion} from "grommet-icons";

const isObject = item =>
  item && typeof item === 'object' && !Array.isArray(item);

const deepFreeze = obj => {
  Object.keys(obj).forEach(
    key => key && isObject(obj[key]) && Object.freeze(obj[key]),
  );
  return Object.freeze(obj);
};

export const redefinit = deepFreeze({
  "name": "redefinit_theme",
  "rounding": 4,
  "spacing": 12,
  "defaultMode": "light",
  "global": {
    "colors": {
      "brand": {
        "dark": "#7700cc",
        "light": "#6600cc"
      },
      "background": {
        "dark": "#111111",
        "light": "#FFFFFF"
      },
      "background-back": {
        "dark": "#111111",
        "light": "#EEEEEE"
      },
      "background-front": {
        "dark": "#222222",
        "light": "#FFFFFF"
      },
      "background-contrast": {
        "dark": "#FFFFFF11",
        "light": "#11111111"
      },
      "text": {
        "dark": "#EEEEEE",
        "light": "#333333"
      },
      "text-strong": {
        "dark": "#FFFFFF",
        "light": "#000000"
      },
      "text-weak": {
        "dark": "#CCCCCC",
        "light": "#444444"
      },
      "text-xweak": {
        "dark": "#999999",
        "light": "#777777"
      },
      "border": {
        "dark": "#444444",
        "light": "control"
      },
      "separator1": {
        "dark": "#444444",
        "light": "#d9d9d9"
      },
      'blue!': '#00739D',
      green: {
        dark: '#008567',
        light: '#17EBA0',
      },
      white: {
        dark: "#FFFFFF",
        light: "#FFFFFF",
      },
      'green!': '#01A982',
      teal: {
        dark: '#117B82',
        light: '#82FFF2',
      },
      'teal!': '#00E8CF',
      purple: {
        dark: '#6633BC',
        light: '#F740FF',
      },
      'purple!': '#7630EA',
      red: {
        dark: '#A2423D',
        light: '#FC6161',
      },
      'red!': '#C54E4B',
      orange: {
        dark: '#9B6310',
        light: '#FFBC44',
      },
      'orange!': '#FF8300',
      yellow: {
        dark: '#8D741C',
        light: '#FFEB59',
      },
      'yellow!': '#FEC901',
      "control": "brand",
      "active-background": "background-contrast",
      "active-text": "text-strong",
      "selected-background": "brand",
      "selected-text": "text-strong",
      "status-critical": "#FF4040",
      "status-warning": "#FFAA15",
      "status-ok": "#00C781",
      "status-unknown": "#CCCCCC",
      "status-disabled": "#CCCCCC",
      'graph-0': 'green!',
      'graph-1': 'blue!',
      'graph-2': 'purple!',
      'graph-3': 'yellow!',
      'graph-4': 'teal!',
    },
    "font": {
      "family": "Helvetica",
      "size": "15px",
      "height": "20px",
      "maxWidth": "300px"
    },
    "active": {
      "background": "active-background",
      "color": "active-text"
    },
    "hover": {
      "background": "active-background",
      "color": "active-text"
    },
    "selected": {
      "background": "selected-background",
      "color": "selected-text"
    }
  },
  "chart": {},
  "diagram": {
    "line": {}
  },
  "meter": {},
  "layer": {
    "background": {
      "dark": "#111111",
      "light": "#FFFFFF"
    }
  },
  "formField": {
    content: {
      margin: { vertical: 'xsmall' },
      pad: undefined,
    },
    border: {
      error: {
        color: 'border-strong',
      },
      color: 'border',
      side: 'all',
    },
    disabled: {
      background: {
        color: undefined,
      },
      border: {
        color: 'border-weak',
      },
      label: {
        color: 'text-weak',
      },
    },
    error: {
      background: {
        color: 'validation-critical',
      },
      container: {
        gap: 'xsmall',
      },
      icon: <CircleAlert size="small" style={{ marginTop: '4px' }} />,
      size: 'xsmall',
      color: 'text',
      margin: {
        bottom: 'xsmall',
        top: 'none',
        horizontal: 'none',
      },
    },
    focus: {
      border: {
        width: 'medium',
      },
    },
    help: {
      size: 'xsmall',
      color: 'text',
      margin: 'none',
    },
    info: {
      size: 'xsmall',
      color: 'text',
      margin: {
        bottom: 'xsmall',
        top: 'none',
        horizontal: 'none',
      },
    },
    label: {
      size: 'xsmall',
      color: 'text',
      margin: {
        bottom: 'none',
        top: 'xsmall',
        horizontal: 'none',
      },
      requiredIndicator: true,
      weight: 500,
    },
    margin: {
      bottom: 'none',
    },
    round: '4px',
  },
  "heading": {
    "level": {
      "1": {
        "small": {
          "size": "27px",
          "height": "32px",
          "maxWidth": "540px"
        },
        "medium": {
          "size": "39px",
          "height": "44px",
          "maxWidth": "780px"
        },
        "large": {
          "size": "63px",
          "height": "68px",
          "maxWidth": "1260px"
        },
        "xlarge": {
          "size": "87px",
          "height": "92px",
          "maxWidth": "1740px"
        }
      },
      "2": {
        "small": {
          "size": "24px",
          "height": "29px",
          "maxWidth": "480px"
        },
        "medium": {
          "size": "33px",
          "height": "38px",
          "maxWidth": "660px"
        },
        "large": {
          "size": "42px",
          "height": "47px",
          "maxWidth": "840px"
        },
        "xlarge": {
          "size": "51px",
          "height": "56px",
          "maxWidth": "1020px"
        }
      },
      "3": {
        "small": {
          "size": "21px",
          "height": "26px",
          "maxWidth": "420px"
        },
        "medium": {
          "size": "27px",
          "height": "32px",
          "maxWidth": "540px"
        },
        "large": {
          "size": "33px",
          "height": "38px",
          "maxWidth": "660px"
        },
        "xlarge": {
          "size": "39px",
          "height": "44px",
          "maxWidth": "780px"
        }
      },
      "4": {
        "small": {
          "size": "18px",
          "height": "23px",
          "maxWidth": "360px"
        },
        "medium": {
          "size": "21px",
          "height": "26px",
          "maxWidth": "420px"
        },
        "large": {
          "size": "24px",
          "height": "29px",
          "maxWidth": "480px"
        },
        "xlarge": {
          "size": "27px",
          "height": "32px",
          "maxWidth": "540px"
        }
      },
      "5": {
        "small": {
          "size": "14px",
          "height": "19px",
          "maxWidth": "270px"
        },
        "medium": {
          "size": "14px",
          "height": "19px",
          "maxWidth": "270px"
        },
        "large": {
          "size": "14px",
          "height": "19px",
          "maxWidth": "270px"
        },
        "xlarge": {
          "size": "14px",
          "height": "19px",
          "maxWidth": "270px"
        }
      },
      "6": {
        "small": {
          "size": "12px",
          "height": "17px",
          "maxWidth": "240px"
        },
        "medium": {
          "size": "12px",
          "height": "17px",
          "maxWidth": "240px"
        },
        "large": {
          "size": "12px",
          "height": "17px",
          "maxWidth": "240px"
        },
        "xlarge": {
          "size": "12px",
          "height": "17px",
          "maxWidth": "240px"
        }
      }
    }
  },
  tabs: {
    gap: "small",
    header: {
    }
  },
  tab: {
    color: "brand",
    border: {
      side: "bottom"
    },
    active: {
      color: {
        dark: "green!",
        light: "green!",
      },
      background: "background-contrast"
    },
    hover: {
      color: "text",
      background: "background-contrast"
      // extend: undefined,
    },
    margin: "small",
    pad: "small"
  },
  accordion: {
    heading: {
      level: 6,
      margin: 'small'
    }
  },
  checkBox: {
    hover: {
      border: {
        color: undefined,
      },
      background: {
        color: 'background-contrast',
      },
    },
    color: 'background',
    border: {
      color: 'border',
      width: 'small',
    },
    check: {
      radius: '2px',
      extend: ({ theme, checked, indeterminate }) => `
      background-color: ${
          checked || indeterminate
              ? theme.global.colors.green[theme.dark ? 'dark' : 'light']
              : theme.global.colors.background[theme.dark ? 'dark' : 'light']
      };
      ${(checked || indeterminate) && 'border: none;'}
        `,
    },
    icon: {
      extend: ({ theme }) => `stroke-width: 2px;
      stroke: ${
          theme.global.colors['text-strong'][theme.dark ? 'dark' : 'light']
      }`,
    },
    gap: 'small',
    toggle: {
      background: 'red',
      color: 'green',
      knob: {
        extend: ({ theme }) => `
           box-shadow: ${
            theme.global.elevation[theme.dark ? 'dark' : 'light'].small
        };
           border: 1px solid ${
            theme.global.colors.border[theme.dark ? 'dark' : 'light']
        }
        `,
      },
      extend: ({ checked, theme }) => `
        ${
          checked &&
          `background-color: ${
              theme.global.colors.green[theme.dark ? 'dark' : 'light']
          };`
      }
      `,
    },
    extend: ({ disabled, theme }) => `
      ${
        !disabled &&
        `:hover {
        background-color: ${
            theme.global.colors['background-contrast'][
                theme.dark ? 'dark' : 'light'
                ]
        };
      }`
    }
      font-weight: 500;
      width: auto;
      padding: ${theme.global.edgeSize.xsmall} ${theme.global.edgeSize.small};
    `,
  },
  checkBoxGroup: {
    container: {
      gap: 'none',
      margin: {
        vertical: 'small',
      },
    },
  },
  radioButton: {
    border: {
      color: 'border',
      width: 'small',
    },
    check: {
      color: 'selected-background',
      background: {
        color: 'background-front',
      },
    },
    color: 'selected-background',
    container: {
      extend: ({ theme }) => `
      :not(div):hover {
        background-color: ${
          theme.global.colors['background-contrast'][
              theme.dark ? 'dark' : 'light'
              ]
      };
      }
      padding: ${theme.global.edgeSize.xxsmall} ${theme.global.edgeSize.xsmall};
    `,
    },
    extend: ({ theme }) => `
      padding: ${theme.global.edgeSize.xxsmall} ${theme.global.edgeSize.xsmall};
    `,
    gap: 'xsmall',
    hover: {
      border: {
        color: 'brand',
      },
    },
    icons: {
      circle: () => (
          <Blank color="selected-background">
            <circle cx="12" cy="12" r="8" />
          </Blank>
      ),
    },
  },
  table: {
    body: {
      align: 'center',
      pad: {horizontal: 'small', vertical: 'xsmall'},
      border: 'all',
    },
    footer: {
      align: 'start',
      pad: {horizontal: 'small', vertical: 'xsmall'},
      verticalAlign: 'bottom',
    },
    header: {
      align: 'start',
      border: 'bottom',
      fill: 'horizontal',
      pad: {horizontal: 'small', vertical: 'xsmall'},
      verticalAlign: 'bottom',
      background: {
        color: 'accent-1',
        opacity: 'strong',
      },
    },
  },
  notification: {
    container: {
      // any BoxProps
      pad: { horizontal: 'large', vertical: '36px' },
      background: 'yellow',
    },
    iconContainer: {
      // any BoxProps
      justify: 'center',
      align: 'center',
    },
    textContainer: {
      // any BoxProps
      gap: '25px',
    },
    title: {
      // any TextProps
      color: '#001172',
    },
    message: {
      // any TextProps
      color: {
        light: '#001172',
        dark: '#340057',
      },
    },
    close: {
      color: '#e0ffcc',
    },
    unknown: {
      icon: CircleQuestion,
    },
  },
  "text": {
    "xsmall": {
      "size": "12px",
      "height": "17px",
      "maxWidth": "240px"
    },
    "small": {
      "size": "14px",
      "height": "19px",
      "maxWidth": "270px"
    },
    "medium": {
      "size": "15px",
      "height": "20px",
      "maxWidth": "300px"
    },
    "large": {
      "size": "18px",
      "height": "23px",
      "maxWidth": "360px"
    },
    "xlarge": {
      "size": "21px",
      "height": "26px",
      "maxWidth": "420px"
    },
    "xxlarge": {
      "size": "27px",
      "height": "32px",
      "maxWidth": "540px"
    }
  },
  "radioButtonGroup": {
    "container": {
      "gap": 'none',
      "margin": {
        "vertical": 'xsmall',
      },
    },
  },
  "tip": {
    "content": {
      "background": 'background',
      "border": {
        "color": 'border-weak',
      },
      "margin": 'xxsmall',
      "elevation": 'large',
      "pad": {
        "vertical": 'none',
        "horizontal": 'small',
      },
      "round": 'xsmall',
    },
  },
});

export const { colors } = redefinit.global;
