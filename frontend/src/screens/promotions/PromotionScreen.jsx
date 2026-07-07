import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import React, { useRef, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import COLORS from '../../styles/colors';
import { Ionicons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/FontAwesome';

// Remote images for web+native compatibility
const IMAGES = {
  deposit: 'https://images.unsplash.com/photo-1518544866330-3c7a18059aaa?w=800&q=80',
  newbie:  'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80',
  lol:     'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=800&q=80',
  dota:    'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80',
  vip:     'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&q=80',
};

const PROMOTIONS = [
  {
    id: 1,
    title: 'Nạp lần đầu 100%',
    description: 'Nạp tiền lần đầu tiên sẽ được tặng thêm 100% giá trị nạp. Tối đa 5.000.000 VNĐ. Áp dụng cho tất cả phương thức nạp tiền hỗ trợ.',
    badge: 'HOT',
    badgeColor: COLORS.danger,
    icon: 'fire',
    image: IMAGES.deposit,
    buttonText: 'NHẬN NGAY',
    expiry: '31/12/2026',
    category: 'Nạp tiền',
    highlights: [
      'Bonus 100% tối đa 5.000.000 VNĐ',
      'Áp dụng cho lần nạp đầu tiên',
      'Xử lý tự động trong 5 phút',
      'Nhận thông báo qua SMS',
    ],
  },
  {
    id: 2,
    title: 'Tân thủ nhận $10 miễn phí',
    description: 'Đăng ký tài khoản mới và xác thực số điện thoại để nhận ngay $10 vào ví. Không cần nạp tiền.',
    badge: 'NEW',
    badgeColor: COLORS.info,
    icon: 'gift',
    image: IMAGES.newbie,
    buttonText: 'ĐĂNG KÝ',
    expiry: '31/12/2026',
    category: 'Tân thủ',
    highlights: [
      'Nhận $10 miễn phí vào ví ngay lập tức',
      'Chỉ cần xác thực số điện thoại',
      'Không yêu cầu nạp tiền',
      'Dùng để cược tất cả các môn esports',
    ],
  },
  {
    id: 3,
    title: 'VIP Hoàn tiền 5% mỗi ngày',
    description: 'Thành viên VIP từ cấp 5 trở lên được hoàn 5% tổng cược mỗi ngày, không giới hạn số tiền hoàn trả.',
    badge: 'VIP',
    badgeColor: COLORS.vipGold,
    icon: 'gem',
    image: IMAGES.vip,
    buttonText: 'LÊN VIP',
    expiry: 'Vĩnh viễn',
    category: 'VIP',
    highlights: [
      'Hoàn 5% tổng cược mỗi ngày',
      'Không giới hạn số tiền hoàn',
      'Tự động cộng vào ví lúc 00:00',
      'Áp dụng cho VIP cấp 5 trở lên',
    ],
  },
  {
    id: 4,
    title: 'LOL Esports - Cược thắng +10%',
    description: 'Cược vào các trận LOL trong mùa giải chính thức và nhận thêm 10% tiền thắng. Áp dụng tất cả các giải đấu LOL quốc tế.',
    badge: 'ESPORTS',
    badgeColor: COLORS.primary,
    icon: 'gamepad',
    image: IMAGES.lol,
    buttonText: 'CƯỢC NGAY',
    expiry: '30/09/2026',
    category: 'Esports',
    highlights: [
      'Thêm 10% tiền thắng cho cược LOL',
      'Áp dụng toàn bộ giải đấu quốc tế',
      'Tổng bonus không giới hạn',
      'Nhận thông báo trận đấu real-time',
    ],
  },
  {
    id: 5,
    title: 'DOTA 2 - Jackpot cuối tuần',
    description: 'Mỗi cuối tuần, người cược DOTA 2 nhiều nhất sẽ nhận thêm jackpot 10.000.000 VNĐ. Top 3 người cược được thưởng thêm.',
    badge: 'JACKPOT',
    badgeColor: COLORS.warning,
    icon: 'trophy',
    image: IMAGES.dota,
    buttonText: 'THAM GIA',
    expiry: 'Hàng tuần',
    category: 'Esports',
    highlights: [
      'Jackpot 10.000.000 VNĐ mỗi tuần',
      'Top 3 người cược nhiều nhất',
      'Kết quả công bố thứ 2 hàng tuần',
      'Nhận thưởng qua ví trong 24h',
    ],
  },
  {
    id: 6,
    title: 'Rút tiền miễn phí 3 lần/ngày',
    description: 'Thành viên VIP 3+ được rút tiền miễn phí tối đa 3 lần mỗi ngày, 0% phí giao dịch, xử lý ưu tiên.',
    badge: 'VIP',
    badgeColor: COLORS.vipGold,
    icon: 'credit-card',
    image: IMAGES.deposit,
    buttonText: 'NÂNG CẤP',
    expiry: 'Vĩnh viễn',
    category: 'VIP',
    highlights: [
      '3 lần rút miễn phí mỗi ngày',
      '0% phí giao dịch cho VIP 3+',
      'Xử lý ưu tiên trong 15 phút',
      'Xác thực OTP qua SĐT đăng ký',
    ],
  },
];

const CATEGORIES = ['Tất cả', 'Nạp tiền', 'Tân thủ', 'VIP', 'Esports'];

const PromotionCard = ({ promo, index, onPress }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
      <Animated.View
        style={[
          styles.card,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Banner image section */}
        <View style={styles.cardImageWrap}>
          <Image
            source={{ uri: promo.image }}
            style={styles.cardImage}
            resizeMode="cover"
          />
          {/* Overlay */}
          <View style={styles.imageOverlay} />

          {/* Badge + Category row */}
          <View style={styles.imageMeta}>
            <View style={[styles.badge, { backgroundColor: promo.badgeColor + '33', borderColor: promo.badgeColor }]}>
              <Text style={[styles.badgeText, { color: promo.badgeColor }]}>{promo.badge}</Text>
            </View>
            <View style={styles.categoryChip}>
              <Text style={styles.categoryText}>{promo.category}</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.cardHeader}>
            <Icon name={promo.icon} style={[styles.cardIcon, { color: promo.badgeColor }]} />
            <Text style={styles.cardTitle}>{promo.title}</Text>
          </View>

          <Text style={styles.cardDesc} numberOfLines={2}>{promo.description}</Text>

          <View style={styles.cardFooter}>
            <View style={styles.expiryBox}>
              <Ionicons name="time-outline" size={13} color={COLORS.textMuted} />
              <Text style={styles.expiryText}>HSD: {promo.expiry}</Text>
            </View>
            <View style={[styles.claimBtn, { borderColor: promo.badgeColor }]}>
              <Text style={[styles.claimBtnText, { color: promo.badgeColor }]}>
                {promo.buttonText}
              </Text>
              <Ionicons name="chevron-forward" size={13} color={promo.badgeColor} />
            </View>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const PromotionScreen = () => {
  const navigation = useNavigation();
  const [activeCategory, setActiveCategory] = React.useState('Tất cả');

  const filtered =
    activeCategory === 'Tất cả'
      ? PROMOTIONS
      : PROMOTIONS.filter((p) => p.category === activeCategory);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Page Header */}
      <View style={styles.pageHeader}>
        <View style={styles.pageHeaderLeft}>
          <Icon name="tags" style={[styles.headerIcon]} />
          <View>
            <Text style={styles.pageTitle}>PROMOTIONS</Text>
            <Text style={styles.pageSubtitle}>{PROMOTIONS.length} ưu đãi đang có</Text>
          </View>
        </View>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.filterChip, activeCategory === cat && styles.filterChipActive]}
            onPress={() => setActiveCategory(cat)}
            activeOpacity={0.75}
          >
            <Text
              style={[
                styles.filterChipText,
                activeCategory === cat && styles.filterChipTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Promotions List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {filtered.map((promo, idx) => (
          <PromotionCard
            key={promo.id}
            promo={promo}
            index={idx}
            onPress={() => navigation.navigate('PromotionDetail', { promo })}
          />
        ))}
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  pageHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  pageHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    fontSize: 32,
    color: COLORS.primary,
  },
  pageTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontFamily: 'ManropeExtraBold',
    letterSpacing: 2,
  },
  pageSubtitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: 'Manrope',
    marginTop: 2,
  },
  filterScroll: {
    maxHeight: 52,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary + '22',
    borderColor: COLORS.primary,
  },
  filterChipText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontFamily: 'ManropeBold',
  },
  filterChipTextActive: {
    color: COLORS.primary,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardImageWrap: {
    height: 160,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5,7,8,0.52)',
  },
  imageMeta: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardBody: {
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardIcon: {
    fontSize: 18,
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontFamily: 'ManropeExtraBold',
    flex: 1,
  },
  cardDesc: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontFamily: 'Manrope',
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  expiryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expiryText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: 'Manrope',
  },
  claimBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  claimBtnText: {
    fontSize: 12,
    fontFamily: 'ManropeExtraBold',
    letterSpacing: 1,
  },
});

export default PromotionScreen;
