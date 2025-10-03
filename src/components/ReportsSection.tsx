import React, { useState, useMemo } from 'react';
import { Equipment, ReportFilters } from '../types/Equipment';
import { calculateMetrics, groupBy, mapGroupSum, maxEntry, minEntry, totalKmFromRow } from '../utils/reportUtils';
import { formatNumber } from '../utils/csvUtils';
import { MetricCard } from './MetricCard';
import { ReportFiltersComponent } from './ReportFilters';

interface ReportsSectionProps {
  equipment: Equipment[];
}

export function ReportsSection({ equipment }: ReportsSectionProps) {
  const [filters, setFilters] = useState<ReportFilters>({});
  const [fuelPrice, setFuelPrice] = useState(() => {
    return parseFloat(localStorage.getItem('preco_combustivel') || '0');
  });

  const filteredEquipment = useMemo(() => {
    let filtered = equipment.slice();

    if (filters.de) {
      filtered = filtered.filter(r => (r.data || '') >= filters.de!);
    }
    if (filters.ate) {
      filtered = filtered.filter(r => (r.data || '') <= filters.ate!);
    }
    if (filters.modelo) {
      filtered = filtered.filter(r => 
        String(r.modelo || '').toLowerCase().includes(filters.modelo!.toLowerCase())
      );
    }
    if (filters.equipamento) {
      filtered = filtered.filter(r => 
        String(r.equipamento || '').toLowerCase().includes(filters.equipamento!.toLowerCase())
      );
    }

    return filtered;
  }, [equipment, filters]);

  const metrics = useMemo(() => {
    return calculateMetrics(filteredEquipment, fuelPrice);
  }, [filteredEquipment, fuelPrice]);

  const additionalMetrics = useMemo(() => {
    const byEquip = groupBy(filteredEquipment, r => r.equipamento);
    const byModelo = groupBy(filteredEquipment, r => r.modelo);
    const horasPorEquip = mapGroupSum(byEquip, 'trabalhadas');
    const horasPorModelo = mapGroupSum(byModelo, 'trabalhadas');
    const combPorEquip = mapGroupSum(byEquip, 'combustivel');

    const equipMaisHoras = maxEntry(horasPorEquip);
    const equipMenosHoras = minEntry(horasPorEquip);

    const rankingConsumoHora = Object.entries(byEquip).map(([equip, rows]) => {
      const horas = rows.reduce((sum, r) => sum + (Number(r.trabalhadas) || 0), 0);
      const comb = rows.reduce((sum, r) => sum + (Number(r.combustivel) || 0), 0);
      return { equip, valor: horas > 0 ? comb / horas : 0 };
    }).sort((a, b) => b.valor - a.valor).slice(0, 5);

    const eficienciaPorModelo = Object.entries(byModelo).map(([modelo, rows]) => {
      // Usar a eficiência já calculada na tabela (Km/L)
      const eficienciaValida = rows.filter(r => Number(r.eficiencia) > 0);
      const eficienciaMedia = eficienciaValida.length > 0 
        ? eficienciaValida.reduce((sum, r) => sum + Number(r.eficiencia), 0) / eficienciaValida.length
        : 0;
      return { modelo, valor: eficienciaMedia };
    }).sort((a, b) => b.valor - a.valor).slice(0, 5);

    return {
      byEquip,
      byModelo,
      horasPorEquip,
      horasPorModelo,
      combPorEquip,
      equipMaisHoras,
      equipMenosHoras,
      rankingConsumoHora,
      eficienciaPorModelo
    };
  }, [filteredEquipment]);

  const handleFuelPriceUpdate = (price: number) => {
    setFuelPrice(price);
    localStorage.setItem('preco_combustivel', String(price));
  };

  const getTopList = (mapObj: { [key: string]: number }, n: number, suffix: string = '') => {
    return Object.entries(mapObj)
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([k, v]) => ({ key: k, value: v, suffix }));
  };

  const getPercentList = (mapObj: { [key: string]: number }, total: number) => {
    if (total <= 0) return [];
    return Object.entries(mapObj)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => ({
        key: k,
        value: v,
        percentage: (100 * v / total).toFixed(1)
      }));
  };

  return (
    <div className="space-y-6">
      <ReportFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        fuelPrice={fuelPrice}
        onFuelPriceChange={handleFuelPriceUpdate}
      />

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total de Horas"
          value={formatNumber(metrics.totalHoras)}
          suffix="h"
          color="blue"
        />
        <MetricCard
          title="Combustível"
          value={formatNumber(metrics.totalComb)}
          suffix="L"
          color="orange"
        />
        <MetricCard
          title="Média KM/h"
          value={formatNumber(metrics.mediaKmh)}
          color="cyan"
        />
        <MetricCard
          title="Km Totais"
          value={formatNumber(metrics.kmTotais)}
          suffix="km"
          color="teal"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Eficiência Média"
          value={formatNumber(metrics.eficienciaMedia || 0)}
          suffix="h/L"
          color="green"
        />
        <MetricCard
          title="Custo Total"
          value={`R$ ${formatNumber(metrics.custoTotal)}`}
          color="red"
        />
        <MetricCard
          title="Custo por Hora"
          value={`R$ ${formatNumber(metrics.custoHora)}`}
          color="red"
        />
      </div>

      {/* Análises Adicionais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">Horas por Modelo (top 5)</h3>
          <div className="space-y-3">
            {getTopList(additionalMetrics.horasPorModelo, 5, ' h').map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-gray-50 hover:bg-blue-50 transition-colors duration-200">
                <span className="text-gray-700 font-medium">{item.key}</span>
                <span className="font-bold text-blue-600">{formatNumber(item.value)} {item.suffix}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">Mais / Menos Utilizado</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-green-50 border border-green-100">
              <span className="text-sm font-bold text-green-700 uppercase tracking-wide block mb-2">Mais Utilizado</span>
              <div className="text-gray-900 font-semibold text-lg">
                {additionalMetrics.equipMaisHoras?.key ?? '-'}
              </div>
              <span className="text-green-600 font-medium text-sm">
                {formatNumber(additionalMetrics.equipMaisHoras?.value || 0)} h
              </span>
            </div>
            <div className="p-4 rounded-lg bg-red-50 border border-red-100">
              <span className="text-sm font-bold text-red-700 uppercase tracking-wide block mb-2">Menos Utilizado</span>
              <div className="text-gray-900 font-semibold text-lg">
                {additionalMetrics.equipMenosHoras?.key ?? '-'}
              </div>
              <span className="text-red-600 font-medium text-sm">
                {formatNumber(additionalMetrics.equipMenosHoras?.value || 0)} h
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">Ranking Consumo/Hora (L/h)</h3>
          <ol className="space-y-2">
            {additionalMetrics.rankingConsumoHora.map((item, idx) => (
              <li key={idx} className="flex justify-between items-center text-sm p-3 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 transition-colors duration-200">
                <span className="font-semibold text-gray-700">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold mr-2">
                    {idx + 1}
                  </span>
                  {item.equip}
                </span>
                <span className="font-bold text-orange-600">{formatNumber(item.valor)} L/h</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">Eficiência por Modelo (km/L)</h3>
          <ol className="space-y-2">
            {additionalMetrics.eficienciaPorModelo.map((item, idx) => (
              <li key={idx} className="flex justify-between items-center text-sm p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-colors duration-200">
                <span className="font-semibold text-gray-700">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold mr-2">
                    {idx + 1}
                  </span>
                  {item.modelo}
                </span>
                <span className="font-bold text-green-600">{formatNumber(item.valor)} km/L</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">Participação por Equipamento</h3>
          <div className="space-y-5">
            <div>
              <h4 className="text-sm font-bold text-blue-700 mb-3 uppercase tracking-wide">Horas</h4>
              <ul className="space-y-2 text-sm">
                {getPercentList(additionalMetrics.horasPorEquip, metrics.totalHoras).slice(0, 5).map((item, idx) => (
                  <li key={idx} className="flex justify-between items-center p-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors duration-200">
                    <span className="text-gray-700 font-medium">{item.key}</span>
                    <span className="font-bold text-blue-600">{item.percentage}%</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-orange-700 mb-3 uppercase tracking-wide">Combustível</h4>
              <ul className="space-y-2 text-sm">
                {getPercentList(additionalMetrics.combPorEquip, metrics.totalComb).slice(0, 5).map((item, idx) => (
                  <li key={idx} className="flex justify-between items-center p-2 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors duration-200">
                    <span className="text-gray-700 font-medium">{item.key}</span>
                    <span className="font-bold text-orange-600">{item.percentage}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}