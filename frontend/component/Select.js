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
    imgLoaded: false,
    maskLoaded: false,
    userMode: false,
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
    this.imageDownloading();
    this.maskDownloading();
  }

  maskDownloading = async () => {
    if (this.props.masks) {
      this.setState({ masks: this.props.masks, maskLoaded: true });
    } else {
      for (let id = 1; id < this.state.maskLen; id++) {
        let masknumber = id;
        const { masks } = this.state;
        await this.setState({
          masks: masks.concat({
            id: id,
            uri: `http://winners.dothome.co.kr/${this.state.sessionid}/${masknumber}.png`,
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

  userMode = async () => {
    this.setState({
      userMode: true,
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
      let x = Math.round(this.state.imageX);
      let y = Math.round(this.state.imageY);
      console.log(x, y, this.state.maskLen, this.state.sessionid);
      fetch(
        `http://winners.dothome.co.kr/checking_mask_number.php?maskLen=${this.state.maskLen}&x=${x}&y=${y}&session=${this.state.sessionid}`
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
    const { masks } = this.state;

    var result = [];

    masks.map((mask) => {
      if (mask.selected == true) {
        result.push(mask.id);
      }
    });

    console.log(result);

    fetch(`http://192.168.219.100/test.php?session=${this.state.sessionid}`, {
      method: "POST", // or 'PUT'
      body: JSON.stringify(result), // data can be `string` or {object}!
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.text())
      .then((res) => console.log(res))
      .catch((error) => console.error("Error:", error));
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
    const { masks } = this.state;
    //masks가 불려오기 전에 호출하지 않게...
    const list = masks.map((info) => (
      <Image
        source={{ uri: info.uri }}
        style={{
          width: screen.width,
          height: screen.width * this.state.ratio,
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
    return (
      <UserMask
        uri={this.state.uri}
        masks={this.state.masks}
        ratio={this.state.ratio}
        maskLen={this.state.maskLen}
        sessionid={this.state.sessionid}
      />
    );
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
    if (this.state.goBack) {
      return this.renderHome();
    } else if (this.state.userMode) {
      return this.renderUser();
    } else if (this.state.maskLoaded) {
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
