import { useState } from "react"
import { SendHorizontal, Paperclip, ChevronDown, ChevronRight, Check, FileCode, FileDiff, Loader2, ArrowUp, TerminalSquare, Eye, Pencil, Search } from "lucide-react"

// ─── Context Circle (exact 1code replica) ───────────────────────────────────
function ContextCircle({ percent, size = 14, strokeWidth = 2.5 }: { percent: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-zinc-700" />
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth}
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        className="text-zinc-400 transition-all duration-300" />
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
        className="h-7 px-2 flex items-center gap-1 text-[11px] rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors font-medium">
        {current.name} <ChevronDown className="h-3 w-3 shrink-0 opacity-50" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-0 mb-1 w-[220px] z-50 bg-[#1a1a1a] border border-zinc-700/60 rounded-lg shadow-2xl py-1">
            {MODELS.map(model => (
              <button key={model.id} onClick={() => { onSelect(model.id); setOpen(false) }}
                className={`flex items-center gap-2 w-full px-3 py-[6px] text-[13px] transition-colors ${selected === model.id ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:bg-zinc-800/70 hover:text-zinc-200'}`}>
                <span className="flex-1 text-left">{model.name}</span>
                <span className="text-[10px] text-zinc-600">{model.provider}</span>
                {selected === model.id && <Check className="h-3.5 w-3.5 shrink-0 text-zinc-400" />}
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
  { id: "agent", label: "Agent", desc: "Full auto — executes tools", color: "zinc" },
  { id: "ask", label: "Ask", desc: "Prompts before every action", color: "orange" },
  { id: "accept-edits", label: "Accept edits", desc: "Auto-approves file edits", color: "emerald" },
  { id: "plan", label: "Plan", desc: "Shows plan before executing", color: "blue" },
  { id: "bypass", label: "Bypass", desc: "Skips all permission checks", color: "red" },
]

// Focus glow shadow colors per mode — uses box-shadow so it follows border-radius
const MODE_FOCUS_SHADOW: Record<string, string> = {
  agent: "0 0 0 1px rgba(161,161,170,0.4)",
  ask: "0 0 0 1px rgba(251,146,60,0.5)",
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
        className="h-7 px-2 flex items-center gap-1 text-[11px] rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors font-medium">
        {current.label} <ChevronDown className="h-3 w-3 shrink-0 opacity-50" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-0 mb-1 w-[240px] z-50 bg-[#1a1a1a] border border-zinc-700/60 rounded-lg shadow-2xl py-1">
            {MODES.map(mode => (
              <button key={mode.id} onClick={() => { onSelect(mode.id); setOpen(false) }}
                className={`flex flex-col w-full px-3 py-[7px] text-left transition-colors ${selected === mode.id ? 'bg-zinc-800' : 'hover:bg-zinc-800/70'}`}>
                <div className="flex items-center gap-2 w-full">
                  <span className={`text-[13px] font-medium ${selected === mode.id ? 'text-zinc-100' : 'text-zinc-300'}`}>{mode.label}</span>
                  {selected === mode.id && <Check className="h-3.5 w-3.5 shrink-0 text-zinc-400 ml-auto" />}
                </div>
                <span className="text-[11px] text-zinc-600 mt-0.5">{mode.desc}</span>
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
    <div className="border-t border-zinc-800">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-5 py-2 text-[12px] text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/30 transition-colors">
        <ChevronRight className={`h-3 w-3 shrink-0 transition-transform duration-200 ${open ? 'rotate-90' : ''}`} />
        <FileDiff className="h-3.5 w-3.5 text-zinc-500" />
        <span className="font-medium text-zinc-300">{CHANGED_FILES.length} files changed</span>
        <span className="text-green-500 text-[11px]">+{totalAdded}</span>
        <span className="text-red-500 text-[11px]">−{totalRemoved}</span>
      </button>
      {open && (
        <div className="px-5 pb-2.5 space-y-0.5">
          {CHANGED_FILES.map(f => (
            <div key={f.name} className="flex items-center gap-2 py-1 px-2 rounded hover:bg-zinc-800/60 cursor-pointer transition-colors group">
              <FileCode className="h-3 w-3 text-zinc-600 group-hover:text-zinc-400 shrink-0" />
              <span className="text-[12px] text-zinc-400 group-hover:text-zinc-200 flex-1 truncate font-mono">{f.name}</span>
              <span className="text-[10px] text-green-600 font-mono">+{f.added}</span>
              <span className="text-[10px] text-red-600 font-mono">−{f.removed}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Tool Call / Step Indicator (1code shimmer style) ───────────────────────
function ToolCallStep({ title, subtitle, pending }: { title: string; subtitle?: string; pending?: boolean }) {
  return (
    <div className="flex items-center gap-1.5 py-0.5 px-2 rounded-md">
      <div className="flex-1 min-w-0 flex items-center gap-1.5">
        <div className="text-xs text-zinc-500 flex items-center gap-1.5 min-w-0">
          <span className={`font-medium whitespace-nowrap flex-shrink-0 ${pending ? 'animate-pulse text-zinc-300' : 'text-zinc-500'}`}>
            {title}
          </span>
          {subtitle && (
            <span className="text-zinc-600 font-normal truncate min-w-0 font-mono text-[11px]">{subtitle}</span>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Inline Diff Block ─────────────────────────────────────────────────────
function InlineDiffBlock({ filename, added, removed }: { filename: string; added: number; removed: number }) {
  return (
    <div className="rounded-lg border border-zinc-800 overflow-hidden font-mono text-[12px] my-1">
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900/80 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <FileDiff className="h-3.5 w-3.5 text-zinc-500" />
          <span className="text-zinc-300 text-[11px] font-medium">{filename}</span>
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="text-green-600">+{added}</span>
          <span className="text-red-600">−{removed}</span>
        </div>
      </div>
      <div className="bg-[#0d0d0e] px-0">
        {[
          { ln: "47", type: "del" as const, code: "  async handleCharge(payment: Payment): Promise<void> {" },
          { ln: "47", type: "add" as const, code: "  async handleCharge(payment: Payment, attempt = 1): Promise<void> {" },
          { ln: "48", type: "ctx" as const, code: "    const session = await stripe.checkout.sessions.create({" },
          { ln: "52", type: "add" as const, code: "    if (attempt <= MAX_RETRIES) await this.scheduleRetry(payment, attempt);" },
          { ln: "53", type: "add" as const, code: "    else await this.emailNotifier.sendFailureNotice(payment.userId);" },
        ].map((line, i) => (
          <div key={i} className="flex text-[11px] leading-[22px] font-mono">
            <div className="select-none text-zinc-700 text-right pr-2 pl-2 w-10 flex-shrink-0 border-r border-zinc-800/50">{line.ln}</div>
            <div className={`flex-1 px-3 ${
              line.type === "del" ? "text-red-400/80 bg-red-500/[0.06]" :
              line.type === "add" ? "text-green-400/80 bg-green-500/[0.06]" :
              "text-zinc-400"
            }`}>
              <span className="select-none mr-2 text-zinc-600">{line.type === "del" ? "−" : line.type === "add" ? "+" : " "}</span>
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
  agent: "rgba(161,161,170,0.5)",
  ask: "rgba(251,146,60,0.6)",
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
    : "rgba(39,39,42,1)" // zinc-800
  const shadow = focused
    ? (MODE_FOCUS_SHADOW[selectedMode] || MODE_FOCUS_SHADOW.agent)
    : "none"

  return (
    <div
      className="relative rounded-xl bg-zinc-900/80 flex flex-col transition-all duration-200"
      style={{ border: `1px solid ${borderColor}`, boxShadow: shadow }}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(e) => {
        // Only blur if focus leaves the entire container
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setFocused(false)
        }
      }}
    >
      <textarea
        className="w-full bg-transparent text-[13.5px] text-zinc-100 placeholder-zinc-600 resize-none outline-none pt-3 px-3 min-h-[44px] max-h-[200px]"
        placeholder="Ask an agent..."
        rows={1}
      />
      <div className="flex justify-between items-center px-2 pb-2 mt-0.5">
        <div className="flex items-center gap-0">
          <button className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors" title="Attach file">
            <Paperclip className="h-4 w-4" />
          </button>
          <ModeDropdown selected={selectedMode} onSelect={setSelectedMode} />
          <ModelDropdown selected={selectedModel} onSelect={setSelectedModel} />
        </div>
        <div className="flex items-center gap-2">
          <div className="cursor-default" title="Context: 18.5K / 200K (9.3%)">
            <ContextCircle percent={9.3} />
          </div>
          <button className="flex items-center justify-center h-7 w-7 rounded-full bg-zinc-100 text-zinc-900 hover:bg-white active:scale-[0.97] transition-all shadow-[0_0_0_2px_#1a1a1a,0_0_0_4px_rgba(255,255,255,0.08)]">
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
  const [selectedMode, setSelectedMode] = useState("agent")
  const [activeChat, setActiveChat] = useState("E-Commerce Checkout")

  return (
    <div className="flex h-full flex-col relative text-zinc-100 bg-[#09090b]">
      
      {/* Header — Chat name + terminal button */}
      <div className="flex h-11 items-center justify-between px-4 border-b border-zinc-800">
        <h1 className="text-[13px] font-medium text-zinc-200">{activeChat}</h1>
        <div className="flex items-center gap-1">
          <button className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors" title="Terminal">
            <TerminalSquare className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-5 pb-48 space-y-5 scroll-smooth" style={{ scrollbarGutter: 'stable' }}>

        {/* User Message */}
        <div className="max-w-3xl mx-auto w-full">
          <div className="bg-zinc-800/40 border border-zinc-800 px-3 py-2 rounded-xl text-[13px] text-zinc-200 leading-relaxed whitespace-pre-wrap">
            Add Stripe webhook handling for failed payments. It should retry up to 3 times with exponential backoff and notify the user via email on final failure.
          </div>
        </div>

        {/* AI Response with steps */}
        <div className="max-w-3xl mx-auto w-full space-y-2">
          {/* Response Steps — 1code shimmer style */}
          <div className="space-y-0">
            <ToolCallStep title="Read" subtitle="src/services/payment-service.ts" />
            <ToolCallStep title="Glob" subtitle="src/webhooks/**/*.ts — 6 files" />
            <ToolCallStep title="Read" subtitle="src/config/stripe.ts" />
          </div>

          <p className="text-[13.5px] leading-relaxed text-zinc-300 mt-3">
            I'll implement the retry logic in the webhook handler and add an email notification service for final failures. Let me update the payment service first.
          </p>

          {/* Tool call — actively writing */}
          <ToolCallStep title="Write" subtitle="src/services/payment-service.ts" pending />

          {/* Inline Diff */}
          <InlineDiffBlock filename="src/services/payment-service.ts" added={18} removed={4} />

          <p className="text-[13.5px] leading-relaxed text-zinc-300">
            Added exponential backoff retry logic with a max of <code className="px-1 py-0.5 bg-zinc-800 rounded text-[12px] font-mono text-zinc-300">3 attempts</code> and integrated the email notification service for final charge failures.
          </p>

          {/* Token metadata */}
          <div className="flex items-center gap-1 mt-2">
            <span className="h-5 px-1.5 flex items-center text-[10px] rounded-md text-zinc-500 bg-zinc-800/80 border border-zinc-700/40 font-mono">GLM-5</span>
            <button className="h-5 px-1.5 flex items-center text-[10px] rounded-md text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800/40 transition-colors font-mono">4.2k</button>
          </div>
        </div>
        
        {/* Second User Message */}
        <div className="max-w-3xl mx-auto w-full">
          <div className="bg-zinc-800/40 border border-zinc-800 px-3 py-2 rounded-xl text-[13px] text-zinc-200 leading-relaxed whitespace-pre-wrap">
            Now add unit tests for the retry logic and the email notification flow.
          </div>
        </div>

        {/* Second AI Response */}
        <div className="max-w-3xl mx-auto w-full space-y-2">
          <div className="space-y-0">
            <ToolCallStep title="Read" subtitle="tests/services/payment-service.test.ts" />
            <ToolCallStep title="Search" subtitle="'describe.*payment' — 3 matches" />
          </div>
          <p className="text-[13.5px] leading-relaxed text-zinc-300 mt-3">
            I'll add comprehensive test coverage for the retry mechanism, including edge cases for network timeouts and partial failures.
          </p>
          <ToolCallStep title="Write" subtitle="tests/services/payment-service.test.ts" pending />
          <div className="flex items-center gap-1 mt-2">
            <span className="h-5 px-1.5 flex items-center text-[10px] rounded-md text-zinc-500 bg-zinc-800/80 border border-zinc-700/40 font-mono">GLM-5</span>
            <button className="h-5 px-1.5 flex items-center text-[10px] rounded-md text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800/40 transition-colors font-mono">2.8k</button>
          </div>
        </div>
      </div>

      {/* Collapsible File Changes */}
      <FileChangesDropdown />

      {/* Input Area */}
      <div className="px-5 pb-4 pt-3 bg-[#09090b]">
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
