import { StyleSheet } from "react-native";
import COLORS from "./colors";

const profileStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  body:{
    paddingHorizontal: 20,
  },
  bodyContent:{
    marginTop: 20,
    height: 110,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 5,
  },
  vipBadge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.vipGoldBg,
    borderColor: COLORS.vipGold,
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  vipText: {
    color: COLORS.vipGoldDark,
    fontFamily: "SpaceGroteskBold",
    fontSize: 12,
  },
  activityList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  activityItem: {
    width: "32%",
    height: 92,
    marginVertical: 10,
  },
  text: {
    color: COLORS.text,
    fontSize: 18,
    fontFamily: "Manrope",
    paddingVertical: 3,
  },
});

export default profileStyles;
