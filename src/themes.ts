import { createTheme } from "@material-ui/core";

export const themes = {
  light: createTheme({
    palette: {
      primary: {
        main: "#086adb",
        light: "#6297ff",
        dark: "#0041a8",
        contrastText: "#ffffff",
      },
      secondary: {
        main: "#086adb",
        light: "#fff",
        dark: "#9ea4a8",
        contrastText: "#fff",
      },
    },
    overrides: {
      MuiAppBar: {
        colorPrimary: {
          backgroundColor: "rgba(0,0,0,0)",
          color: "#262626",
        },
      },
      MuiContainer: {
        root: {
          paddingTop: 50,
        },
      },
      MuiTypography: {
        root: {
          color: "#262626",
        },
      },
      MuiSvgIcon: {
        root: {
          color: "#262626",
        },
      },
    },
  }),
  dark: createTheme({
    palette: {
      type: "dark",
      primary: {
        main: "#086adb",
        light: "#6297ff",
        dark: "#0041a8",
        contrastText: "#ffffff",
      },
      secondary: {
        main: "#086adb",
        light: "#1e1e1e",
        dark: "#0e0e0e",
        contrastText: "#fff",
      },
    },
    overrides: {
      MuiAppBar: {
        colorPrimary: {
          backgroundColor: "rgba(0,0,0,0)",
          color: "#fff",
        },
      },
      MuiContainer: {
        root: {
          paddingTop: 50,
        },
      },
      MuiTypography: {
        root: {
          color: "#fff",
        },
      },
      MuiSvgIcon: {
        root: {
          color: "#fff",
        },
      },
    },
  }),
};
