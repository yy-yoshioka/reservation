import { createClient } from "@/app/lib/supabase/server";
import { withErrorHandling } from "@/app/lib/server-error";
import { ValidationError } from "@/app/lib/errors/common";
import { NextRequest, NextResponse } from "next/server";

// GET /api/availability - Get available time slots
export const GET = withErrorHandling(async (request: NextRequest) => {
  const supabase = await createClient();

  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Validate date parameters
    if (!date && (!startDate || !endDate)) {
      throw new ValidationError("Date parameters required", {
        date: "Either date or startDate and endDate must be provided",
      });
    }

    let startDateObj, endDateObj;

    if (date) {
      // If a single date is provided, we find availability for that day
      startDateObj = new Date(date);
      startDateObj.setHours(0, 0, 0, 0);

      endDateObj = new Date(date);
      endDateObj.setHours(23, 59, 59, 999);
    } else {
      // If date range is provided, we find availability for the entire range
      startDateObj = new Date(startDate!);
      endDateObj = new Date(endDate!);
    }

    // Validate date objects
    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      throw new ValidationError("Invalid date format", {
        date: "Dates must be in a valid format (YYYY-MM-DD)",
      });
    }

    if (startDateObj > endDateObj) {
      throw new ValidationError("Invalid date range", {
        date: "Start date must be before or equal to end date",
      });
    }

    // Check if the availability_settings table exists
    const { error: tableCheckError } = await supabase
      .from("availability_settings")
      .select("count(*)", { count: "exact", head: true });

    // If the table doesn't exist or any other error happens, return default availability
    if (tableCheckError) {
      console.error("Error checking availability table:", tableCheckError);

      // Return default time slots (9 AM to 5 PM for each day in the range)
      const defaultTimeSlots = generateDefaultTimeSlots(
        startDateObj,
        endDateObj
      );

      return NextResponse.json({
        data: defaultTimeSlots,
        meta: {
          total: defaultTimeSlots.length,
          startDate: startDateObj.toISOString(),
          endDate: endDateObj.toISOString(),
          note: "Using default availability due to database setup issues",
        },
      });
    }

    // Fetch existing reservations for the date range
    const { data: reservations, error: reservationsError } = await supabase
      .from("reservations")
      .select("start_time, end_time")
      .gte("start_time", startDateObj.toISOString())
      .lte("end_time", endDateObj.toISOString())
      .not("status", "eq", "cancelled");

    if (reservationsError) {
      return NextResponse.json(
        { error: reservationsError.message },
        { status: 500 }
      );
    }

    // Fetch availability settings based on requested date(s)
    // We need to determine which days of the week are included in the request
    const daysOfWeek = new Set<number>();
    const currentDate = new Date(startDateObj);

    while (currentDate <= endDateObj) {
      daysOfWeek.add(currentDate.getDay()); // 0 for Sunday, 1 for Monday, etc.
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Fetch availability settings for the days we need
    const { data: availabilitySettings, error: availabilityError } =
      await supabase
        .from("availability_settings")
        .select("*")
        .in("day_of_week", Array.from(daysOfWeek))
        .eq("is_available", true);

    if (availabilityError) {
      return NextResponse.json(
        { error: availabilityError.message },
        { status: 500 }
      );
    }

    // Generate time slots based on availability settings
    const timeSlots: Array<{ start: string; end: string }> = [];

    // For each day in the range
    currentDate.setTime(startDateObj.getTime());
    while (currentDate <= endDateObj) {
      const dayOfWeek = currentDate.getDay();

      // Find settings for this day of week
      const settings = availabilitySettings?.find(
        (setting) => setting.day_of_week === dayOfWeek
      );

      // If we have settings for this day and it's available
      if (settings && settings.is_available) {
        const dayStart = new Date(currentDate);
        const [startHours, startMinutes] = settings.start_time
          .split(":")
          .map(Number);
        dayStart.setHours(startHours, startMinutes, 0, 0);

        const dayEnd = new Date(currentDate);
        const [endHours, endMinutes] = settings.end_time.split(":").map(Number);
        dayEnd.setHours(endHours, endMinutes, 0, 0);

        // Default time slot duration (30 minutes)
        const slotDuration = 30 * 60 * 1000; // 30 minutes in milliseconds

        // Generate slots for the day
        const slotStart = new Date(dayStart);
        while (slotStart < dayEnd) {
          const slotEnd = new Date(slotStart.getTime() + slotDuration);

          // Check if this slot overlaps with any existing reservation
          const isAvailable = !reservations?.some((reservation) => {
            const reservationStart = new Date(reservation.start_time);
            const reservationEnd = new Date(reservation.end_time);

            // Check for overlap
            return (
              (slotStart >= reservationStart && slotStart < reservationEnd) ||
              (slotEnd > reservationStart && slotEnd <= reservationEnd) ||
              (slotStart <= reservationStart && slotEnd >= reservationEnd)
            );
          });

          if (isAvailable) {
            timeSlots.push({
              start: slotStart.toISOString(),
              end: slotEnd.toISOString(),
            });
          }

          // Move to next slot
          slotStart.setTime(slotStart.getTime() + slotDuration);
        }
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return NextResponse.json({
      data: timeSlots,
      meta: {
        total: timeSlots.length,
        startDate: startDateObj.toISOString(),
        endDate: endDateObj.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error in availability endpoint:", error);

    // Generate default time slots for fallback
    const startDateObj = new Date(
      request.nextUrl.searchParams.get("startDate") || new Date()
    );
    const endDateObj = new Date(
      request.nextUrl.searchParams.get("endDate") || new Date()
    );
    endDateObj.setDate(startDateObj.getDate() + 7); // Default to a week if dates are invalid

    const defaultTimeSlots = generateDefaultTimeSlots(startDateObj, endDateObj);

    return NextResponse.json({
      data: defaultTimeSlots,
      meta: {
        total: defaultTimeSlots.length,
        startDate: startDateObj.toISOString(),
        endDate: endDateObj.toISOString(),
        note: "Using default availability due to an error",
      },
    });
  }
});

// Helper function to generate default time slots
function generateDefaultTimeSlots(startDate: Date, endDate: Date) {
  const timeSlots = [];
  const currentDate = new Date(startDate);

  // Loop through each day in the range
  while (currentDate <= endDate) {
    // Skip to next day if current date is in the past
    if (currentDate < new Date()) {
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }

    // Create slots from 9 AM to 5 PM with 30-minute intervals
    const dayStart = new Date(currentDate);
    dayStart.setHours(9, 0, 0, 0);

    const dayEnd = new Date(currentDate);
    dayEnd.setHours(17, 0, 0, 0);

    // Generate 30-minute slots
    const slotDuration = 30 * 60 * 1000;
    const slotStart = new Date(dayStart);

    while (slotStart < dayEnd) {
      const slotEnd = new Date(slotStart.getTime() + slotDuration);

      timeSlots.push({
        start: slotStart.toISOString(),
        end: slotEnd.toISOString(),
      });

      // Move to next slot
      slotStart.setTime(slotStart.getTime() + slotDuration);
    }

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return timeSlots;
}
