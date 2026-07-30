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

// ─── Mobile Pandi Mascot Component (Smaller, inline) ───
function PandiMascot({ pose }: { pose: "reading" | "manager" | "whiteboard" | "teamwork" }) {
  return (
    <div className="w-full h-44 flex items-center justify-center relative bg-[#f5f5f5] border-b border-[#ebebeb]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:12px_12px] opacity-40"></div>
      <div className="absolute h-32 w-32 rounded-full bg-white border border-[#ebebeb] flex items-center justify-center overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:6px_6px]"></div>
        <video
          key={pose}
          src={`/pandi/pandi-pandi-${pose}.webm`}
          autoPlay
          loop
          muted
          playsInline
          className="w-28 h-28 object-contain z-10"
          poster={`/pandi/pandi-pandi-${pose}.svg`}
        />
      </div>
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
    <div className="min-h-screen bg-[#fafafa] flex flex-col lg:flex-row relative font-sans text-[#171717] overflow-x-hidden selection:bg-[#171717] selection:text-white">
      
      {/* ─── Grid Background (Universal) ─── */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* ─── LEFT PANEL — Desktop Mascot Column ─── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[50%] bg-[#f5f5f5] border-r border-[#ebebeb] flex-col justify-between p-12 relative overflow-hidden z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none"></div>
        
        {/* Top Logo */}
        <Link href="/">
          <div className="cursor-pointer hover:opacity-85 transition-opacity inline-block">
            <SATLogo />
          </div>
        </Link>

        {/* Center: Large Mascot Circle Frame */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="h-72 w-72 rounded-full bg-white border border-[#ebebeb] flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.02)] relative overflow-hidden mb-10 group"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:10px_10px]"></div>
            <video
              key={getPandiPose()}
              src={`/pandi/pandi-pandi-${getPandiPose()}.webm`}
              autoPlay
              loop
              muted
              playsInline
              className="w-56 h-56 object-contain z-10"
              poster={`/pandi/pandi-pandi-${getPandiPose()}.svg`}
            />
          </motion.div>
          
          <div className="text-center max-w-[340px]">
            <h3 className="text-[22px] font-semibold tracking-[-0.6px] mb-2 text-[#171717]">
              {step === 1 && "Choose your role"}
              {step === 2 && "Enter Class Code"}
              {step === 3 && "You're all set"}
            </h3>
            <p className="text-[#888888] text-[14px] leading-relaxed">
              {step === 1 && "Select how you'll be using ScreenAwareTutor to personalize your experience."}
              {step === 2 && "Join your teacher's session to sync your progress automatically."}
              {step === 3 && "Create an credentials to save your customized 3D models and study history."}
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-[11px] text-[#888888] font-mono tracking-wider uppercase">
          NEONEXUS LABS // STEP {step} OF 3
        </div>
      </div>

      {/* ─── RIGHT PANEL — Onboarding Form Column ─── */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 relative z-10">
        
        {/* Mobile Header Logo */}
        <Link href="/" className="lg:hidden mb-8">
          <div className="cursor-pointer hover:opacity-85 transition-opacity">
            <SATLogo />
          </div>
        </Link>

        {/* Onboarding Card */}
        <div className="w-full max-w-[420px] bg-white border border-[#ebebeb] shadow-[0_2px_4px_rgba(0,0,0,0.02),0_12px_24px_rgba(0,0,0,0.04)] rounded-[12px] overflow-hidden flex flex-col min-h-[380px]">
          
          {/* Mobile Mascot Header */}
          <div className="lg:hidden">
            <PandiMascot pose={getPandiPose()} />
          </div>

          <div className="flex-1 flex flex-col p-8 lg:p-10 justify-between">
            <div>
              {/* Step Indicators */}
              <div className="flex gap-1 mb-8">
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
                      <h2 className="text-[20px] font-semibold tracking-[-0.5px] mb-1.5 lg:hidden">Choose your role</h2>
                      <p className="text-[#888888] text-[13px] mb-5 lg:hidden">Select how you'll be using ScreenAwareTutor.</p>
                      
                      <RadioGroup value={role} onValueChange={setRole} className="space-y-3">
                        <div>
                          <RadioGroupItem value="student" id="student" className="peer sr-only" />
                          <Label
                            htmlFor="student"
                            className="flex items-center gap-3.5 rounded-[8px] border border-[#ebebeb] bg-white p-4 hover:bg-[#fafafa] peer-data-[state=checked]:border-[#171717] peer-data-[state=checked]:bg-[#fafafa] cursor-pointer transition-all flex-row w-full justify-between"
                          >
                            <div className="flex flex-col text-left">
                              <span className="font-semibold text-[14px]">I'm a Student</span>
                              <span className="text-[12px] text-[#888888] font-normal mt-1">Join classes and learn interactively</span>
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
                            className="flex items-center gap-3.5 rounded-[8px] border border-[#ebebeb] bg-white p-4 hover:bg-[#fafafa] peer-data-[state=checked]:border-[#171717] peer-data-[state=checked]:bg-[#fafafa] cursor-pointer transition-all flex-row w-full justify-between"
                          >
                            <div className="flex flex-col text-left">
                              <span className="font-semibold text-[14px]">I'm a Teacher</span>
                              <span className="text-[12px] text-[#888888] font-normal mt-1">Host sessions and monitor heatmaps</span>
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
                      <h2 className="text-[20px] font-semibold tracking-[-0.5px] mb-1.5 lg:hidden">Enter Class Code</h2>
                      <p className="text-[#888888] text-[13px] mb-5 lg:hidden">Connect with your teacher to sync your progress.</p>
                      
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
                      <div className="p-3.5 rounded-[8px] bg-[#fafafa] border border-[#ebebeb] text-[#888888] text-[12px] flex items-start gap-2.5 mt-6">
                        <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-[#171717]" />
                        <p className="leading-relaxed">This automatically routes your 3D physics logs and quiz performance directly to your teacher's dashboard.</p>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Confirmation */}
                  {step === 3 && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
                      <h2 className="text-[20px] font-semibold tracking-[-0.5px] mb-1.5 lg:hidden">Ready to {role === 'teacher' ? 'teach' : 'learn'}</h2>
                      <p className="text-[#888888] text-[14px] max-w-[280px] lg:max-w-none">
                        Create credentials to save your customized 3D models and study history.
                      </p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-[#ebebeb]">
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
                className="bg-[#171717] hover:bg-[#333333] text-white rounded-full px-6 h-10 text-[14px] font-medium shadow-sm transition-transform active:scale-[0.98] flex items-center gap-1.5 ml-auto"
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
