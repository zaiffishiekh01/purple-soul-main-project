import { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useStorefrontFilters } from '../hooks/useStorefrontFilters';

interface StorefrontFiltersProps {
  categoryId?: string | null;
  selectedFilters: string[];
  onFilterChange: (filters: string[]) => void;
}

export function StorefrontFilters({ categoryId, selectedFilters, onFilterChange }: StorefrontFiltersProps) {
  const { facets, loading, error } = useStorefrontFilters(categoryId);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const handleToggleFilter = (facetValueId: string) => {
    if (selectedFilters.includes(facetValueId)) {
      onFilterChange(selectedFilters.filter(id => id !== facetValueId));
    } else {
      onFilterChange([...selectedFilters, facetValueId]);
    }
  };

  const handleClearAll = () => {
    onFilterChange([]);
  };

  const getSelectedCount = () => {
    return selectedFilters.length;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
        </div>
        <p className="text-sm text-red-600">Failed to load filters</p>
      </div>
    );
  }

  if (facets.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
          {getSelectedCount() > 0 && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
              {getSelectedCount()}
            </span>
          )}
        </div>
        {getSelectedCount() > 0 && (
          <button
            onClick={handleClearAll}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="divide-y divide-gray-200">
        {facets.map(group => {
          const isExpanded = expandedGroups.has(group.id) || selectedFilters.some(id =>
            group.values.some(v => v.id === id)
          );
          const selectedInGroup = group.values.filter(v => selectedFilters.includes(v.id)).length;

          return (
            <div key={group.id} className="p-4">
              <button
                onClick={() => toggleGroup(group.id)}
                className="w-full flex items-center justify-between text-left mb-3"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{group.name}</span>
                  {selectedInGroup > 0 && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                      {selectedInGroup}
                    </span>
                  )}
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {isExpanded && (
                <div className="space-y-2">
                  {group.values.length === 0 ? (
                    <p className="text-sm text-gray-500">No options available</p>
                  ) : (
                    group.values.map(value => (
                      <label
                        key={value.id}
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedFilters.includes(value.id)}
                          onChange={() => handleToggleFilter(value.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{value.name}</span>
                      </label>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
