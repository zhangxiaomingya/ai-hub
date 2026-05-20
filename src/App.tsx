import { useState } from 'react'
import { Newspaper, Wrench, MessageSquare, Zap, TrendingUp, Globe } from 'lucide-react'
import NewsPage from '@/pages/NewsPage'
import ToolsPage from '@/pages/ToolsPage'
import ChatPage from '@/pages/ChatPage'
import { cn } from '@/lib/utils'

type Tab = 'news' | 'tools' | 'chat'

const tabs = [
  { id: 'news' as Tab, label: 'AI 动态', icon: Newspaper, desc: '最新资讯' },
  { id: 'tools' as Tab, label: '工具库', icon: Wrench, desc: '精选工具' },
  { id: 'chat' as Tab, label: 'AI 助手', icon: MessageSquare, desc: '智能问答' },
]

function Header({ activeTab, onTabChange }: { activeTab: Tab; onTabChange: (t: Tab) => void }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Blur backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-b border-border" />

      <div className="relative max-w-3xl mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow-sm">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-foreground text-gradient text-sm">AI Hub</span>
              <span className="text-muted-foreground text-xs ml-1.5 hidden sm:inline">AI工具与模型大合集</span>
            </div>
          </div>

          {/* Status indicators */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Globe className="w-3 h-3" />
              <span className="hidden sm:inline">全球实时数据</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-accent-emerald">
              <div className="dot-live" />
              <span className="hidden sm:inline">在线</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground border border-border rounded-full px-2 py-0.5">
              <TrendingUp className="w-3 h-3 text-accent-emerald" />
              <span>15 款新工具</span>
            </div>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex gap-1 pb-2">
          {tabs.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary/15 text-primary border border-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {isActive && (
                  <span className="text-xs text-primary/60 hidden sm:inline">
                    {tab.desc}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </header>
  )
}

function HeroBanner({ activeTab }: { activeTab: Tab }) {
  if (activeTab !== 'news') return null

  return (
    <div className="relative rounded-2xl overflow-hidden mb-6 h-36 sm:h-44">
      <img
        src="/images/hero.png"
        alt="AI Hub 科技背景"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-background/20" />
      <div className="relative h-full flex flex-col justify-center px-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-mono text-primary bg-primary/15 border border-primary/30 px-2 py-0.5 rounded-full">
            LIVE
          </span>
          <span className="text-xs text-muted-foreground">2025.05.20</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground leading-tight">
          第一时间掌握<br />
          <span className="text-gradient">AI 行业每一次突破</span>
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          覆盖 OpenAI · Anthropic · Google · DeepSeek · xAI 等顶级机构
        </p>
      </div>
    </div>
  )
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('news')

  const renderPage = () => {
    switch (activeTab) {
      case 'news': return <NewsPage />
      case 'tools': return <ToolsPage />
      case 'chat': return <ChatPage />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-4 pt-28 pb-8">
        <HeroBanner activeTab={activeTab} />
        {renderPage()}
      </main>
    </div>
  )
}
