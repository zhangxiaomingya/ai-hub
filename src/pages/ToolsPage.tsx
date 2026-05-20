import { useState } from 'react'
import { Star, Users, ExternalLink, Zap, ChevronDown, ChevronUp } from 'lucide-react'
import { toolsData, toolCategories, type AITool, type ToolCategory } from '@/data/aiData'
import { CategoryBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function PricingBadge({ pricing }: { pricing: AITool['pricing'] }) {
  const map = {
    free: { label: '免费', class: 'text-accent-emerald border-accent-emerald/30 bg-accent-emerald/10' },
    freemium: { label: '免费+', class: 'text-accent-amber border-accent-amber/30 bg-accent-amber/10' },
    paid: { label: '付费', class: 'text-accent-rose border-accent-rose/30 bg-accent-rose/10' },
  }
  const cfg = map[pricing]
  return (
    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full border', cfg.class)}>
      {cfg.label}
    </span>
  )
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      <Star className="w-3 h-3 fill-accent-amber text-accent-amber" />
      <span className="text-xs font-semibold text-foreground">{rating}</span>
    </div>
  )
}

function ToolCard({ tool, index }: { tool: AITool; index: number }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className="animate-fade-in glass-card rounded-xl p-5 group"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-xl shrink-0">
            {tool.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-foreground text-sm">{tool.name}</h3>
              {tool.tags.includes('推荐') && (
                <span className="text-xs bg-gradient-primary text-white px-1.5 py-0.5 rounded font-medium">
                  推荐
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{tool.company}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <PricingBadge pricing={tool.pricing} />
          <a
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
            onClick={e => e.stopPropagation()}
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 mb-3">
        <RatingStars rating={tool.rating} />
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="w-3 h-3" />
          {tool.users}
        </div>
        <CategoryBadge category={tool.category} />
      </div>

      {/* Description */}
      <p className="text-xs text-muted-foreground leading-relaxed mb-3">
        {tool.description}
      </p>

      {/* Best for */}
      <div>
        <button
          className="flex items-center gap-1.5 text-xs font-medium text-primary mb-2 hover:opacity-80 transition-opacity"
          onClick={() => setExpanded(!expanded)}
        >
          <Zap className="w-3 h-3" />
          擅长领域
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
        {expanded && (
          <div className="flex flex-wrap gap-1.5 animate-fade-in">
            {tool.bestFor.map(item => (
              <span
                key={item}
                className="text-xs px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 font-medium"
              >
                {item}
              </span>
            ))}
          </div>
        )}
        {!expanded && (
          <div className="flex flex-wrap gap-1.5">
            {tool.bestFor.slice(0, 3).map(item => (
              <span
                key={item}
                className="text-xs px-2 py-0.5 rounded-full bg-surface-2 text-muted-foreground border border-border"
              >
                {item}
              </span>
            ))}
            {tool.bestFor.length > 3 && (
              <span className="text-xs px-2 py-0.5 text-muted-foreground">
                +{tool.bestFor.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ToolsPage() {
  const [activeCategory, setActiveCategory] = useState<ToolCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = toolsData.filter(tool => {
    const matchCat = activeCategory === 'all' || tool.category === activeCategory
    const matchSearch = searchQuery === '' ||
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.bestFor.some(b => b.includes(searchQuery)) ||
      tool.tags.some(t => t.includes(searchQuery))
    return matchCat && matchSearch
  })

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">AI 工具库</h1>
        <p className="text-sm text-muted-foreground mt-1">
          精选 {toolsData.length} 款最前沿的 AI 工具，每款都标注了最擅长的使用场景
        </p>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="搜索工具名称、公司、使用场景..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="input-cyber w-full h-10 px-4 rounded-xl text-sm"
        />
      </div>

      {/* Category tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-5 scrollbar-none">
        {toolCategories.map(cat => (
          <Button
            key={cat.id}
            size="sm"
            variant={activeCategory === cat.id ? 'tabActive' : 'tab'}
            onClick={() => setActiveCategory(cat.id as ToolCategory | 'all')}
            className="shrink-0 gap-1"
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </Button>
        ))}
      </div>

      {/* Result count */}
      <p className="text-xs text-muted-foreground mb-4">
        找到 <span className="text-foreground font-medium">{filtered.length}</span> 款工具
      </p>

      {/* Tool grid */}
      {filtered.length > 0 ? (
        <div className="grid gap-3">
          {filtered.map((tool, i) => (
            <ToolCard key={tool.id} tool={tool} index={i} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-sm">没有找到匹配的工具</p>
        </div>
      )}
    </div>
  )
}
