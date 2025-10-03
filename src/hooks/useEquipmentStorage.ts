import { useState, useEffect } from 'react';
import { Equipment } from '../types/Equipment';

const STORAGE_KEY = 'equipamentos.base.v1';

export function useEquipmentStorage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);

  useEffect(() => {
    loadState();
  }, []);

  const loadState = (): void => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setEquipment([]);
        return;
      }
      const parsed = JSON.parse(raw);
      setEquipment(Array.isArray(parsed) ? parsed : []);
    } catch {
      setEquipment([]);
    }
  };

  const saveState = (newEquipment: Equipment[]): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newEquipment));
    setEquipment(newEquipment);
  };

  const addEquipment = (newEquip: Equipment): void => {
    const updated = [...equipment, newEquip];
    saveState(updated);
  };

  const updateEquipment = (updatedEquip: Equipment): void => {
    const updated = equipment.map(e => e.id === updatedEquip.id ? updatedEquip : e);
    saveState(updated);
  };

  const deleteEquipment = (id: string): void => {
    const updated = equipment.filter(e => e.id !== id);
    saveState(updated);
  };

  const importFromCSV = (csvData: Equipment[]): void => {
    saveState(csvData);
  };

  return {
    equipment,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    importFromCSV,
    loadState
  };
}