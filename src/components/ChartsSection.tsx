import React, { useEffect, useRef } from 'react';
import { BarChart3, TrendingUp, PieChart, Clock, Gauge } from 'lucide-react';
import { Equipment } from '../types/Equipment';
import { totalKmFromRow, groupBy, mapGroupSum } from '../utils/reportUtils';

interface ChartsSectionProps {
  equipment: Equipment[];
}

declare global {
  interface Window {
    Chart: any;
  }
}

export function ChartsSection({ equipment }: ChartsSectionProps) {
  const eficienciaChartRef = useRef<HTMLCanvasElement>(null);
  const combustivelChartRef = useRef<HTMLCanvasElement>(null);
  const horasPorModeloChartRef = useRef<HTMLCanvasElement>(null);
  const consumoHoraChartRef = useRef<HTMLCanvasElement>(null);
  const utilizacaoChartRef = useRef<HTMLCanvasElement>(null);
  const chartsRef = useRef<{
    eficiencia?: any;
    combustivel?: any;
    horasPorModelo?: any;
    consumoHora?: any;
    utilizacao?: any;
  }>({});

  useEffect(() => {
    const loadChartJs = () => {
      if (typeof window.Chart !== 'undefined') {
        renderCharts();
      } else {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js';
        script.onload = () => renderCharts();
        document.head.appendChild(script);
      }
    };

    loadChartJs();

    return () => {
      // Cleanup charts on unmount
      Object.values(chartsRef.current).forEach(chart => {
        if (chart) chart.destroy();
      });
    };
  }, [equipment]);

  const renderCharts = () => {
    if (typeof window.Chart === 'undefined') return;
    if (!eficienciaChartRef.current || !combustivelChartRef.current ||
        !horasPorModeloChartRef.current || !consumoHoraChartRef.current ||
        !utilizacaoChartRef.current) return;

    // Destroy existing charts
    Object.values(chartsRef.current).forEach(chart => {
      if (chart) chart.destroy();
    });

    const labels = equipment.map(r => r.equipamento || '—');
    const eficiencia = equipment.map(r => {
      const km = totalKmFromRow(r);
      return r.combustivel > 0 ? km / r.combustivel : (Number(r.eficiencia) || 0);
    });
    const combustivel = equipment.map(r => Number(r.combustivel) || 0);

    // Efficiency Chart
    const ctxE = eficienciaChartRef.current.getContext('2d');
    chartsRef.current.eficiencia = new window.Chart(ctxE, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Eficiência (km/L)',
          data: eficiencia,
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 2,
          borderRadius: 8,
          hoverBackgroundColor: 'rgba(34, 197, 94, 1)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              font: {
                size: 13,
                weight: '500'
              },
              padding: 15,
              color: '#374151'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: {
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              size: 13
            },
            borderColor: 'rgba(34, 197, 94, 0.5)',
            borderWidth: 1,
            displayColors: true,
            callbacks: {
              label: function(context: any) {
                return ' ' + context.dataset.label + ': ' + context.parsed.y.toFixed(2) + ' km/L';
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 12
              },
              color: '#6b7280'
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              font: {
                size: 12
              },
              color: '#6b7280'
            },
            title: {
              display: true,
              text: 'Eficiência (km/L)',
              font: {
                size: 13,
                weight: '600'
              },
              color: '#374151'
            }
          }
        }
      }
    });

    // Fuel Consumption Chart
    const ctxC = combustivelChartRef.current.getContext('2d');
    chartsRef.current.combustivel = new window.Chart(ctxC, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Combustível (L)',
          data: combustivel,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointBackgroundColor: 'rgb(59, 130, 246)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointHoverBackgroundColor: 'rgb(37, 99, 235)',
          pointHoverBorderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              font: {
                size: 13,
                weight: '500'
              },
              padding: 15,
              color: '#374151'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: {
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              size: 13
            },
            borderColor: 'rgba(59, 130, 246, 0.5)',
            borderWidth: 1,
            displayColors: true,
            callbacks: {
              label: function(context: any) {
                return ' ' + context.dataset.label + ': ' + context.parsed.y.toFixed(2) + ' L';
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 12
              },
              color: '#6b7280'
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              font: {
                size: 12
              },
              color: '#6b7280'
            },
            title: {
              display: true,
              text: 'Consumo (Litros)',
              font: {
                size: 13,
                weight: '600'
              },
              color: '#374151'
            }
          }
        }
      }
    });

    // Horas por Modelo Chart (Doughnut)
    const byModelo = groupBy(equipment, r => r.modelo);
    const horasPorModelo = mapGroupSum(byModelo, 'trabalhadas');
    const modeloLabels = Object.keys(horasPorModelo);
    const modeloData = Object.values(horasPorModelo);
    const modeloColors = [
      'rgba(59, 130, 246, 0.8)',
      'rgba(16, 185, 129, 0.8)',
      'rgba(251, 146, 60, 0.8)',
      'rgba(236, 72, 153, 0.8)',
      'rgba(139, 92, 246, 0.8)',
      'rgba(234, 179, 8, 0.8)',
      'rgba(239, 68, 68, 0.8)',
      'rgba(6, 182, 212, 0.8)'
    ];

    const ctxModelo = horasPorModeloChartRef.current.getContext('2d');
    chartsRef.current.horasPorModelo = new window.Chart(ctxModelo, {
      type: 'doughnut',
      data: {
        labels: modeloLabels,
        datasets: [{
          label: 'Horas Trabalhadas',
          data: modeloData,
          backgroundColor: modeloColors.slice(0, modeloLabels.length),
          borderColor: '#fff',
          borderWidth: 3,
          hoverOffset: 15
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              font: {
                size: 12,
                weight: '500'
              },
              padding: 15,
              color: '#374151',
              generateLabels: function(chart: any) {
                const data = chart.data;
                if (data.labels.length && data.datasets.length) {
                  const total = data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
                  return data.labels.map((label: string, i: number) => {
                    const value = data.datasets[0].data[i];
                    const percentage = ((value / total) * 100).toFixed(1);
                    return {
                      text: `${label}: ${value.toFixed(1)}h (${percentage}%)`,
                      fillStyle: data.datasets[0].backgroundColor[i],
                      hidden: false,
                      index: i
                    };
                  });
                }
                return [];
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: {
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              size: 13
            },
            callbacks: {
              label: function(context: any) {
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = ((context.parsed / total) * 100).toFixed(1);
                return ` ${context.parsed.toFixed(1)} h (${percentage}%)`;
              }
            }
          }
        }
      }
    });

    // Consumo por Hora (Bar Horizontal)
    const consumoHora = equipment.map(r => {
      const horas = Number(r.trabalhadas) || 0;
      const comb = Number(r.combustivel) || 0;
      return horas > 0 ? comb / horas : 0;
    }).filter((v, i, arr) => {
      // Pegar top 10
      const sorted = [...arr].sort((a, b) => b - a);
      return arr[i] >= sorted[9];
    });
    const consumoHoraLabels = equipment.filter((r, i) => {
      const horas = Number(r.trabalhadas) || 0;
      const comb = Number(r.combustivel) || 0;
      const val = horas > 0 ? comb / horas : 0;
      return consumoHora.includes(val);
    }).map(r => r.equipamento || '—').slice(0, 10);

    const ctxConsumo = consumoHoraChartRef.current.getContext('2d');
    chartsRef.current.consumoHora = new window.Chart(ctxConsumo, {
      type: 'bar',
      data: {
        labels: consumoHoraLabels,
        datasets: [{
          label: 'Consumo (L/h)',
          data: consumoHora.slice(0, 10),
          backgroundColor: 'rgba(251, 146, 60, 0.8)',
          borderColor: 'rgb(251, 146, 60)',
          borderWidth: 2,
          borderRadius: 8,
          hoverBackgroundColor: 'rgba(251, 146, 60, 1)'
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              font: {
                size: 13,
                weight: '500'
              },
              padding: 15,
              color: '#374151'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            callbacks: {
              label: function(context: any) {
                return ' ' + context.parsed.x.toFixed(2) + ' L/h';
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              font: {
                size: 12
              },
              color: '#6b7280'
            },
            title: {
              display: true,
              text: 'Litros por Hora',
              font: {
                size: 13,
                weight: '600'
              },
              color: '#374151'
            }
          },
          y: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 11
              },
              color: '#6b7280'
            }
          }
        }
      }
    });

    // Taxa de Utilização (Radar)
    const byEquip = groupBy(equipment, r => r.equipamento);
    const equipNames = Object.keys(byEquip).slice(0, 8);
    const horasData = equipNames.map(name => {
      const total = byEquip[name].reduce((sum, r) => sum + (Number(r.trabalhadas) || 0), 0);
      return total;
    });
    const combData = equipNames.map(name => {
      const total = byEquip[name].reduce((sum, r) => sum + (Number(r.combustivel) || 0), 0);
      return total;
    });

    const ctxUtilizacao = utilizacaoChartRef.current.getContext('2d');
    chartsRef.current.utilizacao = new window.Chart(ctxUtilizacao, {
      type: 'radar',
      data: {
        labels: equipNames,
        datasets: [
          {
            label: 'Horas Trabalhadas',
            data: horasData,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderWidth: 2,
            pointBackgroundColor: 'rgb(59, 130, 246)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: 'Combustível (L)',
            data: combData,
            borderColor: 'rgb(251, 146, 60)',
            backgroundColor: 'rgba(251, 146, 60, 0.2)',
            borderWidth: 2,
            pointBackgroundColor: 'rgb(251, 146, 60)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              font: {
                size: 13,
                weight: '500'
              },
              padding: 15,
              color: '#374151'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12
          }
        },
        scales: {
          r: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            },
            angleLines: {
              color: 'rgba(0, 0, 0, 0.1)'
            },
            pointLabels: {
              font: {
                size: 11
              },
              color: '#374151'
            },
            ticks: {
              font: {
                size: 10
              },
              color: '#6b7280',
              backdropColor: 'transparent'
            }
          }
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Row 1: Eficiência e Consumo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <BarChart3 className="text-white" size={20} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Eficiência por Equipamento</h3>
            </div>
          </div>
          <div className="p-6">
            <canvas
              ref={eficienciaChartRef}
              className="w-full"
              style={{ height: '350px' }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-blue-50 to-sky-50 px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <TrendingUp className="text-white" size={20} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Consumo de Combustível</h3>
            </div>
          </div>
          <div className="p-6">
            <canvas
              ref={combustivelChartRef}
              className="w-full"
              style={{ height: '350px' }}
            />
          </div>
        </div>
      </div>

      {/* Row 2: Horas por Modelo e Consumo/Hora */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-violet-50 to-purple-50 px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-500 rounded-lg">
                <PieChart className="text-white" size={20} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Distribuição de Horas por Modelo</h3>
            </div>
          </div>
          <div className="p-6">
            <canvas
              ref={horasPorModeloChartRef}
              className="w-full"
              style={{ height: '350px' }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500 rounded-lg">
                <Gauge className="text-white" size={20} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Top 10 - Consumo por Hora</h3>
            </div>
          </div>
          <div className="p-6">
            <canvas
              ref={consumoHoraChartRef}
              className="w-full"
              style={{ height: '350px' }}
            />
          </div>
        </div>
      </div>

      {/* Row 3: Radar de Utilização */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-cyan-50 to-teal-50 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500 rounded-lg">
              <Clock className="text-white" size={20} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Análise Comparativa de Utilização</h3>
          </div>
        </div>
        <div className="p-6">
          <canvas
            ref={utilizacaoChartRef}
            className="w-full"
            style={{ height: '450px' }}
          />
        </div>
      </div>
    </div>
  );
}