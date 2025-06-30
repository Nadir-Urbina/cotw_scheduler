import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code, type } = await request.json();
    
    // Get the appropriate code from environment variables
    let validCode: string | undefined;
    
    if (type === 'cancel' || type === 'edit') {
      // Both cancellation and editing use the same code for security
      validCode = process.env.CANCELLATION_CODE;
    } else {
      // Default to reservation code for booking
      validCode = process.env.RESERVATION_CODE;
    }
    
    if (!validCode) {
      const codeType = type === 'cancel' ? 'Cancellation' : type === 'edit' ? 'Edit' : 'Reservation';
      return NextResponse.json(
        { error: `${codeType} code not configured` },
        { status: 500 }
      );
    }
    
    // Validate the provided code
    const isValid = code === validCode;
    
    return NextResponse.json({ valid: isValid });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
} 