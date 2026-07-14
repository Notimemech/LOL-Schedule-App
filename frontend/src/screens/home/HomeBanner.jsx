import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from "react-native";
import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import COLORS from "../../styles/colors";
import { homeBannerStyles as style } from "../../styles/home.styles";

const CARD_GRADIENTS = [
  ["#0f3460", "#16213e", "#1a1a2e"],
  ["#1a0533", "#2d1b69", "#1a1a2e"],
  ["#002d3d", "#004d6e", "#1a1a2e"],
  ["#1a2e00", "#2d4d00", "#1a1a2e"],
];

const HomeBanner = ({ bannerInfo, buttonInfo, image, onPress, isPromo, promoIndex = 0 }) => {
  const content = (
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
  );

  return (
    <View style={style.banner}>
      {isPromo ? (
        <LinearGradient
          colors={CARD_GRADIENTS[promoIndex % CARD_GRADIENTS.length]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[style.bannerImage, { borderRadius: 6 }]}
        >
          {content}
        </LinearGradient>
      ) : (
        <ImageBackground
          source={image}
          resizeMode="cover"
          style={style.bannerImage}
          imageStyle={{ borderRadius: 6, zIndex: -10 }}
        >
          {content}
        </ImageBackground>
      )}
    </View>
  );
};



export default HomeBanner;
