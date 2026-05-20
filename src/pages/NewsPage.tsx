import { useState, useEffect } from 'react'
import { TrendingUp, Flame, Clock, Filter, RefreshCw, Globe } from 'lucide-react'
import { newsData, type NewsItem } from '@/data/aiData'
import { Badge, CategoryBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr)
    const now = new Date()
    const diff = Math.floor((now.getTime() - d.getTime()) / 86400000)
    if (diff === 0) return '今天'
    if (diff === 1) return '昨天'
    if (diff < 7) return `${diff}天前`
    return d.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
  } catch {
    return dateStr
  }
}

function NewsCard({ item, index }: { item: NewsItem; index: number }) {
  return (
    <a
      href={item.url || '#'}
      target={item.url ? '_blank' : undefined}
      rel="noopener noreferrer"
      className="block animate-fade-in glass-card rounded-xl p-5 cursor-pointer group no-underline"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-start gap-4">
        {/* Timeline dot */}
        <div className="flex flex-col items-center gap-2 pt-1 shrink-0">
          <div className={cn(
            'w-3 h-3 rounded-full border-2 shrink-0',
            item.isHot
              ? 'border-primary bg-primary shadow-glow-sm'
              : 'border-border bg-surface-2'
          )} />
          <div className="w-px flex-1 min-h-8 timeline-line" />
        </div>

        <div className="flex-1 min-w-0 pb-2">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: (item.companyColor || '#3b82f6') + '20', color: item.companyColor || '#3b82f6' }}
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
          {item.tags && item.tags.length > 0 && (
            <div className="flex gap-1.5 flex-wrap mt-2.5">
              {item.tags.map(tag => (
                <span key={tag} className="text-xs text-muted-foreground bg-surface-2 px-2 py-0.5 rounded-full border border-border">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Source link indicator */}
          {item.url && (
            <div className="flex items-center gap-1 mt-2">
              <Globe className="w-2.5 h-2.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{item.source || item.company}</span>
            </div>
          )}
        </div>
      </div>
    </a>
  )
}

export default function NewsPage() {
  const [filter, setFilter] = useState<string>('all')
  const [news, setNews] = useState<NewsItem[]>(newsData)
  const [isLive, setIsLive] = useState(false)
  const [updatedAt, setUpdatedAt] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 尝试加载 GitHub Actions 每日更新的 news.json
    const base = import.meta.env.BASE_URL
    fetch(`${base}news.json?t=${Date.now()}`)
      .then(r => {
        if (!r.ok) throw new Error('no news.json')
        return r.json()
      })
      .then(data => {
        if (data.items && data.items.length > 0) {
          setNews(data.items)
          setIsLive(true)
          if (data.updatedAt) {
            const d = new Date(data.updatedAt)
            setUpdatedAt(d.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }))
          }
        }
      })
      .catch(() => {
        // 回退到本地数据，无提示
      })
      .finally(() => setLoading(false))
  }, [])

  const filters = [
    { id: 'all', label: '全部' },
    { id: 'model', label: '新模型' },
    { id: 'company', label: '公司动态' },
    { id: 'research', label: '研究成果' },
    { id: 'product', label: '产品发布' },
    { id: 'news', label: '行业资讯' },
  ]

  const filtered = filter === 'all' ? news : news.filter(n => n.category === filter)
  const hotCount = news.filter(n => n.isHot).length

  return (
    <div className="max-w-2xl mx-auto">
      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          {isLive ? (
            <>
              <div className="dot-live" />
              <span className="text-xs text-accent-emerald font-medium">实时抓取</span>
              {updatedAt && <span className="text-xs text-muted-foreground">· 更新于 {updatedAt}</span>}
            </>
          ) : (
            <span className="text-xs text-muted-foreground">示例数据</span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-foreground">AI 行业动态</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isLive
            ? '每日自动从 TechCrunch、The Verge、VentureBeat、MIT Tech Review 等媒体抓取最新 AI 资讯'
            : '追踪全球最新 AI 模型发布、公司融资和技术突破'}
        </p>

        {/* Stats */}
        <div className="flex gap-4 mt-4">
          <div className="flex items-center gap-1.5 text-sm">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-foreground font-medium">{news.length}</span>
            <span className="text-muted-foreground">条动态</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <Flame className="w-4 h-4 text-accent-rose" />
            <span className="text-foreground font-medium">{hotCount}</span>
            <span className="text-muted-foreground">热榜事件</span>
          </div>
          {loading && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              加载中...
            </div>
          )}
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

      {/* News list */}
      <div className="space-y-2">
        {filtered.length > 0 ? filtered.map((item, i) => (
          <NewsCard key={item.id} item={item} index={i} />
        )) : (
          <div className="text-center py-12 text-muted-foreground">
            <div className="text-3xl mb-2">📭</div>
            <p className="text-sm">该分类暂无内容</p>
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-muted-foreground">
          {isLive
            ? '数据来源：TechCrunch · The Verge · VentureBeat · MIT Technology Review · 每日 8:00 自动更新'
            : '新闻数据将在 GitHub Actions 首次运行后自动更新'}
        </p>
      </div>
    </div>
  )
}
