import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      let errorMessage = 'Ha ocurrido un error inesperado.';
      let isFirestoreError = false;

      try {
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error && parsed.operationType) {
            errorMessage = `Error de base de datos: ${parsed.error}`;
            isFirestoreError = true;
          }
        }
      } catch (e) {
        // Not a JSON error
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <Card className="w-full max-w-md border-t-8 border-t-destructive shadow-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto bg-destructive/10 p-4 rounded-full w-fit mb-4">
                <AlertTriangle className="w-10 h-10 text-destructive" />
              </div>
              <CardTitle className="text-2xl font-black text-slate-900">¡Ups! Algo salió mal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
                <p className="text-sm font-medium text-slate-600 leading-relaxed">
                  {errorMessage}
                </p>
                {isFirestoreError && (
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">
                    Por favor, verifica tus permisos de acceso.
                  </p>
                )}
              </div>
              <Button onClick={this.handleReset} className="w-full py-6 text-lg font-bold gap-2">
                <RefreshCcw className="w-5 h-5" />
                Reiniciar Aplicación
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
