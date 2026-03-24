// app/hooks/userFilters.ts

import { useState, useEffect, useRef } from "react";

// 'any' အစား အသုံးပြုရန် သင့်တော်သော Type တစ်ခုကို ကြေညာခြင်း
export type FilterValue = string | number | boolean | null | undefined;

export interface FilterState {
  search: string;
  startDate: string;
  endDate: string;
  // ဒီနေရာမှာ 'any' အစား 'FilterValue' ကို ပြောင်းသုံးလိုက်ပါတယ်
  [key: string]: FilterValue;
}

export function useFilters(
  initialState: FilterState,
  onFilterChange: (filters: FilterState) => void,
) {
  const [filters, setFilters] = useState<FilterState>(initialState);
  const isFirstRender = useRef(true);

  // ဒီနေရာမှာလည်း 'any' အစား 'FilterValue' ကို ပြောင်းသုံးလိုက်ပါတယ်
  const updateFilter = (key: string, value: FilterValue) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(initialState);
    onFilterChange(initialState);
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timeout = setTimeout(() => {
      onFilterChange(filters);
    }, 500);

    return () => clearTimeout(timeout);
  }, [filters, onFilterChange]);

  return {
    filters,
    updateFilter,
    resetFilters,
  };
}
