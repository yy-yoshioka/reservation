import { createClient } from '@/app/lib/supabase/server';
import { withErrorHandling, AuthError, NotFoundError, ValidationError } from '@/app/lib/error';
import { getUser } from '@/app/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/users/[id] - Get a specific user (admin only)
export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const supabase = await createClient();
  const id = params.id;
  
  // Get the current user
  const user = await getUser();
  if (!user) {
    throw new AuthError();
  }
  
  // Check if user is admin or the requested user is self
  const userRole = user.user_metadata?.role || '';
  if (userRole !== 'admin' && user.id !== id) {
    throw new AuthError('You do not have permission to access this user profile');
  }
  
  // Query for the user
  const { data: userData, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      throw new NotFoundError('User');
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  // Query for related reservations if admin or staff (optional)
  let reservations = null;
  if (userRole === 'admin' || userRole === 'staff') {
    const { data: userReservations, error: reservationsError } = await supabase
      .from('reservations')
      .select('id, title, start_time, end_time, status')
      .eq('customer_id', id)
      .order('start_time', { ascending: false })
      .limit(5);
    
    if (!reservationsError) {
      reservations = userReservations;
    }
  }
  
  return NextResponse.json({
    data: {
      ...userData,
      reservations,
    },
  });
});

// PUT /api/users/[id] - Update user details (admin or self only)
export const PUT = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const supabase = await createClient();
  const id = params.id;
  
  // Get the current user
  const user = await getUser();
  if (!user) {
    throw new AuthError();
  }
  
  // Check if user is admin or the requested user is self
  const userRole = user.user_metadata?.role || '';
  if (userRole !== 'admin' && user.id !== id) {
    throw new AuthError('You do not have permission to update this user profile');
  }
  
  // Parse the request body
  const body = await request.json();
  
  // Prepare update data
  const updateData: Record<string, any> = {};
  
  // Regular users can only update certain fields about themselves
  if (userRole !== 'admin' && user.id === id) {
    if (body.first_name !== undefined) updateData.first_name = body.first_name;
    if (body.last_name !== undefined) updateData.last_name = body.last_name;
    if (body.phone !== undefined) updateData.phone = body.phone;
    
    // Validate required fields
    if (updateData.first_name === '') {
      throw new ValidationError('Validation failed', {
        first_name: 'First name cannot be empty',
      });
    }
    
    if (updateData.last_name === '') {
      throw new ValidationError('Validation failed', {
        last_name: 'Last name cannot be empty',
      });
    }
  } else if (userRole === 'admin') {
    // Admins can update all fields
    if (body.first_name !== undefined) updateData.first_name = body.first_name;
    if (body.last_name !== undefined) updateData.last_name = body.last_name;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.role !== undefined) updateData.role = body.role;
    
    // Validate required fields
    if (updateData.first_name === '') {
      throw new ValidationError('Validation failed', {
        first_name: 'First name cannot be empty',
      });
    }
    
    if (updateData.last_name === '') {
      throw new ValidationError('Validation failed', {
        last_name: 'Last name cannot be empty',
      });
    }
    
    if (updateData.role && !['admin', 'staff', 'customer'].includes(updateData.role)) {
      throw new ValidationError('Validation failed', {
        role: 'Role must be one of: admin, staff, customer',
      });
    }
  }
  
  // Only proceed if there are fields to update
  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({
      message: 'No changes to update',
    });
  }
  
  // Update the user
  const { data: updatedUser, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', id)
    .select('*')
    .single();
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  // If this is updating the current user, also update auth metadata
  if (user.id === id) {
    // Update auth user metadata
    const metadataUpdate: Record<string, any> = {};
    if (updateData.first_name !== undefined) metadataUpdate.first_name = updateData.first_name;
    if (updateData.last_name !== undefined) metadataUpdate.last_name = updateData.last_name;
    if (updateData.role !== undefined) metadataUpdate.role = updateData.role;
    
    if (Object.keys(metadataUpdate).length > 0) {
      await supabase.auth.updateUser({
        data: metadataUpdate,
      });
    }
  }
  
  return NextResponse.json({
    data: updatedUser,
    message: 'User updated successfully',
  });
});