import React, { useState, useEffect } from 'react';
import { AuthGuard } from './components/AuthGuard';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Catalog } from './components/Catalog';
import { CalendarView } from './components/CalendarView';
import { Sale } from './types';
import { db, collection, query, orderBy, onSnapshot, auth } from './lib/firebase';
import { getSalesInsights } from './lib/gemini';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Sparkles, BrainCircuit } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { handleFirestoreError, OperationType } from './lib/firestore-errors';
import { onAuthStateChanged } from 'firebase/auth';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'catalog' | 'calendar'>('dashboard');
  const [sales, setSales] = useState<Sale[]>([]);
  const [insights, setInsights] = useState<string>('');
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setIsAuthReady(true);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!isAuthReady || !auth.currentUser) return;

    const path = 'sales';
    const q = query(collection(db, path), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const salesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Sale[];
      setSales(salesData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, [isAuthReady]);

  useEffect(() => {
    if (sales.length > 0 && !insights) {
      generateInsights();
    }
  }, [sales]);

  const generateInsights = async () => {
    setLoadingInsights(true);
    const text = await getSalesInsights(sales);
    setInsights(text || '');
    setLoadingInsights(false);
  };

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            <Dashboard sales={sales} />
            
            {/* AI Insights Section */}
            <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 shadow-lg overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <BrainCircuit className="w-24 h-24" />
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold flex items-center gap-2 text-primary">
                  <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                  AI Insights de Stockeo
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingInsights ? (
                  <div className="flex items-center gap-3 text-muted-foreground animate-pulse">
                    <div className="w-4 h-4 bg-primary/20 rounded-full"></div>
                    <p className="text-sm font-medium">Analizando tendencias de ventas...</p>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none text-slate-700 font-medium leading-relaxed">
                    <ReactMarkdown>{insights}</ReactMarkdown>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        );
      case 'catalog':
        return <Catalog onSaleRegistered={() => setActiveTab('dashboard')} />;
      case 'calendar':
        return <CalendarView sales={sales} />;
      default:
        return <Dashboard sales={sales} />;
    }
  };

  return (
    <AuthGuard>
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        <div className="space-y-8 pb-12">
          {renderContent()}
        </div>
      </Layout>
    </AuthGuard>
  );
}
