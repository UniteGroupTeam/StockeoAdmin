import React, { useState } from 'react';
import { Sale } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Calendar } from './ui/calendar';
import { Badge } from './ui/badge';
import { format, isSameDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { ShoppingBag, DollarSign, TrendingUp, Package, User } from 'lucide-react';

interface CalendarViewProps {
  sales: Sale[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({ sales }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const daySales = sales.filter(s => {
    if (!selectedDate) return false;
    return isSameDay(parseISO(s.date), selectedDate);
  });

  const dayTotal = daySales.reduce((acc, s) => acc + s.totalPrice, 0);
  const dayProfit = daySales.reduce((acc, s) => acc + s.totalProfit, 0);

  // Dates with sales for the calendar dots
  const salesDates = sales.map(s => parseISO(s.date));

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Calendario de Ventas</h2>
        <p className="text-slate-500 font-medium">Historial detallado por día</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Card */}
        <Card className="lg:col-span-1 border-none shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
          <CardContent className="p-4 bg-white">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={es}
              className="rounded-md border-none"
              modifiers={{ hasSales: salesDates }}
              modifiersStyles={{
                hasSales: { fontWeight: 'bold', color: 'var(--primary)', textDecoration: 'underline' }
              }}
            />
          </CardContent>
        </Card>

        {/* Day Summary */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border-none shadow-lg shadow-slate-200/30 rounded-2xl bg-white overflow-hidden">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ventas del Día</p>
                  <p className="text-2xl font-black text-slate-900">${dayTotal.toLocaleString('es-MX')}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-lg shadow-slate-200/30 rounded-2xl bg-white overflow-hidden">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ganancia del Día</p>
                  <p className="text-2xl font-black text-green-600">${dayProfit.toLocaleString('es-MX')}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-xl shadow-slate-200/50 rounded-2xl bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-50">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                {selectedDate ? format(selectedDate, "d 'de' MMMM, yyyy", { locale: es }) : 'Selecciona un día'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {daySales.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="font-medium">No hay ventas registradas este día</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {daySales.map((sale, idx) => (
                    <div key={sale.id || idx} className="p-6 hover:bg-slate-50/50 transition-colors">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{sale.clientName || 'Cliente General'}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                              {sale.items.length} {sale.items.length === 1 ? 'Producto' : 'Productos'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-slate-900">${sale.totalPrice.toLocaleString('es-MX')}</p>
                          <p className="text-[10px] font-bold text-green-600">Profit: +${sale.totalProfit.toLocaleString('es-MX')}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {sale.items.map((item, i) => (
                          <div key={i} className="flex justify-between items-center bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[10px] font-bold border-primary/20 text-primary bg-white">
                                {item.quantity}x
                              </Badge>
                              <span className="text-xs font-bold text-slate-700">{item.productName}</span>
                            </div>
                            <span className="text-xs font-black text-slate-500">${item.finalPrice * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
