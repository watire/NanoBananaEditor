import React from 'react';
import { Editor } from './components/Editor';
import { Layout } from 'lucide-react';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-yellow-400 p-2 rounded-lg text-slate-900">
              <Layout size={20} strokeWidth={2.5} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Nano Banana <span className="text-yellow-500">Studio</span>
            </h1>
          </div>
          <div className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full hidden sm:block">
            Powered by gemini-2.5-flash-image
          </div>
        </div>
      </header>

      <main className="flex-grow bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Editor />
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} Nano Banana Studio. Built with Google GenAI SDK.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;