#!/usr/bin/env node
/**
 * 每日自动抓取 AI 行业新闻 RSS，生成 news.json
 * 数据源：
 * - MIT Technology Review AI
 * - TechCrunch AI
 * - The Verge AI
 * - VentureBeat AI
 */

const https = require('https')
const http = require('http')
const fs = require('fs')
const path = require('path')

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AIHub-NewsBot/1.0)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
      timeout: 15000,
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchUrl(res.headers.location).then(resolve).catch(reject)
        return
      }
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => resolve(data))
    })
    req.on('error', reject)
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')) })
  })
}

function parseRSS(xml, source) {
  const items = []
  const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g)

  for (const match of itemMatches) {
    const item = match[1]

    const title = (item.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/) || [])[1]?.trim()
    const link = (item.match(/<link>([^<]+)<\/link>/) || item.match(/<link[^>]+href="([^"]+)"/) || [])[1]?.trim()
    const pubDate = (item.match(/<pubDate>([^<]+)<\/pubDate>/) || item.match(/<published>([^<]+)<\/published>/) || [])[1]?.trim()
    const description = (item.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/) || [])[1]?.trim()

    if (!title || !link) continue

    // 清理 HTML 标签
    const cleanDesc = description
      ? description.replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200)
      : ''

    // 解析日期
    let dateStr = ''
    if (pubDate) {
      try {
        const d = new Date(pubDate)
        if (!isNaN(d.getTime())) {
          dateStr = d.toISOString().split('T')[0]
        }
      } catch (_) {}
    }
    if (!dateStr) dateStr = new Date().toISOString().split('T')[0]

    // 判断分类
    const titleLower = title.toLowerCase()
    let category = 'news'
    if (titleLower.includes('model') || titleLower.includes('gpt') || titleLower.includes('claude') || titleLower.includes('gemini') || titleLower.includes('llm') || titleLower.includes('模型')) {
      category = 'model'
    } else if (titleLower.includes('funding') || titleLower.includes('raise') || titleLower.includes('billion') || titleLower.includes('acquisition') || titleLower.includes('invest')) {
      category = 'company'
    } else if (titleLower.includes('research') || titleLower.includes('paper') || titleLower.includes('study') || titleLower.includes('benchmark')) {
      category = 'research'
    } else if (titleLower.includes('launch') || titleLower.includes('release') || titleLower.includes('introduce') || titleLower.includes('announce')) {
      category = 'product'
    }

    items.push({
      id: Buffer.from(link).toString('base64').slice(0, 12),
      title,
      summary: cleanDesc || title,
      url: link,
      date: dateStr,
      category,
      source,
      isHot: false,
    })

    if (items.length >= 6) break
  }

  return items
}

const RSS_SOURCES = [
  { url: 'https://techcrunch.com/category/artificial-intelligence/feed/', name: 'TechCrunch AI', company: 'TechCrunch', color: '#00A86B' },
  { url: 'https://www.theverge.com/ai-artificial-intelligence/rss/index.xml', name: 'The Verge AI', company: 'The Verge', color: '#FA4949' },
  { url: 'https://venturebeat.com/feed/', name: 'VentureBeat AI', company: 'VentureBeat', color: '#4D9FEC' },
  { url: 'https://www.technologyreview.com/topic/artificial-intelligence/feed/', name: 'MIT Tech Review', company: 'MIT TR', color: '#8B5CF6' },
]

async function main() {
  console.log('开始抓取 AI 新闻...')
  const allItems = []

  for (const source of RSS_SOURCES) {
    try {
      console.log(`抓取: ${source.name}`)
      const xml = await fetchUrl(source.url)
      const items = parseRSS(xml, source.name)
      items.forEach(item => {
        item.company = source.company
        item.companyColor = source.color
      })
      allItems.push(...items)
      console.log(`  获取 ${items.length} 条`)
    } catch (err) {
      console.warn(`  失败: ${err.message}`)
    }
  }

  // 按日期排序，最新在前
  allItems.sort((a, b) => b.date.localeCompare(a.date))

  // 标记前3条为热榜
  allItems.slice(0, 3).forEach(item => { item.isHot = true })

  // 最多保留20条
  const result = allItems.slice(0, 20)

  const output = {
    updatedAt: new Date().toISOString(),
    items: result,
  }

  const outputPath = path.join(__dirname, '..', 'public', 'news.json')
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8')
  console.log(`\n✅ 成功生成 news.json，共 ${result.length} 条新闻`)
  console.log(`更新时间: ${output.updatedAt}`)
}

main().catch(err => {
  console.error('抓取失败:', err)
  process.exit(1)
})
