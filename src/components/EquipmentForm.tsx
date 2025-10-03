import React, { useState, useEffect } from 'react';
import { Equipment } from '../types/Equipment';
import { cryptoRandomId, parseFloatValue } from '../utils/csvUtils';

interface EquipmentFormProps {
  equipment?: Equipment;
  onSave: (equipment: Equipment) => void;
  onCancel: () => void;
}

export function EquipmentForm({ equipment, onSave, onCancel }: EquipmentFormProps) {
  const [formData, setFormData] = useState<Partial<Equipment>>({
    equipamento: '',
    modelo: '',
    unidade: '',
    kmh: 0,
    combustivel: 0,
    eficiencia: '',
    data: ''
  });

  useEffect(() => {
    if (equipment) {
      setFormData(equipment);
    }
  }, [equipment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newEquipment: Equipment = {
      id: equipment?.id || cryptoRandomId(),
      equipamento: formData.equipamento || '',
      modelo: formData.modelo || '',
      unidade: formData.unidade || '',
      kmh: Number(formData.kmh) || 0,
      trabalhadas: 0, // Mantendo compatibilidade com sistema original
      combustivel: Number(formData.combustivel) || 0,
      eficiencia: formData.eficiencia === '' ? '' : Number(formData.eficiencia) || 0,
      data: formData.data || ''
    };

    onSave(newEquipment);
    
    if (!equipment) {
      setFormData({
        equipamento: '',
        modelo: '',
        unidade: '',
        kmh: 0,
        combustivel: 0,
        eficiencia: '',
        data: ''
      });
    }
  };

  const handleChange = (field: keyof Equipment, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Auto-cálculo de eficiência
    if (field === 'kmh' || field === 'combustivel') {
      const kmh = field === 'kmh' ? Number(value) : Number(formData.kmh);
      const combustivel = field === 'combustivel' ? Number(value) : Number(formData.combustivel);
      
      // Por agora, deixamos o cálculo manual já que não temos horas trabalhadas
      // O usuário pode inserir a eficiência manualmente
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {equipment ? 'Editar Equipamento' : 'Novo Equipamento'}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Equipamento *
          </label>
          <input
            type="text"
            required
            value={formData.equipamento || ''}
            onChange={(e) => handleChange('equipamento', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Modelo *
          </label>
          <input
            type="text"
            required
            value={formData.modelo || ''}
            onChange={(e) => handleChange('modelo', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unidade *
          </label>
          <input
            type="text"
            required
            value={formData.unidade || ''}
            onChange={(e) => handleChange('unidade', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            KM/h *
          </label>
          <input
            type="number"
            step="0.01"
            required
            value={formData.kmh || ''}
            onChange={(e) => handleChange('kmh', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Combustível Consumido (L) *
          </label>
          <input
            type="number"
            step="0.01"
            required
            value={formData.combustivel || ''}
            onChange={(e) => handleChange('combustivel', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Km/l / L/h
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.eficiencia || ''}
            onChange={(e) => handleChange('eficiencia', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="md:col-span-2 lg:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data (opcional)
          </label>
          <input
            type="date"
            value={formData.data || ''}
            onChange={(e) => handleChange('data', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {equipment ? 'Atualizar' : 'Salvar'}
        </button>
      </div>
    </form>
  );
}