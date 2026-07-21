import { useState, useRef, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

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
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axiosClient.post('/api/v1/chat/assistant', {
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
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 w-80 sm:w-96 h-[500px] bg-surface/95 backdrop-blur-xl border border-outline-variant/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary text-white p-4 flex justify-between items-center">
              <div>
                <h3 className="font-display-sm text-lg">Lumina Assistant</h3>
                <p className="text-xs opacity-80">Online</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-primary-container/20 p-1 rounded-full transition-colors">
                <span className="material-symbols-outlined font-light text-[20px]">close</span>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                    msg.role === 'user' 
                      ? 'bg-primary text-white rounded-tr-sm' 
                      : 'bg-surface-variant text-on-surface rounded-tl-sm'
                  }`}>
                    <p className="font-body-md text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-surface-variant text-on-surface rounded-2xl rounded-tl-sm px-4 py-2 flex gap-1 items-center h-10">
                    <span className="w-2 h-2 bg-on-surface-variant rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-on-surface-variant rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-2 h-2 bg-on-surface-variant rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-outline-variant/20 bg-surface">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about our rituals..."
                  className="flex-1 bg-surface-variant/50 border border-outline-variant/30 rounded-full px-4 py-2 font-body-md text-sm focus:outline-none focus:border-primary/50 text-on-surface"
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-50 hover:bg-primary/90 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">send</span>
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-primary text-white rounded-full shadow-[0_8px_20px_rgba(212,175,55,0.3)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
      >
        <span className="material-symbols-outlined font-light text-[24px]">
          {isOpen ? 'close' : 'chat_bubble'}
        </span>
      </button>
    </div>
  );
};
