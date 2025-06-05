import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface LogEntry {
  id?: string;
  timestamp: any;
  author: string;
  action: 'book' | 'cancel';
  roomId: string;
  roomName: string;
  dayId: string;
  dayName: string;
  date: string;
  slotId: string;
  slotTime: string;
  attendeeName?: string;
  attendeeEmail?: string;
  attendeePhone?: string;
  attendeeNotes?: string;
  previousAttendee?: {
    name: string;
    email: string;
    phone: string;
    notes?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const logData: Omit<LogEntry, 'id' | 'timestamp'> = await request.json();
    
    // Add server timestamp to the log entry
    const logEntry = {
      ...logData,
      timestamp: serverTimestamp(),
    };
    
    // Save to Firebase
    const docRef = await addDoc(collection(db, 'action_logs'), logEntry);
    
    return NextResponse.json({ 
      success: true, 
      logId: docRef.id 
    });
  } catch (error) {
    console.error('Error saving log:', error);
    return NextResponse.json(
      { error: 'Failed to save log' },
      { status: 500 }
    );
  }
} 