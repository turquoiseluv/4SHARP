import * as React from "react";
import LogoScreen from "./component/LogoScreen";
import Home from "./component/Home";
import Select from "./component/Select";

import { YellowBox } from "react-native";
YellowBox.ignoreWarnings(["Require cycle:"]);

let timer = null;

export default class Timer extends React.Component {
  state = {
    isLogo: true,
  };
  componentDidMount() {
    timer = setTimeout(() => {
      this.setState({
        isLogo: false,
      });
    }, 1000);
  }

  componentWillUnmount() {
    clearTimeout(timer);
  }
  render() {
    //첫 로고 화면
    const { isLogo } = this.state;
    return isLogo ? <LogoScreen /> : <Select />;
  }
}
