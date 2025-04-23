import { createClient } from '@/app/lib/supabase/server';
import { withErrorHandling, AuthError } from '@/app/lib/error';
import { getUser } from '@/app/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/users - Get all users (admin only)
export const GET = withErrorHandling(async (request: NextRequest) => {
  const supabase = await createClient();
  
  // Get the current user
  const user = await getUser();
  if (!user) {
    throw new AuthError();
  }
  
  // Check if user is admin
  const userRole = user.user_metadata?.role || '';
  if (userRole !== 'admin') {
    throw new AuthError('Only administrators can access this endpoint');
  }
  
  // Parse query parameters
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get('search') || '';
  const role = searchParams.get('role');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const offset = (page - 1) * limit;
  
  // Start building the query
  let query = supabase
    .from('users')
    .select('*', { count: 'exact' });
  
  // Apply filters
  if (search) {
    query = query.or(`email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
  }
  
  if (role) {
    query = query.eq('role', role);
  }
  
  // Apply pagination
  query = query.range(offset, offset + limit - 1)
    .order('created_at', { ascending: false });
  
  // Execute the query
  const { data, error, count } = await query;
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({
    data,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  });
});