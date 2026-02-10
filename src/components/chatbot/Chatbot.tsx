"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { MessageCircle, X, Send, Paperclip, RotateCcw, Loader2, FileText, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachments?: { document_id: string; filename: string; status: string }[];
  created_at?: string;
}

interface ChatbotProps {
  mode?: "floating" | "page";
  containerClassName?: string;
}

export default function Chatbot({ mode = "floating", containerClassName }: ChatbotProps) {
  const isPage = mode === "page";
  const [open, setOpen] = useState(isPage);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Initialize thread on first open
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
          data.messages.map((m: ChatMessage) => ({
            id: m.id || crypto.randomUUID(),
            role: m.role,
            content: m.content,
            attachments: m.attachments,
            created_at: m.created_at,
          }))
        );
      }
    } catch {
      toast.error("Failed to initialize chat");
    } finally {
      setLoading(false);
    }
  }, [threadId]);

  useEffect(() => {
    if (open) {
      initChat();
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, initChat]);

  // Send message
  const handleSend = async () => {
    if (!input.trim() || !threadId || sending) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: userMessage.content,
          thread_id: threadId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const assistantMessage: ChatMessage = {
        id: data.message_id || crypto.randomUUID(),
        role: "assistant",
        content: data.content,
        attachments: data.attachments,
        created_at: data.created_at,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      toast.error("Failed to send message");
      // Remove the optimistically added user message
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
      setInput(userMessage.content);
    } finally {
      setSending(false);
    }
  };

  // Upload file
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !threadId) return;

    setUploading(true);

    // Show user message about upload
    const uploadMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: `📎 Uploaded: ${file.name}`,
    };
    setMessages((prev) => [...prev, uploadMsg]);

    try {
      // Upload document
      const formData = new FormData();
      formData.append("file", file);
      formData.append("thread_id", threadId);

      const uploadRes = await fetch("/api/chat/documents", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error);

      // Now ask the bot about the uploaded document
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `I just uploaded a document called "${file.name}". Please analyze it and tell me what information it contains, especially any details relevant to government scheme eligibility.`,
          thread_id: threadId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const assistantMessage: ChatMessage = {
        id: data.message_id || crypto.randomUUID(),
        role: "assistant",
        content: data.content,
        created_at: data.created_at,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      toast.error("Failed to upload document");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Reset conversation
  const handleReset = async () => {
    try {
      const res = await fetch("/api/chat", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setThreadId(data.thread_id);
      setMessages([]);
      toast.success("Conversation reset");
    } catch {
      toast.error("Failed to reset chat");
    }
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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
      {!isPage && (
        <button
          onClick={() => setOpen(!open)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-[8px_8px_18px_rgba(16,185,129,0.5),-4px_-4px_12px_rgba(255,255,255,0.2)] transition-all hover:scale-105 hover:shadow-[10px_10px_22px_rgba(16,185,129,0.6),-5px_-5px_15px_rgba(255,255,255,0.3)] active:scale-95 active:shadow-[inset_5px_5px_12px_rgba(16,185,129,0.4)]"
          aria-label={open ? "Close chat" : "Open chat"}
        >
          {open ? (
            <X className="h-6 w-6" />
          ) : (
            <MessageCircle className="h-6 w-6" />
          )}
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div
          className={
            isPage
              ? `flex h-[calc(100vh-180px)] w-full flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-[#f0f0f3] to-[#e8e8eb] shadow-[15px_15px_35px_rgba(163,177,198,0.7),-15px_-15px_35px_rgba(255,255,255,0.9)] ${containerClassName || ""}`
              : "fixed bottom-24 right-6 z-50 flex h-130 w-95 flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-[#f0f0f3] to-[#e8e8eb] shadow-[12px_12px_28px_rgba(163,177,198,0.6),-12px_-12px_28px_rgba(255,255,255,0.9)] sm:w-105"
          }
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-black/5 bg-gradient-to-r from-[#ececef] to-[#e8e8eb] px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#f0f0f3] to-[#e8e8eb] shadow-[4px_4px_10px_rgba(163,177,198,0.5),-4px_-4px_10px_rgba(255,255,255,0.9)]">
                <Bot className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-700">Citizen Copilot</h3>
                <p className="text-[11px] text-slate-500">
                  Ask about schemes &amp; benefits
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#f0f0f3] to-[#e8e8eb] shadow-[3px_3px_8px_rgba(163,177,198,0.4),-3px_-3px_8px_rgba(255,255,255,0.9)] hover:shadow-[inset_2px_2px_5px_rgba(163,177,198,0.3)] active:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.4)]"
              onClick={handleReset}
              title="Reset conversation"
            >
              <RotateCcw className="h-4 w-4 text-slate-600" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gradient-to-b from-[#e8e8eb] to-[#f0f0f3]">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#f0f0f3] to-[#e8e8eb] shadow-[inset_5px_5px_12px_rgba(163,177,198,0.4),inset_-5px_-5px_12px_rgba(255,255,255,0.9)] flex items-center justify-center">
                  <Bot className="h-8 w-8 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Hi there! 👋</p>
                  <p className="text-xs mt-1 text-slate-500">
                    Ask me about government schemes, upload documents,
                    <br />
                    or let me help you find eligible benefits.
                  </p>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[
                    "What schemes am I eligible for?",
                    "Show me education schemes",
                    "How to apply for PM Kisan?",
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        setInput(q);
                        inputRef.current?.focus();
                      }}
                      className="rounded-full px-3 py-1.5 text-[11px] transition-all bg-gradient-to-br from-[#f0f0f3] to-[#e8e8eb] text-slate-700 shadow-[4px_4px_10px_rgba(163,177,198,0.4),-4px_-4px_10px_rgba(255,255,255,0.9)] hover:shadow-[2px_2px_6px_rgba(163,177,198,0.4),-2px_-2px_6px_rgba(255,255,255,0.9)] active:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.3)]"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-[5px_5px_12px_rgba(16,185,129,0.4),-3px_-3px_8px_rgba(255,255,255,0.1)]"
                          : "bg-gradient-to-br from-[#f0f0f3] to-[#e8e8eb] text-slate-700 shadow-[6px_6px_14px_rgba(163,177,198,0.5),-5px_-5px_12px_rgba(255,255,255,0.9)]"
                      }`}
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                        {msg.content}
                      </ReactMarkdown>
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {msg.attachments.map((att) => (
                            <div
                              key={att.document_id}
                              className="flex items-center gap-1 text-[11px] opacity-75"
                            >
                              <FileText className="h-3 w-3" />
                              <span>{att.filename}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {sending && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl px-4 py-3 bg-gradient-to-br from-[#f0f0f3] to-[#e8e8eb] shadow-[6px_6px_14px_rgba(163,177,198,0.5),-5px_-5px_12px_rgba(255,255,255,0.9)]">
                      <div className="flex gap-1.5">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-gradient-to-br from-slate-400 to-slate-500 shadow-[2px_2px_4px_rgba(100,116,139,0.3)] [animation-delay:0ms]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-gradient-to-br from-slate-400 to-slate-500 shadow-[2px_2px_4px_rgba(100,116,139,0.3)] [animation-delay:150ms]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-gradient-to-br from-slate-400 to-slate-500 shadow-[2px_2px_4px_rgba(100,116,139,0.3)] [animation-delay:300ms]" />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-black/5 bg-gradient-to-r from-[#ececef] to-[#e8e8eb] px-3 py-3">
            <div className="rounded-2xl p-2.5 bg-gradient-to-br from-[#f0f0f3] to-[#e8e8eb] shadow-[8px_8px_16px_rgba(163,177,198,0.5),-8px_-8px_16px_rgba(255,255,255,0.9),inset_1px_1px_2px_rgba(255,255,255,0.3)]">
              <div className="flex items-end gap-2">
                {/* File Upload */}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.txt,.md,.docx,.xlsx,.pptx,.csv,.json,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-xl bg-[#e8e8eb] shadow-[4px_4px_8px_rgba(163,177,198,0.4),-4px_-4px_8px_rgba(255,255,255,0.9)] hover:bg-[#e8e8eb] active:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.4)]"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || !threadId}
                  title="Upload document"
                >
                  {uploading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Paperclip className="h-3.5 w-3.5" />
                  )}
                </Button>

                {/* Text Input */}
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about schemes..."
                  rows={1}
                  className="flex-1 resize-none rounded-xl border-none bg-[#e8e8eb] px-3 py-2 text-sm placeholder:text-slate-400 shadow-[inset_4px_4px_8px_rgba(163,177,198,0.4),inset_-4px_-4px_8px_rgba(255,255,255,0.9)] focus:outline-none focus:shadow-[inset_6px_6px_10px_rgba(163,177,198,0.5),inset_-3px_-3px_8px_rgba(255,255,255,1)] transition-all"
                  style={{ maxHeight: "100px", minHeight: "32px" }}
                  disabled={sending || !threadId}
                />

                {/* Send */}
                <Button
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-[4px_4px_8px_rgba(16,185,129,0.4),-2px_-2px_6px_rgba(255,255,255,0.5)] active:shadow-[inset_3px_3px_6px_rgba(16,185,129,0.3)] transition-all"
                  onClick={handleSend}
                  disabled={!input.trim() || sending || !threadId}
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-center gap-1 mt-1.5 opacity-50">
              <span className="text-[9px] text-slate-500">Powered by</span>
              <img 
                src="https://framerusercontent.com/images/B1pu30dG18pgu4LBa9DzkcdS3Q.png?scale-down-to=512&width=627&height=78" 
                alt="Logo" 
                className="h-2.5 object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
