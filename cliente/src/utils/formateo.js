// Formato único para los contadores que se muestran en la interfaz.
// Hasta 1000 se pinta el número completo; por encima se abrevia con un
// decimal y el sufijo "k" (1001 → 1.0k, 1500 → 1.5k, 12345 → 12.3k).
export const formatearNumero = (valor) => {
  const num = Number(valor)
  if (!Number.isFinite(num)) return '0'

  const positivo = Math.max(0, num)
  if (positivo <= 1000) return String(Math.round(positivo))
  return `${(positivo / 1000).toFixed(1)}k`
}
