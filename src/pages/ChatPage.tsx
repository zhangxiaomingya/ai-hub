import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles, RotateCcw, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const QUICK_QUESTIONS = [
  '目前最强的代码生成模型是什么？',
  '如何选择适合我的 AI 绘图工具？',
  'GPT-4o 和 Claude 3.5 有什么区别？',
  '什么是 AI Agent？有哪些应用场景？',
  'Prompt 工程有哪些最佳实践？',
  '本地部署大模型需要什么配置？',
]

const AI_RESPONSES: Record<string, string> = {
  '目前最强的代码生成模型是什么？': `目前代码生成领域的顶级模型如下：

**🥇 Claude 3.5 Sonnet（最推荐）**
Anthropic 的旗舰模型，在 SWE-bench 基准测试中表现最好，擅长理解复杂代码库、修复 Bug、生成高质量测试用例。

**🥈 GPT-4o**
OpenAI 旗舰，代码补全流畅，多语言支持全面，与 GitHub Copilot 深度集成，适合日常开发工作流。

**🥉 DeepSeek-Coder V2**
开源替代中性价比最高，算法题和数学相关代码表现出色，API 价格仅为 GPT-4 的约 1/10。

**实用建议：**
- **IDE 集成**：首选 Cursor（Claude 驱动）或 GitHub Copilot
- **代码审查**：Claude 长文本优势明显
- **算法/竞赛**：DeepSeek-Coder 或 o1-mini
- **预算有限**：DeepSeek API 极具性价比`,

  '如何选择适合我的 AI 绘图工具？': `根据不同需求选择：

**🎨 追求最高艺术质量 → Midjourney V6**
风格独特、细节丰富，是设计师和艺术家的首选。$10/月起，仅支持 Discord。

**⚡ 需要快速迭代 → DALL-E 3（集成在 ChatGPT）**
上手简单，自然语言描述准确，适合非设计师，免费账户有一定额度。

**🔧 需要精准控制 → Stable Diffusion + ControlNet**
开源免费可本地运行，支持 LoRA 微调，有 ComfyUI 等强大界面，适合高级用户。

**🇨🇳 国产推荐 → 即梦 AI（字节）/ 文心一格（百度）**
中文提示词理解更好，内容审核适合国内使用场景。

**选择核心参考点：**
- 是否需要本地运行（隐私/成本）？→ Stable Diffusion
- 是否重视艺术风格？→ Midjourney  
- 是否要快速出图？→ DALL-E 3`,

  'GPT-4o 和 Claude 3.5 有什么区别？': `两款都是顶级 LLM，各有侧重：

| 对比维度 | GPT-4o | Claude 3.5 Sonnet |
|---------|--------|-------------------|
| **最擅长** | 多模态、通用任务 | 写作、代码、分析 |
| **上下文窗口** | 128K Token | 200K Token |
| **语音支持** | ✅ 原生实时语音 | ❌ 无 |
| **图像生成** | ✅ 集成 DALL-E | ❌ 无 |
| **代码能力** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **写作风格** | 直接清晰 | 更具文学性 |
| **安全过滤** | 中等 | 较严格 |
| **价格(API)** | $5/百万Token | $3/百万Token |

**推荐使用场景：**
- **选 GPT-4o**：需要语音对话、图像生成、日常多模态任务
- **选 Claude 3.5**：长文档分析、专业写作、复杂代码项目、成本敏感场景`,
}

function generateResponse(question: string): string {
  // Check for predefined answers
  for (const [key, value] of Object.entries(AI_RESPONSES)) {
    if (question.includes(key.slice(0, 10))) return value
  }

  // Generic AI-themed response
  const responses = [
    `关于"${question}"，这是一个很好的问题！\n\n作为 AI Hub 内置助手，我基于当前 AI 行业知识库为您分析：\n\n**核心要点：**\n1. 目前该领域正处于快速发展阶段，建议关注 OpenAI、Anthropic、Google DeepMind 三大主力玩家的最新动态\n2. 实际应用中，选择工具时需平衡**能力、成本、隐私**三个维度\n3. 建议订阅 AI 行业 Newsletter（如 The Batch、Import AI）保持信息更新\n\n**相关推荐工具：**\n- 通用问答：ChatGPT、Claude、Gemini 三选一\n- 深度分析：Perplexity AI 附带引用来源\n- 技术实现：根据具体场景在工具库中筛选\n\n如需了解更具体的场景建议，请在 **AI 工具库** 页面按分类浏览，每个工具都标注了擅长领域！`,
    `这是一个在 AI 领域很值得探讨的话题。\n\n**简要分析：**\n\n随着 2025 年各大模型厂商的激烈竞争，AI 能力边界正在快速扩展。关于您的问题，有几个关键视角值得关注：\n\n🔹 **技术层面**：大模型的核心能力差距在缩小，但在特定垂直领域仍有明显分化\n\n🔹 **应用层面**：选择 AI 工具的关键是匹配使用场景，而非盲目追求"最强"\n\n🔹 **趋势方向**：多模态融合、Agent 自主化、本地化部署是 2025 年三大主线\n\n建议您在 **AI 动态** 页面查看最新资讯，或在 **AI 工具库** 中按需求场景筛选工具。`,
  ]
  return responses[Math.floor(Math.random() * responses.length)]
}

function MessageBubble({ message }: { message: Message }) {
  const [copied, setCopied] = useState(false)
  const isAI = message.role === 'assistant'

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Simple markdown-like rendering
  const renderContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} className="font-semibold text-foreground my-1">{line.slice(2, -2)}</p>
      }
      if (line.startsWith('# ')) {
        return <h2 key={i} className="font-bold text-base my-2">{line.slice(2)}</h2>
      }
      if (line.startsWith('## ')) {
        return <h3 key={i} className="font-semibold text-sm my-1.5">{line.slice(3)}</h3>
      }
      if (line.startsWith('- ') || line.startsWith('• ')) {
        return (
          <div key={i} className="flex gap-2 my-0.5">
            <span className="text-primary mt-1 shrink-0">·</span>
            <span>{line.slice(2).replace(/\*\*(.*?)\*\*/g, '$1')}</span>
          </div>
        )
      }
      if (line.startsWith('🔹') || line.startsWith('🥇') || line.startsWith('🥈') || line.startsWith('🥉') || line.startsWith('🎨') || line.startsWith('⚡') || line.startsWith('🔧') || line.startsWith('🇨🇳')) {
        return <p key={i} className="my-1">{formatInline(line)}</p>
      }
      if (line.startsWith('|')) {
        return <p key={i} className="font-mono text-xs my-0.5 text-muted-foreground">{line}</p>
      }
      if (line === '') return <div key={i} className="h-1" />
      return <p key={i} className="my-0.5 leading-relaxed">{formatInline(line)}</p>
    })
  }

  const formatInline = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/)
    return parts.map((part, i) =>
      i % 2 === 1
        ? <strong key={i} className="font-semibold text-foreground">{part}</strong>
        : part
    )
  }

  return (
    <div className={cn("flex gap-3 animate-fade-in", isAI ? "flex-row" : "flex-row-reverse")}>
      {/* Avatar */}
      <div className={cn(
        "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-1",
        isAI
          ? "bg-gradient-primary shadow-glow-sm"
          : "bg-surface-2 border border-border"
      )}>
        {isAI
          ? <Bot className="w-4 h-4 text-white" />
          : <User className="w-4 h-4 text-muted-foreground" />
        }
      </div>

      {/* Bubble */}
      <div className={cn(
        "max-w-[85%] rounded-2xl px-4 py-3 text-sm",
        isAI
          ? "glass-card text-foreground rounded-tl-sm"
          : "bg-primary text-white rounded-tr-sm"
      )}>
        <div className={cn("leading-relaxed", isAI ? "text-sm" : "text-sm")}>
          {isAI ? renderContent(message.content) : message.content}
        </div>

        {isAI && (
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
            <span className="text-xs text-muted-foreground">
              {message.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <button
              onClick={handleCopy}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? '已复制' : '复制'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: `你好！我是 **AI Hub 助手**，专注于 AI 领域的知识问答。\n\n我可以帮你：\n- 比较不同 AI 模型的优缺点\n- 推荐适合你场景的 AI 工具\n- 解答 AI 技术和行业趋势问题\n- 提供 Prompt 工程和最佳实践建议\n\n试试下方的快捷问题，或者直接输入你想了解的内容！`,
      timestamp: new Date(),
    }
  ])
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = (text: string) => {
    if (!text.trim() || isThinking) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsThinking(true)

    // Simulate AI thinking delay
    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateResponse(text.trim()),
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, aiMsg])
      setIsThinking(false)
    }, 1200 + Math.random() * 800)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const handleReset = () => {
    setMessages([{
      id: '0',
      role: 'assistant',
      content: `你好！我是 **AI Hub 助手**，专注于 AI 领域的知识问答。\n\n我可以帮你：\n- 比较不同 AI 模型的优缺点\n- 推荐适合你场景的 AI 工具\n- 解答 AI 技术和行业趋势问题\n- 提供 Prompt 工程和最佳实践建议\n\n试试下方的快捷问题，或者直接输入你想了解的内容！`,
      timestamp: new Date(),
    }])
    setInput('')
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">AI 助手</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">专注 AI 领域知识的智能问答助手</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5">
          <RotateCcw className="w-3.5 h-3.5" />
          清空对话
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {/* Thinking indicator */}
        {isThinking && (
          <div className="flex gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-xl bg-gradient-primary shadow-glow-sm flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="glass-card rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Quick questions */}
      {messages.length <= 1 && (
        <div className="shrink-0 mb-3">
          <p className="text-xs text-muted-foreground mb-2">快捷问题：</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_QUESTIONS.map(q => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="text-xs px-3 py-1.5 rounded-full border border-border bg-surface text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="shrink-0 glass-card rounded-2xl p-3">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="问我任何关于 AI 的问题... (Enter 发送，Shift+Enter 换行)"
            rows={2}
            className="input-cyber flex-1 rounded-xl px-3 py-2.5 text-sm resize-none leading-relaxed"
            disabled={isThinking}
          />
          <Button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isThinking}
            size="icon"
            className="h-11 w-11 rounded-xl shrink-0 btn-glow"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 px-1">
          AI 回答仅供参考，重要决策请结合多方信息源验证
        </p>
      </div>
    </div>
  )
}
