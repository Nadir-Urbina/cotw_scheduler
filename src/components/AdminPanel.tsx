"use client"

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DoorOpen
} from "lucide-react";
import { useSchedule, TimeSlot } from '@/hooks/useSchedule';
import { useAuth } from '@/hooks/useAuth';
import { toast } from "sonner";

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
    delete: "Delete",
    confirmDelete: "Confirm Delete",
    deleteWarning: "Are you sure you want to delete this booking? This action cannot be undone.",
    cancel: "Cancel",
    bookingDeleted: "Booking deleted successfully",
    deleteError: "Failed to delete booking",
    exportData: "Export Data",
    login: "Staff Login",
    loginDescription: "Enter your staff credentials to access the admin panel",
    loginButton: "Sign In",
    loginError: "Invalid credentials",
    staffOnly: "Staff members only",
    loading: "Loading...",
    room: "Room",
    acrossAllRooms: "Manage all conference bookings across all rooms",
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
    delete: "Eliminar",
    confirmDelete: "Confirmar Eliminación",
    deleteWarning: "¿Está seguro de que desea eliminar esta reserva? Esta acción no se puede deshacer.",
    cancel: "Cancelar",
    bookingDeleted: "Reserva eliminada exitosamente",
    deleteError: "Error al eliminar la reserva",
    exportData: "Exportar Datos",
    login: "Acceso para Personal",
    loginDescription: "Ingrese sus credenciales de personal para acceder al panel de administración",
    loginButton: "Iniciar Sesión",
    loginError: "Credenciales inválidas",
    staffOnly: "Solo para personal",
    loading: "Cargando...",
    room: "Sala",
    acrossAllRooms: "Gestionar todas las reservas de la conferencia en todas las salas",
  },
};

export function AdminPanel({ language }: AdminPanelProps) {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const { user, isStaff, signIn, logout } = useAuth();
  const { rooms, cancelBooking } = useSchedule(language);
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
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t.adminPanel}</h2>
          <p className="text-gray-600">{t.welcome}, {user.email}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-2" />
            {t.exportData}
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            {t.logout}
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.totalBookings}</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">{getTotalBookedSlots()}</div>
            <p className="text-xs text-muted-foreground">
              Across {rooms.length} rooms
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.availableSlots}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{getTotalSlots() - getTotalBookedSlots()}</div>
            <p className="text-xs text-muted-foreground">
              Across {rooms.length} rooms
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.totalSlots}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{getTotalSlots()}</div>
            <p className="text-xs text-muted-foreground">
              {rooms.length} rooms × 3 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* All Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t.allBookings}</CardTitle>
          <CardDescription>
            {t.acrossAllRooms}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.room}</TableHead>
                  <TableHead>{t.day}</TableHead>
                  <TableHead>{t.time}</TableHead>
                  <TableHead>{t.name}</TableHead>
                  <TableHead>{t.email}</TableHead>
                  <TableHead>{t.phone}</TableHead>
                  <TableHead>{t.notes}</TableHead>
                  <TableHead>{t.bookedAt}</TableHead>
                  <TableHead>{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      No bookings yet
                    </TableCell>
                  </TableRow>
                ) : (
                  allBookings.map((booking, index) => (
                    <TableRow key={`${booking.roomId}-${booking.dayId}-${booking.slot.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <DoorOpen className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">{booking.roomName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{booking.dayName}</div>
                          <div className="text-sm text-gray-500">{booking.date}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{booking.slot.time}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{booking.slot.attendee?.name}</TableCell>
                      <TableCell>{booking.slot.attendee?.email}</TableCell>
                      <TableCell>{booking.slot.attendee?.phone}</TableCell>
                      <TableCell className="max-w-xs truncate">{booking.slot.attendee?.notes}</TableCell>
                      <TableCell>
                        {booking.slot.attendee?.bookedAt 
                          ? new Date(booking.slot.attendee.bookedAt).toLocaleString()
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t.confirmDelete}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t.deleteWarning}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteBooking(booking.roomId, booking.dayId, booking.slot.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                {t.delete}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 