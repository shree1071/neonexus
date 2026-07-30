import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Tldraw, Editor, createShapeId, toRichText } from 'tldraw';
import 'tldraw/tldraw.css';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

function ContentOverlay() {
  const [isDrawMode, setIsDrawMode] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [editor, setEditor] = useState<Editor | null>(null);
  const editorRef = useRef<Editor | null>(null);
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [cachedFileContext, setCachedFileContext] = useState<{uri: string, mimeType: string} | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatPos, setChatPos] = useState({ x: window.innerWidth - 420, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDrawMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setChatPos({
          x: e.clientX - dragOffset.x,
          y: Math.max(0, e.clientY - dragOffset.y) // Prevent dragging above screen
        });
      }
    };
    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const transparentStyles = `
    .tl-theme__light, .tl-theme__dark {
      --color-background: rgba(0, 0, 0, 0) !important;
    }
    .tl-background {
      display: none !important;
    }
    .markdown-body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      font-size: 14px;
    }
    .markdown-body h3 {
      margin-top: 16px;
      margin-bottom: 8px;
    }
  `;

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Speech recognition is not supported in this browser. Please use Chrome.");
      return;
    }
    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setChatInput(prev => prev ? prev + ' ' + transcript : transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const runAnalysis = async (userQuery?: string | React.MouseEvent) => {
    if (!isDrawMode) {
      setIsDrawMode(true);
    }
    setIsAnalyzing(true);
    
    // Check if userQuery is a string (since it could be a React.MouseEvent if called from the button)
    const queryStr = typeof userQuery === 'string' ? userQuery : '';
    
    if (queryStr) {
      setChatHistory(prev => [...prev, { role: 'user', text: queryStr }]);
      setChatInput('');
    }
    
    try {
      const video = document.querySelector('video');
      const timestamp = video ? video.currentTime : 0;
      const title = document.title;

      const payload: any = { 
        query: queryStr || 'Explain the math on the screen.',
        title: title,
        timestamp: timestamp
      };
      
      if (cachedFileContext) {
        payload.cachedFileUri = cachedFileContext.uri;
        payload.cachedMimeType = cachedFileContext.mimeType;
      } else {
        // 1. Get screenshot from background
        const cap = await chrome.runtime.sendMessage({ action: 'capture_screen' });
        if (!cap?.imageBase64) throw new Error('Capture failed');
        
        const img = new Image();
        img.src = 'data:image/jpeg;base64,' + cap.imageBase64;
        await new Promise(resolve => { img.onload = resolve; });
        
        const MAX_WIDTH = 800;
        let imgW = img.width;
        let imgH = img.height;
        if (imgW > MAX_WIDTH) {
          imgH = Math.round(imgH * (MAX_WIDTH / imgW));
          imgW = MAX_WIDTH;
        }
        const offCanvas = document.createElement('canvas');
        offCanvas.width = imgW;
        offCanvas.height = imgH;
        offCanvas.getContext('2d')!.drawImage(img, 0, 0, imgW, imgH);
        const optimizedBase64 = offCanvas.toDataURL('image/jpeg', 0.5).split(',')[1];
        
        payload.imageBase64 = optimizedBase64;
        
        // Extract Spatial Follow-Up Questions from the canvas
        const allShapes = editor ? editor.getCurrentPageShapes() : [];
        const studentQuestions = allShapes
          .filter(s => s.type === 'text' && !s.id.includes(':ai_'))
          .map(s => ({
            text: (s.props as any).text,
            x: Math.round((s.x / window.innerWidth) * 1000),
            y: Math.round((s.y / window.innerHeight) * 1000)
          }));

        if (studentQuestions.length > 0 && !queryStr) {
          payload.query = `The student has written questions on the whiteboard at these 0-1000 coordinates: ${JSON.stringify(studentQuestions)}. Please read them and answer them directly by drawing arrows pointing to the relevant parts of the math problem!`;
        }
        payload.circleCoordinates = { x: 500, y: 500, radius: 100 };
      }

      const resp = await fetch('http://localhost:5001/api/analyze-frame', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await resp.json();
      
      if (data.explanation) {
        setChatHistory(prev => [...prev, { role: 'ai', text: data.explanation }]);
        setIsSidebarOpen(true);
        
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const cleanTextForSpeech = data.explanation.replace(/[$]+/g, '').replace(/[*]+/g, '').replace(/#/g, '');
          const utterance = new SpeechSynthesisUtterance(cleanTextForSpeech);
          utterance.lang = 'en-US';
          utterance.rate = 1.0;
          window.speechSynthesis.speak(utterance);
        }
      }
      if (data.fileUri) {
        setCachedFileContext({ uri: data.fileUri, mimeType: data.mimeType });
      }
      
      chrome.runtime.sendMessage({ action: 'analysis_complete', data });

      // 2. Render AI annotations to Tldraw step-by-step!
      // Use editorRef to get the absolute latest editor instance even if the component hasn't fully flushed the state yet
      let currentEditor: Editor | null = null;
      if (data.annotations) {
        for (let attempt = 0; attempt < 30; attempt++) {
          if (editorRef.current) {
            currentEditor = editorRef.current;
            break;
          }
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
      if (data.annotations && currentEditor) {
        const w = window.innerWidth / 1000;
        const h = window.innerHeight / 1000;
        const validColors = ['black', 'grey', 'light-blue', 'blue', 'violet', 'green', 'light-green', 'yellow', 'orange', 'red', 'light-red', 'white'];
        const aiShapeIds: import('tldraw').TLShapeId[] = [];
        
        for (let i = 0; i < data.annotations.length; i++) {
          const a = data.annotations[i];
          const color = validColors.includes(a.color) ? a.color : 'red';
          const shapeId = createShapeId(`ai_${Date.now()}_${i}`);
          aiShapeIds.push(shapeId);
          
          let sx = 0, sy = 0, ex = 50, ey = 50, sw = 100, sh = 100;
          if (Array.isArray(a.coordinates)) {
            sx = Number(a.coordinates[0]) || 0;
            sy = Number(a.coordinates[1]) || 0;
            ex = Number(a.coordinates[2]) || sx + 50;
            ey = Number(a.coordinates[3]) || sy + 50;
            sw = Math.max(1, ex - sx);
            sh = Math.max(1, ey - sy);
          } else {
            const coords = a.coordinates || {};
            sx = Number(coords.x) || 0;
            sy = Number(coords.y) || 0;
            ex = Number(coords.toX) || (sx + 50);
            ey = Number(coords.toY) || (sy + 50);
            sw = Math.max(1, Number(coords.width ?? coords.w) || 100);
            sh = Math.max(1, Number(coords.height ?? coords.h) || 100);
          }
          const safeLabel = typeof a.label === 'string' ? a.label : String(a.label || '');

          try {
            if (a.type === 'arrow' || a.type === 'line') {
              currentEditor.createShape({
                id: shapeId,
                type: 'arrow',
                x: sx * w,
                y: sy * h,
                props: {
                  start: { x: 0, y: 0 },
                  end: { x: (ex - sx) * w, y: (ey - sy) * h },
                  color: color,
                  arrowheadEnd: a.type === 'arrow' ? 'arrow' : 'none',
                }
              });
              if (safeLabel) {
                const labelId = createShapeId(`ai_${Date.now()}_${i}_label`);
                aiShapeIds.push(labelId);
                currentEditor.createShape({
                  id: labelId,
                  type: 'text',
                  x: (sx + ex) / 2 * w,
                  y: (sy + ey) / 2 * h,
                  props: { richText: toRichText(safeLabel), color: color, size: 's', autoSize: true }
                });
              }
            } else if (a.type === 'box' || a.type === 'highlight') {
              currentEditor.createShape({
                id: shapeId,
                type: 'geo',
                x: sx * w,
                y: sy * h,
                props: {
                  geo: 'rectangle',
                  w: sw * w,
                  h: sh * h,
                  color: color,
                  fill: a.type === 'highlight' ? 'semi' : 'none'
                }
              });
              if (safeLabel) {
                const labelId = createShapeId(`ai_${Date.now()}_${i}_label`);
                aiShapeIds.push(labelId);
                currentEditor.createShape({
                  id: labelId,
                  type: 'text',
                  x: sx * w,
                  y: sy * h - 35,
                  props: { richText: toRichText(safeLabel), color: color, size: 's', autoSize: true }
                });
              }
            } else if (a.type === 'ellipse') {
              currentEditor.createShape({
                id: shapeId,
                type: 'geo',
                x: sx * w,
                y: sy * h,
                props: {
                  geo: 'ellipse',
                  w: sw * w,
                  h: sh * h,
                  color: color
                }
              });
              if (safeLabel) {
                const labelId = createShapeId(`ai_${Date.now()}_${i}_label`);
                aiShapeIds.push(labelId);
                currentEditor.createShape({
                  id: labelId,
                  type: 'text',
                  x: sx * w + (sw * w) / 2 - 20,
                  y: sy * h - 35,
                  props: { richText: toRichText(safeLabel), color: color, size: 's', autoSize: true }
                });
              }
            } else if (a.type === 'text' && safeLabel) {
              currentEditor.createShape({
                id: shapeId,
                type: 'text',
                x: sx * w,
                y: sy * h,
                props: { richText: toRichText(safeLabel), color: color, size: 'm', autoSize: true }
              });
            } else if (a.type === 'note' || a.type === 'sticky') {
              // Sticky note with content text
              const noteText = a.content || safeLabel || '';
              currentEditor.createShape({
                id: shapeId,
                type: 'note',
                x: sx * w,
                y: sy * h,
                props: { 
                  richText: toRichText(noteText),
                  color: color,
                  size: 'm',
                  fontSizeAdjustment: 0
                }
              });
            }
          } catch (shapeError) {
            console.error("Shape creation error for", a, shapeError);
            alert("Error drawing " + a.type + " shape: " + shapeError.message);
          }
          
          await new Promise(resolve => setTimeout(resolve, 400));
        }

        try {
          if (aiShapeIds.length > 1) {
            currentEditor.groupShapes(aiShapeIds);
          }
        } catch (e) {
          console.error("Cleanup error:", e);
        }
      }
      
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <>
      <style>{transparentStyles}</style>
      {isDrawMode && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2147483645, pointerEvents: 'auto', background: 'transparent' }}>
          <Tldraw onMount={(e) => { setEditor(e); editorRef.current = e; }} hideUi={true} />
        </div>
      )}
      
      {isSidebarOpen && (
        <div style={{
          position: 'fixed', left: `${chatPos.x}px`, top: `${chatPos.y}px`, width: '400px', height: '85vh',
          display: 'flex', flexDirection: 'column', background: 'white', color: 'black', 
          borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', zIndex: 2147483647
        }}>
          <div 
            onMouseDown={(e) => {
              setIsDragging(true);
              setDragOffset({ x: e.clientX - chatPos.x, y: e.clientY - chatPos.y });
            }}
            style={{ 
              padding: '15px', borderBottom: '1px solid #ccc', display: 'flex', 
              justifyContent: 'space-between', alignItems: 'center', 
              cursor: isDragging ? 'grabbing' : 'grab', 
              background: '#f8fafc', borderTopLeftRadius: '12px', borderTopRightRadius: '12px',
              userSelect: 'none'
            }}
          >
            <h3 style={{ margin: 0, pointerEvents: 'none' }}>≡ AI Tutor Chat</h3>
            <button onClick={() => setIsSidebarOpen(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '16px' }}>✖</button>
          </div>
          
          <div style={{ padding: '15px', flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {chatHistory.map((msg, idx) => (
              <div key={idx} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '90%' }}>
                {msg.role === 'user' ? (
                  <div style={{ background: '#3b82f6', color: 'white', padding: '10px 14px', borderRadius: '16px', borderBottomRightRadius: '4px' }}>
                    {msg.text}
                  </div>
                ) : (
                  <div className="markdown-body" style={{ background: '#f1f5f9', padding: '10px 14px', borderRadius: '16px', borderBottomLeftRadius: '4px' }}>
                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[[rehypeKatex, { strict: false }]]}>{msg.text}</ReactMarkdown>
                  </div>
                )}
              </div>
            ))}
            {isAnalyzing && (
              <div style={{ alignSelf: 'flex-start', background: '#f1f5f9', padding: '10px 14px', borderRadius: '16px', fontStyle: 'italic', color: '#64748b' }}>
                Analyzing...
              </div>
            )}
          </div>
          
          <form onSubmit={(e) => { e.preventDefault(); if (chatInput.trim()) runAnalysis(chatInput); }} style={{ padding: '15px', borderTop: '1px solid #ccc', display: 'flex', gap: '10px' }}>
            <button 
              type="button" 
              onClick={startListening} 
              disabled={isAnalyzing || isListening}
              style={{ padding: '10px 14px', background: isListening ? '#ef4444' : '#e2e8f0', color: 'black', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              title="Dictate with Voice"
            >
              {isListening ? '🎙️...' : '🎙️'}
            </button>
            <input 
              type="text" value={chatInput} onChange={e => setChatInput(e.target.value)}
              placeholder="Ask a follow-up question..." disabled={isAnalyzing}
              style={{ flexGrow: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ccc', outline: 'none' }}
            />
            <button type="submit" disabled={isAnalyzing || !chatInput.trim()} style={{ padding: '10px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', opacity: (isAnalyzing || !chatInput.trim()) ? 0.5 : 1 }}>
              Send
            </button>
          </form>
        </div>
      )}

      <div style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', zIndex: 2147483647, display: 'flex', gap: '10px' }}>
        <button 
          onClick={() => setIsDrawMode(!isDrawMode)}
          style={{
            padding: '10px 20px', borderRadius: '999px',
            background: isDrawMode ? '#ef4444' : '#1e293b',
            color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
          }}
        >
          {isDrawMode ? 'Close Whiteboard' : 'Open Teacher Whiteboard'}
        </button>

        <button 
            onClick={runAnalysis}
            disabled={isAnalyzing}
            style={{
              padding: '10px 20px', borderRadius: '999px',
              background: '#4ade80', color: 'black', border: 'none', cursor: 'pointer', fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)', opacity: isAnalyzing ? 0.5 : 1
            }}
          >
            {isAnalyzing ? 'Analyzing...' : '🎓 Ask AI Tutor'}
          </button>
      </div>
    </>
  );
}

if (!document.getElementById('sat-react-root')) {
  const rootElement = document.createElement('div');
  rootElement.id = 'sat-react-root';
  document.body.appendChild(rootElement);
  createRoot(rootElement).render(<ContentOverlay />);
}
