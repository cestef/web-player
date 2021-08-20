import { createTheme, Theme } from "@material-ui/core";

export const themes: { [key: string]: { theme: Theme; before?: () => void } } =
  {
    light: {
      theme: createTheme({
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
      before: () => {
        const classes = Array.from(document.body.classList);
        document.body.classList.remove(...classes);
        document.body.classList.add("light");
      },
    },
    dark: {
      theme: createTheme({
        palette: {
          type: "dark",
          primary: {
            main: "#306098",
            light: "#5071B2",
            dark: "#223758",
            contrastText: "#ffffff",
          },
          secondary: {
            main: "#306098",
            light: "#1e1e1e",
            dark: "#0e0e0e",
            contrastText: "#fff",
          },
          background: {
            paper: "#3e3e4e",
            default: "#3e3e3e",
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
      before: () => {
        const classes = Array.from(document.body.classList);
        document.body.classList.remove(...classes);
        document.body.classList.add("dark");
      },
    },
  };
