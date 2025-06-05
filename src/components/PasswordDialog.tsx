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
}

const translations = {
  en: {
    accessCode: "Access Code",
    authorName: "Your Name",
    enterCode: "Enter reservation code",
    enterName: "Enter your full name for accountability",
    codePlaceholder: "Enter code...",
    namePlaceholder: "Enter your name...",
    verify: "Verify",
    cancel: "Cancel",
    verifying: "Verifying...",
    invalidCode: "Invalid access code. Please try again.",
    errorValidating: "Error validating code. Please try again.",
    nameRequired: "Name is required for accountability purposes.",
  },
  es: {
    accessCode: "Código de Acceso",
    authorName: "Su Nombre",
    enterCode: "Ingrese el código de reserva",
    enterName: "Ingrese su nombre completo para fines de responsabilidad",
    codePlaceholder: "Ingrese código...",
    namePlaceholder: "Ingrese su nombre...",
    verify: "Verificar",
    cancel: "Cancelar",
    verifying: "Verificando...",
    invalidCode: "Código de acceso inválido. Por favor intente de nuevo.",
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
  language 
}: PasswordDialogProps) {
  const [code, setCode] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = translations[language];

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
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await response.json();

      if (data.valid) {
        setCode('');
        setAuthorName('');
        onSuccess(authorName.trim());
        onOpenChange(false);
      } else {
        setError(t.invalidCode);
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
      <DialogContent className="sm:max-w-md mx-4 w-full max-w-[95vw] sm:mx-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Lock className="w-5 h-5" />
              {title}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {description}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="author-name" className="text-sm">
                {t.authorName} *
              </Label>
              <Input
                id="author-name"
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder={t.namePlaceholder}
                disabled={isVerifying}
                className="text-sm"
                autoComplete="name"
              />
              <p className="text-xs text-gray-500">
                {t.enterName}
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="access-code" className="text-sm">
                {t.accessCode} *
              </Label>
              <Input
                id="access-code"
                type="password"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={t.codePlaceholder}
                disabled={isVerifying}
                className="text-sm"
                autoComplete="off"
              />
              <p className="text-xs text-gray-500">
                {t.enterCode}
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {error}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter className="gap-2 flex-col sm:flex-row">
            <Button 
              type="button"
              variant="outline" 
              onClick={handleClose}
              disabled={isVerifying}
              className="w-full sm:w-auto"
            >
              {t.cancel}
            </Button>
            <Button 
              type="submit"
              disabled={!code.trim() || !authorName.trim() || isVerifying}
              className="w-full sm:w-auto"
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