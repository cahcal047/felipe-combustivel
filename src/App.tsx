import React, { useState } from 'react';
import { Cog } from 'lucide-react';
import { Equipment } from './types/Equipment';
import { useEquipmentStorage } from './hooks/useEquipmentStorage';
import { TabNavigation } from './components/TabNavigation';
import { EquipmentForm } from './components/EquipmentForm';
import { EquipmentTable } from './components/EquipmentTable';
import { ReportsSection } from './components/ReportsSection';
import { ChartsSection } from './components/ChartsSection';
import { CSVManager } from './components/CSVManager';

type TabType = 'base' | 'reports' | 'charts';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('base');
  const [editingEquipment, setEditingEquipment] = useState<Equipment | undefined>();
  const [showForm, setShowForm] = useState(false);

  const {
    equipment,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    importFromCSV
  } = useEquipmentStorage();

  const handleSave = (equipmentData: Equipment) => {
    if (editingEquipment) {
      updateEquipment(equipmentData);
    } else {
      addEquipment(equipmentData);
    }
    handleCancelEdit();
  };

  const handleEdit = (equipmentData: Equipment) => {
    setEditingEquipment(equipmentData);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este equipamento?')) {
      deleteEquipment(id);
    }
  };

  const handleCancelEdit = () => {
    setEditingEquipment(undefined);
    setShowForm(false);
  };

  const handleNewEquipment = () => {
    setEditingEquipment(undefined);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <Cog className="text-white" size={28} />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 ml-4">
                Sistema de Gestão de Equipamentos
              </h1>
            </div>
          </div>
        </div>
      </header>

      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'base' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Base de Dados</h2>
              <div className="flex items-center space-x-4">
                <CSVManager equipment={equipment} onImport={importFromCSV} />
                <button
                  onClick={handleNewEquipment}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Novo Equipamento
                </button>
              </div>
            </div>

            {showForm && (
              <EquipmentForm
                equipment={editingEquipment}
                onSave={handleSave}
                onCancel={handleCancelEdit}
              />
            )}

            <EquipmentTable
              equipment={equipment}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900">Relatórios</h2>
            </div>
            <ReportsSection equipment={equipment} />
          </div>
        )}

        {activeTab === 'charts' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900">Análise Gráfica</h2>
            </div>
            {equipment.length > 0 ? (
              <ChartsSection equipment={equipment} />
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-100">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Cog className="text-gray-400" size={32} />
                  </div>
                  <p className="text-gray-600 text-lg font-semibold mb-2">Não há dados suficientes para gerar gráficos.</p>
                  <p className="text-sm text-gray-500">Adicione equipamentos na aba "Base de Dados" primeiro.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;