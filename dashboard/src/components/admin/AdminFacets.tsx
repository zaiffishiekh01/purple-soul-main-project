import { useState } from 'react';
import { Filter } from 'lucide-react';
import { AdminFacetGroups } from './AdminFacetGroups';
import { AdminFacetValues } from './AdminFacetValues';
import { AdminCategoryFacets } from './AdminCategoryFacets';

type TabType = 'groups' | 'values' | 'mappings';

export function AdminFacets() {
  const [activeTab, setActiveTab] = useState<TabType>('groups');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Filter className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Facet & Filter Management</h1>
          <p className="text-gray-600 mt-1">Manage storefront filters and product attributes</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('groups')}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
              activeTab === 'groups'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Facet Groups
          </button>
          <button
            onClick={() => setActiveTab('values')}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
              activeTab === 'values'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Facet Values
          </button>
          <button
            onClick={() => setActiveTab('mappings')}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
              activeTab === 'mappings'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Category Mappings
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'groups' && <AdminFacetGroups />}
          {activeTab === 'values' && <AdminFacetValues />}
          {activeTab === 'mappings' && <AdminCategoryFacets />}
        </div>
      </div>
    </div>
  );
}
