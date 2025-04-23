'use client';

import { cn } from '@/app/lib/utils';
import React, { useState } from 'react';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import Select from '@/app/components/ui/Select';

interface ReservationFilterProps {
  onFilterChange: (filters: ReservationFilters) => void;
  className?: string;
}

export interface ReservationFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
  onlyMine?: boolean;
}

export default function ReservationFilter({
  onFilterChange,
  className,
}: ReservationFilterProps) {
  const [filters, setFilters] = useState<ReservationFilters>({
    status: '',
    startDate: '',
    endDate: '',
    onlyMine: false,
  });
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };
  
  // Apply filters
  const applyFilters = () => {
    onFilterChange(filters);
  };
  
  // Reset filters
  const resetFilters = () => {
    const resetValues = {
      status: '',
      startDate: '',
      endDate: '',
      onlyMine: false,
    };
    setFilters(resetValues);
    onFilterChange(resetValues);
  };
  
  return (
    <div className={cn("bg-white border rounded-md p-4 mb-6", className)}>
      <h3 className="text-lg font-medium mb-4">Filter Reservations</h3>
      
      <div className="grid gap-4 mb-4 md:grid-cols-3">
        <Select
          label="Status"
          name="status"
          value={filters.status}
          onChange={handleInputChange}
          options={[
            { value: '', label: 'All Statuses' },
            { value: 'pending', label: 'Pending' },
            { value: 'confirmed', label: 'Confirmed' },
            { value: 'cancelled', label: 'Cancelled' },
            { value: 'completed', label: 'Completed' },
          ]}
        />
        
        <Input
          label="Start Date"
          name="startDate"
          type="date"
          value={filters.startDate}
          onChange={handleInputChange}
        />
        
        <Input
          label="End Date"
          name="endDate"
          type="date"
          value={filters.endDate}
          onChange={handleInputChange}
        />
      </div>
      
      <div className="flex items-center mb-4">
        <input
          id="onlyMine"
          name="onlyMine"
          type="checkbox"
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          checked={filters.onlyMine}
          onChange={handleCheckboxChange}
        />
        <label htmlFor="onlyMine" className="ml-2 block text-sm text-gray-900">
          Show only my reservations
        </label>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={resetFilters}>
          Reset
        </Button>
        <Button onClick={applyFilters}>
          Apply Filters
        </Button>
      </div>
    </div>
  );
}