import React, { useState, useEffect, useRef } from 'react';
import { Button } from './Button';
import { Card } from './Card';

interface ResumeSection {
  id: string;
  type: string;
  title: string;
  content: string;
  editable: boolean;
  position: { x: number; y: number; width: number; height: number };
  fontSize: number;
  fontWeight: string;
  color: string;
  alignment: string;
}

interface TemplateEditorProps {
  templateId: number;
  templateName: string;
  onSave: (content: string) => void;
  onPreview: () => void;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({
  templateId,
  templateName,
  onSave,
  onPreview
}) => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState<string>('');
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [pdfBinary, setPdfBinary] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // CVmaker-style section editing with EXACT positioning
  const [resumeSections, setResumeSections] = useState<ResumeSection[]>([
    {
      id: 'name',
      type: 'name',
      title: 'Name',
      content: 'Michael Smith',
      editable: true,
      position: { x: 50, y: 80, width: 300, height: 40 },
      fontSize: 28,
      fontWeight: 'bold',
      color: '#1f2937',
      alignment: 'left'
    },
    {
      id: 'title',
      type: 'title',
      title: 'Title',
      content: 'Industrial Engineer | Advanced Computing | Sensors and Communications Technologies',
      editable: true,
      position: { x: 50, y: 130, width: 500, height: 30 },
      fontSize: 16,
      fontWeight: 'normal',
      color: '#6b7280',
      alignment: 'left'
    },
    {
      id: 'contact',
      type: 'contact',
      title: 'Contact',
      content: '+1-541-754-3010 | help@enhancv.com | linkedin.com | Los Angeles, CA',
      editable: true,
      position: { x: 50, y: 170, width: 500, height: 25 },
      fontSize: 14,
      fontWeight: 'normal',
      color: '#6b7280',
      alignment: 'left'
    },
    {
      id: 'summary',
      type: 'summary',
      title: 'SUMMARY',
      content: 'With over 10 years of experience as an Industrial Engineer, I have a proven track record in developing efficient manufacturing processes, implementing LEAN principles, and leading successful projects. My technical skills include CAD, automation software development, and process modeling.',
      editable: true,
      position: { x: 50, y: 220, width: 500, height: 80 },
      fontSize: 16,
      fontWeight: 'normal',
      color: '#374151',
      alignment: 'left'
    },
    {
      id: 'experience',
      type: 'experience',
      title: 'EXPERIENCE',
      content: 'Industrial Engineer - Lockheed Martin\n2019-2023 | Los Angeles, CA\n• Led a team of engineers in the development and implementation of new manufacturing processes\n• Implemented a new automated assembly process, reducing assembly time by 25% and saving $100,000 annually\n• Led a project to redesign the factory layout, improving workflow and increasing productivity by 15%',
      editable: true,
      position: { x: 50, y: 320, width: 500, height: 150 },
      fontSize: 16,
      fontWeight: 'normal',
      color: '#374151',
      alignment: 'left'
    },
    {
      id: 'skills',
      type: 'skills',
      title: 'SKILLS',
      content: 'LEAN Manufacturing: Root Cause Analysis, Project Scheduling, Process Modeling, Design of Experiments\nCAD Software: Creo, SolidWorks, NX, Catia\nAutomation Software: LabVIEW, MATLAB, C++\nPrecision Alignment Systems',
      editable: true,
      position: { x: 50, y: 490, width: 500, height: 120 },
      fontSize: 16,
      fontWeight: 'normal',
      color: '#374151',
      alignment: 'left'
    }
  ]);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  useEffect(() => {
    loadTemplateContent();
  }, [templateId]);

  useEffect(() => {
    if (canvasRef.current && !loading) {
      drawResume();
    }
  }, [resumeSections, loading, isEditing]);

  const loadTemplateContent = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/templates/${templateId}/content`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to load template');
      
      const data = await response.json();
      
      if (data.pdfBinary) {
        setPdfBinary(data.pdfBinary);
        
        // Convert base64 to blob URL for PDF display
        try {
          const byteCharacters = atob(data.pdfBinary);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          setPdfUrl(url);
        } catch (pdfErr) {
          console.error('Error processing PDF:', pdfErr);
          setError('Error processing PDF content');
        }
      } else {
        const textContent = data.content || 'No content available';
        setContent(textContent);
        setEditableContent(textContent);
      }
      
    } catch (err) {
      console.error('Error loading template:', err);
      setError('Failed to load template content');
    } finally {
      setLoading(false);
    }
  };

  const drawResume = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines for professional look
    ctx.strokeStyle = '#f3f4f6';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw each section with EXACT positioning and styling
    resumeSections.forEach(section => {
      const { x, y, width, height } = section.position;
      
      // Draw section background if editing
      if (isEditing) {
        if (editingSection === section.id) {
          ctx.fillStyle = '#dbeafe';
          ctx.fillRect(x - 5, y - 5, width + 10, height + 10);
        } else if (hoveredSection === section.id) {
          ctx.fillStyle = '#f3f4f6';
          ctx.fillRect(x - 5, y - 5, width + 10, height + 10);
        }
      }

      // Draw section border if editing
      if (isEditing) {
        ctx.strokeStyle = editingSection === section.id ? '#3b82f6' : '#d1d5db';
        ctx.lineWidth = editingSection === section.id ? 2 : 1;
        ctx.strokeRect(x - 5, y - 5, width + 10, height + 10);
      }

      // Draw section title if it has one
      if (section.title !== 'Name' && section.title !== 'Title' && section.title !== 'Contact') {
        ctx.fillStyle = '#1f2937';
        ctx.font = `bold 18px Arial`;
        ctx.fillText(section.title, x, y - 10);
      }

      // Draw section content with EXACT styling
      ctx.fillStyle = section.color;
      ctx.font = `${section.fontWeight} ${section.fontSize}px Arial`;
      ctx.textAlign = section.alignment as CanvasTextAlign;
      
      // Handle multi-line text
      const lines = section.content.split('\n');
      lines.forEach((line, index) => {
        const lineY = y + (index * (section.fontSize + 4));
        if (lineY < canvas.height) {
          ctx.fillText(line, x, lineY);
        }
      });
    });
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isEditing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Find clicked section
    const clickedSection = resumeSections.find(section => {
      const { x: sx, y: sy, width, height } = section.position;
      return x >= sx - 5 && x <= sx + width + 5 && y >= sy - 5 && y <= sy + height + 5;
    });

    if (clickedSection) {
      setEditingSection(clickedSection.id);
    }
  };

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isEditing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Find hovered section
    const hovered = resumeSections.find(section => {
      const { x: sx, y: sy, width, height } = section.position;
      return x >= sx - 5 && x <= sx + width + 5 && y >= sy - 5 && y <= sy + height + 5;
    });

    setHoveredSection(hovered?.id || null);
  };

  const handleSave = () => {
    const fullContent = resumeSections.map(section => `${section.title}\n${section.content}`).join('\n\n');
    onSave(fullContent);
    setIsEditing(false);
  };

  const handleEditStart = () => {
    setIsEditing(true);
  };

  const handleSectionEdit = (sectionId: string) => {
    setEditingSection(sectionId);
  };

  const handleSectionSave = (sectionId: string, newContent: string) => {
    setResumeSections(prev => prev.map(section => 
      section.id === sectionId ? { ...section, content: newContent } : section
    ));
    setEditingSection(null);
  };

  const handleSectionCancel = () => {
    setEditingSection(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-xl">Loading template editor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-6 text-lg">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-screen">
      {/* Header Controls - LARGER */}
      <div className="flex items-center justify-between mb-6 p-6 bg-white border-b shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Edit Template: {templateName}</h2>
          <p className="text-lg text-gray-600 mt-2">
            {isEditing ? 'Click directly on text areas to edit - EXACT visual matching' : 'Pixel-perfect resume editing with visual fidelity'}
          </p>
        </div>
        
        <div className="flex gap-4">
          <Button onClick={onPreview} className="px-6 py-3 text-lg font-semibold bg-purple-500 hover:bg-purple-600">
            Preview
          </Button>
          
          {!isEditing ? (
            <Button onClick={handleEditStart} className="px-6 py-3 text-lg font-semibold bg-orange-500 hover:bg-orange-600">
              Start Editing
            </Button>
          ) : (
            <>
              <Button onClick={() => setIsEditing(false)} className="px-6 py-3 text-lg font-semibold bg-gray-500 hover:bg-gray-600">
                Exit Editing
              </Button>
              <Button onClick={handleSave} className="px-6 py-3 text-lg font-semibold bg-green-500 hover:bg-green-600">
                Save All Changes
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Editor Area - LARGER */}
      <div className="flex-1 flex gap-6 p-6">
        {/* Original Template Panel - MUCH LARGER */}
        <Card className="flex-1 p-6 shadow-xl">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Original Template</h3>
          <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white">
            {pdfUrl ? (
              <iframe
                src={pdfUrl}
                className="w-full h-[800px] border-0"
                title="Original Template PDF"
                style={{ minHeight: '800px' }}
              />
            ) : (
              <div className="p-6 h-[800px] overflow-auto bg-gray-50">
                <pre className="whitespace-pre-wrap text-base font-mono">{content}</pre>
              </div>
            )}
          </div>
        </Card>

        {/* Pixel-Perfect Editable Resume */}
        <Card className="flex-1 p-6 shadow-xl">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            {isEditing ? 'Click Text to Edit - EXACT Visual Match' : 'Resume Preview'}
          </h3>
          
          <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white">
            <canvas
              ref={canvasRef}
              width={600}
              height={800}
              className="w-full h-[800px] cursor-pointer"
              onClick={handleCanvasClick}
              onMouseMove={handleCanvasMouseMove}
              style={{ 
                minHeight: '800px',
                cursor: isEditing ? 'pointer' : 'default'
              }}
            />
          </div>

          {/* Section Editor Overlay */}
          {editingSection && (
            <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-3">
                Editing: {resumeSections.find(s => s.id === editingSection)?.title}
              </h4>
              <textarea
                value={resumeSections.find(s => s.id === editingSection)?.content || ''}
                onChange={(e) => {
                  setResumeSections(prev => prev.map(section => 
                    section.id === editingSection ? { ...section, content: e.target.value } : section
                  ));
                }}
                className="w-full h-32 p-3 border border-blue-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Edit this section..."
              />
              <div className="flex gap-2 mt-3">
                <Button 
                  onClick={() => handleSectionSave(editingSection, resumeSections.find(s => s.id === editingSection)?.content || '')}
                  className="px-4 py-2 text-sm bg-green-500 hover:bg-green-600"
                >
                  Save Section
                </Button>
                <Button 
                  onClick={handleSectionCancel}
                  className="px-4 py-2 text-sm bg-gray-500 hover:bg-gray-600"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
          
          {!isEditing && (
            <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <p className="text-base text-blue-800">
                💡 <strong>Tip:</strong> Click "Start Editing" to edit text directly on the resume with pixel-perfect precision!
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Status Bar - LARGER */}
      <div className="p-4 bg-gray-50 border-t text-base text-gray-600">
        <div className="flex items-center justify-between">
          <span className="font-medium">
            {isEditing ? '🖊️ Edit Mode Active' : '👁️ View Mode'}
            {editingSection && ` | Editing: ${resumeSections.find(s => s.id === editingSection)?.title}`}
            {hoveredSection && isEditing && ` | Hovering: ${resumeSections.find(s => s.id === hoveredSection)?.title}`}
          </span>
          <span className="font-medium">
            Template: {templateName} | 
            Sections: {resumeSections.length} | 
            Content Type: {pdfUrl ? 'PDF' : 'Text'} |
            Canvas: 600x800px
          </span>
        </div>
      </div>
    </div>
  );
};

export default TemplateEditor;
