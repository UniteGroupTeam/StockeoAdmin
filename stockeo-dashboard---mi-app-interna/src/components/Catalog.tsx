import React, { useState } from 'react';
import { Product } from '../types';
import { CATALOG } from '../data/catalog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Search, Filter, PlusCircle, ExternalLink, ShoppingCart, Plus } from 'lucide-react';
import { RegisterSaleModal } from './RegisterSaleModal';

interface CatalogProps {
  onSaleRegistered: () => void;
}

export const Catalog: React.FC<CatalogProps> = ({ onSaleRegistered }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);

  const categories = ['Todas', ...Array.from(new Set(CATALOG.map(p => p.category)))];

  const filteredProducts = CATALOG.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todas' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleRegisterSale = (product?: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Catálogo de Productos</h2>
          <p className="text-slate-500 font-medium">Gestiona tu inventario y registra ventas rápidamente</p>
        </div>
        <Button onClick={() => handleRegisterSale()} className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 font-bold px-6 py-6 rounded-xl">
          <Plus className="w-5 h-5 mr-2" /> Nueva Venta
        </Button>
      </div>

      <Card className="border-none shadow-xl shadow-slate-200/50 overflow-hidden rounded-2xl">
        <CardHeader className="bg-white border-b border-slate-100 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar producto..."
                className="pl-10 bg-slate-50 border-none h-12 font-medium focus-visible:ring-primary/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              {categories.map(category => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  className={`cursor-pointer px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    selectedCategory === category 
                      ? 'bg-primary text-white shadow-md shadow-primary/20' 
                      : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent border-slate-100">
                  <TableHead className="font-bold text-slate-500 uppercase text-[10px] tracking-widest pl-6">Producto</TableHead>
                  <TableHead className="font-bold text-slate-500 uppercase text-[10px] tracking-widest">Categoría</TableHead>
                  <TableHead className="font-bold text-slate-500 uppercase text-[10px] tracking-widest text-right">Menudeo</TableHead>
                  <TableHead className="font-bold text-slate-500 uppercase text-[10px] tracking-widest text-right">Mayoreo</TableHead>
                  <TableHead className="font-bold text-slate-500 uppercase text-[10px] tracking-widest text-right">Distribuidor</TableHead>
                  <TableHead className="font-bold text-slate-500 uppercase text-[10px] tracking-widest text-right pr-6">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.name} className="hover:bg-slate-50/50 transition-colors border-slate-100 group">
                    <TableCell className="font-bold text-slate-900 py-4 pl-6">
                      <div className="flex flex-col">
                        <span>{product.name}</span>
                        <span className="text-[10px] text-slate-400 font-medium md:hidden">{product.category}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-bold text-[10px] uppercase tracking-wider px-2 py-0.5">
                        {product.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-slate-600">${product.priceMenudeo}</TableCell>
                    <TableCell className="text-right font-mono font-bold text-slate-600">${product.priceMayoreo}</TableCell>
                    <TableCell className="text-right font-mono font-bold text-primary">
                      {product.priceDistribuidor ? `$${product.priceDistribuidor}` : '-'}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button 
                        size="sm" 
                        onClick={() => handleRegisterSale(product)}
                        className="bg-white hover:bg-primary hover:text-white text-primary border border-primary/20 shadow-none font-bold rounded-lg transition-all"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Vender
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <RegisterSaleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialProduct={selectedProduct}
        onSuccess={() => {
          setIsModalOpen(false);
          onSaleRegistered();
        }}
      />
    </div>
  );
};
