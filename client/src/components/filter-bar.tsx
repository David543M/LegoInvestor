import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { DealFilter } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

interface FilterBarProps {
  filters: DealFilter;
  onFilterChange: (filters: DealFilter) => void;
  onSearch: (query: string) => void;
}

export default function FilterBar({ filters, onFilterChange, onSearch }: FilterBarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch themes for filter
  const { data: themes = [] } = useQuery({
    queryKey: ["/api/themes"],
    queryFn: () => fetch("/api/themes").then(res => res.json()),
  });

  // Fetch sources for filter
  const { data: sources = [] } = useQuery({
    queryKey: ["/api/sources"],
    queryFn: () => fetch("/api/sources").then(res => res.json()),
  });

  const handleFilterChange = (key: string, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch(searchQuery);
    }
  };

  // Update search query when filters.search changes
  useEffect(() => {
    setSearchQuery(filters.search || "");
  }, [filters.search]);

  return (
    <div className="bg-white shadow-sm rounded-lg mt-6 p-4">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Profitability Filter */}
        <div>
          <Label htmlFor="profitability" className="block text-sm font-medium text-gray-700">Profitability</Label>
          <Select
            value={filters.profitability || "all"}
            onValueChange={(value) => handleFilterChange("profitability", value)}
          >
            <SelectTrigger className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-lego-red focus:border-lego-red sm:text-sm rounded-md">
              <SelectValue placeholder="All Deals" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Deals</SelectItem>
              <SelectItem value="profitable">Profitable Only</SelectItem>
              <SelectItem value="not-profitable">Not Profitable</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Source Filter */}
        <div>
          <Label htmlFor="source" className="block text-sm font-medium text-gray-700">Source</Label>
          <Select
            value={filters.source || "all"}
            onValueChange={(value) => handleFilterChange("source", value)}
          >
            <SelectTrigger className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-lego-red focus:border-lego-red sm:text-sm rounded-md">
              <SelectValue placeholder="All Sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              {sources.map((source: string) => (
                <SelectItem key={source} value={source.toLowerCase()}>{source}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Theme Filter */}
        <div>
          <Label htmlFor="theme" className="block text-sm font-medium text-gray-700">Theme</Label>
          <Select
            value={filters.theme || "all"}
            onValueChange={(value) => handleFilterChange("theme", value)}
          >
            <SelectTrigger className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-lego-red focus:border-lego-red sm:text-sm rounded-md">
              <SelectValue placeholder="All Themes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Themes</SelectItem>
              {themes.map((theme: string) => (
                <SelectItem key={theme} value={theme.toLowerCase()}>{theme}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range Filter */}
        <div>
          <Label htmlFor="price-range" className="block text-sm font-medium text-gray-700">Price Range</Label>
          <Select
            value={filters.priceRange || "all"}
            onValueChange={(value) => handleFilterChange("priceRange", value)}
          >
            <SelectTrigger className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-lego-red focus:border-lego-red sm:text-sm rounded-md">
              <SelectValue placeholder="All Prices" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="0-50">$0 - $50</SelectItem>
              <SelectItem value="50-100">$50 - $100</SelectItem>
              <SelectItem value="100-200">$100 - $200</SelectItem>
              <SelectItem value="200+">$200+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort By Filter */}
        <div>
          <Label htmlFor="sort-by" className="block text-sm font-medium text-gray-700">Sort By</Label>
          <Select
            value={filters.sortBy || "profit-desc"}
            onValueChange={(value) => handleFilterChange("sortBy", value)}
          >
            <SelectTrigger className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-lego-red focus:border-lego-red sm:text-sm rounded-md">
              <SelectValue placeholder="Profit: High to Low" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="profit-desc">Profit: High to Low</SelectItem>
              <SelectItem value="profit-asc">Profit: Low to High</SelectItem>
              <SelectItem value="discount-desc">Discount: High to Low</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Search Input (shown on smaller screens) */}
      <div className="mt-4 md:hidden">
        <Label htmlFor="search-mobile" className="block text-sm font-medium text-gray-700">Search</Label>
        <div className="relative mt-1">
          <Input
            type="text"
            id="search-mobile"
            placeholder="Search LEGO sets..."
            className="pl-10 focus:ring-lego-red focus:border-lego-red"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
