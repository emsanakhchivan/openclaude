interface TwoPanelLayoutProps {
  listPanel: React.ReactNode
  detailPanel: React.ReactNode
  listWidth?: number
}

export function TwoPanelLayout({ listPanel, detailPanel, listWidth = 280 }: TwoPanelLayoutProps) {
  return (
    <div className="flex h-full overflow-hidden">
      <div
        className="flex flex-col border-r border-[var(--color-line)] bg-sidebar shrink-0"
        style={{ width: `${listWidth}px` }}
      >
        {listPanel}
      </div>
      <div className="flex-1 overflow-y-auto bg-background">
        {detailPanel}
      </div>
    </div>
  )
}