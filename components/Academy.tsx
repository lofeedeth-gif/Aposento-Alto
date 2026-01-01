import React, { useState } from 'react';
import { generateStudyPlan, getBibleDictionaryDefinition } from '../services/geminiService';
import { StudyPlan } from '../types';
import { Search, Book, GraduationCap, ArrowRight, Loader2 } from 'lucide-react';

export const Academy: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [dictionaryTerm, setDictionaryTerm] = useState('');
  const [dictionaryResult, setDictionaryResult] = useState<string | null>(null);
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingDict, setLoadingDict] = useState(false);

  const handleStudySubmit = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setStudyPlan(null);
    try {
        const result = await generateStudyPlan(topic);
        setStudyPlan(result);
    } catch (e) {
        console.error(e);
    }
    setLoading(false);
  };

  const handleDictionarySearch = async () => {
      if (!dictionaryTerm.trim()) return;
      setLoadingDict(true);
      setDictionaryResult(null);
      const res = await getBibleDictionaryDefinition(dictionaryTerm);
      setDictionaryResult(res);
      setLoadingDict(false);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Left Column: Tools */}
      <div className="lg:col-span-1 space-y-8">
        
        {/* Study Generator Input */}
        <div className="bg-neutral-50 p-6 rounded-xl border border-neutral-200">
            <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="text-neutral-900" size={20} />
                <h2 className="font-sans text-xs font-bold uppercase tracking-widest">Estudio Profundo</h2>
            </div>
            <p className="text-xs text-neutral-500 mb-4 font-light">
                Introduce un tema teológico (ej. "La Gracia", "Justificación", "El Templo") para generar un plan de estudio.
            </p>
            <input 
                type="text" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Tema de estudio..."
                className="w-full bg-white border border-neutral-300 rounded p-2 mb-3 text-sm focus:border-sacred-gold outline-none"
            />
            <button 
                onClick={handleStudySubmit}
                disabled={loading}
                className="w-full bg-neutral-900 text-white py-2 rounded text-xs uppercase tracking-widest hover:bg-neutral-800 disabled:opacity-50 flex justify-center items-center gap-2"
            >
                {loading ? <Loader2 className="animate-spin" size={14} /> : 'Generar Plan'}
            </button>
        </div>

        {/* Dictionary Input */}
        <div className="bg-neutral-50 p-6 rounded-xl border border-neutral-200">
            <div className="flex items-center gap-2 mb-4">
                <Book className="text-neutral-900" size={20} />
                <h2 className="font-sans text-xs font-bold uppercase tracking-widest">Diccionario Bíblico</h2>
            </div>
            <div className="relative">
                <input 
                    type="text" 
                    value={dictionaryTerm}
                    onChange={(e) => setDictionaryTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleDictionarySearch()}
                    placeholder="Definir término..."
                    className="w-full bg-white border border-neutral-300 rounded p-2 pr-10 text-sm focus:border-sacred-gold outline-none"
                />
                <button 
                    onClick={handleDictionarySearch}
                    disabled={loadingDict}
                    className="absolute right-2 top-2 text-neutral-400 hover:text-neutral-900"
                >
                    {loadingDict ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
                </button>
            </div>
            {dictionaryResult && (
                <div className="mt-4 p-3 bg-white border-l-2 border-sacred-gold rounded text-sm text-neutral-700 font-light animate-fade-in">
                    {dictionaryResult}
                </div>
            )}
        </div>
      </div>

      {/* Right Column: Output */}
      <div className="lg:col-span-2">
        {loading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-50">
                <Loader2 className="animate-spin text-sacred-gold" size={40} />
                <p className="font-serif italic text-neutral-400">Consultando las escrituras y referencias teológicas...</p>
            </div>
        ) : studyPlan ? (
            <div className="bg-white p-8 rounded-xl border border-neutral-100 shadow-sm animate-fade-in">
                <h1 className="font-serif text-3xl text-neutral-900 mb-2 border-b border-sacred-gold pb-4 inline-block pr-12">
                    {studyPlan.topic}
                </h1>
                
                <div className="mt-8">
                    <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">Introducción</h3>
                    <p className="text-neutral-700 font-light leading-relaxed mb-8">
                        {studyPlan.introduction}
                    </p>
                </div>

                <div className="mb-8">
                    <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">Referencias Cruzadas</h3>
                    <div className="space-y-6">
                        {studyPlan.references?.map((ref, idx) => (
                            <div key={idx} className="flex gap-4">
                                <div className="min-w-[4rem] text-right pt-1">
                                    <span className="font-serif text-sacred-gold font-bold text-lg block border-r border-neutral-200 pr-3">
                                        {idx + 1}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-bold text-neutral-900 text-sm block mb-1">{ref.reference}</span>
                                    <p className="text-sm text-neutral-600 font-light">{ref.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-neutral-50 p-6 rounded-lg">
                    <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                        Conclusión <ArrowRight size={12} />
                    </h3>
                    <p className="text-neutral-700 font-serif italic text-lg leading-relaxed">
                        {studyPlan.conclusion}
                    </p>
                </div>
            </div>
        ) : (
            <div className="h-full flex flex-col items-center justify-center text-neutral-300 border-2 border-dashed border-neutral-100 rounded-xl p-12">
                <GraduationCap size={48} className="mb-4 opacity-20" />
                <p className="font-light">Selecciona un tema para comenzar tu estudio profundo.</p>
            </div>
        )}
      </div>

    </div>
  );
};