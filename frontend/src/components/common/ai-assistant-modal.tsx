import { useCallback, useRef, useState } from "react";
import { Bot, Send, Sparkles, User as UserIcon } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

const PRESET_QUESTIONS = [
  "What did the team work on last week?",
  "Which projects have the highest workload?",
  "What are the recurring blockers?",
  "Summarize this week's activity.",
];

const MOCK_ANSWERS: Record<string, string> = {
  "What did the team work on last week?":
    "Last week, Alex Perera implemented database query optimizations and virtualized invoice tables for the Client Portal. Sarah Fernando delivered the core backend OAuth authentication endpoints for Internal Tooling. Daniel Silva conducted performance regression testing.",
  "Which projects have the highest workload?":
    "Currently, Client Portal accounts for 42% of total team hours (68h total), followed by R&D (28%) and Mobile Application (18%). Internal Tooling and Marketing Automation account for the remaining 12%.",
  "What are the recurring blockers?":
    "The primary recurring blocker across recent reports is pending third-party API rate limit approvals and waiting for cross-team security review sign-offs on OAuth endpoints.",
  "Summarize this week's activity.":
    "This week, 4 out of 5 team members have submitted reports with an 80% submission compliance rate. 18 completed tasks were delivered, 142 total engineering hours were logged, and 2 reports are pending manager review.",
};

export function AIAssistantModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      sender: "ai",
      text: "Hello! I am your AI Team Reporting Assistant (Frontend Demo). Ask me anything about team velocity, workload, or weekly blockers.",
      timestamp: "Just now",
    },
  ]);
  const [input, setInput] = useState("");
  const nextId = useRef(0);

  const handleSend = useCallback((questionText?: string) => {
    const q = (questionText || input).trim();
    if (!q) return;

    const a = nextId.current++;
    const userMsg: Message = {
      id: `u-${a}`,
      sender: "user",
      text: q,
      timestamp: "Just now",
    };

    const answer =
      MOCK_ANSWERS[q] ||
      `Based on current report telemetry: "${q}" — The team completed 18 tasks across 5 projects this week with strong overall progress.`;

    const aiMsg: Message = {
      id: `ai-${a}`,
      sender: "ai",
      text: answer,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInput("");
  }, [input]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col h-full bg-card">
        <SheetHeader className="p-4 border-b flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="size-4" />
            </div>
            <div>
              <SheetTitle className="text-sm font-semibold flex items-center gap-2">
                Reporting AI Assistant
                <Badge variant="outline" className="text-[10px] py-0">
                  Demo
                </Badge>
              </SheetTitle>
              <p className="text-[11px] text-muted-foreground">Pre-seeded intelligent insights</p>
            </div>
          </div>
        </SheetHeader>

        <div className="p-3 border-b bg-muted/30">
          <p className="text-[11px] font-medium text-muted-foreground mb-2">Suggested Prompts:</p>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="text-[11px] bg-background hover:bg-accent border rounded-full px-2.5 py-1 transition-colors text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 text-xs ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.sender === "ai" && (
                  <div className="size-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Bot className="size-4" />
                  </div>
                )}
                <div
                  className={`rounded-xl p-3 max-w-[80%] space-y-1 ${
                    m.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/60 text-foreground border"
                  }`}
                >
                  <p className="leading-relaxed">{m.text}</p>
                </div>
                {m.sender === "user" && (
                  <div className="size-7 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center shrink-0">
                    <UserIcon className="size-4" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-card">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AI about reports..."
              className="text-xs flex-1"
            />
            <Button type="submit" size="sm">
              <Send className="size-3.5" />
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
