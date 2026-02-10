"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function ChatbotButton() {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const getWelcome = () =>
    t("chatbot.welcome", {
      defaultValue:
        "Hello! I'm here to help you find the perfect government scheme. How can I assist you today?",
    });
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(true);

  const initChat = useCallback(async () => {
    if (threadId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/chat");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setThreadId(data.thread_id);

      if (data.messages?.length) {
        setMessages(
          data.messages.map((m: { role: "user" | "assistant"; content: string }) => ({
            role: m.role,
            content: m.content,
          }))
        );
      } else {
        setMessages([{ role: "assistant", content: getWelcome() }]);
      }
    } catch {
      setMessages([{ role: "assistant", content: getWelcome() }]);
    } finally {
      setLoading(false);
    }
  }, [threadId]);

  const handleSend = async (override?: string) => {
    const content = (override ?? input).trim();
    if (!content || !threadId || sending) return;

    setInput("");
    setSending(true);

    const optimistic = { role: "user" as const, content };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, thread_id: threadId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.content },
      ]);
    } catch {
      setMessages((prev) => prev.filter((m) => m !== optimistic));
      setInput(content);
    } finally {
      setSending(false);
    }
  };

  const quickActions = [
    { label: t("chatbot.findSchemes", { defaultValue: "Find Schemes" }), icon: "🔍" },
    { label: t("chatbot.checkEligibility", { defaultValue: "Check Eligibility" }), icon: "✓" },
    { label: t("chatbot.howToApply", { defaultValue: "How to Apply" }), icon: "📝" },
    { label: t("chatbot.trackApplication", { defaultValue: "Track Application" }), icon: "📍" },
  ];

  useEffect(() => {
    if (isOpen) initChat();
  }, [isOpen, initChat]);

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].role === "assistant") {
        return [{ ...prev[0], content: getWelcome() }];
      }
      return prev;
    });
  }, [i18n.language]);

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    shouldAutoScrollRef.current = distance < 120;
  }, []);

  useEffect(() => {
    if (shouldAutoScrollRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, sending, loading]);

  const markdownComponents = {
    p: (props: ComponentPropsWithoutRef<"p">) => (
      <p className="text-sm leading-relaxed" {...props} />
    ),
    a: (props: ComponentPropsWithoutRef<"a">) => (
      <a className="underline underline-offset-2" target="_blank" rel="noreferrer" {...props} />
    ),
    code: (props: ComponentPropsWithoutRef<"code">) => (
      <code className="rounded bg-black/10 px-1 py-0.5 text-xs" {...props} />
    ),
    pre: (props: ComponentPropsWithoutRef<"pre">) => (
      <pre className="rounded-lg bg-black/10 p-2 text-xs overflow-x-auto" {...props} />
    ),
    ul: (props: ComponentPropsWithoutRef<"ul">) => (
      <ul className="list-disc pl-4 text-sm" {...props} />
    ),
    ol: (props: ComponentPropsWithoutRef<"ol">) => (
      <ol className="list-decimal pl-4 text-sm" {...props} />
    ),
    li: (props: ComponentPropsWithoutRef<"li">) => (
      <li className="mb-1" {...props} />
    ),
    strong: (props: ComponentPropsWithoutRef<"strong">) => (
      <strong className="font-semibold" {...props} />
    ),
    em: (props: ComponentPropsWithoutRef<"em">) => (
      <em className="italic" {...props} />
    ),
  };

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
              className="absolute inset-0 rounded-full bg-emerald-500/70 blur-md"
            />
          )}
          
          <Button
            onClick={() => setIsOpen(!isOpen)}
            size="lg"
            className="relative h-16 w-16 rounded-full neo-elevated hover:neo-inset transition-all shadow-xl bg-emerald-600 hover:bg-emerald-700 border-2 border-white/20"
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
                    className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white"
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
            className="fixed bottom-24 right-4 z-40 w-[min(420px,calc(100vw-2rem))]"
          >
            <div className="neo-elevated rounded-3xl overflow-hidden shadow-2xl border-2 border-white/50 dark:border-white/10">
              {/* Header */}
              <div className="bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-700 p-4 text-white">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="h-12 w-12 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center"
                  >
                    <Bot className="h-7 w-7" />
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-lg">
                      {t("chatbot.title", { defaultValue: "Scheme Assistant" })}
                    </h3>
                    <p className="text-xs text-white/80">
                      {t("chatbot.status", { defaultValue: "Online • Ready to help" })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="max-h-[calc(100vh-20rem)] overflow-y-auto p-4 bg-gradient-to-b from-emerald-50/40 dark:from-emerald-900/10 to-background space-y-4 neo-scrollbar"
              >
                {loading && (
                  <div className="text-center text-sm text-muted-foreground">
                    {t("common.loading", { defaultValue: "Loading..." })}
                  </div>
                )}
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
                        msg.role === "assistant"
                          ? "bg-gradient-to-br from-emerald-500 to-emerald-700"
                          : "bg-gradient-to-br from-emerald-500 to-emerald-600 neo-elevated"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <Bot className="h-5 w-5 text-white" />
                      ) : (
                        <UserIcon className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <div
                      className={`max-w-[75%] rounded-2xl p-3 ${
                        msg.role === "assistant"
                          ? "neo-elevated rounded-tl-none"
                          : "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-tr-none shadow-md"
                      }`}
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </motion.div>
                ))}

                {sending && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3"
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                    <div className="neo-elevated rounded-2xl rounded-tl-none p-3">
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
                            className="h-2 w-2 rounded-full bg-emerald-600"
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Actions */}
              <div className="p-3 bg-emerald-50/40 dark:bg-emerald-900/10 border-t border-white/40 dark:border-white/10 flex gap-2 overflow-x-auto">
                {quickActions.map((action) => (
                  <motion.button
                    key={action.label}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      handleSend(action.label);
                    }}
                    className="flex-shrink-0 px-3 py-2 rounded-xl neo-elevated text-xs font-medium hover:neo-inset transition-all"
                  >
                    <span className="mr-1">{action.icon}</span>
                    {action.label}
                  </motion.button>
                ))}
              </div>

              {/* Input */}
              <div className="p-4 bg-[#f0f0f3] dark:bg-[hsl(240,10%,12%)] border-t border-white/40 dark:border-white/10">
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
                    placeholder={t("chatbot.placeholder", { defaultValue: "Type your message..." })}
                    className="resize-none rounded-2xl neo-inset border-0 focus-visible:ring-2 focus-visible:ring-emerald-600"
                    rows={2}
                  />
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      onClick={() => handleSend()}
                      size="icon"
                      disabled={sending || loading || !threadId}
                      className="h-full rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 shadow-lg"
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
