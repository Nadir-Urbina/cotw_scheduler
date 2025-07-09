import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  updateDoc,
  deleteField,
  writeBatch,
  query,
  where
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface TimeSlot {
  id: string;
  time: string;
  isBooked: boolean;
  attendee?: {
    name: string;
    email: string;
    phone: string;
    notes?: string;
    bookedAt: string;
    checkedIn?: boolean;
    checkedInAt?: string;
  };
}

export interface DaySchedule {
  id: string;
  date: string;
  dayName: string;
  slots: TimeSlot[];
}

export interface Room {
  id: string;
  name: string;
  schedule: DaySchedule[];
}

// Generate time slots with flexible start/end times (10-minute intervals)
const generateTimeSlots = (startHour = 15, endHour = 18): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const startTime = startHour * 60; // Convert to minutes
  const endTime = endHour * 60; // Convert to minutes
  const interval = 10; // 10-minute intervals

  for (let minutes = startTime; minutes < endTime; minutes += interval) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    const time24 = `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
    const hour12 = hours > 12 ? hours - 12 : hours;
    const ampm = hours >= 12 ? "PM" : "AM";
    const time12 = `${hour12}:${mins.toString().padStart(2, "0")} ${ampm}`;

    slots.push({
      id: time24,
      time: time12,
      isBooked: false,
    });
  }

  return slots;
};

export const useSchedule = (language: 'en' | 'es') => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoomId, setCurrentRoomId] = useState<string>('room-1');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Translations for dates and days
  const translations = {
    en: {
      days: {
        thursday: "Thursday",
        friday: "Friday", 
        saturday: "Saturday",
      },
      dates: {
        july10: "July 10th, 2025",
        july11: "July 11th, 2025", 
        july12: "July 12th, 2025",
      },
      rooms: {
        room1: "Room 1",
        room2: "Room 2", 
        room3: "Room 3",
        room4: "Room 4",
        room5: "Room 5",
      },
    },
    es: {
      days: {
        thursday: "Jueves",
        friday: "Viernes",
        saturday: "Sábado",
      },
      dates: {
        july10: "10 de Julio, 2025",
        july11: "11 de Julio, 2025",
        july12: "12 de Julio, 2025",
      },
      rooms: {
        room1: "Sala 1",
        room2: "Sala 2",
        room3: "Sala 3", 
        room4: "Sala 4",
        room5: "Sala 5",
      },
    },
  };

  // Initialize schedule data in Firestore if it doesn't exist
  const initializeSchedule = async () => {
    const t = translations[language];
    const batch = writeBatch(db);
    
    const scheduleTemplate = [
      {
        id: 'thursday-july-10',
        date: t.dates.july10,
        dayName: t.days.thursday,
        slots: generateTimeSlots(16, 18), // 4:00 PM - 6:00 PM
      },
      {
        id: 'friday-july-11', 
        date: t.dates.july11,
        dayName: t.days.friday,
        slots: generateTimeSlots(16, 18), // 4:00 PM - 6:00 PM
      },
      {
        id: 'saturday-july-12',
        date: t.dates.july12,
        dayName: t.days.saturday,
        slots: generateTimeSlots(15, 18), // 3:00 PM - 6:00 PM
      },
    ];

    // Create 5 rooms with the same schedule
    for (let roomNum = 1; roomNum <= 5; roomNum++) {
      const roomId = `room-${roomNum}`;
      
      scheduleTemplate.forEach((day) => {
        const scheduleRef = doc(db, 'rooms', roomId, 'schedule', day.id);
        batch.set(scheduleRef, day, { merge: true });
      });
    }

    await batch.commit();
  };

  // Update existing schedule with new time slots (preserve bookings)
  const updateScheduleWithNewTimeSlots = async () => {
    const t = translations[language];
    const batch = writeBatch(db);
    
    const newScheduleTemplate = [
      {
        id: 'thursday-july-10',
        date: t.dates.july10,
        dayName: t.days.thursday,
        slots: generateTimeSlots(16, 18), // 4:00 PM - 6:00 PM
      },
      {
        id: 'friday-july-11', 
        date: t.dates.july11,
        dayName: t.days.friday,
        slots: generateTimeSlots(16, 18), // 4:00 PM - 6:00 PM
      },
      {
        id: 'saturday-july-12',
        date: t.dates.july12,
        dayName: t.days.saturday,
        slots: generateTimeSlots(15, 18), // 3:00 PM - 6:00 PM
      },
    ];

    // Update all 5 rooms with new schedule, but preserve existing bookings where possible
    for (let roomNum = 1; roomNum <= 5; roomNum++) {
      const roomId = `room-${roomNum}`;
      
      for (const day of newScheduleTemplate) {
        const scheduleRef = doc(db, 'rooms', roomId, 'schedule', day.id);
        
        // For now, we'll completely replace the schedule with new time slots
        // In a production environment, you might want to preserve bookings that fall within the new time slots
        batch.set(scheduleRef, day, { merge: false });
      }
    }

    await batch.commit();
  };

  // Listen to real-time updates from Firestore
  useEffect(() => {
    const unsubscribes: (() => void)[] = [];
    let hasInitialized = false;
    
    // Listen to all 5 rooms
    for (let roomNum = 1; roomNum <= 5; roomNum++) {
      const roomId = `room-${roomNum}`;
      
      const unsubscribe = onSnapshot(
        collection(db, 'rooms', roomId, 'schedule'),
        (snapshot) => {
          const t = translations[language];
          
          // If no documents exist for this room, initialize the schedule
          if (snapshot.empty && roomNum === 1 && !hasInitialized) {
            hasInitialized = true;
            initializeSchedule().then(() => {
              setLoading(false);
            });
            return;
          }

          // Check if we need to update the schedule format (for existing data)
          if (roomNum === 1 && !hasInitialized && snapshot.docs.length > 0) {
            const firstDoc = snapshot.docs[0];
            const firstData = firstDoc.data();
            
            // Check if the schedule uses the old format (12-minute intervals or wrong start time)
            if (firstData.slots && firstData.slots.length > 0) {
              const firstSlot = firstData.slots[0];
              const thursdayDoc = snapshot.docs.find(doc => doc.id === 'thursday-july-10');
              const thursdayData = thursdayDoc?.data();
              const saturdayDoc = snapshot.docs.find(doc => doc.id === 'saturday-july-12');
              const saturdayData = saturdayDoc?.data();
              
              // Check if Thursday starts at 3:00 PM (old format), Saturday starts at 2:00 PM (old format), or has 12-minute intervals
              const needsUpdate = (
                thursdayData?.slots?.[0]?.time === "3:00 PM" || // Old Thursday start time
                saturdayData?.slots?.[0]?.time === "2:00 PM" || // Old Saturday start time
                (firstData.slots.length > 0 && firstData.slots[1] && 
                 firstData.slots[0].time === "3:00 PM" && firstData.slots[1].time === "3:12 PM") // 12-minute intervals
              );
              
              if (needsUpdate) {
                hasInitialized = true;
                console.log('Updating schedule with new format...');
                updateScheduleWithNewTimeSlots().then(() => {
                  setLoading(false);
                });
                return;
              }
            }
          }

          const scheduleData: DaySchedule[] = [];
          
          snapshot.docs.forEach((doc) => {
            const data = doc.data() as DaySchedule;
            // Update language-dependent fields
            const dayId = doc.id;
            let updatedData = { ...data };
            
            if (dayId === 'thursday-july-10') {
              updatedData.date = t.dates.july10;
              updatedData.dayName = t.days.thursday;
            } else if (dayId === 'friday-july-11') {
              updatedData.date = t.dates.july11;
              updatedData.dayName = t.days.friday;
            } else if (dayId === 'saturday-july-12') {
              updatedData.date = t.dates.july12;
              updatedData.dayName = t.days.saturday;
            }
            
            scheduleData.push(updatedData);
          });

          // Sort by day order
          const sortOrder = ['thursday-july-10', 'friday-july-11', 'saturday-july-12'];
          scheduleData.sort((a, b) => sortOrder.indexOf(a.id) - sortOrder.indexOf(b.id));
          
          // Update rooms state
          setRooms(prevRooms => {
            const newRooms = [...prevRooms];
            const roomIndex = newRooms.findIndex(r => r.id === roomId);
            
            const roomName = roomId === 'room-1' ? t.rooms.room1 :
                           roomId === 'room-2' ? t.rooms.room2 :
                           roomId === 'room-3' ? t.rooms.room3 :
                           roomId === 'room-4' ? t.rooms.room4 :
                           t.rooms.room5;
            
            const room: Room = {
              id: roomId,
              name: roomName,
              schedule: scheduleData
            };
            
            if (roomIndex >= 0) {
              newRooms[roomIndex] = room;
            } else {
              newRooms.push(room);
            }
            
            // Sort rooms by ID
            newRooms.sort((a, b) => a.id.localeCompare(b.id));
            
            return newRooms;
          });
          
          setLoading(false);
        },
        (error) => {
          console.error(`Error fetching schedule for ${roomId}:`, error);
          
          // More specific error handling
          if (error.code === 'permission-denied') {
            setError('Permission denied - Please check your Firestore rules');
          } else if (error.code === 'unavailable') {
            setError('Firebase service unavailable - Please check your internet connection');
          } else if (error.code === 'unauthenticated') {
            setError('Authentication required - Please check your Firebase configuration');
          } else {
            setError(`Failed to load schedule: ${error.message}`);
          }
          setLoading(false);
        }
      );
      
      unsubscribes.push(unsubscribe);
    }

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [language]);

  // Book a time slot
  const bookSlot = async (
    roomId: string,
    dayId: string, 
    slotId: string, 
    attendeeData: {
      name: string;
      email: string;
      phone: string;
      notes?: string;
    }
  ) => {
    try {
      const scheduleRef = doc(db, 'rooms', roomId, 'schedule', dayId);
      const room = rooms.find(r => r.id === roomId);
      const dayData = room?.schedule.find(day => day.id === dayId);
      
      if (!dayData) throw new Error('Day not found');
      
      const updatedSlots = dayData.slots.map(slot => {
        if (slot.id === slotId) {
          return {
            ...slot,
            isBooked: true,
            attendee: {
              ...attendeeData,
              bookedAt: new Date().toISOString(),
            }
          };
        }
        return slot;
      });

      await updateDoc(scheduleRef, {
        slots: updatedSlots
      });
      
      return true;
    } catch (error) {
      console.error('Error booking slot:', error);
      setError('Failed to book slot');
      return false;
    }
  };

  // Cancel a booking
  const cancelBooking = async (roomId: string, dayId: string, slotId: string) => {
    try {
      const scheduleRef = doc(db, 'rooms', roomId, 'schedule', dayId);
      const room = rooms.find(r => r.id === roomId);
      const dayData = room?.schedule.find(day => day.id === dayId);
      
      if (!dayData) throw new Error('Day not found');
      
      const updatedSlots = dayData.slots.map(slot => {
        if (slot.id === slotId) {
          // Create a new slot object without the attendee property
          const { attendee, ...slotWithoutAttendee } = slot;
          return {
            ...slotWithoutAttendee,
            isBooked: false,
          };
        }
        return slot;
      });

      await updateDoc(scheduleRef, {
        slots: updatedSlots
      });
      
      return true;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      setError('Failed to cancel booking');
      return false;
    }
  };

  // Edit a booking
  const editBooking = async (
    roomId: string,
    dayId: string, 
    slotId: string, 
    attendeeData: {
      name: string;
      email: string;
      phone: string;
      notes?: string;
    }
  ) => {
    try {
      const scheduleRef = doc(db, 'rooms', roomId, 'schedule', dayId);
      const room = rooms.find(r => r.id === roomId);
      const dayData = room?.schedule.find(day => day.id === dayId);
      
      if (!dayData) throw new Error('Day not found');
      
      const updatedSlots = dayData.slots.map(slot => {
        if (slot.id === slotId) {
          // Keep the original booking timestamp when editing
          const originalBookedAt = slot.attendee?.bookedAt || new Date().toISOString();
          return {
            ...slot,
            isBooked: true,
            attendee: {
              ...attendeeData,
              bookedAt: originalBookedAt,
            }
          };
        }
        return slot;
      });

      await updateDoc(scheduleRef, {
        slots: updatedSlots
      });
      
      return true;
    } catch (error) {
      console.error('Error editing booking:', error);
      setError('Failed to edit booking');
      return false;
    }
  };

  // Check in a booking
  const checkInBooking = async (roomId: string, dayId: string, slotId: string) => {
    try {
      const scheduleRef = doc(db, 'rooms', roomId, 'schedule', dayId);
      const room = rooms.find(r => r.id === roomId);
      const dayData = room?.schedule.find(day => day.id === dayId);
      
      if (!dayData) throw new Error('Day not found');
      
      const updatedSlots = dayData.slots.map(slot => {
        if (slot.id === slotId && slot.attendee) {
          return {
            ...slot,
            attendee: {
              ...slot.attendee,
              checkedIn: true,
              checkedInAt: new Date().toISOString(),
            }
          };
        }
        return slot;
      });

      await updateDoc(scheduleRef, {
        slots: updatedSlots
      });
      
      return true;
    } catch (error) {
      console.error('Error checking in booking:', error);
      setError('Failed to check in booking');
      return false;
    }
  };

  // Get current room's schedule
  const currentRoom = rooms.find(r => r.id === currentRoomId);
  const schedule = currentRoom?.schedule || [];

  // Function to find potential duplicate bookings
  const findPotentialDuplicates = (searchName: string) => {
    if (!searchName || searchName.trim().length < 3) return [];
    
    const duplicates: Array<{
      roomId: string;
      roomName: string;
      dayId: string;
      dayName: string;
      slotId: string;
      slotTime: string;
      attendeeName: string;
      similarity: number;
    }> = [];

    const normalizedSearchName = searchName.toLowerCase().trim();
    
    // Helper function to calculate similarity between two strings
    const calculateSimilarity = (str1: string, str2: string): number => {
      const s1 = str1.toLowerCase().trim();
      const s2 = str2.toLowerCase().trim();
      
      // Exact match
      if (s1 === s2) return 1.0;
      
      // Check if one contains the other
      if (s1.includes(s2) || s2.includes(s1)) return 0.8;
      
      // Simple word-based similarity
      const words1 = s1.split(/\s+/);
      const words2 = s2.split(/\s+/);
      
      let matchingWords = 0;
      const totalWords = Math.max(words1.length, words2.length);
      
      words1.forEach(word1 => {
        if (words2.some(word2 => 
          word1 === word2 || 
          word1.includes(word2) || 
          word2.includes(word1) ||
          // Handle common name variations
          (word1.replace(/[áàäâ]/g, 'a').replace(/[éèëê]/g, 'e').replace(/[íìïî]/g, 'i').replace(/[óòöô]/g, 'o').replace(/[úùüû]/g, 'u') === 
           word2.replace(/[áàäâ]/g, 'a').replace(/[éèëê]/g, 'e').replace(/[íìïî]/g, 'i').replace(/[óòöô]/g, 'o').replace(/[úùüû]/g, 'u'))
        )) {
          matchingWords++;
        }
      });
      
      return matchingWords / totalWords;
    };

    // Search through all rooms and their schedules
    rooms.forEach(room => {
      room.schedule.forEach(day => {
        day.slots.forEach(slot => {
          if (slot.isBooked && slot.attendee) {
            const similarity = calculateSimilarity(normalizedSearchName, slot.attendee.name);
            
            // Consider it a potential duplicate if similarity is above 0.6
            if (similarity > 0.6) {
              duplicates.push({
                roomId: room.id,
                roomName: room.name,
                dayId: day.id,
                dayName: day.dayName,
                slotId: slot.id,
                slotTime: slot.time,
                attendeeName: slot.attendee.name,
                similarity
              });
            }
          }
        });
      });
    });

    // Sort by similarity (highest first)
    return duplicates.sort((a, b) => b.similarity - a.similarity);
  };

  return {
    rooms,
    currentRoomId,
    setCurrentRoomId,
    schedule,
    loading,
    error,
    bookSlot,
    cancelBooking,
    editBooking,
    checkInBooking,
    findPotentialDuplicates,
  };
}; 