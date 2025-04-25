'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ReservationFormData, User } from '@/app/types';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import Select from '@/app/components/ui/Select';
import Alert from '@/app/components/ui/Alert';
import Calendar from '@/app/components/calendar/Calendar';
import { useAuth } from '@/app/hooks/useAuth';

export interface ReservationFormProps {
  initialData?: Partial<ReservationFormData>;
  onSubmit: (data: ReservationFormData) => Promise<{ success: boolean; error?: string }>;
  availableTimeSlots: Array<{ start: string; end: string }>;
  customers?: User[];
  isLoading?: boolean;
}

const ReservationSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().optional(),
  customer_id: z.string().optional(),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
  number_of_people: z.coerce.number().int().min(1, 'At least 1 person is required'),
});

export default function ReservationForm({
  initialData = {},
  onSubmit,
  availableTimeSlots,
  customers = [],
  isLoading = false,
}: ReservationFormProps) {
  const { role } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    start: string;
    end: string;
  } | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ReservationFormData>({
    resolver: zodResolver(ReservationSchema) as any,
    defaultValues: {
      title: initialData.title || '',
      description: initialData.description || '',
      start_time: initialData.start_time || '',
      end_time: initialData.end_time || '',
      number_of_people: initialData.number_of_people || 1,
      customer_id: initialData.customer_id || '',
    },
  });

  // Set initial selected slot based on initialData
  useEffect(() => {
    if (initialData.start_time && initialData.end_time) {
      setSelectedSlot({
        start: initialData.start_time,
        end: initialData.end_time,
      });
    }
  }, [initialData]);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const handleSlotSelect = (start: string, end: string) => {
    setSelectedSlot({
      start,
      end,
    });
    setValue('start_time', start);
    setValue('end_time', end);
  };

  const onFormSubmit = async (data: any) => {
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const result = await onSubmit(data as ReservationFormData);

      if (!result.success) {
        setSubmitError(result.error || 'Failed to create reservation');
        return;
      }

      setSubmitSuccess(true);
      reset();
      setSelectedSlot(null);
    } catch (error: unknown) {
      setSubmitError(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  };

  return (
    <div>
      {submitError && (
        <Alert variant="error" title="Error" className="mb-6" onClose={() => setSubmitError(null)}>
          {submitError}
        </Alert>
      )}

      {submitSuccess && (
        <Alert
          variant="success"
          title="Success"
          className="mb-6"
          onClose={() => setSubmitSuccess(false)}
        >
          Reservation created successfully! Redirecting to details page...
        </Alert>
      )}

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date & Time Slot
              </label>
              <div className="border rounded-lg p-4 bg-gray-50">
                <Calendar
                  initialDate={selectedDate}
                  timeSlots={availableTimeSlots}
                  onDateChange={handleDateChange}
                  onSlotSelect={handleSlotSelect}
                  selectedSlot={selectedSlot}
                />
              </div>
              {errors.start_time && (
                <p className="text-sm text-red-600 mt-1">{errors.start_time.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of People
              </label>
              <Input
                type="number"
                min="1"
                {...register('number_of_people')}
                error={errors.number_of_people?.message}
              />
            </div>
          </div>

          <div className="space-y-6">
            {role === 'admin' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                <Select
                  options={customers.map((customer) => ({
                    value: customer.id,
                    label: `${customer.first_name} ${customer.last_name} (${customer.email})`,
                  }))}
                  {...register('customer_id')}
                  error={errors.customer_id?.message}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <Input
                type="text"
                placeholder="e.g., Business Meeting"
                {...register('title')}
                error={errors.title?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                rows={4}
                placeholder="Add any notes or special requests"
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting || isLoading}
            disabled={isSubmitting || isLoading}
          >
            Create Reservation
          </Button>
        </div>
      </form>
    </div>
  );
}
