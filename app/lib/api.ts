import { ApiResponse } from '@/app/types';

/**
 * Base fetch wrapper with error handling for API calls
 */
export async function fetchApi<T>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: data.error || `API error: ${response.status}`,
      };
    }

    return { data: data as T };
  } catch (error: any) {
    return {
      error: error.message || 'Unknown error occurred',
    };
  }
}

/**
 * GET request wrapper
 */
export async function get<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  return fetchApi<T>(url, {
    method: 'GET',
    ...options,
  });
}

/**
 * POST request wrapper
 */
export async function post<T>(
  url: string,
  body: any,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  return fetchApi<T>(url, {
    method: 'POST',
    body: JSON.stringify(body),
    ...options,
  });
}

/**
 * PUT request wrapper
 */
export async function put<T>(
  url: string,
  body: any,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  return fetchApi<T>(url, {
    method: 'PUT',
    body: JSON.stringify(body),
    ...options,
  });
}

/**
 * DELETE request wrapper
 */
export async function del<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  return fetchApi<T>(url, {
    method: 'DELETE',
    ...options,
  });
}

/**
 * Format API error for display
 */
export function formatApiError(error: any): string {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'An unknown error occurred';
}

/**
 * Validate response and handle common error cases
 */
export function validateApiResponse<T>(response: ApiResponse<T>): { 
  valid: boolean;
  data?: T;
  errorMessage?: string;
} {
  if (response.error) {
    return {
      valid: false,
      errorMessage: formatApiError(response.error),
    };
  }
  
  if (!response.data) {
    return {
      valid: false,
      errorMessage: 'No data received from the server',
    };
  }
  
  return {
    valid: true,
    data: response.data,
  };
}