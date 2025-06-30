"use client"

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  AlertCircle,
  ArrowLeft,
  UserPlus,
  UserMinus,
  Edit,
  Filter,
  BarChart3,
  Users,
  Download
} from "lucide-react";
import Link from 'next/link';

interface LogEntry {
  id: string;
  timestamp: string;
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

interface TeamMemberStats {
  author: string;
  totalBookings: number;
  totalCancellations: number;
  netReservations: number;
  lastActivity: string;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState<string>('all');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, searchTerm, selectedAuthor, selectedAction]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/logs?limit=2000'); // Increased limit for better stats
      const data = await response.json();
      
      if (data.logs) {
        setLogs(data.logs);
      } else {
        setError('Failed to fetch logs');
      }
    } catch (error) {
      setError('Error loading logs');
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = logs;

    // Filter by author
    if (selectedAuthor !== 'all') {
      filtered = filtered.filter(log => log.author === selectedAuthor);
    }

    // Filter by action
    if (selectedAction !== 'all') {
      filtered = filtered.filter(log => log.action === selectedAction);
    }

    // Apply search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(log => 
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

    setFilteredLogs(filtered);
  };

  const getUniqueAuthors = () => {
    const authors = Array.from(new Set(logs.map(log => log.author))).sort();
    return authors;
  };

  const getTeamMemberStats = (): TeamMemberStats[] => {
    const stats: { [key: string]: TeamMemberStats } = {};

    logs.forEach(log => {
      if (!stats[log.author]) {
        stats[log.author] = {
          author: log.author,
          totalBookings: 0,
          totalCancellations: 0,
          netReservations: 0,
          lastActivity: log.timestamp
        };
      }

      if (log.action === 'book') {
        stats[log.author].totalBookings++;
        stats[log.author].netReservations++;
      } else if (log.action === 'cancel') {
        stats[log.author].totalCancellations++;
        stats[log.author].netReservations--;
      }
      // Edit actions don't change the net count, just update last activity

      // Update last activity if this log is more recent
      if (new Date(log.timestamp) > new Date(stats[log.author].lastActivity)) {
        stats[log.author].lastActivity = log.timestamp;
      }
    });

    return Object.values(stats).sort((a, b) => b.totalBookings - a.totalBookings);
  };

  const exportFilteredToCSV = () => {
    const headers = ['Timestamp', 'Author', 'Action', 'Room', 'Day', 'Time', 'Attendee Name', 'Attendee Email', 'Attendee Phone', 'Notes'];
    
    const csvContent = [
      headers.join(','),
      ...filteredLogs.map(log => [
        log.timestamp,
        log.author,
        log.action,
        log.roomName,
        log.dayName,
        log.slotTime,
        log.action === 'book' ? (log.attendeeName || '') : (log.previousAttendee?.name || ''),
        log.action === 'book' ? (log.attendeeEmail || '') : (log.previousAttendee?.email || ''),
        log.action === 'book' ? (log.attendeePhone || '') : (log.previousAttendee?.phone || ''),
        `"${log.action === 'book' ? (log.attendeeNotes || '') : (log.previousAttendee?.notes || '')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reservation-logs-${selectedAuthor !== 'all' ? selectedAuthor : 'all'}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedAuthor('all');
    setSelectedAction('all');
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return timestamp;
    }
  };

  const getActionBadge = (action: string) => {
    if (action === 'book') {
      return (
        <Badge variant="default" className="flex items-center gap-1">
          <UserPlus className="w-3 h-3" />
          Booked
        </Badge>
      );
    } else if (action === 'cancel') {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <UserMinus className="w-3 h-3" />
          Canceled
        </Badge>
      );
    } else if (action === 'edit') {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Edit className="w-3 h-3" />
          Edited
        </Badge>
      );
    }
    return null;
  };

  const teamStats = getTeamMemberStats();
  const uniqueAuthors = getUniqueAuthors();

  if (loading && logs.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96 mb-4" />
            <Skeleton className="h-10 w-full max-w-md" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Scheduler
              </Button>
            </Link>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <FileText className="w-8 h-8" />
            Reservation Logs
          </h1>
          <p className="text-gray-600 mb-4">
            Complete history of all booking and cancellation actions by team members for accountability and follow-up.
          </p>

          {/* Filters and Search */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {/* Search */}
              <div className="relative flex-1 min-w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name, room, time, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Team Member Filter */}
              <Select value={selectedAuthor} onValueChange={setSelectedAuthor}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by team member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Team Members</SelectItem>
                  {uniqueAuthors.map(author => (
                    <SelectItem key={author} value={author}>
                      {author}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Action Filter */}
              <Select value={selectedAction} onValueChange={setSelectedAction}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Filter by action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="book">Bookings</SelectItem>
                  <SelectItem value="cancel">Cancellations</SelectItem>
                  <SelectItem value="edit">Edits</SelectItem>
                </SelectContent>
              </Select>

              {/* Export Button */}
              <Button onClick={exportFilteredToCSV} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>

              {/* Clear Filters */}
              {(searchTerm || selectedAuthor !== 'all' || selectedAction !== 'all') && (
                <Button onClick={clearAllFilters} variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Team Statistics */}
        {teamStats.length > 0 && (
          <div className="mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Team Member Statistics
                </CardTitle>
                <CardDescription>
                  Overview of reservation activity by team member
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teamStats.map((stat) => (
                    <div key={stat.author} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{stat.author}</span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-green-600">Bookings:</span>
                          <span className="font-medium">{stat.totalBookings}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-red-600">Cancellations:</span>
                          <span className="font-medium">{stat.totalCancellations}</span>
                        </div>
                        <div className="flex justify-between border-t pt-1">
                          <span className="text-blue-600">Net Reservations:</span>
                          <span className="font-bold">{stat.netReservations}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          Last activity: {formatTimestamp(stat.lastActivity)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Activity Log
              <div className="flex gap-2 ml-auto">
                {selectedAuthor !== 'all' && (
                  <Badge variant="outline">
                    Team Member: {selectedAuthor}
                  </Badge>
                )}
                {selectedAction !== 'all' && (
                  <Badge variant="outline">
                    Action: {selectedAction}
                  </Badge>
                )}
                {searchTerm && (
                  <Badge variant="outline">
                    Search: "{searchTerm}"
                  </Badge>
                )}
              </div>
            </CardTitle>
            <CardDescription>
              {filteredLogs.length} {filteredLogs.length === 1 ? 'entry' : 'entries'} found
              {filteredLogs.length !== logs.length && ` (filtered from ${logs.length} total)`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm || selectedAuthor !== 'all' || selectedAction !== 'all' 
                  ? 'No logs found matching your filters.' 
                  : 'No logs available.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Team Member</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Day & Time</TableHead>
                      <TableHead>Attendee</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-sm">
                          {formatTimestamp(log.timestamp)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{log.author}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getActionBadge(log.action)}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{log.roomName}</span>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="w-3 h-3 text-gray-400" />
                              {log.dayName}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Clock className="w-3 h-3" />
                              {log.slotTime}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {log.action === 'book' && log.attendeeName ? (
                            <div className="space-y-1">
                              <div className="font-medium">{log.attendeeName}</div>
                              {log.attendeeEmail && (
                                <div className="text-sm text-gray-500">{log.attendeeEmail}</div>
                              )}
                              {log.attendeePhone && (
                                <div className="text-sm text-gray-500">{log.attendeePhone}</div>
                              )}
                            </div>
                          ) : log.action === 'cancel' && log.previousAttendee ? (
                            <div className="space-y-1">
                              <div className="font-medium text-red-600">
                                Canceled: {log.previousAttendee.name}
                              </div>
                              {log.previousAttendee.email && (
                                <div className="text-sm text-gray-500">{log.previousAttendee.email}</div>
                              )}
                              {log.previousAttendee.phone && (
                                <div className="text-sm text-gray-500">{log.previousAttendee.phone}</div>
                              )}
                            </div>
                          ) : log.action === 'edit' && (log.attendeeName || log.previousAttendee) ? (
                            <div className="space-y-1">
                              <div className="font-medium text-blue-600">
                                Edited: {log.attendeeName || log.previousAttendee?.name}
                              </div>
                              {(log.attendeeEmail || log.previousAttendee?.email) && (
                                <div className="text-sm text-gray-500">
                                  {log.attendeeEmail || log.previousAttendee?.email}
                                </div>
                              )}
                              {(log.attendeePhone || log.previousAttendee?.phone) && (
                                <div className="text-sm text-gray-500">
                                  {log.attendeePhone || log.previousAttendee?.phone}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {(log.attendeeNotes || log.previousAttendee?.notes) ? (
                            <div className="text-sm text-gray-500 max-w-xs truncate">
                              {log.attendeeNotes || log.previousAttendee?.notes}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 