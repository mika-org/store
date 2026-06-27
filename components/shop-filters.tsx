'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function SortSelect({ currentSort }: { currentSort: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', e.target.value);
    params.set('page', '1');
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <select
      id="sort"
      value={currentSort}
      onChange={handleSortChange}
      className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none"
    >
      <option value="newest">Newest</option>
      <option value="price-asc">Price: Low to High</option>
      <option value="price-desc">Price: High to Low</option>
    </select>
  );
}

export function PriceFilter({
  initialMinPrice,
  initialMaxPrice,
}: {
  initialMinPrice?: string;
  initialMaxPrice?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [minPrice, setMinPrice] = useState(initialMinPrice || '');
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice || '');

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) {
      params.set('minPrice', minPrice);
    } else {
      params.delete('minPrice');
    }

    if (maxPrice) {
      params.set('maxPrice', maxPrice);
    } else {
      params.delete('maxPrice');
    }

    params.set('page', '1');
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">Price Range</h3>
      <div className="flex items-center space-x-2">
        <input
          type="number"
          placeholder="Min Rp"
          id="minPriceInput"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs focus:outline-none"
        />
        <span className="text-xs text-muted-foreground">to</span>
        <input
          type="number"
          placeholder="Max Rp"
          id="maxPriceInput"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs focus:outline-none"
        />
      </div>
      <Button
        size="sm"
        className="w-full mt-2 text-xs"
        onClick={handleApply}
      >
        Apply Price
      </Button>
    </div>
  );
}
