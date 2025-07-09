"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Clock, User, Languages, Loader2, AlertCircle, DoorOpen, Info, Search, X, Settings } from "lucide-react"
import { useSchedule } from "@/hooks/useSchedule"
import { PasswordDialog } from "@/components/PasswordDialog"
import { toast } from "sonner"
import Link from "next/link"

type Language = "en" | "es"

// Translations
const translations = {
  en: {
    title: "Crest of the Wave",
    subtitle: "Prophetic Rooms Scheduler",
    description:
      "Schedule your 10-minute Prophetic Room session during our conference. Select an available time slot to book your appointment.",
    booked: "Booked",
    available: "Available",
    totalSlots: "Total Slots",
    bookSlot: "Book Time Slot",
    bookingDetails: "Booking Details",
    editBooking: "Edit Reservation",
    fullName: "Full Name",
    email: "Email",
    phone: "Phone Number",
    notes: "Notes (Optional)",
    specialRequests: "Any special requests or notes",
    book: "Book Slot",
    update: "Update Reservation",
    cancel: "Cancel",
    close: "Close",
    cancelBooking: "Cancel Booking",
    enterFullName: "Enter full name",
    enterEmail: "Enter email address",
    enterPhone: "Enter phone number",
    time: "Time",
    language: "Language",
    english: "English",
    spanish: "Español",
    loading: "Loading schedule...",
    error: "Error loading schedule",
    bookingSuccess: "Slot booked successfully!",
    editSuccess: "Reservation updated successfully!",
    cancellationSuccess: "Booking cancelled successfully!",
    bookingError: "Failed to book slot. Please try again.",
    editError: "Failed to update reservation. Please try again.",
    cancellationError: "Failed to cancel booking. Please try again.",
    processing: "Processing...",
    updating: "Updating...",
    schedule: "Schedule",
    admin: "Admin",
    selectRoom: "Select Room",
    currentRoom: "Current Room",
    room: "Room",
    search: "Search",
    searchPlaceholder: "Search by name, time, or day...",
    clearSearch: "Clear Search",
    noResults: "No results found",
    showingResults: "Showing results for",
    accessRequired: "Access Code Required",
    accessRequiredForBooking: "Please enter the access code to make a reservation.",
    accessRequiredForCancellation: "Please enter the access code to cancel this reservation.",
    accessRequiredForEdit: "Please enter the access code to edit this reservation.",
    duplicateWarning: "Similar Name Found",
    duplicateFound: "We found a similar booking:",
    duplicateFoundMultiple: "We found similar bookings:",
    duplicateDetails: "in {room} on {day} at {time}",
    duplicateNote: "Please verify this is not a duplicate booking.",
  },
  es: {
    title: "Crest of the Wave",
    subtitle: "Programador de Salas Proféticas",
    description:
      "Programa tu sesión de 10 minutos en la Sala Profética durante nuestra conferencia. Selecciona un horario disponible para reservar tu cita.",
    booked: "Reservado",
    available: "Disponible",
    totalSlots: "Total de Horarios",
    bookSlot: "Reservar Horario",
    bookingDetails: "Detalles de la Reserva",
    editBooking: "Editar Reserva",
    fullName: "Nombre Completo",
    email: "Correo Electrónico",
    phone: "Número de Teléfono",
    notes: "Notas (Opcional)",
    specialRequests: "Cualquier solicitud especial o notas",
    book: "Reservar",
    update: "Actualizar Reserva",
    cancel: "Cancelar",
    close: "Cerrar",
    cancelBooking: "Cancelar Reserva",
    enterFullName: "Ingrese nombre completo",
    enterEmail: "Ingrese dirección de correo",
    enterPhone: "Ingrese número de teléfono",
    time: "Hora",
    language: "Idioma",
    english: "English",
    spanish: "Español",
    loading: "Cargando horarios...",
    error: "Error al cargar horarios",
    bookingSuccess: "¡Horario reservado exitosamente!",
    editSuccess: "¡Reserva actualizada exitosamente!",
    cancellationSuccess: "¡Reserva cancelada exitosamente!",
    bookingError: "Error al reservar horario. Por favor intente de nuevo.",
    editError: "Error al actualizar reserva. Por favor intente de nuevo.",
    cancellationError: "Error al cancelar reserva. Por favor intente de nuevo.",
    processing: "Procesando...",
    updating: "Actualizando...",
    schedule: "Horarios",
    admin: "Administración",
    selectRoom: "Seleccionar Sala",
    currentRoom: "Sala Actual",
    room: "Sala",
    search: "Buscar",
    searchPlaceholder: "Buscar por nombre, hora, o día...",
    clearSearch: "Limpiar Búsqueda",
    noResults: "No se encontraron resultados",
    showingResults: "Mostrando resultados para",
    accessRequired: "Código de Acceso Requerido",
    accessRequiredForBooking: "Por favor ingrese el código de acceso para hacer una reserva.",
    accessRequiredForCancellation: "Por favor ingrese el código de acceso para cancelar esta reserva.",
    accessRequiredForEdit: "Por favor ingrese el código de acceso para editar esta reserva.",
    duplicateWarning: "Nombre Similar Encontrado",
    duplicateFound: "Encontramos una reserva similar:",
    duplicateFoundMultiple: "Encontramos reservas similares:",
    duplicateDetails: "en {room} el {day} a las {time}",
    duplicateNote: "Por favor verifique que no sea una reserva duplicada.",
  },
}

export default function PropheticRoomsScheduler() {
  const [language, setLanguage] = useState<Language>("es")
  const [selectedSlot, setSelectedSlot] = useState<{ dayId: string; slotId: string } | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<'book' | 'cancel' | 'edit' | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  })

  const { 
    rooms, 
    currentRoomId, 
    setCurrentRoomId, 
    schedule, 
    loading, 
    error, 
    bookSlot, 
    cancelBooking,
    editBooking,
    findPotentialDuplicates
  } = useSchedule(language)
  
  const [duplicates, setDuplicates] = useState<Array<{
    roomId: string;
    roomName: string;
    dayId: string;
    dayName: string;
    slotId: string;
    slotTime: string;
    attendeeName: string;
    similarity: number;
  }>>([])
  
  const t = translations[language]
  const currentRoom = rooms.find(r => r.id === currentRoomId)

  const handleLanguageToggle = (checked: boolean) => {
    const newLanguage = checked ? "en" : "es"
    setLanguage(newLanguage)
  }

  const handleRoomChange = (roomId: string) => {
    setCurrentRoomId(roomId)
  }

  const handleSlotClick = (dayId: string, slotId: string) => {
    const day = schedule.find(d => d.id === dayId)
    const slot = day?.slots.find(s => s.id === slotId)
    
    if (!slot) return

    if (slot.isBooked) {
      setFormData({
        name: slot.attendee?.name || "",
        email: slot.attendee?.email || "",
        phone: slot.attendee?.phone || "",
        notes: slot.attendee?.notes || "",
      })
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        notes: "",
      })
    }
    setSelectedSlot({ dayId, slotId })
    setDuplicates([])
    setIsEditMode(false)
    setIsDialogOpen(true)
  }

  const handleBookSlotRequest = () => {
    setPendingAction('book')
    setIsPasswordDialogOpen(true)
  }

  const handleEditBookingRequest = () => {
    setPendingAction('edit')
    setIsPasswordDialogOpen(true)
  }

  const handleCancelBookingRequest = () => {
    setPendingAction('cancel')
    setIsPasswordDialogOpen(true)
  }

  const handlePasswordSuccess = (authorName: string) => {
    if (pendingAction === 'book') {
      handleBookSlot(authorName)
    } else if (pendingAction === 'cancel') {
      handleCancelBooking(authorName)
    } else if (pendingAction === 'edit') {
      setIsEditMode(true)
      setIsDialogOpen(true)
      // Store the author name for later use in edit
      setFormData(prev => ({ ...prev, authorName }))
    }
    setPendingAction(null)
    setIsPasswordDialogOpen(false)
  }

  const logAction = async (
    action: 'book' | 'cancel' | 'edit',
    authorName: string,
    slotData?: {
      attendeeName?: string;
      attendeeEmail?: string;
      attendeePhone?: string;
      attendeeNotes?: string;
    },
    previousAttendee?: {
      name: string;
      email: string;
      phone: string;
      notes?: string;
    }
  ) => {
    if (!selectedSlot || !currentRoom) return;

    const day = schedule.find(d => d.id === selectedSlot.dayId);
    const slot = day?.slots.find(s => s.id === selectedSlot.slotId);
    
    if (!day || !slot) return;

    try {
      await fetch('/api/log-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          author: authorName,
          action,
          roomId: currentRoom.id,
          roomName: currentRoom.name,
          dayId: day.id,
          dayName: day.dayName,
          date: day.date,
          slotId: slot.id,
          slotTime: slot.time,
          attendeeName: slotData?.attendeeName,
          attendeeEmail: slotData?.attendeeEmail,
          attendeePhone: slotData?.attendeePhone,
          attendeeNotes: slotData?.attendeeNotes,
          previousAttendee,
        }),
      });
    } catch (error) {
      console.error('Failed to log action:', error);
      // Don't prevent the main action from completing if logging fails
    }
  };

  const handleBookSlot = async (authorName: string) => {
    if (!selectedSlot || !formData.name.trim() || !currentRoomId) return

    setIsProcessing(true)
    const success = await bookSlot(currentRoomId, selectedSlot.dayId, selectedSlot.slotId, {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      notes: formData.notes.trim(),
    })

    if (success) {
      // Log the booking action
      await logAction('book', authorName, {
        attendeeName: formData.name.trim(),
        attendeeEmail: formData.email.trim(),
        attendeePhone: formData.phone.trim(),
        attendeeNotes: formData.notes.trim(),
      });

      toast.success(t.bookingSuccess)
      setIsDialogOpen(false)
      setSelectedSlot(null)
      setFormData({ name: "", email: "", phone: "", notes: "" })
    } else {
      toast.error(t.bookingError)
    }
    setIsProcessing(false)
  }

  const handleEditBooking = async () => {
    if (!selectedSlot || !formData.name.trim() || !currentRoomId) return

    const authorName = (formData as any).authorName || 'Unknown'

    // Get the current attendee data before editing for logging
    const day = schedule.find(d => d.id === selectedSlot.dayId);
    const slot = day?.slots.find(s => s.id === selectedSlot.slotId);
    const previousAttendee = slot?.attendee ? {
      name: slot.attendee.name,
      email: slot.attendee.email,
      phone: slot.attendee.phone,
      notes: slot.attendee.notes || '',
    } : undefined;

    setIsProcessing(true)
    const success = await editBooking(currentRoomId, selectedSlot.dayId, selectedSlot.slotId, {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      notes: formData.notes.trim(),
    })

    if (success) {
      // Log the edit action
      await logAction('edit', authorName, {
        attendeeName: formData.name.trim(),
        attendeeEmail: formData.email.trim(),
        attendeePhone: formData.phone.trim(),
        attendeeNotes: formData.notes.trim(),
      }, previousAttendee);

      toast.success(t.editSuccess)
      setIsDialogOpen(false)
      setSelectedSlot(null)
      setIsEditMode(false)
      setFormData({ name: "", email: "", phone: "", notes: "" })
    } else {
      toast.error(t.editError)
    }
    setIsProcessing(false)
  }

  const handleCancelBooking = async (authorName: string) => {
    if (!selectedSlot || !currentRoomId) return

    // Get the current attendee data before canceling for logging
    const day = schedule.find(d => d.id === selectedSlot.dayId);
    const slot = day?.slots.find(s => s.id === selectedSlot.slotId);
    const previousAttendee = slot?.attendee ? {
      name: slot.attendee.name,
      email: slot.attendee.email,
      phone: slot.attendee.phone,
      notes: slot.attendee.notes || '',
    } : undefined;

    setIsProcessing(true)
    const success = await cancelBooking(currentRoomId, selectedSlot.dayId, selectedSlot.slotId)

    if (success) {
      // Log the cancellation action
      await logAction('cancel', authorName, undefined, previousAttendee);

      toast.success(t.cancellationSuccess)
      setIsDialogOpen(false)
      setSelectedSlot(null)
    } else {
      toast.error(t.cancellationError)
    }
    setIsProcessing(false)
  }

  const getTotalBookedSlots = () => {
    return schedule.reduce((total, day) => {
      return total + day.slots.filter((slot) => slot.isBooked).length
    }, 0)
  }

  const getTotalSlots = () => {
    return schedule.reduce((total, day) => total + day.slots.length, 0)
  }

  const currentSlot = selectedSlot 
    ? schedule.find(d => d.id === selectedSlot.dayId)?.slots.find(s => s.id === selectedSlot.slotId)
    : null

  const selectedDay = selectedSlot 
    ? schedule.find(d => d.id === selectedSlot.dayId)
    : null

  // Check for duplicates when name changes
  useEffect(() => {
    if (!formData.name || formData.name.trim().length < 3 || currentSlot?.isBooked) {
      setDuplicates([])
      return
    }

    // Debounce the duplicate check to prevent excessive calls
    const timeoutId = setTimeout(() => {
      const foundDuplicates = findPotentialDuplicates(formData.name)
      setDuplicates(foundDuplicates)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [formData.name, currentSlot?.isBooked])

  // Filter schedule data based on search term
  const filterScheduleBySearch = (scheduleData: any[]) => {
    if (!searchTerm.trim()) return scheduleData

    const searchLower = searchTerm.toLowerCase().trim()
    
    return scheduleData.map(day => ({
      ...day,
      slots: day.slots.filter((slot: { time: string; isBooked: boolean; attendee?: { name: string } }) => {
        // Search in time
        const timeMatch = slot.time?.toLowerCase().includes(searchLower) || false
        
        // Search in day name and date
        const dayMatch = day.dayName?.toLowerCase().includes(searchLower) || 
                        day.date?.toLowerCase().includes(searchLower) || false
        
        // Search in attendee name if slot is booked
        const nameMatch = slot.isBooked && slot.attendee?.name && 
                         slot.attendee.name.toLowerCase().includes(searchLower)
        
        return timeMatch || dayMatch || nameMatch
      })
    })).filter(day => day.slots.length > 0) // Only show days that have matching slots
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleClearSearch = () => {
    setSearchTerm("")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-end mb-4">
              <Skeleton className="h-12 w-48" />
            </div>
            <Skeleton className="h-10 w-96 mx-auto mb-2" />
            <Skeleton className="h-8 w-64 mx-auto mb-4" />
            <Skeleton className="h-16 w-full max-w-2xl mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="shadow-lg">
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid gap-2">
                    {[1, 2, 3, 4, 5].map((j) => (
                      <Skeleton key={j} className="h-16 w-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          <Alert className="max-w-md mx-auto mt-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t.error}: {error}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          {/* Top Controls - Responsive Layout */}
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-6 max-w-4xl mx-auto">
            {/* Admin Link - Responsive positioning */}
            <div className="order-2 lg:order-1 lg:flex-shrink-0">
              <Link href="/admin">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.admin}</span>
                </Button>
              </Link>
            </div>
            
            {/* Language Toggle - Centered on mobile, right on desktop */}
            <div className="order-1 lg:order-2 flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm w-full sm:w-auto max-w-sm lg:max-w-none justify-center lg:justify-start lg:flex-shrink-0">
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

          {/* Main Title - Better centered on desktop */}
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">{t.title}</h1>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-indigo-600 mb-4">{t.subtitle}</h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-sm md:text-base lg:text-lg px-2 leading-relaxed">{t.description}</p>
          </div>

          {/* Room Selector - Centered */}
          <div className="flex justify-center mt-6">
            <div className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm w-full max-w-sm lg:max-w-md">
              <DoorOpen className="w-4 h-4 text-gray-600 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">{t.currentRoom}:</span>
              <Select value={currentRoomId} onValueChange={handleRoomChange}>
                <SelectTrigger className="w-24 sm:w-32 lg:w-40">
                  <SelectValue placeholder={t.selectRoom} />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
            {/* Search Bar */}
            <div className="max-w-md mx-auto">
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
                  {filterScheduleBySearch(schedule).length > 0 ? (
                    <span>{t.showingResults} "{searchTerm}"</span>
                  ) : (
                    <span className="text-gray-500">{t.noResults}</span>
                  )}
                </div>
              )}
            </div>

            {/* Stats - Responsive Layout */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-lg lg:max-w-2xl mx-auto mb-4">
              <div className="text-center bg-white rounded-lg p-3 sm:p-4 lg:p-6 shadow-sm border border-indigo-100">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-indigo-600 mb-1">{getTotalBookedSlots()}</div>
                <div className="text-xs sm:text-sm lg:text-base text-gray-600 font-medium">{t.booked}</div>
              </div>
              <div className="text-center bg-white rounded-lg p-3 sm:p-4 lg:p-6 shadow-sm border border-green-100">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600 mb-1">{getTotalSlots() - getTotalBookedSlots()}</div>
                <div className="text-xs sm:text-sm lg:text-base text-gray-600 font-medium">{t.available}</div>
              </div>
              <div className="text-center bg-white rounded-lg p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-100">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-600 mb-1">{getTotalSlots()}</div>
                <div className="text-xs sm:text-sm lg:text-base text-gray-600 font-medium">{t.totalSlots}</div>
              </div>
            </div>

            {/* Current Room Indicator */}
            {currentRoom && (
              <div className="text-center">
                <Badge variant="outline" className="text-base sm:text-lg lg:text-xl px-3 py-2 sm:px-4 lg:px-6">
                  {currentRoom.name}
                </Badge>
              </div>
            )}

            {/* Schedule Grid - Responsive Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 max-w-none lg:max-w-6xl mx-auto">
              {filterScheduleBySearch(schedule).map((day) => (
                <Card key={day.id} className="shadow-lg">
                  <CardHeader className="bg-indigo-600 text-white p-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                      {day.dayName}
                    </CardTitle>
                    <CardDescription className="text-indigo-100 text-sm">{day.date}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4">
                    <div className="grid gap-2">
                      {day.slots.map((slot: { id: string; time: string; isBooked: boolean; attendee?: { name: string } }) => (
                        <Button
                          key={slot.id}
                          variant={slot.isBooked ? "secondary" : "outline"}
                          className={`justify-start h-auto min-h-[60px] sm:min-h-[48px] p-3 sm:p-3 text-left touch-manipulation overflow-hidden ${
                            slot.isBooked
                              ? "bg-red-50 border-red-200 hover:bg-red-100 active:bg-red-200"
                              : "bg-green-50 border-green-200 hover:bg-green-100 active:bg-green-200"
                          }`}
                          onClick={() => handleSlotClick(day.id, slot.id)}
                        >
                          <div className="flex flex-col w-full min-w-0">
                            <div className="flex items-center justify-between w-full mb-1">
                              <div className="flex items-center gap-2 sm:gap-2 min-w-0">
                                <Clock className="w-4 h-4 sm:w-4 sm:h-4 flex-shrink-0 text-gray-600" />
                                <span className="font-semibold text-base sm:text-base text-gray-900 whitespace-nowrap">{slot.time}</span>
                              </div>
                              <Badge 
                                variant={slot.isBooked ? "destructive" : "default"} 
                                className="text-xs sm:text-xs px-2 py-1 font-medium flex-shrink-0 ml-2"
                              >
                                {slot.isBooked ? t.booked : t.available}
                              </Badge>
                            </div>
                            {slot.isBooked && slot.attendee && (
                              <div className="flex items-center gap-1 text-sm sm:text-sm text-gray-600 min-w-0">
                                <User className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate font-medium min-w-0">{slot.attendee.name}</span>
                              </div>
                            )}
                          </div>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
        </div>

        {/* Booking Dialog - Mobile Optimized */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            setDuplicates([]) // Clear duplicates when dialog is closed
            setIsEditMode(false) // Reset edit mode when dialog is closed
          }
        }}>
          <DialogContent className="sm:max-w-md w-[95vw] sm:w-full max-w-[95vw] sm:max-w-md mx-auto max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-base sm:text-lg font-semibold leading-tight">
                {isEditMode ? t.editBooking : currentSlot?.isBooked ? t.bookingDetails : t.bookSlot}
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm leading-relaxed">
                {selectedDay && currentSlot && currentRoom && (
                  <>
                    <span className="font-medium text-indigo-600">{currentRoom.name}</span>
                    <br className="sm:hidden" /><span className="hidden sm:inline"> - </span>
                    <span className="font-medium">{selectedDay.dayName}</span>, {selectedDay.date}
                    <br />
                    <span className="text-gray-600">{t.time}:</span> <span className="font-semibold text-indigo-700">{currentSlot.time}</span>
                  </>
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 sm:gap-4 py-2">
              <div className="grid gap-1.5">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  {t.fullName} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t.enterFullName}
                  disabled={(currentSlot?.isBooked && !isEditMode) || isProcessing}
                  className="text-base sm:text-sm h-11 sm:h-10"
                />
                
                {/* Duplicate Warning */}
                {duplicates.length > 0 && !currentSlot?.isBooked && (
                  <Alert className="mt-2 border-amber-200 bg-amber-50">
                    <Info className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-sm">
                      <div className="font-medium text-amber-800 mb-1">
                        {t.duplicateWarning}
                      </div>
                      <div className="text-amber-700 mb-2">
                        {duplicates.length === 1 ? t.duplicateFound : t.duplicateFoundMultiple}
                      </div>
                      <div className="space-y-1">
                        {duplicates.slice(0, 3).map((duplicate, index) => (
                          <div key={index} className="text-xs text-amber-600">
                            <span className="font-medium">{duplicate.attendeeName}</span>{" "}
                            {t.duplicateDetails
                              .replace("{room}", duplicate.roomName)
                              .replace("{day}", duplicate.dayName)
                              .replace("{time}", duplicate.slotTime)}
                          </div>
                        ))}
                        {duplicates.length > 3 && (
                          <div className="text-xs text-amber-600 italic">
                            +{duplicates.length - 3} more...
                          </div>
                        )}
                      </div>
                      <div className="text-amber-700 mt-2 text-xs">
                        {t.duplicateNote}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">{t.email}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={t.enterEmail}
                  disabled={(currentSlot?.isBooked && !isEditMode) || isProcessing}
                  className="text-base sm:text-sm h-11 sm:h-10"
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">{t.phone}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder={t.enterPhone}
                  disabled={(currentSlot?.isBooked && !isEditMode) || isProcessing}
                  className="text-base sm:text-sm h-11 sm:h-10"
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="notes" className="text-sm font-medium text-gray-700">{t.notes}</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={t.specialRequests}
                  disabled={(currentSlot?.isBooked && !isEditMode) || isProcessing}
                  rows={2}
                  className="text-base sm:text-sm min-h-[60px] resize-none"
                />
              </div>
            </div>

            <DialogFooter className="gap-3 pt-4 flex-col sm:flex-row">
              {currentSlot?.isBooked ? (
                isEditMode ? (
                  // Edit mode footer
                  <>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsEditMode(false)
                        setIsDialogOpen(false)
                      }}
                      disabled={isProcessing}
                      className="w-full sm:w-auto h-11 sm:h-10 text-base sm:text-sm order-2 sm:order-1"
                    >
                      {t.cancel}
                    </Button>
                    <Button 
                      onClick={handleEditBooking} 
                      disabled={!formData.name.trim() || isProcessing}
                      className="w-full sm:w-auto h-11 sm:h-10 text-base sm:text-sm order-1 sm:order-2 bg-blue-600 hover:bg-blue-700"
                    >
                      {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      {isProcessing ? t.updating : t.update}
                    </Button>
                  </>
                ) : (
                  // View mode footer for booked slots
                  <>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                      disabled={isProcessing}
                      className="w-full sm:w-auto h-11 sm:h-10 text-base sm:text-sm order-3 sm:order-1"
                    >
                      {t.close}
                    </Button>
                    <Button 
                      variant="default" 
                      onClick={handleEditBookingRequest}
                      disabled={isProcessing}
                      className="w-full sm:w-auto h-11 sm:h-10 text-base sm:text-sm order-1 sm:order-2 bg-blue-600 hover:bg-blue-700"
                    >
                      {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      {isProcessing ? t.processing : t.editBooking}
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleCancelBookingRequest}
                      disabled={isProcessing}
                      className="w-full sm:w-auto h-11 sm:h-10 text-base sm:text-sm order-2 sm:order-3"
                    >
                      {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      {isProcessing ? t.processing : t.cancelBooking}
                    </Button>
                  </>
                )
              ) : (
                // Available slot footer
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isProcessing}
                    className="w-full sm:w-auto h-11 sm:h-10 text-base sm:text-sm order-2 sm:order-1"
                  >
                    {t.cancel}
                  </Button>
                  <Button 
                    onClick={handleBookSlotRequest} 
                    disabled={!formData.name.trim() || isProcessing}
                    className="w-full sm:w-auto h-11 sm:h-10 text-base sm:text-sm order-1 sm:order-2 bg-indigo-600 hover:bg-indigo-700"
                  >
                    {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {isProcessing ? t.processing : t.book}
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Password Dialog */}
        <PasswordDialog
          open={isPasswordDialogOpen}
          onOpenChange={setIsPasswordDialogOpen}
          onSuccess={handlePasswordSuccess}
          title={t.accessRequired}
          description={pendingAction === 'book' ? t.accessRequiredForBooking : pendingAction === 'cancel' ? t.accessRequiredForCancellation : t.accessRequiredForEdit}
          language={language}
          type={pendingAction || 'book'}
        />
      </div>
    </div>
  )
}
