import { useState } from "react";
import { DealFilter } from "@shared/schema";
import Navbar from "@/components/navbar";
import FilterBar from "@/components/filter-bar";
import StatsOverview from "@/components/stats-overview";
import DealsGrid from "@/components/deals-grid";
import Footer from "@/components/footer";
import { Input } from "@/components/ui/input";

export default function Home() {
  const [filters, setFilters] = useState<DealFilter>({
    profitability: 'all',
    source: 'all',
    theme: 'all',
    priceRange: 'all',
    sortBy: 'profit-desc',
    search: '',
    page: 1,
    limit: 8
  });

  const [searchQuery, setSearchQuery] = useState("");

  const handleFilterChange = (newFilters: Partial<DealFilter>) => {
    setFilters({
      ...filters,
      ...newFilters,
      page: 1, // Reset to first page on filter change
    });
  };

  const handleSearch = (query: string) => {
    setFilters({
      ...filters,
      search: query,
      page: 1, // Reset to first page on search
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 flex-grow">
        {/* Header */}
        <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
          <h3 className="text-2xl leading-6 font-bold text-gray-900">LEGO Deal Finder</h3>
          <div className="mt-3 sm:mt-0 sm:ml-4">
            <div className="flex rounded-md shadow-sm">
              <div className="relative flex-grow focus-within:z-10">
                <Input
                  type="text"
                  name="search"
                  id="search"
                  className="focus:ring-lego-red focus:border-lego-red block w-full rounded-none rounded-l-md sm:text-sm border-gray-300 pl-10"
                  placeholder="Search LEGO sets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch(searchQuery);
                    }
                  }}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <button 
                type="button" 
                className="-ml-px relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-lego-red focus:border-lego-red"
                onClick={() => handleSearch(searchQuery)}
              >
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                </svg>
                <span className="ml-2">Filter</span>
              </button>
            </div>
          </div>
        </div>

        <FilterBar 
          filters={filters} 
          onFilterChange={handleFilterChange} 
          onSearch={handleSearch}
        />
        
        <StatsOverview />
        
        <DealsGrid filters={filters} />
      </div>
      
      <Footer />
    </div>
  );
}
