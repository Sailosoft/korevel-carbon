export function formatTonnes(value: number, fractionDigits = 0): string {
  return value.toLocaleString("en-GB", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

export function formatQuantity(value: number): string {
  return value.toLocaleString("en-GB", {
    maximumFractionDigits: 2,
  });
}

export function formatPercent(value: number, fractionDigits = 0): string {
  return `${value.toLocaleString("en-GB", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })}%`;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function roundTo(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function safePct(part: number, total: number): number {
  if (total <= 0) return 0;
  return (part / total) * 100;
}

export function deltaPct(current: number, previous: number): number {
  if (previous <= 0) return 0;
  return ((current - previous) / previous) * 100;
}
