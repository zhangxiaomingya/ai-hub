import { useState } from 'react'
import { TrendingUp, Flame, Clock, Filter } from 'lucide-react'
import { newsData, type NewsItem } from '@/data/aiData'
import { Badge, CategoryBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diff === 0) return '今天'
  if (diff === 1) return '昨天'
  return `${diff}天前`
}

function NewsCard({ item, index }: { item: NewsItem; index: number }) {
  return (
    <div
      className="animate-fade-in glass-card rounded-xl p-5 cursor-pointer group"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-start gap-4">
        {/* Timeline dot */}
        <div className="flex flex-col items-center gap-2 pt-1 shrink-0">
          <div className={cn(
            "w-3 h-3 rounded-full border-2 shrink-0",
            item.isHot
              ? "border-primary bg-primary shadow-glow-sm"
              : "border-border bg-surface-2"
          )} />
          <div className="w-px flex-1 min-h-8 timeline-line" />
        </div>

        <div className="flex-1 min-w-0 pb-2">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: item.companyColor + '20', color: item.companyColor }}
            >
              {item.company}
            </span>
            <CategoryBadge category={item.category} />
            {item.isHot && (
              <Badge variant="rose">
                <Flame className="w-2.5 h-2.5 mr-1" />热榜
              </Badge>
            )}
            <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(item.date)}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-foreground text-sm leading-snug mb-1.5 group-hover:text-primary transition-colors">
            {item.title}
          </h3>

          {/* Summary */}
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {item.summary}
          </p>

          {/* Tags */}
          <div className="flex gap-1.5 flex-wrap mt-2.5">
            {item.tags.map(tag => (
              <span key={tag} className="text-xs text-muted-foreground bg-surface-2 px-2 py-0.5 rounded-full border border-border">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function NewsPage() {
  const [filter, setFilter] = useState<string>('all')

  const filters = [
    { id: 'all', label: '全部' },
    { id: 'model', label: '新模型' },
    { id: 'company', label: '公司动态' },
    { id: 'research', label: '研究成果' },
    { id: 'product', label: '产品发布' },
  ]

  const filtered = filter === 'all' ? newsData : newsData.filter(n => n.category === filter)
  const hotCount = newsData.filter(n => n.isHot).length

  return (
    <div className="max-w-2xl mx-auto">
      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="dot-live" />
          <span className="text-xs text-accent-emerald font-medium">实时更新</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">AI 行业动态</h1>
        <p className="text-sm text-muted-foreground mt-1">
          追踪全球最新 AI 模型发布、公司融资和技术突破
        </p>

        {/* Stats */}
        <div className="flex gap-4 mt-4">
          <div className="flex items-center gap-1.5 text-sm">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-foreground font-medium">{newsData.length}</span>
            <span className="text-muted-foreground">条动态</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <Flame className="w-4 h-4 text-accent-rose" />
            <span className="text-foreground font-medium">{hotCount}</span>
            <span className="text-muted-foreground">热榜事件</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-none">
        <Filter className="w-4 h-4 text-muted-foreground shrink-0 mt-1.5" />
        {filters.map(f => (
          <Button
            key={f.id}
            size="sm"
            variant={filter === f.id ? 'tabActive' : 'tab'}
            onClick={() => setFilter(f.id)}
            className="shrink-0"
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* Timeline */}
      <div className="space-y-2">
        {filtered.map((item, i) => (
          <NewsCard key={item.id} item={item} index={i} />
        ))}
      </div>

      {/* Load more hint */}
      <div className="mt-6 text-center">
        <p className="text-xs text-muted-foreground">
          数据更新于 2025年5月20日 · 接入实时 AI 新闻源后自动刷新
        </p>
      </div>
    </div>
  )
}
