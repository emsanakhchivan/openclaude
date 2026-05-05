import { useState, useCallback } from "react"
import {
  Plus,
  Edit2,
  Trash2,
  Brain,
  X,
  Eye,
  EyeOff,
  Key,
  Globe,
  Server,
} from "lucide-react"
import { SettingsCard } from "../components/SettingsCard"
import { SettingsRow } from "../components/SettingsRow"
import { SettingsSection } from "../components/SettingsSection"
import { StatusDot } from "../components/StatusDot"
import { cn } from "../../../lib/utils"

// ── Types ──────────────────────────────────────────────

type EndpointType = "anthropic" | "openai-compatible"

interface CustomModelConfig {
  id: string
  name: string
  modelId: string
}

interface ModelProfile {
  id: string
  name: string
  baseUrl: string
  token: string
  endpointType: EndpointType
  isOffline?: boolean
  models: CustomModelConfig[]
}

// ── Initial Profiles with real endpoints ───────────────

let idCounter = 100
function genId() {
  return `id_${++idCounter}`
}

const INITIAL_PROFILES: ModelProfile[] = [
  {
    id: "openrouter",
    name: "OpenRouter",
    baseUrl: "https://openrouter.ai/api/v1",
    token: "sk-or-v1-a8f3c2e1d4b6",
    endpointType: "openai-compatible",
    models: [
      { id: "m1", name: "GPT-5.5", modelId: "openai/gpt-5.5" },
      { id: "m2", name: "Kimi K2.5", modelId: "moonshot/kimi-k2.5" },
      { id: "m3", name: "Qwen 3.6 Plus", modelId: "qwen/qwen-3.6-plus" },
    ],
  },
  {
    id: "zai",
    name: "Z AI",
    baseUrl: "https://api.z.ai/api/coding/paas/v4",
    token: "sk-zai-f7e2b9c4a1d3",
    endpointType: "openai-compatible",
    models: [
      { id: "m4", name: "GLM 5.1", modelId: "glm-5.1" },
      { id: "m5", name: "GLM-4.7", modelId: "glm-4.7" },
      { id: "m6", name: "GLM-5", modelId: "glm-5" },
    ],
  },
  {
    id: "ollama",
    name: "Ollama (Local)",
    baseUrl: "http://localhost:11434",
    token: "",
    endpointType: "openai-compatible",
    isOffline: true,
    models: [
      { id: "m7", name: "Llama 4 Maverick", modelId: "llama4:maverick" },
      { id: "m8", name: "Qwen 3.6 Max", modelId: "qwen3:3.6-max" },
    ],
  },
  {
    id: "alibaba",
    name: "Alibaba Cloud",
    baseUrl: "https://coding-intl.dashscope.aliyuncs.com/apps/anthropic",
    token: "sk-ali-b5d8e2f1c3a7",
    endpointType: "openai-compatible",
    models: [
      { id: "m9", name: "Qwen 3.6 Plus", modelId: "qwen-plus-latest" },
      { id: "m10", name: "Qwen 3.6 Max", modelId: "qwen-max" },
    ],
  },
]

const CLAUDE_MODELS = [
  { id: "claude-opus-4-6", name: "Claude Opus 4.6", provider: "Anthropic" },
  { id: "claude-sonnet-4-6", name: "Claude Sonnet 4.6", provider: "Anthropic" },
  { id: "claude-haiku-4-5", name: "Claude Haiku 4.5", provider: "Anthropic" },
]

// ── Edit Profile Modal ─────────────────────────────────

function ProfileModal({
  open,
  onClose,
  onSave,
  profile,
}: {
  open: boolean
  onClose: () => void
  onSave: (p: ModelProfile) => void
  profile: ModelProfile | null
}) {
  const [name, setName] = useState(profile?.name ?? "")
  const [baseUrl, setBaseUrl] = useState(profile?.baseUrl ?? "")
  const [token, setToken] = useState(profile?.token ?? "")
  const [endpointType, setEndpointType] = useState<EndpointType>(
    profile?.endpointType ?? "anthropic"
  )
  const [isOffline, setIsOffline] = useState(profile?.isOffline ?? false)
  const [models, setModels] = useState<CustomModelConfig[]>(
    profile?.models ?? []
  )
  const [showToken, setShowToken] = useState(false)

  if (!open) return null

  const handleSave = () => {
    if (!name.trim() || !baseUrl.trim() || (models.length === 0)) return
    onSave({
      id: profile?.id ?? genId(),
      name: name.trim(),
      baseUrl: baseUrl.trim(),
      token: token.trim(),
      endpointType,
      isOffline,
      models,
    })
    onClose()
  }

  const addModel = () => {
    setModels((prev) => [
      ...prev,
      { id: genId(), name: "", modelId: "" },
    ])
  }

  const updateModel = (id: string, field: "name" | "modelId", value: string) => {
    setModels((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    )
  }

  const removeModel = (id: string) => {
    setModels((prev) => prev.filter((m) => m.id !== id))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-popover border border-[var(--color-line)] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-line)]">
          <h3 className="text-sm font-semibold text-[var(--color-foreground)]">
            {profile ? "Edit Profile" : "Add Profile"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-muted)] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4 max-h-[65vh] overflow-y-auto">
          {/* Profile Name */}
          <div>
            <label className="text-xs text-[var(--color-muted-foreground)] mb-1 block">
              Profile Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. OpenRouter"
              className="w-full px-3 py-2 text-sm bg-[var(--color-copy-bg)] border border-[var(--color-line)] text-[var(--color-foreground)] placeholder:text-[var(--color-quiet)]"
            />
          </div>

          {/* Endpoint Type */}
          <div>
            <label className="text-xs text-[var(--color-muted-foreground)] mb-1 block">
              Endpoint Type
            </label>
            <div className="flex gap-2">
              {(["anthropic", "openai-compatible"] as EndpointType[]).map(
                (t) => (
                  <button
                    key={t}
                    onClick={() => setEndpointType(t)}
                    className={cn(
                      "flex-1 px-3 py-2 text-xs border transition-colors",
                      endpointType === t
                        ? "border-[var(--color-accent)] bg-[var(--color-muted)] text-[var(--color-foreground)]"
                        : "border-[var(--color-line)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
                    )}
                  >
                    {t === "anthropic"
                      ? "Anthropic API"
                      : "OpenAI Compatible"}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Base URL */}
          <div>
            <label className="text-xs text-[var(--color-muted-foreground)] mb-1 block">
              API Endpoint
            </label>
            <input
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.example.com/v1"
              className="w-full px-3 py-2 text-sm bg-[var(--color-copy-bg)] border border-[var(--color-line)] text-[var(--color-foreground)] placeholder:text-[var(--color-quiet)]"
            />
          </div>

          {/* API Key */}
          <div>
            <label className="text-xs text-[var(--color-muted-foreground)] mb-1 block">
              API Key {!isOffline && <span className="text-[var(--color-destructive)]">*</span>}
            </label>
            <div className="relative">
              <input
                value={token}
                onChange={(e) => setToken(e.target.value)}
                type={showToken ? "text" : "password"}
                placeholder={isOffline ? "Not required for local" : "sk-..."}
                className="w-full px-3 py-2 pr-10 text-sm bg-[var(--color-copy-bg)] border border-[var(--color-line)] text-[var(--color-foreground)] placeholder:text-[var(--color-quiet)]"
              />
              <button
                onClick={() => setShowToken(!showToken)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
              >
                {showToken ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Offline toggle */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-[var(--color-muted-foreground)]">Local / Offline</span>
              <p className="text-[10px] text-[var(--color-quiet)]">
                For Ollama, LM Studio, etc.
              </p>
            </div>
            <button
              onClick={() => setIsOffline(!isOffline)}
              className={cn(
                "relative w-10 h-[22px] flex items-center transition-colors px-[2px]",
                isOffline ? "bg-[var(--color-accent)]" : "bg-[var(--color-muted)]"
              )}
              style={{ borderRadius: 0 }}
            >
              <div
                className={cn(
                  "w-[18px] h-[18px] bg-white transition-transform duration-150",
                  isOffline ? "translate-x-[18px]" : "translate-x-0"
                )}
                style={{ borderRadius: 0 }}
              />
            </button>
          </div>

          {/* Models */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-[var(--color-muted-foreground)]">
                Models ({models.length})
              </label>
              <button
                onClick={addModel}
                className="flex items-center gap-1 text-xs text-[var(--color-muted-foreground)] hover:text-[var(--color-accent)] transition-colors"
              >
                <Plus className="h-3 w-3" />
                Add Model
              </button>
            </div>
            <div className="space-y-2">
              {models.map((m) => (
                <div
                  key={m.id}
                  className="flex items-start gap-2 p-2 bg-[var(--color-muted)] border border-[var(--color-line)]"
                >
                  <div className="flex-1 space-y-1.5">
                    <input
                      value={m.name}
                      onChange={(e) =>
                        updateModel(m.id, "name", e.target.value)
                      }
                      placeholder="Display name (e.g. GPT-5.5)"
                      className="w-full px-2.5 py-1.5 text-sm bg-[var(--color-copy-bg)] border border-[var(--color-line)] text-[var(--color-foreground)] placeholder:text-[var(--color-quiet)]"
                    />
                    <input
                      value={m.modelId}
                      onChange={(e) =>
                        updateModel(m.id, "modelId", e.target.value)
                      }
                      placeholder="Model ID (e.g. openai/gpt-5.5)"
                      className="w-full px-2.5 py-1.5 text-xs bg-[var(--color-copy-bg)] border border-[var(--color-line)] text-[var(--color-ink-2)] placeholder:text-[var(--color-quiet)]"
                    />
                  </div>
                  <button
                    onClick={() => removeModel(m.id)}
                    className="mt-1 p-1 text-[var(--color-quiet)] hover:text-[var(--color-destructive)] transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {models.length === 0 && (
                <div className="py-4 text-center border border-dashed border-[var(--color-line)]">
                  <p className="text-xs text-[var(--color-quiet)]">
                    No models added yet
                  </p>
                  <button
                    onClick={addModel}
                    className="mt-2 text-xs text-[var(--color-muted-foreground)] hover:text-[var(--color-accent)] transition-colors"
                  >
                    + Add your first model
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[var(--color-line)]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-xs font-medium text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-2)] transition-colors"
          >
            {profile ? "Save Changes" : "Add Profile"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Profile Card ───────────────────────────────────────

function ProfileCard({
  profile,
  onEdit,
  onDelete,
}: {
  profile: ModelProfile
  onEdit: () => void
  onDelete: () => void
}) {
  const maskedToken = profile.isOffline
    ? "N/A"
    : profile.token
    ? `${profile.token.slice(0, 6)}${"•".repeat(8)}`
    : "Not set"

  return (
    <div className="px-5 py-3 border-t border-[var(--color-line)] first:border-t-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[var(--color-foreground)]">
            {profile.name}
          </span>
          {profile.isOffline && (
            <span className="text-[10px] px-1.5 py-0.5 bg-[var(--color-muted)] text-[var(--color-accent)]">
              LOCAL
            </span>
          )}
          <span className="text-[10px] px-1.5 py-0.5 bg-[var(--color-muted)] text-[var(--color-muted-foreground)]">
            {profile.endpointType === "anthropic"
              ? "Anthropic"
              : "OpenAI"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="p-1.5 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-muted)] transition-colors"
            title="Edit profile"
          >
            <Edit2 className="h-3 w-3" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-[var(--color-muted-foreground)] hover:text-[var(--color-destructive)] hover:bg-[var(--color-muted)] transition-colors"
            title="Delete profile"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* API info */}
      <div className="flex items-center gap-4 text-[11px] text-[var(--color-muted-foreground)] mb-2">
        <div className="flex items-center gap-1">
          <Globe className="h-3 w-3" />
          <span className="truncate max-w-[220px]">
            {profile.baseUrl}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Key className="h-3 w-3" />
          <span>{maskedToken}</span>
        </div>
      </div>

      {/* Model list */}
      <div className="flex flex-wrap gap-1.5">
        {profile.models.map((m) => (
          <span
            key={m.id}
            className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 bg-[var(--color-muted)] text-[var(--color-muted-foreground)]"
          >
            <Brain className="h-2.5 w-2.5" />
            {m.name}
            <span className="text-[var(--color-quiet)]">{m.modelId}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────

export function ModelsTab() {
  const [profiles, setProfiles] = useState<ModelProfile[]>(INITIAL_PROFILES)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProfile, setEditingProfile] = useState<ModelProfile | null>(
    null
  )

  // Build available models from defaults + custom profiles
  const availableModels = [
    ...CLAUDE_MODELS.map((m) => ({ ...m, source: "claude" as const })),
    ...profiles.flatMap((p) =>
      p.models.map((m) => ({
        id: `${p.id}:${m.id}`,
        name: m.name,
        provider: p.name,
        source: "custom" as const,
      }))
    ),
  ]

  const [enabledModels, setEnabledModels] = useState<Set<string>>(
    new Set(availableModels.map((m) => m.id))
  )

  const toggleModel = (id: string) => {
    setEnabledModels((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSaveProfile = useCallback(
    (profile: ModelProfile) => {
      setProfiles((prev) => {
        const exists = prev.find((p) => p.id === profile.id)
        if (exists) {
          return prev.map((p) => (p.id === profile.id ? profile : p))
        }
        return [...prev, profile]
      })
      // Auto-enable new models in available list
      profile.models.forEach((m) => {
        const id = `${profile.id}:${m.id}`
        setEnabledModels((prev) => new Set([...prev, id]))
      })
    },
    []
  )

  const handleDeleteProfile = useCallback((id: string) => {
    setProfiles((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const openEdit = (profile: ModelProfile) => {
    setEditingProfile(profile)
    setModalOpen(true)
  }

  const openAdd = () => {
    setEditingProfile(null)
    setModalOpen(true)
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <SettingsSection
          title="Models"
          description="Configure AI models, providers, and custom profiles"
        />

        {/* Sign with Codex */}
        <SettingsCard title="Authentication">
          <SettingsRow label="Sign with Codex" description="Login with ChatGPT subscription or API key">
            <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[var(--color-foreground)] bg-[var(--color-muted)] hover:bg-[var(--color-sidebar-hover)] border border-[var(--color-line)] transition-colors">
              <Server className="h-3.5 w-3.5" />
              Connect Codex
            </button>
          </SettingsRow>
          <SettingsRow label="Anthropic Account" description="OAuth login with Anthropic" last>
            <div className="flex items-center gap-2">
              <StatusDot status="connected" />
              <span className="text-xs text-[var(--color-muted-foreground)]">Connected</span>
            </div>
          </SettingsRow>
        </SettingsCard>

        {/* Available Models */}
        <SettingsCard title="Available Models">
          <div className="px-5 py-2 border-b border-[var(--color-line)]">
            <span className="text-[10px] text-[var(--color-quiet)] uppercase tracking-wider">
              Default — Anthropic
            </span>
          </div>
          {availableModels
            .filter((m) => m.source === "claude")
            .map((model) => (
              <div
                key={model.id}
                className="flex items-center justify-between px-5 py-2.5 border-t border-[var(--color-line)]"
              >
                <div className="flex items-center gap-2">
                  <Brain className="h-3.5 w-3.5 text-[var(--color-quiet)]" />
                  <div>
                    <span className="text-sm text-[var(--color-foreground)]">{model.name}</span>
                    <span className="text-[10px] text-[var(--color-quiet)] ml-2">
                      {model.provider}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => toggleModel(model.id)}
                  className={cn(
                    "relative w-8 h-[18px] flex items-center transition-colors px-[2px]",
                    enabledModels.has(model.id) ? "bg-[var(--color-accent)]" : "bg-[var(--color-muted)]"
                  )}
                  style={{ borderRadius: 0 }}
                >
                  <div
                    className={cn(
                      "w-[14px] h-[14px] bg-white transition-transform duration-150",
                      enabledModels.has(model.id)
                        ? "translate-x-[14px]"
                        : "translate-x-0"
                    )}
                    style={{ borderRadius: 0 }}
                  />
                </button>
              </div>
            ))}
          {profiles.length > 0 && (
            <div className="px-5 py-2 border-t border-[var(--color-line)]">
              <span className="text-[10px] text-[var(--color-quiet)] uppercase tracking-wider">
                Custom Profiles
              </span>
            </div>
          )}
          {availableModels
            .filter((m) => m.source === "custom")
            .map((model) => (
              <div
                key={model.id}
                className="flex items-center justify-between px-5 py-2.5 border-t border-[var(--color-line)]"
              >
                <div className="flex items-center gap-2">
                  <Brain className="h-3.5 w-3.5 text-[var(--color-quiet)]" />
                  <div>
                    <span className="text-sm text-[var(--color-foreground)]">{model.name}</span>
                    <span className="text-[10px] text-[var(--color-quiet)] ml-2">
                      via {model.provider}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => toggleModel(model.id)}
                  className={cn(
                    "relative w-8 h-[18px] flex items-center transition-colors px-[2px]",
                    enabledModels.has(model.id) ? "bg-[var(--color-accent)]" : "bg-[var(--color-muted)]"
                  )}
                  style={{ borderRadius: 0 }}
                >
                  <div
                    className={cn(
                      "w-[14px] h-[14px] bg-white transition-transform duration-150",
                      enabledModels.has(model.id)
                        ? "translate-x-[14px]"
                        : "translate-x-0"
                    )}
                    style={{ borderRadius: 0 }}
                  />
                </button>
              </div>
            ))}
        </SettingsCard>

        {/* Custom Profiles */}
        <SettingsCard title="Custom API Profiles">
          {profiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              onEdit={() => openEdit(profile)}
              onDelete={() => handleDeleteProfile(profile.id)}
            />
          ))}
          <div className="px-5 py-3 border-t border-[var(--color-line)]">
            <button
              onClick={openAdd}
              className="flex items-center gap-1.5 text-xs text-[var(--color-muted-foreground)] hover:text-[var(--color-accent)] transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Profile
            </button>
          </div>
        </SettingsCard>
      </div>

      {/* Modal — key forces full remount so useState picks up new profile data */}
      <ProfileModal
        key={editingProfile?.id ?? "__new__"}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveProfile}
        profile={editingProfile}
      />
    </div>
  )
}
