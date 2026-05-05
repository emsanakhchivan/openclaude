import { useState, useEffect } from "react"
import { Sparkles } from "lucide-react"
import { TwoPanelLayout } from "../components/TwoPanelLayout"
import { SearchInput } from "../components/SearchInput"
import { ListItemCard } from "../components/ListItemCard"
import { EmptyState } from "../components/EmptyState"
import { SettingsCard } from "../components/SettingsCard"
import { Button } from "../../../components/ui/button"

const MOCK_SKILLS = [
  { id: "commit", name: "/commit", subtitle: "Create git commit", status: "active" as const },
  { id: "review-pr", name: "/review-pr", subtitle: "Review pull request", status: "active" as const },
  { id: "brainstorm", name: "/brainstorm", subtitle: "Brainstorm ideas", status: "active" as const },
  { id: "debug", name: "/debug", subtitle: "Systematic debugging", status: "active" as const },
  { id: "test", name: "/test", subtitle: "Run tests", status: "active" as const },
  { id: "plan", name: "/plan", subtitle: "Write plan", status: "active" as const },
  { id: "simplify", name: "/simplify", subtitle: "Simplify code", status: "active" as const },
  { id: "loop", name: "/loop", subtitle: "Loop automation", status: "active" as const },
]

export function SkillsTab() {
  const [search, setSearch] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedId && MOCK_SKILLS.length > 0) {
      setSelectedId(MOCK_SKILLS[0].id)
    }
  }, [selectedId])

  const filteredSkills = MOCK_SKILLS.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  )

  const selectedSkill = MOCK_SKILLS.find(s => s.id === selectedId)

  return (
    <TwoPanelLayout
      listPanel={
        <div className="flex flex-col h-full">
          <div className="px-3 pt-3 pb-2">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search skills..."
            />
          </div>
          <div className="px-3 pt-1 pb-1">
            <span className="text-xs font-medium text-[var(--color-quiet)] uppercase tracking-wider">
              Skills ({MOCK_SKILLS.length})
            </span>
          </div>
          <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
            {filteredSkills.map((skill) => (
              <ListItemCard
                key={skill.id}
                item={{ ...skill, icon: Sparkles }}
                selected={selectedId === skill.id}
                onClick={() => setSelectedId(skill.id)}
              />
            ))}
          </div>
        </div>
      }
      detailPanel={
        selectedSkill ? (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-foreground)]">{selectedSkill.name}</h3>
              <p className="text-xs text-[var(--color-muted-foreground)] mt-1">{selectedSkill.subtitle}</p>
            </div>

            <SettingsCard title="Description">
              <div className="px-5 py-4">
                <p className="text-sm text-[var(--color-ink-2)] leading-relaxed">
                  Creates a git commit with an automatically generated message based on staged changes. Follows conventional commit format and analyzes diff for message.
                </p>
              </div>
            </SettingsCard>

            <SettingsCard title="Arguments">
              <div className="px-5 py-3 border-t border-[var(--color-line)] first:border-t-0">
                <span className="text-sm font-mono text-[var(--color-foreground)]">-m &lt;message&gt;</span>
                <span className="text-xs text-[var(--color-muted-foreground)] mt-1 block">Override auto-generated message</span>
              </div>
              <div className="px-5 py-3 border-t border-[var(--color-line)]">
                <span className="text-sm font-mono text-[var(--color-foreground)]">--no-verify</span>
                <span className="text-xs text-[var(--color-muted-foreground)] mt-1 block">Skip pre-commit hooks</span>
              </div>
            </SettingsCard>

            <SettingsCard title="Source">
              <div className="px-5 py-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-[var(--color-muted-foreground)]">Plugin</span>
                  <span className="text-sm text-[var(--color-ink-2)]">superpowers</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[var(--color-muted-foreground)]">Path</span>
                  <span className="text-sm text-[var(--color-ink-2)] font-mono">.claude/skills/commit.md</span>
                </div>
              </div>
            </SettingsCard>

            <Button variant="outline" size="sm">Execute Skill</Button>
          </div>
        ) : (
          <EmptyState
            icon={Sparkles}
            title="No skill selected"
            description="Select a skill from the list"
          />
        )
      }
    />
  )
}