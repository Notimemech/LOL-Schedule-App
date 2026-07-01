import { StyleSheet } from "react-native";
import COLORS from "./colors";

export const homeStyles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  body: {
    flex: 1,
    paddingTop: 10,
  },
  bannerList: {
    flexDirection: "column",
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 30,
  },
  bannerTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  titleIcon: {
    color: COLORS.primary,
    fontSize: 36,
    textShadowColor: COLORS.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  title: {
    color: COLORS.text,
    fontSize: 32,
    fontFamily: "SpaceGroteskBold",
    letterSpacing: 2,
    textShadowColor: COLORS.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    width: "100%",
    marginBottom: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
});

export const homeBannerStyles = StyleSheet.create({
  banner: {
    width: "100%",
    borderColor: COLORS.primary,
    borderWidth: 1.5,
    borderRadius: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    marginVertical: 10,
    elevation: 8,
  },
  bannerImage: {
    width: "100%",
    height: 200,
  },
  bannerInfo: {
    backgroundColor: COLORS.overlayHeavy,
    borderRadius: 6,
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    gap: 15,
  },
  button: {
    backgroundColor: COLORS.backgroundTertiary,
    borderColor: COLORS.primary,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    width: 160,
    height: 48,
    borderRadius: 4,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
  buttonInfo: {
    color: COLORS.primary,
    fontSize: 16,
    fontFamily: "SpaceGroteskBold",
    letterSpacing: 1.5,
  },
  text: {
    color: COLORS.text,
    fontSize: 22,
    fontFamily: "SpaceGroteskBold",
    letterSpacing: 1,
    textShadowColor: COLORS.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
});
