import {
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
import Header from "../components/Header";
import COLORS from "../style/color";

export default function HomeScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={style.container}>
      <Header />
      <View style={style.body}>
        <ScrollView>

          <View style={style.bannerList}>

            <View style={style.banner}>
              <ImageBackground
                source={require("../../assets/lol_background.jpg")}
                resizeMode="cover"
                style={style.bannerImage}
                imageStyle={{ borderRadius: 10, zIndex: -10 }}
              >
                <View style={style.bannerInfo}>
                  <Text style={style.text}>LOL Betting</Text>
                  <TouchableOpacity
                    style={style.button}
                    onPress={() => {
                      navigation.navigate("Schedule");
                    }}
                  >
                    <Text style={style.buttonInfo}>SET A BET</Text>
                  </TouchableOpacity>
                </View>
              </ImageBackground>
            </View>

            <View style={style.banner}>
              <ImageBackground
                source={require("../../assets/dota_2_background.jpg")}
                resizeMode="cover"
                style={style.bannerImage}
                imageStyle={{ borderRadius: 8, zIndex: -10 }}
              >
                <View style={style.bannerInfo}>
                  <Text style={style.text}>DOTA 2 Betting</Text>
                  <TouchableOpacity
                    style={style.button}
                    onPress={() => {
                      navigation.navigate("Schedule");
                    }}
                  >
                    <Text style={style.buttonInfo}>SET A BET</Text>
                  </TouchableOpacity>
                </View>
              </ImageBackground>
            </View>
          </View>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const style = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
    padding: 10,
  },
  body: {
    flex: 1,
  },
  banner: {
    width: "100%",
    borderColor: COLORS.glow,
    borderStyle: "solid",
    borderWidth: 2,
    borderRadius: 10,
    position: "relative",
    top: 120,
  },
  bannerList: {
    flexDirection: "column",
    gap: 20,
  },
  bannerImage: {
    width: "100%",
    height: 200,
  },
  bannerInfo:{
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
  buttonInfo:{
    fontSize: 23,
    fontWeight: "bold"    
  },
  text: {
    color: COLORS.text,
    fontSize: 18,
  },
});
