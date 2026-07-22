import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import EmptyState from "../../components/ui/EmptyState";
import { useTheme, useThemedStyles } from "../../hooks/useTheme";
import { makeWrappedStyles } from "../../styles/friends.styles";
import { getFriendWrapped } from "../../services/friendService";

const { width } = Dimensions.get("window");

/**
 * Spotify-Wrapped style recap of the wagers between two friends.
 * Slides come from the backend AI (with a data-only fallback).
 */
const WrappedModal = ({ visible, userId, friend, onClose }) => {
  const { colors: COLORS } = useTheme();
  const styles = useThemedStyles(makeWrappedStyles);

  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (visible) {
      setSlides([]);
      setError(null);
      setActiveSlide(0);
      generate();
    }
  }, [visible]);

  const generate = async () => {
    if (!userId || !friend?.id) return;
    setLoading(true);
    try {
      const result = await getFriendWrapped(userId, friend.id);
      setSlides(result?.slides || []);
    } catch (err) {
      const message = err?.response?.data?.message || "Could not generate your recap.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveSlide(index);
  };

  const renderSlide = ({ item }) => (
    <View style={[styles.slide, { width }]}>
      <Text style={styles.slideTitle}>{item.title}</Text>
      <Text style={styles.slideHighlight}>{item.highlight}</Text>
      <Text style={styles.slideText}>{item.text}</Text>
    </View>
  );

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close wrapped"
        >
          <Ionicons name="close" size={22} color={COLORS.text} />
        </TouchableOpacity>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Cooking your rivalry recap...</Text>
          </View>
        ) : error ? (
          <View style={styles.loadingBox}>
            <EmptyState
              icon="sparkles-outline"
              message={error}
              actionLabel="Retry"
              onAction={generate}
            />
          </View>
        ) : (
          <>
            <FlatList
              data={slides}
              keyExtractor={(_, index) => String(index)}
              renderItem={renderSlide}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
            />
            <View style={styles.dotsRow}>
              {slides.map((_, index) => (
                <View
                  key={index}
                  style={[styles.dot, activeSlide === index && styles.dotActive]}
                />
              ))}
            </View>
          </>
        )}
      </View>
    </Modal>
  );
};

export default WrappedModal;
