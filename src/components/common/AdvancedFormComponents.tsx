import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Upload, 
  X, 
  Edit3, 
  Eye,
  Calendar,
  MapPin,
  Briefcase,
  GraduationCap,
  Star,
  Award,
  Globe,
  Linkedin,
  Mail,
  Phone,
  Camera
} from 'lucide-react';
import { Button } from './Button';

// Rich Text Editor Component
export const RichTextEditor: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}> = ({ value, onChange, placeholder, rows = 4 }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    onChange(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="space-y-3">
        <textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          rows={rows}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={placeholder}
          autoFocus
        />
        <div className="flex space-x-2">
          <Button
            onClick={handleSave}
            size="sm"
            className="bg-green-600 hover:bg-green-700"
          >
            Save
          </Button>
          <Button
            onClick={handleCancel}
            variant="outline"
            size="sm"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative">
      <div className="min-h-[100px] p-3 border border-gray-300 rounded-lg bg-gray-50">
        {value ? (
          <div className="whitespace-pre-wrap text-gray-700">{value}</div>
        ) : (
          <div className="text-gray-400 italic">{placeholder}</div>
        )}
      </div>
      <Button
        onClick={() => setIsEditing(true)}
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        icon={<Edit3 className="h-4 w-4" />}
      >
        Edit
      </Button>
    </div>
  );
};

// File Upload Component
export const FileUpload: React.FC<{
  onUpload: (file: File) => void;
  accept?: string;
  maxSize?: number; // in MB
  currentFile?: string;
  onRemove?: () => void;
}> = ({ onUpload, accept = "image/*", maxSize = 5, currentFile, onRemove }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setError('');
    
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    if (!file.type.match(accept.replace('*', '.*'))) {
      setError(`Please upload a valid ${accept} file`);
      return;
    }

    onUpload(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  if (currentFile) {
    return (
      <div className="text-center">
        <div className="relative inline-block">
          <img
            src={currentFile}
            alt="Profile"
            className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200"
          />
          {onRemove && (
            <Button
              onClick={onRemove}
              variant="ghost"
              size="sm"
              className="absolute -top-2 -right-2 bg-red-500 text-white hover:bg-red-600 rounded-full w-6 h-6 p-0"
              icon={<X className="h-3 w-3" />}
            />
          )}
        </div>
        <p className="text-sm text-gray-600 mt-2">Profile photo uploaded</p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div
        className={`w-24 h-24 mx-auto border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        {dragActive ? (
          <Upload className="h-8 w-8 text-blue-500" />
        ) : (
          <Camera className="h-8 w-8 text-gray-400" />
        )}
        <p className="text-xs text-gray-500 mt-1">
          {dragActive ? 'Drop here' : 'Click or drag'}
        </p>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
      
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
      
      <p className="text-xs text-gray-500 mt-2">
        Max size: {maxSize}MB
      </p>
    </div>
  );
};

// Dynamic Array Field Component
export const DynamicArrayField: React.FC<{
  items: any[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, value: any) => void;
  renderItem: (item: any, index: number) => React.ReactNode;
  addButtonText: string;
  emptyStateText: string;
}> = ({ items, onAdd, onRemove, onUpdate, renderItem, addButtonText, emptyStateText }) => {
  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>{emptyStateText}</p>
        </div>
      ) : (
        items.map((item, index) => (
          <div key={index} className="relative">
            {renderItem(item, index)}
            <Button
              onClick={() => onRemove(index)}
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 text-red-600 hover:text-red-700"
              icon={<Trash2 className="h-4 w-4" />}
            >
              Remove
            </Button>
          </div>
        ))
      )}
      
      <Button
        onClick={onAdd}
        variant="outline"
        className="w-full border-dashed border-gray-300 hover:border-gray-400"
        icon={<Plus className="h-4 w-4" />}
      >
        {addButtonText}
      </Button>
    </div>
  );
};

// Date Range Component
export const DateRangeField: React.FC<{
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onCurrentChange: (current: boolean) => void;
  startLabel?: string;
  endLabel?: string;
}> = ({
  startDate,
  endDate,
  isCurrent,
  onStartDateChange,
  onEndDateChange,
  onCurrentChange,
  startLabel = "Start Date",
  endLabel = "End Date"
}) => {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {startLabel} *
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {endLabel}
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isCurrent}
            min={startDate}
          />
        </div>
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="current"
          checked={isCurrent}
          onChange={(e) => onCurrentChange(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="current" className="ml-2 text-sm text-gray-700">
          I'm currently working/studying here
        </label>
      </div>
    </div>
  );
};

// Location Field Component
export const LocationField: React.FC<{
  city: string;
  country: string;
  onCityChange: (city: string) => void;
  onCountryChange: (country: string) => void;
}> = ({ city, country, onCityChange, onCountryChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          City
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter city"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Country
        </label>
        <input
          type="text"
          value={country}
          onChange={(e) => onCountryChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter country"
        />
      </div>
    </div>
  );
};

// Skill Level Selector
export const SkillLevelSelector: React.FC<{
  level: string;
  onChange: (level: string) => void;
}> = ({ level, onChange }) => {
  const levels = [
    { value: 'beginner', label: 'Beginner', color: 'bg-gray-100 text-gray-800' },
    { value: 'intermediate', label: 'Intermediate', color: 'bg-blue-100 text-blue-800' },
    { value: 'advanced', label: 'Advanced', color: 'bg-purple-100 text-purple-800' },
    { value: 'expert', label: 'Expert', color: 'bg-green-100 text-green-800' }
  ];

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Skill Level *
      </label>
      <div className="grid grid-cols-2 gap-2">
        {levels.map((lvl) => (
          <button
            key={lvl.value}
            type="button"
            onClick={() => onChange(lvl.value)}
            className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
              level === lvl.value
                ? `${lvl.color} border-current`
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {lvl.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// Social Media Links Component
export const SocialMediaLinks: React.FC<{
  linkedin: string;
  website: string;
  onLinkedinChange: (value: string) => void;
  onWebsiteChange: (value: string) => void;
}> = ({ linkedin, website, onLinkedinChange, onWebsiteChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          LinkedIn Profile
        </label>
        <div className="relative">
          <Linkedin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="url"
            value={linkedin}
            onChange={(e) => onLinkedinChange(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://linkedin.com/in/yourprofile"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Personal Website
        </label>
        <div className="relative">
          <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="url"
            value={website}
            onChange={(e) => onWebsiteChange(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://yourwebsite.com"
          />
        </div>
      </div>
    </div>
  );
};





































