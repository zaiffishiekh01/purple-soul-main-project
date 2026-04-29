import { useProductFacets } from '../hooks/useProductFacets';

interface ProductFacetSelectorProps {
  categoryId: string | null;
  selectedFacets: string[];
  onChange: (facets: string[]) => void;
}

export function ProductFacetSelector({ categoryId, selectedFacets, onChange }: ProductFacetSelectorProps) {
  const { facetGroups, facetValues, loading, error } = useProductFacets(categoryId);

  const handleToggleFacet = (facetValueId: string) => {
    if (selectedFacets.includes(facetValueId)) {
      onChange(selectedFacets.filter(id => id !== facetValueId));
    } else {
      onChange([...selectedFacets, facetValueId]);
    }
  };

  if (!categoryId) {
    return (
      <div className="bg-gray-50 p-6 rounded-xl">
        <p className="text-sm text-gray-600">Select a category first to see applicable filters</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gray-50 p-6 rounded-xl">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-xl">
        <p className="text-sm text-red-700">Failed to load facets: {error.message}</p>
      </div>
    );
  }

  if (facetGroups.length === 0) {
    return (
      <div className="bg-gray-50 p-6 rounded-xl">
        <p className="text-sm text-gray-600">No facets configured for this category</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-6 rounded-xl space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Product Attributes & Filters</h3>
        <p className="text-sm text-gray-600">Select applicable attributes for your product (used for storefront filtering)</p>
      </div>

      {facetGroups.map(group => {
        const values = facetValues[group.id] || [];

        return (
          <div key={group.id} className="space-y-3">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-gray-900">{group.name}</h4>
              {group.is_required && (
                <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded">Required</span>
              )}
            </div>

            {values.length === 0 ? (
              <p className="text-sm text-gray-500">No values available</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {values.map(value => (
                  <label
                    key={value.id}
                    className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedFacets.includes(value.id)
                        ? 'bg-blue-50 border-blue-500 text-blue-900'
                        : 'bg-white border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedFacets.includes(value.id)}
                      onChange={() => handleToggleFacet(value.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium">{value.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
