import {
  Alert,
  Image,
  ImageBackground,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import HomeHeader from "../../components/common/HomeHeader";
import COLORS from "../../styles/colors";
import { Ionicons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/FontAwesome";
import HomeBanner from "./HomeBanner";
import { homeStyles as style } from "../../styles/home.styles";

export default function HomeScreen() {
  const navigation = useNavigation();

  const topUpNavigate = () => {
    Alert.alert("SYSTEM NOTICE", "Top up interface initializing...");
  };

  const navigateTab = (name) => {
    navigation.navigate(name);
  };

  return (
    <SafeAreaView
      style={style.container}
      edges={["top"]}
    >
      <HomeHeader />
      <View style={style.body}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={style.bannerList}>
            <View style={style.bannerTitle}>
              <Icon name="tags" style={[style.titleIcon, { fontSize: 32 }]} />
              <Text style={style.title}>PROMOTIONS</Text>
            </View>
            <View style={style.separator} />
            <HomeBanner
              bannerInfo={"Free 100% for the first time top up"}
              buttonInfo={"CLAIM OFFER"}
              image={require("../../../assets/100_first_time.jpg")}
              onPress={topUpNavigate}
            />
            <HomeBanner
              bannerInfo={"Free 10$ for the newbie"}
              buttonInfo={"CLAIM OFFER"}
              image={require("../../../assets/100_first_time.webp")}
              onPress={topUpNavigate}
            />
          </View>
          <View style={style.bannerList}>
            <View style={style.bannerTitle}>
              <Ionicons
                name={"game-controller-outline"}
                style={style.titleIcon}
              />
              <Text style={style.title}>ESPORTS</Text>
            </View>
            <View style={style.separator} />
            <HomeBanner
              bannerInfo={"LOL BETTING"}
              buttonInfo={"SET A BET"}
              image={require("../../../assets/lol_background.jpg")}
              onPress={() => navigateTab("ScheduleStack")}
            />
            <HomeBanner
              bannerInfo={"DOTA 2 BETTING"}
              buttonInfo={"SET A BET"}
              image={require("../../../assets/dota_2_background.jpg")}
              onPress={() => navigateTab("ScheduleStack")}
            />
          </View>
          <View style={style.bannerList}>
            <View style={style.bannerTitle}>
              <Ionicons
                name={"star-outline"}
                style={style.titleIcon}
              />
              <Text style={style.title}>FEATURES</Text>
            </View>
            <View style={style.separator} />
          </View>
          <View style={{ height: 50 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}


