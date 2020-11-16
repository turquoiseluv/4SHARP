import React from "react";
import { View, StyleSheet, TouchableOpacity, StatusBar } from "react-native";

export default class Result extends React.Component {
  state = {
    sessionid: null,
  };

  componentDidMount() {}

  renderBottomBar = () => (
    <View style={styles.bottomBar}>
      <TouchableOpacity style={styles.bottomButtom} onPress={this.pressedBack}>
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

  render() {
    return (
      <View style={{ flex: 1 }}>
        <StatusBar
          barStyle={this.state.galleryMode ? "dark-content" : "light-content"}
          translucent={true}
        />
        <View
          style={[
            this.state.showFrame ? styles.topFrameBlack : styles.topFrameTrans,
          ]}
        ></View>
        <PinchGestureHandler
          onGestureEvent={this.onPinchEvent}
          onHandlerStateChange={this.onPinchHandlerStateChange}
        >
          <Animated.View style={{ flex: 1 }}>
            <Camera
              ref={(ref) => {
                this.camera = ref;
              }}
              style={styles.camera}
              type={this.state.type}
              flashMode={this.state.flash}
              autoFocus={this.state.autoFocus}
              zoom={this.state.zoom}
              whiteBalance={this.state.whiteBalance}
              onMountError={this.handleMountError}
            ></Camera>
          </Animated.View>
        </PinchGestureHandler>
        <View
          style={[
            this.state.showFrame
              ? styles.bottomFrameBlack
              : styles.bottomFrameTrans,
          ]}
        ></View>
        {this.renderBottomBar()}
      </View>
    );
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
