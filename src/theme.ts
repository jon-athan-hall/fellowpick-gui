import { createTheme, rem } from "@mantine/core";

const theme = createTheme({
  headings: {
    fontFamily: 'MedievalSharp',
    sizes: {
      h1: {
        fontSize: rem('48px')
      }
    }
  },
  primaryColor: 'lime'
});

export default theme;
