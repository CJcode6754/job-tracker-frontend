import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';

export default function About() {
  return (
    <div className="flex flex-col h-screen bg-base-200">
      <Navbar />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
        {/* Header Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">About HireSight</h1>
          <p className="text-base-content/70 text-lg max-w-2xl mx-auto">
            A comprehensive tool designed to help professionals organize, analyze, and optimize their job search process.
          </p>
        </div>

        {/* Developer Info */}
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-2">The Developer</h2>
            <p className="text-base-content/80 leading-relaxed">
              Hi, I'm <span className="font-semibold text-primary">Ceejay Ibabiosa</span>. I built HireSight to solve the chaos of managing multiple job applications across different platforms. My goal was to create a clean, intuitive, and powerful dashboard that gives job seekers full control and visibility over their career progression.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-4 px-1">Core Features</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="card bg-base-100 shadow-sm border border-base-200">
              <div className="card-body p-6">
                <h3 className="font-semibold text-lg mb-2">Kanban Board</h3>
                <p className="text-sm text-base-content/70">
                  Visually manage your applications with an intuitive drag-and-drop interface. Easily move opportunities from "Applied" to "Interviewing" and eventually to "Offer".
                </p>
              </div>
            </div>
            
            <div className="card bg-base-100 shadow-sm border border-base-200">
              <div className="card-body p-6">
                <h3 className="font-semibold text-lg mb-2">Dashboard & Analytics</h3>
                <p className="text-sm text-base-content/70">
                  Gain visual insights into your job search performance. Track application statuses, monitor success rates, and identify areas for improvement over time.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-sm border border-base-200">
              <div className="card-body p-6">
                <h3 className="font-semibold text-lg mb-2">AI Integration</h3>
                <p className="text-sm text-base-content/70">
                  Leverage artificial intelligence to generate tailored cover letters, extract actionable insights from your data, and accurately tag job descriptions.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-sm border border-base-200">
              <div className="card-body p-6">
                <h3 className="font-semibold text-lg mb-2">Secure Authentication</h3>
                <p className="text-sm text-base-content/70">
                  Built with robust security in mind. Features secure user authentication and data protection powered by Laravel Sanctum.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Technology Stack</h2>
            <div className="flex flex-wrap gap-2">
              {['React', 'TypeScript', 'Zustand', 'Tailwind CSS', 'DaisyUI', 'Laravel 12', 'Sanctum', 'MySQL'].map((tech) => (
                <span key={tech} className="badge badge-primary badge-outline badge-lg">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
        </div>
      </div>
    </div>
  );
}
