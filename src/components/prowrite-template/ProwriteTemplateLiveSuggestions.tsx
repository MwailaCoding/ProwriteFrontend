import React, { useState, useEffect, useRef } from 'react';
import { Lightbulb, Sparkles, Check, X } from 'lucide-react';
import axios from 'axios';

interface Suggestion {
  id: string;
  text: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
}

interface ProwriteTemplateLiveSuggestionsProps {
  content: string;
  fieldType: string;
  profession?: string;
  onApplySuggestion: (suggestion: string) => void;
  isVisible: boolean;
  onClose: () => void;
}

const ProwriteTemplateLiveSuggestions: React.FC<ProwriteTemplateLiveSuggestionsProps> = ({
  content,
  fieldType,
  profession,
  onApplySuggestion,
  isVisible,
  onClose
}) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedContent, setDebouncedContent] = useState(content);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Debounce content changes to avoid too many API calls
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedContent(content);
    }, 1000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content]);

  // Fetch suggestions when content changes
  useEffect(() => {
    if (!isVisible || !debouncedContent.trim() || debouncedContent.length < 10) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
        const response = await axios.post('/api/prowrite-template/ai/suggestions', {
          profession: profession || '',
          field_type: fieldType
        });
        const data = response.data;
        
        if (data.success) {
          setSuggestions(data.suggestions || []);
        }
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
        // Fallback to local suggestions
        setSuggestions(getLocalSuggestions(fieldType, profession));
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedContent, fieldType, profession, isVisible]);

  const getLocalSuggestions = (fieldType: string, profession?: string): Suggestion[] => {
    const baseSuggestions: Record<string, Suggestion[]> = {
      activities: [
        { id: '1', text: 'Include leadership roles and responsibilities', category: 'enhancement', priority: 'high' },
        { id: '2', text: 'Highlight relevant projects and initiatives', category: 'enhancement', priority: 'high' },
        { id: '3', text: 'Mention any awards or recognition received', category: 'enhancement', priority: 'medium' }
      ],
      responsibilities: [
        { id: '1', text: 'Transform duties into achievement statements', category: 'enhancement', priority: 'high' },
        { id: '2', text: 'Add quantifiable results and metrics', category: 'enhancement', priority: 'high' },
        { id: '3', text: 'Use action verbs and professional language', category: 'enhancement', priority: 'medium' }
      ],
      achievements: [
        { id: '1', text: 'Include specific numbers and percentages', category: 'enhancement', priority: 'high' },
        { id: '2', text: 'Highlight awards and recognition', category: 'enhancement', priority: 'medium' },
        { id: '3', text: 'Focus on measurable results', category: 'enhancement', priority: 'high' }
      ]
    };

    let suggestions = baseSuggestions[fieldType] || [];

    // Add profession-specific suggestions
    if (profession) {
      const professionSuggestions: Record<string, string[]> = {
        software_engineer: [
          'Emphasize technical skills and technologies',
          'Include performance improvements and optimizations',
          'Mention scalability and efficiency gains'
        ],
        marketing_manager: [
          'Highlight campaign performance and metrics',
          'Include brand awareness and engagement improvements',
          'Mention revenue growth and conversion rates'
        ],
        sales_professional: [
          'Include sales targets and achievements',
          'Highlight client relationship management',
          'Mention territory expansion and growth'
        ]
      };

      const profSuggestions = professionSuggestions[profession] || [];
      suggestions = [
        ...suggestions,
        ...profSuggestions.map((text, index) => ({
          id: `prof_${index}`,
          text,
          category: 'profession',
          priority: 'medium' as const
        }))
      ];
    }

    return suggestions.slice(0, 5); // Limit to 5 suggestions
  };

  const handleApplySuggestion = (suggestion: string) => {
    onApplySuggestion(suggestion);
    onClose();
  };

  if (!isVisible || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center space-x-2">
          <Lightbulb className="h-4 w-4 text-yellow-500" />
          <span className="text-sm font-medium text-gray-700">AI Suggestions</span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Suggestions List */}
      <div className="p-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-purple-500 animate-pulse" />
              <span className="text-sm text-gray-500">Analyzing content...</span>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md transition-colors cursor-pointer group"
                onClick={() => handleApplySuggestion(suggestion.text)}
              >
                <div className="flex-1">
                  <p className="text-sm text-gray-700 group-hover:text-gray-900">
                    {suggestion.text}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                      suggestion.priority === 'high' 
                        ? 'bg-red-100 text-red-800' 
                        : suggestion.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {suggestion.priority}
                    </span>
                    <span className="text-xs text-gray-500 capitalize">
                      {suggestion.category}
                    </span>
                  </div>
                </div>
                <Check className="h-4 w-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-gray-100 bg-gray-50">
        <p className="text-xs text-gray-500 text-center">
          Click any suggestion to apply it to your content
        </p>
      </div>
    </div>
  );
};

export default ProwriteTemplateLiveSuggestions;















          'Mention territory expansion and growth'

        ]

      };



      const profSuggestions = professionSuggestions[profession] || [];

      suggestions = [

        ...suggestions,

        ...profSuggestions.map((text, index) => ({

          id: `prof_${index}`,

          text,

          category: 'profession',

          priority: 'medium' as const

        }))

      ];

    }



    return suggestions.slice(0, 5); // Limit to 5 suggestions

  };



  const handleApplySuggestion = (suggestion: string) => {

    onApplySuggestion(suggestion);

    onClose();

  };



  if (!isVisible || suggestions.length === 0) {

    return null;

  }



  return (

    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">

      {/* Header */}

      <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50">

        <div className="flex items-center space-x-2">

          <Lightbulb className="h-4 w-4 text-yellow-500" />

          <span className="text-sm font-medium text-gray-700">AI Suggestions</span>

        </div>

        <button

          onClick={onClose}

          className="text-gray-400 hover:text-gray-600 transition-colors"

        >

          <X className="h-4 w-4" />

        </button>

      </div>



      {/* Suggestions List */}

      <div className="p-2">

        {isLoading ? (

          <div className="flex items-center justify-center py-4">

            <div className="flex items-center space-x-2">

              <Sparkles className="h-4 w-4 text-purple-500 animate-pulse" />

              <span className="text-sm text-gray-500">Analyzing content...</span>

            </div>

          </div>

        ) : (

          <div className="space-y-1">

            {suggestions.map((suggestion) => (

              <div

                key={suggestion.id}

                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md transition-colors cursor-pointer group"

                onClick={() => handleApplySuggestion(suggestion.text)}

              >

                <div className="flex-1">

                  <p className="text-sm text-gray-700 group-hover:text-gray-900">

                    {suggestion.text}

                  </p>

                  <div className="flex items-center space-x-2 mt-1">

                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${

                      suggestion.priority === 'high' 

                        ? 'bg-red-100 text-red-800' 

                        : suggestion.priority === 'medium'

                        ? 'bg-yellow-100 text-yellow-800'

                        : 'bg-green-100 text-green-800'

                    }`}>

                      {suggestion.priority}

                    </span>

                    <span className="text-xs text-gray-500 capitalize">

                      {suggestion.category}

                    </span>

                  </div>

                </div>

                <Check className="h-4 w-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />

              </div>

            ))}

          </div>

        )}

      </div>



      {/* Footer */}

      <div className="p-2 border-t border-gray-100 bg-gray-50">

        <p className="text-xs text-gray-500 text-center">

          Click any suggestion to apply it to your content

        </p>

      </div>

    </div>

  );

};



export default ProwriteTemplateLiveSuggestions;































          'Mention territory expansion and growth'

        ]

      };



      const profSuggestions = professionSuggestions[profession] || [];

      suggestions = [

        ...suggestions,

        ...profSuggestions.map((text, index) => ({

          id: `prof_${index}`,

          text,

          category: 'profession',

          priority: 'medium' as const

        }))

      ];

    }



    return suggestions.slice(0, 5); // Limit to 5 suggestions

  };



  const handleApplySuggestion = (suggestion: string) => {

    onApplySuggestion(suggestion);

    onClose();

  };



  if (!isVisible || suggestions.length === 0) {

    return null;

  }



  return (

    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">

      {/* Header */}

      <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50">

        <div className="flex items-center space-x-2">

          <Lightbulb className="h-4 w-4 text-yellow-500" />

          <span className="text-sm font-medium text-gray-700">AI Suggestions</span>

        </div>

        <button

          onClick={onClose}

          className="text-gray-400 hover:text-gray-600 transition-colors"

        >

          <X className="h-4 w-4" />

        </button>

      </div>



      {/* Suggestions List */}

      <div className="p-2">

        {isLoading ? (

          <div className="flex items-center justify-center py-4">

            <div className="flex items-center space-x-2">

              <Sparkles className="h-4 w-4 text-purple-500 animate-pulse" />

              <span className="text-sm text-gray-500">Analyzing content...</span>

            </div>

          </div>

        ) : (

          <div className="space-y-1">

            {suggestions.map((suggestion) => (

              <div

                key={suggestion.id}

                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md transition-colors cursor-pointer group"

                onClick={() => handleApplySuggestion(suggestion.text)}

              >

                <div className="flex-1">

                  <p className="text-sm text-gray-700 group-hover:text-gray-900">

                    {suggestion.text}

                  </p>

                  <div className="flex items-center space-x-2 mt-1">

                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${

                      suggestion.priority === 'high' 

                        ? 'bg-red-100 text-red-800' 

                        : suggestion.priority === 'medium'

                        ? 'bg-yellow-100 text-yellow-800'

                        : 'bg-green-100 text-green-800'

                    }`}>

                      {suggestion.priority}

                    </span>

                    <span className="text-xs text-gray-500 capitalize">

                      {suggestion.category}

                    </span>

                  </div>

                </div>

                <Check className="h-4 w-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />

              </div>

            ))}

          </div>

        )}

      </div>



      {/* Footer */}

      <div className="p-2 border-t border-gray-100 bg-gray-50">

        <p className="text-xs text-gray-500 text-center">

          Click any suggestion to apply it to your content

        </p>

      </div>

    </div>

  );

};



export default ProwriteTemplateLiveSuggestions;































          'Mention territory expansion and growth'

        ]

      };



      const profSuggestions = professionSuggestions[profession] || [];

      suggestions = [

        ...suggestions,

        ...profSuggestions.map((text, index) => ({

          id: `prof_${index}`,

          text,

          category: 'profession',

          priority: 'medium' as const

        }))

      ];

    }



    return suggestions.slice(0, 5); // Limit to 5 suggestions

  };



  const handleApplySuggestion = (suggestion: string) => {

    onApplySuggestion(suggestion);

    onClose();

  };



  if (!isVisible || suggestions.length === 0) {

    return null;

  }



  return (

    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">

      {/* Header */}

      <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50">

        <div className="flex items-center space-x-2">

          <Lightbulb className="h-4 w-4 text-yellow-500" />

          <span className="text-sm font-medium text-gray-700">AI Suggestions</span>

        </div>

        <button

          onClick={onClose}

          className="text-gray-400 hover:text-gray-600 transition-colors"

        >

          <X className="h-4 w-4" />

        </button>

      </div>



      {/* Suggestions List */}

      <div className="p-2">

        {isLoading ? (

          <div className="flex items-center justify-center py-4">

            <div className="flex items-center space-x-2">

              <Sparkles className="h-4 w-4 text-purple-500 animate-pulse" />

              <span className="text-sm text-gray-500">Analyzing content...</span>

            </div>

          </div>

        ) : (

          <div className="space-y-1">

            {suggestions.map((suggestion) => (

              <div

                key={suggestion.id}

                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md transition-colors cursor-pointer group"

                onClick={() => handleApplySuggestion(suggestion.text)}

              >

                <div className="flex-1">

                  <p className="text-sm text-gray-700 group-hover:text-gray-900">

                    {suggestion.text}

                  </p>

                  <div className="flex items-center space-x-2 mt-1">

                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${

                      suggestion.priority === 'high' 

                        ? 'bg-red-100 text-red-800' 

                        : suggestion.priority === 'medium'

                        ? 'bg-yellow-100 text-yellow-800'

                        : 'bg-green-100 text-green-800'

                    }`}>

                      {suggestion.priority}

                    </span>

                    <span className="text-xs text-gray-500 capitalize">

                      {suggestion.category}

                    </span>

                  </div>

                </div>

                <Check className="h-4 w-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />

              </div>

            ))}

          </div>

        )}

      </div>



      {/* Footer */}

      <div className="p-2 border-t border-gray-100 bg-gray-50">

        <p className="text-xs text-gray-500 text-center">

          Click any suggestion to apply it to your content

        </p>

      </div>

    </div>

  );

};



export default ProwriteTemplateLiveSuggestions;































          'Mention territory expansion and growth'

        ]

      };



      const profSuggestions = professionSuggestions[profession] || [];

      suggestions = [

        ...suggestions,

        ...profSuggestions.map((text, index) => ({

          id: `prof_${index}`,

          text,

          category: 'profession',

          priority: 'medium' as const

        }))

      ];

    }



    return suggestions.slice(0, 5); // Limit to 5 suggestions

  };



  const handleApplySuggestion = (suggestion: string) => {

    onApplySuggestion(suggestion);

    onClose();

  };



  if (!isVisible || suggestions.length === 0) {

    return null;

  }



  return (

    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">

      {/* Header */}

      <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50">

        <div className="flex items-center space-x-2">

          <Lightbulb className="h-4 w-4 text-yellow-500" />

          <span className="text-sm font-medium text-gray-700">AI Suggestions</span>

        </div>

        <button

          onClick={onClose}

          className="text-gray-400 hover:text-gray-600 transition-colors"

        >

          <X className="h-4 w-4" />

        </button>

      </div>



      {/* Suggestions List */}

      <div className="p-2">

        {isLoading ? (

          <div className="flex items-center justify-center py-4">

            <div className="flex items-center space-x-2">

              <Sparkles className="h-4 w-4 text-purple-500 animate-pulse" />

              <span className="text-sm text-gray-500">Analyzing content...</span>

            </div>

          </div>

        ) : (

          <div className="space-y-1">

            {suggestions.map((suggestion) => (

              <div

                key={suggestion.id}

                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md transition-colors cursor-pointer group"

                onClick={() => handleApplySuggestion(suggestion.text)}

              >

                <div className="flex-1">

                  <p className="text-sm text-gray-700 group-hover:text-gray-900">

                    {suggestion.text}

                  </p>

                  <div className="flex items-center space-x-2 mt-1">

                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${

                      suggestion.priority === 'high' 

                        ? 'bg-red-100 text-red-800' 

                        : suggestion.priority === 'medium'

                        ? 'bg-yellow-100 text-yellow-800'

                        : 'bg-green-100 text-green-800'

                    }`}>

                      {suggestion.priority}

                    </span>

                    <span className="text-xs text-gray-500 capitalize">

                      {suggestion.category}

                    </span>

                  </div>

                </div>

                <Check className="h-4 w-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />

              </div>

            ))}

          </div>

        )}

      </div>



      {/* Footer */}

      <div className="p-2 border-t border-gray-100 bg-gray-50">

        <p className="text-xs text-gray-500 text-center">

          Click any suggestion to apply it to your content

        </p>

      </div>

    </div>

  );

};



export default ProwriteTemplateLiveSuggestions;































          'Mention territory expansion and growth'

        ]

      };



      const profSuggestions = professionSuggestions[profession] || [];

      suggestions = [

        ...suggestions,

        ...profSuggestions.map((text, index) => ({

          id: `prof_${index}`,

          text,

          category: 'profession',

          priority: 'medium' as const

        }))

      ];

    }



    return suggestions.slice(0, 5); // Limit to 5 suggestions

  };



  const handleApplySuggestion = (suggestion: string) => {

    onApplySuggestion(suggestion);

    onClose();

  };



  if (!isVisible || suggestions.length === 0) {

    return null;

  }



  return (

    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">

      {/* Header */}

      <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50">

        <div className="flex items-center space-x-2">

          <Lightbulb className="h-4 w-4 text-yellow-500" />

          <span className="text-sm font-medium text-gray-700">AI Suggestions</span>

        </div>

        <button

          onClick={onClose}

          className="text-gray-400 hover:text-gray-600 transition-colors"

        >

          <X className="h-4 w-4" />

        </button>

      </div>



      {/* Suggestions List */}

      <div className="p-2">

        {isLoading ? (

          <div className="flex items-center justify-center py-4">

            <div className="flex items-center space-x-2">

              <Sparkles className="h-4 w-4 text-purple-500 animate-pulse" />

              <span className="text-sm text-gray-500">Analyzing content...</span>

            </div>

          </div>

        ) : (

          <div className="space-y-1">

            {suggestions.map((suggestion) => (

              <div

                key={suggestion.id}

                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md transition-colors cursor-pointer group"

                onClick={() => handleApplySuggestion(suggestion.text)}

              >

                <div className="flex-1">

                  <p className="text-sm text-gray-700 group-hover:text-gray-900">

                    {suggestion.text}

                  </p>

                  <div className="flex items-center space-x-2 mt-1">

                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${

                      suggestion.priority === 'high' 

                        ? 'bg-red-100 text-red-800' 

                        : suggestion.priority === 'medium'

                        ? 'bg-yellow-100 text-yellow-800'

                        : 'bg-green-100 text-green-800'

                    }`}>

                      {suggestion.priority}

                    </span>

                    <span className="text-xs text-gray-500 capitalize">

                      {suggestion.category}

                    </span>

                  </div>

                </div>

                <Check className="h-4 w-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />

              </div>

            ))}

          </div>

        )}

      </div>



      {/* Footer */}

      <div className="p-2 border-t border-gray-100 bg-gray-50">

        <p className="text-xs text-gray-500 text-center">

          Click any suggestion to apply it to your content

        </p>

      </div>

    </div>

  );

};



export default ProwriteTemplateLiveSuggestions;































          'Mention territory expansion and growth'

        ]

      };



      const profSuggestions = professionSuggestions[profession] || [];

      suggestions = [

        ...suggestions,

        ...profSuggestions.map((text, index) => ({

          id: `prof_${index}`,

          text,

          category: 'profession',

          priority: 'medium' as const

        }))

      ];

    }



    return suggestions.slice(0, 5); // Limit to 5 suggestions

  };



  const handleApplySuggestion = (suggestion: string) => {

    onApplySuggestion(suggestion);

    onClose();

  };



  if (!isVisible || suggestions.length === 0) {

    return null;

  }



  return (

    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">

      {/* Header */}

      <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50">

        <div className="flex items-center space-x-2">

          <Lightbulb className="h-4 w-4 text-yellow-500" />

          <span className="text-sm font-medium text-gray-700">AI Suggestions</span>

        </div>

        <button

          onClick={onClose}

          className="text-gray-400 hover:text-gray-600 transition-colors"

        >

          <X className="h-4 w-4" />

        </button>

      </div>



      {/* Suggestions List */}

      <div className="p-2">

        {isLoading ? (

          <div className="flex items-center justify-center py-4">

            <div className="flex items-center space-x-2">

              <Sparkles className="h-4 w-4 text-purple-500 animate-pulse" />

              <span className="text-sm text-gray-500">Analyzing content...</span>

            </div>

          </div>

        ) : (

          <div className="space-y-1">

            {suggestions.map((suggestion) => (

              <div

                key={suggestion.id}

                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md transition-colors cursor-pointer group"

                onClick={() => handleApplySuggestion(suggestion.text)}

              >

                <div className="flex-1">

                  <p className="text-sm text-gray-700 group-hover:text-gray-900">

                    {suggestion.text}

                  </p>

                  <div className="flex items-center space-x-2 mt-1">

                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${

                      suggestion.priority === 'high' 

                        ? 'bg-red-100 text-red-800' 

                        : suggestion.priority === 'medium'

                        ? 'bg-yellow-100 text-yellow-800'

                        : 'bg-green-100 text-green-800'

                    }`}>

                      {suggestion.priority}

                    </span>

                    <span className="text-xs text-gray-500 capitalize">

                      {suggestion.category}

                    </span>

                  </div>

                </div>

                <Check className="h-4 w-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />

              </div>

            ))}

          </div>

        )}

      </div>



      {/* Footer */}

      <div className="p-2 border-t border-gray-100 bg-gray-50">

        <p className="text-xs text-gray-500 text-center">

          Click any suggestion to apply it to your content

        </p>

      </div>

    </div>

  );

};



export default ProwriteTemplateLiveSuggestions;
































          'Mention territory expansion and growth'

        ]

      };



      const profSuggestions = professionSuggestions[profession] || [];

      suggestions = [

        ...suggestions,

        ...profSuggestions.map((text, index) => ({

          id: `prof_${index}`,

          text,

          category: 'profession',

          priority: 'medium' as const

        }))

      ];

    }



    return suggestions.slice(0, 5); // Limit to 5 suggestions

  };



  const handleApplySuggestion = (suggestion: string) => {

    onApplySuggestion(suggestion);

    onClose();

  };



  if (!isVisible || suggestions.length === 0) {

    return null;

  }



  return (

    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">

      {/* Header */}

      <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50">

        <div className="flex items-center space-x-2">

          <Lightbulb className="h-4 w-4 text-yellow-500" />

          <span className="text-sm font-medium text-gray-700">AI Suggestions</span>

        </div>

        <button

          onClick={onClose}

          className="text-gray-400 hover:text-gray-600 transition-colors"

        >

          <X className="h-4 w-4" />

        </button>

      </div>



      {/* Suggestions List */}

      <div className="p-2">

        {isLoading ? (

          <div className="flex items-center justify-center py-4">

            <div className="flex items-center space-x-2">

              <Sparkles className="h-4 w-4 text-purple-500 animate-pulse" />

              <span className="text-sm text-gray-500">Analyzing content...</span>

            </div>

          </div>

        ) : (

          <div className="space-y-1">

            {suggestions.map((suggestion) => (

              <div

                key={suggestion.id}

                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md transition-colors cursor-pointer group"

                onClick={() => handleApplySuggestion(suggestion.text)}

              >

                <div className="flex-1">

                  <p className="text-sm text-gray-700 group-hover:text-gray-900">

                    {suggestion.text}

                  </p>

                  <div className="flex items-center space-x-2 mt-1">

                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${

                      suggestion.priority === 'high' 

                        ? 'bg-red-100 text-red-800' 

                        : suggestion.priority === 'medium'

                        ? 'bg-yellow-100 text-yellow-800'

                        : 'bg-green-100 text-green-800'

                    }`}>

                      {suggestion.priority}

                    </span>

                    <span className="text-xs text-gray-500 capitalize">

                      {suggestion.category}

                    </span>

                  </div>

                </div>

                <Check className="h-4 w-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />

              </div>

            ))}

          </div>

        )}

      </div>



      {/* Footer */}

      <div className="p-2 border-t border-gray-100 bg-gray-50">

        <p className="text-xs text-gray-500 text-center">

          Click any suggestion to apply it to your content

        </p>

      </div>

    </div>

  );

};



export default ProwriteTemplateLiveSuggestions;






























          'Mention territory expansion and growth'

        ]

      };



      const profSuggestions = professionSuggestions[profession] || [];

      suggestions = [

        ...suggestions,

        ...profSuggestions.map((text, index) => ({

          id: `prof_${index}`,

          text,

          category: 'profession',

          priority: 'medium' as const

        }))

      ];

    }



    return suggestions.slice(0, 5); // Limit to 5 suggestions

  };



  const handleApplySuggestion = (suggestion: string) => {

    onApplySuggestion(suggestion);

    onClose();

  };



  if (!isVisible || suggestions.length === 0) {

    return null;

  }



  return (

    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">

      {/* Header */}

      <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50">

        <div className="flex items-center space-x-2">

          <Lightbulb className="h-4 w-4 text-yellow-500" />

          <span className="text-sm font-medium text-gray-700">AI Suggestions</span>

        </div>

        <button

          onClick={onClose}

          className="text-gray-400 hover:text-gray-600 transition-colors"

        >

          <X className="h-4 w-4" />

        </button>

      </div>



      {/* Suggestions List */}

      <div className="p-2">

        {isLoading ? (

          <div className="flex items-center justify-center py-4">

            <div className="flex items-center space-x-2">

              <Sparkles className="h-4 w-4 text-purple-500 animate-pulse" />

              <span className="text-sm text-gray-500">Analyzing content...</span>

            </div>

          </div>

        ) : (

          <div className="space-y-1">

            {suggestions.map((suggestion) => (

              <div

                key={suggestion.id}

                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md transition-colors cursor-pointer group"

                onClick={() => handleApplySuggestion(suggestion.text)}

              >

                <div className="flex-1">

                  <p className="text-sm text-gray-700 group-hover:text-gray-900">

                    {suggestion.text}

                  </p>

                  <div className="flex items-center space-x-2 mt-1">

                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${

                      suggestion.priority === 'high' 

                        ? 'bg-red-100 text-red-800' 

                        : suggestion.priority === 'medium'

                        ? 'bg-yellow-100 text-yellow-800'

                        : 'bg-green-100 text-green-800'

                    }`}>

                      {suggestion.priority}

                    </span>

                    <span className="text-xs text-gray-500 capitalize">

                      {suggestion.category}

                    </span>

                  </div>

                </div>

                <Check className="h-4 w-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />

              </div>

            ))}

          </div>

        )}

      </div>



      {/* Footer */}

      <div className="p-2 border-t border-gray-100 bg-gray-50">

        <p className="text-xs text-gray-500 text-center">

          Click any suggestion to apply it to your content

        </p>

      </div>

    </div>

  );

};



export default ProwriteTemplateLiveSuggestions;































          'Mention territory expansion and growth'

        ]

      };



      const profSuggestions = professionSuggestions[profession] || [];

      suggestions = [

        ...suggestions,

        ...profSuggestions.map((text, index) => ({

          id: `prof_${index}`,

          text,

          category: 'profession',

          priority: 'medium' as const

        }))

      ];

    }



    return suggestions.slice(0, 5); // Limit to 5 suggestions

  };



  const handleApplySuggestion = (suggestion: string) => {

    onApplySuggestion(suggestion);

    onClose();

  };



  if (!isVisible || suggestions.length === 0) {

    return null;

  }



  return (

    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">

      {/* Header */}

      <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50">

        <div className="flex items-center space-x-2">

          <Lightbulb className="h-4 w-4 text-yellow-500" />

          <span className="text-sm font-medium text-gray-700">AI Suggestions</span>

        </div>

        <button

          onClick={onClose}

          className="text-gray-400 hover:text-gray-600 transition-colors"

        >

          <X className="h-4 w-4" />

        </button>

      </div>



      {/* Suggestions List */}

      <div className="p-2">

        {isLoading ? (

          <div className="flex items-center justify-center py-4">

            <div className="flex items-center space-x-2">

              <Sparkles className="h-4 w-4 text-purple-500 animate-pulse" />

              <span className="text-sm text-gray-500">Analyzing content...</span>

            </div>

          </div>

        ) : (

          <div className="space-y-1">

            {suggestions.map((suggestion) => (

              <div

                key={suggestion.id}

                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md transition-colors cursor-pointer group"

                onClick={() => handleApplySuggestion(suggestion.text)}

              >

                <div className="flex-1">

                  <p className="text-sm text-gray-700 group-hover:text-gray-900">

                    {suggestion.text}

                  </p>

                  <div className="flex items-center space-x-2 mt-1">

                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${

                      suggestion.priority === 'high' 

                        ? 'bg-red-100 text-red-800' 

                        : suggestion.priority === 'medium'

                        ? 'bg-yellow-100 text-yellow-800'

                        : 'bg-green-100 text-green-800'

                    }`}>

                      {suggestion.priority}

                    </span>

                    <span className="text-xs text-gray-500 capitalize">

                      {suggestion.category}

                    </span>

                  </div>

                </div>

                <Check className="h-4 w-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />

              </div>

            ))}

          </div>

        )}

      </div>



      {/* Footer */}

      <div className="p-2 border-t border-gray-100 bg-gray-50">

        <p className="text-xs text-gray-500 text-center">

          Click any suggestion to apply it to your content

        </p>

      </div>

    </div>

  );

};



export default ProwriteTemplateLiveSuggestions;
































          'Mention territory expansion and growth'

        ]

      };



      const profSuggestions = professionSuggestions[profession] || [];

      suggestions = [

        ...suggestions,

        ...profSuggestions.map((text, index) => ({

          id: `prof_${index}`,

          text,

          category: 'profession',

          priority: 'medium' as const

        }))

      ];

    }



    return suggestions.slice(0, 5); // Limit to 5 suggestions

  };



  const handleApplySuggestion = (suggestion: string) => {

    onApplySuggestion(suggestion);

    onClose();

  };



  if (!isVisible || suggestions.length === 0) {

    return null;

  }



  return (

    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">

      {/* Header */}

      <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50">

        <div className="flex items-center space-x-2">

          <Lightbulb className="h-4 w-4 text-yellow-500" />

          <span className="text-sm font-medium text-gray-700">AI Suggestions</span>

        </div>

        <button

          onClick={onClose}

          className="text-gray-400 hover:text-gray-600 transition-colors"

        >

          <X className="h-4 w-4" />

        </button>

      </div>



      {/* Suggestions List */}

      <div className="p-2">

        {isLoading ? (

          <div className="flex items-center justify-center py-4">

            <div className="flex items-center space-x-2">

              <Sparkles className="h-4 w-4 text-purple-500 animate-pulse" />

              <span className="text-sm text-gray-500">Analyzing content...</span>

            </div>

          </div>

        ) : (

          <div className="space-y-1">

            {suggestions.map((suggestion) => (

              <div

                key={suggestion.id}

                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md transition-colors cursor-pointer group"

                onClick={() => handleApplySuggestion(suggestion.text)}

              >

                <div className="flex-1">

                  <p className="text-sm text-gray-700 group-hover:text-gray-900">

                    {suggestion.text}

                  </p>

                  <div className="flex items-center space-x-2 mt-1">

                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${

                      suggestion.priority === 'high' 

                        ? 'bg-red-100 text-red-800' 

                        : suggestion.priority === 'medium'

                        ? 'bg-yellow-100 text-yellow-800'

                        : 'bg-green-100 text-green-800'

                    }`}>

                      {suggestion.priority}

                    </span>

                    <span className="text-xs text-gray-500 capitalize">

                      {suggestion.category}

                    </span>

                  </div>

                </div>

                <Check className="h-4 w-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />

              </div>

            ))}

          </div>

        )}

      </div>



      {/* Footer */}

      <div className="p-2 border-t border-gray-100 bg-gray-50">

        <p className="text-xs text-gray-500 text-center">

          Click any suggestion to apply it to your content

        </p>

      </div>

    </div>

  );

};



export default ProwriteTemplateLiveSuggestions;





























