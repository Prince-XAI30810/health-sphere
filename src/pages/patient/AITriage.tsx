import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
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
  Trash2,
} from 'lucide-react';

interface Message {
  id: number;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  triageLevel?: 'high' | 'medium' | 'low';
  suggestions?: string[];
  recommendedDoctor?: Doctor;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  qualifications: string;
  experience: string;
  rating: number;
  available_slots: Array<{
    date: string;
    time: string;
    available: boolean;
  }>;
  phone: string;
  email: string;
}

interface TriageSession {
  session_id: string;
  created_at: string;
  status: string;
  symptom: string | null;
  triage_level: 'high' | 'medium' | 'low' | null;
  recommended_doctor: string | null;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

export const AITriage: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [previousSessions, setPreviousSessions] = useState<TriageSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; time: string; doctorId: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const loadPreviousSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/triage/sessions`);
      if (!response.ok) {
        throw new Error('Failed to load sessions');
      }
      const data = await response.json();
      setPreviousSessions(data.sessions || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
      setPreviousSessions([]);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const deleteSession = async (sessionIdToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering session click

    if (!confirm('Are you sure you want to delete this session?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/triage/session/${sessionIdToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete session');
      }

      // Remove from local state
      setPreviousSessions(prev => prev.filter(s => s.session_id !== sessionIdToDelete));

      // If deleted session was selected, clear selection
      if (selectedSession === sessionIdToDelete) {
        setSelectedSession(null);
        // Start a new session
        startNewSession();
      }

      toast.success('Session deleted successfully');
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error('Failed to delete session');
    }
  };

  const handleSessionClick = async (session: TriageSession) => {
    setSelectedSession(session.session_id);
    setSessionId(session.session_id);
    setInput('');
    setIsTyping(true); // Show loading state

    try {
      const response = await fetch(`${API_BASE_URL}/api/triage/conversation/${session.session_id}`);
      if (!response.ok) {
        throw new Error('Failed to load conversation');
      }
      const data = await response.json();

      console.log('Loaded conversation data:', data);

      // Check if messages exist
      if (!data.messages || data.messages.length === 0) {
        console.warn('No messages found in conversation');
        setMessages([]);
        setIsTyping(false);
        return;
      }

      // Convert backend messages to frontend format
      const convertedMessages: Message[] = data.messages.map((msg: any) => {
        const message: Message = {
          id: msg.id,
          type: msg.type === 'bot' ? 'bot' : 'user',
          content: msg.content || '',
          timestamp: new Date(msg.timestamp),
        };

        // Extract metadata
        if (msg.metadata) {
          const metadata = msg.metadata;
          const collectedInfo = metadata.collected_info || {};
          const painRating = collectedInfo.pain_rating;

          // Convert pain rating (1-10) to triage level
          if (painRating) {
            try {
              const rating = parseInt(painRating);
              if (rating <= 3) {
                message.triageLevel = 'low';
              } else if (rating <= 6) {
                message.triageLevel = 'medium';
              } else if (rating <= 8) {
                message.triageLevel = 'high';
              } else {
                message.triageLevel = 'high'; // 9-10 is critical/high
              }
            } catch (e) {
              // If not a number, try to infer from string
              const ratingStr = String(painRating).toLowerCase();
              if (ratingStr.includes('mild') || ratingStr.includes('low') || ['1', '2', '3'].some(n => ratingStr.includes(n))) {
                message.triageLevel = 'low';
              } else if (ratingStr.includes('moderate') || ratingStr.includes('medium') || ['4', '5', '6'].some(n => ratingStr.includes(n))) {
                message.triageLevel = 'medium';
              } else if (ratingStr.includes('severe') || ratingStr.includes('high') || ['7', '8', '9', '10'].some(n => ratingStr.includes(n))) {
                message.triageLevel = 'high';
              }
            }
          }

          if (metadata.recommended_doctor) {
            message.recommendedDoctor = metadata.recommended_doctor;
          }
        }

        return message;
      });

      console.log('Converted messages:', convertedMessages);

      // Ensure we have at least one message
      if (convertedMessages.length === 0) {
        console.warn('No messages to display after conversion');
        setMessages([]);
      } else {
        setMessages(convertedMessages);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast.error('Failed to load conversation', {
        description: error instanceof Error ? error.message : 'Please try again later',
      });
      // Don't clear messages on error - keep previous state or show empty state
      // Only clear if we're sure the session doesn't exist
      if (error instanceof Error && error.message.includes('404')) {
        setMessages([]);
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleNewAssessment = async () => {
    setSelectedSession(null);
    setInput('');
    await startNewSession();
    await loadPreviousSessions();
  };

  const startNewSession = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/triage/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error('Failed to start session');
      }

      const data = await response.json();
      setSessionId(data.session_id);

      const initialMessage: Message = {
        id: 1,
        type: 'bot',
        content: data.initial_message,
        timestamp: new Date(),
      };
      setMessages([initialMessage]);
    } catch (error) {
      console.error('Error starting session:', error);
      // Fallback message
      const fallbackMessage: Message = {
        id: 1,
        type: 'bot',
        content: "Hello! I'm MediVerse's AI Health Assistant. I'm here to help assess your symptoms and guide you to the right care. Please describe what you're experiencing today.",
        timestamp: new Date(),
      };
      setMessages([fallbackMessage]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize session on mount and load previous sessions
  useEffect(() => {
    if (!sessionId) {
      startNewSession();
    }
    loadPreviousSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const sendMessageToAPI = async (userMessage: string) => {
    if (!sessionId) {
      console.error('No session ID available');
      return;
    }

    setIsTyping(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/triage/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          message: userMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      const botResponse = data.response;

      // Determine triage level from pain rating
      let triageLevel: 'high' | 'medium' | 'low' | undefined;
      const painRating = data.collected_info?.pain_rating;
      if (painRating) {
        try {
          const rating = parseInt(painRating);
          if (rating <= 3) {
            triageLevel = 'low';
          } else if (rating <= 6) {
            triageLevel = 'medium';
          } else if (rating <= 8) {
            triageLevel = 'high';
          } else {
            triageLevel = 'high'; // 9-10 is critical/high
          }
        } catch (e) {
          // If not a number, try to infer from string
          const ratingStr = String(painRating).toLowerCase();
          if (ratingStr.includes('mild') || ratingStr.includes('low') || ['1', '2', '3'].some(n => ratingStr.includes(n))) {
            triageLevel = 'low';
          } else if (ratingStr.includes('moderate') || ratingStr.includes('medium') || ['4', '5', '6'].some(n => ratingStr.includes(n))) {
            triageLevel = 'medium';
          } else if (ratingStr.includes('severe') || ratingStr.includes('high') || ['7', '8', '9', '10'].some(n => ratingStr.includes(n))) {
            triageLevel = 'high';
          }
        }
      }

      const botMessage: Message = {
        id: messages.length + 2,
        type: 'bot',
        content: botResponse.message,
        timestamp: new Date(),
        triageLevel,
        recommendedDoctor: data.recommended_doctor || null,
      };

      console.log('Bot message with recommended doctor:', {
        hasDoctor: !!botMessage.recommendedDoctor,
        doctor: botMessage.recommendedDoctor,
        rawData: data.recommended_doctor
      });

      setMessages((prev) => [...prev, botMessage]);

      // Reload sessions to update the list
      await loadPreviousSessions();
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: messages.length + 2,
        type: 'bot',
        content: "I apologize, but I'm having trouble processing your message. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !sessionId) return;

    const userMessage: Message = {
      id: messages.length + 1,
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    await sendMessageToAPI(currentInput);
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
      title="AI Triage"
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
            {isLoadingSessions ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : previousSessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No previous sessions
              </div>
            ) : (
              <div className="space-y-3">
                {previousSessions.map((session) => {
                  const sessionDate = new Date(session.created_at);
                  const formattedDate = sessionDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: sessionDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
                  });
                  const formattedTime = sessionDate.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  const isToday = sessionDate.toDateString() === new Date().toDateString();
                  const displayDate = isToday ? `Today, ${formattedTime}` : `${formattedDate}, ${formattedTime}`;

                  return (
                    <div
                      key={session.session_id}
                      onClick={() => handleSessionClick(session)}
                      className={`p-3 rounded-xl border transition-colors cursor-pointer group ${selectedSession === session.session_id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                        }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-foreground text-sm truncate flex-1">
                          {session.symptom || 'No symptom recorded'}
                        </span>
                        <div className="flex items-center gap-1">
                          {session.triage_level && getTriageIcon(session.triage_level)}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                            onClick={(e) => deleteSession(session.session_id, e)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {displayDate}
                      </div>
                      {session.recommended_doctor && (
                        <div className="text-xs text-muted-foreground mt-1 truncate">
                          {session.recommended_doctor}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
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
            {messages.length === 0 && !isTyping ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                <p className="text-muted-foreground">No messages in this conversation</p>
              </div>
            ) : (
              <>
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
                        {message.type === 'bot' ? (
                          <div className="text-sm prose prose-sm max-w-none dark:prose-invert prose-headings:font-semibold prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-strong:font-semibold prose-strong:text-foreground">
                            <ReactMarkdown
                              components={{
                                p: ({ children }) => <p className="mb-2 last:mb-0 text-foreground">{children}</p>,
                                strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                                ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1 text-foreground">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1 text-foreground">{children}</ol>,
                                li: ({ children }) => <li className="text-foreground">{children}</li>,
                                h1: ({ children }) => <h1 className="text-lg font-semibold mb-2 text-foreground">{children}</h1>,
                                h2: ({ children }) => <h2 className="text-base font-semibold mb-2 text-foreground">{children}</h2>,
                                h3: ({ children }) => <h3 className="text-sm font-semibold mb-2 text-foreground">{children}</h3>,
                                code: ({ children }) => <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono text-foreground">{children}</code>,
                                pre: ({ children }) => <pre className="bg-muted p-2 rounded text-xs overflow-x-auto mb-2">{children}</pre>,
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <p className="text-sm whitespace-pre-line text-left">{message.content}</p>
                        )}
                        {message.recommendedDoctor && (
                          <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
                            <h4 className="font-semibold text-sm mb-3 text-foreground">Recommended Doctor</h4>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="font-medium">{message.recommendedDoctor.name}</span>
                                <span className="text-muted-foreground ml-2">({message.recommendedDoctor.specialty})</span>
                              </div>
                              <div className="text-muted-foreground">
                                {message.recommendedDoctor.qualifications}
                              </div>
                              <div className="text-muted-foreground">
                                Experience: {message.recommendedDoctor.experience} • Rating: {message.recommendedDoctor.rating}/5.0
                              </div>
                              <div className="mt-3">
                                <p className="font-medium text-xs mb-2 text-foreground">Available Slots:</p>
                                <div className="flex flex-wrap gap-2">
                                  {message.recommendedDoctor.available_slots
                                    .filter(slot => slot.available)
                                    .slice(0, 3)
                                    .map((slot, idx) => {
                                      const isSelected = selectedSlot?.date === slot.date &&
                                        selectedSlot?.time === slot.time &&
                                        selectedSlot?.doctorId === message.recommendedDoctor.id;
                                      return (
                                        <Button
                                          key={idx}
                                          type="button"
                                          size="sm"
                                          variant={isSelected ? "default" : "outline"}
                                          className={`text-xs ${isSelected ? 'bg-primary text-primary-foreground' : ''}`}
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();

                                            if (!message.recommendedDoctor || !user) {
                                              toast.error('Please login to schedule an appointment');
                                              return;
                                            }

                                            // Select the slot
                                            setSelectedSlot({
                                              date: slot.date,
                                              time: slot.time,
                                              doctorId: message.recommendedDoctor.id
                                            });
                                            setSelectedDoctor(message.recommendedDoctor);
                                          }}
                                        >
                                          <Calendar className="w-3 h-3 mr-1" />
                                          {slot.date} {slot.time}
                                        </Button>
                                      );
                                    })}
                                </div>
                                {selectedSlot && selectedSlot.doctorId === message.recommendedDoctor.id && (
                                  <div className="mt-2 p-2 bg-primary/10 rounded-lg border border-primary/20">
                                    <p className="text-xs font-medium text-primary">
                                      ✓ Selected: {selectedSlot.date} at {selectedSlot.time}
                                    </p>
                                  </div>
                                )}
                              </div>
                              <Button
                                type="button"
                                className="w-full mt-3 cursor-pointer"
                                size="sm"
                                disabled={!message.recommendedDoctor || !user || !selectedSlot || selectedSlot.doctorId !== message.recommendedDoctor.id}
                                onClick={async (e) => {
                                  e.preventDefault();
                                  e.stopPropagation();

                                  if (!message.recommendedDoctor) {
                                    toast.error('Doctor information not available');
                                    return;
                                  }

                                  if (!user) {
                                    toast.error('Please login to schedule an appointment');
                                    return;
                                  }

                                  if (!selectedSlot || selectedSlot.doctorId !== message.recommendedDoctor.id) {
                                    toast.error('Please select a time slot first');
                                    return;
                                  }

                                  try {
                                    // Get collected info from conversation for better symptom extraction
                                    let symptoms = '';
                                    let painRating = null;
                                    try {
                                      const conversation = await fetch(`${API_BASE_URL}/api/triage/conversation/${sessionId}`).then(r => r.json());
                                      const collectedInfo = conversation.collected_info || {};
                                      symptoms = collectedInfo.issue || messages.find(m => m.type === 'user')?.content || '';
                                      painRating = collectedInfo.pain_rating || null;
                                    } catch (e) {
                                      symptoms = messages.find(m => m.type === 'user')?.content || '';
                                    }

                                    const requestBody = {
                                      patient_id: user.id || '',
                                      patient_name: user.name || '',
                                      patient_email: user.email || '',
                                      doctor_id: message.recommendedDoctor.id || '',
                                      doctor_name: message.recommendedDoctor.name || '',
                                      appointment_date: selectedSlot.date || '',
                                      appointment_time: selectedSlot.time || '',
                                      reason: 'Appointment notes will be generated automatically', // Backend will generate proper notes
                                      triage_session_id: sessionId || null,
                                      symptoms: symptoms || null,
                                      pain_rating: painRating !== null && painRating !== undefined ? String(painRating) : null,
                                    };

                                    console.log('Scheduling appointment with:', requestBody);

                                    const response = await fetch(`${API_BASE_URL}/api/appointments/schedule`, {
                                      method: 'POST',
                                      headers: {
                                        'Content-Type': 'application/json',
                                      },
                                      body: JSON.stringify(requestBody),
                                    });

                                    if (!response.ok) {
                                      let errorMessage = 'Failed to schedule appointment';
                                      try {
                                        const errorData = await response.json();
                                        // Handle different error response formats
                                        if (errorData.detail) {
                                          errorMessage = typeof errorData.detail === 'string'
                                            ? errorData.detail
                                            : JSON.stringify(errorData.detail);
                                        } else if (errorData.message) {
                                          errorMessage = typeof errorData.message === 'string'
                                            ? errorData.message
                                            : JSON.stringify(errorData.message);
                                        } else if (typeof errorData === 'string') {
                                          errorMessage = errorData;
                                        } else {
                                          errorMessage = JSON.stringify(errorData);
                                        }
                                      } catch (parseError) {
                                        // If response is not JSON, try to get text
                                        try {
                                          const text = await response.text();
                                          errorMessage = text || `HTTP ${response.status}: ${response.statusText}`;
                                        } catch (textError) {
                                          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                                        }
                                      }
                                      throw new Error(errorMessage);
                                    }

                                    const data = await response.json();
                                    toast.success('Appointment scheduled successfully!', {
                                      description: `Appointment with ${message.recommendedDoctor.name} on ${selectedSlot.date} at ${selectedSlot.time}`,
                                    });

                                    // Clear selected slot and doctor
                                    setSelectedSlot(null);
                                    setSelectedDoctor(null);

                                    // Optionally refresh or update UI
                                    console.log('Appointment scheduled:', data);
                                  } catch (error) {
                                    console.error('Error scheduling appointment:', error);
                                    let errorMessage = 'Failed to schedule appointment';
                                    if (error instanceof Error) {
                                      errorMessage = error.message;
                                    } else if (typeof error === 'string') {
                                      errorMessage = error;
                                    } else {
                                      errorMessage = JSON.stringify(error);
                                    }
                                    toast.error('Failed to schedule appointment', {
                                      description: errorMessage,
                                    });
                                  }
                                }}
                              >
                                <Calendar className="w-4 h-4 mr-2" />
                                Schedule Appointment
                              </Button>
                            </div>
                          </div>
                        )}
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
              </>
            )}

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

      {/* Appointment Scheduling Dialog */}
      <Dialog open={isAppointmentDialogOpen} onOpenChange={setIsAppointmentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Appointment</DialogTitle>
            <DialogDescription>
              Please review your appointment details before confirming
            </DialogDescription>
          </DialogHeader>

          {selectedDoctor && selectedSlot && user && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Doctor:</span>
                  <span className="text-sm font-medium">{selectedDoctor.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Specialty:</span>
                  <span className="text-sm font-medium">{selectedDoctor.specialty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Date:</span>
                  <span className="text-sm font-medium">{selectedSlot.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Time:</span>
                  <span className="text-sm font-medium">{selectedSlot.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Patient:</span>
                  <span className="text-sm font-medium">{user.name}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAppointmentDialogOpen(false);
                setSelectedSlot(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!selectedDoctor || !selectedSlot || !user || !sessionId) {
                  toast.error('Missing information. Please try again.');
                  return;
                }

                try {
                  // Get collected info from current session
                  const conversation = await fetch(`${API_BASE_URL}/api/triage/conversation/${sessionId}`).then(r => r.json());
                  const collectedInfo = conversation.collected_info || {};

                  const requestBody = {
                    patient_id: user.id || '',
                    patient_name: user.name || '',
                    patient_email: user.email || '',
                    doctor_id: selectedDoctor.id || '',
                    doctor_name: selectedDoctor.name || '',
                    appointment_date: selectedSlot.date || '',
                    appointment_time: selectedSlot.time || '',
                    reason: 'Appointment notes will be generated automatically', // Backend will generate proper notes
                    triage_session_id: sessionId || null,
                    symptoms: collectedInfo.issue || messages.find(m => m.type === 'user')?.content || null,
                    pain_rating: collectedInfo.pain_rating !== null && collectedInfo.pain_rating !== undefined ? String(collectedInfo.pain_rating) : null,
                  };

                  console.log('Scheduling appointment with:', requestBody);

                  const response = await fetch(`${API_BASE_URL}/api/appointments/schedule`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody),
                  });

                  if (!response.ok) {
                    let errorMessage = 'Failed to schedule appointment';
                    try {
                      const errorData = await response.json();
                      // Handle FastAPI validation errors (422)
                      if (Array.isArray(errorData.detail)) {
                        // Validation errors are in array format
                        const errors = errorData.detail.map((err: any) => {
                          const field = err.loc ? err.loc.join('.') : 'field';
                          return `${field}: ${err.msg || 'validation error'}`;
                        });
                        errorMessage = errors.join(', ');
                      } else if (errorData.detail) {
                        errorMessage = typeof errorData.detail === 'string'
                          ? errorData.detail
                          : JSON.stringify(errorData.detail);
                      } else if (errorData.message) {
                        errorMessage = typeof errorData.message === 'string'
                          ? errorData.message
                          : JSON.stringify(errorData.message);
                      } else {
                        errorMessage = JSON.stringify(errorData);
                      }
                    } catch (parseError) {
                      // If response is not JSON, try to get text
                      try {
                        const text = await response.text();
                        errorMessage = text || `HTTP ${response.status}: ${response.statusText}`;
                      } catch (textError) {
                        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                      }
                    }
                    throw new Error(errorMessage);
                  }

                  const data = await response.json();
                  toast.success('Appointment scheduled successfully!', {
                    description: `Appointment with ${selectedDoctor.name} on ${selectedSlot.date} at ${selectedSlot.time}`,
                  });

                  setIsAppointmentDialogOpen(false);
                  setSelectedSlot(null);
                  setSelectedDoctor(null);

                  console.log('Appointment scheduled:', data);
                } catch (error) {
                  console.error('Error scheduling appointment:', error);
                  let errorMessage = 'Failed to schedule appointment';
                  if (error instanceof Error) {
                    errorMessage = error.message;
                  } else if (typeof error === 'string') {
                    errorMessage = error;
                  } else {
                    errorMessage = JSON.stringify(error);
                  }
                  toast.error('Failed to schedule appointment', {
                    description: errorMessage,
                  });
                }
              }}
            >
              Confirm Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AITriage;
