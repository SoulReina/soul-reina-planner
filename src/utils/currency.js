// Franc Pacifique (XPF/CFP) — pas de décimales, montants toujours entiers.

export function toXPFAmount(value) {
  const num = Math.round(Number(value))
  return Number.isFinite(num) ? num : 0
}

export function formatXPF(amount) {
  const value = Math.round(Number(amount) || 0)
  return `${new Intl.NumberFormat('fr-FR').format(value)} F`
}
