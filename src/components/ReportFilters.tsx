import React from 'react';
import { Filter, X } from 'lucide-react';
import { ReportFilters } from '../types/Equipment';

interface ReportFiltersProps {
  filters: ReportFilters;
  onFiltersChange: (filters: ReportFilters) => void;
  fuelPrice: number;
  onFuelPriceChange: (price: number) => void;
}

export function ReportFiltersComponent({ 
  filters, 
  onFiltersChange, 
  fuelPrice, 
  onFuelPriceChange 
}: ReportFiltersProps) {
  const handleFilterChange = (field: keyof ReportFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [field]: value || undefined
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center mb-4">
        <Filter size={20} className="text-gray-500 mr-2" />
        <h3 className="text-lg font-medium text-gray-900">Filtros e Configurações</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data De
          </label>
          <input
            type="date"
            value={filters.de || ''}
            onChange={(e) => handleFilterChange('de', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data Até
          </label>
          <input
            type="date"
            value={filters.ate || ''}
            onChange={(e) => handleFilterChange('ate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Modelo
          </label>
          <input
            type="text"
            placeholder="ex.: Ch570"
            value={filters.modelo || ''}
            onChange={(e) => handleFilterChange('modelo', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Equipamento
          </label>
          <input
            type="text"
            placeholder="ex.: 104119"
            value={filters.equipamento || ''}
            onChange={(e) => handleFilterChange('equipamento', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="flex items-end space-x-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preço do Combustível (R$/L)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={fuelPrice || ''}
              onChange={(e) => onFuelPriceChange(parseFloat(e.target.value) || 0)}
              className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <button
          onClick={clearFilters}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <X size={16} className="mr-1" />
          Limpar Filtros
        </button>
      </div>
    </div>
  );
}