import { createClient } from '@/app/lib/supabase/server';
import {
  withErrorHandling,
  ValidationError,
  AuthError,
  NotFoundError,
} from '@/app/lib/errors/common';
import { getUser } from '@/app/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/reservations/[id] - Get a specific reservation
export const GET = withErrorHandling(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    const supabase = await createClient();
    const id = params.id;

    // Get the current user
    const user = await getUser();
    if (!user) {
      throw new AuthError();
    }

    // Query for the reservation and its details
    const { data: reservation, error } = await supabase
      .from('reservations')
      .select(
        `
      *,
      users!customer_id(id, first_name, last_name, email, phone),
      users!created_by(id, first_name, last_name, email),
      reservation_details(*)
    `
      )
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundError('Reservation');
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Check access permission (RLS should handle this, but we're being explicit)
    const userRole = user.user_metadata?.role || 'customer';

    if (userRole === 'customer' && reservation.customer_id !== user.id) {
      throw new AuthError('You do not have permission to access this reservation');
    }

    return NextResponse.json({ data: reservation });
  }
);

// PUT /api/reservations/[id] - Update an existing reservation
export const PUT = withErrorHandling(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    const supabase = await createClient();
    const id = params.id;

    // Get the current user
    const user = await getUser();
    if (!user) {
      throw new AuthError();
    }

    // Get the reservation first to check permissions
    const { data: existingReservation, error: fetchError } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        throw new NotFoundError('Reservation');
      }
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // Check permissions (RLS should handle this, but we're being explicit)
    const userRole = user.user_metadata?.role || 'customer';

    if (userRole === 'customer' && existingReservation.customer_id !== user.id) {
      throw new AuthError('You do not have permission to update this reservation');
    }

    if (userRole === 'staff' && existingReservation.created_by !== user.id) {
      throw new AuthError('Staff can only update reservations they created');
    }

    // Parse the request body
    const body = await request.json();

    // Validate time interval if provided
    if (body.start_time && body.end_time) {
      const startTime = new Date(body.start_time);
      const endTime = new Date(body.end_time);

      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        throw new ValidationError('Invalid date format', {
          time: 'Start time and end time must be valid dates',
        });
      }

      if (startTime >= endTime) {
        throw new ValidationError('Invalid time range', {
          time: 'End time must be after start time',
        });
      }

      // Check for overlapping reservations (optional, as DB constraints handle this too)
      const { data: overlapping, error: overlapError } = await supabase
        .from('reservations')
        .select('id')
        .or(`start_time,lt.${endTime.toISOString()},end_time,gt.${startTime.toISOString()}`)
        .not('id', 'eq', id)
        .not('status', 'eq', 'cancelled')
        .limit(1);

      if (overlapError) {
        return NextResponse.json({ error: overlapError.message }, { status: 500 });
      }

      if (overlapping && overlapping.length > 0) {
        throw new ValidationError('Overlapping reservation', {
          time: 'This time slot is already booked',
        });
      }
    }

    // Prepare the reservation update data
    const reservationUpdate: Record<string, any> = {};

    if (body.title !== undefined) reservationUpdate.title = body.title;
    if (body.description !== undefined) reservationUpdate.description = body.description;
    if (body.start_time !== undefined) reservationUpdate.start_time = body.start_time;
    if (body.end_time !== undefined) reservationUpdate.end_time = body.end_time;
    if (body.status !== undefined) reservationUpdate.status = body.status;

    // Only admins can change customer_id
    if (body.customer_id !== undefined && userRole === 'admin') {
      reservationUpdate.customer_id = body.customer_id;
    }

    // Update the reservation
    const { data: updatedReservation, error } = await supabase
      .from('reservations')
      .update(reservationUpdate)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Handle reservation details if provided
    if (
      body.special_requests !== undefined ||
      body.number_of_people !== undefined ||
      body.additional_notes !== undefined
    ) {
      // Check if details exist
      const { data: existingDetails } = await supabase
        .from('reservation_details')
        .select('id')
        .eq('reservation_id', id)
        .single();

      const detailsUpdate = {
        special_requests: body.special_requests,
        number_of_people: body.number_of_people,
        additional_notes: body.additional_notes,
      };

      if (existingDetails) {
        // Update existing details
        await supabase
          .from('reservation_details')
          .update(detailsUpdate)
          .eq('id', existingDetails.id);
      } else {
        // Create new details
        await supabase.from('reservation_details').insert({
          ...detailsUpdate,
          reservation_id: id,
        });
      }
    }

    return NextResponse.json({ data: updatedReservation });
  }
);

// DELETE /api/reservations/[id] - Delete a reservation
export const DELETE = withErrorHandling(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    const supabase = await createClient();
    const id = params.id;

    // Get the current user
    const user = await getUser();
    if (!user) {
      throw new AuthError();
    }

    // Get the reservation first to check permissions
    const { data: existingReservation, error: fetchError } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        throw new NotFoundError('Reservation');
      }
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // Check permissions (RLS should handle this, but we're being explicit)
    const userRole = user.user_metadata?.role || 'customer';

    if (userRole === 'customer' && existingReservation.customer_id !== user.id) {
      throw new AuthError('You do not have permission to delete this reservation');
    }

    if (userRole === 'staff' && existingReservation.created_by !== user.id) {
      throw new AuthError('Staff can only delete reservations they created');
    }

    // Delete the reservation
    const { error } = await supabase.from('reservations').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Reservation deleted successfully' });
  }
);
