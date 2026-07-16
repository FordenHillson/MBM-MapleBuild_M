/** Max edge length when compressing user-uploaded gear icons. */
const ICON_MAX_SIZE = 128
const ICON_MIME = 'image/webp'
const ICON_QUALITY = 0.82

/**
 * Read a local image file and return a small data URL (WebP, fallback JPEG/PNG).
 * Keeps localStorage builds from bloating.
 */
export function fileToGearIconDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('ไฟล์ต้องเป็นรูปภาพ'))
      return
    }
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('อ่านไฟล์ไม่สำเร็จ'))
    reader.onload = () => {
      const raw = String(reader.result ?? '')
      if (!raw) {
        reject(new Error('ไฟล์ว่าง'))
        return
      }
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(
          1,
          ICON_MAX_SIZE / Math.max(img.width, img.height, 1),
        )
        const w = Math.max(1, Math.round(img.width * scale))
        const h = Math.max(1, Math.round(img.height * scale))
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(raw)
          return
        }
        ctx.clearRect(0, 0, w, h)
        ctx.drawImage(img, 0, 0, w, h)
        try {
          const webp = canvas.toDataURL(ICON_MIME, ICON_QUALITY)
          if (webp.startsWith('data:image/webp')) {
            resolve(webp)
            return
          }
        } catch {
          /* WebP unsupported */
        }
        try {
          resolve(canvas.toDataURL('image/jpeg', ICON_QUALITY))
        } catch {
          resolve(canvas.toDataURL('image/png'))
        }
      }
      img.onerror = () => reject(new Error('เปิดรูปไม่สำเร็จ'))
      img.src = raw
    }
    reader.readAsDataURL(file)
  })
}

export function normalizeIconUrl(url: string | null | undefined): string {
  if (typeof url !== 'string') return ''
  const trimmed = url.trim()
  if (!trimmed) return ''
  if (
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('data:image/')
  ) {
    return trimmed
  }
  return ''
}
