import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface LogEntry {
  id?: string;
  timestamp: any;
  author: string;
  action: 'book' | 'cancel' | 'edit';
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
    const logData = await request.json();
    
    // Validate required fields
    if (!logData.author || !logData.action || !logData.roomId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create the log entry
    const logEntry: Omit<LogEntry, 'id'> = {
      timestamp: serverTimestamp(),
      author: logData.author,
      action: logData.action,
      roomId: logData.roomId,
      roomName: logData.roomName || '',
      dayId: logData.dayId || '',
      dayName: logData.dayName || '',
      date: logData.date || '',
      slotId: logData.slotId || '',
      slotTime: logData.slotTime || '',
      attendeeName: logData.attendeeName,
      attendeeEmail: logData.attendeeEmail,
      attendeePhone: logData.attendeePhone,
      attendeeNotes: logData.attendeeNotes,
      previousAttendee: logData.previousAttendee,
    };

    // Add to Firestore
    const docRef = await addDoc(collection(db, 'action_logs'), logEntry);
    
    return NextResponse.json({ 
      success: true, 
      id: docRef.id 
    });
  } catch (error) {
    console.error('Error logging action:', error);
    return NextResponse.json(
      { error: 'Failed to log action' },
      { status: 500 }
    );
  }
} 