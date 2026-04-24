export interface TeaPlan {
  id: number;
  slug: string;
  name: string;
  days: number;
  dailyIncome: number;
  dailyPercent: number;
  totalIncome: number;
  totalPercent: number;
  price: number;
  image: string;
  isComingSoon?: boolean;
  launchDate?: string;
}

export const plans: TeaPlan[] = [
  {
    id: 1,
    slug: 'ceylon-black-tea',
    name: 'Ceylon Black Tea Estate',
    days: 130,
    dailyIncome: 50,
    dailyPercent: 10,
    totalIncome: 6500,
    totalPercent: 1300,
    price: 500,
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 2,
    slug: 'green-tea-premium',
    name: 'Green Tea Premium Estate',
    days: 130,
    dailyIncome: 125,
    dailyPercent: 12.5,
    totalIncome: 16250,
    totalPercent: 1625,
    price: 1000,
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 3,
    slug: 'silver-tips-exclusive',
    name: 'Silver Tips Exclusive',
    days: 130,
    dailyIncome: 300,
    dailyPercent: 14.28,
    totalIncome: 39000,
    totalPercent: 1856.4,
    price: 2100,
    image: 'https://images.unsplash.com/photo-1563822249548-9a72b6353cd1?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 4,
    slug: 'golden-oolong',
    name: 'Golden Oolong Plantation',
    days: 130,
    dailyIncome: 700,
    dailyPercent: 16.66,
    totalIncome: 91000,
    totalPercent: 2165.8,
    price: 4200,
    image: 'https://images.unsplash.com/photo-1558160074-4d7d8bdf4256?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 5,
    slug: 'royal-matcha',
    name: 'Royal Matcha Vineyard',
    days: 130,
    dailyIncome: 1600,
    dailyPercent: 20,
    totalIncome: 208000,
    totalPercent: 2600,
    price: 8000,
    image: 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 6,
    slug: 'imperial-white-tea',
    name: 'Imperial White Tea',
    days: 130,
    dailyIncome: 3600,
    dailyPercent: 22.5,
    totalIncome: 468000,
    totalPercent: 2925,
    price: 16000,
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 7,
    slug: 'darjeeling-reserve',
    name: 'Himalayan Darjeeling Reserve',
    days: 130,
    dailyIncome: 7200,
    dailyPercent: 24,
    totalIncome: 936000,
    totalPercent: 3120,
    price: 30000,
    image: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 8,
    slug: 'platinum-jasmine',
    name: 'Platinum Jasmine Blend',
    days: 130,
    dailyIncome: 13200,
    dailyPercent: 26.4,
    totalIncome: 1716000,
    totalPercent: 3432,
    price: 50000,
    image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=800&q=80',
    isComingSoon: true,
    launchDate: '2026-05-06T00:00:00Z'
  },
  {
    id: 9,
    slug: 'diamond-earl-grey',
    name: 'Diamond Earl Grey Syndicate',
    days: 130,
    dailyIncome: 28600,
    dailyPercent: 28.6,
    totalIncome: 3718000,
    totalPercent: 3718,
    price: 100000,
    image: 'https://images.unsplash.com/photo-1588523363556-9cc220b3ced8?auto=format&fit=crop&w=800&q=80',
    isComingSoon: true,
    launchDate: '2026-05-19T00:00:00Z'
  }
];
