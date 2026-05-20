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
  '目前最强的代码生成模型是哪个？',
  '如何选择适合我的 AI 绘图工具？',
  'GPT-4o 和 Claude 有什么区别？',
  '什么是 AI Agent？有哪些应用场景？',
  'Prompt 工程有哪些最佳实践？',
  '本地部署大模型需要什么硬件配置？',
]

// Pollinations AI 免费 API - 无需注册/API Key
async function callPollinationsAI(messages: { role: string; content: string }[]): Promise<string> {
  const systemPrompt = `你是 AI Hub 的专属助手，专注于 AI 领域的知识问答。你对以下领域有深入了解：
- 各大 AI 公司和最新模型（OpenAI、Anthropic、Google DeepMind、DeepSeek、Meta、xAI 等）
- AI 工具的使用场景和最佳实践（ChatGPT、Claude、Gemini、Midjourney、Cursor 等）
- AI Agent、RAG、Prompt Engineering 等技术概念
- AI 行业动态和发展趋势

请用中文回答，回答要专业、实用、有条理。适当使用 Markdown 格式（**加粗**、列表等）让内容更清晰。`

  const response = await fetch('https://text.pollinations.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'openai',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  })

  if (!response.ok) throw new Error(`API 请求失败: ${response.status}`)
  const data = await response.json()
  return data.choices?.[0]?.message?.content || '抱歉，暂时无法获取回答，请稍后再试。'
}

// 简单 Markdown 渲染
function renderMarkdown(text: string) {
  const lines = text.split('\n')
  const elements: JSX.Element[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.startsWith('### ')) {
      elements.push(<h3 key={i} className="font-bold text-sm mt-3 mb-1 text-foreground">{line.slice(4)}</h3>)
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="font-bold text-base mt-3 mb-1 text-foreground">{line.slice(3)}</h2>)
    } else if (line.startsWith('# ')) {
      elements.push(<h1 key={i} className="font-bold text-lg mt-2 mb-1 text-foreground">{line.slice(2)}</h1>)
    } else if (line.match(/^[-*] /)) {
      elements.push(
        <div key={i} className="flex gap-2 my-0.5 ml-1">
          <span className="text-primary shrink-0 mt-0.5">·</span>
          <span>{formatInline(line.slice(2))}</span>
        </div>
      )
    } else if (line.match(/^\d+\. /)) {
      const num = line.match(/^(\d+)\. /)?.[1]
      elements.push(
        <div key={i} className="flex gap-2 my-0.5 ml-1">
          <span className="text-primary shrink-0 font-mono text-xs mt-0.5">{num}.</span>
          <span>{formatInline(line.replace(/^\d+\. /, ''))}</span>
        </div>
      )
    } else if (line.startsWith('> ')) {
      elements.push(
        <div key={i} className="border-l-2 border-primary/40 pl-3 my-1 text-muted-foreground italic text-xs">
          {line.slice(2)}
        </div>
      )
    } else if (line.startsWith('---') || line.startsWith('===')) {
      elements.push(<hr key={i} className="border-border my-2" />)
    } else if (line === '') {
      elements.push(<div key={i} className="h-1.5" />)
    } else {
      elements.push(<p key={i} className="my-0.5 leading-relaxed">{formatInline(line)}</p>)
    }
    i++
  }
  return elements
}

function formatInline(text: string): (string | JSX.Element)[] {
  // Handle **bold**, *italic*, `code`
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i} className="italic">{part.slice(1, -1)}</em>
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="code-block">{part.slice(1, -1)}</code>
    }
    return part
  })
}

function MessageBubble({ message }: { message: Message }) {
  const [copied, setCopied] = useState(false)
  const isAI = message.role === 'assistant'

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn('flex gap-3 animate-fade-in', isAI ? 'flex-row' : 'flex-row-reverse')}>
      <div className={cn(
        'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-1',
        isAI ? 'bg-gradient-primary shadow-glow-sm' : 'bg-surface-2 border border-border'
      )}>
        {isAI ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-muted-foreground" />}
      </div>

      <div className={cn(
        'max-w-[85%] rounded-2xl px-4 py-3 text-sm',
        isAI ? 'glass-card text-foreground rounded-tl-sm' : 'bg-primary text-white rounded-tr-sm'
      )}>
        <div className="leading-relaxed">
          {isAI ? renderMarkdown(message.content) : message.content}
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

function ThinkingBubble() {
  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="w-8 h-8 rounded-xl bg-gradient-primary shadow-glow-sm flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="glass-card rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">AI 思考中...</span>
        </div>
      </div>
    </div>
  )
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: `你好！我是 **AI Hub 助手**，由 Pollinations AI 驱动，专注于 AI 领域的知识问答。

我可以帮你：
- 比较不同 AI 模型的优缺点和适用场景
- 推荐适合你需求的 AI 工具
- 解答 AI 技术概念和行业趋势
- 提供 Prompt 工程和最佳实践建议
- 回答任何关于 AI 的问题

试试下方的快捷问题，或者直接输入你想了解的内容！`,
      timestamp: new Date(),
    }
  ])
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [showQuick, setShowQuick] = useState(true)
  const [error, setError] = useState('')
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isThinking])

  const sendMessage = async (text: string) => {
    if (!text.trim() || isThinking) return
    setShowQuick(false)
    setError('')

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setIsThinking(true)

    try {
      // 构建发送给 API 的历史消息（最近8条）
      const apiMessages = newMessages.slice(-8).map(m => ({
        role: m.role,
        content: m.content,
      }))

      const reply = await callPollinationsAI(apiMessages)

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, aiMsg])
    } catch (err) {
      setError('网络请求失败，请检查网络连接后重试')
      console.error(err)
    } finally {
      setIsThinking(false)
    }
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
      content: `你好！我是 **AI Hub 助手**，由 Pollinations AI 驱动，专注于 AI 领域的知识问答。

我可以帮你：
- 比较不同 AI 模型的优缺点和适用场景
- 推荐适合你需求的 AI 工具
- 解答 AI 技术概念和行业趋势
- 提供 Prompt 工程和最佳实践建议
- 回答任何关于 AI 的问题

试试下方的快捷问题，或者直接输入你想了解的内容！`,
      timestamp: new Date(),
    }])
    setInput('')
    setError('')
    setShowQuick(true)
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">AI 助手</h1>
            <span className="text-xs bg-accent-emerald/15 text-accent-emerald border border-accent-emerald/30 px-2 py-0.5 rounded-full font-medium">
              免费
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            由 Pollinations AI 驱动 · 无需注册 · 专注 AI 领域问答
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5">
          <RotateCcw className="w-3.5 h-3.5" />
          清空
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isThinking && <ThinkingBubble />}
        {error && (
          <div className="glass-card rounded-xl p-3 border-accent-rose/30 bg-accent-rose/5">
            <p className="text-sm text-accent-rose">{error}</p>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Quick questions */}
      {showQuick && (
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
          由 Pollinations AI 免费提供 · AI 回答仅供参考
        </p>
      </div>
    </div>
  )
}
