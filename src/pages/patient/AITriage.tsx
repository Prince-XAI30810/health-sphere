import React, { useState, useRef, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Send,
  Bot,
  User,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Phone,
  Clock,
  Plus,
  MessageSquare,
  Mic,
  MicOff,
} from 'lucide-react';

interface Message {
  id: number;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  triageLevel?: 'high' | 'medium' | 'low';
  suggestions?: string[];
}

interface TriageSession {
  id: number;
  date: string;
  symptom: string;
  status: 'high' | 'medium' | 'low';
  messages: Message[];
}

const previousSessions: TriageSession[] = [
  {
    id: 1,
    date: 'Today, 10:30 AM',
    symptom: 'Severe Migraine',
    status: 'medium',
    messages: [
      {
        id: 1,
        type: 'bot',
        content: "Hello! I'm MediVerse's AI Health Assistant. I'm here to help assess your symptoms and guide you to the right care. Please describe what you're experiencing today.",
        timestamp: new Date('2026-01-11T10:30:00'),
      },
      {
        id: 2,
        type: 'user',
        content: "I've been having a severe migraine for the past 3 hours. The pain is throbbing and mostly on the right side of my head. I also feel nauseous and sensitive to light.",
        timestamp: new Date('2026-01-11T10:31:00'),
      },
      {
        id: 3,
        type: 'bot',
        content: "I understand you're experiencing flu-like symptoms. This is classified as MEDIUM PRIORITY. While not immediately urgent, I recommend consulting with a doctor within 24-48 hours.\n\nRecommended Specialist: Neurologist",
        timestamp: new Date('2026-01-11T10:31:30'),
        triageLevel: 'medium',
        suggestions: ['Book Telehealth', 'Schedule Appointment', 'View Home Remedies'],
      },
    ]
  },
  {
    id: 2,
    date: 'Jan 8, 2026',
    symptom: 'Mild Fever',
    status: 'low',
    messages: [
      {
        id: 1,
        type: 'bot',
        content: "Hello! I'm MediVerse's AI Health Assistant. I'm here to help assess your symptoms and guide you to the right care. Please describe what you're experiencing today.",
        timestamp: new Date('2026-01-08T14:00:00'),
      },
      {
        id: 2,
        type: 'user',
        content: "I have a mild fever of about 99.5°F. I also feel a bit tired but no other symptoms.",
        timestamp: new Date('2026-01-08T14:01:00'),
      },
      {
        id: 3,
        type: 'bot',
        content: "Thank you for sharing. Based on your description, this appears to be LOW PRIORITY. However, if symptoms persist or worsen, please consult a healthcare professional.\n\nRecommended: General check-up when convenient",
        timestamp: new Date('2026-01-08T14:01:30'),
        triageLevel: 'low',
        suggestions: ['Book Routine Checkup', 'View Self-Care Tips', 'Set Reminder'],
      },
    ]
  },
  {
    id: 3,
    date: 'Dec 25, 2025',
    symptom: 'Chest Pain',
    status: 'high',
    messages: [
      {
        id: 1,
        type: 'bot',
        content: "Hello! I'm MediVerse's AI Health Assistant. I'm here to help assess your symptoms and guide you to the right care. Please describe what you're experiencing today.",
        timestamp: new Date('2025-12-25T09:00:00'),
      },
      {
        id: 2,
        type: 'user',
        content: "I'm experiencing chest pain that started about 20 minutes ago. It feels tight and is radiating to my left arm. I'm also sweating and feel short of breath.",
        timestamp: new Date('2025-12-25T09:01:00'),
      },
      {
        id: 3,
        type: 'bot',
        content: "⚠️ Based on your symptoms, I'm detecting potential cardiac or respiratory concerns. This is classified as HIGH PRIORITY. I strongly recommend immediate medical attention.\n\nRecommended Specialist: Cardiologist or Emergency Care",
        timestamp: new Date('2025-12-25T09:01:30'),
        triageLevel: 'high',
        suggestions: ['Call Emergency (108)', 'Book Urgent Appointment', 'Find Nearest ER'],
      },
    ]
  },
];

const initialMessages: Message[] = [
  {
    id: 1,
    type: 'bot',
    content: "Hello! I'm MediVerse's AI Health Assistant. I'm here to help assess your symptoms and guide you to the right care. Please describe what you're experiencing today.",
    timestamp: new Date(),
  },
];

export const AITriage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const handleSessionClick = (session: TriageSession) => {
    setSelectedSession(session.id);
    setMessages(session.messages);
    setInput('');
  };

  const handleNewAssessment = () => {
    setSelectedSession(null);
    setMessages(initialMessages);
    setInput('');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize Speech Recognition
  useEffect(() => {
    // Check if browser supports Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInput(prev => prev + (prev ? ' ' : '') + transcript);
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'no-speech') {
          alert('No speech detected. Please try again.');
        } else if (event.error === 'not-allowed') {
          alert('Microphone permission denied. Please enable microphone access.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const simulateBotResponse = (userMessage: string) => {
    setIsTyping(true);

    setTimeout(() => {
      const lowerMessage = userMessage.toLowerCase();
      let response: Message;

      if (lowerMessage.includes('chest pain') || lowerMessage.includes('heart') || lowerMessage.includes('breathing')) {
        response = {
          id: messages.length + 2,
          type: 'bot',
          content: "⚠️ Based on your symptoms, I'm detecting potential cardiac or respiratory concerns. This is classified as HIGH PRIORITY. I strongly recommend immediate medical attention.\n\nRecommended Specialist: Cardiologist or Emergency Care",
          timestamp: new Date(),
          triageLevel: 'high',
          suggestions: ['Call Emergency (108)', 'Book Urgent Appointment', 'Find Nearest ER'],
        };
      } else if (lowerMessage.includes('fever') || lowerMessage.includes('headache') || lowerMessage.includes('cold')) {
        response = {
          id: messages.length + 2,
          type: 'bot',
          content: "I understand you're experiencing flu-like symptoms. This is classified as MEDIUM PRIORITY. While not immediately urgent, I recommend consulting with a doctor within 24-48 hours.\n\nRecommended Specialist: General Physician",
          timestamp: new Date(),
          triageLevel: 'medium',
          suggestions: ['Book Telehealth', 'Schedule Appointment', 'View Home Remedies'],
        };
      } else {
        response = {
          id: messages.length + 2,
          type: 'bot',
          content: "Thank you for sharing. Based on your description, this appears to be LOW PRIORITY. However, if symptoms persist or worsen, please consult a healthcare professional.\n\nRecommended: General check-up when convenient",
          timestamp: new Date(),
          triageLevel: 'low',
          suggestions: ['Book Routine Checkup', 'View Self-Care Tips', 'Set Reminder'],
        };
      }

      setMessages((prev) => [...prev, response]);
      setIsTyping(false);
    }, 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    simulateBotResponse(input);
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const getTriageIcon = (level?: 'high' | 'medium' | 'low') => {
    switch (level) {
      case 'high':
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      case 'medium':
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      case 'low':
        return <CheckCircle className="w-5 h-5 text-success" />;
      default:
        return null;
    }
  };

  const getTriageBadge = (level?: 'high' | 'medium' | 'low') => {
    switch (level) {
      case 'high':
        return <Badge variant="triage-high">HIGH PRIORITY</Badge>;
      case 'medium':
        return <Badge variant="triage-medium">MEDIUM PRIORITY</Badge>;
      case 'low':
        return <Badge variant="triage-low">LOW PRIORITY</Badge>;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout
      title="AI Symptom Checker"
      subtitle="Describe your symptoms for an AI-powered health assessment"
    >
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)]">
        {/* History Sidebar */}
        <div className="w-full lg:w-80 flex-shrink-0 space-y-4">
          <Button className="w-full" size="lg" onClick={handleNewAssessment}>
            <Plus className="w-4 h-4 mr-2" />
            New Assessment
          </Button>

          <div className="card-elevated p-4 h-[calc(100%-4rem)] overflow-y-auto">
            <h3 className="font-semibold text-muted-foreground text-sm mb-4 uppercase tracking-wider">Previous Sessions</h3>
            <div className="space-y-3">
              {previousSessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => handleSessionClick(session)}
                  className={`p-3 rounded-xl border transition-colors cursor-pointer group ${selectedSession === session.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-foreground text-sm truncate">{session.symptom}</span>
                    {getTriageIcon(session.status)}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {session.date}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 card-elevated overflow-hidden flex flex-col min-h-[500px]">
          {/* Chat Header */}
          <div className="bg-gradient-hero p-4 flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">MediVerse AI Assistant</h3>
              <p className="text-sm text-white/80">Powered by advanced health AI</p>
            </div>
            <Badge className="ml-auto bg-white/20 text-white border-0">Online</Badge>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-muted/20">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 animate-slide-up ${message.type === 'user' ? 'flex-row-reverse' : ''
                  }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${message.type === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                    }`}
                >
                  {message.type === 'user' ? (
                    <User className="w-5 h-5" />
                  ) : (
                    <Bot className="w-5 h-5" />
                  )}
                </div>
                <div
                  className={`max-w-[85%] lg:max-w-[75%] ${message.type === 'user' ? 'text-right' : ''
                    }`}
                >
                  <div
                    className={`inline-block p-4 rounded-2xl ${message.type === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-card border border-border rounded-bl-md shadow-sm'
                      }`}
                  >
                    {message.triageLevel && (
                      <div className="flex items-center gap-2 mb-3">
                        {getTriageIcon(message.triageLevel)}
                        {getTriageBadge(message.triageLevel)}
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-line text-left">{message.content}</p>
                    {message.suggestions && (
                      <div className="flex flex-wrap gap-2 mt-4 text-left">
                        {message.suggestions.map((suggestion, idx) => (
                          <Button
                            key={idx}
                            size="sm"
                            variant={idx === 0 && message.triageLevel === 'high' ? 'destructive' : 'outline'}
                            className="text-xs"
                          >
                            {idx === 0 && message.triageLevel === 'high' ? (
                              <Phone className="w-3 h-3 mr-1" />
                            ) : (
                              <Calendar className="w-3 h-3 mr-1" />
                            )}
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 px-1">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 animate-fade-in">
                <div className="w-9 h-9 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="bg-card border border-border rounded-2xl rounded-bl-md p-4 shadow-sm">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-typing" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-typing" style={{ animationDelay: '200ms' }}></span>
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-typing" style={{ animationDelay: '400ms' }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-card flex-shrink-0">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Describe your symptoms..."
                  className="h-12 pr-12"
                  disabled={isTyping || isListening}
                />
                {isSpeechSupported && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={isListening ? stopListening : startListening}
                    disabled={isTyping}
                  >
                    {isListening ? (
                      <div className="relative">
                        <Mic className="w-5 h-5 text-destructive animate-pulse" />
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full animate-ping"></span>
                      </div>
                    ) : (
                      <Mic className="w-5 h-5 text-muted-foreground hover:text-primary" />
                    )}
                  </Button>
                )}
              </div>
              <Button type="submit" size="lg" disabled={!input.trim() || isTyping || isListening}>
                <Send className="w-5 h-5" />
              </Button>
            </div>
            {isListening && (
              <div className="flex items-center gap-2 mt-2 text-sm text-destructive">
                <Mic className="w-4 h-4 animate-pulse" />
                <span>Listening... Speak now</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-2 text-center">
              ⚠️ This is an AI assessment tool. For emergencies, call 108 immediately.
              {isSpeechSupported && ' • Click the microphone icon to speak your symptoms'}
            </p>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AITriage;
