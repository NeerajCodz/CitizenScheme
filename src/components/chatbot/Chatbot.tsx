"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, X, Send, Paperclip, RotateCcw, Loader2, FileText, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachments?: { document_id: string; filename: string; status: string }[];
  created_at?: string;
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
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

  // Format message content with basic markdown-like rendering
  const formatContent = (text: string) => {
    return text.split("\n").map((line, i) => {
      // Bold
      const formatted = line.replace(
        /\*\*(.*?)\*\*/g,
        '<strong>$1</strong>'
      );
      return (
        <span
          key={i}
          dangerouslySetInnerHTML={{ __html: formatted }}
          className="block"
        />
      );
    });
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95"
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-130 w-95 flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl sm:w-105">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-primary/5 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Citizen Copilot</h3>
                <p className="text-[11px] text-muted-foreground">
                  Ask about schemes &amp; benefits
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleReset}
              title="Reset conversation"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-muted-foreground">
                <Bot className="h-10 w-10 text-primary/30" />
                <div>
                  <p className="text-sm font-medium">Hi there! 👋</p>
                  <p className="text-xs mt-1">
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
                      className="rounded-full border border-border px-3 py-1 text-[11px] transition-colors hover:bg-primary/5 hover:border-primary/30"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted rounded-bl-md"
                    }`}
                  >
                    {formatContent(msg.content)}
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
              ))
            )}

            {sending && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md bg-muted px-4 py-3">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:0ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:150ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-border px-3 py-2">
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
                className="h-9 w-9 shrink-0"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || !threadId}
                title="Upload document"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Paperclip className="h-4 w-4" />
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
                className="flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                style={{ maxHeight: "100px", minHeight: "36px" }}
                disabled={sending || !threadId}
              />

              {/* Send */}
              <Button
                size="icon"
                className="h-9 w-9 shrink-0"
                onClick={handleSend}
                disabled={!input.trim() || sending || !threadId}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
