import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from "react-native";
import React from "react";
import COLORS from "../../styles/colors";
import { homeBannerStyles as style } from "../../styles/home.styles";

const HomeBanner = ({ bannerInfo, buttonInfo, image, onPress }) => {
  return (
    <View style={style.banner}>
      <ImageBackground
        source={image}
        resizeMode="cover"
        style={style.bannerImage}
        imageStyle={{ borderRadius: 6, zIndex: -10 }}
      >
        <View style={style.bannerInfo}>
          <Text style={style.text}>{bannerInfo.toUpperCase()}</Text>
          <TouchableOpacity
            style={style.button}
            onPress={onPress}
            activeOpacity={0.6}
          >
            <Text style={style.buttonInfo}>{buttonInfo.toUpperCase()}</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
};



export default HomeBanner;
