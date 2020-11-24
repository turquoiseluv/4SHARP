import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Image,
  Text,
} from "react-native";
import Home from "./Home";

const screen = Dimensions.get("window");

/*
갤러리 -> Select 중간다리
Home에서 uri props로 받고, 
seesionID PHP로 보내고, maskLen 받기
Select로 uri 보내기 혹은 Home으로 뒤로가기
Detection 기다리는 로딩화면
*/

export default class Choice extends React.Component {
  state = {
    uri: this.props.uri,
    showSelect: false,
    goBack: false,
  };

  pressedBack = () => {
    console.log("뒤로 Pressed");
    this.setState({
      showSelect: false,
      goBack: !this.state.goBack,
    });
  };

  confirmImage = () => {
    console.log("확인 Pressed");
    this.setState({
      showSelect: true,
      goBack: !this.state.goBack,
    });
  };

  renderText = () => (
    <View style={styles.textBar}>
      <Text style={styles.text}>선택한 사진으로{"\n"}진행하시겠습니까?</Text>
    </View>
  );

  renderImage = () => {
    return (
      <View style={styles.container}>
        <Image
          resizeMode="contain"
          style={{
            flex: 1,
            position: "absolute",
            height: screen.height,
            width: screen.width,
            justifyContent: "center",
            alignItems: "center",
          }}
          source={{
            uri: this.state.uri,
          }}
        />
      </View>
    );
  };

  renderBottomBar = () => (
    <View style={styles.bottomBar}>
      <TouchableOpacity style={styles.bottomButton} onPress={this.pressedBack}>
        <Text style={{ color: "white", fontSize: 20, padding: 15 }}>뒤로</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.bottomButton} onPress={this.confirmImage}>
        <Text style={{ color: "white", fontSize: 20, padding: 15 }}>확인</Text>
      </TouchableOpacity>
    </View>
  );

  render() {
    if (this.state.goBack) {
      return (
        <Home
          uri={this.props.uri}
          showSelect={this.state.showSelect}
          sessionid={this.props.sessionid}
        />
      );
    }
    return (
      <View style={styles.container}>
        <StatusBar barStyle={"light-content"} translucent={true} />
        {this.renderImage()}
        {this.renderText()}
        {this.renderBottomBar()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  textBar: {
    position: "absolute",
    height: 100,
    width: screen.width,
    top: 10,
    backgroundColor: "#00000050",
    padding: 10,
    marginTop: screen.height / 15,
  },
  text: {
    color: "#fff",
    fontSize: 30,
    justifyContent: "center",
    alignSelf: "center",
    textAlign: "center",
  },
  bottomBar: {
    backgroundColor: "#00000050",
    marginVertical: 50,
    position: "absolute",
    flexDirection: "row",
    bottom: 0,
    width: screen.width,
    paddingHorizontal: screen.width / 15,
    justifyContent: "space-between",
  },
  bottomButton: {
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
});
