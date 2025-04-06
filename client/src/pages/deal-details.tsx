import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { LegoDealWithSet } from "@shared/schema";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { 
  formatPrice, 
  formatDiscount, 
  timeAgo, 
  formatProfitAmount, 
  getProfitAmountClass,
  getProfitabilityColorClass
} from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ExternalLink, TrendingUp, Tag, Clock, DollarSign, ShoppingCart } from "lucide-react";

export default function DealDetails() {
  const [, params] = useRoute<{ id: string }>("/deal/:id");
  const dealId = params?.id;

  const { data: deal, isLoading, error } = useQuery<LegoDealWithSet>({
    queryKey: [`/api/deals/${dealId}`],
    enabled: !!dealId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
          <div className="flex items-center mb-6">
            <Link href="/">
              <a className="flex items-center text-sm text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to deals
              </a>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Skeleton className="h-96 w-full rounded-lg" />
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-6 w-1/2" />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !deal) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p>Error loading deal details. Please try again later.</p>
            <Link href="/">
              <a className="inline-block mt-4 text-red-700 underline">Return to deals</a>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const { legoSet } = deal;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <div className="flex items-center mb-6">
          <Link href="/">
            <a className="flex items-center text-sm text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to deals
            </a>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Image and Details */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg overflow-hidden shadow-md relative">
              <div className={`absolute top-4 right-4 ${getProfitabilityColorClass(deal.isProfitable, deal.profitAmount)} text-white text-sm font-bold px-3 py-1 rounded-full`}>
                {deal.isProfitable ? 'Profitable' : 'Not Profitable'}
              </div>
              <div className="relative">
                <img 
                  src={legoSet.imageUrl} 
                  alt={`LEGO ${legoSet.name}`} 
                  className="w-full h-96 object-contain p-4" 
                />
                <div className={`absolute bottom-4 left-4 ${deal.discountPercentage >= 25 ? 'bg-lego-red text-white' : deal.discountPercentage >= 20 ? 'bg-lego-yellow text-black' : 'bg-lego-blue text-white'} px-3 py-1 font-bold text-sm rounded-full`}>
                  {formatDiscount(deal.discountPercentage)}
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{legoSet.name}</h1>
                    <p className="text-gray-500">#{legoSet.setNumber} • {legoSet.theme}</p>
                  </div>
                  <Badge variant="outline" className="text-base font-semibold">
                    {legoSet.pieceCount} pieces
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Rating</h3>
                    <div className="flex items-center">
                      <span className="text-lg font-bold text-gray-900">{legoSet.avgRating}⭐</span>
                      <span className="ml-2 text-sm text-gray-500">({legoSet.numReviews} reviews)</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Released</h3>
                    <p className="text-lg font-bold text-gray-900">{legoSet.yearReleased}</p>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Source</h3>
                    <div className="flex items-center">
                      <span className="text-lg font-bold text-gray-900">{deal.source}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Last Updated</h3>
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-gray-400" />
                      <span className="text-lg text-gray-900">{timeAgo(deal.lastChecked)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Pricing and Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pricing Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Current Price:</span>
                  <span className="text-2xl font-bold text-lego-red">{formatPrice(deal.currentPrice)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Original Price:</span>
                  <span className="text-lg text-gray-500 line-through">{formatPrice(deal.originalPrice)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">You Save:</span>
                  <span className="text-lg font-semibold text-green-600">
                    {formatPrice(deal.originalPrice - deal.currentPrice)} ({Math.round(deal.discountPercentage)}%)
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Profit Potential:</span>
                  <span className={`text-lg font-semibold ${getProfitAmountClass(deal.profitAmount)}`}>
                    {formatProfitAmount(deal.profitAmount)}
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full bg-lego-blue hover:bg-blue-700" onClick={() => window.open(deal.url, '_blank')}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  View on {deal.source}
                </Button>
                <div className="flex items-center justify-between gap-4">
                  <Button variant="outline" className="w-full">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Price History
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Tag className="mr-2 h-4 w-4" />
                    Add to Watchlist
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Market Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Retail Price:</span>
                  <span className="text-lg font-semibold">{formatPrice(legoSet.retailPrice)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Current Resale Value:</span>
                  <span className="text-lg font-semibold">{formatPrice(deal.currentPrice + deal.profitAmount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Profit Margin:</span>
                  <span className={`text-lg font-semibold ${getProfitAmountClass(deal.profitAmount)}`}>
                    {Math.round((deal.profitAmount / deal.currentPrice) * 100)}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
