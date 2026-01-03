import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

const GEMINI_API_KEY = 'AIzaSyBz47fj8UNyenSz9Zvq9YRXCBa5_LJyt74';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const SYSTEM_CONTEXT = `You are a helpful assistant for Barkatullah University's Academic Credential Verification Portal. 
This portal allows:
- Students to view their academic records, manage access permissions, and raise data concerns
- Employers to search and verify student credentials (with student consent)
- The University (Institute) to manage student records, grant access, and view logs

Key pages/features:
- Home Page: Public search to verify credentials by enrollment number
- Student Portal: My Profile, My Grants (manage who can access records), Raise Concerns, Help Requests
- Employer Portal: Search students, Request Verification, View Requests status, Help section
- University/Institute Portal: Dashboard with stats, Student Registry, Manage Records, Grant Access, Access Logs, Student Concerns

Answer user questions about navigating the site, understanding features, or general queries about the verification process.
Keep responses concise and helpful. If you don't know something specific, guide them to contact support.

IMPORTANT FORMATTING RULES:
1. Do NOT use markdown symbols like asterisks (*) or hashtags (#)
2. Use line breaks to separate different points or sections
3. Number your points when listing multiple items (1. 2. 3.)
4. Keep each point on a new line for readability
5. Write in clear, simple English`;

export function FloatingChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hello! I\'m your BU Verification Portal assistant. How can I help you today?' }
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

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            // Build the full prompt with context
            const fullPrompt = `${SYSTEM_CONTEXT}

User question: ${userMessage}

Please provide a helpful, concise response:`;

            const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [{ text: fullPrompt }]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 512,
                    }
                }),
            });

            const data = await response.json();

            console.log('API Response:', data); // Debug log

            if (!response.ok) {
                console.error('Gemini API Error:', data);
                throw new Error(data.error?.message || 'API request failed');
            }

            const assistantMessage = data.candidates?.[0]?.content?.parts?.[0]?.text ||
                'I apologize, but I encountered an issue. Please try again.';

            setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
        } catch (error) {
            console.error('Chatbot error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'I\'m having trouble connecting right now. Please try again in a moment or contact support.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            {/* Floating Chat Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 ${isOpen
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                    }`}
                aria-label={isOpen ? 'Close chat' : 'Open chat'}
            >
                {isOpen ? (
                    <X className="w-6 h-6 text-white" />
                ) : (
                    <MessageCircle className="w-6 h-6 text-white" />
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <Card className="fixed bottom-24 right-6 z-50 w-[380px] h-[500px] flex flex-col shadow-2xl border border-slate-200 rounded-2xl overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                            <Bot className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold">BU Assistant</h3>
                            <p className="text-xs text-blue-100">Verification Portal Help</p>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                {message.role === 'assistant' && (
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                        <Bot className="w-4 h-4 text-blue-600" />
                                    </div>
                                )}
                                <div
                                    className={`max-w-[75%] p-3 rounded-2xl text-sm whitespace-pre-line ${message.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-br-md'
                                        : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-bl-md'
                                        }`}
                                >
                                    {message.content}
                                </div>
                                {message.role === 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                                        <User className="w-4 h-4 text-slate-600" />
                                    </div>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-2 justify-start">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                    <Bot className="w-4 h-4 text-blue-600" />
                                </div>
                                <div className="bg-white p-3 rounded-2xl rounded-bl-md shadow-sm border border-slate-100">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 bg-white border-t border-slate-200">
                        <div className="flex gap-2">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask me anything..."
                                className="flex-1 rounded-full border-slate-200 focus-visible:ring-blue-500"
                                disabled={isLoading}
                            />
                            <Button
                                onClick={sendMessage}
                                disabled={!input.trim() || isLoading}
                                size="icon"
                                className="rounded-full bg-blue-600 hover:bg-blue-700 w-10 h-10"
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </Card>
            )}
        </>
    );
}
