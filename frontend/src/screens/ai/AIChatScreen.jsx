import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../styles/colors";
import ContentHeader from "../../components/common/ContentHeader";
import { chatWithEsportAI } from "../../services/aiService";

export default function AIChatScreen() {
  const [messages, setMessages] = useState([
    {
      id: "1",
      sender: "ai",
      text: "Xin chào! Tôi là Trợ lý AI Esport Chuyên Nghiệp. 🎮\n\nTôi có thể giúp bạn phân tích phong độ đội tuyển, dự đoán kết quả trận đấu LOL, và tư vấn kèo cược cực chuẩn. Bạn cần thông tin gì hôm nay?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef();

  const quickPrompts = [
    "🔥 Dự đoán T1 vs Gen.G",
    "📅 Lịch thi đấu mới nhất",
    "💡 Mẹo cược Bo3 an toàn",
    "🏆 Phân tích GAM Esports"
  ];

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim() || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: "user",
      text: query.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText("");
    setLoading(true);

    try {
      const history = messages.map(m => ({
        sender: m.sender,
        text: m.text
      }));

      const replyText = await chatWithEsportAI(query.trim(), history);

      const aiMsg = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: "⚡ Xin lỗi, kết nối tới AI đang gián đoạn. Bạn vui lòng thử lại sau giây lát!",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ContentHeader title="AI ASSISTANT ⚡" showBack={true} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Quick Suggestion Chips */}
        <View style={styles.quickPromptsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12 }}>
            {quickPrompts.map((prompt, index) => (
              <TouchableOpacity
                key={index}
                style={styles.chip}
                onPress={() => handleSend(prompt)}
              >
                <Text style={styles.chipText}>{prompt}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Chat Stream */}
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.chatContainer}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(msg => (
            <View
              key={msg.id}
              style={[
                styles.messageBubble,
                msg.sender === "user" ? styles.userBubble : styles.aiBubble
              ]}
            >
              {msg.sender === "ai" && (
                <View style={styles.aiAvatarHeader}>
                  <Ionicons name="sparkles" size={16} color={COLORS.primary} />
                  <Text style={styles.aiNameText}>Antigravity AI Analyst</Text>
                </View>
              )}
              <Text style={[styles.messageText, msg.sender === "user" && styles.userMessageText]}>
                {msg.text}
              </Text>
              <Text style={styles.timeText}>{msg.time}</Text>
            </View>
          ))}

          {loading && (
            <View style={[styles.messageBubble, styles.aiBubble, styles.loadingBubble]}>
              <Ionicons name="sparkles" size={16} color={COLORS.primary} style={{ marginRight: 8 }} />
              <ActivityIndicator color={COLORS.primary} size="small" />
              <Text style={[styles.messageText, { marginLeft: 8 }]}>AI đang suy nghĩ & phân tích dữ liệu...</Text>
            </View>
          )}
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Hỏi AI về trận đấu, kèo cược..."
            placeholderTextColor={COLORS.textMuted}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && { opacity: 0.5 }]}
            onPress={() => handleSend()}
            disabled={!inputText.trim() || loading}
          >
            <Ionicons name="send" size={18} color="#050708" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  quickPromptsContainer: {
    paddingVertical: 10,
    backgroundColor: COLORS.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  chip: {
    backgroundColor: COLORS.cardElevated,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.borderActive
  },
  chipText: {
    color: COLORS.textSecondary,
    fontFamily: "ManropeBold",
    fontSize: 12
  },
  chatContainer: {
    padding: 16,
    paddingBottom: 24
  },
  messageBubble: {
    maxWidth: "85%",
    borderRadius: 14,
    padding: 12,
    marginBottom: 14
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 2
  },
  aiBubble: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.cardElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderBottomLeftRadius: 2
  },
  loadingBubble: {
    flexDirection: "row",
    alignItems: "center"
  },
  aiAvatarHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6
  },
  aiNameText: {
    color: COLORS.primary,
    fontFamily: "SpaceGroteskBold",
    fontSize: 11,
    marginLeft: 6
  },
  messageText: {
    color: COLORS.text,
    fontFamily: "Manrope",
    fontSize: 14,
    lineHeight: 20
  },
  userMessageText: {
    color: "#050708",
    fontFamily: "ManropeBold"
  },
  timeText: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontFamily: "Manrope",
    alignSelf: "flex-end",
    marginTop: 4
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.inputBackground,
    color: COLORS.text,
    fontFamily: "Manrope",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.inputBorder
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center"
  }
});
