import React from "react";
import Constants from "expo-constants";

/*
갤러리 -> Select 중간다리
Home에서 uri props로 받고, 
seesionID PHP로 보내고, maskLen 받기
Select로 uri 보내기 혹은 Home으로 뒤로가기
Detection 기다리는 로딩화면
*/

export default class Choice extends React.Component {
  state = {
    sessionid: null,
  };

  componentDidMount() {
    this.setState({
      sessionid: Constants.sessionId.slice(0, 8),
    });
  }

  render() {}
}
