import removeMd from 'remove-markdown'

// 把 Markdown 转成纯文本摘要
export function toExcerpt(md, maxLength = 100) {
  if (!md) return ''
  const plain = removeMd(md)              // 洗掉所有 Markdown 语法
  const trimmed = plain.replace(/\s+/g, ' ').trim()   // 压掉多余空白
  return trimmed.length > maxLength
    ? trimmed.slice(0, maxLength) + '...'
    : trimmed
}