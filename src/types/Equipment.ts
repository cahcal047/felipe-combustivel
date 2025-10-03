export interface Equipment {
  id: string;
  equipamento: string;
  modelo: string;
  unidade: string;
  kmh: number;
  trabalhadas: number;
  combustivel: number;
  eficiencia: number | string;
  data?: string;
}

export interface ReportFilters {
  de?: string;
  ate?: string;
  modelo?: string;
  equipamento?: string;
}

export interface ReportMetrics {
  totalHoras: number;
  totalComb: number;
  mediaKmh: number;
  kmTotais: number;
  eficienciaMedia: number;
  custoTotal: number;
  custoHora: number;
}