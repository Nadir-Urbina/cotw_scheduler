"use client"

import { useState, useMemo, useCallback, memo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  FileText, 
  Trash2, 
  LogOut,
  Download,
  UserCheck,
  DoorOpen,
  Edit,
  Loader2,
  Languages,
  ArrowLeft,
  Search,
  X
} from "lucide-react";
import { useSchedule, TimeSlot } from '@/hooks/useSchedule';
import { useAuth } from '@/hooks/useAuth';
import { PasswordDialog } from '@/components/PasswordDialog';
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

type Language = "en" | "es"

// Memoized booking card component to prevent unnecessary re-renders
const BookingCard = memo(({ 
  booking, 
  index, 
  t, 
  handleEditBookingClick, 
  handleDeleteBooking, 
  handleCheckInClick 
}: {
  booking: any;
  index: number;
  t: any;
  handleEditBookingClick: (roomId: string, dayId: string, slotId: string, booking: any) => void;
  handleDeleteBooking: (roomId: string, dayId: string, slotId: string) => void;
  handleCheckInClick: (roomId: string, dayId: string, slotId: string, booking: any) => void;
}) => (
  <div 
    className="p-4 sm:p-6 hover:bg-gray-50 transition-colors border-l-4 border-l-transparent hover:border-l-indigo-500"
  >
    <div className="space-y-4">
      {/* Header with Room and Status */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <DoorOpen className="w-5 h-5 text-gray-500 flex-shrink-0" />
          <div className="min-w-0">
            <div className="font-semibold text-gray-900 text-base truncate">{booking.roomName}</div>
            <div className="text-sm text-gray-500">{booking.dayName}</div>
            <div className="text-xs text-gray-400">{booking.date}</div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <Badge variant="outline" className="text-xs font-medium">{booking.slot.time}</Badge>
          {booking.slot.attendee?.checkedIn ? (
            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 text-xs">
              <UserCheck className="w-3 h-3 mr-1" />
              {t.checkedInStatus}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50 text-xs">
              <Clock className="w-3 h-3 mr-1" />
              {t.notCheckedInStatus}
            </Badge>
          )}
        </div>
      </div>

      {/* Attendee Information */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-gray-500" />
          <span className="font-medium text-gray-900 text-base">{booking.slot.attendee?.name}</span>
        </div>
        {booking.slot.attendee?.email && (
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="break-all">{booking.slot.attendee.email}</span>
          </div>
        )}
        {booking.slot.attendee?.phone && (
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Phone className="w-4 h-4 text-gray-400" />
            <span>{booking.slot.attendee.phone}</span>
          </div>
        )}
        {booking.slot.attendee?.notes && (
          <div className="flex items-start gap-3 text-sm text-gray-600">
            <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <span className="break-words">{booking.slot.attendee.notes}</span>
          </div>
        )}
        <div className="flex items-center gap-3 text-xs text-gray-500 pt-1 border-t border-gray-200">
          <Clock className="w-3 h-3 text-gray-400" />
          <span>
            {booking.slot.attendee?.bookedAt 
              ? new Date(booking.slot.attendee.bookedAt).toLocaleString()
              : '-'
            }
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        {/* Check-in Button */}
        {booking.slot.attendee?.checkedIn ? (
          <div className="flex items-center gap-2 text-green-600 text-base font-medium px-4 py-3 bg-green-50 rounded-lg justify-center border border-green-200">
            <UserCheck className="w-5 h-5" />
            <span>Checked In</span>
          </div>
        ) : (
          <Button 
            variant="default" 
            size="lg"
            onClick={() => handleCheckInClick(booking.roomId, booking.dayId, booking.slot.id, booking)}
            className="bg-green-600 hover:bg-green-700 text-white h-12 text-base font-medium sm:flex-1"
          >
            <UserCheck className="w-5 h-5 mr-2" />
            {t.checkIn}
          </Button>
        )}
        
        <div className="flex gap-3 sm:gap-2">
          {/* Edit Button */}
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => handleEditBookingClick(booking.roomId, booking.dayId, booking.slot.id, booking)}
            className="border-blue-200 text-blue-600 hover:bg-blue-50 h-12 flex-1 sm:flex-none sm:w-12 sm:px-0"
          >
            <Edit className="w-5 h-5 sm:w-4 sm:h-4" />
            <span className="sm:hidden ml-2">Edit</span>
          </Button>
          
          {/* Delete Button */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                size="lg"
                className="border-red-200 text-red-600 hover:bg-red-50 h-12 flex-1 sm:flex-none sm:w-12 sm:px-0"
              >
                <Trash2 className="w-5 h-5 sm:w-4 sm:h-4" />
                <span className="sm:hidden ml-2">Delete</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="mx-4 sm:mx-auto">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-lg">{t.confirmDelete}</AlertDialogTitle>
                <AlertDialogDescription className="text-base">
                  {t.deleteWarning}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
                <AlertDialogCancel className="w-full sm:w-auto h-12 sm:h-10">{t.cancel}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDeleteBooking(booking.roomId, booking.dayId, booking.slot.id)}
                  className="bg-red-600 hover:bg-red-700 w-full sm:w-auto h-12 sm:h-10"
                >
                  {t.delete}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  </div>
));

BookingCard.displayName = 'BookingCard';

const translations = {
  en: {
    adminPanel: "Admin Panel",
    welcome: "Welcome",
    logout: "Logout",
    overview: "Overview",
    totalBookings: "Total Bookings",
    availableSlots: "Available Slots", 
    totalSlots: "Total Slots",
    allBookings: "All Bookings",
    day: "Day",
    time: "Time",
    name: "Name",
    email: "Email",
    phone: "Phone",
    notes: "Notes",
    bookedAt: "Booked At",
    actions: "Actions",
    edit: "Edit",
    delete: "Delete",
    checkIn: "Check In",
    checkOut: "Checked In",
    confirmDelete: "Confirm Delete",
    confirmCheckIn: "Confirm Check-In",
    checkInWarning: "Are you sure you want to check in this attendee?",
    checkInConfirmText: "Check in:",
    deleteWarning: "Are you sure you want to delete this booking? This action cannot be undone.",
    cancel: "Cancel",
    bookingDeleted: "Booking deleted successfully",
    bookingUpdated: "Booking updated successfully",
    checkedInSuccess: "Attendee checked in successfully",
    deleteError: "Failed to delete booking",
    updateError: "Failed to update booking",
    checkInError: "Failed to check in attendee",
    exportData: "Export Data",
    viewLogs: "View Team Logs",
    editBooking: "Edit Booking",
    editBookingDescription: "Update the details for this reservation",
    fullName: "Full Name",
    emailAddress: "Email Address",
    phoneNumber: "Phone Number",
    specialNotes: "Special Notes",
    update: "Update",
    updating: "Updating...",
    accessRequired: "Access Code Required",
    accessRequiredForEdit: "Please enter the access code to edit this reservation.",
    login: "Staff Login",
    loginDescription: "Enter your staff credentials to access the admin panel",
    loginButton: "Sign In",
    loginError: "Invalid credentials",
    staffOnly: "Staff members only",
    loading: "Loading...",
    room: "Room",
    acrossAllRooms: "Manage all conference bookings across all rooms",
    checkedInAt: "Checked In At",
    status: "Status",
    checkedInStatus: "Checked In",
    notCheckedInStatus: "Not Checked In",
    backToSchedule: "Back to Schedule",
    language: "Language",
    english: "English",
    spanish: "Español",
    search: "Search",
    searchPlaceholder: "Search by attendee name...",
    clearSearch: "Clear Search",
    noResults: "No bookings found",
    showingResults: "Showing results for",
    searchResults: "search results",
  },
  es: {
    adminPanel: "Panel de Administración",
    welcome: "Bienvenido",
    logout: "Cerrar Sesión",
    overview: "Resumen",
    totalBookings: "Total de Reservas",
    availableSlots: "Horarios Disponibles",
    totalSlots: "Total de Horarios", 
    allBookings: "Todas las Reservas",
    day: "Día",
    time: "Hora",
    name: "Nombre",
    email: "Correo",
    phone: "Teléfono",
    notes: "Notas",
    bookedAt: "Reservado el",
    actions: "Acciones",
    edit: "Editar",
    delete: "Eliminar",
    checkIn: "Registrar Asistencia",
    checkOut: "Asistió",
    confirmDelete: "Confirmar Eliminación",
    confirmCheckIn: "Confirmar Asistencia",
    checkInWarning: "¿Está seguro de que desea registrar la asistencia de este asistente?",
    checkInConfirmText: "Asistió:",
    deleteWarning: "¿Está seguro de que desea eliminar esta reserva? Esta acción no se puede deshacer.",
    cancel: "Cancelar",
    bookingDeleted: "Reserva eliminada exitosamente",
    bookingUpdated: "Reserva actualizada exitosamente",
    checkedInSuccess: "Asistencia registrada exitosamente",
    deleteError: "Error al eliminar la reserva",
    updateError: "Error al actualizar la reserva",
    checkInError: "Error al registrar la asistencia",
    exportData: "Exportar Datos",
    viewLogs: "Ver Registros del Equipo",
    editBooking: "Editar Reserva",
    editBookingDescription: "Actualizar los detalles de esta reserva",
    fullName: "Nombre Completo",
    emailAddress: "Dirección de Correo",
    phoneNumber: "Número de Teléfono",
    specialNotes: "Notas Especiales",
    update: "Actualizar",
    updating: "Actualizando...",
    accessRequired: "Código de Acceso Requerido",
    accessRequiredForEdit: "Por favor ingrese el código de acceso para editar esta reserva.",
    login: "Acceso para Personal",
    loginDescription: "Ingrese sus credenciales de personal para acceder al panel de administración",
    loginButton: "Iniciar Sesión",
    loginError: "Credenciales inválidas",
    staffOnly: "Solo para personal",
    loading: "Cargando...",
    room: "Sala",
    acrossAllRooms: "Gestionar todas las reservas de la conferencia en todas las salas",
    checkedInAt: "Asistió el",
    status: "Estado",
    checkedInStatus: "Asistió",
    notCheckedInStatus: "No Asistió",
    backToSchedule: "Volver a Horarios",
    language: "Idioma",
    english: "English",
    spanish: "Español",
    search: "Buscar",
    searchPlaceholder: "Buscar por nombre del asistente...",
    clearSearch: "Limpiar Búsqueda",
    noResults: "No se encontraron reservas",
    showingResults: "Mostrando resultados para",
    searchResults: "resultados de búsqueda",
  },
};

export default function AdminPage() {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>("es");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [editingBooking, setEditingBooking] = useState<{
    roomId: string;
    dayId: string;
    slotId: string;
    booking: any;
  } | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [pendingCheckIn, setPendingCheckIn] = useState<{
    roomId: string;
    dayId: string;
    slotId: string;
    booking: any;
  } | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
  });

  const { user, signInWithEmailAndPassword, signOut, isStaff } = useAuth();
  const { 
    rooms, 
    loading, 
    error, 
    cancelBooking,
    editBooking,
    checkInBooking
  } = useSchedule(language);

  const t = translations[language];

  const handleLanguageToggle = (checked: boolean) => {
    const newLanguage = checked ? "en" : "es"
    setLanguage(newLanguage)
  }

  // Debounce search input for better performance
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }, [])

  const handleClearSearch = useCallback(() => {
    setSearchTerm("")
    setDebouncedSearchTerm("")
  }, [])

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await signInWithEmailAndPassword(loginEmail, loginPassword);
      setIsLoginOpen(false);
      setLoginEmail('');
      setLoginPassword('');
    } catch (error) {
      toast.error(t.loginError);
    }
    setIsLoggingIn(false);
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  const handleDeleteBooking = async (roomId: string, dayId: string, slotId: string) => {
    const success = await cancelBooking(roomId, dayId, slotId);
    if (success) {
      toast.success(t.bookingDeleted);
    } else {
      toast.error(t.deleteError);
    }
  };

  const handleCheckIn = async (roomId: string, dayId: string, slotId: string, booking: any) => {
    const success = await checkInBooking(roomId, dayId, slotId);
    if (success) {
      await logCheckInAction(roomId, dayId, slotId, booking);
      toast.success(t.checkedInSuccess);
      setPendingCheckIn(null);
    } else {
      toast.error(t.checkInError);
    }
  };

  const handleCheckInClick = (roomId: string, dayId: string, slotId: string, booking: any) => {
    setPendingCheckIn({ roomId, dayId, slotId, booking });
  };

  const handleConfirmCheckIn = () => {
    if (pendingCheckIn) {
      handleCheckIn(
        pendingCheckIn.roomId, 
        pendingCheckIn.dayId, 
        pendingCheckIn.slotId, 
        pendingCheckIn.booking
      );
    }
  };

  const handleEditBookingClick = (roomId: string, dayId: string, slotId: string, booking: any) => {
    setEditingBooking({ roomId, dayId, slotId, booking });
    setEditFormData({
      name: booking.slot.attendee?.name || '',
      email: booking.slot.attendee?.email || '',
      phone: booking.slot.attendee?.phone || '',
      notes: booking.slot.attendee?.notes || '',
    });
    setIsPasswordDialogOpen(true);
  };

  const handlePasswordSuccess = (authorName: string) => {
    setIsPasswordDialogOpen(false);
    setIsEditDialogOpen(true);
  };

  const handleUpdateBooking = async () => {
    if (!editingBooking || !editFormData.name.trim()) return;

    const previousAttendee = editingBooking.booking.slot.attendee ? {
      name: editingBooking.booking.slot.attendee.name,
      email: editingBooking.booking.slot.attendee.email,
      phone: editingBooking.booking.slot.attendee.phone,
      notes: editingBooking.booking.slot.attendee.notes || '',
    } : undefined;

    setIsUpdating(true);
    const success = await editBooking(
      editingBooking.roomId, 
      editingBooking.dayId, 
      editingBooking.slotId, 
      {
        name: editFormData.name.trim(),
        email: editFormData.email.trim(),
        phone: editFormData.phone.trim(),
        notes: editFormData.notes.trim(),
      }
    );

    if (success) {
      await logEditAction(previousAttendee);
      toast.success(t.bookingUpdated);
      setIsEditDialogOpen(false);
      setEditingBooking(null);
      setEditFormData({ name: '', email: '', phone: '', notes: '' });
    } else {
      toast.error(t.updateError);
    }
    setIsUpdating(false);
  };

  const logEditAction = async (previousAttendee?: any) => {
    if (!editingBooking) return;

    try {
      await fetch('/api/log-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          author: user?.email || 'Unknown',
          action: 'edit',
          roomId: editingBooking.roomId,
          roomName: editingBooking.booking.roomName,
          dayId: editingBooking.dayId,
          dayName: editingBooking.booking.dayName,
          date: editingBooking.booking.date,
          slotId: editingBooking.slotId,
          slotTime: editingBooking.booking.slot.time,
          attendeeName: editFormData.name.trim(),
          attendeeEmail: editFormData.email.trim(),
          attendeePhone: editFormData.phone.trim(),
          attendeeNotes: editFormData.notes.trim(),
          previousAttendee,
        }),
      });
    } catch (error) {
      console.error('Failed to log edit action:', error);
    }
  };

  const logCheckInAction = async (roomId: string, dayId: string, slotId: string, booking: any) => {
    try {
      await fetch('/api/log-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          author: user?.email || 'Unknown',
          action: 'checkin',
          roomId: roomId,
          roomName: booking.roomName,
          dayId: dayId,
          dayName: booking.dayName,
          date: booking.date,
          slotId: slotId,
          slotTime: booking.slot.time,
          attendeeName: booking.slot.attendee?.name,
          attendeeEmail: booking.slot.attendee?.email,
          attendeePhone: booking.slot.attendee?.phone,
          attendeeNotes: booking.slot.attendee?.notes,
        }),
      });
    } catch (error) {
      console.error('Failed to log check-in action:', error);
    }
  };

  // Memoize booking data to avoid recalculating on every render
  const allBookings = useMemo(() => {
    const bookings: Array<{
      roomId: string;
      roomName: string;
      dayId: string;
      dayName: string;
      date: string;
      slot: TimeSlot;
    }> = [];

    // Use the rooms data directly from the hook
    rooms.forEach(room => {
      room.schedule.forEach(day => {
        day.slots.forEach(slot => {
          if (slot.isBooked && slot.attendee) {
            bookings.push({
              roomId: room.id,
              roomName: room.name,
              dayId: day.id,
              dayName: day.dayName,
              date: day.date,
              slot,
            });
          }
        });
      });
    });

    return bookings.sort((a, b) => {
      const aDateTime = new Date(`${a.date} ${a.slot.time}`);
      const bDateTime = new Date(`${b.date} ${b.slot.time}`);
      return aDateTime.getTime() - bDateTime.getTime();
    });
  }, [rooms]);

  // Optimized search filtering - name field only for maximum speed
  const filteredBookings = useMemo(() => {
    const trimmedSearch = debouncedSearchTerm.trim();
    
    // Don't search until at least 2 characters to avoid rendering too many results
    if (trimmedSearch.length < 2) return allBookings;
    
    const searchLower = trimmedSearch.toLowerCase();
    
    const results = allBookings.filter(booking => {
      // Early return if attendee doesn't exist
      if (!booking.slot.attendee?.name) return false;
      
      // Search only in attendee name for fastest performance
      return booking.slot.attendee.name.toLowerCase().includes(searchLower);
    });
    
    // Limit results to prevent too many DOM updates at once
    return results.slice(0, 50);
  }, [allBookings, debouncedSearchTerm]);

  // Memoized statistics calculations
  const totalBookedSlots = useMemo(() => {
    let total = 0;
    rooms.forEach(room => {
      room.schedule.forEach(day => {
        total += day.slots.filter(slot => slot.isBooked).length;
      });
    });
    return total;
  }, [rooms]);

  const totalSlots = useMemo(() => {
    let total = 0;
    rooms.forEach(room => {
      room.schedule.forEach(day => {
        total += day.slots.length;
      });
    });
    return total;
  }, [rooms]);

  const exportToCSV = useCallback(() => {
    const headers = ['Room', 'Day', 'Date', 'Time', 'Name', 'Email', 'Phone', 'Notes', 'Booked At'];
    
    const csvContent = [
      headers.join(','),
      ...allBookings.map(booking => [
        booking.roomName,
        booking.dayName,
        booking.date,
        booking.slot.time,
        booking.slot.attendee?.name || '',
        booking.slot.attendee?.email || '',
        booking.slot.attendee?.phone || '',
        `"${booking.slot.attendee?.notes || ''}"`,
        booking.slot.attendee?.bookedAt ? new Date(booking.slot.attendee.bookedAt).toLocaleString() : ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prophetic-rooms-bookings.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }, [allBookings]);

  if (!user || !isStaff) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-6 max-w-4xl mx-auto">
              <Link href="/">
                <Button variant="outline" className="lg:flex-shrink-0">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t.backToSchedule}
                </Button>
              </Link>
              
              <div className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm w-full sm:w-auto max-w-sm lg:max-w-none justify-center lg:justify-start lg:flex-shrink-0">
                <Languages className="w-4 h-4 text-gray-600 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">{t.language}:</span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm whitespace-nowrap ${language === "en" ? "font-semibold text-indigo-600" : "text-gray-500"}`}>
                    {t.english}
                  </span>
                  <Switch checked={language === "es"} onCheckedChange={handleLanguageToggle} />
                  <span className={`text-sm whitespace-nowrap ${language === "es" ? "font-semibold text-indigo-600" : "text-gray-500"}`}>
                    {t.spanish}
                  </span>
                </div>
              </div>
            </div>

            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">{t.adminPanel}</h1>
              <p className="text-gray-600 max-w-3xl mx-auto text-sm md:text-base lg:text-lg px-2 leading-relaxed">
                {t.staffOnly}
              </p>
            </div>
          </div>

          {/* Login Card */}
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{t.login}</CardTitle>
              <CardDescription>{t.loginDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="staff@crestofthewave.org"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleLogin} 
                disabled={isLoggingIn || !loginEmail || !loginPassword}
                className="w-full"
              >
                {isLoggingIn ? t.loading : t.loginButton}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Using memoized data - no need to call functions

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-6 max-w-6xl mx-auto">
            <Link href="/">
              <Button variant="outline" className="lg:flex-shrink-0">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t.backToSchedule}
              </Button>
            </Link>
            
            <div className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm w-full sm:w-auto max-w-sm lg:max-w-none justify-center lg:justify-start lg:flex-shrink-0">
              <Languages className="w-4 h-4 text-gray-600 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">{t.language}:</span>
              <div className="flex items-center gap-2">
                <span className={`text-sm whitespace-nowrap ${language === "en" ? "font-semibold text-indigo-600" : "text-gray-500"}`}>
                  {t.english}
                </span>
                <Switch checked={language === "es"} onCheckedChange={handleLanguageToggle} />
                <span className={`text-sm whitespace-nowrap ${language === "es" ? "font-semibold text-indigo-600" : "text-gray-500"}`}>
                  {t.spanish}
                </span>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">{t.adminPanel}</h1>
            <p className="text-gray-600 max-w-3xl mx-auto text-sm md:text-base lg:text-lg px-2 leading-relaxed">
              {t.welcome}, {user?.email}
            </p>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3 max-w-2xl mx-auto">
            {/* Desktop-only buttons */}
            <Link href="/logs" className="hidden sm:block">
              <Button variant="outline" size="sm" className="w-auto h-10">
                <FileText className="w-4 h-4 mr-2" />
                <span>{t.viewLogs}</span>
              </Button>
            </Link>
            <Button onClick={exportToCSV} variant="outline" size="sm" className="hidden sm:inline-flex w-auto h-10">
              <Download className="w-4 h-4 mr-2" />
              <span>{t.exportData}</span>
            </Button>
            
            {/* Always visible logout button */}
            <Button onClick={handleLogout} variant="outline" size="sm" className="w-full sm:w-auto h-10">
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="sm:inline">{t.logout}</span>
            </Button>
          </div>

          {/* Search Bar */}
          <div className="max-w-lg mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10 pr-10"
              />
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  title={t.clearSearch}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {searchTerm && (
              <div className="mt-2 text-center text-sm text-gray-600">
                {searchTerm.trim().length < 2 ? (
                  <span className="text-gray-500">
                    {language === 'es' ? 'Escriba al menos 2 caracteres para buscar...' : 'Type at least 2 characters to search...'}
                  </span>
                ) : filteredBookings.length > 0 ? (
                  <span>
                    {t.showingResults} "{searchTerm}" - {filteredBookings.length} {t.searchResults}
                    {filteredBookings.length === 50 && (
                      <span className="text-gray-400">
                        {language === 'es' ? ' (mostrando primeros 50)' : ' (showing first 50)'}
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="text-gray-500">{t.noResults}</span>
                )}
              </div>
            )}
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6 max-w-4xl mx-auto">
            <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3 p-3 sm:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-blue-700">{t.totalBookings}</CardTitle>
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </CardHeader>
              <CardContent className="pb-2 sm:pb-3 px-3 sm:px-6">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-800">{totalBookedSlots}</div>
                <p className="text-xs text-blue-600 mt-1 hidden sm:block">
                  Across {rooms.length} rooms
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-green-200 bg-gradient-to-r from-green-50 to-green-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3 p-3 sm:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-green-700">{t.availableSlots}</CardTitle>
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              </CardHeader>
              <CardContent className="pb-2 sm:pb-3 px-3 sm:px-6">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-800">{totalSlots - totalBookedSlots}</div>
                <p className="text-xs text-green-600 mt-1 hidden sm:block">
                  Available spots
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3 p-3 sm:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-700">{t.totalSlots}</CardTitle>
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
              </CardHeader>
              <CardContent className="pb-2 sm:pb-3 px-3 sm:px-6">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">{totalSlots}</div>
                <p className="text-xs text-gray-600 mt-1 hidden sm:block">
                  {rooms.length} rooms × 3 days
                </p>
              </CardContent>
            </Card>
          </div>

          {/* All Bookings */}
          <Card className="shadow-lg border-t-4 border-t-indigo-500">
            <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="w-5 h-5" />
                {t.allBookings}
              </CardTitle>
              <CardDescription className="text-indigo-100">
                {t.acrossAllRooms}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {filteredBookings.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <Calendar className="w-8 h-8 text-gray-300" />
                    <span>
                      {debouncedSearchTerm && debouncedSearchTerm.trim().length >= 2 ? t.noResults : 
                       debouncedSearchTerm ? (language === 'es' ? 'Escriba al menos 2 caracteres para buscar...' : 'Type at least 2 characters to search...') : 
                       (language === 'es' ? 'Aún no hay reservas' : 'No bookings yet')}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredBookings.map((booking, index) => (
                    <BookingCard
                      key={`${booking.roomId}-${booking.dayId}-${booking.slot.id}`}
                      booking={booking}
                      index={index}
                      t={t}
                      handleEditBookingClick={handleEditBookingClick}
                      handleDeleteBooking={handleDeleteBooking}
                      handleCheckInClick={handleCheckInClick}
                                        />
                  ))}
                </div>
              )}
              
              {/* Summary Footer */}
              <div className="p-4 bg-gray-50 border-t">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <p className="text-sm text-gray-600">
                    {debouncedSearchTerm && debouncedSearchTerm.trim().length >= 2 ? (
                      <>
                        {filteredBookings.length} of {allBookings.length} bookings
                        {filteredBookings.length === 50 && (
                          <span className="text-gray-400">
                            {language === 'es' ? ' (máx. 50 mostrados)' : ' (max 50 shown)'}
                          </span>
                        )}
                        <span className="text-gray-400"> (filtered)</span>
                      </>
                    ) : (
                      `${allBookings.length} total bookings`
                    )}
                  </p>
                  <p className="text-sm text-green-600 font-medium">
                    {filteredBookings.filter(b => b.slot.attendee?.checkedIn).length} checked in
                    {debouncedSearchTerm && debouncedSearchTerm.trim().length >= 2 && filteredBookings.length !== allBookings.length && (
                      <span className="text-gray-400"> (in results)</span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dialogs */}
        <PasswordDialog
          open={isPasswordDialogOpen}
          onOpenChange={setIsPasswordDialogOpen}
          onSuccess={handlePasswordSuccess}
          title={t.accessRequired}
          description={t.accessRequiredForEdit}
          language={language}
          type="edit"
        />

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t.editBooking}</DialogTitle>
              <DialogDescription>
                {t.editBookingDescription}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">{t.fullName}</Label>
                <Input
                  id="edit-name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  disabled={isUpdating}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">{t.emailAddress}</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  disabled={isUpdating}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-phone">{t.phoneNumber}</Label>
                <Input
                  id="edit-phone"
                  type="tel"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  disabled={isUpdating}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-notes">{t.specialNotes}</Label>
                <Textarea
                  id="edit-notes"
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                  disabled={isUpdating}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isUpdating}
              >
                {t.cancel}
              </Button>
              <Button 
                onClick={handleUpdateBooking} 
                disabled={!editFormData.name.trim() || isUpdating}
              >
                {isUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isUpdating ? t.updating : t.update}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!pendingCheckIn} onOpenChange={() => setPendingCheckIn(null)}>
          <AlertDialogContent className="max-w-md mx-4 sm:mx-auto">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-green-700 text-lg">
                <UserCheck className="w-5 h-5" />
                {t.confirmCheckIn}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base">
                {t.checkInWarning}
              </AlertDialogDescription>
            </AlertDialogHeader>
            {pendingCheckIn && (
              <div className="px-6 pb-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="font-medium text-green-800 flex items-center gap-2 mb-2">
                    <User className="w-4 h-4" />
                    {t.checkInConfirmText} {pendingCheckIn.booking.slot.attendee?.name}
                  </div>
                  <div className="text-sm text-green-600">
                    {pendingCheckIn.booking.roomName} • {pendingCheckIn.booking.dayName} • {pendingCheckIn.booking.slot.time}
                  </div>
                </div>
              </div>
            )}
            <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
              <AlertDialogCancel 
                onClick={() => setPendingCheckIn(null)}
                className="w-full sm:w-auto h-12 sm:h-10"
              >
                {t.cancel}
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleConfirmCheckIn} 
                className="bg-green-600 hover:bg-green-700 focus:ring-green-500 w-full sm:w-auto h-12 sm:h-10"
              >
                <UserCheck className="w-4 h-4 mr-2" />
                {t.checkIn}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
} 