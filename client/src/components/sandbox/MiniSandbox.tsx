import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, ContactShadows, OrbitControls } from "@react-three/drei";
import PhysicsWindTurbine from "./PhysicsWindTurbine";
import Arm from "./Arm";
import { Play } from "lucide-react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-[#fafafa] text-[#171717]">
          <div className="p-6 max-w-sm text-center">
            <div className="text-[14px] font-medium mb-2 text-[#ee0000]">3D Simulation Crashed</div>
            <div className="text-[12px] font-mono text-[#888888]">{this.state.error.message}</div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function MiniSandbox() {
  const [windSpeed, setWindSpeed] = useState(25);
  const [baseAngle, setBaseAngle] = useState(0);
  const [activeTab, setActiveTab] = useState("turbine");

  return (
    <div className="w-full h-full flex flex-col bg-[#ffffff] rounded-[8px] overflow-hidden text-[#171717] shadow-[0_1px_1px_rgba(0,0,0,0.02),0_2px_2px_rgba(0,0,0,0.04)] font-sans relative">
      
      {/* Header - Vercel clean style */}
      <div className="h-[52px] border-b border-[#ebebeb] flex items-center justify-between px-4 bg-[#ffffff]">
        <div className="flex items-center gap-2 p-1 bg-[#fafafa] border border-[#ebebeb] rounded-md">
          <button 
            onClick={() => setActiveTab("turbine")}
            className={`px-3 py-1 font-medium rounded text-[13px] transition-colors ${activeTab === "turbine" ? "bg-[#ffffff] text-[#171717] shadow-[0_1px_2px_rgba(0,0,0,0.06)]" : "text-[#888888] hover:text-[#171717]"}`}
          >
            Wind Turbine
          </button>
          <button 
            onClick={() => setActiveTab("arm")}
            className={`px-3 py-1 font-medium rounded text-[13px] transition-colors ${activeTab === "arm" ? "bg-[#ffffff] text-[#171717] shadow-[0_1px_2px_rgba(0,0,0,0.06)]" : "text-[#888888] hover:text-[#171717]"}`}
          >
            Robot Arm
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#ebebeb] text-[#171717] text-[13px] font-medium hover:bg-[#fafafa] transition-colors">
            <Play className="h-3.5 w-3.5" /> Auto-Demo
          </button>
          <div className="flex items-center gap-2 text-[#0070f3] text-[11px] font-semibold tracking-wide uppercase px-2 py-1 rounded bg-[#d3e5ff]/50">
            <div className="h-1.5 w-1.5 rounded-full bg-[#0070f3] animate-pulse"></div> Live Sync
          </div>
        </div>
      </div>
      
      {/* 3D Viewport - Light Mode Background */}
      <div className="flex-1 bg-[#fafafa] relative flex items-center justify-center overflow-hidden min-h-[400px]">
        {/* Subtle dot pattern grid */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:16px_16px]"></div>
        
        <ErrorBoundary>
          <Canvas 
            shadows 
            camera={{ position: activeTab === "turbine" ? [10, 8, 16] : [6, 4, 8], fov: 35 }}
          >
            {/* Adjusted lighting for light mode */}
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 20, 10]} intensity={1.8} castShadow shadow-bias={-0.0001} />
            {activeTab === "turbine" ? (
               <PhysicsWindTurbine params={{ Wind_Speed: windSpeed }} />
            ) : (
               <Arm params={{ Arm_Base_Yaw: baseAngle }} />
            )}
            <ContactShadows position={[0, -0.01, 0]} opacity={0.3} scale={20} blur={2.5} far={10} color="#000000" />
            <Environment preset="city" />
            <OrbitControls target={activeTab === "turbine" ? [0, 6, 0] : [0, 2, 0]} enablePan={false} maxPolarAngle={Math.PI / 2 + 0.1} />
          </Canvas>
        </ErrorBoundary>
      </div>

      {/* Teacher Whiteboard Overlay Button (Floating) */}
      <div className="absolute bottom-[90px] left-1/2 -translate-x-1/2 z-20">
        <button 
          onClick={() => alert('Teacher Whiteboard Opened')}
          className="bg-[#171717] text-white px-6 py-2.5 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.15)] text-[14px] font-medium hover:bg-[#333333] transition-colors"
        >
          Open Teacher Whiteboard
        </button>
      </div>

      {/* Controls - Vercel clean footer */}
      <div className="bg-[#ffffff] p-5 border-t border-[#ebebeb] z-10 relative">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[12px] text-[#888888] font-mono tracking-wide uppercase">
            {activeTab === "turbine" ? "Wind Speed (Simulation)" : "Base Yaw Angle (Arm)"}
          </div>
          <div className="text-[13px] font-semibold text-[#171717] font-mono bg-[#fafafa] px-2 py-1 rounded border border-[#ebebeb]">
            {activeTab === "turbine" ? `${windSpeed} m/s` : `${baseAngle}°`}
          </div>
        </div>
        
        {/* Precise slider design */}
        <div className="relative w-full h-1.5 bg-[#ebebeb] rounded-full mb-1 group">
          {activeTab === "turbine" ? (
            <input
              type="range"
              min="0"
              max="100"
              value={windSpeed}
              onChange={(e) => setWindSpeed(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
          ) : (
            <input
              type="range"
              min="-180"
              max="180"
              value={baseAngle}
              onChange={(e) => setBaseAngle(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
          )}
          {/* Active track */}
          <div 
            className="absolute top-0 left-0 h-full bg-[#171717] rounded-full pointer-events-none" 
            style={{ width: activeTab === "turbine" ? `${windSpeed}%` : `${((baseAngle + 180) / 360) * 100}%` }}
          ></div>
          {/* Slider thumb */}
          <div 
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#ffffff] border-2 border-[#171717] rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.1)] pointer-events-none transition-transform group-hover:scale-110" 
            style={{ left: activeTab === "turbine" ? `${windSpeed}%` : `${((baseAngle + 180) / 360) * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2">
            <span className="text-[11px] text-[#a1a1a1] font-mono">{activeTab === "turbine" ? "0" : "-180"}</span>
            <span className="text-[11px] text-[#a1a1a1] font-mono">{activeTab === "turbine" ? "100" : "180"}</span>
        </div>
      </div>
    </div>
  );
}
