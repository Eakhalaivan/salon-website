import { useState, useRef, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTIONS = [
  "Book an appointment",
  "View membership details",
  "What are your hours?",
  "Tell me about facials"
];

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Welcome to LuxeSuite. How may I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;

    const userMessage: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axiosClient.post('/chat/assistant', {
        messages: [...messages, userMessage]
      });
      setMessages(prev => [...prev, response.data]);
    } catch (error) {
      console.error('Chat error', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'I am experiencing a momentary disconnect. Please try again later.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(10px)' }}
            transition={{ duration: 0.4, type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute bottom-20 right-0 w-[360px] sm:w-[400px] h-[600px] max-h-[80vh] bg-surface-container-lowest/85 backdrop-blur-3xl border border-outline-variant/30 rounded-[32px] shadow-[0_24px_60px_rgba(0,0,0,0.2),0_0_0_1px_rgba(204,164,74,0.1)] flex flex-col overflow-hidden"
          >
            {/* Premium Header */}
            <div className="bg-gradient-to-r from-surface-container via-surface-container to-surface-container-high border-b border-outline-variant/20 px-6 py-5 flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="relative">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center border border-primary/30">
                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-surface-container-lowest"></div>
                </div>
                <div>
                  <h3 className="font-headline-md text-[16px] text-on-surface">Lumina Assistant</h3>
                  <p className="text-[11px] text-primary font-bold uppercase tracking-widest mt-0.5">Online</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="hover:bg-surface-container-highest p-2 rounded-full transition-colors text-on-surface-variant z-10"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gradient-to-b from-transparent to-surface-container-lowest/50">
              {messages.map((msg, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  key={idx} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] px-5 py-3.5 shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-br from-[#CCA44A] to-[#A37B24] text-white rounded-[20px] rounded-br-[4px]' 
                      : 'bg-surface-container text-on-surface rounded-[20px] rounded-tl-[4px] border border-outline-variant/20'
                  }`}>
                    <p className="font-body-md text-[14px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-surface-container text-on-surface rounded-[20px] rounded-tl-[4px] border border-outline-variant/20 px-5 py-4 flex gap-1.5 items-center h-12 shadow-sm">
                    <span className="w-1.5 h-1.5 bg-primary/70 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-primary/70 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-1.5 h-1.5 bg-primary/70 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} className="h-2" />
            </div>

            {/* Suggestions & Input Area */}
            <div className="bg-surface-container-lowest/90 backdrop-blur-md border-t border-outline-variant/20 flex flex-col z-20">
              {/* Suggestion Chips */}
              {messages.length < 5 && !isLoading && (
                <div className="px-4 pt-3 pb-1 overflow-x-auto custom-scrollbar scroll-smooth">
                  <div className="flex gap-2 pb-2 w-max">
                    {SUGGESTIONS.map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(suggestion)}
                        className="whitespace-nowrap px-4 py-1.5 bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface-variant hover:text-primary rounded-full text-[12px] font-label-md transition-all duration-300 hover:shadow-sm"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Form */}
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="p-4 pt-2"
              >
                <div className="relative flex items-center group">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask Lumina anything..."
                    className="w-full bg-surface-container border border-outline-variant/40 rounded-full pl-5 pr-12 py-3.5 font-body-md text-[14px] focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 text-on-surface transition-all shadow-inner"
                  />
                  <button 
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="absolute right-1.5 bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-30 disabled:bg-surface-container-highest hover:bg-primary/90 transition-colors shadow-sm disabled:shadow-none"
                  >
                    <span className="material-symbols-outlined text-[18px]">send</span>
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-[0_8px_30px_rgba(204,164,74,0.3)] hover:shadow-[0_12px_40px_rgba(204,164,74,0.4)] active:scale-95 group ${
          isOpen ? 'bg-surface-container-high text-on-surface' : 'bg-gradient-to-br from-[#CCA44A] to-[#A37B24] text-white'
        }`}
      >
        <span className="material-symbols-outlined font-light text-[28px] group-hover:scale-110 transition-transform duration-300">
          {isOpen ? 'close' : 'spa'}
        </span>
      </button>
    </div>
  );
};
