"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

type TableEvent = "INSERT" | "UPDATE" | "DELETE" | "*";

interface UseRealtimeOptions {
  table: string;
  schema?: string;
  event?: TableEvent;
  filter?: string;
  onInsert?: (payload: Record<string, unknown>) => void;
  onUpdate?: (payload: Record<string, unknown>) => void;
  onDelete?: (payload: Record<string, unknown>) => void;
  onChange?: (payload: {
    eventType: string;
    new: Record<string, unknown>;
    old: Record<string, unknown>;
  }) => void;
  enabled?: boolean;
}

/**
 * Subscribe to Supabase Realtime Postgres changes on a table.
 *
 * @example
 * useSupabaseRealtime({
 *   table: "schemes",
 *   event: "*",
 *   onChange: (payload) => { refetch(); },
 * });
 */
export function useSupabaseRealtime({
  table,
  schema = "public",
  event = "*",
  filter,
  onInsert,
  onUpdate,
  onDelete,
  onChange,
  enabled = true,
}: UseRealtimeOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const supabase = createClient();
    const channelName = `realtime:${schema}:${table}:${event}:${filter || "all"}`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const channelConfig: any = {
      event,
      schema,
      table,
    };
    if (filter) channelConfig.filter = filter;

    const channel = supabase
      .channel(channelName)
      .on("postgres_changes", channelConfig, (payload: Record<string, unknown>) => {
        const eventType = payload.eventType as string;

        if (onChange) {
          onChange({
            eventType,
            new: (payload.new as Record<string, unknown>) || {},
            old: (payload.old as Record<string, unknown>) || {},
          });
        }

        if (eventType === "INSERT" && onInsert) onInsert(payload);
        if (eventType === "UPDATE" && onUpdate) onUpdate(payload);
        if (eventType === "DELETE" && onDelete) onDelete(payload);
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [table, schema, event, filter, enabled, onInsert, onUpdate, onDelete, onChange]);
}
