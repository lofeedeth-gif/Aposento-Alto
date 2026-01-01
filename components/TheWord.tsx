import React, { useState, useEffect } from 'react';
import { fetchBibleChapter, getVerseExegesis } from '../services/geminiService';
import { BibleChapter, BibleVerse, ExegesisResult } from '../types';
import { Search, ChevronLeft, ChevronRight, Book, Sparkles, X } from 'lucide-react';
import { BIBLE_BOOKS } from '../constants';

const VERSIONS = ['RV1960', 'NVI', 'KJV', 'LBLA'];

// Helper to handle accents in search
const normalizeText = (text: string) => {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

export const TheWord: React.FC = () => {
  // State
  const [selectedBook, setSelectedBook] = useState('Juan');
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [selectedVersion, setSelectedVersion] = useState('RV1960');
  const [bibleData, setBibleData] = useState<BibleChapter | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Exegesis State
  const [exegeteOpen, setExegeteOpen] = useState(false);
  const [activeVerse, setActiveVerse] = useState<BibleVerse | null>(null);
  const [exegesisData, setExegesisData] = useState<ExegesisResult | null>(null);
  const [loadingExegesis, setLoadingExegesis] = useState(false);

  // Search & Highlight State
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedVerses, setHighlightedVerses] = useState<number[]>([]);

  const loadChapter = async (book: string, chapter: number, clearHighlights = true) => {
    setLoading(true);
    setBibleData(null); 
    if (clearHighlights) setHighlightedVerses([]);
    
    const data = await fetchBibleChapter(book, chapter, selectedVersion, 'Spanish');
    setBibleData(data);
    setLoading(false);
    setSelectedBook(book);
    setSelectedChapter(chapter);
  };

  useEffect(() => {
    loadChapter(selectedBook, selectedChapter);
  }, [selectedVersion]); 

  // Effect to scroll to highlighted verse
  useEffect(() => {
      if (!loading && bibleData && highlightedVerses.length > 0) {
          const firstVerse = highlightedVerses[0];
          const element = document.getElementById(`verse-${firstVerse}`);
          if (element) {
              setTimeout(() => {
                  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }, 100);
          }
      }
  }, [bibleData, highlightedVerses, loading]);

  const handleNextChapter = () => {
    loadChapter(selectedBook, selectedChapter + 1);
  };

  const handlePrevChapter = () => {
    if (selectedChapter > 1) loadChapter(selectedBook, selectedChapter - 1);
  };

  const openExegete = async (verse: BibleVerse) => {
      setActiveVerse(verse);
      setExegeteOpen(true);
      setLoadingExegesis(true);
      setExegesisData(null);
      
      const reference = `${selectedBook} ${selectedChapter}:${verse.verse}`;
      const result = await getVerseExegesis(reference, verse.text);
      
      setExegesisData(result);
      setLoadingExegesis(false);
  };

  const closeExegete = () => {
      setExegeteOpen(false);
      setActiveVerse(null);
  };

  const handleSearch = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        const query = searchQuery.trim();
        // Regex: Book (words) + Chapter + : + StartVerse + - + EndVerse
        // Supports: "1 Juan 1:9", "Genesis 1:1-10", "Salmos 23", "Juan 3 : 16"
        // Improved regex allows for optional spaces around delimiters
        const regex = /^(.+?)\s+(\d+)\s*(?::\s*(\d+)(?:\s*-\s*(\d+))?)?$/;
        const match = query.match(regex);
        
        let targetBook = '';
        let targetChapter = 1;
        let startVerse: number | null = null;
        let endVerse: number | null = null;

        if (match) {
            targetBook = match[1];
            targetChapter = parseInt(match[2]);
            if (match[3]) startVerse = parseInt(match[3]);
            if (match[4]) endVerse = parseInt(match[4]);
        } else {
             // Fallback for just "Genesis" (defaults to ch 1) or simple failover
             targetBook = query;
        }

        const normalizedTarget = normalizeText(targetBook);
        const foundBook = BIBLE_BOOKS.find(b => normalizeText(b) === normalizedTarget);
        
        if (foundBook) {
            // Calculate highlights
            const highlights: number[] = [];
            if (startVerse) {
                if (endVerse) {
                    for (let i = startVerse; i <= endVerse; i++) highlights.push(i);
                } else {
                    highlights.push(startVerse);
                }
            }

            // Manual load to coordinate state
            setLoading(true);
            setBibleData(null);
            setHighlightedVerses(highlights);
            
            const data = await fetchBibleChapter(foundBook, targetChapter, selectedVersion, 'Spanish');
            
            setBibleData(data);
            setSelectedBook(foundBook);
            setSelectedChapter(targetChapter);
            setLoading(false);
        }
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6 p-4 md:p-8 relative">
      
      {/* Controls & Reader */}
      <div className={`flex-1 transition-all duration-300 ${exegeteOpen ? 'md:mr-96' : ''}`}>
        
        {/* Top Bar Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-neutral-100 pb-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative group">
                     <select 
                        value={selectedBook}
                        onChange={(e) => loadChapter(e.target.value, 1)}
                        className="appearance-none bg-neutral-50 border border-neutral-200 rounded px-4 py-2 pr-8 font-sans text-sm hover:border-neutral-400 focus:outline-none"
                     >
                         {BIBLE_BOOKS.map(b => <option key={b} value={b}>{b}</option>)}
                     </select>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handlePrevChapter} disabled={selectedChapter <= 1} className="p-2 hover:bg-neutral-100 rounded disabled:opacity-30">
                        <ChevronLeft size={16} />
                    </button>
                    <span className="font-serif text-lg min-w-[30px] text-center">{selectedChapter}</span>
                    <button onClick={handleNextChapter} className="p-2 hover:bg-neutral-100 rounded">
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                    <input 
                        type="text" 
                        placeholder="Ir a (ej. Juan 3:16)" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearch}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-neutral-200 rounded-full text-sm focus:outline-none focus:border-neutral-400 transition-all shadow-sm"
                    />
                    <Search size={14} className="absolute left-3 top-3 text-neutral-400" />
                </div>
                <select 
                    value={selectedVersion}
                    onChange={(e) => setSelectedVersion(e.target.value)}
                    className="bg-transparent text-xs font-bold tracking-widest text-neutral-500 uppercase border-none focus:ring-0 cursor-pointer"
                >
                    {VERSIONS.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
            </div>
        </div>

        {/* Paper Interface */}
        <div className="bg-white max-w-3xl mx-auto min-h-[600px]">
            {loading ? (
                <div className="flex items-center justify-center h-64 text-neutral-300">
                    <span className="animate-pulse font-serif italic">Cargando las Escrituras...</span>
                </div>
            ) : bibleData && bibleData.verses && Array.isArray(bibleData.verses) ? (
                <div className="animate-fade-in">
                    <h2 className="font-serif text-4xl text-center mb-12 text-neutral-900">{bibleData.book} {bibleData.chapter}</h2>
                    <div className="space-y-4">
                        {bibleData.verses.map((v) => {
                            const isHighlighted = highlightedVerses.includes(v.verse);
                            return (
                                <div 
                                    key={v.verse} 
                                    id={`verse-${v.verse}`} 
                                    className={`group relative pl-4 md:pl-0 transition-colors duration-500 ${isHighlighted ? 'bg-sacred-goldLight/20 -mx-4 px-4 py-2 rounded' : ''}`}
                                >
                                    <span className="absolute -left-2 md:-left-6 top-1 text-[10px] text-neutral-300 font-sans select-none">{v.verse}</span>
                                    <p className="font-serif text-lg md:text-xl leading-loose text-neutral-800 text-justify">
                                        {v.text}
                                        <button 
                                            onClick={() => openExegete(v)}
                                            className="inline-flex ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-sacred-gold hover:text-neutral-900"
                                            title="IA Exégeta"
                                        >
                                            <Sparkles size={14} />
                                        </button>
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-center h-64 text-red-300">
                    <span className="font-sans text-sm">No se pudieron cargar los versículos. Intente nuevamente.</span>
                </div>
            )}
        </div>
      </div>

      {/* Exegete Sidebar */}
      <div className={`fixed top-0 right-0 h-full bg-neutral-50 border-l border-neutral-200 w-full md:w-96 transform transition-transform duration-300 ease-in-out z-40 overflow-y-auto ${exegeteOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full'}`}>
          <div className="p-6">
              <div className="flex justify-between items-center mb-8">
                  <h3 className="font-sans text-xs font-bold tracking-widest text-sacred-gold uppercase flex items-center gap-2">
                      <Sparkles size={14} /> IA Exégeta
                  </h3>
                  <button onClick={closeExegete} className="text-neutral-400 hover:text-neutral-900">
                      <X size={20} />
                  </button>
              </div>

              {activeVerse && (
                  <div className="mb-8 p-4 bg-white rounded border border-neutral-100 shadow-sm">
                      <p className="font-serif italic text-neutral-600">"{activeVerse.text}"</p>
                      <p className="text-right text-xs text-neutral-400 mt-2 font-bold">{selectedBook} {selectedChapter}:{activeVerse.verse}</p>
                  </div>
              )}

              {loadingExegesis ? (
                  <div className="space-y-6 animate-pulse">
                      {[1,2,3].map(i => <div key={i} className="h-24 bg-neutral-200 rounded"></div>)}
                  </div>
              ) : exegesisData ? (
                  <div className="space-y-8 animate-fade-in">
                      <div>
                          <h4 className="font-serif text-lg text-neutral-900 mb-2 border-b border-neutral-200 pb-2">Contexto Histórico</h4>
                          <p className="text-sm font-light leading-relaxed text-neutral-700">{exegesisData.context}</p>
                      </div>
                      <div>
                          <h4 className="font-serif text-lg text-neutral-900 mb-2 border-b border-neutral-200 pb-2">Significado Teológico</h4>
                          <p className="text-sm font-light leading-relaxed text-neutral-700">{exegesisData.theology}</p>
                      </div>
                      <div className="bg-neutral-900 text-neutral-50 p-4 rounded-lg">
                          <h4 className="font-serif text-lg text-sacred-gold mb-2">Peso de Fe (Aplicación)</h4>
                          <p className="text-sm font-light leading-relaxed">{exegesisData.application}</p>
                      </div>
                  </div>
              ) : null}
          </div>
      </div>

    </div>
  );
};