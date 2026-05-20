import { cn } from "@/lib/utils"

interface BadgeProps {
  children: React.ReactNode
  variant?: 'primary' | 'purple' | 'cyan' | 'emerald' | 'amber' | 'rose' | 'default'
  className?: string
}

const variantClasses = {
  primary: 'bg-primary/15 text-primary border-primary/30',
  purple: 'bg-accent-purple/15 text-accent-purple border-accent-purple/30',
  cyan: 'bg-accent-cyan/15 text-accent-cyan border-accent-cyan/30',
  emerald: 'bg-accent-emerald/15 text-accent-emerald border-accent-emerald/30',
  amber: 'bg-accent-amber/15 text-accent-amber border-accent-amber/30',
  rose: 'bg-accent-rose/15 text-accent-rose border-accent-rose/30',
  default: 'bg-muted text-muted-foreground border-border',
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={cn(
      'tag border text-xs font-medium',
      variantClasses[variant],
      className
    )}>
      {children}
    </span>
  )
}

export function CategoryBadge({ category }: { category: string }) {
  const map: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    model: { label: '新模型', variant: 'primary' },
    company: { label: '公司动态', variant: 'amber' },
    research: { label: '研究成果', variant: 'purple' },
    product: { label: '产品发布', variant: 'cyan' },
    llm: { label: '大语言模型', variant: 'primary' },
    image: { label: '图像生成', variant: 'rose' },
    code: { label: '代码助手', variant: 'cyan' },
    video: { label: '视频生成', variant: 'purple' },
    audio: { label: '音频语音', variant: 'amber' },
    agent: { label: 'AI Agent', variant: 'emerald' },
    search: { label: 'AI搜索', variant: 'primary' },
    productivity: { label: '生产力', variant: 'amber' },
  }
  const config = map[category] || { label: category, variant: 'default' as const }
  return <Badge variant={config.variant}>{config.label}</Badge>
}
