import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import FloatBox from "../../components/common/FloatBox";
import COLORS from "../../styles/colors";
import { Ionicons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/FontAwesome6";
import style from "../../styles/profile.styles";

import { useNavigation } from "@react-navigation/native";

const ProfileScreen = () => {
  const navigation = useNavigation();
  const mainActivities = [
    {
      iconName: "wallet",
      activityName: "Wallet",
    },
    {
      iconName: "clock-rotate-left",
      activityName: "History",
    },
    {
      iconName: "gem",
      activityName: "Vip",
    },
  ];

  const handleActivityPress = (activityName) => {
    if (activityName === "Wallet") {
      navigation.navigate("Deposit");
    }
  };

  return (
    <SafeAreaView style={style.container}>
      <ScrollView style={style.body}>
        <FloatBox style={style.bodyContent}
          children={
            <View style={style.profileInfo}>
              <Ionicons
                name={"person-circle-outline"}
                color={COLORS.primary}
                style={{ fontSize: 80 }}
              />
              <View>
                <Text style={style.text}>quanganh0123</Text>
                <View style={style.vipBadge}>
                  <Text style={style.vipText}>VIP 10</Text>
                  <Icon name="gem" style={style.vipText} />
                </View>
                <Text
                  style={[
                    style.text,
                    { fontSize: 20, fontFamily: "ManropeBold" },
                  ]}
                >
                  BALANCE: 1.000.000,00 VNĐ
                </Text>
              </View>
            </View>
          }
        />
        <View style={style.activityList}>
          {mainActivities.map((act) => (
            <TouchableOpacity
              key={act.activityName}
              style={style.activityItem}
              onPress={() => handleActivityPress(act.activityName)}
              activeOpacity={0.6}
            >
              <FloatBox style={{justifyContent: "flex-end"}}
                children={
                  <View style={{paddingVertical: 5, paddingHorizontal: 3,}}>
                    <Icon name={act.iconName} style={[style.text, {color: COLORS.primary, fontSize: 25}]} />
                    <Text style={style.text}>{act.activityName}</Text>
                  </View>
                }
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};





export default ProfileScreen;
