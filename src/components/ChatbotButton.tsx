"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";

export function ChatbotButton() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: "user" | "bot"; content: string }>>([
    {
      role: "bot",
      content: t("chatbot.welcome") || "Hello! I'm here to help you find the perfect government scheme. How can I assist you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsTyping(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const botResponse = generateResponse(userMessage);
      setMessages((prev) => [...prev, { role: "bot", content: botResponse }]);
      setIsTyping(false);
    }, 1500);
  };

  const generateResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes("education") || lowerMessage.includes("student")) {
      return t("chatbot.education") || "I can help you with educational schemes! We have scholarships, skill development programs, and student welfare schemes. Would you like to see schemes for a specific education level?";
    }
    if (lowerMessage.includes("health") || lowerMessage.includes("medical")) {
      return t("chatbot.health") || "I found several health-related schemes! These include health insurance, medical assistance, and wellness programs. Would you like to know more about a specific health scheme?";
    }
    if (lowerMessage.includes("agriculture") || lowerMessage.includes("farmer")) {
      return t("chatbot.agriculture") || "Great! We have multiple agriculture and farmer welfare schemes including crop insurance, subsidies, and equipment support. What aspect of agriculture are you interested in?";
    }
    if (lowerMessage.includes("women") || lowerMessage.includes("girl")) {
      return t("chatbot.women") || "We have dedicated women empowerment schemes covering financial assistance, skill training, and entrepreneurship support. Let me help you find the right one!";
    }
    if (lowerMessage.includes("eligibility") || lowerMessage.includes("eligible")) {
      return t("chatbot.eligibility") || "To check your eligibility, I'll need some basic information. Have you completed your profile? You can also browse schemes and see your eligibility score for each one!";
    }
    
    return t("chatbot.default") || "I understand you're looking for information about government schemes. Could you please tell me more about your specific needs or the category you're interested in? (Education, Health, Agriculture, Women Welfare, etc.)";
  };

  const quickActions = [
    { label: t("chatbot.findSchemes") || "Find Schemes", icon: "🔍" },
    { label: t("chatbot.checkEligibility") || "Check Eligibility", icon: "✓" },
    { label: t("chatbot.howToApply") || "How to Apply", icon: "📝" },
    { label: t("chatbot.trackApplication") || "Track Application", icon: "📍" },
  ];

  return (
    <>
      {/* Floating Chat Button */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
        className="fixed bottom-6 right-6 z-40"
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="relative"
        >
          {/* Pulse animation */}
          {!isOpen && (
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 to-green-500 blur-md"
            />
          )}
          
          <Button
            onClick={() => setIsOpen(!isOpen)}
            size="lg"
            className="relative h-16 w-16 rounded-full neo-flat hover:neo-pressed transition-all shadow-xl bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 hover:from-orange-600 hover:to-orange-800 border-2 border-white/20"
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-7 w-7 text-white" />
                </motion.div>
              ) : (
                <motion.div
                  key="chat"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative"
                >
                  <MessageCircle className="h-7 w-7 text-white" />
                  {/* Notification badge */}
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-white"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-28 right-6 w-96 max-w-[calc(100vw-3rem)] z-40"
          >
            <div className="neo-flat rounded-3xl overflow-hidden shadow-2xl border-2 border-white/50">
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 p-4 text-white">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
                  >
                    <Bot className="h-7 w-7" />
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-lg">
                      {t("chatbot.title") || "Scheme Assistant"}
                    </h3>
                    <p className="text-xs text-white/80">
                      {t("chatbot.status") || "Online • Ready to help"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="h-96 overflow-y-auto p-4 bg-gradient-to-b from-orange-50/30 to-background space-y-4">
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        msg.role === "bot"
                          ? "bg-gradient-to-br from-orange-400 to-orange-600"
                          : "bg-gradient-to-br from-green-500 to-green-600 neo-flat"
                      }`}
                    >
                      {msg.role === "bot" ? (
                        <Bot className="h-5 w-5 text-white" />
                      ) : (
                        <UserIcon className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <div
                      className={`max-w-[75%] rounded-2xl p-3 ${
                        msg.role === "bot"
                          ? "neo-flat rounded-tl-none"
                          : "bg-gradient-to-br from-green-500 to-green-600 text-white rounded-tr-none shadow-md"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    </div>
                  </motion.div>
                ))}

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3"
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                    <div className="neo-flat rounded-2xl rounded-tl-none p-3">
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            animate={{ y: [0, -6, 0] }}
                            transition={{
                              duration: 0.6,
                              repeat: Infinity,
                              delay: i * 0.2,
                            }}
                            className="h-2 w-2 rounded-full bg-orange-500"
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="p-3 bg-orange-50/50 border-t flex gap-2 overflow-x-auto">
                {quickActions.map((action) => (
                  <motion.button
                    key={action.label}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setInput(action.label);
                      handleSend();
                    }}
                    className="flex-shrink-0 px-3 py-2 rounded-xl neo-flat text-xs font-medium hover:neo-pressed transition-all"
                  >
                    <span className="mr-1">{action.icon}</span>
                    {action.label}
                  </motion.button>
                ))}
              </div>

              {/* Input */}
              <div className="p-4 bg-white border-t">
                <div className="flex gap-2">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder={t("chatbot.placeholder") || "Type your message..."}
                    className="resize-none rounded-2xl neo-pressed border-0 focus-visible:ring-2 focus-visible:ring-orange-500"
                    rows={2}
                  />
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      onClick={handleSend}
                      size="icon"
                      className="h-full rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
