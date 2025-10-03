import { Equipment } from '../types/Equipment';

export function cryptoRandomId(): string {
  if (window.crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'id-' + Math.random().toString(36).slice(2, 10);
}

export function parseFloatValue(v: string | number): number {
  const raw = String(v ?? '').trim();
  if (!raw) return 0;
  const sanitized = raw.replace(/\./g, '').replace(',', '.');
  const n = parseFloat(sanitized);
  return isNaN(n) ? 0 : n;
}

export function formatNumber(v: number | string): string {
  return Number(v || 0).toLocaleString('pt-BR', { maximumFractionDigits: 2 });
}

export function toCSV(rows: Equipment[]): string {
  const header = ['Equipamento', 'Modelo', 'Unidade', 'KM/h Trabalhadas', 'Combustivel Consumido', 'Km/l / L/h'];
  const lines = [header.join(';')];
  
  rows.forEach(r => {
    lines.push([
      r.equipamento,
      r.modelo,
      r.unidade,
      r.trabalhadas,
      r.combustivel,
      r.eficiencia ?? ''
    ].map(v => String(v ?? '')).join(';'));
  });
  
  return lines.join('\n');
}

export function fromCSV(csv: string): Equipment[] {
  const lines = csv.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length < 2) return [];
  
  const headerLine = lines[0];
  const delimiter = headerLine.includes(';') ? ';' : (headerLine.includes('\t') ? '\t' : ',');
  const headers = headerLine.split(delimiter).map(h => h.trim());
  
  const norm = (s: string): string => s.toLowerCase()
    .replace(/[áàâãä]/g, 'a').replace(/[éèêë]/g, 'e').replace(/[íìîï]/g, 'i')
    .replace(/[óòôõö]/g, 'o').replace(/[úùûü]/g, 'u').replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9/ ]+/g, '').replace(/\s+/g, ' ').trim();
  
  const nameToIndex: { [key: string]: number } = {};
  headers.forEach((h, i) => { nameToIndex[norm(h)] = i; });
  
  let idxEquip = nameToIndex[norm('Equipamento')];
  let idxModelo = nameToIndex[norm('Modelo')];
  let idxUnidade = nameToIndex[norm('Unidade')];
  let idxTrab = nameToIndex[norm('KM/h Trabalhadas')] ?? nameToIndex[norm('Km/h Trabalhadas')] ?? nameToIndex[norm('Trabalhadas')] ?? nameToIndex[norm('Horas Trabalhadas')];
  let idxComb = nameToIndex[norm('Combustivel Consumido')] ?? nameToIndex[norm('Combustível Consumido')] ?? nameToIndex[norm('Combustivel')] ?? nameToIndex[norm('Consumo')];
  let idxEf = nameToIndex[norm('Km/l / L/h')] ?? nameToIndex[norm('Km/l')] ?? nameToIndex[norm('L/h')];
  
  if (headers.length === 6) {
    if (idxEquip === undefined) idxEquip = 0;
    if (idxModelo === undefined) idxModelo = 1;
    if (idxUnidade === undefined) idxUnidade = 2;
    if (idxTrab === undefined) idxTrab = 3;
    if (idxComb === undefined) idxComb = 4;
    if (idxEf === undefined) idxEf = 5;
  }
  
  const out: Equipment[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(delimiter);
    const equipamento = getCol(cols, idxEquip);
    const modelo = getCol(cols, idxModelo);
    const unidade = getCol(cols, idxUnidade);
    const trabalhadas = parseFloatValue(getCol(cols, idxTrab));
    const combustivel = parseFloatValue(getCol(cols, idxComb));
    const eficiencia = getCol(cols, idxEf) !== '' ? parseFloatValue(getCol(cols, idxEf)) : '';
    
    out.push({
      id: cryptoRandomId(),
      equipamento, modelo, unidade,
      kmh: trabalhadas, // O valor de KM/h está na coluna "KM/h Trabalhadas"
      trabalhadas,
      combustivel,
      eficiencia
    });
  }
  
  return out;
  
  function getCol(arr: string[], idx: number | undefined): string {
    return idx !== undefined ? String(arr[idx] ?? '').trim() : '';
  }
}

export function downloadFile(filename: string, content: string, type: string): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}