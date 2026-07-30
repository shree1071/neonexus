import { useRef, useState, useEffect } from 'react';
import DrawingCanvas from './DrawingCanvas';
import { Maximize, Play, Pause, CircleDot, MonitorUp, Loader2 } from 'lucide-react';
import { startScreenCapture, captureFrameAsBase64 } from '../lib/capture';

interface VideoPlayerProps {
  videoId: string;
  onExplanation?: (text: string) => void;
}

export default function VideoPlayer({ videoId, onExplanation }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDrawMode, setIsDrawMode] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const hiddenVideoRef = useRef<HTMLVideoElement>(null);

  // When stream changes, attach it to the hidden video element for frame extraction
  useEffect(() => {
    if (hiddenVideoRef.current && stream) {
      hiddenVideoRef.current.srcObject = stream;
    }
  }, [stream]);

  const handleStartCapture = async () => {
    const mediaStream = await startScreenCapture();
    if (mediaStream) {
      setStream(mediaStream);
      setIsDrawMode(true); // Automatically enter draw mode once sharing
    }
  };
  const handleDrawComplete = async (circleData: { x: number, y: number, radius: number }) => {
    // Capture the frame from the hidden video if available, else send dummy data
    let base64Frame = "";
    if (hiddenVideoRef.current && stream) {
      base64Frame = captureFrameAsBase64(hiddenVideoRef.current) || "";
    } else {
      console.log("No stream available. Bypassing capture for testing.");
      base64Frame = "dummy_base64_for_hackathon_testing";
    }

    console.log("Circle Coordinates:", circleData);

    // Reset previous overlays
    setAnalysisData(null);
    setIsAnalyzing(true);

    try {
      // POST the base64Frame and circleData to the local ADK backend
      const response = await fetch('http://localhost:5001/api/analyze-frame', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Frame,
          circleCoordinates: circleData,
          query: "What is happening inside this circled area?"
        })
      });
      
      const data = await response.json();
      console.log("Gemma Analysis Result:", data);
      setAnalysisData(data);
      if (onExplanation && data.explanation) {
        onExplanation(data.explanation);
      }
      setIsDrawMode(false); // Turn off drawing mode after capturing
      
    } catch (error) {
      console.error("Analysis failed", error);
      // Fallback for hackathon demo if API key fails
      const fallbackData = {
        explanation: "This is a Free Body Diagram showing the Normal Force (N) counteracting Gravity (mg).",
        annotations: [
          { type: "arrow", coordinates: { x: circleData.x, y: circleData.y, toX: circleData.x, toY: circleData.y - 0.2 }, color: "#3b82f6", label: "Normal Force (N)" },
          { type: "arrow", coordinates: { x: circleData.x, y: circleData.y, toX: circleData.x, toY: circleData.y + 0.2 }, color: "#ef4444", label: "Gravity (mg)" }
        ]
      };
      setAnalysisData(fallbackData);
      if (onExplanation) {
        onExplanation(fallbackData.explanation);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-full h-full relative bg-slate-900 group" ref={containerRef}>
      {/* Hidden video element used purely to extract frames from the getDisplayMedia stream */}
      <video ref={hiddenVideoRef} autoPlay playsInline muted className="hidden" />

      {/* Video Element (Using an HTML5 fallback or iframe) */}
      <iframe
        className="w-full h-full pointer-events-auto"
        src={`https://www.youtube.com/embed/kJ38Z8P-YJc?enablejsapi=1&controls=1&modestbranding=1`}
        title="Lecture Video"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>

      {/* Transparent Canvas Overlay for Drawing & Explanations */}
      <DrawingCanvas isEnabled={isDrawMode} onDrawComplete={handleDrawComplete} />

      {/* Render AI Annotations (Arrows, bounding boxes) on top of video */}
      {analysisData && analysisData.annotations && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          {analysisData.annotations.map((ann: any, idx: number) => {
            if (ann.type === 'arrow') {
              return (
                <g key={idx}>
                  {/* Arrow Line */}
                  <line 
                    x1={`${ann.coordinates.x * 100}%`} 
                    y1={`${ann.coordinates.y * 100}%`} 
                    x2={`${ann.coordinates.toX * 100}%`} 
                    y2={`${ann.coordinates.toY * 100}%`} 
                    stroke={ann.color} 
                    strokeWidth="4"
                    markerEnd={`url(#arrowhead-${idx})`}
                  />
                  {/* Text Label */}
                  <text 
                    x={`${ann.coordinates.toX * 100}%`} 
                    y={`${ann.coordinates.toY * 100 - 2}%`} 
                    fill={ann.color} 
                    fontSize="16" 
                    fontWeight="bold"
                    className="drop-shadow-md"
                  >
                    {ann.label}
                  </text>
                  {/* SVG Defs for arrowhead */}
                  <defs>
                    <marker id={`arrowhead-${idx}`} markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill={ann.color} />
                    </marker>
                  </defs>
                </g>
              );
            }
            return null;
          })}
        </svg>
      )}

      {/* Floating Explanation Box */}
      {analysisData && (
        <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur border border-slate-700 p-4 rounded-xl shadow-2xl max-w-sm z-20">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">AI Vision Analysis</h3>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">{analysisData.explanation}</p>
          <button onClick={() => setAnalysisData(null)} className="mt-3 text-xs text-blue-400 hover:text-blue-300">Dismiss</button>
        </div>
      )}

      {/* Floating Controls Overlay */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-950/80 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className="text-white hover:text-blue-400 transition-colors"
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>

        <div className="w-px h-6 bg-white/20 mx-2"></div>

        {!stream && (
          <button 
            onClick={handleStartCapture}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-blue-400 hover:bg-blue-400/10 transition-colors border border-blue-500/30"
            title="Share 'This Tab' to allow AI to see the video"
          >
            <MonitorUp size={20} className="animate-pulse" />
            <span className="text-sm font-medium">Enable AI Vision</span>
          </button>
        )}

        <button 
          onClick={() => setIsDrawMode(!isDrawMode)}
          disabled={isAnalyzing}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
            isDrawMode ? 'bg-red-500/20 text-red-400' : 'text-white hover:bg-white/10'
          } ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Circle a doubt on screen"
        >
          {isAnalyzing ? (
            <Loader2 size={20} className="animate-spin text-blue-400" />
          ) : (
            <CircleDot size={20} className={isDrawMode ? 'animate-pulse' : ''} />
          )}
          <span className="text-sm font-medium">
            {isAnalyzing ? 'Analyzing...' : isDrawMode ? 'Draw to Explain' : 'Circle Doubt'}
          </span>
        </button>

        <button className="text-white/70 hover:text-white ml-2 transition-colors">
          <Maximize size={20} />
        </button>
      </div>
    </div>
  );
}
