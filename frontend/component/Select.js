import React from "react";
import {
  Text,
  Image,
  Dimensions,
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
} from "react-native";
import { Foundation, Entypo, MaterialCommunityIcons } from "@expo/vector-icons";
import ImageZoom from "react-native-image-pan-zoom";
import Home from "./Home";
import { AntDesign } from "@expo/vector-icons";
import isIPhoneX from "react-native-is-iphonex";

import mask1 from "../images/testing/1.png";
import mask2 from "../images/testing/2.png";
import mask3 from "../images/testing/3.png";
import mask4 from "../images/testing/4.png";
import mask5 from "../images/testing/5.png";

const screen = Dimensions.get("window");

export default class Select extends React.Component {
  state = {
    uri: this.props.uri,
    ratio: 0,
    scale: 0,
    axisX: 0,
    axisY: 0,
    imageX: 0,
    imageY: 0,
    goBack: false,
    imgLoaded: false,
    masks: [
      {
        id: 0,
        uri: mask1,
        selected: false,
        xLow: 45,
        xHigh: 170,
        yLow: 130,
        yHigh: 280,
      },
      {
        id: 1,
        uri: mask2,
        selected: false,
        xLow: 175,
        xHigh: 260,
        yLow: 135,
        yHigh: 280,
      },
      {
        id: 2,
        uri: mask3,
        selected: false,
        xLow: 275,
        xHigh: 345,
        yLow: 140,
        yHigh: 270,
      },
      {
        id: 3,
        uri: mask4,
        selected: false,
        xLow: 345,
        xHigh: 415,
        yLow: 50,
        yHigh: 235,
      },
      {
        id: 4,
        uri: mask5,
        selected: false,
        xLow: 365,
        xHigh: 510,
        yLow: 235,
        yHigh: 315,
      },
    ],
  };

  componentDidMount() {
    this.imageDownloading();
  }

  detectImageSelected = (x, y) => {
    const { masks } = this.state;
    this.setState({
      masks: masks.map((mask) =>
        mask.xLow < x && x < mask.xHigh && mask.yLow < y && y < mask.yHigh
          ? { ...mask, selected: !mask.selected }
          : mask
      ),
    });
  };

  imageDownloading = () => {
    fetch("http://zpunsss.dothome.co.kr/php/downtest2.php", {
      method: "POST",
    })
      .then((response) => response.blob())
      .then((blob) => {
        var reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          var base64data = reader.result;
          this.setState({
            uri: base64data,
            imgLoaded: true,
          });
        };
      });
  };

  imageUploading = () => {
    const uri = this.state.uri;
    console.log("hi");
    const form = new FormData();

    form.append("test", {
      uri: uri,
      type: "image/jpg",
      name: "test.jpg",
    });

    fetch("http://zpunsss.dothome.co.kr/php/test.php", {
      method: "POST",
      body: form,
      headers: {
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
      },
    })
      .then((response) => {
        console.log(JSON.stringify(response));
        // 성공시 카메라로 or 알림 닫기
        Alert.alert(
          "Upload Successful",
          "성공적으로 업로드 되었습니다.",
          [
            { text: "카메라", onPress: this.pressedBack },
            { text: "닫기", onPress: () => console.log("닫기 누름") },
          ],
          { cancelable: false }
        );
      })
      .catch((error) => {
        console.log(error);
        Alert.alert("Upload Failed", "업로드가 실패했습니다.");
        // 실패시 알림 확인만
      });
  };

  // 좌우비율이 같을때, 상하비율로 그림인지 판단
  onPicPress = (px) => {
    const { scale } = this.state;
    if (px.pageX != px.locationX || px.pageY != px.locationY) {
      this.setState({
        axisX: px.locationX,
        imageX: px.locationX * scale,
        axisY: px.locationY,
        imageY: px.locationY * scale,
      });
      this.detectImageSelected(this.state.imageX, this.state.imageY);
    }
  };

  pressedBack = () => {
    this.setState({ goBack: !this.state.goBack });
  };

  confirmSelect = () => {
    const { masks } = this.state;
    let log = "";
    masks.map((mask) => {
      if (mask.selected == true) {
        log += mask.id + 1 + " ";
      }
    });
    log === ""
      ? Alert.alert("no mask selected!")
      : Alert.alert(log + "mask selected.");
  };

  renderHome = () => {
    return <Home />;
  };

  renderSelect = () => {
    return (
      <View style={{ backgroundColor: "black" }}>
        <StatusBar barStyle="light-content" translucent={true} />
        <ImageZoom
          cropWidth={screen.width}
          cropHeight={screen.height}
          imageWidth={screen.width}
          imageHeight={screen.width * this.state.ratio}
          onClick={(px) => {
            this.onPicPress(px);
          }}
          useNativeDriver={true}
        >
          <Image
            style={{
              width: screen.width,
              height: screen.width * this.state.ratio,
            }}
            source={{ uri: this.state.uri }}
          />
          {this.renderMask()}
        </ImageZoom>
        <View style={styles.textBox}>
          <Text style={styles.text}>
            {"화면 좌표: [ " +
              Math.round(this.state.axisX) +
              " , " +
              Math.round(this.state.axisY) +
              " ]"}
          </Text>
          <Text style={styles.text}>
            {"이미지 좌표: [ " +
              Math.round(this.state.imageX) +
              " , " +
              Math.round(this.state.imageY) +
              " ]"}
          </Text>
        </View>
        {this.renderTopBar()}
      </View>
    );
  };

  renderTopBar = () => {
    return (
      <View style={styles.topB}>
        <TouchableOpacity style={styles.backbtn} onPress={this.pressedBack}>
          <View>
            <AntDesign name="closecircleo" size={30} color="white" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backbtn} onPress={this.imageUploading}>
          <View>
            <AntDesign name="upload" size={30} color="white" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backbtn} onPress={this.confirmSelect}>
          <View>
            <AntDesign name="checkcircleo" size={30} color="white" />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  renderMask = () => {
    const { masks } = this.state;
    //masks가 불려오기 전에 호출하지 않게...
    if (masks != []) {
      const list = masks.map((info) => (
        <Image
          key={info.id}
          source={info.uri}
          style={{
            width: screen.width,
            height: screen.width * this.state.ratio,
            position: "absolute",
            tintColor: masks[info.id].selected ? "#e4488877" : "#28aaaa77",
          }}
          resizeMode={"contain"}
        ></Image>
      ));
      return list;
    }
  };

  render() {
    if (this.state.ratio === 0 && this.state.imgLoaded) {
      Image.getSize(this.state.uri, (width, height) => {
        this.setState({
          ratio: height / width,
          scale: width / screen.width,
        });
      });
    }
    const content = this.state.goBack ? this.renderHome() : this.renderSelect();
    return content;
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
  bottomB: {
    position: "absolute",
    width: screen.width,
    bottom: isIPhoneX ? 75 : 35,
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
  topB: {
    position: "absolute",
    width: screen.width,
    top: isIPhoneX ? 75 : 35,
    padding: 30,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
