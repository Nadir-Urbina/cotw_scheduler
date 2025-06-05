"use client"

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  UserMinus
} from "lucide-react";
import Link from 'next/link';

interface LogEntry {
  id: string;
  timestamp: string;
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

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/logs');
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

  const handleSearch = async () => {
    try {
      setLoading(true);
      const url = searchTerm.trim() 
        ? `/api/logs?search=${encodeURIComponent(searchTerm.trim())}`
        : '/api/logs';
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.logs) {
        setLogs(data.logs);
      }
    } catch (error) {
      setError('Error searching logs');
      console.error('Error searching logs:', error);
    } finally {
      setLoading(false);
    }
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
    return action === 'book' ? (
      <Badge variant="default" className="flex items-center gap-1">
        <UserPlus className="w-3 h-3" />
        Booked
      </Badge>
    ) : (
      <Badge variant="destructive" className="flex items-center gap-1">
        <UserMinus className="w-3 h-3" />
        Canceled
      </Badge>
    );
  };

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
            Action Logs
          </h1>
          <p className="text-gray-600 mb-4">
            Complete history of all booking and cancellation actions for accountability purposes.
          </p>

          {/* Search */}
          <div className="flex gap-2 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name, room, time, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
            {searchTerm && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  fetchLogs();
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </div>

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
              {searchTerm && (
                <Badge variant="outline">
                  Searching: "{searchTerm}"
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {logs.length} {logs.length === 1 ? 'entry' : 'entries'} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'No logs found matching your search.' : 'No logs available.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Day & Time</TableHead>
                      <TableHead>Attendee</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
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