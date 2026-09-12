/**
 * Formats a monetary value in the given ISO 4217 currency code.
 *
 * @example formatarSaldo(56, 'USD')    // "$56.00"
 * @example formatarSaldo(110, 'CNY')   // "CN¥110.00"
 * @example formatarSaldo(1234.5, 'USD') // "$1,234.50"
 *
 * Falls back to a plain numeric string for currencies unknown to Intl.
 */
export function formatarSaldo(valor: number, moeda: string): string {
  const formato = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: moeda,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const resultado = formato.format(valor);

  // Intl uses the currency code itself as the symbol for unknown currencies
  // (e.g. "XYZ 42.50"); in that case fall back to a plain value.
  if (resultado.includes(moeda)) {
    return `${valor.toFixed(2)} ${moeda}`;
  }
  return resultado;
}
