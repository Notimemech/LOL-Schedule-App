import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import ContentHeader from "../../components/common/ContentHeader";
import { useTheme, useThemedStyles } from "../../hooks/useTheme";
import { makeHelpStyles } from "../../styles/help.styles";
import { sendHelpChat } from "../../services/helpService";
import { getStoredUserId } from "../../utils/user";
import TicketFormModal from "./TicketFormModal";

const SUGGESTIONS = [
  "Sao tôi nạp tiền mà chưa thấy vào ví?",
  "Tôi thắng cược mà chưa nhận được tiền?",
  "Bet hôm qua của tôi đâu rồi?",
  "Làm sao để rút tiền?",
];

export default function HelpCenterScreen() {
  const { colors: COLORS } = useTheme();
  const styles = useThemedStyles(makeHelpStyles);
  const listRef = useRef(null);

  const [userId, setUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [ticketVisible, setTicketVisible] = useState(false);
  const [ticketDraft, setTicketDraft] = useState(null);

  useEffect(() => {
    getStoredUserId().then(setUserId);
  }, []);

  const scrollToEnd = () => {
    // Defer so the list has laid out the new row first.
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const send = async (text) => {
    const content = text.trim();
    if (!content || sending || !userId) return;
    const nextMessages = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setInput("");
    setSending(true);
    scrollToEnd();
    try {
      const result = await sendHelpChat(
        userId,
        nextMessages.map(({ role, content: c }) => ({ role, content: c }))
      );
      const assistantMsg = {
        role: "assistant",
        content: result?.reply || "Sorry, something went wrong. Please try again.",
        showTicketCta: result?.action === "open_ticket_form",
      };
      if (assistantMsg.showTicketCta) setTicketDraft(result.ticketDraft || null);
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Không thể kết nối tới trợ lý hỗ trợ. Kiểm tra mạng và thử lại, hoặc gửi yêu cầu bằng form.",
          showTicketCta: true,
        },
      ]);
    } finally {
      setSending(false);
      scrollToEnd();
    }
  };

  const renderMessage = ({ item }) => (
    <View>
      <View style={item.role === "user" ? styles.bubbleUser : styles.bubbleAssistant}>
        <Text style={styles.bubbleText}>{item.content}</Text>
      </View>
      {item.showTicketCta && (
        <TouchableOpacity
          style={[styles.ticketCta, { marginTop: 8 }]}
          onPress={() => setTicketVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Open support request form"
        >
          <Ionicons name="document-text-outline" size={16} color={COLORS.primary} />
          <Text style={styles.ticketCtaText}>GỬI YÊU CẦU HỖ TRỢ</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.welcomeBox}>
      <Ionicons name="headset-outline" size={40} color={COLORS.primary} />
      <Text style={styles.welcomeTitle}>HELP CENTER</Text>
      <Text style={styles.welcomeHint}>
        Hỏi mình về nạp/rút tiền, đặt cược, VIP... Mình có thể kiểm tra giao dịch và bet của bạn để tìm nguyên nhân.
      </Text>
      <View style={styles.suggestionWrap}>
        {SUGGESTIONS.map((s) => (
          <TouchableOpacity
            key={s}
            style={styles.suggestionChip}
            onPress={() => send(s)}
            accessibilityRole="button"
            accessibilityLabel={`Ask: ${s}`}
          >
            <Text style={styles.suggestionText}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ContentHeader title="HELP CENTER" showBack={true} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <FlatList
          ref={listRef}
          style={styles.chatList}
          contentContainerStyle={styles.chatContent}
          data={messages}
          keyExtractor={(_, index) => String(index)}
          renderItem={renderMessage}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={
            sending ? (
              <View style={styles.bubbleAssistant}>
                <ActivityIndicator color={COLORS.primary} size="small" />
              </View>
            ) : null
          }
          showsVerticalScrollIndicator={false}
        />
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Mô tả vấn đề của bạn..."
            placeholderTextColor={COLORS.inputPlaceholder}
            value={input}
            onChangeText={setInput}
            multiline
            accessibilityLabel="Help message input"
          />
          <TouchableOpacity
            style={[styles.sendButton, (!input.trim() || sending) && { opacity: 0.5 }]}
            onPress={() => send(input)}
            disabled={!input.trim() || sending}
            accessibilityRole="button"
            accessibilityLabel="Send message"
          >
            <Ionicons name="send" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <TicketFormModal
        visible={ticketVisible}
        draft={ticketDraft}
        userId={userId}
        onClose={() => setTicketVisible(false)}
      />
    </SafeAreaView>
  );
}
