/**
 * PromotionDetailScreen
 * Hiển thị chi tiết của một promotion, điều hướng từ PromotionScreen
 */
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/FontAwesome';
import COLORS from '../../styles/colors';
import { useAuth } from '../../auth/AuthContext';
import NotificationService from '../../services/NotificationService';

const PromotionDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { promo } = route.params;
  const { user } = useAuth();

  const handleClaim = async () => {
    if (!user) {
      if (Platform.OS === 'web') {
        const confirmLogin = window.confirm('Vui lòng đăng nhập để nhận ưu đãi này. Bạn có muốn đăng nhập không?');
        if (confirmLogin) {
          navigation.navigate('Login');
        }
      } else {
        Alert.alert(
          'Yêu cầu đăng nhập',
          'Vui lòng đăng nhập để nhận ưu đãi này.',
          [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Đăng nhập', onPress: () => navigation.navigate('Login') },
          ],
        );
      }
      return;
    }
    // Gửi thông báo xác nhận nhận ưu đãi
    await NotificationService.notifyPromotion({
      promoTitle: promo.title,
      promoDesc: `Bạn đã đăng ký nhận ưu đãi: ${promo.title}. Hệ thống đang xử lý!`,
    });

    if (Platform.OS === 'web') {
      window.alert(`🎉 Đăng ký thành công!\nBạn đã đăng ký nhận ưu đãi "${promo.title}".\nThông báo xác nhận đã được gửi đến số điện thoại của bạn.`);
    } else {
      Alert.alert(
        '🎉 Đăng ký thành công!',
        `Bạn đã đăng ký nhận ưu đãi "${promo.title}".\n\nThông báo xác nhận đã được gửi đến số điện thoại của bạn.`,
        [{ text: 'OK' }],
      );
    }
  };


  const TERM_ITEMS = [
    'Ưu đãi áp dụng cho thành viên đã xác thực số điện thoại.',
    'Mỗi tài khoản chỉ được áp dụng một lần.',
    'Không thể đổi ưu đãi sang tiền mặt trực tiếp.',
    'Công ty có quyền thay đổi hoặc hủy bỏ chương trình mà không cần báo trước.',
    'Mọi hành vi gian lận sẽ dẫn đến khóa tài khoản vĩnh viễn.',
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="light-content" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Banner */}
        <ImageBackground
          source={{ uri: promo.image }}
          style={styles.heroImage}
          resizeMode="cover"
          imageStyle={{ width: '100%', height: '100%' }}
        >
          {/* Dark overlay */}
          <View style={styles.heroOverlay} />

          {/* Back button */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
          </TouchableOpacity>

          {/* Hero Content */}
          <View style={styles.heroContent}>
            {/* Badge */}
            <View style={[styles.badge, { backgroundColor: promo.badgeColor + '22', borderColor: promo.badgeColor }]}>
              <Text style={[styles.badgeText, { color: promo.badgeColor }]}>{promo.badge}</Text>
            </View>

            <Text style={styles.heroTitle}>{promo.title}</Text>

            {/* Expiry */}
            <View style={styles.expiryRow}>
              <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
              <Text style={styles.expiryText}>Hạn sử dụng: {promo.expiry}</Text>
            </View>
          </View>
        </ImageBackground>

        {/* Body */}
        <View style={styles.body}>
          {/* Category chip */}
          <View style={styles.categoryRow}>
            <View style={[styles.categoryChip, { borderColor: promo.badgeColor }]}>
              <Icon name={promo.icon} style={[styles.categoryIcon, { color: promo.badgeColor }]} />
              <Text style={[styles.categoryText, { color: promo.badgeColor }]}>
                {promo.category}
              </Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CHI TIẾT ƯU ĐÃI</Text>
            <Text style={styles.descText}>{promo.description}</Text>
          </View>

          {/* Highlights */}
          {promo.highlights && (
            <View style={styles.highlightsCard}>
              {promo.highlights.map((h, i) => (
                <View key={i} style={styles.highlightRow}>
                  <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
                  <Text style={styles.highlightText}>{h}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Terms */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ĐIỀU KIỆN ÁP DỤNG</Text>
            {TERM_ITEMS.map((term, i) => (
              <View key={i} style={styles.termRow}>
                <View style={styles.termBullet} />
                <Text style={styles.termText}>{term}</Text>
              </View>
            ))}
          </View>

          {/* CTA */}
          <TouchableOpacity
            style={[styles.claimBtn, { backgroundColor: promo.badgeColor }]}
            onPress={handleClaim}
            activeOpacity={0.8}
          >
            <Icon name={promo.icon} style={styles.claimIcon} />
            <Text style={styles.claimBtnText}>{promo.buttonText}</Text>
          </TouchableOpacity>

          {/* Share / Save */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionBtn}>
              <Ionicons name="bookmark-outline" size={18} color={COLORS.textMuted} />
              <Text style={styles.actionBtnText}>Lưu lại</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <Ionicons name="share-social-outline" size={18} color={COLORS.textMuted} />
              <Text style={styles.actionBtnText}>Chia sẻ</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 32 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  // Hero
  heroImage: {
    height: 280,
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 50,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5,7,8,0.6)',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    zIndex: 1,
  },
  heroContent: {
    gap: 10,
    zIndex: 1,
  },
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: 'ManropeExtraBold',
    letterSpacing: 1.5,
  },
  heroTitle: {
    color: COLORS.text,
    fontSize: 26,
    fontFamily: 'ManropeExtraBold',
    lineHeight: 32,
  },
  expiryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  expiryText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontFamily: 'Manrope',
  },
  // Body
  body: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  categoryRow: {
    marginBottom: 20,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  categoryIcon: {
    fontSize: 14,
  },
  categoryText: {
    fontSize: 13,
    fontFamily: 'ManropeBold',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: 'SpaceGroteskBold',
    letterSpacing: 2,
    marginBottom: 10,
  },
  descText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontFamily: 'Manrope',
    lineHeight: 24,
  },
  highlightsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    gap: 10,
    marginBottom: 20,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  highlightText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontFamily: 'Manrope',
    flex: 1,
    lineHeight: 20,
  },
  termRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  termBullet: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.textMuted,
    marginTop: 8,
    flexShrink: 0,
  },
  termText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontFamily: 'Manrope',
    flex: 1,
    lineHeight: 20,
  },
  claimBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  claimIcon: {
    fontSize: 18,
    color: '#fff',
  },
  claimBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'ManropeExtraBold',
    letterSpacing: 1.5,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 12,
  },
  actionBtnText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontFamily: 'ManropeBold',
  },
});

export default PromotionDetailScreen;
