import { useEffect, useRef, useState } from "react";
import { Check, Copy, Eraser, MessageSquarePlus, Send } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Disclaimer } from "@/components/tool/panels";
import { copyText } from "@/components/tool/useToolRun";
import { runWorkplaceChat } from "@/lib/ai.functions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const STORAGE_KEY = "flowdesk-chat-session";

const LIMITATION_NOTICE =
  "AI-generated content may contain inaccuracies. Review and verify generated content before using it for professional or important decisions. FlowDesk AI cannot send emails, access private company systems, schedule meetings or take actions on your behalf, and it does not remember conversations permanently.";

const ERROR_MESSAGE =
  "FlowDesk AI could not generate a response. Your conversation has been preserved. Please retry.";

const STARTERS = [
  "Help me choose the correct FlowDesk AI tool.",
  "How should I prioritise my work today?",
  "What information do you need to draft a professional email?",
  "How can I improve the quality of my meeting notes?",
];

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

let seq = 0;
const nextId = () => `msg-${++seq}`;


export function WorkplaceChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [sendError, setSendError] = useState("");


  const composerRef = useRef<HTMLTextAreaElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const stored = window.sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Message[];
        seq = parsed.length;
        setMessages(parsed);
      }
    } catch {
      /* session storage unavailable */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      /* session storage unavailable */
    }
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, hydrated]);

  const send = async (text: string) => {
    const value = text.trim();
    if (!value || pending) return;

    const history = [...messages, { id: nextId(), role: "user" as const, text: value }];
    setMessages(history);
    setDraft("");
    setPending(true);
    setSendError("");

    try {
      const { reply } = await runWorkplaceChat({
        data: {
          messages: history
            .slice(-10)
            .map((m) => ({ role: m.role, content: m.text })),
        },
      });
      setMessages((prev) => [...prev, { id: nextId(), role: "assistant", text: reply }]);
    } catch {
      setSendError(ERROR_MESSAGE);
    } finally {
      setPending(false);
      composerRef.current?.focus();
    }
  };

  const reset = () => {
    setMessages([]);
    setDraft("");
    setPending(false);
    setSendError("");
    composerRef.current?.focus();
  };


  const requestClear = () => {
    if (messages.length === 0) {
      reset();
      return;
    }
    setConfirmClear(true);
  };

  const copyMessage = async (message: Message) => {
    await copyText(message.text);
    setCopiedId(message.id);
    window.setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="grid min-w-0 gap-8">
      <PageHeader
        eyebrow="Workspace tool"
        title="AI Workplace Chatbot"
        description="A multi-turn workspace conversation surface. Messages stay in this browser session only."
      />

      <div className="surface-panel grid min-w-0 gap-4 p-4 sm:p-6">
        <div className="grid gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
          <p className="text-sm font-medium">Current session conversation</p>
          <div className="grid gap-2 sm:flex sm:flex-wrap">
            <Button variant="outline" size="sm" className="min-h-11 sm:min-h-9" onClick={reset}>
              <MessageSquarePlus className="size-4" />
              New Conversation
            </Button>
            <Button variant="ghost" size="sm" className="min-h-11 sm:min-h-9" onClick={requestClear}>
              <Eraser className="size-4" />
              Clear Conversation
            </Button>
          </div>
        </div>

        <div
          role="log"
          aria-live="polite"
          aria-label="Conversation messages"
          className="grid min-h-[18rem] min-w-0 content-start gap-4 overflow-y-auto rounded-xl border border-border bg-secondary/30 p-4 sm:max-h-[26rem]"
        >
          {messages.length === 0 ? (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <h2 className="text-base font-semibold">Welcome to your workspace conversation</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Start by describing what you are working on. This prototype keeps your messages
                  visible for the current browser session only — nothing is stored anywhere else and
                  no assistant responses are generated yet.
                </p>
              </div>
              <div className="grid gap-2">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Starter prompts
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {STARTERS.map((prompt) => (
                    <Button
                      key={prompt}
                      variant="outline"
                      className="h-auto min-h-11 w-full justify-start whitespace-normal py-2.5 text-left text-sm"
                      onClick={() => send(prompt)}
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.role === "user"
                    ? "grid min-w-0 justify-items-end gap-1"
                    : "grid min-w-0 gap-1"
                }
              >
                <span className="text-xs font-medium text-muted-foreground">
                  {message.role === "user" ? "You" : "FlowDesk AI"}
                </span>
                <div
                  className={
                    message.role === "user"
                      ? "max-w-[85%] min-w-0 rounded-xl bg-primary px-3.5 py-2.5 text-sm leading-relaxed text-primary-foreground break-words whitespace-pre-wrap"
                      : "max-w-[85%] min-w-0 rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm leading-relaxed break-words whitespace-pre-wrap"
                  }
                >
                  {message.text}
                </div>
                {message.role === "assistant" ? (

                  <Button
                    variant="ghost"
                    size="sm"
                    className="min-h-11 justify-self-start sm:min-h-9"
                    onClick={() => copyMessage(message)}
                  >
                    {copiedId === message.id ? (
                      <Check className="size-4" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                    {copiedId === message.id ? "Response copied" : "Copy response"}
                  </Button>
                ) : null}
              </div>
            ))
          )}

          {pending ? (
            <p className="text-sm text-muted-foreground">
              <span className="sr-only">Status: </span>
              FlowDesk AI is typing…
            </p>
          ) : null}
          <div ref={endRef} />
        </div>

        {sendError ? (
          <div
            role="alert"
            className="grid gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm sm:flex sm:items-center sm:justify-between"
          >
            <span className="min-w-0">{ERROR_MESSAGE}</span>
            <Button
              variant="outline"
              size="sm"
              aria-label="Retry the last message"
              onClick={() => {
                const last = [...messages].reverse().find((m) => m.role === "user");
                if (!last) return;
                setMessages((prev) => prev.filter((m) => m.id !== last.id));
                void send(last.text);
              }}
            >
              Retry
            </Button>
          </div>
        ) : null}

        <form
          className="grid min-w-0 gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            void send(draft);
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="chat-composer" className="text-sm font-medium">
              Your message
            </Label>
            <Textarea
              id="chat-composer"
              ref={composerRef}
              rows={3}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(draft);
                }
              }}
              placeholder="Describe the task you are working on…"
              aria-describedby="chat-composer-hint"
              className="min-h-24 resize-y"
            />
            <p id="chat-composer-hint" className="text-xs leading-relaxed text-muted-foreground">
              Press Enter to send, Shift+Enter for a new line. Do not include confidential or
              personal information. Messages are kept in this browser session only and are cleared
              when the session ends.
            </p>
          </div>
          <Button
            type="submit"
            className="min-h-11 w-full sm:w-auto"
            disabled={!draft.trim() || pending}
          >
            <Send className="size-4" />
            {pending ? "Sending…" : "Send message"}
          </Button>
        </form>



        <Disclaimer>{LIMITATION_NOTICE}</Disclaimer>
      </div>

      <AlertDialog open={confirmClear} onOpenChange={setConfirmClear}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear this conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              {messages.length} message{messages.length === 1 ? "" : "s"} will be removed from this
              session. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep conversation</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                reset();
                setConfirmClear(false);
              }}
            >
              Clear conversation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
