import { Link } from "wouter";
import { LegoDealWithSet } from "../../../shared/schema";
import { 
  formatPrice, 
  formatDiscount, 
  getProfitabilityColorClass, 
  getProfitabilitySymbol, 
  formatProfitAmount, 
  getProfitAmountClass,
  timeAgo 
} from "../lib/utils";

interface DealCardProps {
  deal: LegoDealWithSet;
}

export default function DealCard({ deal }: DealCardProps) {
  const { legoSet } = deal;

  return (
    <div className="deal-card bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg relative transition-all duration-200">
      <div className={`absolute top-0 right-0 m-2 px-2 py-1 rounded-full text-xs font-bold ${getProfitabilityColorClass(deal.isProfitable, deal.profitAmount)}`}>
        <span>{getProfitabilitySymbol(deal.isProfitable, deal.profitAmount)}</span>
      </div>
      <div className="relative">
        <img 
          src={legoSet.imageUrl} 
          alt={`LEGO ${legoSet.name}`} 
          className="w-full h-48 object-contain bg-gray-50" 
        />
        <div className="absolute bottom-0 left-0 right-0 flex justify-between items-center p-2 bg-black bg-opacity-50">
          <div className={`px-2 py-1 rounded text-xs font-bold ${
            deal.discountPercentage >= 25 ? 'bg-lego-red text-white' : 
            deal.discountPercentage >= 20 ? 'bg-lego-yellow text-black' : 
            'bg-lego-blue text-white'
          }`}>
            {formatDiscount(deal.discountPercentage)}
          </div>
          <div className="text-white text-xs font-bold">
            {legoSet.theme}
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-2">{legoSet.name || `LEGO ${legoSet.setNumber}`}</h3>
          <span className="text-sm text-gray-500 whitespace-nowrap ml-2">#{legoSet.setNumber}</span>
        </div>
        
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-medium bg-gray-100 rounded-full px-2 py-0.5 text-gray-800">
            {deal.source}
          </span>
          {legoSet.avgRating !== undefined && legoSet.avgRating > 0 && (
            <span className="text-xs font-medium bg-gray-100 rounded-full px-2 py-0.5 text-gray-800">
              {legoSet.avgRating.toFixed(1)}⭐ ({legoSet.numReviews})
            </span>
          )}
        </div>
        
        <div className="flex justify-between items-baseline mb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-lego-red">{formatPrice(deal.currentPrice)}</span>
            <span className="text-sm line-through text-gray-500">{formatPrice(deal.originalPrice)}</span>
          </div>
          <div className={`text-sm font-medium ${getProfitAmountClass(deal.profitAmount)}`}>
            {formatProfitAmount(deal.profitAmount)}
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500">
            {timeAgo(deal.lastChecked)}
          </div>
          <Link href={`/deal/${deal.id}`}>
            <button className="text-sm bg-lego-blue hover:bg-blue-700 text-white font-medium py-1.5 px-4 rounded transition-colors">
              View Deal
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
