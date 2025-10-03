import React from 'react';
import { Database, BarChart3, FileText } from 'lucide-react';

type TabType = 'base' | 'reports' | 'charts';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs = [
  { id: 'base' as TabType, label: 'Base de Dados', icon: Database },
  { id: 'reports' as TabType, label: 'Relatórios', icon: FileText },
  { id: 'charts' as TabType, label: 'Gráficos', icon: BarChart3 }
];

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <nav className="border-b border-gray-200 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex space-x-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors
                  ${isActive
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon size={18} className="mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}