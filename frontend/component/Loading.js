import React from "react";
import { Text, View, StatusBar, Image, ActivityIndicator } from "react-native";
import PaperMan from "../images/PaperLogo/PaperMan.png";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default class Loading extends React.Component {
  state = {
    listLen: 6,
    colorList: [],
    count: 0,
    test: [],
    allTrue: false,
    allFalse: false,
  };

  componentDidMount() {
    this.getList();
  }

  getList = async () => {
    for (let id = 0; id < 6; id++) {
      const { colorList } = this.state;
      let temp = Math.random() < 0.5;
      await this.setState({
        colorList: colorList.concat({
          id: id,
          chosen: temp,
          key: id,
        }),
        test: this.state.test.concat(temp),
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
    let newTest = this.state.test.slice();
    newTest[num] = !this.state.test[num];
    this.setState({
      colorList: colorList.map((color) =>
        color.id == num ? { ...color, chosen: !color.chosen } : color
      ),
      test: newTest,
    });
  };

  allReward = () => {
    if (this.state.test.length == this.state.listLen) {
      if (this.state.test.every((val) => val)) {
        return (
          <MaterialCommunityIcons
            name="crown"
            size={150}
            color="#e44888"
            style={{
              position: "absolute",
              top: 150,
              left: 0,
              right: 0,
              textAlign: "center",
            }}
          />
        );
      }
      if (this.state.test.every((val) => !val)) {
        return (
          <MaterialCommunityIcons
            name="crown"
            size={150}
            color="#28aaaa"
            style={{
              position: "absolute",
              top: 150,
              left: 0,
              right: 0,
              textAlign: "center",
            }}
          />
        );
      }
    }
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
        {this.allReward()}
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
            fontSize: 30,
            paddingTop: 40,
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
