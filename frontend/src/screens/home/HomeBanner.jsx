import { View, Text, ImageBackground, TouchableOpacity } from "react-native";
import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme, useThemedStyles } from "../../hooks/useTheme";
import { makeHomeBannerStyles } from "../../styles/home.styles";

const HomeBanner = ({ bannerInfo, buttonInfo, image, onPress, isPromo, promoIndex = 0 }) => {
  const { colors: COLORS } = useTheme();
  const style = useThemedStyles(makeHomeBannerStyles);
  const gradients = COLORS.bannerGradients;

  const content = (
    <View style={style.bannerInfo}>
      <Text style={style.text}>{bannerInfo.toUpperCase()}</Text>
      <TouchableOpacity
        style={style.button}
        onPress={onPress}
        activeOpacity={0.6}
        accessibilityRole="button"
        accessibilityLabel={buttonInfo}
      >
        <Text style={style.buttonInfo}>{buttonInfo.toUpperCase()}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={style.banner}>
      {isPromo ? (
        <LinearGradient
          colors={gradients[promoIndex % gradients.length]}
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
