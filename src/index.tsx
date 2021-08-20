import { ThemeProvider } from "@material-ui/core";
import React, { useState } from "react";
import ReactDOM from "react-dom";
import App from "./components/App";
import "./css/index.css";
import { themes } from "./themes";

const Main = () => {
  const [theme, setTheme] = useState("dark");

  const muiTheme = themes[theme];
  muiTheme.before && muiTheme.before();
  return (
    <ThemeProvider theme={muiTheme.theme}>
      <App setTheme={setTheme} />
    </ThemeProvider>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>,
  document.getElementById("root")
);
