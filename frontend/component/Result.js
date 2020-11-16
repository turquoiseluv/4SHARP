import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Image,
  Text,
  Alert,
  Linking,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";

import * as Permissions from "expo-permissions";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";

import Home from "./Home";
const screen = Dimensions.get("window");

export default class Result extends React.Component {
  state = {
    sessionid: null,
    uri: "http://winners.dothome.co.kr/original/4%23_original.png",
    goBack: false,
  };

  componentDidMount() {}

  renderBottomBar = () => (
    <View style={styles.bottomBar}>
      <TouchableOpacity style={styles.bottomButton} onPress={this.deleteImage}>
        <AntDesign name="delete" size={30} color="white" />
        <Text style={{ color: "white", fontSize: 18, padding: 8 }}>삭제</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.bottomButton} onPress={this.saveImage}>
        <AntDesign name="save" size={32} color="white" />
        <Text style={{ color: "white", fontSize: 18, padding: 8 }}>저장</Text>
      </TouchableOpacity>
    </View>
  );

  deleteImage = () => {
    Alert.alert(
      "정말 삭제하시겠습니까?",
      "삭제된 이미지는 되돌릴 수 없습니다.",
      [
        { text: "예", onPress: () => this.pressedBack() },
        {
          text: "아니요",
          onPress: () => console.log("아니요 Pressed"),
        },
      ],
      { cancelable: false }
    );
  };

  pressedBack = () => {
    this.setState({ goBack: !this.state.goBack });
  };

  saveImage = () => {
    console.log("저장 Pressed");
    this._downloadFile();
  };

  _downloadFile = async () => {
    console.log("#####");
    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    console.log(status);

    //permission for camera_roll
    if (status === "granted") {
      console.log("#####");
      //store the cached file
      const file = await FileSystem.downloadAsync(
        this.state.uri,
        FileSystem.documentDirectory + "filename.jpg"
      );
      console.log(file);

      //save the image in the galery using the link of the cached file
      const assetLink = await MediaLibrary.createAssetAsync(file.uri);
      console.log(file, assetLink);
    }
  };

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

  render() {
    if (this.state.goBack) {
      return <Home />;
    }
    return (
      <View style={styles.container}>
        <StatusBar barStyle={"light-content"} translucent={true} />
        {this.renderImage()}
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
  undoButton: {
    marginTop: 30,
    width: 80,
    height: 40,
    borderRadius: 4.5,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 25,
  },
  bottomB: {
    position: "absolute",
    width: screen.width,
    bottom: 35,
  },
  bottomBar: {
    position: "absolute",
    width: screen.width,
    bottom: 35,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  bottomButton: {
    // backgroundColor: "blue",
    height: 75,
    flex: 0.75,
    alignItems: "center",
    justifyContent: "center",
  },
  testButton: {
    alignItems: "center",
    backgroundColor: "#DDDDDD",
    padding: 10,
  },
});
