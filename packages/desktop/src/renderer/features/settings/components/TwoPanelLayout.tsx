interface TwoPanelLayoutProps {
  listPanel: React.ReactNode
  detailPanel: React.ReactNode
  listWidth?: number
}

export function TwoPanelLayout({ listPanel, detailPanel, listWidth = 280 }: TwoPanelLayoutProps) {
  return (
    <div className="flex h-full overflow-hidden">
      <div
        className="flex flex-col border-r border-zinc-800 bg-[#0c0c0d] shrink-0"
        style={{ width: `${listWidth}px` }}
      >
        {listPanel}
      </div>
      <div className="flex-1 overflow-y-auto bg-[#09090b]">
        {detailPanel}
      </div>
    </div>
  )
}