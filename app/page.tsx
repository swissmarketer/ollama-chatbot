'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [charCount, setCharCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [messages, scrollToBottom])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
    setCharCount(e.target.value.length)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const form = (e.target as HTMLInputElement).form
      if (form) form.dispatchEvent(new Event('submit', { bubbles: true }))
    }
    if (e.key === 'Escape') {
      setInput('')
      setCharCount(0)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    abortControllerRef.current?.abort()
    abortControllerRef.current = new AbortController()

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }
    
    const assistantMessageId = (Date.now() + 1).toString()
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date()
    }
    
    const allMessages = [...messages, userMessage]
    setMessages(prev => [...prev, userMessage, assistantMessage])
    setInput('')
    setCharCount(0)
    setLoading(true)
    setIsTyping(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: allMessages.map(({ role, content }) => ({ role, content }))
        }),
        signal: abortControllerRef.current.signal
      })
      
      if (!res.ok) {
        throw new Error('API Error')
      }
      
      const reader = res.body?.getReader()
      if (!reader) throw new Error('No reader')
      
      const decoder = new TextDecoder()
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value, { stream: true })
        
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: msg.content + chunk }
            : msg
        ))
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { ...msg, content: 'Verbindungsfehler. Bitte versuche es erneut.' }
          : msg
      ))
    }
    
    setLoading(false)
    setIsTyping(false)
  }

  const clearChat = () => {
    abortControllerRef.current?.abort()
    setMessages([])
    setCharCount(0)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 glass border-b border-white/10"
      >
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-green-500 flex items-center justify-center"
            >
              <svg className="w-6 h-6 text-dark-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </motion.div>
            <div>
              <h1 className="text-xl font-bold gradient-text">AI Chat</h1>
              <p className="text-xs text-gray-500">Powered by Ollama</p>
            </div>
          </div>
          
          {messages.length > 0 && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearChat}
              className="px-4 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Neu
            </motion.button>
          )}
        </div>
      </motion.header>

      {/* Messages */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-8 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-96 space-y-6"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-24 h-24 rounded-3xl bg-gradient-to-br from-accent-500/20 to-green-500/20 flex items-center justify-center backdrop-blur-xl border border-white/10"
              >
                <span className="text-5xl">🤖</span>
              </motion.div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Willkommen!</h2>
                <p className="text-gray-500">Stelle mir eine Frage - ich bin bereit zu helfen.</p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {['Erkläre mir etwas', 'Hilf mir mit Code', 'Was ist KI?'].map((suggestion, i) => (
                  <motion.button
                    key={suggestion}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.05, backgroundColor: 'rgb(22, 33, 62)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setInput(suggestion)}
                    className="px-4 py-2 rounded-full bg-dark-700 text-sm text-gray-300 border border-white/10 hover:border-accent-500/50 transition-all"
                  >
                    {suggestion}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-6`}
              >
                <motion.div
                  initial={{ x: message.role === 'user' ? 50 : -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className={`max-w-[85%] group relative ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-accent-500/20 to-accent-500/10 rounded-3xl rounded-br-md'
                      : 'bg-dark-700 rounded-3xl rounded-bl-md'
                  } p-5 border border-white/10 backdrop-blur-xl`}
                >
                  <div className="flex items-start gap-3">
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500 to-green-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm">🤖</span>
                      </div>
                    )}
                    <div className="flex-1 space-y-2">
                      <div className="text-white leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </div>
                      <div className="text-xs text-gray-600">
                        {message.timestamp.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    {message.role === 'user' && (
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm">👤</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            ))
          )}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500 to-green-500 flex items-center justify-center">
                <span className="text-sm">🤖</span>
              </div>
              <div className="bg-dark-700 rounded-3xl rounded-bl-md px-5 py-4 border border-white/10 backdrop-blur-xl">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -8, 0] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.15,
                        ease: 'easeInOut'
                      }}
                      className="w-2 h-2 rounded-full bg-accent-500"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky bottom-0 glass border-t border-white/10"
      >
        <div className="max-w-4xl mx-auto px-6 py-6">
          <form onSubmit={handleSubmit} className="relative">
            <motion.div
              animate={loading ? { scale: [1, 1.02, 1] } : {}}
              transition={{ duration: 0.5 }}
              className="relative bg-dark-700 rounded-2xl border border-white/10 focus-within:border-accent-500/50 transition-colors"
            >
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Nachricht eingeben..."
                disabled={loading}
                autoComplete="off"
                className="w-full bg-transparent px-6 py-4 pr-32 text-white placeholder-gray-500 outline-none rounded-2xl"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
                {input && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    type="button"
                    onClick={() => setInput('')}
                    className="p-2 rounded-xl hover:bg-dark-600 text-gray-500 hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-accent-500 to-green-500 text-dark-900 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <span>Senden</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </motion.button>
              </div>
            </motion.div>
            <p className="text-xs text-gray-600 text-center mt-3">
              KI kann Fehler machen. Überprüfe wichtige Informationen.
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  )
}