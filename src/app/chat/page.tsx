"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { Bot, MessageCircle, Plus, Send, Trash2, PanelLeft, Pencil, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatThread {
  id: string;
  title: string | null;
  last_message: string | null;
  last_message_at: string | null;
  created_at: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export default function ChatPage() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState("chatgpt-4o-latest");
  const [renameTarget, setRenameTarget] = useState<ChatThread | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ChatThread | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(true);

  const scrollToBottom = useCallback(() => {
    if (shouldAutoScrollRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending, scrollToBottom]);

  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    shouldAutoScrollRef.current = distance < 140;
  }, []);

  const loadThreads = useCallback(async () => {
    setLoadingThreads(true);
    try {
      const res = await fetch("/api/chat/threads");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const fetched = data.threads as ChatThread[];
      setThreads(fetched);
      if (fetched.length > 0) {
        setActiveThreadId((prev) => prev ?? fetched[0].id);
      } else {
        await createThread();
      }
    } catch {
      setThreads([]);
    } finally {
      setLoadingThreads(false);
    }
  }, []);

  const loadMessages = useCallback(async (threadId: string) => {
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/chat/threads/${threadId}/messages`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessages(data.messages || []);
    } catch {
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const createThread = useCallback(async () => {
    const res = await fetch("/api/chat/threads", { method: "POST" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setThreads((prev) => [data.thread, ...prev]);
    setActiveThreadId(data.thread.id);
    setMessages([]);
    return data.thread as ChatThread;
  }, []);

  const renameThread = useCallback(async (threadId: string, title: string) => {
    const res = await fetch(`/api/chat/threads/${threadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setThreads((prev) =>
      prev.map((t) => (t.id === threadId ? data.thread : t))
    );
    return data.thread as ChatThread;
  }, []);

  const deleteThread = useCallback(async (threadId: string) => {
    const res = await fetch(`/api/chat/threads/${threadId}`, { method: "DELETE" });
    if (!res.ok) return;

    if (activeThreadId === threadId) {
      setActiveThreadId(null);
      setMessages([]);
    }

    await loadThreads();
  }, [activeThreadId, loadThreads]);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  useEffect(() => {
    if (activeThreadId) {
      loadMessages(activeThreadId);
    }
  }, [activeThreadId, loadMessages]);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    let threadId = activeThreadId;
    if (!threadId) {
      const created = await createThread();
      threadId = created.id;
    }

    const optimistic: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: trimmed,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimistic]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch(`/api/chat/threads/${threadId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessages((prev) => {
        const withoutOptimistic = prev.filter((m) => m.id !== optimistic.id);
        return [...withoutOptimistic, data.userMessage, data.assistantMessage];
      });

      if (data.thread) {
        setThreads((prev) =>
          prev
            .map((t) => (t.id === data.thread.id ? data.thread : t))
            .sort((a, b) =>
              new Date(b.last_message_at || b.created_at).getTime() -
              new Date(a.last_message_at || a.created_at).getTime()
            )
        );
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setInput(trimmed);
    } finally {
      setSending(false);
    }
  }, [activeThreadId, createThread, input, sending]);

  const activeTitle = useMemo(() => {
    const found = threads.find((t) => t.id === activeThreadId);
    return found?.title || "New chat";
  }, [activeThreadId, threads]);

  const filteredThreads = useMemo(() => {
    if (!searchQuery.trim()) return threads;
    const query = searchQuery.toLowerCase();
    return threads.filter((thread) => {
      const title = (thread.title || "").toLowerCase();
      const last = (thread.last_message || "").toLowerCase();
      return title.includes(query) || last.includes(query);
    });
  }, [searchQuery, threads]);

  const modelOptions = ["chatgpt-4o-latest", "gpt-4", "gpt-4-turbo"];

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
    <div className="h-screen bg-linear-to-br from-[#f8efe3] via-[#f6f1ea] to-[#eef5f1]">
      <div className="flex h-full">
        {/* Sidebar */}
        <aside className="hidden md:flex w-80 flex-col border-r border-black/5 p-4 bg-white/40 backdrop-blur-xl">
          <div className="flex items-center justify-between pb-4">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-white/80 shadow-[6px_6px_16px_rgba(30,41,59,0.12),-6px_-6px_16px_rgba(255,255,255,0.9)] flex items-center justify-center">
                <Bot className="h-5 w-5 text-emerald-700" />
              </div>
              <div>
                <h2 className="text-sm font-semibold tracking-wide">Citizen Copilot</h2>
                <p className="text-[11px] text-muted-foreground">Chat history</p>
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="rounded-xl"
              onClick={() => setSidebarOpen((v) => !v)}
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
          </div>

          <Button
            onClick={() => createThread()}
            className="rounded-2xl w-full justify-start gap-2 mb-4 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-[0_10px_30px_rgba(16,185,129,0.35)] hover:from-emerald-600 hover:to-emerald-800"
          >
            <Plus className="h-4 w-4" /> New chat
          </Button>

          <div className="mb-3">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats"
              className="rounded-2xl text-sm border border-black/5 bg-white/70 shadow-[inset_4px_4px_10px_rgba(15,23,42,0.08),inset_-4px_-4px_10px_rgba(255,255,255,0.9)]"
            />
          </div>

          <div className="flex-1 overflow-y-auto neo-scrollbar pr-2 space-y-2">
            {loadingThreads ? (
              <div className="text-xs text-muted-foreground">Loading chats...</div>
            ) : filteredThreads.length === 0 ? (
              <div className="text-xs text-muted-foreground">No conversations yet.</div>
            ) : (
              filteredThreads.map((thread) => (
                <div
                  key={thread.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setActiveThreadId(thread.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActiveThreadId(thread.id);
                    }
                  }}
                  className={`group w-full cursor-pointer rounded-2xl p-3 text-left transition-all border ${
                    thread.id === activeThreadId
                      ? "bg-white/90 border-emerald-300 shadow-[inset_2px_2px_8px_rgba(16,185,129,0.15)]"
                      : "bg-white/70 border-white/40 hover:bg-white/90"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {thread.title || "New chat"}
                      </p>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">
                        {thread.last_message || "Start a conversation"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 rounded-lg hover:bg-emerald-100/60"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRenameTarget(thread);
                          setRenameValue(thread.title || "");
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 rounded-lg hover:bg-red-100/60"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(thread);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-black/30">
            <div className="absolute left-0 top-0 h-full w-72 bg-white/70 p-4 border-r border-black/10 backdrop-blur-xl">
              <div className="flex items-center justify-between pb-4">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-xl bg-white/80 shadow-[6px_6px_16px_rgba(30,41,59,0.12),-6px_-6px_16px_rgba(255,255,255,0.9)] flex items-center justify-center">
                    <Bot className="h-5 w-5 text-emerald-700" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold">Citizen Copilot</h2>
                    <p className="text-[11px] text-muted-foreground">Chat history</p>
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="rounded-xl"
                  onClick={() => setSidebarOpen(false)}
                >
                  <PanelLeft className="h-4 w-4" />
                </Button>
              </div>

              <Button
                onClick={() => {
                  createThread();
                  setSidebarOpen(false);
                }}
                className="rounded-2xl w-full justify-start gap-2 mb-4 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-[0_10px_30px_rgba(16,185,129,0.35)]"
              >
                <Plus className="h-4 w-4" /> New chat
              </Button>

              <div className="mb-3">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search chats"
                  className="rounded-2xl text-sm border border-black/5 bg-white/70 shadow-[inset_4px_4px_10px_rgba(15,23,42,0.08),inset_-4px_-4px_10px_rgba(255,255,255,0.9)]"
                />
              </div>

              <div className="flex-1 overflow-y-auto neo-scrollbar pr-2 space-y-2">
                {filteredThreads.map((thread) => (
                  <div
                    key={thread.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setActiveThreadId(thread.id);
                      setSidebarOpen(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setActiveThreadId(thread.id);
                        setSidebarOpen(false);
                      }
                    }}
                    className={`w-full cursor-pointer rounded-2xl p-3 text-left transition-all border ${
                      thread.id === activeThreadId
                        ? "bg-white/90 border-emerald-300 shadow-[inset_2px_2px_8px_rgba(16,185,129,0.15)]"
                        : "bg-white/70 border-white/40 hover:bg-white/90"
                    }`}
                  >
                    <p className="text-sm font-medium truncate">
                      {thread.title || "New chat"}
                    </p>
                    <p className="text-[11px] text-muted-foreground line-clamp-1">
                      {thread.last_message || "Start a conversation"}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-lg px-2 hover:bg-emerald-100/60"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRenameTarget(thread);
                          setRenameValue(thread.title || "");
                          setSidebarOpen(false);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-lg px-2 hover:bg-red-100/60"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(thread);
                          setSidebarOpen(false);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main */}
        <main className="flex-1 flex flex-col">
          <div className="flex items-center justify-between border-b border-black/5 px-4 py-3 bg-white/60 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <Button
                size="icon"
                variant="ghost"
                className="md:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <PanelLeft className="h-4 w-4" />
              </Button>
              <div className="h-9 w-9 rounded-2xl bg-white/80 shadow-[6px_6px_16px_rgba(30,41,59,0.12),-6px_-6px_16px_rgba(255,255,255,0.9)] flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-emerald-700" />
              </div>
              <div>
                <h1 className="text-sm font-semibold">{activeTitle}</h1>
                <p className="text-[11px] text-muted-foreground">Citizen Copilot • Chat</p>
              </div>
            </div>

            <div className="relative">
              <Button
                variant="ghost"
                className="rounded-2xl gap-2 text-xs bg-white/70 border border-black/5 shadow-[0_8px_20px_rgba(15,23,42,0.08)] hover:bg-white"
                onClick={() => setModelMenuOpen((v) => !v)}
              >
                {selectedModel}
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
              {modelMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white backdrop-blur-xl border border-black/10 p-2 z-20 shadow-[0_16px_40px_rgba(15,23,42)]">
                  {modelOptions.map((model) => (
                    <button
                      key={model}
                      onClick={() => {
                        setSelectedModel(model);
                        setModelMenuOpen(false);
                      }}
                      className={`w-full rounded-xl px-3 py-2 text-left text-xs transition-all ${
                        model === selectedModel
                          ? "bg-emerald-50 text-emerald-800"
                          : "hover:bg-emerald-50/60"
                      }`}
                    >
                      {model}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div
            ref={listRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto neo-scrollbar bg-linear-to-b from-white/30 via-white/10 to-transparent px-4 py-6 space-y-4"
          >
            {loadingMessages ? (
              <div className="text-sm text-muted-foreground">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 text-center text-muted-foreground h-full">
                <div className="h-16 w-16 rounded-3xl neo-pressed flex items-center justify-center">
                  <Bot className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Start a new conversation</p>
                  <p className="text-xs">Ask about schemes, eligibility, or benefits.</p>
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-3xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-linear-to-br from-emerald-600 to-emerald-700 text-white shadow-[0_12px_30px_rgba(16,185,129,0.35)]"
                        : "bg-white/80 border border-white/60 shadow-[8px_8px_22px_rgba(15,23,42,0.08),-8px_-8px_22px_rgba(255,255,255,0.95)]"
                    }`}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-black/5 bg-white/60 px-4 py-4 backdrop-blur-md">
            <div className="mx-auto w-full max-w-4xl">
              <div className="flex items-end gap-2 rounded-3xl p-2 bg-white/80 border border-white/60 shadow-[12px_12px_28px_rgba(15,23,42,0.08),-10px_-10px_26px_rgba(255,255,255,0.9)]">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask about schemes, eligibility, or benefits..."
                  rows={1}
                  className="flex-1 resize-none rounded-2xl border border-black/5 bg-white/70 px-4 py-3 text-sm shadow-[inset_4px_4px_10px_rgba(15,23,42,0.08),inset_-4px_-4px_10px_rgba(255,255,255,0.9)] focus-visible:ring-2 focus-visible:ring-emerald-400"
                />
                <Button
                  onClick={handleSend}
                  disabled={sending || !input.trim()}
                  className="h-12 w-12 rounded-2xl bg-linear-to-br from-emerald-600 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 shadow-[0_12px_30px_rgba(16,185,129,0.35)]"
                >
                  <Send className="h-4 w-4 text-white" />
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {renameTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-md rounded-3xl p-6 bg-white/90 backdrop-blur-xl border border-white/60 shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
            <h3 className="text-sm font-semibold mb-2">Rename chat</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Update the title for this conversation.
            </p>
            <Input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder="Chat title"
              className="rounded-2xl border border-black/5 bg-white/70 shadow-[inset_4px_4px_10px_rgba(15,23,42,0.08),inset_-4px_-4px_10px_rgba(255,255,255,0.9)]"
            />
            <div className="mt-4 flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                className="rounded-xl"
                onClick={() => {
                  setRenameTarget(null);
                  setRenameValue("");
                }}
              >
                Cancel
              </Button>
              <Button
                className="rounded-xl"
                onClick={async () => {
                  if (!renameTarget) return;
                  const nextTitle = renameValue.trim();
                  if (!nextTitle) return;
                  await renameThread(renameTarget.id, nextTitle);
                  setRenameTarget(null);
                  setRenameValue("");
                }}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-md rounded-3xl p-6 bg-white/90 backdrop-blur-xl border border-white/60 shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
            <h3 className="text-sm font-semibold mb-2">Delete chat?</h3>
            <p className="text-xs text-muted-foreground mb-4">
              This removes the conversation and all its messages.
            </p>
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                className="rounded-xl"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </Button>
              <Button
                className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={async () => {
                  const target = deleteTarget;
                  setDeleteTarget(null);
                  if (target) {
                    await deleteThread(target.id);
                  }
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
