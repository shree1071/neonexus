import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Phone, Volume2, VolumeX } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface TutorSidebarProps {
  latestExplanation?: string | null;
}

export default function TutorSidebar({ latestExplanation }: TutorSidebarProps) {
  const [isActive, setIsActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat log (scroll to the top of the new message so they can read it)
  useEffect(() => {
    // Instead of scrolling the dummy element at the very bottom, let's just scroll to the top of the container
    // or to the most recently added message.
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [messages]);

  // When a new explanation arrives, speak it and log it
  useEffect(() => {
    if (!latestExplanation || !isActive) return;

    // Add to chat log
    setMessages(prev => [...prev, { role: 'AI Tutor', text: latestExplanation }]);

    // Speak using the browser's built-in Speech Synthesis (free, no API key!)
    if (!isMuted && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any ongoing speech
      // Remove LaTeX and markdown symbols for speech
      const textToSpeak = latestExplanation.replace(/[`*#$]/g, '').replace(/\\text\{([^}]+)\}/g, '$1').replace(/\\([a-zA-Z]+)/g, '$1');
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      // Try to pick a good English voice
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) 
        || voices.find(v => v.lang.startsWith('en'));
      if (preferred) utterance.voice = preferred;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  }, [latestExplanation, isActive, isMuted]);

  const startSession = () => {
    setIsActive(true);
    setMessages([{ role: 'System', text: 'AI Tutor is ready! Draw a circle on the video to get an explanation.' }]);
    
    // Speak greeting
    if ('speechSynthesis' in window) {
      const greeting = new SpeechSynthesisUtterance("Hello! I'm your AI Physics Tutor. Pause the video, draw a circle around any equation or concept, and I'll explain it to you!");
      greeting.rate = 1.0;
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en'))
        || voices.find(v => v.lang.startsWith('en'));
      if (preferred) greeting.voice = preferred;
      greeting.onstart = () => setIsSpeaking(true);
      greeting.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(greeting);
    }
  };

  const endSession = () => {
    window.speechSynthesis?.cancel();
    setIsActive(false);
    setIsSpeaking(false);
    setMessages([]);
  };

  const toggleMute = () => {
    if (!isMuted) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
    }
    setIsMuted(!isMuted);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/50">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`}></span>
          AI Tutor Session
        </h2>
        <p className="text-xs text-slate-400 mt-1">Powered by Gemma 4</p>
      </div>

      {/* Avatar / Waveform Section */}
      <div className="p-4 flex flex-col items-center justify-center flex-shrink-0">
        <div className={`w-full aspect-video rounded-xl overflow-hidden border-2 transition-colors flex items-center justify-center ${
          isActive ? 'border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)] bg-gradient-to-br from-slate-800 to-slate-900' : 'border-slate-700 bg-slate-800'
        }`}>
          {isActive ? (
            <div className="flex flex-col items-center gap-4">
              {/* Animated AI Avatar Circle */}
              <div className={`relative w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ${
                isSpeaking ? 'shadow-[0_0_30px_rgba(59,130,246,0.6)]' : ''
              }`}>
                <div className={`absolute inset-0 rounded-full border-2 border-blue-400/50 ${isSpeaking ? 'animate-ping' : ''}`} style={{ animationDuration: '1.5s' }}></div>
                <span className="text-3xl">🎓</span>
              </div>
              
              {/* Sound Wave Animation */}
              {isSpeaking && (
                <div className="flex items-end gap-1 h-8">
                  {[...Array(7)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-blue-400 rounded-full animate-pulse"
                      style={{
                        height: `${12 + Math.random() * 20}px`,
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: '0.4s',
                      }}
                    />
                  ))}
                </div>
              )}

              <span className="text-xs text-slate-400 font-medium">
                {isSpeaking ? '🔊 Speaking...' : '🎧 Listening...'}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-slate-400">
              <span className="text-4xl mb-2">🎓</span>
              <span className="text-sm font-medium">Ready to connect...</span>
            </div>
          )}
        </div>

        {/* Call Controls */}
        <div className="flex items-center gap-4 mt-6">
          {isActive ? (
            <>
              <button 
                onClick={toggleMute}
                className={`p-3 rounded-full transition-colors ${isMuted ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <button 
                onClick={endSession}
                className="px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-medium flex items-center gap-2 transition-colors"
              >
                <Phone size={18} className="rotate-[135deg]" />
                End Session
              </button>
            </>
          ) : (
            <button 
              onClick={startSession}
              className="px-8 py-3 rounded-full text-white font-bold flex items-center gap-2 transition-all bg-blue-600 hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]"
            >
              <Phone size={20} />
              Start AI Tutor
            </button>
          )}
        </div>
      </div>

      {/* Chat Log */}
      <div className="flex-1 overflow-y-auto p-4 border-t border-slate-800 bg-slate-900/30">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Session Log</div>
        
        {messages.length > 0 ? (
          <div className="space-y-4 pb-10">
            {messages.map((msg, i) => (
              <div 
                key={i} 
                ref={i === messages.length - 1 ? messagesEndRef : null}
                className={`rounded-lg p-4 text-sm border shadow-lg ${
                msg.role === 'System' 
                  ? 'bg-slate-800 text-slate-300 border-slate-700'
                  : 'bg-slate-800/90 text-blue-50 border-blue-800/50'
              }`}>
                <span className={`font-bold block mb-2 tracking-wide ${
                  msg.role === 'System' ? 'text-green-400' : 'text-blue-400'
                }`}>{msg.role}</span>
                <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-700">
                  <ReactMarkdown 
                    remarkPlugins={[remarkMath]} 
                    rehypePlugins={[rehypeKatex]}
                  >
                    {msg.text}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-slate-500 text-center mt-10">
            Start a session to begin learning.
          </div>
        )}
      </div>
    </div>
  );
}
