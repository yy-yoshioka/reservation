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
  const { data, error } = await supabase.from('users').select('*').eq('id', user.id).single();

  // If user profile doesn't exist, create one
  if (error && error.code === 'PGRST116') {
    const newUser = {
      id: user.id,
      email: user.email || '',
      first_name: user.user_metadata?.first_name || '',
      last_name: user.user_metadata?.last_name || '',
      role: user.user_metadata?.role || 'customer',
    };

    // Try to create the user profile
    try {
      const { data: createdUser, error: createError } = await supabase
        .from('users')
        .insert([newUser])
        .select()
        .single();

      if (createError) {
        console.error('Failed to create user profile:', createError);
        return NextResponse.json({ error: createError.message }, { status: 500 });
      }

      // Return the newly created user
      return NextResponse.json({
        data: {
          ...createdUser,
          email: user.email,
          reservations: [],
        },
      });
    } catch (err) {
      console.error('Error creating user profile:', err);
      return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 });
    }
  } else if (error) {
    console.error('Error fetching user profile:', error);
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

// POST /api/me - Create user profile if it doesn't exist or update existing profile
export const POST = withErrorHandling(async (request: NextRequest) => {
  const supabase = await createClient();

  // Get the current user
  const user = await getUser();
  if (!user) {
    throw new AuthError();
  }

  // Parse the request body
  const body = await request.json();

  // Check if user profile exists
  const { data: existingUser, error: checkError } = await supabase
    .from('users')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  // If user doesn't exist, create a new profile
  if (!existingUser) {
    // Prepare user data with required fields
    const userData = {
      id: user.id,
      email: user.email || body.email || '',
      first_name: body.first_name || user.user_metadata?.first_name || '',
      last_name: body.last_name || user.user_metadata?.last_name || '',
      role: user.user_metadata?.role || 'customer',
      phone: body.phone || null,
    };

    // Validate required fields
    if (!userData.first_name) {
      throw new ValidationError('Validation failed', {
        first_name: 'First name is required',
      });
    }

    if (!userData.last_name) {
      throw new ValidationError('Validation failed', {
        last_name: 'Last name is required',
      });
    }

    // Create user profile
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([userData])
      .select('*')
      .single();

    if (createError) {
      console.error('Failed to create user profile:', createError);
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    return NextResponse.json({
      data: {
        ...newUser,
        email: user.email,
      },
      message: 'Profile created successfully',
    });
  }

  // User exists, update the profile
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
