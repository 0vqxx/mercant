/**
 * PDF & Document Text Extractor
 * Extracts plain text from uploaded PDF, TXT, CSV, and doc files in the browser.
 * Uses dynamic PDF.js with a fallback native stream parser.
 */

declare global {
  interface Window {
    pdfjsLib?: any
  }
}

async function loadPdfJs(): Promise<any> {
  if (typeof window === 'undefined') return null
  if (window.pdfjsLib) return window.pdfjsLib

  return new Promise((resolve) => {
    const existing = document.querySelector('script[data-pdfjs]')
    if (existing) {
      const interval = setInterval(() => {
        if (window.pdfjsLib) {
          clearInterval(interval)
          resolve(window.pdfjsLib)
        }
      }, 50)
      setTimeout(() => {
        clearInterval(interval)
        resolve(null)
      }, 4000)
      return
    }

    const script = document.createElement('script')
    script.setAttribute('data-pdfjs', 'true')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
    script.async = true
    script.onload = () => {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
        resolve(window.pdfjsLib)
      } else {
        resolve(null)
      }
    }
    script.onerror = () => resolve(null)
    document.head.appendChild(script)
  })
}

function extractTextFromPdfBytes(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let raw = ''
  const chunkSize = 65536
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize)
    raw += String.fromCharCode.apply(null, Array.from(chunk))
  }

  const extractedLines: string[] = []

  const tjRegex = /\(((?:\\\(|\\\)|[^()]))*\)\s*Tj/g
  let match: RegExpExecArray | null
  while ((match = tjRegex.exec(raw)) !== null) {
    if (match[1]) {
      const text = match[1]
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '')
        .replace(/\\t/g, '\t')
        .replace(/\\\(/g, '(')
        .replace(/\\\)/g, ')')
        .replace(/\\\\/g, '\\')
        .trim()
      if (text.length > 0) extractedLines.push(text)
    }
  }

  const tjArrayRegex = /\[(.*?)\]\s*TJ/g
  while ((match = tjArrayRegex.exec(raw)) !== null) {
    if (match[1]) {
      const innerMatches = match[1].match(/\((.*?)\)/g)
      if (innerMatches) {
        const text = innerMatches
          .map((m) => m.slice(1, -1))
          .join('')
          .trim()
        if (text.length > 0) extractedLines.push(text)
      }
    }
  }

  return extractedLines.join('\n')
}

export async function extractTextFromFile(file: File): Promise<string> {
  const fileName = file.name.toLowerCase()

  // 1. Plain text, CSV, TSV or JSON files
  if (
    fileName.endsWith('.txt') ||
    fileName.endsWith('.csv') ||
    fileName.endsWith('.json') ||
    fileName.endsWith('.tsv') ||
    fileName.endsWith('.md') ||
    file.type.startsWith('text/')
  ) {
    return await file.text()
  }

  // 2. PDF Files
  if (fileName.endsWith('.pdf') || file.type === 'application/pdf') {
    const arrayBuffer = await file.arrayBuffer()

    try {
      const pdfjs = await loadPdfJs()
      if (pdfjs) {
        const loadingTask = pdfjs.getDocument({ data: arrayBuffer })
        const pdf = await loadingTask.promise
        const numPages = pdf.numPages
        const pageTexts: string[] = []

        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
          const page = await pdf.getPage(pageNum)
          const textContent = await page.getTextContent()

          let lastY: number | null = null
          let currentLine = ''
          const lines: string[] = []

          for (const item of textContent.items as any[]) {
            if (lastY !== null && Math.abs(item.transform[5] - lastY) > 4) {
              if (currentLine.trim()) lines.push(currentLine.trim())
              currentLine = ''
            }
            currentLine += (currentLine ? ' ' : '') + (item.str || '')
            lastY = item.transform[5]
          }
          if (currentLine.trim()) lines.push(currentLine.trim())

          pageTexts.push(`--- Página ${pageNum} ---\n` + lines.join('\n'))
        }

        const fullText = pageTexts.join('\n\n').trim()
        if (fullText.length > 20) {
          return fullText
        }
      }
    } catch (pdfErr) {
      console.warn('[PDF.js] Failed, trying fallback stream extractor:', pdfErr)
    }

    // Fallback if PDF.js is unavailable
    const fallbackText = extractTextFromPdfBytes(arrayBuffer)
    if (fallbackText.trim().length > 0) {
      return fallbackText
    }

    throw new Error('No se pudo extraer texto del PDF. Asegúrate de que no sea un documento escaneado como imagen.')
  }

  return await file.text()
}
