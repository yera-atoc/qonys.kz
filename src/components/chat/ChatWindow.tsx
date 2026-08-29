'use client';

import { useCallback, useEffect, useOptimistic, useRef, useState, startTransition } from 'react';
import { useI18n } from '@/components/I18nProvider';
import { LOCALE_META } from '@/lib/i18n';

export type ChatMessage = {
  id: string;
  senderId: string | null;
  body: string;
  isSystem: boolean;
  flagged: boolean;
  readAt: string | Date | null;
  createdAt: string | Date;
};

type Props = {
  threadId: string;
  meId: string;
  initialMessages: ChatMessage[];
  peerName: string;
  closed?: boolean;
  /** Модератор отвечает от лица поддержки, а не от своего имени */
  asSupport?: boolean;
};

const POLL_ACTIVE = 4000;
const POLL_IDLE = 20000;

export function ChatWindow({ threadId, meId, initialMessages, peerName, closed = false, asSupport = false }: Props) {
  const { locale, t } = useI18n();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [optimistic, addOptimistic] = useOptimistic(messages, (state, m: ChatMessage) => [...state, m]);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const lastAt = useRef<string | null>(
    initialMessages.length ? new Date(initialMessages[initialMessages.length - 1].createdAt).toISOString() : null
  );

  const scrollToBottom = useCallback((smooth = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'end' });
  }, []);

  useEffect(() => scrollToBottom(false), [scrollToBottom]);

  // Поллинг вместо WebSocket: на Vercel serverless сокет держать негде,
  // а при таком объёме переписки разница для пользователя незаметна.
  // Вкладка в фоне — опрашиваем реже, чтобы не жечь батарею и квоту функций.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let stopped = false;

    async function poll() {
      if (!stopped && document.visibilityState === 'visible') {
        try {
          const url = `/api/threads/${threadId}/messages${
            lastAt.current ? `?after=${encodeURIComponent(lastAt.current)}` : ''
          }`;
          const res = await fetch(url, { cache: 'no-store' });
          if (res.ok) {
            const data = await res.json();
            if (data.messages?.length) {
              setMessages((prev) => {
                const known = new Set(prev.map((m: ChatMessage) => m.id));
                const fresh = data.messages.filter((m: ChatMessage) => !known.has(m.id));
                if (!fresh.length) return prev;
                lastAt.current = new Date(fresh[fresh.length - 1].createdAt).toISOString();
                return [...prev, ...fresh];
              });
              requestAnimationFrame(() => scrollToBottom());
            }
          }
        } catch {
          /* сеть отвалилась — просто ждём следующий тик */
        }
      }
      timer = setTimeout(poll, document.visibilityState === 'visible' ? POLL_ACTIVE : POLL_IDLE);
    }

    timer = setTimeout(poll, POLL_ACTIVE);
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [threadId, scrollToBottom]);

  async function send() {
    const body = draft.trim();
    if (!body || sending) return;

    const temp: ChatMessage = {
      id: `temp-${Date.now()}`,
      senderId: meId,
      body,
      isSystem: false,
      flagged: false,
      readAt: null,
      createdAt: new Date()
    };

    setDraft('');
    setError(null);
    setSending(true);
    startTransition(() => addOptimistic(temp));
    requestAnimationFrame(() => scrollToBottom());

    try {
      const res = await fetch(`/api/threads/${threadId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body })
      });
      const data = await res.json();

      if (!res.ok) {
        setDraft(body); // черновик не теряем
        setError(data.error === 'RATE_LIMITED' ? t.chat.tooFast : t.common.error);
        return;
      }

      setMessages((prev) => [...prev, data.message]);
      lastAt.current = new Date(data.message.createdAt).toISOString();
    } catch {
      setDraft(body);
      setError(t.common.error);
    } finally {
      setSending(false);
    }
  }

  const timeFmt = new Intl.DateTimeFormat(LOCALE_META[locale].intl, { hour: '2-digit', minute: '2-digit' });
  const dayFmt = new Intl.DateTimeFormat(LOCALE_META[locale].intl, { day: 'numeric', month: 'long' });

  function dayLabel(d: Date) {
    const startOfToday = new Date().setHours(0, 0, 0, 0);
    const diff = Math.floor((startOfToday - new Date(d).setHours(0, 0, 0, 0)) / 864e5);
    if (diff === 0) return t.chat.today;
    if (diff === 1) return t.chat.yesterday;
    return dayFmt.format(d);
  }

  let lastDay = '';

  return (
    <div className="flex h-[min(70vh,640px)] flex-col overflow-hidden rounded-3xl border border-line bg-white">
      <div className="flex-1 space-y-1 overflow-y-auto px-4 py-5 sm:px-6">
        {optimistic.map((m) => {
          const created = new Date(m.createdAt);
          const label = dayLabel(created);
          const showDay = label !== lastDay;
          lastDay = label;
          const mine = m.senderId === meId;

          if (m.isSystem) {
            return (
              <div key={m.id} className="py-3 text-center text-[13px] text-muted">
                {m.body === 'THREAD_CLOSED' ? t.support.closed : m.body}
              </div>
            );
          }

          return (
            <div key={m.id}>
              {showDay && <div className="py-3 text-center text-xs uppercase tracking-wide text-muted">{label}</div>}
              <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[78%]">
                  <div
                    className={`whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-[15px] leading-snug ${
                      mine ? 'bg-ink text-white' : 'bg-card text-ink'
                    }`}
                  >
                    {m.body}
                  </div>
                  <div
                    className={`mt-1 flex items-center gap-1.5 px-1 text-[11px] text-muted ${
                      mine ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {timeFmt.format(created)}
                    {mine && m.readAt && <span>✓✓</span>}
                  </div>
                  {m.flagged && !mine && (
                    <p className="mt-1.5 rounded-xl bg-danger/10 px-3 py-2 text-[12px] leading-snug text-danger">
                      {t.chat.flagged}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {closed ? (
        <div className="border-t border-line px-4 py-4 text-center text-[13px] text-muted sm:px-6">
          {t.support.closedNote}
        </div>
      ) : (
        <div className="border-t border-line px-4 py-3 sm:px-6">
          {error && <p className="mb-2 text-[13px] text-danger">{error}</p>}
          <div className="flex items-end gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              rows={1}
              maxLength={2000}
              placeholder={asSupport ? `${t.support.moderator} → ${peerName}` : t.chat.placeholder}
              aria-label={t.chat.placeholder}
              className="max-h-32 min-h-[44px] flex-1 resize-none rounded-2xl border border-line bg-white px-4 py-3 text-[15px] outline-none transition focus:border-ink/30"
            />
            <button
              onClick={() => void send()}
              disabled={!draft.trim() || sending}
              className="btn-primary h-11 px-5 disabled:opacity-40"
            >
              {sending ? t.common.sending : t.chat.send}
            </button>
          </div>
          <p className="mt-2 hidden text-[11px] text-muted sm:block">{t.chat.typingHint}</p>
        </div>
      )}
    </div>
  );
}
