import { Equipment, ReportMetrics } from '../types/Equipment';

export function sum(arr: number[]): number {
  return arr.reduce((a, b) => a + (Number(b) || 0), 0);
}

export function avg(arr: number[]): number {
  return arr.length ? sum(arr) / arr.length : 0;
}

export function totalKmFromRow(row: Equipment): number {
  const kmBySpeed = Number(row.kmh || 0) * Number(row.trabalhadas || 0);
  if (kmBySpeed > 0) return kmBySpeed;
  
  if (row.eficiencia && row.combustivel) {
    const val = Number(row.eficiencia || 0) * Number(row.combustivel || 0);
    if (val > 0) return val;
  }
  return 0;
}

export function groupBy<T>(arr: T[], keyFn: (item: T) => string): { [key: string]: T[] } {
  return arr.reduce((acc, item) => {
    const k = keyFn(item) || '—';
    (acc[k] ||= []).push(item);
    return acc;
  }, {} as { [key: string]: T[] });
}

export function mapGroupSum(groups: { [key: string]: Equipment[] }, field: keyof Equipment): { [key: string]: number } {
  const out: { [key: string]: number } = {};
  Object.entries(groups).forEach(([k, rows]) => {
    out[k] = sum(rows.map(r => Number(r[field]) || 0));
  });
  return out;
}

export function maxEntry(obj: { [key: string]: number }): { key: string; value: number } | null {
  let best: { key: string; value: number } | null = null;
  Object.entries(obj).forEach(([k, v]) => {
    if (best === null || v > best.value) {
      best = { key: k, value: v };
    }
  });
  return best;
}

export function minEntry(obj: { [key: string]: number }): { key: string; value: number } | null {
  let best: { key: string; value: number } | null = null;
  Object.entries(obj).forEach(([k, v]) => {
    if (best === null || v < best.value) {
      best = { key: k, value: v };
    }
  });
  return best;
}

export function calculateMetrics(equipment: Equipment[], fuelPrice: number = 0): ReportMetrics {
  const totalHoras = sum(equipment.map(r => Number(r.trabalhadas) || 0));
  const totalComb = sum(equipment.map(r => Number(r.combustivel) || 0));
  const mediaKmh = avg(equipment.map(r => Number(r.kmh) || 0));
  const kmTotais = 0; // Não temos quilometragem real, apenas horas trabalhadas
  // Eficiência média baseada nos valores já calculados na tabela (Km/L)
  const eficienciaValida = equipment.filter(r => Number(r.eficiencia) > 0);
  const eficienciaMedia = eficienciaValida.length > 0 
    ? avg(eficienciaValida.map(r => Number(r.eficiencia))) 
    : 0;
  const custoTotal = fuelPrice * totalComb;
  const custoHora = totalHoras > 0 ? (custoTotal / totalHoras) : 0;

  return {
    totalHoras,
    totalComb,
    mediaKmh,
    kmTotais,
    eficienciaMedia,
    custoTotal,
    custoHora
  };
}