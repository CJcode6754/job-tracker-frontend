import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';

export default function About() {
  return (
    <div className="flex flex-col h-screen bg-base-300">
      <Navbar />
      <div className="flex-1 overflow-y-auto relative">
        {/* Decorative background blur */}
        <div className="absolute top-[-10%] right-[-10%] w-[30%] h-[30%] bg-primary/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-secondary/10 blur-[100px] rounded-full" />

        <div className="max-w-4xl mx-auto py-12 px-6 sm:px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-16"
          >
            {/* Header Section */}
            <div className="text-center space-y-6">
              <h1 className="text-6xl font-black tracking-tighter">About <span className="text-primary">HireSight</span></h1>
              <p className="text-base-content/50 text-xl max-w-2xl mx-auto font-medium leading-relaxed">
                The high-performance workspace for elite job seekers. Organize, automate, and dominate your career transition.
              </p>
            </div>

            {/* Developer Story */}
            <div className="group relative bg-base-100 rounded-[2.5rem] p-10 border border-base-content/5 shadow-2xl overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-2xl rounded-full translate-x-10 -translate-y-10" />
               <div className="relative z-10">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-4">Behind the Code</h2>
                  <h3 className="text-3xl font-black mb-6 tracking-tight">The Vision of HireSight</h3>
                  <p className="text-base-content/60 text-lg leading-relaxed font-medium">
                    "Hi, I'm <span className="text-base-content font-black">Ceejay Ibabiosa</span>. I built HireSight to end the chaos of manual job tracking. My mission is to provide job seekers with an enterprise-grade dashboard that offers full visibility and AI-powered insights into their career pipeline."
                  </p>
               </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { t: 'Kanban Engine', d: 'Industrial-strength drag and drop pipeline management.', i: '🎯' },
                { t: 'AI Synthesis', d: 'Gemini 1.5 Pro integration for tailored content & analysis.', i: '🤖' },
                { t: 'Deep Analytics', d: 'Visualize your success rate and bottleneck trends.', i: '📊' },
                { t: 'Fortified Security', d: 'Enterprise-grade encryption and Laravel Sanctum auth.', i: '🛡️' },
              ].map((f) => (
                <div key={f.t} className="p-8 bg-base-100 rounded-3xl border border-base-content/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <span className="text-3xl mb-4 block">{f.i}</span>
                  <h3 className="text-lg font-black tracking-tight mb-2">{f.t}</h3>
                  <p className="text-sm text-base-content/40 leading-relaxed font-medium">{f.d}</p>
                </div>
              ))}
            </div>

            {/* Tech Stack */}
            <div className="text-center space-y-8 pb-12">
               <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-base-content/30">The Modern Stack</h2>
               <div className="flex flex-wrap justify-center gap-4">
                {['React 19', 'TypeScript', 'Zustand', 'Tailwind', 'Laravel 12', 'Gemini AI', 'MySQL'].map((tech) => (
                  <div key={tech} className="bg-base-100 border border-base-content/5 px-6 py-2 rounded-2xl shadow-sm hover:border-primary/20 transition-colors">
                    <span className="text-xs font-black tracking-widest uppercase text-base-content/60">{tech}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Tagline */}
            <div className="text-center opacity-20 py-8 border-t border-base-content/5">
               <p className="text-[10px] font-black uppercase tracking-[0.5em]">Built for the Future of Work</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
