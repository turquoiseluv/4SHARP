import React, { Component, useState, useEffect } from "react";
import Slider from "@react-native-community/slider";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import Constants from "expo-constants";
import ExpoPixi from "expo-pixi";
import {
  MaterialIcons,
  Fontisto,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
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

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

export default class UserMode extends Component {
  state = {
    setimage: null,
    camRollPerm: false,
    rollGranted: false,
    cameraGranted: false,
    uploading: false,

    image: "",
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
  }

  getPermissionRollAsync = async () => {
    const { status } = await ImagePicker.requestCameraRollPermissionsAsync();
    this.setState({ camRollPerm: status === "granted" });
  };

  onReady = () => {
    console.log("sketch ready!");
  };

  onChangeAsync = async () => {
    const { uri } = await this.sketch.takeSnapshotAsync();
    this.setState({
      uri: uri,
    });
    // console.log(uri);
  };

  uploadImageAsync = async (uri) => {
    let apiUrl = "http://127.0.0.1:8000/api/item/";

    let uriParts = uri.split(".");
    let fileType = uriParts[uriParts.length - 1];

    let formData = new FormData();
    formData.append("image", {
      uri,
      name: `image.${fileType}`,
      type: `image/${fileType}`,
    });

    let options = {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
      },
    };

    return fetch(apiUrl, options);
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
        {}
      );
      console.log(manipResult);

      uploadResponse = await this.uploadImageAsync(manipResult.uri);
      uploadResult = await uploadResponse.json();

      this.setState({
        item: {
          ...this.state.item,
          image: uploadResult.location,
        },
      });
    } catch (e) {
      console.log({ e });
    } finally {
      this.setState({
        uploading: false,
        goBack: true,
      });
    }
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

  uploadButton = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
    });

    if (!result.cancelled) {
      // 이미지 선택을 취소하지 않으면
      this.clearMask();
      await this.setState({ imgLoaded: true, image: result.uri });
      Image.getSize(this.state.image, (width, height) => {
        this.setState({
          scale: height / width,
          sketchHeight: Math.round((height * windowWidth) / width),
        });
      });
    }
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
    if (this.state.imgLoaded == true) {
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
    } else {
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
          <MaterialCommunityIcons
            name="border-none-variant"
            size={100}
            color="white"
          />
          <Text
            style={{
              color: "white",
              fontSize: 20,
              padding: 20,
            }}
          >
            파일을 업로드 해주세요!
          </Text>
        </View>
      );
    }
  };

  renderUser() {
    return (
      <View style={styles.container}>
        <Image
          resizeMode="contain"
          style={{
            flex: 1,
          }}
          source={{
            uri: this.state.image,
          }}
        />
        {this.renderSketch()}

        <TouchableOpacity
          style={styles.undoButton}
          activeOpacity={0.4}
          onPress={this.undoMask}
        >
          <MaterialIcons name="rotate-left" size={26} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.uploadButton}
          activeOpacity={0.4}
          onPress={this.uploadButton}
        >
          <MaterialIcons name="photo" size={26} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.clearButton}
          activeOpacity={0.4}
          onPress={this.clearMask}
        >
          <Fontisto name="eraser" size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.saveButton}
          activeOpacity={0.4}
          onPress={this.saveMask}
        >
          <MaterialIcons name="check" size={26} color="white" />
        </TouchableOpacity>
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
  }

  renderSelect = () => {
    return <Select />;
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
});
