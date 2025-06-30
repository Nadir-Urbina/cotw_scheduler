"use client"

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Lock, AlertCircle } from "lucide-react";

interface PasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (authorName: string) => void;
  title: string;
  description: string;
  language: 'en' | 'es';
  type?: 'book' | 'cancel' | 'edit';
}

const translations = {
  en: {
    accessCode: "Access Code",
    cancellationCode: "Cancellation Code",
    editCode: "Edit Access Code",
    authorName: "Your Name",
    enterCode: "Enter reservation code",
    enterCancellationCode: "Enter cancellation code",
    enterEditCode: "Enter edit access code",
    enterName: "Enter your full name for accountability",
    codePlaceholder: "Enter code...",
    namePlaceholder: "Enter your name...",
    verify: "Verify",
    cancel: "Cancel",
    verifying: "Verifying...",
    invalidCode: "Invalid access code. Please try again.",
    invalidCancellationCode: "Invalid cancellation code. Please try again.",
    invalidEditCode: "Invalid edit access code. Please try again.",
    errorValidating: "Error validating code. Please try again.",
    nameRequired: "Name is required for accountability purposes.",
  },
  es: {
    accessCode: "Código de Acceso",
    cancellationCode: "Código de Cancelación",
    editCode: "Código de Edición",
    authorName: "Su Nombre",
    enterCode: "Ingrese el código de reserva",
    enterCancellationCode: "Ingrese el código de cancelación",
    enterEditCode: "Ingrese el código de edición",
    enterName: "Ingrese su nombre completo para fines de responsabilidad",
    codePlaceholder: "Ingrese código...",
    namePlaceholder: "Ingrese su nombre...",
    verify: "Verificar",
    cancel: "Cancelar",
    verifying: "Verificando...",
    invalidCode: "Código de acceso inválido. Por favor intente de nuevo.",
    invalidCancellationCode: "Código de cancelación inválido. Por favor intente de nuevo.",
    invalidEditCode: "Código de edición inválido. Por favor intente de nuevo.",
    errorValidating: "Error al validar código. Por favor intente de nuevo.",
    nameRequired: "El nombre es requerido para fines de responsabilidad.",
  },
};

export function PasswordDialog({ 
  open, 
  onOpenChange, 
  onSuccess, 
  title, 
  description, 
  language,
  type = 'book'
}: PasswordDialogProps) {
  const [code, setCode] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = translations[language];
  const isCancellation = type === 'cancel';
  const isEdit = type === 'edit';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) return;
    if (!authorName.trim()) {
      setError(t.nameRequired);
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const response = await fetch('/api/validate-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          code: code.trim(), 
          type: type 
        }),
      });

      const data = await response.json();

      if (data.valid) {
        setCode('');
        setAuthorName('');
        onSuccess(authorName.trim());
        onOpenChange(false);
      } else {
        if (isCancellation) {
          setError(t.invalidCancellationCode);
        } else if (isEdit) {
          setError(t.invalidEditCode);
        } else {
          setError(t.invalidCode);
        }
      }
    } catch (error) {
      setError(t.errorValidating);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClose = () => {
    setCode('');
    setAuthorName('');
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md w-[95vw] sm:w-full max-w-[95vw] sm:max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold leading-tight">
              <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
              {title}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm leading-relaxed text-gray-600">
              {description}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 sm:gap-4 py-2">
            <div className="grid gap-1.5">
              <Label htmlFor="author-name" className="text-sm font-medium text-gray-700">
                {t.authorName} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="author-name"
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder={t.namePlaceholder}
                disabled={isVerifying}
                className="text-base sm:text-sm h-11 sm:h-10"
                autoComplete="name"
              />
              <p className="text-xs text-gray-500 leading-relaxed">
                {t.enterName}
              </p>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="access-code" className="text-sm font-medium text-gray-700">
                {isCancellation ? t.cancellationCode : isEdit ? t.editCode : t.accessCode} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="access-code"
                type="password"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={t.codePlaceholder}
                disabled={isVerifying}
                className="text-base sm:text-sm h-11 sm:h-10 font-mono"
                autoComplete="off"
              />
              <p className="text-xs text-gray-500 leading-relaxed">
                {isCancellation ? t.enterCancellationCode : isEdit ? t.enterEditCode : t.enterCode}
              </p>
            </div>

            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-sm text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter className="gap-3 pt-4 flex-col sm:flex-row">
            <Button 
              type="button"
              variant="outline" 
              onClick={handleClose}
              disabled={isVerifying}
              className="w-full sm:w-auto h-11 sm:h-10 text-base sm:text-sm order-2 sm:order-1"
            >
              {t.cancel}
            </Button>
            <Button 
              type="submit"
              disabled={!code.trim() || !authorName.trim() || isVerifying}
              className="w-full sm:w-auto h-11 sm:h-10 text-base sm:text-sm order-1 sm:order-2 bg-indigo-600 hover:bg-indigo-700"
            >
              {isVerifying && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isVerifying ? t.verifying : t.verify}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 