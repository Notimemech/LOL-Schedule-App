import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import ContentHeader from "../../components/common/ContentHeader";
import EmptyState from "../../components/ui/EmptyState";
import { useTheme, useThemedStyles } from "../../hooks/useTheme";
import { makeFriendsStyles } from "../../styles/friends.styles";
import {
  getFriendsOverview,
  sendFriendRequest,
  acceptFriendRequest,
  removeFriendship,
  getUserProfile,
} from "../../services/friendService";
import { getStoredUserId, getStoredUser } from "../../utils/user";

export default function FriendsScreen() {
  const navigation = useNavigation();
  const { colors: COLORS } = useTheme();
  const styles = useThemedStyles(makeFriendsStyles);

  const [userId, setUserId] = useState(null);
  const [me, setMe] = useState(null);
  const [overview, setOverview] = useState({ friends: [], incoming: [], outgoing: [] });
  const [handleInput, setHandleInput] = useState("");
  const [feedback, setFeedback] = useState(null); // { ok, message }
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const load = async () => {
    try {
      const uid = await getStoredUserId();
      setUserId(uid);
      if (!uid) return;

      // Sessions created before tags existed have no tag in storage — fall
      // back to the API for the full profile.
      const stored = await getStoredUser();
      if (stored?.tag) {
        setMe(stored);
      } else {
        const profile = await getUserProfile(uid).catch(() => null);
        setMe(profile || stored);
      }

      const data = await getFriendsOverview(uid);
      setOverview(data);
    } catch (error) {
      console.log("Failed to load friends:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleAdd = async () => {
    if (!handleInput.trim() || busy) return;
    setBusy(true);
    setFeedback(null);
    try {
      await sendFriendRequest(userId, handleInput.trim());
      setFeedback({ ok: true, message: "Friend request sent!" });
      setHandleInput("");
      load();
    } catch (error) {
      const message = error?.response?.data?.message || "Could not send the request.";
      setFeedback({ ok: false, message });
    } finally {
      setBusy(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      await acceptFriendRequest(requestId, userId);
      load();
    } catch (error) {
      console.log("Failed to accept request:", error);
    }
  };

  const handleRemove = async (friendshipId) => {
    try {
      await removeFriendship(friendshipId, userId);
      load();
    } catch (error) {
      console.log("Failed to remove friendship:", error);
    }
  };

  const renderPerson = (person, actions) => (
    <View key={person.friendship_id} style={styles.personRow}>
      <View style={styles.personAvatar}>
        <Text style={styles.personAvatarText}>{person.username?.[0]?.toUpperCase() || "?"}</Text>
      </View>
      <View>
        <Text style={styles.personName}>{person.username}</Text>
        <Text style={styles.personTag}>#{person.tag}</Text>
      </View>
      <View style={styles.rowActions}>{actions}</View>
    </View>
  );

  const renderFriend = ({ item }) =>
    renderPerson(
      item,
      <>
        <TouchableOpacity
          style={[styles.actionBtn, { borderColor: COLORS.primary, backgroundColor: COLORS.glowSoft }]}
          onPress={() => navigation.navigate("FriendH2H", { friend: item })}
          accessibilityRole="button"
          accessibilityLabel={`View wagers with ${item.username}`}
        >
          <Text style={[styles.actionBtnText, { color: COLORS.primary }]}>WAGERS</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { borderColor: COLORS.border }]}
          onPress={() => handleRemove(item.friendship_id)}
          accessibilityRole="button"
          accessibilityLabel={`Unfriend ${item.username}`}
        >
          <Ionicons name="person-remove-outline" size={14} color={COLORS.textMuted} />
        </TouchableOpacity>
      </>
    );

  const renderHeader = () => (
    <View>
      {/* Incoming requests */}
      {overview.incoming.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>FRIEND REQUESTS</Text>
          {overview.incoming.map((person) =>
            renderPerson(
              person,
              <>
                <TouchableOpacity
                  style={[styles.actionBtn, { borderColor: COLORS.success, backgroundColor: COLORS.badgeSuccessBg }]}
                  onPress={() => handleAccept(person.friendship_id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Accept ${person.username}`}
                >
                  <Text style={[styles.actionBtnText, { color: COLORS.success }]}>ACCEPT</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { borderColor: COLORS.border }]}
                  onPress={() => handleRemove(person.friendship_id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Decline ${person.username}`}
                >
                  <Ionicons name="close" size={14} color={COLORS.textMuted} />
                </TouchableOpacity>
              </>
            )
          )}
        </>
      )}

      {/* Outgoing requests */}
      {overview.outgoing.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>SENT — WAITING</Text>
          {overview.outgoing.map((person) =>
            renderPerson(
              person,
              <TouchableOpacity
                style={[styles.actionBtn, { borderColor: COLORS.border }]}
                onPress={() => handleRemove(person.friendship_id)}
                accessibilityRole="button"
                accessibilityLabel={`Cancel request to ${person.username}`}
              >
                <Text style={[styles.actionBtnText, { color: COLORS.textMuted }]}>CANCEL</Text>
              </TouchableOpacity>
            )
          )}
        </>
      )}

      <Text style={styles.sectionLabel}>FRIENDS ({overview.friends.length})</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ContentHeader title="FRIENDS" showBack={true} />

      {/* Fixed above the list — a TextInput inside ListHeaderComponent gets
          remounted on every keystroke and dismisses the keyboard. */}
      <View style={styles.fixedTop}>
        <View style={styles.myHandleBox}>
          <View>
            <Text style={styles.myHandleLabel}>YOUR HANDLE — share it with friends</Text>
            <Text style={styles.myHandleText}>
              {me?.username || "..."}#{me?.tag || "......"}
            </Text>
          </View>
          <Ionicons name="id-card-outline" size={22} color={COLORS.primary} />
        </View>

        <View style={styles.addRow}>
          <TextInput
            style={styles.addInput}
            placeholder="username#TAG"
            placeholderTextColor={COLORS.inputPlaceholder}
            value={handleInput}
            onChangeText={setHandleInput}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="send"
            onSubmitEditing={handleAdd}
            accessibilityLabel="Friend handle input"
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAdd}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel="Send friend request"
          >
            <Text style={styles.addButtonText}>ADD</Text>
          </TouchableOpacity>
        </View>
        {feedback && (
          <Text style={[styles.feedbackText, { color: feedback.ok ? COLORS.success : COLORS.danger }]}>
            {feedback.message}
          </Text>
        )}
      </View>

      <FlatList
        contentContainerStyle={styles.bodyContent}
        data={overview.friends}
        keyExtractor={(item) => String(item.friendship_id)}
        renderItem={renderFriend}
        ListHeaderComponent={renderHeader()}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <EmptyState
            icon="people-outline"
            message="No friends yet"
            hint="Add a friend with their username#TAG to start friendly wagers."
          />
        }
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      />
    </SafeAreaView>
  );
}
