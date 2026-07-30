import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowRight, CheckCircle2, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FirebaseAuthDialog } from "@/components/auth/firebase-auth-dialog";
import { useFirebaseAuth } from "@/contexts/firebase-auth-context";

// ─── SAT Wordmark Logo ───
function SATLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex items-center justify-center h-7 w-7 rounded-[6px] bg-[#171717] relative overflow-hidden">
        <span className="text-white font-bold text-[13px] tracking-[-0.5px] leading-none">S</span>
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/20"></div>
      </div>
      <span className="text-[15px] font-semibold tracking-[-0.4px] text-[#171717]">
        ScreenAware<span className="text-[#888888] font-medium">Tutor</span>
      </span>
    </div>
  );
}

// ─── Pandi Mascot Component ───
function PandiMascot({ pose }: { pose: "reading" | "manager" | "whiteboard" | "teamwork" }) {
  return (
    <div className="w-full h-48 flex items-center justify-center relative bg-white border-b border-[#ebebeb]">
      {/* Circle backdrop matching the clean background */}
      <div className="absolute h-36 w-36 rounded-full bg-[#f5f5f5] border border-[#ebebeb] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:8px_8px]"></div>
      </div>
      <video
        key={pose}
        src={`/pandi/pandi-pandi-${pose}.webm`}
        autoPlay
        loop
        muted
        playsInline
        className="w-36 h-36 object-contain z-10"
        poster={`/pandi/pandi-pandi-${pose}.svg`}
      />
    </div>
  );
}

export default function OnboardingPage() {
  const { currentUser } = useFirebaseAuth();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("student");
  const [classCode, setClassCode] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [, setLocation] = useLocation();

  const handleNext = () => {
    if (step === 1) {
      if (role === "student") {
        setStep(2);
      } else {
        // Teacher skips the class code step
        setStep(3);
      }
    } else if (step === 2) {
      setStep(3);
    } else {
      if (currentUser?.user) {
        setLocation(role === 'student' ? '/student-dashboard' : '/dashboard');
      } else {
        setShowLogin(true);
      }
    }
  };

  const handleBack = () => {
    if (step === 3 && role === "teacher") {
      setStep(1);
    } else {
      setStep(step - 1);
    }
  };

  if (showLogin) {
    return <FirebaseAuthDialog />;
  }

  // Determine which Pandi pose to show based on step and selected role
  const getPandiPose = () => {
    if (step === 1) {
      return role === "student" ? "reading" : "manager";
    }
    if (step === 2) {
      return "whiteboard";
    }
    return "teamwork";
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-4 relative font-sans text-[#171717] overflow-x-hidden selection:bg-[#171717] selection:text-white">
      
      {/* ─── Grid Background ─── */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="w-full max-w-[420px] relative z-10 flex flex-col items-center">
        
        {/* Header Logo */}
        <Link href="/">
          <div className="flex items-center justify-center mb-8 cursor-pointer hover:opacity-85 transition-opacity">
            <SATLogo />
          </div>
        </Link>

        {/* Onboarding Card */}
        <div className="w-full bg-white border border-[#ebebeb] shadow-[0_2px_4px_rgba(0,0,0,0.02),0_12px_24px_rgba(0,0,0,0.04)] rounded-[12px] overflow-hidden flex flex-col min-h-[460px]">
          
          {/* Top Mascot Area */}
          <PandiMascot pose={getPandiPose()} />

          <div className="flex-1 flex flex-col p-6">
            {/* Step Indicators */}
            <div className="flex gap-1 mb-6">
              <div className={`h-1 rounded-full flex-1 transition-all duration-300 ${step >= 1 ? 'bg-[#171717]' : 'bg-[#ebebeb]'}`} />
              <div className={`h-1 rounded-full flex-1 transition-all duration-300 ${step >= 2 ? 'bg-[#171717]' : 'bg-[#ebebeb]'}`} />
              <div className={`h-1 rounded-full flex-1 transition-all duration-300 ${step >= 3 ? 'bg-[#171717]' : 'bg-[#ebebeb]'}`} />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col"
              >
                {/* Step 1: Role Selection */}
                {step === 1 && (
                  <div className="flex-1 flex flex-col">
                    <h2 className="text-[20px] font-semibold tracking-[-0.5px] mb-1.5">Choose your role</h2>
                    <p className="text-[#888888] text-[13px] mb-5">Select how you'll be using ScreenAwareTutor.</p>
                    
                    <RadioGroup value={role} onValueChange={setRole} className="space-y-2.5">
                      <div>
                        <RadioGroupItem value="student" id="student" className="peer sr-only" />
                        <Label
                          htmlFor="student"
                          className="flex items-center gap-3.5 rounded-[8px] border border-[#ebebeb] bg-white p-3.5 hover:bg-[#fafafa] peer-data-[state=checked]:border-[#171717] peer-data-[state=checked]:bg-[#fafafa] cursor-pointer transition-all flex-row w-full justify-between"
                        >
                          <div className="flex flex-col text-left">
                            <span className="font-semibold text-[14px]">I'm a Student</span>
                            <span className="text-[12px] text-[#888888] font-normal mt-0.5">Join classes and learn interactively</span>
                          </div>
                          <div className="h-4 w-4 rounded-full border border-[#ebebeb] flex items-center justify-center peer-data-[state=checked]:border-[#171717]">
                            <div className="h-2 w-2 rounded-full bg-[#171717] scale-0 transition-transform peer-data-[state=checked]:scale-100" />
                          </div>
                        </Label>
                      </div>

                      <div>
                        <RadioGroupItem value="teacher" id="teacher" className="peer sr-only" />
                        <Label
                          htmlFor="teacher"
                          className="flex items-center gap-3.5 rounded-[8px] border border-[#ebebeb] bg-white p-3.5 hover:bg-[#fafafa] peer-data-[state=checked]:border-[#171717] peer-data-[state=checked]:bg-[#fafafa] cursor-pointer transition-all flex-row w-full justify-between"
                        >
                          <div className="flex flex-col text-left">
                            <span className="font-semibold text-[14px]">I'm a Teacher</span>
                            <span className="text-[12px] text-[#888888] font-normal mt-0.5">Host sessions and monitor heatmaps</span>
                          </div>
                          <div className="h-4 w-4 rounded-full border border-[#ebebeb] flex items-center justify-center peer-data-[state=checked]:border-[#171717]">
                            <div className="h-2 w-2 rounded-full bg-[#171717] scale-0 transition-transform peer-data-[state=checked]:scale-100" />
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}

                {/* Step 2: Class Code */}
                {step === 2 && (
                  <div className="flex-1 flex flex-col text-left">
                    <h2 className="text-[20px] font-semibold tracking-[-0.5px] mb-1.5">Enter Class Code</h2>
                    <p className="text-[#888888] text-[13px] mb-5">Connect with your teacher to sync your progress.</p>
                    
                    <div className="space-y-2">
                      <Label htmlFor="code" className="text-[12px] font-semibold tracking-wide uppercase text-[#888888]">Classroom Code (Optional)</Label>
                      <Input 
                        id="code" 
                        placeholder="e.g. PHYS-101" 
                        className="bg-white border-[#ebebeb] h-[40px] text-[16px] uppercase font-mono rounded-[6px] focus-visible:ring-1 focus-visible:ring-[#171717] focus-visible:border-[#171717]"
                        value={classCode}
                        onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                      />
                    </div>
                    <div className="p-3 rounded-[8px] bg-[#fafafa] border border-[#ebebeb] text-[#888888] text-[12px] flex items-start gap-2.5 mt-5">
                      <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-[#171717]" />
                      <p className="leading-relaxed">This automatically routes your 3D physics logs and quiz performance directly to your teacher's dashboard.</p>
                    </div>
                  </div>
                )}

                {/* Step 3: Confirmation */}
                {step === 3 && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
                    <h2 className="text-[20px] font-semibold tracking-[-0.5px] mb-1.5">Ready to {role === 'teacher' ? 'teach' : 'learn'}</h2>
                    <p className="text-[#888888] text-[13px] max-w-[280px]">
                      Create your credentials to save your customized 3D models and study history.
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Footer Buttons */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-[#ebebeb]">
              {step > 1 ? (
                <button 
                  onClick={handleBack} 
                  className="flex items-center gap-1.5 text-[14px] font-medium text-[#888888] hover:text-[#171717] transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back
                </button>
              ) : (
                <div />
              )}
              <Button 
                onClick={handleNext} 
                className="bg-[#171717] hover:bg-[#333333] text-white rounded-full px-5 h-9 text-[14px] font-medium shadow-sm transition-transform active:scale-[0.98] flex items-center gap-1.5 ml-auto"
              >
                {step === 3 ? (currentUser?.user ? "Go to Dashboard" : "Create Account") : "Continue"} 
                {step !== 3 && <ArrowRight className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
