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
} from 'lucide-react';

interface Message {
  id: number;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  triageLevel?: 'high' | 'medium' | 'low';
  suggestions?: string[];
}

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      <div className="max-w-4xl mx-auto">
        <div className="card-elevated overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-hero p-4 flex items-center gap-3">
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
          <div className="h-[500px] overflow-y-auto p-6 space-y-6 custom-scrollbar bg-muted/20">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 animate-slide-up ${
                  message.type === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.type === 'user'
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
                  className={`max-w-[75%] ${
                    message.type === 'user' ? 'text-right' : ''
                  }`}
                >
                  <div
                    className={`inline-block p-4 rounded-2xl ${
                      message.type === 'user'
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
                    <p className="text-sm whitespace-pre-line">{message.content}</p>
                    {message.suggestions && (
                      <div className="flex flex-wrap gap-2 mt-4">
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
          <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-card">
            <div className="flex gap-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe your symptoms..."
                className="flex-1 h-12"
                disabled={isTyping}
              />
              <Button type="submit" size="lg" disabled={!input.trim() || isTyping}>
                <Send className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              ⚠️ This is an AI assessment tool. For emergencies, call 108 immediately.
            </p>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AITriage;
