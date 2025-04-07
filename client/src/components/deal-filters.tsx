import React, { useState } from 'react';
import { DealFilter } from '../../../shared/schema';

interface DealFiltersProps {
  onFilterChange: (filters: DealFilter) => void;
  sources: string[];
  themes: string[];
}

export const DealFilters: React.FC<DealFiltersProps> = ({ onFilterChange, sources, themes }) => {
  const [filters, setFilters] = useState<DealFilter>({
    profitability: 'all',
    source: 'all',
    theme: 'all',
    priceRange: 'all',
    sortBy: 'profit-desc',
    page: 1,
    limit: 8
  });

  const handleChange = (key: keyof DealFilter, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4 bg-white rounded-lg shadow-sm">
      <div className="filter-group flex flex-col">
        <label className="text-sm font-medium text-gray-700 mb-1">Source</label>
        <select 
          value={filters.source} 
          onChange={(e) => handleChange('source', e.target.value)}
          className="form-select w-full rounded-md border-gray-300 shadow-sm focus:border-lego-blue focus:ring focus:ring-lego-blue focus:ring-opacity-50"
        >
          <option value="all">All Sources</option>
          {sources.map(source => (
            <option key={source} value={source}>{source}</option>
          ))}
        </select>
      </div>

      <div className="filter-group flex flex-col">
        <label className="text-sm font-medium text-gray-700 mb-1">Theme</label>
        <select 
          value={filters.theme} 
          onChange={(e) => handleChange('theme', e.target.value)}
          className="form-select w-full rounded-md border-gray-300 shadow-sm focus:border-lego-blue focus:ring focus:ring-lego-blue focus:ring-opacity-50"
        >
          <option value="all">All Themes</option>
          {themes.map(theme => (
            <option key={theme} value={theme}>{theme}</option>
          ))}
        </select>
      </div>

      <div className="filter-group flex flex-col">
        <label className="text-sm font-medium text-gray-700 mb-1">Price Range</label>
        <select 
          value={filters.priceRange} 
          onChange={(e) => handleChange('priceRange', e.target.value)}
          className="form-select w-full rounded-md border-gray-300 shadow-sm focus:border-lego-blue focus:ring focus:ring-lego-blue focus:ring-opacity-50"
        >
          <option value="all">All Prices</option>
          <option value="0-50">€0 - €50</option>
          <option value="50-100">€50 - €100</option>
          <option value="100-200">€100 - €200</option>
          <option value="200+">€200+</option>
        </select>
      </div>

      <div className="filter-group flex flex-col">
        <label className="text-sm font-medium text-gray-700 mb-1">Sort By</label>
        <select 
          value={filters.sortBy} 
          onChange={(e) => handleChange('sortBy', e.target.value)}
          className="form-select w-full rounded-md border-gray-300 shadow-sm focus:border-lego-blue focus:ring focus:ring-lego-blue focus:ring-opacity-50"
        >
          <option value="profit-desc">Profit (High to Low)</option>
          <option value="profit-asc">Profit (Low to High)</option>
          <option value="discount-desc">Discount (High to Low)</option>
          <option value="price-asc">Price (Low to High)</option>
          <option value="price-desc">Price (High to Low)</option>
        </select>
      </div>

      <div className="filter-group flex flex-col">
        <label className="text-sm font-medium text-gray-700 mb-1">Profitability</label>
        <select 
          value={filters.profitability} 
          onChange={(e) => handleChange('profitability', e.target.value)}
          className="form-select w-full rounded-md border-gray-300 shadow-sm focus:border-lego-blue focus:ring focus:ring-lego-blue focus:ring-opacity-50"
        >
          <option value="all">All Deals</option>
          <option value="profitable">Profitable Only</option>
          <option value="not-profitable">Not Profitable</option>
        </select>
      </div>
    </div>
  );
}; 