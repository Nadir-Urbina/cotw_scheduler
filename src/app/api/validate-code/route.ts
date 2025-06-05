import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    
    // Get the reservation code from environment variables
    const reservationCode = process.env.RESERVATION_CODE;
    
    if (!reservationCode) {
      return NextResponse.json(
        { error: 'Reservation code not configured' },
        { status: 500 }
      );
    }
    
    // Validate the provided code
    const isValid = code === reservationCode;
    
    return NextResponse.json({ valid: isValid });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
} 