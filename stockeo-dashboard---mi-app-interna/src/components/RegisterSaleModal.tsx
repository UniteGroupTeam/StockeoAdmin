import React, { useState, useEffect } from 'react';
import { Product, Sale, SaleItem } from '../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { db, collection, addDoc, serverTimestamp } from '../lib/firebase';
import { ShoppingCart, Calendar, User, DollarSign, Hash, Plus, Trash2, Package, ShoppingBag } from 'lucide-react';
import { format } from 'date-fns';
import { CATALOG } from '../data/catalog';

import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

interface RegisterSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProduct?: Product;
  onSuccess: () => void;
}

export const RegisterSaleModal: React.FC<RegisterSaleModalProps> = ({ isOpen, onClose, initialProduct, onSuccess }) => {
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [clientName, setClientName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Current item being configured
  const [currentItem, setCurrentItem] = useState<Product | null>(initialProduct || null);
  const [quantity, setQuantity] = useState(1);
  const [saleType, setSaleType] = useState<'Menudeo' | 'Mayoreo' | 'Distribuidor'>('Menudeo');
  const [finalPrice, setFinalPrice] = useState(0);

  useEffect(() => {
    if (initialProduct) {
      setCurrentItem(initialProduct);
    }
  }, [initialProduct]);

  useEffect(() => {
    if (currentItem) {
      if (saleType === 'Menudeo') setFinalPrice(currentItem.priceMenudeo);
      else if (saleType === 'Mayoreo') setFinalPrice(currentItem.priceMayoreo);
      else if (saleType === 'Distribuidor') setFinalPrice(currentItem.priceDistribuidor || currentItem.priceMayoreo);
    }
  }, [saleType, currentItem]);

  const addToCart = () => {
    if (!currentItem) return;

    let cost = 0;
    if (saleType === 'Menudeo') cost = currentItem.costMenudeo;
    else if (saleType === 'Mayoreo') cost = currentItem.costMayoreo;
    else if (saleType === 'Distribuidor') cost = currentItem.costDistribuidor || currentItem.costMayoreo;

    const profit = (finalPrice - cost) * quantity;

    const newItem: SaleItem = {
      productId: currentItem.name,
      productName: currentItem.name,
      category: currentItem.category,
      quantity,
      saleType,
      finalPrice,
      cost,
      profit
    };

    setCart([...cart, newItem]);
    setCurrentItem(null);
    setQuantity(1);
    setSaleType('Menudeo');
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const totalCartPrice = cart.reduce((acc, item) => acc + (item.finalPrice * item.quantity), 0);
  const totalCartProfit = cart.reduce((acc, item) => acc + item.profit, 0);
  const totalCartCost = cart.reduce((acc, item) => acc + (item.cost * item.quantity), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setIsSubmitting(true);

    const path = 'sales';
    try {
      const saleData: Omit<Sale, 'id'> = {
        items: cart,
        totalPrice: totalCartPrice,
        totalCost: totalCartCost,
        totalProfit: totalCartProfit,
        date,
        clientName: clientName || undefined,
        timestamp: serverTimestamp()
      };

      await addDoc(collection(db, path), saleData);
      
      if (Notification.permission === 'granted') {
        new Notification('Venta Registrada', {
          body: `${cart.length} productos - $${totalCartPrice}`,
          icon: 'https://picsum.photos/seed/stockeo/192/192'
        });
      }

      setCart([]);
      onSuccess();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto border-none shadow-2xl p-0 bg-slate-50">
        <div className="bg-white p-6 border-b">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-slate-900">
              <ShoppingBag className="w-6 h-6 text-primary" />
              Nueva Venta
            </DialogTitle>
            <DialogDescription>
              Añade productos y registra la transacción
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6">
          {/* Item Selector */}
          {!currentItem ? (
            <div className="space-y-4">
              <Label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Añadir Producto</Label>
              <Select onValueChange={(val) => setCurrentItem(CATALOG.find(p => p.name === val) || null)}>
                <SelectTrigger className="bg-white border-slate-200 h-12">
                  <SelectValue placeholder="Seleccionar producto del catálogo..." />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {CATALOG.map(p => (
                    <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="bg-white p-4 rounded-xl border border-primary/20 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-primary" />
                  <span className="font-bold text-slate-900">{currentItem.name}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setCurrentItem(null)} className="h-6 w-6 p-0">
                  <Trash2 className="w-4 h-4 text-slate-400" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">Cantidad</Label>
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="h-9 font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">Tipo</Label>
                  <Select value={saleType} onValueChange={(v: any) => setSaleType(v)}>
                    <SelectTrigger className="h-9 text-xs font-semibold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Menudeo">Menudeo</SelectItem>
                      <SelectItem value="Mayoreo">Mayoreo</SelectItem>
                      <SelectItem value="Distribuidor" disabled={!currentItem.priceDistribuidor}>Distribuidor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] font-bold uppercase text-slate-400">Precio Final (Unitario)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                  <Input
                    type="number"
                    value={finalPrice}
                    onChange={(e) => setFinalPrice(parseFloat(e.target.value) || 0)}
                    className="pl-8 h-10 font-black text-primary"
                  />
                </div>
              </div>

              <Button onClick={addToCart} className="w-full bg-primary/10 text-primary hover:bg-primary/20 border-none shadow-none">
                <Plus className="w-4 h-4 mr-2" /> Añadir al Carrito
              </Button>
            </div>
          )}

          {/* Cart Items */}
          {cart.length > 0 && (
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Carrito ({cart.length})</Label>
              <div className="space-y-2">
                {cart.map((item, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 flex justify-between items-center group">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900">{item.productName}</span>
                      <span className="text-[10px] text-slate-500">{item.quantity}x {item.saleType} • ${item.finalPrice} c/u</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black text-slate-900">${item.finalPrice * item.quantity}</span>
                      <Button variant="ghost" size="sm" onClick={() => removeFromCart(idx)} className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sale Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Fecha</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Cliente</Label>
              <Input placeholder="Opcional" value={clientName} onChange={(e) => setClientName(e.target.value)} className="bg-white" />
            </div>
          </div>

          {/* Summary */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xl space-y-2">
            <div className="flex justify-between items-center opacity-60 text-xs uppercase font-bold tracking-widest">
              <span>Resumen de Venta</span>
              <span>{cart.length} items</span>
            </div>
            <div className="flex justify-between items-end">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-green-400 uppercase">Ganancia Estimada</span>
                <span className="text-xl font-bold text-green-400">+${totalCartProfit.toLocaleString('es-MX')}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold opacity-60 uppercase">Total a Cobrar</span>
                <span className="text-3xl font-black">${totalCartPrice.toLocaleString('es-MX')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border-t">
          <DialogFooter className="flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit} 
              className="w-full sm:flex-1 bg-primary hover:bg-primary/90 py-6 text-lg font-bold shadow-lg shadow-primary/20" 
              disabled={isSubmitting || cart.length === 0}
            >
              {isSubmitting ? 'Procesando...' : 'Finalizar Venta'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
