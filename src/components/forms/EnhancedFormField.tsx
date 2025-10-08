import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Edit3, 
  Save, 
  X, 
  Sparkles, 
  Lightbulb,
  TrendingUp,
  CheckCircle
} from 'lucide-react';
import { Button } from '../common/Button';
import AIEnhancer from '../ai/AIEnhancer';

interface EnhancedFormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'textarea' | 'email' | 'tel';
  required?: boolean;
  fieldType?: 'summary' | 'experience' | 'skills' | 'education';
  showAIEnhancer?: boolean;
  className?: string;
}

const EnhancedFormField: React.FC<EnhancedFormFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  fieldType,
  showAIEnhancer = false,
  className = ''
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [showAI, setShowAI] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditValue(value);
  };

  const handleSave = () => {
    onChange(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleAIEnhance = (enhancedValue: string) => {
    setEditValue(enhancedValue);
    setShowAI(false);
  };

  const getFieldIcon = () => {
    switch (fieldType) {
      case 'summary': return '📝';
      case 'experience': return '💼';
      case 'skills': return '🛠️';
      case 'education': return '🎓';
      default: return '📄';
    }
  };

  const getFieldColor = () => {
    switch (fieldType) {
      case 'summary': return 'from-blue-500 to-purple-500';
      case 'experience': return 'from-green-500 to-blue-500';
      case 'skills': return 'from-orange-500 to-red-500';
      case 'education': return 'from-purple-500 to-pink-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const renderInput = () => {
    if (type === 'textarea') {
      return (
        <textarea
          ref={inputRef as React.Ref<HTMLTextAreaElement>}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={4}
        />
      );
    }

    return (
      <input
        ref={inputRef as React.Ref<HTMLInputElement>}
        type={type}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    );
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Field Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {fieldType && (
            <span className="text-lg">{getFieldIcon()}</span>
          )}
          <label className="text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        </div>

        <div className="flex items-center space-x-2">
          {showAIEnhancer && fieldType && (
            <Button
              onClick={() => setShowAI(!showAI)}
              variant="ghost"
              size="sm"
              icon={<Sparkles className="h-4 w-4" />}
              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
            >
              AI
            </Button>
          )}

          {!isEditing ? (
            <Button
              onClick={handleEdit}
              variant="ghost"
              size="sm"
              icon={<Edit3 className="h-4 w-4" />}
              className="text-gray-600 hover:text-gray-800"
            >
              Edit
            </Button>
          ) : (
            <div className="flex items-center space-x-1">
              <Button
                onClick={handleSave}
                size="sm"
                icon={<Save className="h-4 w-4" />}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Save
              </Button>
              <Button
                onClick={handleCancel}
                variant="ghost"
                size="sm"
                icon={<X className="h-4 w-4" />}
                className="text-gray-600 hover:text-gray-800"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* AI Enhancement Panel */}
      {showAI && fieldType && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <AIEnhancer
            fieldType={fieldType}
            currentValue={editValue}
            onEnhance={handleAIEnhance}
            placeholder={placeholder}
          />
        </motion.div>
      )}

      {/* Field Content */}
      {isEditing ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {renderInput()}
          
          {/* Character Count & Tips */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{editValue.length} characters</span>
            
            {fieldType && (
              <div className="flex items-center space-x-2">
                <span className="flex items-center">
                  <Lightbulb className="h-3 w-3 mr-1" />
                  Tips
                </span>
                <span className="flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {fieldType === 'summary' && 'Keep it under 150 words'}
                  {fieldType === 'experience' && 'Use action verbs'}
                  {fieldType === 'skills' && 'Group by category'}
                  {fieldType === 'education' && 'Include achievements'}
                </span>
              </div>
            )}
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-[40px] px-3 py-2 bg-gray-50 border border-gray-200 rounded-md"
        >
          {value ? (
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {type === 'textarea' ? (
                  <p className="text-gray-800 whitespace-pre-wrap">{value}</p>
                ) : (
                  <p className="text-gray-800">{value}</p>
                )}
              </div>
              
              {fieldType && (
                <div className="ml-3 flex items-center space-x-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getFieldColor()} text-white`}>
                    {fieldType}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-400 italic">{placeholder || 'No content yet'}</p>
          )}
        </motion.div>
      )}

      {/* Field Status */}
      {value && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center space-x-2 text-xs text-green-600"
        >
          <CheckCircle className="h-3 w-3" />
          <span>Field completed</span>
          {fieldType && (
            <>
              <span>•</span>
              <span className="text-gray-500">Ready for AI enhancement</span>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default EnhancedFormField;









