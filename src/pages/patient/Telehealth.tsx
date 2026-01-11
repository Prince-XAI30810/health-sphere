import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  MessageSquare,
  Maximize2,
  Settings,
  Send,
  User,
  Clock,
} from 'lucide-react';

interface ChatMessage {
  id: number;
  sender: 'patient' | 'doctor';
  content: string;
  time: string;
}

interface TelehealthState {
  doctorName?: string;
  specialty?: string;
  appointmentDate?: string;
  appointmentTime?: string;
}

export const Telehealth: React.FC = () => {
  const location = useLocation();
  const state = location.state as TelehealthState | null;

  // Get doctor info from navigation state or use defaults
  const doctorName = state?.doctorName || 'Dr. Priya Patel';
  const specialty = state?.specialty || 'General Physician';
  const appointmentTime = state?.appointmentTime || '3:00 PM';

  // Generate initials from doctor name
  const doctorInitials = doctorName
    .split(' ')
    .filter(word => word.length > 0 && word !== 'Dr.')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'DR';

  const mockMessages: ChatMessage[] = [
    { id: 1, sender: 'doctor', content: 'Hello Rahul, how are you feeling today?', time: '3:01 PM' },
    { id: 2, sender: 'patient', content: 'Hi Doctor, I have been experiencing mild headaches for the past 2 days.', time: '3:02 PM' },
    { id: 3, sender: 'doctor', content: 'I see. Have you been taking any medication for it?', time: '3:02 PM' },
  ];

  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isInCall, setIsInCall] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: messages.length + 1,
      sender: 'patient',
      content: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([...messages, message]);
    setNewMessage('');
  };

  return (
    <DashboardLayout
      title="Telehealth Consultation"
      subtitle="Connect with your healthcare provider remotely"
    >
      {!isInCall ? (
        /* Waiting Room */
        <div className="max-w-2xl mx-auto">
          <div className="card-elevated p-8 text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-hero mx-auto flex items-center justify-center mb-6 animate-pulse-ring">
              <Video className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Ready to Join?</h2>
            <p className="text-muted-foreground mb-6">
              Your consultation with {doctorName} is scheduled for today at {appointmentTime}
            </p>

            <div className="bg-muted/50 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xl font-bold">
                  {doctorInitials}
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground">{doctorName}</h3>
                  <p className="text-sm text-muted-foreground">{specialty}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="w-2 h-2 bg-success rounded-full"></span>
                    <span className="text-xs text-success">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Expected duration: 15-20 minutes</span>
              </div>
            </div>

            {/* Device Check */}
            <div className="flex justify-center gap-4 mb-6">
              <Button
                variant={isVideoOn ? 'default' : 'outline'}
                size="lg"
                onClick={() => setIsVideoOn(!isVideoOn)}
              >
                {isVideoOn ? <Video className="w-5 h-5 mr-2" /> : <VideoOff className="w-5 h-5 mr-2" />}
                Camera {isVideoOn ? 'On' : 'Off'}
              </Button>
              <Button
                variant={isMicOn ? 'default' : 'outline'}
                size="lg"
                onClick={() => setIsMicOn(!isMicOn)}
              >
                {isMicOn ? <Mic className="w-5 h-5 mr-2" /> : <MicOff className="w-5 h-5 mr-2" />}
                Mic {isMicOn ? 'On' : 'Off'}
              </Button>
            </div>

            <Button variant="hero" size="xl" onClick={() => setIsInCall(true)}>
              <Video className="w-5 h-5 mr-2" />
              Join Consultation
            </Button>
          </div>
        </div>
      ) : (
        /* Video Call Interface */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          {/* Main Video Area */}
          <div className="lg:col-span-3 flex flex-col">
            <div className="flex-1 bg-foreground rounded-2xl relative overflow-hidden">
              {/* Doctor's Video (Main) */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-32 h-32 rounded-full bg-secondary/80 mx-auto flex items-center justify-center text-4xl font-bold mb-4">
                    {doctorInitials}
                  </div>
                  <h3 className="text-xl font-semibold">{doctorName}</h3>
                  <p className="text-white/70">{specialty}</p>
                </div>
              </div>

              {/* Patient's Video (PiP) */}
              <div className="absolute bottom-4 right-4 w-48 h-36 bg-muted rounded-xl overflow-hidden shadow-xl border-2 border-background">
                <div className="w-full h-full flex items-center justify-center bg-primary/20">
                  {isVideoOn ? (
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-primary mx-auto flex items-center justify-center text-white text-lg font-bold">
                        RS
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">You</p>
                    </div>
                  ) : (
                    <VideoOff className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Call Duration */}
              <div className="absolute top-4 left-4">
                <Badge className="bg-background/80 text-foreground backdrop-blur-sm">
                  <span className="w-2 h-2 bg-destructive rounded-full mr-2 animate-pulse"></span>
                  05:23
                </Badge>
              </div>

              {/* Fullscreen */}
              <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white hover:bg-white/20">
                <Maximize2 className="w-5 h-5" />
              </Button>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 py-4">
              <Button
                variant={isMicOn ? 'outline' : 'destructive'}
                size="icon-lg"
                onClick={() => setIsMicOn(!isMicOn)}
              >
                {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
              </Button>
              <Button
                variant={isVideoOn ? 'outline' : 'destructive'}
                size="icon-lg"
                onClick={() => setIsVideoOn(!isVideoOn)}
              >
                {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
              </Button>
              <Button
                variant="destructive"
                size="lg"
                onClick={() => setIsInCall(false)}
                className="px-8"
              >
                <Phone className="w-5 h-5 mr-2 rotate-[135deg]" />
                End Call
              </Button>
              <Button variant="outline" size="icon-lg">
                <Settings className="w-6 h-6" />
              </Button>
            </div>
          </div>

          {/* Chat Sidebar */}
          <div className="card-elevated flex flex-col">
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Chat</h3>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${msg.sender === 'patient' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${msg.sender === 'doctor' ? 'bg-secondary text-secondary-foreground' : 'bg-primary text-primary-foreground'
                    }`}>
                    {msg.sender === 'doctor' ? doctorInitials : 'RS'}
                  </div>
                  <div className={`max-w-[80%] ${msg.sender === 'patient' ? 'text-right' : ''}`}>
                    <div className={`inline-block p-3 rounded-xl text-sm ${msg.sender === 'patient'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-muted rounded-bl-md'
                      }`}>
                      {msg.content}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Telehealth;
