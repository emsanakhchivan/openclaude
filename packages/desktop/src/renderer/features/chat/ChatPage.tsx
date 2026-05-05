import { useState } from "react"
import { SendHorizontal, Paperclip, ChevronDown, ChevronRight, Check, FileCode, FileDiff, Loader2, ArrowUp, TerminalSquare, Eye, Pencil, Search } from "lucide-react"

// ─── Context Circle (token usage indicator) ────────────────────────────────
function ContextCircle({ percent, size = 14, strokeWidth = 2.5 }: { percent: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-[var(--color-quiet)]" />
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth}
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        className="text-[var(--color-accent)] transition-all duration-300" />
    </svg>
  )
}

// ─── Model Dropdown ─────────────────────────────────────────────────────────
const MODELS = [
  { id: "glm-5", name: "GLM-5", provider: "ZhipuAI" },
  { id: "gpt-5.5", name: "GPT-5.5", provider: "OpenAI" },
  { id: "kimi-k2.6", name: "Kimi-K2.6", provider: "Moonshot" },
  { id: "qwen-3.6-plus", name: "Qwen 3.6 Plus", provider: "Alibaba" },
  { id: "custom", name: "Custom Model", provider: "Custom" },
]

function ModelDropdown({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  const [open, setOpen] = useState(false)
  const current = MODELS.find(m => m.id === selected) || MODELS[0]
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="h-7 px-2 flex items-center gap-1 text-[11px] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-muted)] transition-colors font-medium">
        {current.name} <ChevronDown className="h-3 w-3 shrink-0 opacity-50" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-0 mb-1 w-[220px] z-50 bg-popover border border-[var(--color-line)] shadow-2xl py-1">
            {MODELS.map(model => (
              <button key={model.id} onClick={() => { onSelect(model.id); setOpen(false) }}
                className={`flex items-center gap-2 w-full px-3 py-[6px] text-[13px] transition-colors ${selected === model.id ? 'bg-[var(--color-muted)] text-[var(--color-foreground)]' : 'text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]'}`}>
                <span className="flex-1 text-left">{model.name}</span>
                <span className="text-[10px] text-[var(--color-quiet)]">{model.provider}</span>
                {selected === model.id && <Check className="h-3.5 w-3.5 shrink-0 text-[var(--color-accent)]" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Mode Dropdown with per-mode colors ─────────────────────────────────────
const MODES = [
  { id: "ask", label: "Ask", desc: "Prompts before every action" },
  { id: "accept-edits", label: "Accept edits", desc: "Auto-approves file edits" },
  { id: "plan", label: "Plan", desc: "Shows plan before executing" },
  { id: "bypass", label: "Bypass", desc: "Skips all permission checks" },
]

// Focus glow shadow per mode — accent-based
const MODE_FOCUS_SHADOW: Record<string, string> = {
  ask: "0 0 0 1px var(--color-accent-line)",
  "accept-edits": "0 0 0 1px rgba(52,211,153,0.5)",
  plan: "0 0 0 1px rgba(96,165,250,0.5)",
  bypass: "0 0 0 1px rgba(248,113,113,0.5)",
}

function ModeDropdown({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  const [open, setOpen] = useState(false)
  const current = MODES.find(m => m.id === selected) || MODES[0]
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="h-7 px-2 flex items-center gap-1 text-[11px] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-muted)] transition-colors font-medium">
        {current.label} <ChevronDown className="h-3 w-3 shrink-0 opacity-50" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-0 mb-1 w-[240px] z-50 bg-popover border border-[var(--color-line)] shadow-2xl py-1">
            {MODES.map(mode => (
              <button key={mode.id} onClick={() => { onSelect(mode.id); setOpen(false) }}
                className={`flex flex-col w-full px-3 py-[7px] text-left transition-colors ${selected === mode.id ? 'bg-[var(--color-muted)]' : 'hover:bg-[var(--color-muted)]'}`}>
                <div className="flex items-center gap-2 w-full">
                  <span className={`text-[13px] font-medium ${selected === mode.id ? 'text-[var(--color-foreground)]' : 'text-[var(--color-ink-2)]'}`}>{mode.label}</span>
                  {selected === mode.id && <Check className="h-3.5 w-3.5 shrink-0 text-[var(--color-accent)] ml-auto" />}
                </div>
                <span className="text-[11px] text-[var(--color-quiet)] mt-0.5">{mode.desc}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Collapsible File Changes Dropdown ──────────────────────────────────────
const CHANGED_FILES = [
  { name: "payment-service.ts", added: 48, removed: 12 },
  { name: "webhook-handler.ts", added: 86, removed: 4 },
  { name: "email-notifier.ts", added: 34, removed: 0 },
]

function FileChangesDropdown() {
  const [open, setOpen] = useState(false)
  const totalAdded = CHANGED_FILES.reduce((s, f) => s + f.added, 0)
  const totalRemoved = CHANGED_FILES.reduce((s, f) => s + f.removed, 0)
  return (
    <div className="border-t border-[var(--color-line)]">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-5 py-2 text-[12px] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-muted)] transition-colors">
        <ChevronRight className={`h-3 w-3 shrink-0 transition-transform duration-200 ${open ? 'rotate-90' : ''}`} />
        <FileDiff className="h-3.5 w-3.5 text-[var(--color-quiet)]" />
        <span className="font-medium text-[var(--color-ink-2)]">{CHANGED_FILES.length} files changed</span>
        <span className="text-green-600 text-[11px]">+{totalAdded}</span>
        <span className="text-red-500 text-[11px]">−{totalRemoved}</span>
      </button>
      {open && (
        <div className="px-5 pb-2.5 space-y-0.5">
          {CHANGED_FILES.map(f => (
            <div key={f.name} className="flex items-center gap-2 py-1 px-2 hover:bg-[var(--color-muted)] cursor-pointer transition-colors group">
              <FileCode className="h-3 w-3 text-[var(--color-quiet)] group-hover:text-[var(--color-muted-foreground)] shrink-0" />
              <span className="text-[12px] text-[var(--color-muted-foreground)] group-hover:text-[var(--color-foreground)] flex-1 truncate">{f.name}</span>
              <span className="text-[10px] text-green-600">+{f.added}</span>
              <span className="text-[10px] text-red-500">−{f.removed}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Tool Call / Step Indicator ──────────────────────────────────────────────
function ToolCallStep({ title, subtitle, pending }: { title: string; subtitle?: string; pending?: boolean }) {
  return (
    <div className="flex items-center gap-1.5 py-0.5 px-2">
      <div className="flex-1 min-w-0 flex items-center gap-1.5">
        <div className="text-xs text-[var(--color-quiet)] flex items-center gap-1.5 min-w-0">
          <span className={`font-medium whitespace-nowrap flex-shrink-0 ${pending ? 'animate-pulse text-[var(--color-accent)]' : 'text-[var(--color-quiet)]'}`}>
            {title}
          </span>
          {subtitle && (
            <span className="text-[var(--color-quiet)] font-normal truncate min-w-0 text-[11px]">{subtitle}</span>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Inline Diff Block ─────────────────────────────────────────────────────
function InlineDiffBlock({ filename, added, removed }: { filename: string; added: number; removed: number }) {
  return (
    <div className="border border-[var(--color-line)] overflow-hidden text-[12px] my-1">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[var(--color-card)] border-b border-[var(--color-line)]">
        <div className="flex items-center gap-2">
          <FileDiff className="h-3.5 w-3.5 text-[var(--color-quiet)]" />
          <span className="text-[var(--color-ink-2)] text-[11px] font-medium">{filename}</span>
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="text-green-600">+{added}</span>
          <span className="text-red-500">−{removed}</span>
        </div>
      </div>
      <div className="bg-[var(--color-copy-bg)] px-0">
        {[
          { ln: "47", type: "del" as const, code: "  async handleCharge(payment: Payment): Promise<void> {" },
          { ln: "47", type: "add" as const, code: "  async handleCharge(payment: Payment, attempt = 1): Promise<void> {" },
          { ln: "48", type: "ctx" as const, code: "    const session = await stripe.checkout.sessions.create({" },
          { ln: "52", type: "add" as const, code: "    if (attempt <= MAX_RETRIES) await this.scheduleRetry(payment, attempt);" },
          { ln: "53", type: "add" as const, code: "    else await this.emailNotifier.sendFailureNotice(payment.userId);" },
        ].map((line, i) => (
          <div key={i} className="flex text-[11px] leading-[22px]">
            <div className="select-none text-[var(--color-quiet)] text-right pr-2 pl-2 w-10 flex-shrink-0 border-r border-[var(--color-line)]">{line.ln}</div>
            <div className={`flex-1 px-3 ${
              line.type === "del" ? "text-red-400/80 bg-red-500/[0.06]" :
              line.type === "add" ? "text-green-400/80 bg-green-500/[0.06]" :
              "text-[var(--color-muted-foreground)]"
            }`}>
              <span className="select-none mr-2 text-[var(--color-quiet)]">{line.type === "del" ? "−" : line.type === "add" ? "+" : " "}</span>
              {line.code}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Input Area with proper focus glow ──────────────────────────────────────
const MODE_FOCUS_BORDER: Record<string, string> = {
  ask: "var(--color-accent-line)",
  "accept-edits": "rgba(52,211,153,0.6)",
  plan: "rgba(96,165,250,0.6)",
  bypass: "rgba(248,113,113,0.6)",
}

function InputArea({ selectedMode, setSelectedMode, selectedModel, setSelectedModel }: {
  selectedMode: string; setSelectedMode: (m: string) => void;
  selectedModel: string; setSelectedModel: (m: string) => void;
}) {
  const [focused, setFocused] = useState(false)

  const borderColor = focused
    ? (MODE_FOCUS_BORDER[selectedMode] || MODE_FOCUS_BORDER.agent)
    : "var(--color-line)"
  const shadow = focused
    ? (MODE_FOCUS_SHADOW[selectedMode] || MODE_FOCUS_SHADOW.agent)
    : "none"

  return (
    <div
      className="relative bg-[var(--color-card)] flex flex-col transition-all duration-200"
      style={{ border: `1px solid ${borderColor}`, boxShadow: shadow }}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setFocused(false)
        }
      }}
    >
      <textarea
        className="w-full bg-transparent text-[13.5px] text-[var(--color-foreground)] placeholder:text-[var(--color-quiet)] resize-none pt-3 px-3 min-h-[44px] max-h-[200px]"
        placeholder="Ask an agent..."
        rows={1}
      />
      <div className="flex justify-between items-center px-2 pb-2 mt-0.5">
        <div className="flex items-center gap-0">
          <button className="p-1.5 text-[var(--color-quiet)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-muted)] transition-colors" title="Attach file">
            <Paperclip className="h-4 w-4" />
          </button>
          <ModeDropdown selected={selectedMode} onSelect={setSelectedMode} />
          <ModelDropdown selected={selectedModel} onSelect={setSelectedModel} />
        </div>
        <div className="flex items-center gap-2">
          <div className="cursor-default" title="Context: 18.5K / 200K (9.3%)">
            <ContextCircle percent={9.3} />
          </div>
          <button className="flex items-center justify-center h-7 w-7 bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-2)] active:scale-[0.97] transition-all"
            style={{ boxShadow: '0 0 0 2px var(--color-background), 0 0 0 4px var(--color-accent-soft)' }}>
            <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main ChatPage ─────────────────────────────────────────────────────────
export function ChatPage() {
  const [selectedModel, setSelectedModel] = useState("glm-5")
  const [selectedMode, setSelectedMode] = useState("ask")
  const [activeChat, setActiveChat] = useState("E-Commerce Checkout")

  return (
    <div className="flex h-full flex-col relative text-foreground bg-background"
      style={{
        backgroundImage: 'radial-gradient(circle at 78% -4%, var(--color-hero-wash), transparent 420px), radial-gradient(circle at 12% 18%, var(--color-hero-wash-2), transparent 360px)',
      }}>

      {/* Header — Chat name + terminal button */}
      <div className="flex h-11 items-center justify-between px-4 border-b border-[var(--color-line)]">
        <h1 className="text-[13px] font-medium text-[var(--color-ink-2)]">{activeChat}</h1>
        <div className="flex items-center gap-1">
          <button className="p-1.5 text-[var(--color-quiet)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-muted)] transition-colors" title="Terminal">
            <TerminalSquare className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-5 pb-48 space-y-5 scroll-smooth" style={{ scrollbarGutter: 'stable' }}>

        {/* User Message */}
        <div className="max-w-3xl mx-auto w-full">
          <div className="bg-[var(--color-muted)] border border-[var(--color-line)] px-3 py-2 text-[13px] text-[var(--color-ink-2)] leading-relaxed whitespace-pre-wrap">
            Add Stripe webhook handling for failed payments. It should retry up to 3 times with exponential backoff and notify the user via email on final failure.
          </div>
        </div>

        {/* AI Response with steps */}
        <div className="max-w-3xl mx-auto w-full space-y-2">
          {/* Response Steps */}
          <div className="space-y-0">
            <ToolCallStep title="Read" subtitle="src/services/payment-service.ts" />
            <ToolCallStep title="Glob" subtitle="src/webhooks/**/*.ts — 6 files" />
            <ToolCallStep title="Read" subtitle="src/config/stripe.ts" />
          </div>

          <p className="text-[13.5px] leading-relaxed text-[var(--color-muted-foreground)] mt-3">
            I'll implement the retry logic in the webhook handler and add an email notification service for final failures. Let me update the payment service first.
          </p>

          {/* Tool call — actively writing */}
          <ToolCallStep title="Write" subtitle="src/services/payment-service.ts" pending />

          {/* Inline Diff */}
          <InlineDiffBlock filename="src/services/payment-service.ts" added={18} removed={4} />

          <p className="text-[13.5px] leading-relaxed text-[var(--color-muted-foreground)]">
            Added exponential backoff retry logic with a max of <code className="px-1 py-0.5 bg-[var(--color-muted)] text-[12px] text-[var(--color-accent)]">3 attempts</code> and integrated the email notification service for final charge failures.
          </p>

          {/* Token metadata */}
          <div className="flex items-center gap-1 mt-2">
            <span className="h-5 px-1.5 flex items-center text-[10px] text-[var(--color-quiet)] bg-[var(--color-muted)] border border-[var(--color-line)]">GLM-5</span>
            <button className="h-5 px-1.5 flex items-center text-[10px] text-[var(--color-quiet)] hover:text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] transition-colors">4.2k</button>
          </div>
        </div>

        {/* Second User Message */}
        <div className="max-w-3xl mx-auto w-full">
          <div className="bg-[var(--color-muted)] border border-[var(--color-line)] px-3 py-2 text-[13px] text-[var(--color-ink-2)] leading-relaxed whitespace-pre-wrap">
            Now add unit tests for the retry logic and the email notification flow.
          </div>
        </div>

        {/* Second AI Response */}
        <div className="max-w-3xl mx-auto w-full space-y-2">
          <div className="space-y-0">
            <ToolCallStep title="Read" subtitle="tests/services/payment-service.test.ts" />
            <ToolCallStep title="Search" subtitle="'describe.*payment' — 3 matches" />
          </div>
          <p className="text-[13.5px] leading-relaxed text-[var(--color-muted-foreground)] mt-3">
            I'll add comprehensive test coverage for the retry mechanism, including edge cases for network timeouts and partial failures.
          </p>
          <ToolCallStep title="Write" subtitle="tests/services/payment-service.test.ts" pending />
          <div className="flex items-center gap-1 mt-2">
            <span className="h-5 px-1.5 flex items-center text-[10px] text-[var(--color-quiet)] bg-[var(--color-muted)] border border-[var(--color-line)]">GLM-5</span>
            <button className="h-5 px-1.5 flex items-center text-[10px] text-[var(--color-quiet)] hover:text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] transition-colors">2.8k</button>
          </div>
        </div>
      </div>

      {/* Collapsible File Changes */}
      <FileChangesDropdown />

      {/* Input Area */}
      <div className="px-5 pb-4 pt-3 bg-background">
        <div className="max-w-3xl mx-auto w-full">
          <InputArea
            selectedMode={selectedMode}
            setSelectedMode={setSelectedMode}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
          />
        </div>
      </div>
    </div>
  )
}
