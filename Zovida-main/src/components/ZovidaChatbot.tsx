import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, X, Bot, Loader2, Sparkles, Mic, Volume2, Paperclip, FileText, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { endpoints } from "@/lib/api";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from 'react-i18next';

interface Message {
  id: string;
  role: "user" | "model";
  text: string;
  attachment?: {
    name: string;
    type: string;
    url: string;
  };
}

const ZovidaChatbot = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "model",
      text: "I help explain medication safety checks and known interaction risks. I do not provide medical advice.",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [userContext, setUserContext] = useState<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load user context from backend on mount
  useEffect(() => {
    const fetchUserContext = async () => {
      const userId = localStorage.getItem('zovida_user_id');
      if (!userId) return;

      try {
        const [historyRes, remindersRes] = await Promise.all([
          fetch(endpoints.history(userId)),
          fetch(endpoints.reminders.get(userId))
        ]);

        let contextParts = [];

        if (historyRes.ok) {
          const historyData = await historyRes.json();
          if (historyData.length > 0) {
            const historyStr = historyData.map((h: any) => 
              `- Interaction check: ${h.drug1} and ${h.drug2} (${h.level} risk)`
            ).join('\n');
            contextParts.push(`Recent Medication History:\n${historyStr}`);
          }
        }

        if (remindersRes.ok) {
          const remindersData = await remindersRes.json();
          if (remindersData.length > 0) {
            const remindersStr = remindersData.map((r: any) => 
              `- ${r.medicineName}: ${r.dosage} at ${r.time}`
            ).join('\n');
            contextParts.push(`Current Medication Reminders:\n${remindersStr}`);
          }
        }

        if (contextParts.length > 0) {
          setUserContext(`\n\n[USER CONTEXT]\n${contextParts.join('\n\n')}`);
        }
      } catch (error) {
        console.error("Error fetching user context for chatbot:", error);
      }
    };

    fetchUserContext();
  }, []);

  const suggestedQuestions = [
    "How do I scan a prescription?",
    "Can I talk to a doctor?",
    "How does interaction checking work?",
    "How should I use this report with my doctor?"
  ];

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Handle Text to Speech (Bot Voice)
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Select voice based on current language
      const voices = window.speechSynthesis.getVoices();
      const currentLang = i18n.language;
      
      let selectedVoice = voices.find(v => v.lang.startsWith(currentLang));
      
      // Fallback to English if no voice found for current language
      if (!selectedVoice) {
        selectedVoice = voices.find(v => v.lang.startsWith('en'));
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      utterance.lang = currentLang;
      utterance.rate = 1;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Handle Speech to Text (Voice Input)
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('speechRecognition' in window)) {
      toast.error("Speech recognition is not supported in your browser.");
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).speechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = i18n.language === 'hi' ? 'hi-IN' : (i18n.language === 'es' ? 'es-ES' : 'en-US');
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      toast.info(i18n.language === 'hi' ? "सुन रहा हूँ..." : (i18n.language === 'es' ? "Escuchando..." : "Listening..."));
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      toast.error("Speech recognition failed. Please try again.");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleSend = async (text?: string) => {
    const messageText = text || inputValue;
    if (!messageText.trim() && !selectedFile) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      text: messageText || (selectedFile ? `Analyzing uploaded file: ${selectedFile.name}` : ""),
      attachment: selectedFile ? {
        name: selectedFile.name,
        type: selectedFile.type,
        url: URL.createObjectURL(selectedFile)
      } : undefined
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    const currentFile = selectedFile;
    setSelectedFile(null);
    setIsLoading(true);

    try {
      // Prepare history for context
      const history = messages.map(m => ({
        role: m.role === "model" ? "assistant" : "user" as "assistant" | "user",
        content: m.text
      }));

      const apiResponse = await fetch(endpoints.ml.chat, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText + userContext,
          history: history
        }),
      });

      if (!apiResponse.ok) {
        throw new Error('Failed to chat with AI via backend');
      }

      const data = await apiResponse.json();
      const aiResponse = data.response;

      // Extract navigation tags if any
      if (aiResponse.includes("[navigate:doctors]")) {
        setTimeout(() => navigate("/doctors"), 2000);
      } else if (aiResponse.includes("[navigate:sos]")) {
        setTimeout(() => navigate("/sos"), 2000);
      }

      // Clean response from tags for UI
      const cleanResponse = aiResponse
        .replace("[navigate:doctors]", "")
        .replace("[navigate:sos]", "")
        .trim();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "model",
        text: cleanResponse,
      };

      setMessages((prev) => [...prev, botMessage]);
      speak(cleanResponse);
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to get response from Zovida AI.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-[110] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 w-[350px] sm:w-[400px] shadow-2xl rounded-xl overflow-hidden"
          >
            <Card className="border-primary/20 shadow-lg bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-4 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-white/20 rounded-full">
                    <Sparkles size={18} className="text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold">Zovida AI - Medication Safety Guide</CardTitle>
                    <p className="text-xs text-blue-100 font-medium">Medical Assistant</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20 h-8 w-8"
                    onClick={() => setIsOpen(false)}
                  >
                    <X size={18} />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                <ScrollArea className="h-[350px] p-4" ref={scrollRef}>
                  <div className="flex flex-col gap-3">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex w-full",
                          msg.role === "user" ? "justify-end" : "justify-start"
                        )}
                      >
                        <div className="flex flex-col gap-1 max-w-[80%]">
                          <div
                            className={cn(
                              "rounded-2xl px-4 py-2 text-sm shadow-sm relative group",
                              msg.role === "user"
                                ? "bg-blue-600 text-white rounded-tr-none"
                                : "bg-secondary text-secondary-foreground rounded-tl-none"
                            )}
                          >
                            {msg.text}
                            {msg.attachment && (
                              <div className="mt-2 p-2 bg-black/10 rounded-lg flex items-center gap-2 border border-white/10">
                                <FileText size={20} className={msg.role === "user" ? "text-white" : "text-blue-600"} />
                                <div className="overflow-hidden">
                                  <p className="text-[10px] font-medium truncate">{msg.attachment.name}</p>
                                  <p className="text-[8px] opacity-70">{(msg.attachment.type).split('/')[1].toUpperCase()}</p>
                                </div>
                                <Check size={14} className="ml-auto text-green-400" />
                              </div>
                            )}
                            {msg.role === "model" && (
                              <button
                                onClick={() => speak(msg.text)}
                                className="absolute -right-8 top-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-blue-600"
                                title="Read out loud"
                              >
                                <Volume2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-secondary text-secondary-foreground rounded-2xl rounded-tl-none px-4 py-2 shadow-sm flex items-center gap-1">
                          <Loader2 size={14} className="animate-spin" />
                          <span className="text-xs">Thinking...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {messages.length === 1 && !isLoading && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {suggestedQuestions.map((q, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(q)}
                          className="text-[10px] bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-full px-3 py-1 transition-colors text-left"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
                <div className="p-3 border-t bg-muted/20">
                  {selectedFile && (
                    <div className="mb-2 px-2 py-1 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-bottom-2">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText size={14} className="text-blue-600 shrink-0" />
                        <span className="text-[10px] font-medium truncate text-blue-700">{selectedFile.name}</span>
                      </div>
                      <button onClick={() => setSelectedFile(null)} className="text-blue-400 hover:text-red-500">
                        <X size={12} />
                      </button>
                    </div>
                  )}
                  <div className="relative flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            toast.error("File size too large. Please upload a file smaller than 5MB.");
                            return;
                          }
                          setSelectedFile(file);
                          toast.success(`File "${file.name}" ready for analysis.`);
                        }
                      }}
                      className="hidden"
                      accept="image/*,.pdf,.doc,.docx"
                    />
                    <Button
                       size="icon"
                       variant="ghost"
                       className="rounded-full h-8 w-8 text-muted-foreground hover:bg-muted hover:text-blue-600"
                       onClick={() => fileInputRef.current?.click()}
                       disabled={isLoading}
                       title="Upload Report/Prescription"
                    >
                      <Paperclip size={18} />
                    </Button>
                    <Button
                       size="icon"
                       variant="ghost"
                       className={cn(
                         "rounded-full h-8 w-8 transition-colors",
                         isListening ? "bg-red-100 text-red-600 animate-pulse" : "text-muted-foreground hover:bg-muted"
                       )}
                       onClick={startListening}
                       disabled={isLoading}
                       title="Voice Input"
                    >
                      <Mic size={18} />
                    </Button>
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder={selectedFile ? "Add a comment..." : "Ask about medications..."}
                      className="pr-10 rounded-full border-blue-200 focus-visible:ring-blue-500"
                      disabled={isLoading}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute right-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full h-8 w-8"
                      onClick={() => handleSend()}
                      disabled={isLoading || (!inputValue.trim() && !selectedFile)}
                    >
                      <Send size={16} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
          isOpen 
            ? "bg-secondary text-secondary-foreground hover:bg-secondary/80" 
            : "bg-blue-600 text-white hover:bg-blue-700"
        )}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </motion.button>
    </div>
  );
};

export default ZovidaChatbot;
