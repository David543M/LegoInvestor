import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format price to USD
export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
};

// Calculate time since last update
export const timeAgo = (date: Date): string => {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };
  
  if (seconds < intervals.minute) {
    return 'just now';
  } else if (seconds < intervals.hour) {
    const minutes = Math.floor(seconds / intervals.minute);
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  } else if (seconds < intervals.day) {
    const hours = Math.floor(seconds / intervals.hour);
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  } else if (seconds < intervals.week) {
    const days = Math.floor(seconds / intervals.day);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  } else if (seconds < intervals.month) {
    const weeks = Math.floor(seconds / intervals.week);
    return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
  } else if (seconds < intervals.year) {
    const months = Math.floor(seconds / intervals.month);
    return `${months} month${months === 1 ? '' : 's'} ago`;
  } else {
    const years = Math.floor(seconds / intervals.year);
    return `${years} year${years === 1 ? '' : 's'} ago`;
  }
};

// Format discount percentage
export const formatDiscount = (percentage: number): string => {
  return `${Math.round(percentage)}% OFF`;
};

// Determine status color class
export const getProfitabilityColorClass = (isProfitable: boolean, profitAmount: number) => {
  if (isProfitable) {
    return profitAmount > 30 ? 'bg-lego-green text-white' : 'bg-lego-yellow text-black';
  }
  return 'bg-lego-red text-white';
};

// Determine profit indicator symbol
export const getProfitabilitySymbol = (isProfitable: boolean, profitAmount: number) => {
  if (isProfitable) {
    return profitAmount > 30 ? '$' : '~';
  }
  return '✗';
};

// Format profit amount with sign
export const formatProfitAmount = (profitAmount: number): string => {
  const formattedAmount = formatPrice(Math.abs(profitAmount));
  if (profitAmount > 0) {
    return `+${formattedAmount} profit`;
  } else if (profitAmount < 0) {
    return `-${formattedAmount} loss`;
  }
  return `${formattedAmount} (break even)`;
};

// Get the profit amount class for coloring
export const getProfitAmountClass = (profitAmount: number): string => {
  if (profitAmount > 30) {
    return 'text-lego-green';
  } else if (profitAmount > 0) {
    return 'text-lego-yellow';
  }
  return 'text-lego-red';
};
