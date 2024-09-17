import { createTheme, rem, Text, Title } from "@mantine/core";

const theme = createTheme({
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

export default theme;
