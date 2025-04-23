'use client';

import { cn, formatDate } from '@/app/lib/utils';
import React, { useState, useEffect } from 'react';
import { ReservationFormData, User } from '@/app/types';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import Select from '@/app/components/ui/Select';
import Alert from '@/app/components/ui/Alert';
import Calendar from '@/app/components/calendar/Calendar';
import { useAuth } from '@/app/hooks/useAuth';

interface ReservationFormProps {
  initialData?: Partial<ReservationFormData>;
  onSubmit: (data: ReservationFormData) => Promise<{ success: boolean; error?: string }>;
  isEdit?: boolean;
  availableTimeSlots?: Array<{ start: string; end: string }>;
  customers?: User[];
  isLoading?: boolean;
  className?: string;
}

export default function ReservationForm({
  initialData,
  onSubmit,
  isEdit = false,
  availableTimeSlots = [],
  customers = [],
  isLoading = false,
  className,
}: ReservationFormProps) {
  const { role } = useAuth();
  const [formData, setFormData] = useState<Partial<ReservationFormData>>({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    special_requests: '',
    number_of_people: 1,
    additional_notes: '',
    ...initialData,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);
  const [selectedDateForCalendar, setSelectedDateForCalendar] = useState<Date>(
    initialData?.start_time ? new Date(initialData.start_time) : new Date()
  );
  
  // Update selected slot when initialData changes
  useEffect(() => {
    if (initialData?.start_time && initialData?.end_time) {
      setSelectedSlot({
        start: initialData.start_time,
        end: initialData.end_time,
      });
    }
  }, [initialData]);
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Handle time slot selection from calendar
  const handleSlotSelect = (start: string, end: string) => {
    setSelectedSlot({ start, end });
    setFormData((prev) => ({
      ...prev,
      start_time: start,
      end_time: end,
    }));
    
    // Clear time-related errors
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors['start_time'];
      delete newErrors['end_time'];
      return newErrors;
    });
  };
  
  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.start_time) {
      newErrors.start_time = 'Start time is required';
    }
    
    if (!formData.end_time) {
      newErrors.end_time = 'End time is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    
    try {
      const result = await onSubmit(formData as ReservationFormData);
      
      if (result.success) {
        setSubmitSuccess(true);
        if (!isEdit) {
          // Reset form after successful submission (only for new reservations)
          setFormData({
            title: '',
            description: '',
            start_time: '',
            end_time: '',
            special_requests: '',
            number_of_people: 1,
            additional_notes: '',
          });
          setSelectedSlot(null);
        }
      } else {
        setSubmitError(result.error || 'An error occurred while saving the reservation.');
      }
    } catch (error: any) {
      setSubmitError(error.message || 'An error occurred while saving the reservation.');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
      {submitError && (
        <Alert
          variant="error"
          title="Error"
          onClose={() => setSubmitError(null)}
        >
          {submitError}
        </Alert>
      )}
      
      {submitSuccess && (
        <Alert
          variant="success"
          title="Success"
          onClose={() => setSubmitSuccess(false)}
        >
          {isEdit
            ? 'Reservation updated successfully.'
            : 'Reservation created successfully.'}
        </Alert>
      )}
      
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Title"
          name="title"
          value={formData.title || ''}
          onChange={handleInputChange}
          error={errors.title}
          required
        />
        
        {role === 'admin' && customers.length > 0 && (
          <Select
            label="Customer"
            name="customer_id"
            value={formData.customer_id || ''}
            onChange={handleInputChange}
            options={[
              { value: '', label: 'Select Customer' },
              ...customers.map(customer => ({
                value: customer.id,
                label: `${customer.first_name} ${customer.last_name} (${customer.email})`,
              })),
            ]}
            error={errors.customer_id}
          />
        )}
      </div>
      
      <Input
        label="Description"
        name="description"
        value={formData.description || ''}
        onChange={handleInputChange}
      />
      
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date and Time
          </label>
          
          {selectedSlot ? (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                Selected: {formatDate(new Date(selectedSlot.start))}, {new Date(selectedSlot.start).toLocaleTimeString()} - {new Date(selectedSlot.end).toLocaleTimeString()}
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-2 w-full"
                onClick={() => setSelectedSlot(null)}
                type="button"
              >
                Change Time Slot
              </Button>
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              Please select a time slot from the calendar
            </div>
          )}
          
          {errors.start_time && (
            <p className="mt-1 text-sm text-red-600">{errors.start_time}</p>
          )}
        </div>
        
        <Input
          label="Number of People"
          name="number_of_people"
          type="number"
          min={1}
          value={formData.number_of_people?.toString() || '1'}
          onChange={handleInputChange}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Special Requests
        </label>
        <textarea
          name="special_requests"
          rows={3}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          value={formData.special_requests || ''}
          onChange={handleInputChange}
        ></textarea>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Additional Notes
        </label>
        <textarea
          name="additional_notes"
          rows={3}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          value={formData.additional_notes || ''}
          onChange={handleInputChange}
        ></textarea>
      </div>
      
      <div className="border rounded-md p-4">
        <h3 className="text-lg font-medium mb-4">Available Time Slots</h3>
        <Calendar
          initialDate={selectedDateForCalendar}
          view="day"
          timeSlots={availableTimeSlots.map(slot => ({
            start: slot.start,
            end: slot.end,
          }))}
          onDateChange={setSelectedDateForCalendar}
          onSlotSelect={handleSlotSelect}
          isLoading={isLoading}
        />
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button
          type="submit"
          isLoading={submitting}
          disabled={submitting || !selectedSlot}
        >
          {isEdit ? 'Update Reservation' : 'Create Reservation'}
        </Button>
      </div>
    </form>
  );
}