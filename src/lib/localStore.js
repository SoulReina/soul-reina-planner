export function readAll(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function writeAll(key, items) {
  localStorage.setItem(key, JSON.stringify(items))
}
