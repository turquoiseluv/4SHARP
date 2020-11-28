import React from "react";
import {
  Text,
  Image,
  Dimensions,
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ImageZoom from "react-native-image-pan-zoom";
import Home from "./Home";
import UserMask from "./UserMask";
import { AntDesign } from "@expo/vector-icons";
import Loading from "./Loading";
import Result from "./Result";

const screen = Dimensions.get("window");

export default class Select extends React.Component {
  state = {
    sessionid: this.props.sessionid,
    uri: this.props.uri,
    maskLen: this.props.maskLen,
    ratio: 0,
    scale: 0,
    axisX: 0,
    axisY: 0,
    imageX: 0,
    imageY: 0,
    goBack: false,
    maskLoaded: false,
    userMode: false,
    isWaiting: false,
    submitDone: false,
    masks: [
      {
        id: 0,
        uri: "",
        selected: false,
        key: 0,
      },
    ],
  };

  componentDidMount() {
    this.maskDownloading();
  }

  maskDownloading = async () => {
    const { masks, maskLen, sessionid } = this.state;
    if (this.props.masks) {
      this.setState({ masks: this.props.masks, maskLoaded: true });
    } else {
      for (let id = 1; id < maskLen; id++) {
        let masknumber = id;
        await this.setState({
          masks: masks.concat({
            id: id,
            uri: `http://winners.dothome.co.kr/${sessionid}/${masknumber}.png`,
            selected: false,
            key: id,
          }),
        });
      }
      this.setState({ maskLoaded: true });
    }
  };

  detectImageSelected = (num) => {
    const { masks } = this.state;
    this.setState({
      masks: masks.map((mask) =>
        mask.id == num ? { ...mask, selected: !mask.selected } : mask
      ),
    });
  };

  userMode = async () => {
    this.setState({
      userMode: true,
    });
  };

  // 좌우비율이 같을때, 상하비율로 그림인지 판단
  onPicPress = (px) => {
    const { scale, imageX, imageY, maskLen, sessionid } = this.state;
    if (px.pageX != px.locationX || px.pageY != px.locationY) {
      this.setState({
        axisX: px.locationX,
        imageX: px.locationX * scale,
        axisY: px.locationY,
        imageY: px.locationY * scale,
      });
      let x = Math.round(imageX);
      let y = Math.round(imageY);
      console.log(x, y, maskLen, sessionid);
      fetch(
        `http://winners.dothome.co.kr/checking_mask_number.php?maskLen=${maskLen}&x=${x}&y=${y}&session=${sessionid}`
      )
        .then((response) => response.text())
        .then((responseText) => {
          if (responseText) {
            console.log(responseText);
            this.detectImageSelected(responseText);
          }
        })
        .catch((error) => alert(error));
    }
  };

  pressedBack = () => {
    this.setState({ goBack: !this.state.goBack });
  };

  submit = () => {
    const { masks, isWaiting, sessionid, submitDone } = this.state;
    this.setState({ isWaiting: !isWaiting });

    var result = [];

    masks.map((mask) => {
      if (mask.selected == true) {
        result.push(mask.id);
      }
    });

    fetch(`http://winners.dothome.co.kr/inpainting.php?session=${sessionid}`, {
      method: "POST", // or 'PUT'
      body: JSON.stringify(result), // data can be `string` or {object}!
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.text())
      .then((res) => {
        console.log(res),
          this.setState({
            submitDone: !submitDone,
            isWaiting: !isWaiting,
          });
      })
      .catch((error) => console.error("Error:", error));
  };

  renderHome = () => {
    return <Home />;
  };

  renderSelect = () => {
    const { ratio, uri } = this.state;
    return (
      <View style={{ backgroundColor: "black" }}>
        <StatusBar barStyle="light-content" translucent={true} />
        <ImageZoom
          cropWidth={screen.width}
          cropHeight={screen.height}
          imageWidth={screen.width}
          imageHeight={screen.width * ratio}
          onClick={(px) => {
            this.onPicPress(px);
          }}
          useNativeDriver={true}
        >
          <Image
            style={{
              width: screen.width,
              height: screen.width * ratio,
            }}
            source={{ uri: uri }}
          />
          {this.renderMask()}
        </ImageZoom>
        {this.renderBottomBar()}
      </View>
    );
  };

  renderBottomBar = () => {
    return (
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.bottomButtom}
          onPress={this.pressedBack}
        >
          <View>
            <AntDesign name="closecircleo" size={30} color="white" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomButtom} onPress={this.userMode}>
          <View>
            <MaterialCommunityIcons name="draw" size={32} color="white" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomButtom} onPress={this.submit}>
          <View>
            <AntDesign name="checkcircleo" size={30} color="white" />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  renderMask = () => {
    const { masks, ratio } = this.state;
    //masks가 불려오기 전에 호출하지 않게...
    const list = masks.map((info) => (
      <Image
        source={{ uri: info.uri }}
        style={{
          width: screen.width,
          height: screen.width * ratio,
          position: "absolute",
          tintColor: masks[info.id].selected ? "#e4488877" : "#28aaaa77",
        }}
        resizeMode={"contain"}
        key={info.key}
      />
    ));
    return list;
  };

  renderUser = () => {
    const { uri, masks, ratio, maskLen, sessionid } = this.state;

    return (
      <UserMask
        uri={uri}
        masks={masks}
        ratio={ratio}
        maskLen={maskLen}
        sessionid={sessionid}
      />
    );
  };

  render() {
    const {
      isWaiting,
      submitDone,
      sessionid,
      ratio,
      goBack,
      userMode,
      maskLoaded,
    } = this.state;
    if (isWaiting) {
      // render() 앞으로 뺼 수 있으면 빼보자(UserMask 구조와 통일)
      return (
        <View style={{ flex: 1 }}>
          <Loading />
        </View>
      );
    } else if (submitDone) {
      return <Result sessionid={sessionid} />;
    }
    if (ratio === 0) {
      Image.getSize(this.props.uri, (width, height) => {
        this.setState({
          ratio: height / width,
          scale: width / screen.width,
        });
      });
    }
    if (goBack) {
      return this.renderHome();
    } else if (userMode) {
      return this.renderUser();
    } else if (maskLoaded) {
      return this.renderSelect();
    } else {
      return null;
    }
  }
}

const styles = StyleSheet.create({
  text: {
    color: "white",
  },
  textBox: {
    backgroundColor: "#000000aa",
    position: "absolute",
    bottom: 150,
    padding: 10,
    alignContent: "center",
  },
  bottomBar: {
    position: "absolute",
    width: screen.width,
    bottom: 35,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  bottomSideButton: {
    // backgroundColor: "blue",
    height: 75,
    flex: 0.75,
    alignItems: "center",
    justifyContent: "center",
  },
});
