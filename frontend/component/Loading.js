import React from "react";
import { Text, View, StatusBar, Image, ActivityIndicator } from "react-native";
import PaperMan from "../images/PaperLogo/PaperMan.png";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { AppLoading } from "expo";

export default class Loading extends React.Component {
  state = {
    colorList: [],
    count: 0,
    test: [],
    allTrue: false,
    allFalse: false,
  };

  componentDidMount() {
    this.getList(6);
  }

  getList = async (num) => {
    for (let id = 0; id < num; id++) {
      const { colorList } = this.state;
      let temp = Math.random() < 0.5;
      await this.setState({
        colorList: colorList.concat({
          id: id,
          chosen: temp,
          key: id,
        }),
      });
    }
  };

  renderPaperMan = () => {
    const { colorList } = this.state;
    return colorList.map((num) => (
      <TouchableWithoutFeedback
        onPress={() => this.changeColor(num.id)}
        key={num.id}
      >
        <Image
          style={{
            width: 75,
            height: 130,
            tintColor: num.chosen ? "#e44888" : "#28aaaa",
          }}
          source={PaperMan}
        />
      </TouchableWithoutFeedback>
    ));
  };

  changeColor = (num) => {
    const { colorList } = this.state;
    this.setState({
      colorList: colorList.map((color) =>
        color.id == num ? { ...color, chosen: !color.chosen } : color
      ),
    });
  };

  render() {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignContent: "center",
          backgroundColor: "#222222",
        }}
      >
        <StatusBar barStyle={"light-content"} translucent={true} />
        <AppLoading
          startAsync={this.imageUploading}
          onFinish={() => this.setState({ maskLen: this.state.maskLen })}
          onError={console.warn}
        />
        <View
          style={{
            width: screen.width,
            flexDirection: "row",
            justifyContent: "center",
            alignContent: "center",
            alignItems: "center",
          }}
        >
          {this.renderPaperMan()}
        </View>
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 25,
            paddingTop: 35,
            paddingBottom: 20,
            textAlign: "center",
          }}
        >
          LOADING...
        </Text>
        <ActivityIndicator size="small" color="#fff" />
      </View>
    );
  }
}
