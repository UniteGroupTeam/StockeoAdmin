import React, { useMemo } from 'react';
import { Sale, DashboardStats } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, ShoppingBag, ClipboardList, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, isWithinInterval, startOfWeek, endOfWeek, eachWeekOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';

interface DashboardProps {
  sales: Sale[];
}

const COLORS = ['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#2563eb', '#1d4ed8', '#1e3a8a'];

export const Dashboard: React.FC<DashboardProps> = ({ sales }) => {
  const stats = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const monthSales = sales.filter(s => {
      const saleDate = new Date(s.date);
      return isWithinInterval(saleDate, { start: monthStart, end: monthEnd });
    });

    const totalProfit = monthSales.reduce((acc, s) => acc + s.totalProfit, 0);
    const totalRevenue = monthSales.reduce((acc, s) => acc + s.totalPrice, 0);
    const orderCount = monthSales.length;
    const averageTicket = orderCount > 0 ? totalRevenue / orderCount : 0;

    // Weekly profits
    const weeks = eachWeekOfInterval({ start: monthStart, end: monthEnd });
    const weeklyProfits = weeks.map((week, i) => {
      const wStart = startOfWeek(week);
      const wEnd = endOfWeek(week);
      const profit = monthSales
        .filter(s => isWithinInterval(new Date(s.date), { start: wStart, end: wEnd }))
        .reduce((acc, s) => acc + s.totalProfit, 0);
      return { week: `Sem ${i + 1}`, profit };
    });

    // Category sales
    const categoryMap: Record<string, number> = {};
    monthSales.forEach(s => {
      s.items.forEach(item => {
        categoryMap[item.category] = (categoryMap[item.category] || 0) + item.quantity;
      });
    });
    const categorySales = Object.entries(categoryMap)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    // Top profitable products
    const productProfitMap: Record<string, number> = {};
    monthSales.forEach(s => {
      s.items.forEach(item => {
        productProfitMap[item.productName] = (productProfitMap[item.productName] || 0) + item.profit;
      });
    });
    const topProfitableProducts = Object.entries(productProfitMap)
      .map(([name, profit]) => ({ name, profit }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 10);

    // Top selling products
    const productCountMap: Record<string, number> = {};
    monthSales.forEach(s => {
      s.items.forEach(item => {
        productCountMap[item.productName] = (productCountMap[item.productName] || 0) + item.quantity;
      });
    });
    const topSellingProducts = Object.entries(productCountMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalProfitMonth: totalProfit,
      totalSalesMonth: totalRevenue,
      orderCountMonth: orderCount,
      averageTicket,
      weeklyProfits,
      categorySales,
      topProfitableProducts,
      topSellingProducts
    };
  }, [sales]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Resumen del Mes</h2>
          <p className="text-muted-foreground capitalize">{format(new Date(), 'MMMM yyyy', { locale: es })}</p>
        </div>
        <div className="bg-primary/5 px-4 py-2 rounded-lg border border-primary/10">
          <span className="text-xs font-bold uppercase tracking-wider text-primary/60">Actualizado</span>
          <p className="text-sm font-semibold">{format(new Date(), 'HH:mm:ss')}</p>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              Ganancia Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              ${stats.totalProfitMonth.toLocaleString('es-MX')}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              Mes actual
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-blue-500" />
              Ventas Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${stats.totalSalesMonth.toLocaleString('es-MX')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Ingresos brutos</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-indigo-500 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-indigo-500" />
              Pedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.orderCountMonth}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Ventas registradas</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-slate-500 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-slate-500" />
              Ticket Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${stats.averageTicket.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Por cada venta</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Ganancias por Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.weeklyProfits}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="profit" fill="#1e40af" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Ventas por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.categorySales}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="category"
                  >
                    {stats.categorySales.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {stats.categorySales.slice(0, 4).map((cat, i) => (
                <div key={cat.category} className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="truncate font-medium">{cat.category}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Top 10 Más Rentables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topProfitableProducts.map((prod, i) => (
                <div key={prod.name} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-muted-foreground w-4">{i + 1}</span>
                    <span className="text-sm font-medium group-hover:text-primary transition-colors">{prod.name}</span>
                  </div>
                  <span className="text-sm font-bold text-green-600">${prod.profit.toLocaleString('es-MX')}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Top 10 Más Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topSellingProducts.map((prod, i) => (
                <div key={prod.name} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-muted-foreground w-4">{i + 1}</span>
                    <span className="text-sm font-medium group-hover:text-primary transition-colors">{prod.name}</span>
                  </div>
                  <span className="text-sm font-bold text-blue-600">{prod.count} uds</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
