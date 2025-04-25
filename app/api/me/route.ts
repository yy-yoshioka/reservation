import { createClient } from '@/app/lib/supabase/server';
import { withErrorHandling, AuthError, ValidationError } from '@/app/lib/errors/common';
import { getUser } from '@/app/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/me - Get current user profile
export const GET = withErrorHandling(async () => {
  const supabase = await createClient();
  
  // Get the current user
  const user = await getUser();
  if (!user) {
    throw new AuthError();
  }
  
  // Query for the user profile
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  // Get recent reservations
  const { data: reservations } = await supabase
    .from('reservations')
    .select('id, title, start_time, end_time, status')
    .eq('customer_id', user.id)
    .order('start_time', { ascending: false })
    .limit(5);
  
  return NextResponse.json({
    data: {
      ...data,
      email: user.email,
      reservations: reservations || [],
    },
  });
});

// PUT /api/me - Update current user profile
export const PUT = withErrorHandling(async (request: NextRequest) => {
  const supabase = await createClient();
  
  // Get the current user
  const user = await getUser();
  if (!user) {
    throw new AuthError();
  }
  
  // Parse the request body
  const body = await request.json();
  
  // Prepare update data
  const updateData: Record<string, any> = {};
  
  // Users can update their profile details
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
  
  // Only proceed if there are fields to update
  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({
      message: 'No changes to update',
    });
  }
  
  // Update the user in the database
  const { data: updatedUser, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', user.id)
    .select('*')
    .single();
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  // Update auth user metadata
  const metadataUpdate: Record<string, any> = {};
  if (updateData.first_name !== undefined) metadataUpdate.first_name = updateData.first_name;
  if (updateData.last_name !== undefined) metadataUpdate.last_name = updateData.last_name;
  
  if (Object.keys(metadataUpdate).length > 0) {
    await supabase.auth.updateUser({
      data: metadataUpdate,
    });
  }
  
  return NextResponse.json({
    data: {
      ...updatedUser,
      email: user.email,
    },
    message: 'Profile updated successfully',
  });
});