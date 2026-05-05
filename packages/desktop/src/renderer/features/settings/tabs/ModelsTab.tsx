import { useState } from "react"
import { Plus, Edit2, Trash2, Brain } from "lucide-react"
import { SettingsCard } from "../components/SettingsCard"
import { SettingsRow } from "../components/SettingsRow"
import { SettingsSelect } from "../components/SettingsSelect"
import { SettingsSection } from "../components/SettingsSection"
import { Button } from "../../../components/ui/button"
import { Switch } from "../../../components/ui/switch"
import { cn } from "../../../lib/utils"

const MOCK_DEFAULT_MODELS = [
  { value: "opus-4", label: "Claude Opus 4" },
  { value: "sonnet-4", label: "Claude Sonnet 4" },
  { value: "haiku-4.5", label: "Claude Haiku 4.5" },
]

const MOCK_PROVIDERS = [
  { value: "anthropic", label: "Anthropic" },
  { value: "openai", label: "OpenAI" },
  { value: "google", label: "Google" },
]

const MOCK_MODELS = [
  { id: "opus-4", name: "Claude Opus 4", description: "Most capable, slower", enabled: true },
  { id: "sonnet-4", name: "Claude Sonnet 4", description: "Balanced performance", enabled: true },
  { id: "haiku-4.5", name: "Claude Haiku 4.5", description: "Fast and efficient", enabled: true },
  { id: "gpt-4o", name: "GPT-4o", description: "OpenAI latest", enabled: false },
  { id: "gemini-2.5", name: "Gemini 2.5 Pro", description: "Google's flagship", enabled: false },
]

const MOCK_CUSTOM_PROFILES = [
  { id: "openrouter", name: "OpenRouter", models: 3, path: "API configured" },
  { id: "ollama", name: "Local Ollama", models: 2, path: "localhost:11434" },
]

export function ModelsTab() {
  const [defaultModel, setDefaultModel] = useState("sonnet-4")
  const [provider, setProvider] = useState("anthropic")
  const [models, setModels] = useState(MOCK_MODELS)

  const toggleModel = (id: string) => {
    setModels(prev => prev.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m))
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <SettingsSection
          title="Models"
          description="Configure AI models and providers"
        />

        <SettingsCard title="Default Model">
          <SettingsSelect
            label="New Chat Model"
            description="Default model for new chats"
            value={defaultModel}
            options={MOCK_DEFAULT_MODELS}
            onChange={setDefaultModel}
            last
          />
        </SettingsCard>

        <SettingsCard title="Provider">
          <SettingsSelect
            label="Provider"
            description="AI provider for responses"
            value={provider}
            options={MOCK_PROVIDERS}
            onChange={setProvider}
          />
          <SettingsRow label="API Key" description="Your API key" last>
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-500 font-mono">••••••••••••</span>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">Edit</Button>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">Test</Button>
            </div>
          </SettingsRow>
        </SettingsCard>

        <SettingsCard title="Available Models">
          {models.map((model, i) => (
            <div
              key={model.id}
              className={cn(
                "flex items-center justify-between px-5 py-3",
                i > 0 && "border-t border-zinc-800/50"
              )}
            >
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-zinc-500" />
                <div>
                  <span className="text-sm font-medium text-zinc-200">{model.name}</span>
                  <span className="text-xs text-zinc-500 ml-2">{model.description}</span>
                </div>
              </div>
              <Switch
                checked={model.enabled}
                onCheckedChange={() => toggleModel(model.id)}
              />
            </div>
          ))}
        </SettingsCard>

        <SettingsCard title="Custom Profiles">
          {MOCK_CUSTOM_PROFILES.map((profile, i) => (
            <div
              key={profile.id}
              className={cn(
                "flex items-center justify-between px-5 py-3",
                i > 0 && "border-t border-zinc-800/50"
              )}
            >
              <div>
                <span className="text-sm font-medium text-zinc-200">{profile.name}</span>
                <span className="text-xs text-zinc-500 ml-2">
                  {profile.models} models • {profile.path}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-red-500 hover:text-red-600">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
          <div className="px-5 py-3 border-t border-zinc-800/50">
            <Button variant="outline" size="sm" className="h-7">
              <Plus className="h-3 w-3 mr-1" />
              Add Profile
            </Button>
          </div>
        </SettingsCard>
      </div>
    </div>
  )
}