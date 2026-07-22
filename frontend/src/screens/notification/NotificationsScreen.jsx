import React, { useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme, useThemedStyles } from '../../hooks/useTheme';
import { useNotifications } from '../../context/NotificationContext';
import ContentHeader from '../../components/common/ContentHeader';

// ─── Type → icon + color + label ──────────────────────────────────
const TYPE_META = {
  deposit:      { icon: 'cash-outline',              color: '#22C55E', label: 'Deposit' },
  withdraw:     { icon: 'wallet-outline',            color: '#F59E0B', label: 'Withdraw' },
  bet:          { icon: 'trophy-outline',            color: '#6366F1', label: 'Bet' },
  bet_cancel:   { icon: 'arrow-undo-outline',        color: '#EF4444', label: 'Cancel Bet' },
  promotion:    { icon: 'gift-outline',              color: '#EC4899', label: 'Promotion' },
  follow_team:  { icon: 'people-outline',            color: '#06B6D4', label: 'Team' },
  follow_match: { icon: 'location-outline',          color: '#8B5CF6', label: 'Match' },
  vip:          { icon: 'star-outline',              color: '#F59E0B', label: 'VIP' },
  system:       { icon: 'notifications-outline',     color: '#6B7280', label: 'System' },
};

// ─── Relative time helper ─────────────────────────────────────────
const relativeTime = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)  return 'Just now';
  if (mins < 60) return `${mins} mins ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs} hours ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7)  return `${days} days ago`;
  return new Date(dateStr).toLocaleDateString('en-US');
};

// ─── Section label helper ─────────────────────────────────────────
const dayLabel = (dateStr) => {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// ─── Notification row ─────────────────────────────────────────────
const NotifItem = ({ item, onPress, s, COLORS }) => {
  const meta = TYPE_META[item.type] || TYPE_META.system;
  return (
    <Pressable
      style={[s.item, !item.is_read && s.itemUnread]}
      onPress={() => onPress(item)}
      android_ripple={{ color: COLORS.border }}
    >
      {/* Unread dot */}
      {!item.is_read && <View style={[s.unreadDot, { backgroundColor: COLORS.primary }]} />}

      {/* Icon */}
      <View style={[s.iconBox, { backgroundColor: meta.color + '22' }]}>
        <Ionicons name={meta.icon} size={22} color={meta.color} />
      </View>

      {/* Content */}
      <View style={s.content}>
        <Text style={[s.title, !item.is_read && s.titleUnread]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={s.message} numberOfLines={2}>{item.message}</Text>
        <Text style={s.time}>{relativeTime(item.created_at)}</Text>
      </View>
    </Pressable>
  );
};

// ─── Empty state ──────────────────────────────────────────────────
const EmptyState = ({ s, COLORS }) => (
  <View style={s.empty}>
    <Ionicons name="notifications-off-outline" size={56} color={COLORS.textMuted} />
    <Text style={s.emptyTitle}>No notifications</Text>
    <Text style={s.emptyMsg}>Your activities will appear here.</Text>
  </View>
);

// ─── Main screen ──────────────────────────────────────────────────
const NotificationsScreen = () => {
  const navigation = useNavigation();
  const { colors: COLORS } = useTheme();
  const s = useThemedStyles(makeStyles);

  const { notifications, unreadCount, hasMore, loading, loadPage, refresh, markRead, markAllRead } =
    useNotifications();

  // Load first page on mount
  useEffect(() => {
    loadPage(0);
  }, []);

  const handlePress = useCallback(
    (item) => {
      if (!item.is_read) markRead(item.id);
    },
    [markRead]
  );

  const handleEndReached = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = Math.floor(notifications.length / 10);
      loadPage(nextPage);
    }
  }, [loading, hasMore, notifications.length, loadPage]);

  // Group data with day headers
  const sectioned = React.useMemo(() => {
    const grouped = [];
    let lastLabel = null;
    for (const noti of notifications) {
      const label = dayLabel(noti.created_at);
      if (label !== lastLabel) {
        grouped.push({ _header: true, label, _key: `h_${label}` });
        lastLabel = label;
      }
      grouped.push(noti);
    }
    return grouped;
  }, [notifications]);

  const renderItem = ({ item }) => {
    if (item._header) {
      return <Text style={s.sectionLabel}>{item.label}</Text>;
    }
    return <NotifItem item={item} onPress={handlePress} s={s} COLORS={COLORS} />;
  };

  const rightComponent = unreadCount > 0 ? (
    <TouchableOpacity
      onPress={markAllRead}
      style={s.markAllBtn}
      accessibilityRole="button"
      accessibilityLabel="Mark all read"
    >
      <Text style={s.markAllText}>Mark all read</Text>
    </TouchableOpacity>
  ) : null;

  return (
    <SafeAreaView style={s.container}>
      {/* Shared Header */}
      <ContentHeader title="NOTIFICATIONS" showBack={true} rightComponent={rightComponent} />

      {/* List */}
      <FlatList
        data={sectioned}
        keyExtractor={(item) => (item._header ? item._key : String(item.id))}
        renderItem={renderItem}
        onRefresh={refresh}
        refreshing={loading && notifications.length === 0}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={!loading ? <EmptyState s={s} COLORS={COLORS} /> : null}
        ListFooterComponent={
          loading && notifications.length > 0 ? (
            <ActivityIndicator color={COLORS.primary} style={{ padding: 20 }} />
          ) : null
        }
        contentContainerStyle={notifications.length === 0 ? { flex: 1 } : { paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────
const makeStyles = (COLORS) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },

    // Header buttons
    markAllBtn: { paddingVertical: 6, paddingHorizontal: 10 },
    markAllText: { color: COLORS.primary, fontSize: 13, fontFamily: 'ManropeBold' },

    // Section label
    sectionLabel: {
      color: COLORS.textMuted,
      fontSize: 12,
      fontFamily: 'ManropeBold',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      paddingHorizontal: 16,
      paddingTop: 18,
      paddingBottom: 6,
    },

    // Item
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 12,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
      position: 'relative',
    },
    itemUnread: { backgroundColor: COLORS.primary + '08' },
    unreadDot: {
      position: 'absolute',
      left: 6,
      top: '50%',
      width: 6,
      height: 6,
      borderRadius: 3,
      marginTop: -3,
    },
    iconBox: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: { flex: 1 },
    title: { color: COLORS.text, fontSize: 14, fontFamily: 'Manrope', marginBottom: 3 },
    titleUnread: { fontFamily: 'ManropeBold' },
    message: { color: COLORS.textMuted, fontSize: 13, fontFamily: 'Manrope', lineHeight: 18 },
    time: { color: COLORS.textMuted, fontSize: 11, fontFamily: 'Manrope', marginTop: 4 },

    // Empty
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 32 },
    emptyTitle: { color: COLORS.text, fontSize: 17, fontFamily: 'ManropeBold' },
    emptyMsg: { color: COLORS.textMuted, fontSize: 14, fontFamily: 'Manrope', textAlign: 'center' },
  });

export default NotificationsScreen;
