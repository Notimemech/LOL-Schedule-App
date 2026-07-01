import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ContentHeader from "../../components/common/ContentHeader";
import { scheduleStyles as styles } from "../../styles/matches.styles";
import { useNavigation } from "@react-navigation/native";
import { data } from "../../constants/data";
import COLORS from "../../styles/colors";

export default function ScheduleScreen() {
  const [games, setGames] = useState([]);

  useEffect(() => {
    setGames(data);
    // fetchSchedule();  -- Wait util I need real api
  }, []);

  const fetchSchedule = async () => {
    try {
      const response = await fetch(
        "https://api.citoapi.com/api/v1/lol/schedule/upcoming",
        {
          headers: {
            "x-api-key":
              "cito_6b87b891f005abc8c803817f344d7ca0cb91627e40ed94bc2ca911b4b9f392e8",
          },
        },
      );
      const data = await response.json();
      setGames(data);
    } catch (error) {
      console.log(error);
    }
  };

  const navigation = useNavigation();

  const formatDate = (startDate) => {
    const date = new Date(startDate);

    const vnTime = date.toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
    });

    return vnTime;
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ContentHeader title="SCHEDULE" />
      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        {games.map((game) => (
          <View key={game.matchId} style={styles.matchContainer}>
            <View style={styles.matchHeader}>
              <Text style={styles.leagueText}>{game.leagueName?.toUpperCase()}</Text>
              <Text style={styles.tournamentText}>{game.tournamentName?.toUpperCase()}</Text>
            </View>
            <View style={styles.timeBadge}>
              <Text style={styles.timeText}>{formatDate(game.startTime)}</Text>
            </View>

            <View style={styles.gameCard}>
              <View style={styles.teamCard}>
                <Image
                  source={{ uri: game.team1.logoUrl }}
                  style={styles.teamLogo}
                  resizeMode="contain"
                />
                <Text style={styles.teamCode}>{game.team1.code}</Text>
              </View>

              <View style={styles.vsContainer}>
                <Text style={styles.vsText}>VS</Text>
              </View>

              <View style={styles.teamCard}>
                <Image
                  source={{ uri: game.team2.logoUrl }}
                  style={styles.teamLogo}
                  resizeMode="contain"
                />
                <Text style={styles.teamCode}>{game.team2.code}</Text>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.detailButton,
                pressed && styles.detailButtonPressed
              ]}
              onPress={() => navigation.navigate('Detail', { match: game })}
            >
              <Text style={styles.detailButtonText}>VIEW MATCH TERMINAL</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
