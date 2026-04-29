'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';

interface SearchFiltersProps {
  onFilterChange: (filters: SearchFilters) => void;
  initialFilters?: SearchFilters;
  categorySlug?: string;
}

export interface SearchFilters {
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  traditions: string[];
  materials: string[];
}

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface DynamicFacet {
  id: string;
  name: string;
  type: string;
  options?: FilterOption[];
  min?: number;
  max?: number;
}

export function SearchFilters({ onFilterChange, initialFilters, categorySlug }: SearchFiltersProps) {
  const [facets, setFacets] = useState<DynamicFacet[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    initialFilters?.minPrice || 0,
    initialFilters?.maxPrice || 500
  ]);
  const [selectedTraditions, setSelectedTraditions] = useState<string[]>(
    initialFilters?.traditions || []
  );
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>(
    initialFilters?.materials || []
  );

  useEffect(() => {
    if (categorySlug) {
      loadFacets();
    }
  }, [categorySlug]);

  async function loadFacets() {
    if (!categorySlug) return;

    try {
      const response = await fetch(`/api/catalog/facets?category=${categorySlug}`, {
        cache: 'no-store',
      });
      if (response.ok) {
        const data = await response.json();
        setFacets(data);

        const priceFacet = data.find((f: DynamicFacet) => f.id === 'price');
        if (priceFacet && priceFacet.min !== undefined && priceFacet.max !== undefined) {
          setPriceRange([priceFacet.min, priceFacet.max]);
        }
      }
    } catch (error) {
      console.error('Error loading facets:', error);
    }
  }

  const traditionFacet = facets.find(f => f.id === 'tradition_alignment' || f.id === 'traditions');
  const materialsFacet = facets.find(f => f.id === 'materials');
  const traditions = traditionFacet?.options || [];
  const materials = materialsFacet?.options || [];

  const handleTraditionToggle = (tradition: string) => {
    const updated = selectedTraditions.includes(tradition)
      ? selectedTraditions.filter(t => t !== tradition)
      : [...selectedTraditions, tradition];
    setSelectedTraditions(updated);
    applyFilters(updated, selectedMaterials, priceRange);
  };

  const handleMaterialToggle = (material: string) => {
    const updated = selectedMaterials.includes(material)
      ? selectedMaterials.filter(m => m !== material)
      : [...selectedMaterials, material];
    setSelectedMaterials(updated);
    applyFilters(selectedTraditions, updated, priceRange);
  };

  const handlePriceChange = (value: number[]) => {
    const range: [number, number] = [value[0], value[1]];
    setPriceRange(range);
  };

  const applyPriceFilter = () => {
    applyFilters(selectedTraditions, selectedMaterials, priceRange);
  };

  const applyFilters = (traditions: string[], materials: string[], price: [number, number]) => {
    onFilterChange({
      minPrice: price[0],
      maxPrice: price[1],
      traditions,
      materials
    });
  };

  const clearAllFilters = () => {
    const priceFacet = facets.find(f => f.id === 'price');
    const defaultMin = priceFacet?.min || 0;
    const defaultMax = priceFacet?.max || 500;

    setPriceRange([defaultMin, defaultMax]);
    setSelectedTraditions([]);
    setSelectedMaterials([]);
    onFilterChange({
      traditions: [],
      materials: []
    });
  };

  const hasActiveFilters = selectedTraditions.length > 0 ||
                          selectedMaterials.length > 0 ||
                          (facets.find(f => f.id === 'price') ?
                            (priceRange[0] > (facets.find(f => f.id === 'price')?.min || 0) ||
                             priceRange[1] < (facets.find(f => f.id === 'price')?.max || 500)) :
                            false);

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Filters</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {facets.find(f => f.id === 'price') && (
          <div>
            <Label className="text-base font-medium mb-3 block">Price Range</Label>
            <Slider
              value={priceRange}
              onValueChange={handlePriceChange}
              max={facets.find(f => f.id === 'price')?.max || 500}
              min={facets.find(f => f.id === 'price')?.min || 0}
              step={10}
              className="mb-3"
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={applyPriceFilter}
              className="w-full mt-2"
            >
              Apply Price Filter
            </Button>
          </div>
        )}

        {traditions.length > 0 && (
          <div>
            <Label className="text-base font-medium mb-3 block">
              {traditionFacet?.name || 'Tradition'}
            </Label>
            <div className="space-y-2">
              {traditions.map(tradition => (
                <div key={tradition.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`tradition-${tradition.value}`}
                    checked={selectedTraditions.includes(tradition.value)}
                    onCheckedChange={() => handleTraditionToggle(tradition.value)}
                  />
                  <label
                    htmlFor={`tradition-${tradition.value}`}
                    className="text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {tradition.label}
                    {tradition.count !== undefined && (
                      <span className="text-muted-foreground ml-1">({tradition.count})</span>
                    )}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {materials.length > 0 && (
          <div>
            <Label className="text-base font-medium mb-3 block">
              {materialsFacet?.name || 'Materials'}
            </Label>
            <div className="space-y-2">
              {materials.map(material => (
                <div key={material.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`material-${material.value}`}
                    checked={selectedMaterials.includes(material.value)}
                    onCheckedChange={() => handleMaterialToggle(material.value)}
                  />
                  <label
                    htmlFor={`material-${material.value}`}
                    className="text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {material.label}
                    {material.count !== undefined && (
                      <span className="text-muted-foreground ml-1">({material.count})</span>
                    )}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {facets.length === 0 && categorySlug && (
          <div className="text-center text-sm text-muted-foreground py-4">
            Loading filters...
          </div>
        )}
      </div>
    </Card>
  );
}
