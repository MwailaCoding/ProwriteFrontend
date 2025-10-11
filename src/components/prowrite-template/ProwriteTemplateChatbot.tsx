import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Bot, User, Sparkles, X, Loader2, CheckCircle, AlertCircle, Wand2 } from 'lucide-react';
import ProwriteTemplateGuidedWizard from './ProwriteTemplateGuidedWizard';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  suggestions?: string[];
  dataExtracted?: Record<string, any>;
}

interface ConversationState {
  stage: 'greeting' | 'profession' | 'education' | 'experience' | 'skills' | 'achievements' | 'summary' | 'complete';
  profession?: string;
  education?: any;
  experience?: any[];
  skills?: string[];
  achievements?: string[];
  summary?: string;
}

interface ProwriteTemplateChatbotProps {
  onAutoFill: (fieldData: Record<string, any>) => void;
  onClose: () => void;
  isOpen: boolean;
}

const ProwriteTemplateChatbot: React.FC<ProwriteTemplateChatbotProps> = ({
  onAutoFill,
  onClose,
  isOpen
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your AI assistant for building a professional ProwriteTemplate resume. I can guide you through creating an impressive resume in two ways: through a structured step-by-step wizard or through a conversational chat. Which would you prefer?",
      sender: 'ai',
      timestamp: new Date(),
      suggestions: [
        "Start guided wizard",
        "Chat with me",
        "Tell me more about both options"
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [showGuidedWizard, setShowGuidedWizard] = useState(false);
  const [sessionId] = useState(`session_${Date.now()}`);
  const [conversationState, setConversationState] = useState<ConversationState>({ stage: 'greeting' });
  const [extractedData, setExtractedData] = useState<Record<string, any>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getNextQuestion = (stage: string, userInput: string): { text: string; suggestions: string[] } => {
    const input = userInput.toLowerCase();
    
    switch (stage) {
      case 'greeting':
        return {
          text: "Great! Let's start with your profession. What field do you work in or want to work in?",
          suggestions: [
            "Software Engineer",
            "Marketing Manager", 
            "Sales Professional",
            "Healthcare Professional",
            "Finance Professional",
            "Other"
          ]
        };
      
      case 'profession':
        return {
          text: "Perfect! Now let's talk about your education. What's your highest degree and where did you study?",
          suggestions: [
            "Bachelor's degree in Computer Science",
            "Master's degree in Business Administration",
            "High school diploma",
            "Associate's degree",
            "PhD in Engineering"
          ]
        };
      
      case 'education':
        return {
          text: "Excellent! Now tell me about your work experience. What positions have you held and what companies did you work for?",
          suggestions: [
            "Software Engineer at Google for 3 years",
            "Marketing Manager at a startup",
            "Sales Representative at various companies",
            "Recent graduate, no work experience yet"
          ]
        };
      
      case 'experience':
        return {
          text: "Great! What are your key skills and technical abilities?",
          suggestions: [
            "JavaScript, React, Node.js",
            "Digital marketing, SEO, social media",
            "Sales, customer relationship management",
            "Data analysis, Excel, SQL"
          ]
        };
      
      case 'skills':
        return {
          text: "Impressive! What are your biggest achievements or accomplishments in your career?",
          suggestions: [
            "Led a team of 5 developers",
            "Increased sales by 25%",
            "Managed $1M marketing budget",
            "Graduated with honors"
          ]
        };
      
      case 'achievements':
        return {
          text: "Perfect! Finally, let me create a professional summary for you. Is there anything specific you'd like me to emphasize?",
          suggestions: [
            "Focus on leadership experience",
            "Highlight technical skills",
            "Emphasize results and metrics",
            "Include career goals"
          ]
        };
      
      case 'summary':
        return {
          text: "Excellent! I have all the information I need. Let me create your resume now. Would you like me to auto-fill the form with all this information?",
          suggestions: [
            "Yes, please auto-fill my resume",
            "Let me review the information first",
            "Start over with different information"
          ]
        };
      
      default:
        return {
          text: "I'm ready to help you with anything else!",
          suggestions: []
        };
    }
  };

  const extractDataFromInput = (input: string, stage: string): Record<string, any> => {
    const data: Record<string, any> = {};
    const text = input.toLowerCase();

    switch (stage) {
      case 'profession':
        if (text.includes('software') || text.includes('engineer') || text.includes('developer')) {
          data.profession = 'software_engineer';
        } else if (text.includes('marketing')) {
          data.profession = 'marketing_manager';
        } else if (text.includes('sales')) {
          data.profession = 'sales_professional';
        } else if (text.includes('health') || text.includes('medical') || text.includes('nurse')) {
          data.profession = 'healthcare_professional';
        } else if (text.includes('finance') || text.includes('accounting') || text.includes('banking')) {
          data.profession = 'finance_professional';
        }
        break;

      case 'education':
        // Extract degree
        if (text.includes('bachelor')) {
          data.degree = 'Bachelor\'s Degree';
        } else if (text.includes('master')) {
          data.degree = 'Master\'s Degree';
        } else if (text.includes('phd') || text.includes('doctorate')) {
          data.degree = 'PhD';
        } else if (text.includes('associate')) {
          data.degree = 'Associate\'s Degree';
        } else if (text.includes('high school')) {
          data.degree = 'High School Diploma';
        }

        // Extract field of study
        if (text.includes('computer science') || text.includes('cs')) {
          data.field = 'Computer Science';
        } else if (text.includes('business') || text.includes('mba')) {
          data.field = 'Business Administration';
        } else if (text.includes('engineering')) {
          data.field = 'Engineering';
        } else if (text.includes('marketing')) {
          data.field = 'Marketing';
        }

        // Extract institution
        const institutionMatch = text.match(/(?:at|from|in)\s+([a-z\s]+university|[a-z\s]+college)/i);
        if (institutionMatch) {
          data.institution = institutionMatch[1];
        }
        break;

      case 'experience':
        // Extract job titles
        const titles = [];
        if (text.includes('software engineer') || text.includes('developer')) {
          titles.push('Software Engineer');
        }
        if (text.includes('manager')) {
          titles.push('Manager');
        }
        if (text.includes('sales')) {
          titles.push('Sales Representative');
        }

        // Extract companies
        const companies = [];
        if (text.includes('google')) companies.push('Google');
        if (text.includes('microsoft')) companies.push('Microsoft');
        if (text.includes('amazon')) companies.push('Amazon');
        if (text.includes('apple')) companies.push('Apple');

        if (titles.length > 0 || companies.length > 0) {
          data.experience = titles.map((title, index) => ({
            position: title,
            company: companies[index] || 'Company',
            duration: '2-3 years'
          }));
        }
        break;

      case 'skills':
        const skills = [];
        if (text.includes('javascript') || text.includes('js')) skills.push('JavaScript');
        if (text.includes('react')) skills.push('React');
        if (text.includes('python')) skills.push('Python');
        if (text.includes('java')) skills.push('Java');
        if (text.includes('sql')) skills.push('SQL');
        if (text.includes('marketing')) skills.push('Digital Marketing');
        if (text.includes('sales')) skills.push('Sales');
        if (text.includes('excel')) skills.push('Microsoft Excel');
        
        if (skills.length > 0) {
          data.skills = skills;
        }
        break;

      case 'achievements':
        const achievements = [];
        if (text.includes('led') || text.includes('manage')) {
          achievements.push('Led and managed team projects');
        }
        if (text.includes('increase') || text.includes('improve')) {
          achievements.push('Improved performance and efficiency');
        }
        if (text.includes('graduate') || text.includes('honor')) {
          achievements.push('Graduated with academic honors');
        }
        
        if (achievements.length > 0) {
          data.achievements = achievements;
        }
        break;
    }

    return data;
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Extract data from user input
      const extractedData = extractDataFromInput(text, conversationState.stage);
      
      // Update conversation state
      const newState = { ...conversationState };
      Object.assign(newState, extractedData);

      // Move to next stage
      const stages = ['greeting', 'profession', 'education', 'experience', 'skills', 'achievements', 'summary', 'complete'];
      const currentIndex = stages.indexOf(newState.stage);
      const nextStage = stages[currentIndex + 1] || 'complete';
      newState.stage = nextStage;

      setConversationState(newState);

      // Get AI response
      const nextQuestion = getNextQuestion(newState.stage, text);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: nextQuestion.text,
        sender: 'ai',
        timestamp: new Date(),
        suggestions: nextQuestion.suggestions,
        dataExtracted: extractedData
      };

      setMessages(prev => [...prev, aiMessage]);

      // Update extracted data
      setExtractedData(prev => ({ ...prev, ...extractedData }));

      // Auto-fill if we have enough data
      if (newState.stage === 'complete' && Object.keys(extractedData).length > 0) {
        const formData = convertToFormData(newState);
        onAutoFill(formData);
      }

    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble processing your request. Please try again or continue filling out the form manually.",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const convertToFormData = (state: ConversationState): Record<string, any> => {
    const formData: Record<string, any> = {};

    // Personal details
    if (state.profession) {
      formData.profession = state.profession;
    }

    // Education
    if (state.education) {
      formData.education = [{
        degree: state.education.degree || '',
        institution: state.education.institution || '',
        field: state.education.field || '',
        activities: 'Extracted from conversation'
      }];
    }

    // Experience
    if (state.experience && state.experience.length > 0) {
      formData.experience = state.experience.map((exp: any) => ({
        position: exp.position || '',
        company: exp.company || '',
        duration: exp.duration || '',
        responsibilities: 'Extracted from conversation',
        achievements: 'Extracted from conversation'
      }));
    }

    // Skills
    if (state.skills && state.skills.length > 0) {
      formData.skills = state.skills.join(', ');
    }

    // Achievements
    if (state.achievements && state.achievements.length > 0) {
      formData.achievements = state.achievements.join('\n');
    }

    return formData;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (suggestion === "Start guided wizard") {
      setShowGuidedWizard(true);
      return;
    }
    sendMessage(suggestion);
  };

  const handleAutoFill = async () => {
    setIsAutoFilling(true);
    try {
      // Call the backend AI endpoint to generate comprehensive resume data
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://prowrite.pythonanywhere.com/api'}/api/ai/enhance-resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          resume_data: conversationState,
          profession: conversationState.profession || 'General'
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Use the AI-generated resume data
          onAutoFill(result.resume_data);
          onClose();
        } else {
          console.error('Auto-fill failed:', result.error);
          // Fallback to local conversion
          const formData = convertToFormData(conversationState);
          onAutoFill(formData);
          onClose();
        }
      } else {
        console.error('Auto-fill request failed');
        // Fallback to local conversion
        const formData = convertToFormData(conversationState);
        onAutoFill(formData);
        onClose();
      }
    } catch (error) {
      console.error('Auto-fill error:', error);
      // Fallback to local conversion
      const formData = convertToFormData(conversationState);
      onAutoFill(formData);
      onClose();
    } finally {
      setIsAutoFilling(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl h-[700px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">ProwriteTemplate AI Resume Builder</h3>
              <p className="text-sm text-purple-100">
                {conversationState.stage === 'complete' ? 'Ready to create your resume!' : 'Let me help you build your resume'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-purple-200 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Progress:</span>
            <div className="flex space-x-2">
              {['profession', 'education', 'experience', 'skills', 'achievements', 'summary'].map((stage, index) => {
                const isCompleted = ['profession', 'education', 'experience', 'skills', 'achievements', 'summary'].indexOf(conversationState.stage) >= index;
                const isCurrent = conversationState.stage === stage;
                return (
                  <div key={stage} className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${
                      isCompleted ? 'bg-green-500' : isCurrent ? 'bg-blue-500' : 'bg-gray-300'
                    }`} />
                    <span className={`text-xs ${
                      isCompleted ? 'text-green-600' : isCurrent ? 'text-blue-600' : 'text-gray-400'
                    }`}>
                      {stage.charAt(0).toUpperCase() + stage.slice(1)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.sender === 'ai' && (
                    <div className="p-1 bg-purple-500 rounded-full">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm">{message.text}</p>
                    
                    {/* Data Extraction Indicator */}
                    {message.dataExtracted && Object.keys(message.dataExtracted).length > 0 && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span className="text-xs text-green-700">Data extracted successfully</span>
                        </div>
                      </div>
                    )}

                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs text-gray-500">Quick suggestions:</p>
                        <div className="flex flex-wrap gap-2">
                          {message.suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="text-xs bg-white bg-opacity-20 hover:bg-opacity-30 px-2 py-1 rounded transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {message.sender === 'user' && (
                    <div className="p-1 bg-white bg-opacity-20 rounded-full">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <div className="p-1 bg-purple-500 rounded-full">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex space-x-1">
                    <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
                    <span className="text-sm text-gray-500">AI is thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Guided Wizard Button */}
        <div className="p-4 bg-purple-50 border-t border-purple-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wand2 className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">
                Try our guided step-by-step wizard
              </span>
            </div>
            <button
              onClick={() => setShowGuidedWizard(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center space-x-2"
            >
              <Wand2 className="h-4 w-4" />
              <span>Start Guided Wizard</span>
            </button>
          </div>
        </div>

        {/* Auto-fill Button */}
        {conversationState.stage === 'complete' && (
          <div className="p-4 border-t border-gray-200 bg-green-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-green-700">
                  Ready to create your resume!
                </span>
              </div>
              <button
                onClick={handleAutoFill}
                disabled={isAutoFilling}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isAutoFilling ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>AI Processing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Auto-fill Resume Form</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-gray-200">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                conversationState.stage === 'complete' 
                  ? "Ask me anything else about your resume..." 
                  : "Tell me about yourself..."
              }
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={isTyping || !inputValue.trim()}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Guided Wizard Modal */}
      <ProwriteTemplateGuidedWizard
        isOpen={showGuidedWizard}
        onClose={() => setShowGuidedWizard(false)}
        onComplete={(resumeData) => {
          console.log('Resume data completed:', resumeData);
          setShowGuidedWizard(false);
        }}
        onAutoFill={(resumeData) => {
          onAutoFill(resumeData);
          setShowGuidedWizard(false);
        }}
      />
    </div>
  );
};

export default ProwriteTemplateChatbot;
