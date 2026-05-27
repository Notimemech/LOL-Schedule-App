import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View, Image, Pressable } from "react-native";
import { data } from "../data";

export default function ScheduleScreen() {
  const [games, setGames] = useState([]);

  useEffect(() => {
    setGames(data);
    // fetchSchedule();
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

  const formatDate = (startDate) => {
    const date = new Date(startDate);

    const vnTime = date.toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
    });

    return vnTime;
  };

  return (
    <View style={styles.container}>
      {/* <View style={styles.header}>
        <Text>LOL Schedule</Text>
      </View> */}
      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
      >
        {games.map((game) => (
          <View key={game.matchId} style={{paddingVertical: 10}}>
            <Text>League Name: {game.leagueName}</Text>
            <Text>Tournament Name: {game.tournamentName}</Text>
            <Text>Time: {formatDate(game.startTime)}</Text>
            <View>
              <View style={styles.gameCard}>
                <View style={styles.teamCard}>
                  <Image
                    source={{ uri: game.team1.logoUrl }}
                    style={{ width: 100, height: 100 }}
                  />
                  <Text>{game.team1.code}</Text>
                </View>
                <Text> VS </Text>

                <View style={styles.teamCard}>
                  <Image
                    source={{ uri: game.team2.logoUrl }}
                    style={{ width: 100, height: 100 }}
                  />
                  <Text>{game.team2.code}</Text>
                </View>
              </View>
              <Pressable
                style={{borderColor:"#4BF0FC", borderWidth: 1, alignItems: 'center'}}
                onPress={()=>alert("pressed!")}
              >
                <Text>
                  Detail
                </Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
      {/* <View style={styles.footer}>
        <Text>LOL Schedule</Text>
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#999"
  },
  header: {
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 50,
    paddingBottom: 20,
  },
  body: {
    flex: 1,
  },
  footer: {
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    height: 100,
  },
  bodyContent: {
    backgroundColor: "#999",
    padding: 16,
  },
  gameCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    justifyContent: "space-around",
    paddingVertical: 10,
  },
  teamCard:{
    flexDirection: "column",
    alignItems:'center',
    gap: 10
  }
});
