import { useState, useEffect, useRef } from 'react';
import { Search, Clock, TrendingUp, X } from 'lucide-react';
import { mockProducts } from '../data/products';

interface SearchAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  searchHistory: string[];
}

export default function SearchAutocomplete({
  value,
  onChange,
  searchHistory,
}: SearchAutocompleteProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.trim()) {
      const productSuggestions = mockProducts
        .filter(p =>
          p.name.toLowerCase().includes(value.toLowerCase()) ||
          p.tags.some(tag => tag.toLowerCase().includes(value.toLowerCase()))
        )
        .slice(0, 5)
        .map(p => p.name);

      const categorySuggestions = Array.from(
        new Set(
          mockProducts
            .filter(p => p.category.toLowerCase().includes(value.toLowerCase()))
            .map(p => p.category)
        )
      ).slice(0, 2);

      setSuggestions([...new Set([...productSuggestions, ...categorySuggestions])]);
    } else {
      setSuggestions([]);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const trendingSearches = ['Prayer Beads', 'Wall Art', 'Blessing Plates', 'Meditation Items', 'Sacred Jewelry', 'Holy Land Gifts'];

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-5 h-5 z-10" />
      <input
        ref={inputRef}
        type="text"
        placeholder="Search for products..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setShowSuggestions(true)}
        className="w-full pl-10 pr-10 py-2 border-2 border-default rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-secondary z-10"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {showSuggestions && (
        <div
          ref={dropdownRef}
          className="absolute top-full mt-2 w-full bg-surface rounded-xl shadow-theme-xl border border-default py-2 z-50 max-h-96 overflow-y-auto"
        >
          {value.trim() && suggestions.length > 0 && (
            <div className="px-2">
              <p className="text-xs font-semibold text-muted uppercase px-3 py-2">
                Suggestions
              </p>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-3 py-2 hover:bg-surface-deep rounded-lg flex items-center gap-3 transition-colors"
                >
                  <Search className="w-4 h-4 text-muted" />
                  <span className="text-primary">{suggestion}</span>
                </button>
              ))}
            </div>
          )}

          {!value.trim() && searchHistory.length > 0 && (
            <div className="px-2">
              <p className="text-xs font-semibold text-muted uppercase px-3 py-2">
                Recent Searches
              </p>
              {searchHistory.slice(0, 5).map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(item)}
                  className="w-full text-left px-3 py-2 hover:bg-surface-deep rounded-lg flex items-center gap-3 transition-colors"
                >
                  <Clock className="w-4 h-4 text-muted" />
                  <span className="text-secondary">{item}</span>
                </button>
              ))}
            </div>
          )}

          {!value.trim() && (
            <div className="px-2 mt-2 border-t pt-2">
              <p className="text-xs font-semibold text-muted uppercase px-3 py-2">
                Trending Now
              </p>
              {trendingSearches.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(item)}
                  className="w-full text-left px-3 py-2 hover:bg-surface-deep rounded-lg flex items-center gap-3 transition-colors"
                >
                  <TrendingUp className="w-4 h-4 text-red-500" />
                  <span className="text-secondary">{item}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
