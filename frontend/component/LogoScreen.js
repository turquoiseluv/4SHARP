import React, { Component } from "react";
import {
  View,
  Image,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from "react-native";
/* Logo */
import Logo_Person from "../images/PaperLogo/PaperLogo_Person.png";
import Logo_Frame from "../images/PaperLogo/PaperLogo_Frame.png";
class LogoScreen extends Component {
  state = {
    PersonAnime: new Animated.Value(0),
    FrameAnime: new Animated.Value(0),
    LogoText: new Animated.Value(0),
    loadingSpinner: false,
  };
  componentDidMount() {
    const { PersonAnime, FrameAnime, LogoText } = this.state;
    Animated.parallel([
      Animated.spring(PersonAnime, {
        toValue: 1,
        tension: 10,
        friction: 1.5,
        duration: 1500,
        useNativeDriver: false,
      }).start(),
      Animated.timing(FrameAnime, {
        toValue: 1,
        duration: 1,
        useNativeDriver: false,
      }).start(),
      Animated.timing(LogoText, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: false,
      }),
    ]).start(() => {
      this.setState({
        loadingSpinner: true,
      });
    });
  }
  render() {
    return (
      <View style={styles.container}>
        <View>
          <Animated.View
            style={{
              top: this.state.PersonAnime.interpolate({
                inputRange: [0, 1],
                outputRange: [80, 0],
              }),
              position: "absolute",
              zIndex: 1,
              marginTop: 0,
            }}
          >
            <Image source={Logo_Person} />
          </Animated.View>
          <Animated.View style={{ opacity: this.state.FrameAnime }}>
            <Image source={Logo_Frame} />
          </Animated.View>
        </View>

        <Animated.View style={{ opacity: this.state.LogoText }}>
          <Text style={styles.logoText}>4# SH4RP</Text>
          <Text style={styles.subText}>
            Impainting & Cropping {"\n"}Team Project
          </Text>
          {this.state.loadingSpinner ? (
            <View>
              <ActivityIndicator
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 0,
                }}
                size="large"
                color="#fff"
              />
            </View>
          ) : null}
        </Animated.View>
      </View>
    );
  }
}
export default LogoScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#222222",
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontWeight: "bold",
    color: "#FFFFFF",
    fontSize: 40,
    fontWeight: "400",
    textShadowColor: "#00000055",
    textShadowRadius: 1,
    textShadowOffset: { width: 3, height: 3 },
  },
  subText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "200",
    marginBottom: 50,
  },
});
