import { Link } from "wouter";
import { LegoDealWithSet } from "@shared/schema";
import { 
  formatPrice, 
  formatDiscount, 
  getProfitabilityColorClass, 
  getProfitabilitySymbol, 
  formatProfitAmount, 
  getProfitAmountClass,
  timeAgo 
} from "@/lib/utils";

interface DealCardProps {
  deal: LegoDealWithSet;
}

export default function DealCard({ deal }: DealCardProps) {
  const { legoSet } = deal;

  return (
    <div className="deal-card bg-white rounded-lg overflow-hidden shadow-custom relative transition-all duration-200">
      <div className={`profitable-indicator ${getProfitabilityColorClass(deal.isProfitable, deal.profitAmount)}`}>
        <span>{getProfitabilitySymbol(deal.isProfitable, deal.profitAmount)}</span>
      </div>
      <div className="relative">
        <img 
          src={legoSet.imageUrl} 
          alt={`LEGO ${legoSet.name}`} 
          className="w-full h-48 object-cover" 
        />
        <div className={`absolute bottom-0 left-0 ${deal.discountPercentage >= 25 ? 'bg-lego-red text-white' : deal.discountPercentage >= 20 ? 'bg-lego-yellow text-black' : 'bg-lego-blue text-white'} px-2 py-1 font-bold text-xs`}>
          {formatDiscount(deal.discountPercentage)}
        </div>
        <div className="absolute bottom-0 right-0 bg-black bg-opacity-70 text-white px-2 py-1 font-bold text-xs">
          {legoSet.theme}
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold text-gray-900 mb-1">{legoSet.name}</h3>
          <span className="text-sm text-gray-500">#{legoSet.setNumber}</span>
        </div>
        
        <div className="flex items-center mb-3">
          <span className="text-xs font-medium bg-gray-100 rounded-full px-2 py-0.5 text-gray-800 mr-2">
            {deal.source}
          </span>
          <span className="text-xs font-medium bg-gray-100 rounded-full px-2 py-0.5 text-gray-800">
            {legoSet.avgRating}⭐ ({legoSet.numReviews})
          </span>
        </div>
        
        <div className="flex justify-between items-baseline mb-3">
          <div>
            <span className="text-lg font-bold text-lego-red">{formatPrice(deal.currentPrice)}</span>
            <span className="text-sm line-through text-gray-500 ml-1">{formatPrice(deal.originalPrice)}</span>
          </div>
          <div className={`text-sm font-medium ${getProfitAmountClass(deal.profitAmount)}`}>
            {formatProfitAmount(deal.profitAmount)}
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500">
            Last updated: {timeAgo(deal.lastChecked)}
          </div>
          <Link href={`/deal/${deal.id}`}>
            <button className="text-sm bg-lego-blue hover:bg-blue-700 text-white font-medium py-1 px-3 rounded">
              View Deal
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
