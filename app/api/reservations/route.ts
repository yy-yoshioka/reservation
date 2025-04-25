import { createClient } from "@/app/lib/supabase/server";
import { withErrorHandling } from "@/app/lib/server-error";
import { ValidationError, AuthError } from "@/app/lib/errors/common";
import { getUser } from "@/app/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// GET /api/reservations - Get all reservations (with filtering options)
export const GET = withErrorHandling(async (request: NextRequest) => {
  const supabase = await createClient();

  // Get the current user
  const user = await getUser();
  if (!user) {
    throw new AuthError();
  }

  // Parse query parameters
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const offset = (page - 1) * limit;

  // Start building the query
  let query = supabase
    .from("reservations")
    .select(
      "*, users!customer_id(first_name, last_name, email), users!created_by(first_name, last_name, email)",
      { count: "exact" }
    );

  // Check the user's role from metadata
  const userRole = user.user_metadata?.role || "customer";

  // Apply role-based filtering (RLS will handle this, but we're being explicit)
  if (userRole === "customer") {
    query = query.eq("customer_id", user.id);
  } else if (userRole === "staff") {
    // Staff can see all reservations or just the ones they created
    const onlyMine = searchParams.get("onlyMine") === "true";
    if (onlyMine) {
      query = query.eq("created_by", user.id);
    }
  }
  // Admins can see all reservations, so no additional filtering needed

  // Apply filters
  if (status) {
    query = query.eq("status", status);
  }

  if (startDate) {
    query = query.gte("start_time", startDate);
  }

  if (endDate) {
    query = query.lte("end_time", endDate);
  }

  // Apply pagination
  query = query
    .range(offset, offset + limit - 1)
    .order("start_time", { ascending: true });

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

// POST /api/reservations - Create a new reservation
export const POST = withErrorHandling(async (request: NextRequest) => {
  const supabase = await createClient();

  // Get the current user
  const user = await getUser();
  if (!user) {
    throw new AuthError();
  }

  // Parse the request body
  const body = await request.json();

  // Validate required fields
  const requiredFields = ["title", "start_time", "end_time", "status"];
  const missingFields: Record<string, string> = {};

  for (const field of requiredFields) {
    if (!body[field]) {
      missingFields[field] = `${field} is required`;
    }
  }

  if (Object.keys(missingFields).length > 0) {
    throw new ValidationError("Validation failed", missingFields);
  }

  // Validate time interval
  const startTime = new Date(body.start_time);
  const endTime = new Date(body.end_time);

  if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
    throw new ValidationError("Invalid date format", {
      time: "Start time and end time must be valid dates",
    });
  }

  if (startTime >= endTime) {
    throw new ValidationError("Invalid time range", {
      time: "End time must be after start time",
    });
  }

  // Check for overlapping reservations (optional, as DB constraints handle this too)
  const { data: overlapping, error: overlapError } = await supabase
    .from("reservations")
    .select("id")
    .or(
      `start_time,lt.${endTime.toISOString()},end_time,gt.${startTime.toISOString()}`
    )
    .not("status", "eq", "cancelled")
    .limit(1);

  if (overlapError) {
    return NextResponse.json({ error: overlapError.message }, { status: 500 });
  }

  if (overlapping && overlapping.length > 0) {
    throw new ValidationError("Overlapping reservation", {
      time: "This time slot is already booked",
    });
  }

  // Prepare the reservation data
  const reservation = {
    title: body.title,
    description: body.description || null,
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString(),
    status: body.status,
    // If admin or staff is creating a reservation for another user
    customer_id: body.customer_id || user.id,
    created_by: user.id,
  };

  // Insert the reservation
  const { data, error } = await supabase
    .from("reservations")
    .insert(reservation)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // If there are additional details, insert them
  if (body.special_requests || body.number_of_people || body.additional_notes) {
    const details = {
      reservation_id: data.id,
      special_requests: body.special_requests || null,
      number_of_people: body.number_of_people || null,
      additional_notes: body.additional_notes || null,
    };

    const { error: detailsError } = await supabase
      .from("reservation_details")
      .insert(details);

    if (detailsError) {
      // If details insertion fails, we should still return the reservation
      console.error("Failed to insert reservation details:", detailsError);
    }
  }

  return NextResponse.json({ data }, { status: 201 });
});
