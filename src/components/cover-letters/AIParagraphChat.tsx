import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { 
  Send, 
  X, 
  Copy, 
  Check, 
  Sparkles, 
  RefreshCw,
  MessageSquare,
  User,
  Bot,
  ThumbsUp,
  ThumbsDown,
  RotateCcw
} from 'lucide-react';
import { coverLetterService } from '../../services/coverLetterService';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isParagraph?: boolean;
  paragraphContent?: string;
}

interface AIParagraphChatProps {
  paragraphType: string;
  currentContent: string;
  onContentUpdate: (content: string) => void;
  jobTitle: string;
  companyName: string;
  onClose: () => void;
}

const paragraphPrompts = {
  introduction: [
    "Make it more professional and formal",
    "Add enthusiasm and passion",
    "Emphasize my relevant experience",
    "Make it more concise and direct",
    "Add specific details about the role"
  ],
  experience: [
    "Add quantifiable achievements",
    "Emphasize leadership skills",
    "Highlight technical expertise",
    "Make it more results-focused",
    "Add specific project examples"
  ],
  companyFit: [
    "Show more company research",
    "Emphasize cultural alignment",
    "Add specific company values",
    "Make it more personal",
    "Highlight shared mission"
  ],
  closing: [
    "Make it more confident",
    "Add a strong call to action",
    "Emphasize enthusiasm",
    "Make it more professional",
    "Add availability for interview"
  ]
};

const paragraphGuidance = {
  introduction: "Start by expressing your interest in the position and briefly mention how you found the job posting. Show enthusiasm and confidence in your ability to contribute.",
  experience: "Highlight your most relevant experience and achievements. Use specific examples and quantifiable results when possible. Connect your skills to the job requirements.",
  companyFit: "Demonstrate your knowledge of the company and explain why you're excited to work there. Show how your values align with the company culture and mission.",
  closing: "End with a strong call to action, expressing your eagerness for an interview. Thank the reader for their time and consideration."
};

export const AIParagraphChat: React.FC<AIParagraphChatProps> = ({
  paragraphType,
  currentContent,
  onContentUpdate,
  jobTitle,
  companyName,
  onClose
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      type: 'ai',
      content: `I'm here to help you write your ${paragraphType} paragraph for the ${jobTitle} position at ${companyName}. You can ask me to write from scratch, refine your current content, or make specific improvements.`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, [paragraphType, jobTitle, companyName]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await coverLetterService.sendAIChatMessage({
        paragraphType,
        message,
        conversationHistory: messages,
        context: {
          jobTitle,
          companyName,
          currentContent,
          paragraphGuidance: paragraphGuidance[paragraphType as keyof typeof paragraphGuidance]
        }
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response.message,
        timestamp: new Date(),
        isParagraph: response.isParagraph,
        paragraphContent: response.paragraphContent
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInputMessage(prompt);
    sendMessage(prompt);
  };

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const useParagraph = (paragraphContent: string) => {
    onContentUpdate(paragraphContent);
    onClose();
  };

  const startFromScratch = () => {
    sendMessage("Please write a new paragraph from scratch for this section.");
  };

  const refineCurrent = () => {
    if (currentContent.trim()) {
      sendMessage(`Please help me improve this paragraph: "${currentContent}"`);
    } else {
      sendMessage("I don't have any current content to refine. Please write a new paragraph from scratch.");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputMessage);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                AI Assistant - {paragraphType.charAt(0).toUpperCase() + paragraphType.slice(1)} Paragraph
              </h2>
              <p className="text-sm text-gray-500">
                {jobTitle} at {companyName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center space-x-3">
            <Button
              onClick={startFromScratch}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Start from Scratch</span>
            </Button>
            <Button
              onClick={refineCurrent}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refine Current</span>
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    <div className="flex-shrink-0">
                      {message.type === 'user' ? (
                        <User className="w-4 h-4 mt-0.5" />
                      ) : (
                        <Bot className="w-4 h-4 mt-0.5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      
                      {message.isParagraph && message.paragraphContent && (
                        <div className="mt-3 p-3 bg-white bg-opacity-20 rounded border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium opacity-75">Generated Paragraph:</span>
                            <div className="flex items-center space-x-2">
                              <Button
                                onClick={() => copyToClipboard(message.paragraphContent!, message.id)}
                                size="sm"
                                variant="outline"
                                className="text-xs"
                              >
                                {copiedMessageId === message.id ? (
                                  <Check className="w-3 h-3" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </Button>
                              <Button
                                onClick={() => useParagraph(message.paragraphContent!)}
                                size="sm"
                                className="text-xs bg-green-600 hover:bg-green-700"
                              >
                                Use This
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm opacity-90">{message.paragraphContent}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3 flex items-center space-x-2">
                <Bot className="w-4 h-4 text-gray-500" />
                <LoadingSpinner size="sm" />
                <span className="text-sm text-gray-500">AI is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        <div className="p-4 border-t bg-gray-50">
          <div className="mb-3">
            <span className="text-sm font-medium text-gray-700">Quick prompts:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {paragraphPrompts[paragraphType as keyof typeof paragraphPrompts]?.map((prompt, index) => (
              <Button
                key={index}
                onClick={() => handleQuickPrompt(prompt)}
                variant="outline"
                size="sm"
                className="text-xs"
                disabled={isLoading}
              >
                {prompt}
              </Button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex items-center space-x-3">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message or instruction..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <Button
              onClick={() => sendMessage(inputMessage)}
              disabled={!inputMessage.trim() || isLoading}
              className="flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
