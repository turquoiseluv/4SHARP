import React, { Component } from "react";
import Slider from "@react-native-community/slider";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import Constants from "expo-constants";
import ExpoPixi from "expo-pixi";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import Select from "./Select";

import * as ImagePicker from "expo-image-picker";

import * as ImageManipulator from "expo-image-manipulator";

import { YellowBox } from "react-native";
YellowBox.ignoreWarnings([
  "Require cycle:",
  "Warning: componentWillMount has been renamed",
  "Possible Unhandled Promise Rejection",
  "source.uri should not be an empty string",
]);

const screen = Dimensions.get("window");
const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

export default class UserMode extends Component {
  state = {
    setimage: null,
    camRollPerm: false,
    rollGranted: false,
    cameraGranted: false,
    uploading: false,

    image: this.props.uri,
    mask: null,
    color: 0xe44888,
    alpha: 1,
    width: 50,
    uri: null,

    imgLoaded: false,
    scale: 0,
    sketchHeight: windowHeight,

    goBack: false,

    item: {
      id: null,
      title: "",
      description: "",
      image: null,
    },
  };

  componentDidMount() {
    this.getPermissionRollAsync();
    this.getImageSize();
  }

  getPermissionRollAsync = async () => {
    const { status } = await ImagePicker.requestCameraRollPermissionsAsync();
    this.setState({ camRollPerm: status === "granted" });
  };

  onReady = () => {
    // console.log("sketch ready!");
  };

  onChangeAsync = async () => {
    const { uri } = await this.sketch.takeSnapshotAsync();
    this.setState({
      uri: uri,
    });
    // console.log(uri);
  };

  uploadImageAsync = async (uri) => {
    // let uriParts = uri.split(".");
    // let fileType = uriParts[uriParts.length - 1];

    const form = new FormData();
    form.append("mask", {
      uri: uri,
      name: "0", //파일이름 변경할 시 변경
    });
    await fetch("http://zpunsss.dothome.co.kr/image_upload_user.php", {
      method: "POST",
      body: form,
      headers: {
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
      },
    })
      .then((response) => response.text()) //response중 쓸대없는 값 제거후 php에서 보내준 echo값만 뽑아옴.
      .then((responseJson) => {
        console.log(responseJson);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  saveMask = async () => {
    let uploadResponse, uploadResult;

    try {
      this.setState({
        uploading: true,
      });

      const manipResult = await ImageManipulator.manipulateAsync(
        this.state.uri,
        [
          { resize: { width: windowWidth } },
          {
            crop: {
              originX: 0,
              originY: Math.round((windowHeight - this.state.sketchHeight) / 2),
              width: windowWidth,
              height: this.state.sketchHeight,
            },
          },
        ],
        { format: ImageManipulator.SaveFormat.PNG }
      );
      // console.log(manipResult);

      await this.uploadImageAsync(manipResult.uri);
    } catch (e) {
      // console.log({ e });
    } finally {
      this.setState({
        uploading: false,
        goBack: true,
      });
    }
  };

  pressedBack = () => {
    this.setState({ goBack: !this.state.goBack });
  };

  undoMask = () => {
    try {
      if (this.sketch.stage.children.length > 0) {
        const { uri } = this.sketch.undo();
        this.setState({
          item: {
            uri: uri,
          },
        });
      }
    } catch (e) {
      console.log(e);
    }
  };

  getImageSize = async () => {
    Image.getSize(this.state.image, (width, height) => {
      this.setState({
        imgLoaded: true,
        scale: height / width,
        sketchHeight: Math.round(windowWidth * (height / width)),
      });
    });
  };

  clearMask = async () => {
    try {
      if (this.sketch.stage.children.length > 0) {
        this.sketch.stage.removeChildren();
        this.sketch.renderer._update();
        const { uri } = await this.sketch.takeSnapshotAsync();
        this.setState({
          item: {
            uri: uri,
          },
        });
      }
    } catch (e) {
      console.log(e);
    }
  };

  renderSketch = () => {
    return (
      <View
        style={{
          flex: 1,
          position: "absolute",
          height: windowHeight,
          width: windowWidth,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ExpoPixi.Sketch
          resizeMode="contain"
          ref={(ref) => (this.sketch = ref)}
          strokeColor={this.state.color}
          strokeWidth={this.state.width}
          strokeAlpha={this.state.alpha}
          style={{
            flex: 1,
            position: "absolute",
            height: windowHeight,
            width: windowWidth,
          }}
          onChange={this.onChangeAsync}
          onReady={this.onReady}
        />
      </View>
    );
  };

  renderBottomBar = () => {
    return (
      <View style={styles.bottomB}>
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.bottomButton}
            activeOpacity={0.4}
            onPress={this.pressedBack}
          >
            <MaterialIcons name="close" size={32} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bottomButton}
            activeOpacity={0.4}
            onPress={this.undoMask}
          >
            <MaterialIcons name="rotate-left" size={32} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bottomButton}
            activeOpacity={0.4}
            onPress={this.clearMask}
          >
            <MaterialCommunityIcons
              name="delete-sweep"
              size={30}
              color="white"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bottomButton}
            activeOpacity={0.4}
            onPress={this.saveMask}
          >
            <MaterialIcons name="check" size={32} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  renderUser() {
    if (this.state.imgLoaded == true) {
      return (
        <View style={styles.container}>
          <Image
            resizeMode="contain"
            style={{
              flex: 1,
              position: "absolute",
              height: windowHeight,
              width: windowWidth,
              justifyContent: "center",
              alignItems: "center",
            }}
            source={{
              uri: this.state.image,
            }}
          />
          {this.renderMask()}
          {this.renderSketch()}

          {this.renderBottomBar()}

          <Slider
            style={styles.widthSlider}
            step={5}
            value={this.state.width}
            minimumValue={20}
            maximumValue={80}
            onSlidingComplete={(val) => this.setState({ width: val })}
            minimumTrackTintColor="#ffffffff"
            maximumTrackTintColor="#ffffff25"
          />
        </View>
      );
    } else {
      return <View style={{ flex: 1, backgroundColor: "#000" }}></View>;
    }
  }

  renderSelect = () => {
    return <Select masks={this.props.masks} />;
  };

  renderMask = () => {
    const { masks } = this.props;
    //masks가 불려오기 전에 호출하지 않게...
    const list = masks.map((info) => (
      <Image
        source={{ uri: info.uri }}
        style={{
          width: screen.width,
          height: screen.height,
          position: "absolute",
          tintColor: masks[info.id].selected ? "#e44888ff" : "#00000000",
        }}
        resizeMode={"contain"}
        key={info.key}
      />
    ));
    return list;
  };

  render() {
    if (this.state.goBack) {
      return this.renderSelect();
    } else {
      return this.renderUser();
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
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
  uploadButton: {
    marginTop: 30,
    width: 80,
    height: 40,
    borderRadius: 4.5,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 75,
  },
  clearButton: {
    marginTop: 30,
    width: 80,
    height: 40,
    borderRadius: 4.5,
    justifyContent: "center",
    alignSelf: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 25,
  },
  saveButton: {
    marginTop: 30,
    width: 80,
    height: 40,
    borderRadius: 4.5,
    justifyContent: "center",
    alignSelf: "flex-end",
    alignItems: "center",
    position: "absolute",
    bottom: 25,
  },
  widthSlider: {
    marginHorizontal: 10,
    width: windowWidth * 0.8,
    position: "absolute",
    alignSelf: "center",
    top: 50,
  },
  buttonText: {
    fontSize: 20,
    color: "#000",
  },
  bottomB: {
    position: "absolute",
    width: screen.width,
    bottom: 35,
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  bottomSideButton: {
    height: 75,
    flex: 0.75,
    alignItems: "center",
    justifyContent: "center",
  },
});
