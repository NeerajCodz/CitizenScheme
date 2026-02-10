"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { Bot, MessageCircle, Plus, Send, Trash2, PanelLeft, Pencil, ChevronDown, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ThemeToggle } from "@/components/ThemeToggle";
import Link from "next/link";

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
    <div className="h-screen bg-gradient-to-br from-[#e8e8eb] via-[#f0f0f3] to-[#e8e8eb] dark:from-[hsl(240,10%,8%)] dark:via-[hsl(240,10%,10%)] dark:to-[hsl(240,10%,8%)]">
      <div className="flex h-full">
        {/* Sidebar */}
        <aside className="hidden md:flex w-80 flex-col border-r border-black/5 dark:border-white/10 p-4 bg-gradient-to-br from-[#ececef] to-[#e8e8eb] dark:from-[hsl(240,10%,10%)] dark:to-[hsl(240,10%,8%)]">
          <div className="flex items-center justify-between pb-4">
            <div className="flex items-center gap-2">
              <div className="neo-elevated h-9 w-9 rounded-xl flex items-center justify-center">
                <Bot className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-200">Citizen Copilot</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Chat history</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                size="icon"
                variant="ghost"
                className="neo-elevated-sm rounded-xl h-8 w-8 hover:neo-inset-sm"
                onClick={() => setSidebarOpen((v) => !v)}
              >
                <PanelLeft className="h-4 w-4 text-slate-600 dark:text-slate-300" />
              </Button>
            </div>
          </div>

          <Button
            onClick={() => createThread()}
            className="neo-btn-primary rounded-2xl w-full justify-start gap-2 mb-4"
          >
            <Plus className="h-4 w-4" /> New chat
          </Button>

          <div className="mb-3">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats"
              className="neo-inset rounded-2xl text-sm border-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:ring-0 focus-visible:outline-none"
            />
          </div>

          <div className="flex-1 overflow-y-auto neo-scrollbar pr-2 space-y-2">
            {loadingThreads ? (
              <div className="text-xs text-slate-500 dark:text-slate-400">Loading chats...</div>
            ) : filteredThreads.length === 0 ? (
              <div className="text-xs text-slate-500 dark:text-slate-400">No conversations yet.</div>
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
                  className={`group w-full cursor-pointer rounded-2xl p-3 text-left transition-all ${
                    thread.id === activeThreadId
                      ? "neo-selected"
                      : "neo-elevated-sm hover:neo-inset-sm"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate text-slate-700 dark:text-slate-200">
                        {thread.title || "New chat"}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {thread.last_message || "Start a conversation"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 rounded-lg neo-elevated-sm hover:neo-inset-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRenameTarget(thread);
                          setRenameValue(thread.title || "");
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 rounded-lg neo-elevated-sm hover:shadow-[inset_2px_2px_4px_rgba(220,38,38,0.2)] dark:hover:shadow-[inset_2px_2px_4px_rgba(220,38,38,0.3)]"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(thread);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
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
          <div className="md:hidden fixed inset-0 z-40 bg-black/30 dark:bg-black/50">
            <div className="absolute left-0 top-0 h-full w-72 neo-elevated p-4 border-r border-black/5 dark:border-white/10 rounded-none">
              <div className="flex items-center justify-between pb-4">
                <div className="flex items-center gap-2">
                  <div className="neo-elevated-sm h-9 w-9 rounded-xl flex items-center justify-center">
                    <Bot className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Citizen Copilot</h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Chat history</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="neo-elevated-sm rounded-xl h-8 w-8 hover:neo-inset-sm"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <PanelLeft className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                  </Button>
                </div>
              </div>

              <Button
                onClick={() => {
                  createThread();
                  setSidebarOpen(false);
                }}
                className="neo-btn-primary rounded-2xl w-full justify-start gap-2 mb-4"
              >
                <Plus className="h-4 w-4" /> New chat
              </Button>

              <div className="mb-3">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search chats"
                  className="neo-inset rounded-2xl text-sm border-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:ring-0 focus-visible:outline-none"
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
                    className={`w-full cursor-pointer rounded-2xl p-3 text-left transition-all ${
                      thread.id === activeThreadId
                        ? "neo-selected"
                        : "neo-elevated-sm hover:neo-inset-sm"
                    }`}
                  >
                    <p className="text-sm font-medium truncate text-slate-700 dark:text-slate-200">
                      {thread.title || "New chat"}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {thread.last_message || "Start a conversation"}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-lg px-2 neo-elevated-sm hover:neo-inset-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRenameTarget(thread);
                          setRenameValue(thread.title || "");
                          setSidebarOpen(false);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-lg px-2 neo-elevated-sm hover:shadow-[inset_2px_2px_4px_rgba(220,38,38,0.2)]"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(thread);
                          setSidebarOpen(false);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
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
          <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 px-4 py-3 neo-surface">
            <div className="flex items-center gap-3">
              <Link href="/home" className="neo-elevated-sm rounded-xl h-9 w-9 flex items-center justify-center hover:neo-inset-sm transition-all">
                <ArrowLeft className="h-4 w-4 text-slate-600 dark:text-slate-300" />
              </Link>
              <Button
                size="icon"
                variant="ghost"
                className="md:hidden neo-elevated-sm h-9 w-9 rounded-xl hover:neo-inset-sm"
                onClick={() => setSidebarOpen(true)}
              >
                <PanelLeft className="h-4 w-4 text-slate-600 dark:text-slate-300" />
              </Button>
              <div className="neo-elevated-sm h-9 w-9 rounded-2xl flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{activeTitle}</h1>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Citizen Copilot • Chat</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden md:block"><ThemeToggle /></div>
              <div className="relative">
                <Button
                  variant="ghost"
                  className="neo-elevated-sm rounded-2xl gap-2 text-xs text-slate-700 dark:text-slate-200 hover:neo-inset-sm"
                  onClick={() => setModelMenuOpen((v) => !v)}
                >
                  {selectedModel}
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
                {modelMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl neo-elevated-lg p-2 z-20">
                    {modelOptions.map((model) => (
                      <button
                        key={model}
                        onClick={() => {
                          setSelectedModel(model);
                          setModelMenuOpen(false);
                        }}
                        className={`w-full rounded-xl px-3 py-2 text-left text-xs transition-all text-slate-700 dark:text-slate-200 ${
                          model === selectedModel
                            ? "neo-selected font-medium"
                            : "hover:neo-inset-sm"
                        }`}
                      >
                        {model}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div
            ref={listRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto neo-scrollbar neo-surface-gradient px-4 py-6 space-y-4"
          >
            {loadingMessages ? (
              <div className="text-sm text-slate-500 dark:text-slate-400">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 text-center h-full">
                <div className="neo-inset-lg h-16 w-16 rounded-3xl flex items-center justify-center">
                  <Bot className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Start a new conversation</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Ask about schemes, eligibility, or benefits.</p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-3xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "neo-message-user"
                          : "neo-message-assistant"
                      }`}
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))}
                {sending && (
                  <div className="flex justify-start">
                    <div className="rounded-3xl px-5 py-3.5 neo-message-assistant">
                      <div className="flex gap-1.5">
                        <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-emerald-400 dark:bg-emerald-500 [animation-delay:0ms]" />
                        <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-emerald-400 dark:bg-emerald-500 [animation-delay:150ms]" />
                        <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-emerald-400 dark:bg-emerald-500 [animation-delay:300ms]" />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-black/5 dark:border-white/10 neo-surface px-4 py-4">
            <div className="mx-auto w-full max-w-4xl">
              <div className="flex items-end gap-3 rounded-3xl p-3 neo-elevated-lg">
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
                  className="flex-1 resize-none rounded-2xl border-none neo-inset px-4 py-3 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:ring-0 focus-visible:outline-none transition-all"
                />
                <Button
                  onClick={handleSend}
                  disabled={sending || !input.trim()}
                  className="h-12 w-12 shrink-0 rounded-2xl neo-btn-primary"
                >
                  <Send className="h-4 w-4 text-white" />
                </Button>
              </div>
              <div className="flex items-center justify-center gap-1.5 mt-2 opacity-60">
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Powered by</span>
                <img 
                  src="https://framerusercontent.com/images/B1pu30dG18pgu4LBa9DzkcdS3Q.png?scale-down-to=512&width=627&height=78" 
                  alt="Logo" 
                  className="h-3 object-contain dark:invert dark:opacity-80"
                />
              </div>
            </div>
          </div>
        </main>
      </div>

      {renameTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 dark:bg-black/50 px-4">
          <div className="w-full max-w-md rounded-3xl p-6 neo-container">
            <h3 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-200">Rename chat</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Update the title for this conversation.
            </p>
            <Input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder="Chat title"
              className="neo-inset rounded-2xl border-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:ring-0 focus-visible:outline-none"
            />
            <div className="mt-4 flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                className="rounded-xl neo-elevated hover:neo-inset-sm text-slate-700 dark:text-slate-200"
                onClick={() => {
                  setRenameTarget(null);
                  setRenameValue("");
                }}
              >
                Cancel
              </Button>
              <Button
                className="rounded-xl neo-btn-primary"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 dark:bg-black/50 px-4">
          <div className="w-full max-w-md rounded-3xl p-6 neo-container">
            <h3 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-200">Delete chat?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              This removes the conversation and all its messages.
            </p>
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                className="rounded-xl neo-elevated hover:neo-inset-sm text-slate-700 dark:text-slate-200"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </Button>
              <Button
                className="rounded-xl bg-gradient-to-br from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all"
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
