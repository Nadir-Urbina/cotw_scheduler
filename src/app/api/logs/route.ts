import { NextRequest, NextResponse } from 'next/server';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('search');
    const limitParam = searchParams.get('limit');
    
    let logsQuery = query(
      collection(db, 'action_logs'),
      orderBy('timestamp', 'desc')
    );
    
    // Apply limit if specified
    if (limitParam) {
      const limitNumber = parseInt(limitParam);
      if (!isNaN(limitNumber) && limitNumber > 0) {
        logsQuery = query(logsQuery, limit(limitNumber));
      }
    } else {
      // Default limit to prevent excessive data
      logsQuery = query(logsQuery, limit(1000));
    }
    
    const snapshot = await getDocs(logsQuery);
    let logs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore timestamp to ISO string for JSON serialization
      timestamp: doc.data().timestamp?.toDate?.()?.toISOString() || null
    }));
    
    // Apply client-side filtering if search term is provided
    if (searchTerm && searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      logs = logs.filter(log => 
        log.author?.toLowerCase().includes(searchLower) ||
        log.roomName?.toLowerCase().includes(searchLower) ||
        log.dayName?.toLowerCase().includes(searchLower) ||
        log.slotTime?.toLowerCase().includes(searchLower) ||
        log.attendeeName?.toLowerCase().includes(searchLower) ||
        log.attendeeEmail?.toLowerCase().includes(searchLower) ||
        log.attendeePhone?.toLowerCase().includes(searchLower) ||
        log.action?.toLowerCase().includes(searchLower) ||
        log.previousAttendee?.name?.toLowerCase().includes(searchLower)
      );
    }
    
    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    );
  }
} 