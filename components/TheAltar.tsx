import React, { useEffect, useState } from 'react';
import { fetchDailyDevotional } from '../services/geminiService';
import { getPrayers, savePrayer, updatePrayer, deletePrayer, getGratitude, saveGratitude, getDevotionalCache, saveDevotionalCache } from '../services/storageService';
import { Devotional, GratitudeEntry, PrayerRequest, Quote } from '../types';
import { Plus, Check, Trash2, Heart, BookOpen, Sun, RefreshCw, Shuffle, ChevronRight } from 'lucide-react';

const QUOTES: Quote[] = [
  { text: "La fe es dar el primer paso incluso cuando no ves toda la escalera.", author: "Martin Luther King Jr." },
  { text: "Dios susurra en nuestros placeres, habla en nuestra conciencia, pero grita en nuestros dolores.", author: "C.S. Lewis" },
  { text: "Tengo tantas cosas que hacer que pasaré las primeras tres horas orando.", author: "Martín Lutero" },
  { text: "La gracia barata es la predicación del perdón sin arrepentimiento.", author: "Dietrich Bonhoeffer" },
  { text: "No le digas a Dios cuán grande es tu tormenta, dile a la tormenta cuán grande es tu Dios.", author: "Autor Desconocido" },
  { text: "La paz no es la ausencia de problemas, sino la presencia de Dios.", author: "Autor Desconocido" }
];

export const TheAltar: React.FC = () => {
  const [devotional, setDevotional] = useState<Devotional | null>(null);
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [gratitude, setGratitude] = useState<GratitudeEntry | null>(null);
  const [newPrayer, setNewPrayer] = useState('');
  const [newGratitude, setNewGratitude] = useState('');
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [loadingDevotional, setLoadingDevotional] = useState(false);
  const [isAutoPlayingQuotes, setIsAutoPlayingQuotes] = useState(true);

  useEffect(() => {
    // Load Data
    setPrayers(getPrayers());
    
    const today = new Date().toDateString();
    const g = getGratitude().find(e => e.date === today);
    if (g) setGratitude(g);
    else setGratitude({ id: Date.now().toString(), date: today, items: [] });

    // Devotional Logic
    const cached = getDevotionalCache();
    if (cached) {
        setDevotional(cached);
    } else {
        loadNewDevotional();
    }
  }, []);

  // Carousel Interval
  useEffect(() => {
      let interval: number;
      if (isAutoPlayingQuotes) {
        interval = window.setInterval(() => {
            setQuoteIndex(prev => (prev + 1) % QUOTES.length);
        }, 8000);
      }
      return () => clearInterval(interval);
  }, [isAutoPlayingQuotes]);

  const loadNewDevotional = () => {
      setLoadingDevotional(true);
      fetchDailyDevotional().then(data => {
          setDevotional(data);
          saveDevotionalCache(data);
          setLoadingDevotional(false);
      });
  };

  const handleRefreshDevotional = () => {
      loadNewDevotional();
  };

  const handleNextQuote = () => {
      setIsAutoPlayingQuotes(false);
      setQuoteIndex(prev => (prev + 1) % QUOTES.length);
  };

  const handleShuffleQuote = () => {
      setIsAutoPlayingQuotes(false);
      let randomIndex = Math.floor(Math.random() * QUOTES.length);
      // Ensure we don't pick the same quote if possible
      if (QUOTES.length > 1) {
          while (randomIndex === quoteIndex) {
              randomIndex = Math.floor(Math.random() * QUOTES.length);
          }
      }
      setQuoteIndex(randomIndex);
  };

  const handleAddPrayer = () => {
    if (!newPrayer.trim()) return;
    const p: PrayerRequest = { id: Date.now().toString(), text: newPrayer, date: new Date().toLocaleDateString(), answered: false };
    setPrayers(savePrayer(p));
    setNewPrayer('');
  };

  const handleTogglePrayer = (p: PrayerRequest) => {
      setPrayers(updatePrayer({ ...p, answered: !p.answered }));
  };

  const handleDeletePrayer = (id: string) => {
      setPrayers(deletePrayer(id));
  };

  const handleAddGratitude = () => {
      if (!newGratitude.trim() || !gratitude) return;
      if (gratitude.items.length >= 3) return;
      
      const updatedEntry = { ...gratitude, items: [...gratitude.items, newGratitude] };
      setGratitude(updatedEntry); // local update
      saveGratitude(updatedEntry); // storage update
      setNewGratitude('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20 animate-fade-in">
      
      {/* Welcome / Header */}
      <div className="text-center pt-10 pb-6">
        <h1 className="font-serif text-4xl text-neutral-900 mb-2">Aposento Alto</h1>
        <p className="text-neutral-500 font-light text-sm tracking-widest uppercase">Espacio de Encuentro</p>
      </div>

      {/* Quote Carousel */}
      <div className="relative h-32 flex flex-col items-center justify-center border-t border-b border-neutral-100 group">
        <div className="text-center max-w-lg px-4 transition-opacity duration-1000 ease-in-out">
            <p className="font-serif italic text-lg text-neutral-700">"{QUOTES[quoteIndex].text}"</p>
            <p className="text-xs font-bold text-neutral-400 mt-2 uppercase tracking-wide">— {QUOTES[quoteIndex].author}</p>
        </div>
        
        {/* Quote Controls */}
        <div className="absolute bottom-2 flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button onClick={handleShuffleQuote} className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-sacred-gold transition-colors" title="Aleatorio">
                <Shuffle size={14} />
            </button>
            <button onClick={handleNextQuote} className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-sacred-gold transition-colors" title="Siguiente">
                <ChevronRight size={14} />
            </button>
        </div>
      </div>

      {/* Daily Devotional Section */}
      <section className="bg-neutral-50 p-8 rounded-xl border border-neutral-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
              <Sun size={120} />
          </div>
          
          <div className="flex justify-between items-center mb-6">
              <h2 className="font-sans text-xs font-bold tracking-widest text-sacred-gold uppercase">Devocional Diario</h2>
              <div className="flex items-center gap-3">
                  <button 
                    onClick={handleRefreshDevotional} 
                    disabled={loadingDevotional}
                    className={`p-2 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-900 transition-colors ${loadingDevotional ? 'animate-spin' : ''}`}
                    title="Regenerar actual"
                  >
                      <RefreshCw size={14} />
                  </button>
                  <button 
                    onClick={handleRefreshDevotional}
                    disabled={loadingDevotional}
                    className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <span className="text-[10px] font-bold tracking-widest uppercase">Siguiente</span>
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
              </div>
          </div>
          
          {loadingDevotional ? (
             <div className="animate-pulse space-y-4">
                 <div className="h-8 bg-neutral-200 rounded w-3/4"></div>
                 <div className="h-4 bg-neutral-200 rounded w-full"></div>
                 <div className="h-4 bg-neutral-200 rounded w-full"></div>
             </div>
          ) : devotional ? (
             <div>
                 <div className="font-serif text-2xl md:text-3xl text-neutral-900 leading-tight mb-4">
                     "{devotional.verse}"
                 </div>
                 <p className="text-right text-sm font-bold text-neutral-500 mb-8">— {devotional.reference}</p>
                 
                 <div className="prose prose-neutral prose-p:text-neutral-700 prose-p:font-light prose-p:leading-relaxed mb-8">
                     <p>{devotional.reflection}</p>
                 </div>

                 <div className="bg-white p-6 rounded-lg border border-neutral-100">
                     <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">Introspección</h3>
                     <ul className="space-y-3">
                         {devotional.questions?.map((q, i) => (
                             <li key={i} className="flex items-start gap-3">
                                 <span className="text-sacred-gold font-serif italic text-lg">{i + 1}.</span>
                                 <span className="text-neutral-700 font-light">{q}</span>
                             </li>
                         ))}
                     </ul>
                 </div>
             </div>
          ) : null}
      </section>

      {/* Grid: Gratitude & Prayer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Gratitude */}
          <div className="bg-white p-6 rounded-xl border border-neutral-100 shadow-sm">
             <div className="flex items-center gap-2 mb-6">
                 <Heart size={16} className="text-neutral-900" />
                 <h2 className="font-sans text-xs font-bold tracking-widest text-neutral-900 uppercase">Gratitud de Hoy</h2>
             </div>
             
             <div className="space-y-4 mb-4">
                 {gratitude?.items?.map((item, idx) => (
                     <div key={idx} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                         <span className="text-sacred-gold font-serif text-xl">{idx + 1}</span>
                         <span className="text-neutral-700 font-light text-sm">{item}</span>
                     </div>
                 ))}
                 {(!gratitude?.items || gratitude.items.length < 3) && (
                     <div className="flex gap-2">
                         <input 
                            type="text" 
                            value={newGratitude}
                            onChange={(e) => setNewGratitude(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddGratitude()}
                            placeholder="Estoy agradecido por..."
                            className="flex-1 bg-transparent border-b border-neutral-200 py-2 text-sm focus:outline-none focus:border-sacred-gold font-light placeholder:text-neutral-300"
                         />
                         <button onClick={handleAddGratitude} className="text-neutral-400 hover:text-sacred-gold">
                             <Plus size={18} />
                         </button>
                     </div>
                 )}
                 {gratitude?.items?.length === 3 && (
                     <p className="text-center text-xs text-sacred-gold mt-4 italic font-serif">"Dad gracias en todo..."</p>
                 )}
             </div>
          </div>

          {/* Prayer Wall */}
          <div className="bg-white p-6 rounded-xl border border-neutral-100 shadow-sm">
             <div className="flex items-center gap-2 mb-6">
                 <BookOpen size={16} className="text-neutral-900" />
                 <h2 className="font-sans text-xs font-bold tracking-widest text-neutral-900 uppercase">Muro de Peticiones</h2>
             </div>

             <div className="flex gap-2 mb-6">
                 <input 
                    type="text" 
                    value={newPrayer}
                    onChange={(e) => setNewPrayer(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddPrayer()}
                    placeholder="Nueva petición..."
                    className="flex-1 bg-transparent border-b border-neutral-200 py-2 text-sm focus:outline-none focus:border-sacred-gold font-light placeholder:text-neutral-300"
                 />
                 <button onClick={handleAddPrayer} className="text-neutral-400 hover:text-sacred-gold">
                     <Plus size={18} />
                 </button>
             </div>

             <div className="space-y-2 max-h-64 overflow-y-auto no-scrollbar">
                 {prayers.map((prayer) => (
                     <div key={prayer.id} className={`group flex items-center justify-between p-3 rounded-lg border transition-all ${prayer.answered ? 'bg-neutral-50 border-transparent opacity-60' : 'bg-white border-neutral-100'}`}>
                         <div className="flex items-center gap-3">
                             <button 
                                onClick={() => handleTogglePrayer(prayer)}
                                className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${prayer.answered ? 'bg-sacred-gold border-sacred-gold text-white' : 'border-neutral-300 text-transparent hover:border-sacred-gold'}`}
                             >
                                 <Check size={10} />
                             </button>
                             <span className={`text-sm font-light ${prayer.answered ? 'line-through text-neutral-400' : 'text-neutral-700'}`}>
                                 {prayer.text}
                             </span>
                         </div>
                         <button onClick={() => handleDeletePrayer(prayer.id)} className="text-neutral-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                             <Trash2 size={14} />
                         </button>
                     </div>
                 ))}
                 {prayers.length === 0 && (
                     <p className="text-center text-xs text-neutral-300 italic py-4">Sin peticiones activas.</p>
                 )}
             </div>
          </div>
      </div>

    </div>
  );
};