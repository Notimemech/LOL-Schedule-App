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
import Header from "../../components/common/Header";
import COLORS from "../../styles/colors";
import { Ionicons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/FontAwesome";
import HomeBanner from "./HomeBanner";

export default function HomeScreen() {
  const navigation = useNavigation();

  const topUpNavigate = () => {
    Alert.alert("top up now");
  };

  const navigateTab = (name) => {
    navigation.navigate(name);
  };

  return (
    <SafeAreaView
      style={style.container}
      edges={["top"]}
    >
      <Header />
      <View style={style.body}>
        <ScrollView showsVerticalScrollIndicator={false} style={{}}>
          <View style={style.bannerList}>
            <View style={style.bannerTitle}>
              <Icon name="tags" style={[style.title, { fontSize: 35 }]} />
              <Text style={style.title}>PROMOTIONS</Text>
            </View>
            <HomeBanner
              bannerInfo={"Free 100% for the first time top up"}
              buttonInfo={"CLAIM OFFER"}
              image={require("../../assets/100_first_time.jpg")}
              onPress={topUpNavigate}
            />
            <HomeBanner
              bannerInfo={"Free 10$ for the newbie"}
              buttonInfo={"CLAIM OFFER"}
              image={require("../../assets/100_first_time.webp")}
              onPress={topUpNavigate}
            />
          </View>
          <View style={style.bannerList}>
            <View style={style.bannerTitle}>
              <Ionicons
                name={"game-controller-outline"}
                color={COLORS.text}
                style={style.title}
              />
              <Text style={style.title}>ESPORTS</Text>
            </View>
            <HomeBanner
              bannerInfo={"LOL BETTING"}
              buttonInfo={"SET A BET"}
              image={require("../../assets/lol_background.jpg")}
              onPress={() => navigateTab("Schedule")}
            />
            <HomeBanner
              bannerInfo={"DOTA 2 BETTING"}
              buttonInfo={"SET A BET"}
              image={require("../../assets/dota_2_background.jpg")}
              onPress={() => navigateTab("Schedule")}
            />
          </View>
          <View style={style.bannerList}>
            <View style={style.bannerTitle}>
              <Ionicons
                name={"star-outline"}
                color={COLORS.text}
                style={style.title}
              />
              <Text style={style.title}>FEATURES</Text>
            </View>
          </View>
          <View style={{ height: 50 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const style = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  body: {
    flex: 1,
    paddingTop: 100,
  },
  banner: {
    width: "100%",
    borderColor: COLORS.glow,
    borderStyle: "solid",
    borderWidth: 2,
    borderRadius: 10,
    shadowColor: COLORS.primary,
    // shadowOffset: {width: , height: 1},
    shadowOpacity: 0.5,
    shadowRadius: 7,
  },
  bannerList: {
    flexDirection: "column",
    gap: 10,
    paddingHorizontal: 20,
    marginTop: 30,
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
  },
  button: {
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    width: 120,
    height: 50,
    borderRadius: 8,
  },
  buttonInfo: {
    fontSize: 23,
    fontWeight: "bold",
  },
  bannerTitle: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  title: {
    color: COLORS.text,
    fontSize: 40,
    fontFamily:"ManropeExtraBold"
  },
  text: {
    color: COLORS.text,
    fontSize: 18,
    fontFamily:"Manrope"
  },
});
