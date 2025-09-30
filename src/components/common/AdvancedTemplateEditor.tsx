import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from './Button';
import { Card } from './Card';

interface ContentZone {
  id: string;
  type: string;
  content_type: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  font_info: {
    family: string;
    size: number;
    weight: string;
    style: string;
    color: string;
  };
  editable: boolean;
  original_content: string;
  current_content: string;
}

interface TemplateAnalysis {
  content_zones: ContentZone[];
  layout_info: {
    layout_type: string;
    avg_spacing: number;
    content_flow: string;
    alignment: string;
  };
}

interface AdvancedTemplateEditorProps {
  templateId: number;
  templateName: string;
  onSave: (content: string) => void;
  onPreview: () => void;
}

const AdvancedTemplateEditor: React.FC<AdvancedTemplateEditorProps> = ({
  templateId,
  templateName,
  onSave,
  onPreview
}) => {
  const [templateAnalysis, setTemplateAnalysis] = useState<TemplateAnalysis | null>(null);
  const [contentZones, setContentZones] = useState<ContentZone[]>([]);
  const [editingZone, setEditingZone] = useState<string | null>(null);
  const [zoneContent, setZoneContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<'view' | 'edit'>('view');
  const [templateImage, setTemplateImage] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  
  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  
  // Text editing refs
  const textInputRef = useRef<HTMLInputElement>(null);
  const [editingText, setEditingText] = useState('');
  const [editingZoneData, setEditingZoneData] = useState<ContentZone | null>(null);

  useEffect(() => {
    loadTemplateAnalysis();
  }, [templateId]);

  const loadTemplateAnalysis = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/templates/${templateId}/analyze`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTemplateAnalysis(data);
        setContentZones(data.content_zones || []);
        
        // Initialize zone content with original content
        const initialContent: Record<string, string> = {};
        data.content_zones?.forEach((zone: ContentZone) => {
          initialContent[zone.id] = zone.original_content || '';
        });
        setZoneContent(initialContent);
        
        // Load template PDF
        loadTemplatePDF();
      } else {
        setError('Failed to load template analysis');
      }
    } catch (err) {
      setError('Error loading template analysis');
    } finally {
      setLoading(false);
    }
  };

  const loadTemplatePDF = async () => {
    try {
      const response = await fetch(`/api/templates/${templateId}/content`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.pdfBinary) {
          // Convert base64 to blob URL for template display
          const byteCharacters = atob(data.pdfBinary);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          setPdfUrl(url);
        }
      }
    } catch (err) {
      console.error('Error loading template PDF:', err);
    }
  };

  useEffect(() => {
    if (canvasRef.current && contentZones.length > 0) {
      initializeCanvas();
    }
  }, [contentZones]);

  const initializeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    contextRef.current = ctx;
    
    // Set canvas size - MUCH LARGER for normal appearance
    canvas.width = 1600;  // Increased from 1200
    canvas.height = 2000; // Increased from 1600
    
    // Draw template with zones
    drawTemplateWithZones();
  }, [contentZones]);

  const drawTemplateWithZones = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw template background
    drawTemplateBackground();

    // Draw content zones
    drawContentZones();

    // Draw editing indicators
    if (editingZone) {
      drawEditingIndicators();
    }
  }, [editingZone, zoneContent]);

  const drawTemplateBackground = () => {
    const ctx = contextRef.current;
    if (!ctx) return;

    // Draw a professional template background - MUCH LARGER SIZE
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1600, 2000);
    
    // Add subtle grid lines for professional look
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    for (let i = 0; i < 1600; i += 80) {  // Adjusted spacing for larger canvas
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 2000);
      ctx.stroke();
    }
    for (let i = 0; i < 2000; i += 80) {  // Adjusted spacing for larger canvas
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(1600, i);
      ctx.stroke();
    }
  };

  const drawContentZones = () => {
    const ctx = contextRef.current;
    if (!ctx) return;

    contentZones.forEach((zone) => {
      const { x, y, width, height } = zone.position;
      const content = zoneContent[zone.id] || zone.original_content || '';
      const isEditing = editingZone === zone.id;

      // Draw zone background
      if (isEditing) {
        ctx.fillStyle = 'rgba(255, 165, 0, 0.2)';
        ctx.fillRect(x, y, width, height);
        
        // Draw border
        ctx.strokeStyle = '#ffa500';
        ctx.lineWidth = 3;  // Thicker border for larger canvas
        ctx.strokeRect(x, y, width, height);
      }

      // Draw zone content with proper styling
      drawZoneContent(zone, content, x, y, width, height);
    });
  };

  const drawZoneContent = (zone: ContentZone, content: string, x: number, y: number, width: number, height: number) => {
    const ctx = contextRef.current;
    if (!ctx) return;

    // Set font properties - SCALED UP for much larger canvas
    const fontSize = (zone.font_info.size || 12) * 2.0;  // Scale up fonts more for larger canvas
    const fontFamily = zone.font_info.family || 'Arial';
    const fontWeight = zone.font_info.weight || 'normal';
    const fontStyle = zone.font_info.style || 'normal';
    
    ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = zone.font_info.color || '#000000';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // Handle multi-line text
    const words = content.split(' ');
    let line = '';
    let lineY = y + 12;  // Adjusted padding for larger canvas
    const maxWidth = width - 24;  // Adjusted padding for larger canvas
    const lineHeight = fontSize * 1.4;  // Adjusted line height

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && line !== '') {
        ctx.fillText(line.trim(), x + 12, lineY);
        line = words[i] + ' ';
        lineY += lineHeight;
      } else {
        line = testLine;
      }
    }
    
    // Draw the last line
    if (line.trim()) {
      ctx.fillText(line.trim(), x + 12, lineY);
    }
  };

  const drawEditingIndicators = () => {
    const ctx = contextRef.current;
    if (!ctx) return;

    // Draw editing cursor
    if (editingZoneData) {
      const { x, y, width, height } = editingZoneData.position;
      
      // Draw blinking cursor
      const time = Date.now() % 1000;
      if (time < 500) {
        ctx.strokeStyle = '#ffa500';
        ctx.lineWidth = 4;  // Thicker cursor for much larger canvas
        ctx.beginPath();
        ctx.moveTo(x + 12, y + 12);
        ctx.lineTo(x + 12, y + height - 12);
        ctx.stroke();
      }
    }
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (editMode !== 'edit') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (canvas.height / rect.height);

    // Find clicked zone
    const clickedZone = contentZones.find(zone => {
      const { x: zoneX, y: zoneY, width, height } = zone.position;
      return x >= zoneX && x <= zoneX + width && y >= zoneY && y <= zoneY + height;
    });

    if (clickedZone && clickedZone.editable) {
      startEditingZone(clickedZone);
    }
  };

  const startEditingZone = (zone: ContentZone) => {
    setEditingZone(zone.id);
    setEditingZoneData(zone);
    setEditingText(zoneContent[zone.id] || zone.original_content || '');
    
    // Focus text input
    setTimeout(() => {
      if (textInputRef.current) {
        textInputRef.current.focus();
        textInputRef.current.select();
      }
    }, 100);
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newText = event.target.value;
    setEditingText(newText);
    
    // Update zone content in real-time
    if (editingZone) {
      const updatedContent = { ...zoneContent, [editingZone]: newText };
      setZoneContent(updatedContent);
      
      // Redraw canvas with new content
      setTimeout(() => drawTemplateWithZones(), 50);
    }
  };

  const finishEditing = () => {
    if (editingZone && editingZoneData) {
      // Update final content
      const updatedContent = { ...zoneContent, [editingZone]: editingText };
      setZoneContent(updatedContent);
      
      // Update zone data
      const updatedZones = contentZones.map(zone => 
        zone.id === editingZone 
          ? { ...zone, current_content: editingText }
          : zone
      );
      setContentZones(updatedZones);
    }
    
    setEditingZone(null);
    setEditingZoneData(null);
    setEditingText('');
    
    // Redraw canvas
    setTimeout(() => drawTemplateWithZones(), 100);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      finishEditing();
    } else if (event.key === 'Escape') {
      // Cancel editing, restore original content
      if (editingZone) {
        const originalContent = editingZoneData?.original_content || '';
        setZoneContent({ ...zoneContent, [editingZone]: originalContent });
        setEditingZone(null);
        setEditingZoneData(null);
        setEditingText('');
        setTimeout(() => drawTemplateWithZones(), 100);
      }
    }
  };

  const toggleEditMode = () => {
    setEditMode(editMode === 'view' ? 'edit' : 'view');
    if (editMode === 'edit') {
      // Exit edit mode, finish any active editing
      if (editingZone) {
        finishEditing();
      }
    }
  };

  const saveTemplate = async () => {
    try {
      const contentUpdates = contentZones.map(zone => ({
        zone_id: zone.id,
        content: zoneContent[zone.id] || zone.original_content || '',
        page_num: 0
      }));

      const response = await fetch(`/api/templates/${templateId}/edit-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content_updates: contentUpdates })
      });

      if (response.ok) {
        onSave('Template saved successfully');
      } else {
        setError('Failed to save template');
      }
    } catch (err) {
      setError('Error saving template');
    }
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
          <p className="text-lg text-gray-600 mt-2">Click directly on text areas to edit with real-time preview</p>
        </div>
        
        <div className="flex gap-4">
          <Button
            onClick={toggleEditMode}
            className={`px-6 py-3 text-lg font-semibold ${editMode === 'edit' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-500 hover:bg-blue-600'}`}
          >
            {editMode === 'edit' ? 'Exit Editing' : 'Start Editing'}
          </Button>
          
          {editMode === 'edit' && (
            <Button
              onClick={saveTemplate}
              className="px-6 py-3 text-lg font-semibold bg-green-500 hover:bg-green-600"
            >
              Save Template
            </Button>
          )}
          
          <Button
            onClick={onPreview}
            className="px-6 py-3 text-lg font-semibold bg-purple-500 hover:bg-purple-600"
          >
            Preview
          </Button>
        </div>
      </div>

      {/* Main Editor Area - LARGER */}
      <div className="flex-1 flex gap-6 p-6">
        {/* Canvas Editor - MUCH LARGER */}
        <div className="flex-1 bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="p-6 border-b bg-gray-50">
            <h3 className="text-xl font-semibold text-gray-700">
              {editMode === 'edit' ? 'Click text areas to edit' : 'Template Preview'}
            </h3>
            {editMode === 'edit' && (
              <p className="text-base text-gray-600 mt-2">
                Click on any text area to edit. Press Enter to save, Escape to cancel.
              </p>
            )}
          </div>
          
          <div className="relative p-6">
            {/* PDF Display - FIXED PDF LOADING - MUCH LARGER */}
            {pdfUrl && (
              <div className="mb-8">
                <h4 className="text-xl font-semibold text-gray-700 mb-4">Original Template PDF:</h4>
                <iframe
                  src={pdfUrl}
                  className="w-full h-[800px] border-2 border-gray-300 rounded-lg shadow-lg"
                  title="Original Template"
                  style={{ minHeight: '800px' }}
                />
              </div>
            )}
            
            {/* Canvas Editor */}
            <div className="border-2 border-gray-200 rounded-lg overflow-hidden shadow-lg">
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className="w-full h-auto cursor-pointer"
                style={{ 
                  cursor: editMode === 'edit' ? 'pointer' : 'default',
                  maxHeight: '1600px'  // Much larger height
                }}
              />
              
              {/* Text Input Overlay */}
              {editingZone && editingZoneData && (
                <input
                  ref={textInputRef}
                  type="text"
                  value={editingText}
                  onChange={handleTextChange}
                  onKeyDown={handleKeyDown}
                  onBlur={finishEditing}
                  className="absolute border-3 border-orange-500 bg-white px-4 py-3 text-lg rounded shadow-lg"
                  style={{
                    left: `${editingZoneData.position.x}px`,
                    top: `${editingZoneData.position.y}px`,
                    width: `${editingZoneData.position.width}px`,
                    height: `${editingZoneData.position.height}px`,
                    fontSize: `${(editingZoneData.font_info.size || 12) * 2.0}px`,
                    fontFamily: editingZoneData.font_info.family,
                    fontWeight: editingZoneData.font_info.weight,
                    fontStyle: editingZoneData.font_info.style,
                    color: editingZoneData.font_info.color,
                    zIndex: 1000
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Content Zones Panel - LARGER */}
        <div className="w-96 bg-white rounded-xl shadow-xl p-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-6">Content Zones</h3>
          
          <div className="space-y-4 max-h-[800px] overflow-y-auto">
            {contentZones.map((zone) => (
              <div
                key={zone.id}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  editingZone === zone.id
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => editMode === 'edit' && startEditingZone(zone)}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-base font-medium text-gray-700">
                    {zone.content_type || 'Text Zone'}
                  </span>
                  {zone.editable && (
                    <span className="text-sm px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                      Editable
                    </span>
                  )}
                </div>
                
                <div className="text-base text-gray-600 mb-3">
                  <strong>Content:</strong> {zoneContent[zone.id] || zone.original_content || 'Empty'}
                </div>
                
                <div className="text-sm text-gray-500">
                  <strong>Font:</strong> {zone.font_info.family} {zone.font_info.size}px
                  <br />
                  <strong>Style:</strong> {zone.font_info.weight} {zone.font_info.style}
                  <br />
                  <strong>Color:</strong> {zone.font_info.color}
                </div>
              </div>
            ))}
          </div>
          
          {editMode === 'edit' && (
            <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <p className="text-base text-blue-800">
                💡 <strong>Tip:</strong> Click on any content zone above or directly on the template to edit text in real-time!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Status Bar - LARGER */}
      <div className="p-4 bg-gray-50 border-t text-base text-gray-600">
        <div className="flex items-center justify-between">
          <span className="font-medium">
            {editMode === 'edit' ? '🖊️ Edit Mode Active' : '👁️ View Mode'}
            {editingZone && ` | Editing: ${editingZoneData?.content_type || 'Text Zone'}`}
          </span>
          <span className="font-medium">
            Zones: {contentZones.length} | 
            Editable: {contentZones.filter(z => z.editable).length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AdvancedTemplateEditor;
