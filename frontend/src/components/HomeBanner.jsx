import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from "react-native";
import React from "react";
import COLORS from "../style/color";

const HomeBanner = ({ bannerInfo, buttonInfo, image, onPress }) => {
  return (
    <View style={style.banner}>
      <ImageBackground
        source={image}
        resizeMode="cover"
        style={style.bannerImage}
        imageStyle={{ borderRadius: 10, zIndex: -10 }}
      >
        <View style={style.bannerInfo}>
          <Text style={style.text}>{bannerInfo}</Text>
          <TouchableOpacity
            style={style.button}
            onPress={onPress}
            activeOpacity={0.6}
          >
            <Text style={style.buttonInfo}>{buttonInfo}</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
};

const style = StyleSheet.create({
  banner: {
    width: "100%",
    borderColor: COLORS.glow,
    borderWidth: 1.3,
    borderRadius: 10,
    shadowColor: COLORS.primary,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.5,
    shadowRadius: 15,
    marginVertical: 10,  
  },
  bannerImage: {
    width: "100%",
    height: 200,
  },
  bannerInfo: {
    backgroundColor: "rgba(5,7,8,0.75)",
    borderRadius: 10,
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    gap: 10,
    fontFamily:"Manrope"
  },
  button: {
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    width: 150,
    height: 50,
    borderRadius: 8,
    fontFamily:"Manrope"
  },
  buttonInfo: {
    fontSize: 23,
    fontWeight: "bold",
    fontFamily:"ManropeExtraBold"
  },
  text: {
    color: COLORS.text,
    fontSize: 18,
    fontFamily:"Manrope"
  },
});

export default HomeBanner;
