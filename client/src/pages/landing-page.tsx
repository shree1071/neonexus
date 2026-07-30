import { Link, useLocation } from "wouter";
import { ArrowRight, Zap, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useFirebaseAuth } from "@/contexts/firebase-auth-context";
import MiniSandbox from "../components/sandbox/MiniSandbox";

/* ─── SAT Wordmark Logo ─── */
function SATLogo() {
  return (
    <div className="flex items-center gap-2.5">
      {/* Clean geometric wordmark — no AI imagery */}
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

export default function LandingPage() {
  const { currentUser } = useFirebaseAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#171717] flex flex-col relative overflow-x-hidden font-sans selection:bg-[#171717] selection:text-white">

      {/* ─── Subtle grid background lines ─── */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.04) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Radial fade — keeps edges from feeling too heavy */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, #fafafa 0%, transparent 70%)",
        }}
      />

      {/* ─── Navbar ─── */}
      <nav className="relative z-10 flex items-center justify-between px-8 h-16 max-w-7xl mx-auto w-full border-b border-[#ebebeb] bg-[#fafafa]/80 backdrop-blur-sm sticky top-0">
        <SATLogo />

        {/* Centre nav links */}
        <div className="hidden md:flex items-center gap-1">
          {["Features", "Pricing", "Blog", "Docs"].map((item) => (
            <button
              key={item}
              className="px-3 py-1.5 text-[14px] text-[#4d4d4d] hover:text-[#171717] hover:bg-[#f5f5f5] rounded-md transition-colors"
            >
              {item}
            </button>
          ))}
        </div>

        {/* Right CTAs */}
        <div className="flex gap-2 items-center">
          {currentUser?.user ? (
            <button
              onClick={() => setLocation("/dashboard")}
              className="px-4 h-8 rounded-md text-[14px] font-medium bg-[#171717] text-white hover:bg-[#333] transition-colors"
            >
              Dashboard →
            </button>
          ) : (
            <>
              <Link href="/onboarding">
                <button className="px-3 h-8 rounded-md text-[14px] font-medium text-[#4d4d4d] hover:text-[#171717] hover:bg-[#f5f5f5] transition-colors">
                  Sign in
                </button>
              </Link>
              <Link href="/onboarding">
                <button className="px-4 h-8 rounded-md text-[14px] font-semibold bg-[#171717] text-white hover:bg-[#333] transition-colors shadow-sm">
                  Get started
                </button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ─── Hero — Two-column split ─── */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-8">

        {/* Split hero */}
        <section className="flex flex-col lg:flex-row items-center gap-12 pt-20 pb-24">

          {/* LEFT — Copy */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex-1 min-w-0 text-left"
          >
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f5f5f5] border border-[#ebebeb] text-[12px] font-medium text-[#4d4d4d] mb-7 font-mono tracking-wide uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0070f3] inline-block"></span>
              Powered by NVIDIA Nemotron
            </div>

            <h1 className="text-[52px] md:text-[64px] font-semibold tracking-[-2.5px] leading-[1.0] text-[#171717] mb-6 max-w-[520px]">
              Never watch a lecture passively again.
            </h1>

            <p className="text-[18px] text-[#4d4d4d] leading-[1.6] max-w-[440px] mb-10">
              ScreenAwareTutor reads your screen in real-time, draws explanations over your videos, and converts notes into live 3D simulations.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 items-start">
              <button
                onClick={() => setLocation("/onboarding")}
                className="group px-6 h-11 rounded-full text-[15px] font-semibold bg-[#171717] text-white hover:bg-[#333] transition-all shadow-[0_1px_2px_rgba(0,0,0,0.1)] flex items-center gap-2"
              >
                Start for free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <button
                onClick={() => alert("Chrome Extension coming soon!")}
                className="px-6 h-11 rounded-full text-[15px] font-semibold bg-white text-[#171717] border border-[#ebebeb] hover:border-[#a1a1a1] hover:bg-[#fafafa] transition-all shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
              >
                Download Extension
              </button>
            </div>

            {/* Social proof strip */}
            <div className="flex items-center gap-4 mt-10 pt-8 border-t border-[#ebebeb]">
              <div className="flex -space-x-2">
                {["#f87171", "#60a5fa", "#4ade80", "#facc15"].map((c, i) => (
                  <div
                    key={i}
                    className="h-7 w-7 rounded-full border-2 border-[#fafafa] flex items-center justify-center text-white text-[10px] font-bold"
                    style={{ backgroundColor: c }}
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <div className="text-[13px] text-[#4d4d4d]">
                <span className="font-semibold text-[#171717]">2,400+</span> students already learning smarter
              </div>
            </div>
          </motion.div>

          {/* RIGHT — Live sandbox */}
          <motion.div
            initial={{ opacity: 0, x: 16, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
            className="flex-1 min-w-0 w-full lg:max-w-[620px] h-[560px] rounded-[12px] overflow-hidden border border-[#ebebeb] shadow-[0_2px_2px_rgba(0,0,0,0.04),0_8px_16px_rgba(0,0,0,0.06)] relative"
          >
            {/* Browser chrome bar */}
            <div className="h-9 bg-[#f5f5f5] border-b border-[#ebebeb] flex items-center px-4 gap-3 shrink-0">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-[#ff5f57]"></div>
                <div className="h-3 w-3 rounded-full bg-[#febc2e]"></div>
                <div className="h-3 w-3 rounded-full bg-[#28c840]"></div>
              </div>
              <div className="flex-1 mx-4 h-5 bg-white rounded border border-[#ebebeb] flex items-center px-2">
                <span className="text-[11px] text-[#888888] font-mono">sat.app/sandbox</span>
              </div>
            </div>
            <div className="h-[calc(100%-36px)]">
              <MiniSandbox />
            </div>
          </motion.div>

        </section>

        {/* ─── Feature Cards ─── */}
        <section className="grid md:grid-cols-3 gap-5 pb-24">
          {[
            {
              icon: <Zap className="h-4 w-4" />,
              title: "Real-time YouTube OCR",
              desc: "Reads math equations directly from your video and draws step-by-step overlays instantly.",
            },
            {
              icon: (
                <svg viewBox="0 0 16 16" className="h-4 w-4 fill-current">
                  <rect x="2" y="2" width="5" height="5" rx="1" />
                  <rect x="9" y="2" width="5" height="5" rx="1" />
                  <rect x="2" y="9" width="5" height="5" rx="1" />
                  <rect x="9" y="9" width="5" height="5" rx="1" />
                </svg>
              ),
              title: "Fulcrum 3D Sandbox",
              desc: "Type any physics concept and immediately launch a breakable 3D simulation.",
            },
            {
              icon: <ShieldCheck className="h-4 w-4" />,
              title: "Confusion Heatmaps",
              desc: "Teachers see exactly which timestamp confused students, enabling targeted help.",
            },
          ].map((f) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="p-6 rounded-[10px] bg-white border border-[#ebebeb] shadow-[0_1px_1px_rgba(0,0,0,0.02),0_2px_2px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-transform duration-200 group"
            >
              <div className="h-8 w-8 rounded-md bg-[#f5f5f5] border border-[#ebebeb] flex items-center justify-center mb-5 text-[#4d4d4d] group-hover:bg-[#171717] group-hover:text-white transition-colors">
                {f.icon}
              </div>
              <h3 className="text-[15px] font-semibold text-[#171717] mb-2 tracking-[-0.3px]">
                {f.title}
              </h3>
              <p className="text-[14px] text-[#4d4d4d] leading-[1.5]">{f.desc}</p>
            </motion.div>
          ))}
        </section>
      </main>

      {/* ─── Footer ─── */}
      <footer className="relative z-10 border-t border-[#ebebeb] bg-[#fafafa] py-7">
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
          <SATLogo />
          <p className="text-[13px] text-[#888888]">
            © {new Date().getFullYear()} ScreenAwareTutor, Inc.
          </p>
          <div className="flex gap-4 text-[13px] text-[#888888]">
            <button className="hover:text-[#171717] transition-colors">Privacy</button>
            <button className="hover:text-[#171717] transition-colors">Terms</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
