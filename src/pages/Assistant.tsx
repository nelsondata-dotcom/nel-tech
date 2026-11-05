import React, { useState, useRef, useEffect } from 'react';
import { useFinancialData } from '../contexts/FinancialContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Send, Bot, User, Sparkles, MessageSquare, Mic, MicOff, StopCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { SpeechButton } from '../components/common/SpeechButton';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function Assistant() {
  const { records } = useFinancialData();
  const { language, t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: language === 'ak' 
        ? 'Mema wo akwaaba! Mene wo AI sika ho boafoɔ. Metumi aboa wo ma woate wo dwumadie sika ho nsɛm ase, anaa sɛ wobɛbisa me sika ho asɛm biara. Ɛdeɛn na mekyerɛ wo mprempren?'
        : 'Hello! I am your SME Financial Assistant. I can help you analyze your business performance, explain ratios, or identify financial risks based on your data. How can I help you today?' 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent, customInput?: string) => {
    if (e) e.preventDefault();
    const messageToSend = customInput || input;
    if (!messageToSend.trim() || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: messageToSend }]);
    setLoading(true);

    try {
      const response = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: messageToSend,
          financialData: records[0] || null,
          language
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error: any) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: language === 'ak' ? "Mepa wo kyɛw, mfomsoɔ bi aba. Mesrɛ wo san bɔ mmɔden bio." : "Sorry, I encountered an error. Please try again." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          await processVoiceInput(base64Audio);
        };
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processVoiceInput = async (base64Audio: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/gemini/stt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audio: base64Audio })
      });
      const data = await response.json();
      if (data.text) {
        setInput(data.text);
        // Optionally auto-send
        // handleSend(undefined, data.text);
      }
    } catch (err) {
      console.error("STT failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Sparkles className="text-white w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 tracking-tight">{t('assistant.title')}</h3>
            <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">
              {language === 'ak' ? 'Yɛreyɛ Nhwehwɛmu' : 'Online & Analyzing Data'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((m, i) => (
          <div key={i} className={cn(
            "flex gap-4 max-w-4xl",
            m.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
          )}>
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
              m.role === 'assistant' ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-600"
            )}>
              {m.role === 'assistant' ? <Bot className="w-6 h-6" /> : <User className="w-6 h-6" />}
            </div>
            <div className="space-y-2 max-w-[85%]">
              <div className={cn(
                "p-5 rounded-2xl text-sm leading-relaxed shadow-sm",
                m.role === 'assistant' 
                  ? "bg-slate-50 text-slate-800 border border-slate-100" 
                  : "bg-emerald-500 text-white font-medium"
              )}>
                {m.content.split('\n').map((line, j) => (
                  <p key={j} className={line.trim() === '' ? 'h-2' : 'mb-1 last:mb-0'}>{line}</p>
                ))}
              </div>
              {m.role === 'assistant' && (
                <SpeechButton text={m.content} size="sm" className="ml-2" />
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-4 mr-auto">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex gap-1.5 items-center">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-100"></span>
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-200"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-6 border-t border-slate-100 bg-slate-50/30">
        <div className="relative flex items-center gap-3">
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className={cn(
              "p-4 rounded-2xl transition-all shadow-lg active:scale-95 flex items-center justify-center shrink-0",
              isRecording 
                ? "bg-red-500 text-white animate-pulse" 
                : "bg-white text-slate-400 hover:text-emerald-500 border border-slate-200"
            )}
            title={language === 'ak' ? "Kasa firi wo anomu" : "Speak your question"}
          >
            {isRecording ? <StopCircle className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          <div className="relative flex-1">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('assistant.placeholder')}
              className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-5 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm font-medium"
            />
            <button 
              type="submit"
              disabled={!input.trim() || loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-400 transition-colors disabled:opacity-50 shadow-md shadow-emerald-500/20"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex justify-center gap-4 mt-4">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
            Powered by Gemini AI
          </p>
          <span className="text-[10px] text-slate-200">|</span>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
            {language === 'ak' ? 'Ghana SME Financial Health' : 'Twi & English Support'}
          </p>
        </div>
      </form>
    </div>
  );
}
