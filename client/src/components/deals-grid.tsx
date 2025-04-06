import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LegoDealWithSet, DealFilter } from "@shared/schema";
import DealCard from "./deal-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface DealsGridProps {
  filters: DealFilter;
}

interface DealsResponse {
  deals: LegoDealWithSet[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function DealsGrid({ filters }: DealsGridProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Construct query string from filters
  const queryString = new URLSearchParams({
    profitability: filters.profitability || 'all',
    ...(filters.source && filters.source !== 'all' && { source: filters.source }),
    ...(filters.theme && filters.theme !== 'all' && { theme: filters.theme }),
    ...(filters.priceRange && { priceRange: filters.priceRange }),
    ...(filters.sortBy && { sortBy: filters.sortBy }),
    ...(filters.search && { search: filters.search }),
    page: currentPage.toString(),
    limit: '8', // Fixed limit of 8 items per page
  }).toString();

  const { data, isLoading, error } = useQuery<DealsResponse>({
    queryKey: ["/api/deals", queryString],
    queryFn: () => fetch(`/api/deals?${queryString}`).then(res => res.json()),
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="mt-8 mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Current LEGO Deals</h2>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg overflow-hidden shadow-custom">
              <Skeleton className="w-full h-48" />
              <div className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-5 w-full mb-2" />
                <Skeleton className="h-5 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="mt-8 mb-12">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p>Error loading deals. Please try again later.</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!data || data.deals.length === 0) {
    return (
      <div className="mt-8 mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Current LEGO Deals</h2>
        <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-12 rounded-lg text-center">
          <h3 className="text-lg font-semibold mb-2">No deals found</h3>
          <p className="text-gray-500">Try adjusting your filters or search query.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 mb-12">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Current LEGO Deals</h2>
      
      {/* Deal Cards Grid */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data.deals.map((deal) => (
          <DealCard key={deal.id} deal={deal} />
        ))}
      </div>
      
      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-between my-8">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === data.totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * 8 + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(currentPage * 8, data.total)}
                </span>{" "}
                of <span className="font-medium">{data.total}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </Button>
                
                {/* Page numbers */}
                {[...Array(data.totalPages)].map((_, index) => {
                  const pageNumber = index + 1;
                  // Show a window of 5 pages, centered on the current page if possible
                  if (
                    pageNumber === 1 ||
                    pageNumber === data.totalPages ||
                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <Button
                        key={pageNumber}
                        variant={pageNumber === currentPage ? "default" : "outline"}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pageNumber === currentPage
                            ? "bg-lego-red border-lego-red text-white"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {pageNumber}
                      </Button>
                    );
                  } else if (
                    pageNumber === currentPage - 2 ||
                    pageNumber === currentPage + 2
                  ) {
                    return (
                      <span
                        key={pageNumber}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                      >
                        ...
                      </span>
                    );
                  } else {
                    return null;
                  }
                })}
                
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === data.totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </Button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
