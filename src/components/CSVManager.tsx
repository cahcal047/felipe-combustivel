import React, { useRef } from 'react';
import { Download, Upload } from 'lucide-react';
import { Equipment } from '../types/Equipment';
import { toCSV, fromCSV, downloadFile } from '../utils/csvUtils';

interface CSVManagerProps {
  equipment: Equipment[];
  onImport: (equipment: Equipment[]) => void;
}

export function CSVManager({ equipment, onImport }: CSVManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const csv = toCSV(equipment);
    downloadFile('equipamentos.csv', csv, 'text/csv');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvContent = e.target?.result as string;
        const parsed = fromCSV(csvContent);
        onImport(parsed);
      } catch (err) {
        alert('Erro ao importar CSV: ' + (err as Error).message);
      }
    };
    reader.readAsText(file);

    // Reset input to allow importing the same file again
    event.target.value = '';
  };

  return (
    <div className="flex space-x-3">
      <button
        onClick={handleExport}
        disabled={equipment.length === 0}
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Download size={16} className="mr-2" />
        Exportar CSV
      </button>
      
      <button
        onClick={handleImportClick}
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <Upload size={16} className="mr-2" />
        Importar CSV
      </button>
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}