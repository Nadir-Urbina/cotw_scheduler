"use client"

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
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
  Loader2
} from "lucide-react";
import { useSchedule, TimeSlot } from '@/hooks/useSchedule';
import { useAuth } from '@/hooks/useAuth';
import { PasswordDialog } from './PasswordDialog';
import { toast } from "sonner";
import Link from "next/link";

interface AdminPanelProps {
  language: 'en' | 'es';
}

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
  },
};

export function AdminPanel({ language }: AdminPanelProps) {
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

  const { user, isStaff, signIn, logout } = useAuth();
  const { rooms, cancelBooking, editBooking, checkInBooking } = useSchedule(language);
  const t = translations[language];

  const handleLogin = async () => {
    setIsLoggingIn(true);
    const success = await signIn(loginEmail, loginPassword);
    if (success) {
      setIsLoginOpen(false);
      setLoginEmail('');
      setLoginPassword('');
      toast.success("Successfully logged in");
    } else {
      toast.error(t.loginError);
    }
    setIsLoggingIn(false);
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Successfully logged out");
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
      // Log the check-in action
      await logCheckInAction(roomId, dayId, slotId, booking);
      
      toast.success(t.checkedInSuccess);
      setPendingCheckIn(null); // Clear the confirmation state
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
    if (!editingBooking) return;

    setIsUpdating(true);
    
    // Get the current attendee data before editing for logging
    const previousAttendee = editingBooking.booking.slot.attendee ? {
      name: editingBooking.booking.slot.attendee.name,
      email: editingBooking.booking.slot.attendee.email,
      phone: editingBooking.booking.slot.attendee.phone,
      notes: editingBooking.booking.slot.attendee.notes || '',
    } : undefined;

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
      // Log the edit action
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
          attendeeName: booking.slot.attendee?.name || 'Unknown',
          attendeeEmail: booking.slot.attendee?.email || 'Unknown',
          attendeePhone: booking.slot.attendee?.phone || 'Unknown',
          attendeeNotes: booking.slot.attendee?.notes || 'Unknown',
        }),
      });
    } catch (error) {
      console.error('Failed to log check-in action:', error);
    }
  };

  const getAllBookings = () => {
    const bookings: Array<{
      roomName: string;
      roomId: string;
      dayName: string;
      date: string;
      dayId: string;
      slot: TimeSlot;
    }> = [];

    rooms.forEach(room => {
      room.schedule.forEach(day => {
        day.slots.forEach(slot => {
          if (slot.isBooked && slot.attendee) {
            bookings.push({
              roomName: room.name,
              roomId: room.id,
              dayName: day.dayName,
              date: day.date,
              dayId: day.id,
              slot,
            });
          }
        });
      });
    });

    return bookings.sort((a, b) => {
      // Sort by room first, then by day, then by time
      if (a.roomId !== b.roomId) {
        return a.roomId.localeCompare(b.roomId);
      }
      if (a.dayId !== b.dayId) {
        const dayOrder = ['thursday-july-10', 'friday-july-11', 'saturday-july-12'];
        return dayOrder.indexOf(a.dayId) - dayOrder.indexOf(b.dayId);
      }
      return a.slot.time.localeCompare(b.slot.time);
    });
  };

  const getTotalBookedSlots = () => {
    return rooms.reduce((total, room) => {
      return total + room.schedule.reduce((roomTotal, day) => {
        return roomTotal + day.slots.filter((slot) => slot.isBooked).length;
      }, 0);
    }, 0);
  };

  const getTotalSlots = () => {
    return rooms.reduce((total, room) => {
      return total + room.schedule.reduce((roomTotal, day) => roomTotal + day.slots.length, 0);
    }, 0);
  };

  const exportToCSV = () => {
    const bookings = getAllBookings();
    const headers = ['Room', 'Day', 'Date', 'Time', 'Name', 'Email', 'Phone', 'Notes', 'Booked At'];
    
    const csvContent = [
      headers.join(','),
      ...bookings.map(booking => [
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
  };

  if (!user || !isStaff) {
    return (
      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <UserCheck className="w-4 h-4 mr-2" />
            {t.staffOnly}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t.login}</DialogTitle>
            <DialogDescription>{t.loginDescription}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
          </div>
          <DialogFooter>
            <Button 
              onClick={handleLogin} 
              disabled={isLoggingIn || !loginEmail || !loginPassword}
              className="w-full"
            >
              {isLoggingIn ? t.loading : t.loginButton}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const allBookings = getAllBookings();

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t.adminPanel}</h1>
          <p className="text-sm sm:text-base text-gray-600">{t.welcome}, {user?.email}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Link href="/logs">
            <Button variant="outline" size="sm" className="w-full sm:w-auto h-10">
              <FileText className="w-4 h-4 sm:mr-2" />
              <span className="sm:inline">{t.viewLogs}</span>
            </Button>
          </Link>
          <Button onClick={exportToCSV} variant="outline" size="sm" className="w-full sm:w-auto h-10">
            <Download className="w-4 h-4 sm:mr-2" />
            <span className="sm:inline">{t.exportData}</span>
          </Button>
          <Button onClick={handleLogout} variant="outline" size="sm" className="w-full sm:w-auto h-10">
            <LogOut className="w-4 h-4 sm:mr-2" />
            <span className="sm:inline">{t.logout}</span>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 sm:mb-6">
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-blue-700">{t.totalBookings}</CardTitle>
            <User className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent className="pb-3">
            <div className="text-2xl sm:text-3xl font-bold text-blue-800">{getTotalBookedSlots()}</div>
            <p className="text-xs text-blue-600 mt-1">
              Across {rooms.length} rooms
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-green-200 bg-gradient-to-r from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-green-700">{t.availableSlots}</CardTitle>
            <Clock className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent className="pb-3">
            <div className="text-2xl sm:text-3xl font-bold text-green-800">{getTotalSlots() - getTotalBookedSlots()}</div>
            <p className="text-xs text-green-600 mt-1">
              Available spots
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-gray-700">{t.totalSlots}</CardTitle>
            <Calendar className="h-5 w-5 text-gray-600" />
          </CardHeader>
          <CardContent className="pb-3">
            <div className="text-2xl sm:text-3xl font-bold text-gray-800">{getTotalSlots()}</div>
            <p className="text-xs text-gray-600 mt-1">
              {rooms.length} rooms × 3 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* All Bookings - Mobile Responsive */}
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
          {allBookings.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="flex flex-col items-center gap-2">
                <Calendar className="w-8 h-8 text-gray-300" />
                <span>No bookings yet</span>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {allBookings.map((booking, index) => (
                <div 
                  key={`${booking.roomId}-${booking.dayId}-${booking.slot.id}`}
                  className="p-4 sm:p-6 hover:bg-gray-50 transition-colors border-l-4 border-l-transparent hover:border-l-indigo-500"
                >
                  {/* Mobile Layout */}
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
                      {/* Check-in Button - Most Prominent */}
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
              ))}
            </div>
          )}
          
          {/* Summary Footer */}
          <div className="p-4 bg-gray-50 border-t">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <p className="text-sm text-gray-600">
                {allBookings.length} total bookings
              </p>
              <p className="text-sm text-green-600 font-medium">
                {allBookings.filter(b => b.slot.attendee?.checkedIn).length} checked in
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password Dialog */}
      <PasswordDialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
        onSuccess={handlePasswordSuccess}
        title={t.accessRequired}
        description={t.accessRequiredForEdit}
        language={language}
        type="edit"
      />

      {/* Edit Booking Dialog */}
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

      {/* Check In Confirmation Dialog */}
      <AlertDialog open={!!pendingCheckIn} onOpenChange={() => setPendingCheckIn(null)}>
        <AlertDialogContent className="max-w-md mx-4 sm:mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-green-700 text-lg">
              <UserCheck className="w-5 h-5" />
              {t.confirmCheckIn}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 text-base">
              <div>{t.checkInWarning}</div>
              {pendingCheckIn && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="font-medium text-green-800 flex items-center gap-2 mb-2">
                    <User className="w-4 h-4" />
                    {t.checkInConfirmText} {pendingCheckIn.booking.slot.attendee?.name}
                  </div>
                  <div className="text-sm text-green-600">
                    {pendingCheckIn.booking.roomName} • {pendingCheckIn.booking.dayName} • {pendingCheckIn.booking.slot.time}
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
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
  );
} 