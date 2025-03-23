import { createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      light: '#3350bf',
      main: '#0025b0',
      dark: '#00197b',
      contrastText: '#ffffff'
    },
    secondary: {
      light: '#7f6245',
      main: '#603b17',
      dark: '#432910',
      contrastText: '#ffffff'
    },
  },
  typography: {
    h1: {
      fontFamily: 'MedievalSharp',
      fontSize: 48
    },
    h2: {
      fontFamily: 'MedievalSharp',
      fontSize: 30
    }
  }
});

export default theme;

/*
  colors: {
    'gandalf-gray': [
      "#fef2f5",
      "#eae6e7",
      "#cdcdcd",
      "#b2b2b2",
      "#9a9a9a",
      "#8b8b8b",
      "#848484",
      "#717171",
      "#676465",
      "#5e5457"
    ],
    'radagast-brown': [
      "#fbf5ef",
      "#f2e8de",
      "#e7ceb7",
      "#dcb28b",
      "#d39b66",
      "#cd8d4f",
      "#cb8542",
      "#b47234",
      "#a1652c",
      "#8c5622"
    ],
    'alatar-blue': [
      "#e9edff",
      "#cfd5ff",
      "#9ca7ff",
      "#6477ff",
      "#384dfe",
      "#1b33fe",
      "#0926ff",
      "#001ae4",
      "#0017cc",
      "#0011b4"
    ],
    'pallando-blue': [
      "#ebefff",
      "#d2dafa",
      "#a0b0f7",
      "#6b85f6",
      "#4361f6",
      "#2d4af6",
      "#233ff7",
      "#1932dd",
      "#112bc5",
      "#0024ad"
    ]
  },
  headings: {
    fontFamily: 'MedievalSharp',
    sizes: {
      h1: {
        fontSize: rem(48)
      },
      h2: {
        fontSize: rem(36)
      }
    }
  },
  primaryColor: 'pallando-blue'
});
*/

//ffffff - saruman-white
//757575 - gandalf-gray
//603b17 - radagast-brown
//001eff - alatar-blue
//0025b0 - pallando-blue
