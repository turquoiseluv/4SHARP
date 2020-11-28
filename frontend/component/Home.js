import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
} from "react-native";
import { Camera } from "expo-camera";
import * as Permissions from "expo-permissions";
import {
  Ionicons,
  MaterialIcons,
  Foundation,
  Entypo,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { PinchGestureHandler, State } from "react-native-gesture-handler";
import { AppLoading } from "expo";

import * as ScreenOrientation from "expo-screen-orientation";

// StatusBar 등의 가변 객체 정보
import Constants from "expo-constants";
// 이미지 선택 후 이미지뷰어 화면
import Select from "./Select";
import Loading from "./Loading";
import Choice from "./Choice";

const screen = Dimensions.get("window");

const flashModeOrder = {
  off: "on",
  on: "auto",
  auto: "torch",
  torch: "off",
};

const flashIcons = {
  off: "flash-off",
  on: "flash-on",
  auto: "flash-auto",
  torch: "highlight",
};

const wbOrder = {
  auto: "sunny",
  sunny: "cloudy",
  cloudy: "shadow",
  shadow: "fluorescent",
  fluorescent: "incandescent",
  incandescent: "auto",
};

const wbIcons = {
  auto: "wb-auto",
  sunny: "wb-sunny",
  cloudy: "wb-cloudy",
  shadow: "beach-access",
  fluorescent: "wb-iridescent",
  incandescent: "wb-incandescent",
};

export default class Home extends React.Component {
  state = {
    sessionid: null,
    camPerm: false,
    camRollPerm: false,
    hasPermission: false, //권한
    cameraType: Camera.Constants.Type.back, //전면 카메라, 후면카메라 현재값은 후면카메라
    selected: false, //사진 데이터 값이 생기면 다음화면으로 넘어가기 위해 설정한 state
    uri: this.props.uri, //사진의 uri 값을 넣기 위한 state
    maskLen: null,

    // 부가 옵션들
    flash: "off",
    zoom: 0,
    autoFocus: "on",
    type: "back",
    whiteBalance: "auto",
    barcodeScanning: false,
    newPhotos: false,
    showMoreOptions: false,
    //프레임 보기/숨기기
    galleryMode: false,
    showFrame: true,
    showSelect: this.props.showSelect,
    showChoice: false,

    baseScale: 1,
    pinchScale: 1,
    startScale: 1,
    lastScale: 1,
  };

  componentDidMount() {
    this.setState({
      sessionid: Constants.sessionId.slice(0, 8),
    });
    this.getPermissionAsync();
    this.getPermissionRollAsync();
  }

  getPermissionAsync = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ camPerm: status === "granted" });
  };

  getPermissionRollAsync = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    this.setState({ camRollPerm: status === "granted" });
  };

  toggleFrame = () => {
    this.setState({ showFrame: !this.state.showFrame });
  };

  toggleMoreOptions = () =>
    this.setState({ showMoreOptions: !this.state.showMoreOptions });

  toggleFacing = () =>
    this.setState({ type: this.state.type === "back" ? "front" : "back" });

  toggleWB = () =>
    this.setState({ whiteBalance: wbOrder[this.state.whiteBalance] });

  toggleFocus = () =>
    this.setState({ autoFocus: this.state.autoFocus === "on" ? "off" : "on" });

  zoomIn = (scale) => {
    const { zoom } = this.state;
    this.setState({
      zoom: zoom + scale * 0.5 > 4 / 9 ? 4 / 9 : zoom + scale * 0.25,
    });
  };

  zoomOut = (scale) => {
    const { zoom } = this.state;
    this.setState({
      zoom: zoom + scale * 0.5 < 0 ? 0 : zoom + scale * 0.25,
    });
  };

  toggleFlash = () =>
    this.setState({ flash: flashModeOrder[this.state.flash] });

  takePicture = async () => {
    //사진촬영 메소드
    const { uri } = await this.camera.takePictureAsync();
    await MediaLibrary.createAssetAsync(uri); //촬영후 앨범에 접근하여 저장하는 메소드
    this.setState({
      newPhotos: true,
      uri: uri,
    }); //uri를 데이터를 넣어주고 다음화면으로 넘어갈 수 있게 next true로 바꿈
  };

  pickImage = async () => {
    //album에서 사진 가져오는 메소드
    this.setState({ galleryMode: true });
    const { uri } = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (uri) {
      this.setState({
        galleryMode: false,
        newPhotos: false,
        showChoice: true,
        uri: uri,
      });
    }
  };

  renderTopBar = () => {
    const { showFrame, flash, whiteBalance, autoFocus } = this.state;
    return (
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={this.toggleFrame}
        >
          <MaterialCommunityIcons
            name={
              showFrame ? "arrow-expand-vertical" : "arrow-collapse-vertical"
            }
            size={32}
            color="white"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={this.toggleFlash}
        >
          <MaterialIcons name={flashIcons[flash]} size={32} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.toggleButton} onPress={this.toggleWB}>
          <MaterialIcons name={wbIcons[whiteBalance]} size={32} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={this.toggleFocus}
        >
          <Text
            style={[
              styles.autoFocusLabel,
              { color: autoFocus === "on" ? "white" : "#6b6b6b" },
            ]}
          >
            AF
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  renderBottomBar = () => {
    const { zoom, newPhotos } = this.state;
    return (
      <View style={styles.bottomB}>
        <View>
          <Text style={styles.scaleText}>
            {(Math.round((1 + zoom * 9) * 10) / 10).toFixed(1)}x
          </Text>
        </View>
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.bottomSideButton}
            onPress={this.toggleFacing}
          >
            <Entypo name="cycle" size={26} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bottomButton}
            onPress={this.takePicture}
          >
            <Ionicons name="ios-radio-button-on" size={75} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bottomSideButton}
            onPress={this.pickImage}
          >
            <View>
              <Foundation name="thumbnails" size={30} color="white" />
              {newPhotos && <View style={styles.newPhotosDot} />}
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  renderCamera = () => {
    const {
      galleryMode,
      showFrame,
      type,
      flash,
      autoFocus,
      zoom,
      whiteBalance,
    } = this.state;

    let { pinchScale, baseScale, lastScale } = this.state;

    const onPinchEvent = Animated.event(
      [{ nativeEvent: { scale: pinchScale } }],
      {
        useNativeDriver: true,
        listener: (event) => {
          baseScale = event.nativeEvent.scale - lastScale;
          lastScale = event.nativeEvent.scale;
          if (event.nativeEvent.scale > 1) {
            this.zoomIn(baseScale);
          } else {
            this.zoomOut(baseScale);
          }
        },
      }
    );

    const onPinchHandlerStateChange = (event) => {
      if (event.nativeEvent.oldState === State.ACTIVE) {
        lastScale = 1;
      }
    };

    return (
      <View style={{ flex: 1 }}>
        <StatusBar
          barStyle={galleryMode ? "dark-content" : "light-content"}
          translucent={true}
        />
        <View
          style={[showFrame ? styles.topFrameBlack : styles.topFrameTrans]}
        ></View>
        <PinchGestureHandler
          onGestureEvent={onPinchEvent}
          onHandlerStateChange={onPinchHandlerStateChange}
        >
          <Animated.View style={{ flex: 1 }}>
            <Camera
              ref={(ref) => {
                this.camera = ref;
              }}
              style={styles.camera}
              type={type}
              flashMode={flash}
              autoFocus={autoFocus}
              zoom={zoom}
              whiteBalance={whiteBalance}
              onMountError={this.handleMountError}
            ></Camera>
          </Animated.View>
        </PinchGestureHandler>
        <View
          style={[
            showFrame ? styles.bottomFrameBlack : styles.bottomFrameTrans,
          ]}
        ></View>
        {this.renderTopBar()}
        {this.renderBottomBar()}
      </View>
    );
  };

  renderNoPermission = () => {
    //권한이 거절일때 나오는 부분
    return (
      <View style={styles.noPerm}>
        <StatusBar barStyle="light-content" translucent={true} />
        <Text style={styles.noPermText}>
          No access to camera! {`\n`} Please give permission to your Camera &
          Gallery
        </Text>
      </View>
    );
  };

  imageUploading = () => {
    const { sessionid, uri } = this.state;

    const form = new FormData();
    form.append("test", {
      uri: uri,
      type: "image",
      name: sessionid, //파일이름 변경할 시 변경
    });
    fetch("http://winners.dothome.co.kr/image_upload.php", {
      method: "POST",
      body: form,
      headers: {
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
      },
    })
      .then((response) => response.text()) //response중 쓸대없는 값 제거후 php에서 보내준 echo값만 뽑아옴.
      .then((responseJson) => {
        // 성공
        this.setState({
          maskLen: responseJson.slice(1, -1),
        });
      })
      .catch((error) => {
        // 실패시 로그
        console.log(error);
      });
  };

  renderChoice = () => {
    const { uri, sessionid } = this.state;
    return <Choice uri={uri} sessionid={sessionid} />;
  };

  renderSelect = () => {
    const { maskLen, sessionid, uri } = this.state;
    if (!maskLen) {
      return (
        <View style={{ flex: 1 }}>
          <AppLoading
            startAsync={this.imageUploading}
            onFinish={() => this.setState({ maskLen: maskLen })}
            onError={console.warn}
          />
          <Loading />
        </View>
      );
    }
    return <Select sessionid={sessionid} uri={uri} maskLen={maskLen} />;
  };

  changeScreenOrientation = async () => {
    await ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.PORTRAIT_UP
    );
  };

  render() {
    this.changeScreenOrientation();
    const { showSelect, uri, showChoice, camPerm, camRollPerm } = this.state;
    if (showSelect && uri) {
      return this.renderSelect();
    } else if (showChoice) {
      return this.renderChoice();
    } else if (camPerm && camRollPerm) {
      return this.renderCamera();
    } else if (!camPerm || !camRollPerm) {
      return this.renderNoPermission();
    } else {
      return null;
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  noPerm: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "black",
  },
  noPermText: {
    fontSize: 15,
    color: "white",
    textAlign: "center",
  },
  camera: {
    flex: 1,
    justifyContent: "space-between",
  },
  topFrameBlack: {
    flex: 0.2,
    backgroundColor: "black",
  },
  topFrameTrans: {
    flex: 0,
    backgroundColor: "black",
  },
  bottomFrameBlack: {
    flex: 0.3,
    backgroundColor: "black",
  },
  bottomFrameTrans: {
    flex: 0,
    backgroundColor: "black",
  },
  topBar: {
    flex: 1,
    backgroundColor: "transparent",
    flexDirection: "row",
    justifyContent: "space-between",
    position: "absolute",
    top: (Constants.statusBarHeight + 10) / 2,
  },
  scaleText: {
    alignSelf: "flex-end",
    textAlign: "center",
    bottom: 25,
    width: 50,
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ffffffbb",
    borderRadius: 20,
    marginHorizontal: 8,
    color: "#ffffffbb",
  },
  bottomB: {
    position: "absolute",
    width: screen.width,
    bottom: 35,
  },
  bottomBar: {
    // backgroundColor: "green",
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  bottomSideButton: {
    // backgroundColor: "blue",
    height: 75,
    flex: 0.75,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomButton: {
    // backgroundColor: "blue",
    height: 75,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleButton: {
    flex: 0.25,
    height: 40,
    marginHorizontal: 2,
    marginBottom: 10,
    marginTop: 20,
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  autoFocusLabel: {
    fontSize: 20,
    fontWeight: "bold",
  },
  newPhotosDot: {
    position: "absolute",
    top: 0,
    right: -5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#e44888",
  },
  options: {
    position: "absolute",
    bottom: 80,
    left: 30,
    width: 200,
    height: 160,
    backgroundColor: "#000000BA",
    borderRadius: 4,
    padding: 10,
  },
  detectors: {
    flex: 0.5,
    justifyContent: "space-around",
    alignItems: "center",
    flexDirection: "row",
  },
  row: {
    flexDirection: "row",
  },
  topFrame: {
    flex: 0.2,
  },
  bottomFrame: {
    flex: 0.4,
  },
  camFrame: {
    flex: 1,
    position: "absolute",
    backgroundColor: "black",
  },
});
