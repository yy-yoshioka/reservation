// User-related types
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'staff' | 'customer';
  phone?: string;
  created_at: string;
  updated_at: string;
}

// Reservation-related types
export interface Reservation {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  customer_id: string;
  created_by: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface ReservationDetails {
  id: string;
  reservation_id: string;
  special_requests?: string;
  number_of_people?: number;
  additional_notes?: string;
}

export interface AvailabilitySetting {
  id: string;
  day_of_week: number; // 0-6, representing Sunday-Saturday
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Form types
export interface ReservationFormData {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  special_requests?: string;
  number_of_people?: number;
  additional_notes?: string;
}