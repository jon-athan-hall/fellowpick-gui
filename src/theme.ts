import { createTheme, rem } from "@mantine/core";

const theme = createTheme({
  headings: {
    fontFamily: 'MedievalSharp',
    sizes: {
      h1: {
        fontSize: rem('48px')
      },
      h2: {
        fontSize: rem('36px')
      }
    }
  },
  primaryColor: 'lime'
});

export default theme;
