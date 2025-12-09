import React, { useState, useRef, useEffect } from 'react';
import { generateImageContent } from '../services/geminiService';
import { ImageFile, GeneratedImage, AspectRatio } from '../types';
import { Upload, X, Wand2, Download, Image as ImageIcon, Sparkles, RefreshCw, AlertCircle, History, Trash2, BoxSelect } from 'lucide-react';

const EXAMPLE_PROMPTS = [
  "Add a retro filter",
  "Make it look like a oil painting",
  "Remove the background",
  "Add a cute cat next to the person",
  "Turn this into a cyberpunk scene"
];

// The prompt provided by the user in the request
const CHINESE_PROMPT = "将背景替换为充满科技感的赛博朋克城市街道，霓虹灯闪烁，雨夜氛围，保留前景主体，高画质。";

export const Editor: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [sourceImage, setSourceImage] = useState<ImageFile | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // History State
  const [history, setHistory] = useState<GeneratedImage[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('nano_banana_history');
        return saved ? JSON.parse(saved) : [];
      }
    } catch (e) {
      console.warn("Failed to load history:", e);
    }
    return [];
  });

  // Save history to local storage
  useEffect(() => {
    try {
      localStorage.setItem('nano_banana_history', JSON.stringify(history));
    } catch (e) {
      console.warn("Failed to save history:", e);
    }
  }, [history]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file.');
      return;
    }

    // Reset previous state
    setGeneratedImage(null);
    setError(null);

    // Convert to Base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Extract the raw base64 data (remove "data:image/xxx;base64,")
      const base64Data = base64String.split(',')[1];
      
      setSourceImage({
        file,
        previewUrl: base64String,
        base64: base64Data,
        mimeType: file.type
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSourceImage(null);
    setGeneratedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a text prompt.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const result = await generateImageContent({
        prompt: prompt.trim(),
        base64Image: sourceImage?.base64,
        mimeType: sourceImage?.mimeType,
        aspectRatio: aspectRatio,
      });
      
      setGeneratedImage(result);

      // Add to history
      const newItem: GeneratedImage = {
        url: result,
        prompt: prompt.trim(),
        timestamp: Date.now(),
      };

      setHistory(prev => {
        const newHistory = [newItem, ...prev];
        // Keep only last 10 items to prevent local storage quota issues with base64 images
        return newHistory.slice(0, 10);
      });

    } catch (err: any) {
      setError(err.message || "Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const setChineseExample = () => {
      setPrompt(CHINESE_PROMPT);
  };

  const clearHistory = () => {
    if (confirm("Are you sure you want to clear your history?")) {
        setHistory([]);
        localStorage.removeItem('nano_banana_history');
    }
  };

  const selectHistoryItem = (item: GeneratedImage) => {
    setGeneratedImage(item.url);
    setPrompt(item.prompt);
    // Optionally scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Panel: Controls */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Image Upload Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Upload size={20} className="text-slate-500" />
            Source Image <span className="text-xs font-normal text-slate-400 ml-auto">{sourceImage ? 'Editing Mode' : 'Generation Mode'}</span>
          </h2>

          {!sourceImage ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-yellow-400 hover:bg-yellow-50 transition-colors group h-64"
            >
              <div className="bg-slate-100 p-4 rounded-full mb-4 group-hover:bg-yellow-100 transition-colors">
                <ImageIcon className="text-slate-400 group-hover:text-yellow-600" size={32} />
              </div>
              <p className="text-sm font-medium text-slate-700 text-center">
                Click to upload an image
              </p>
              <p className="text-xs text-slate-400 text-center mt-1">
                JPG, PNG supported
              </p>
              <p className="text-xs text-yellow-600 font-medium text-center mt-4 bg-yellow-100 px-3 py-1 rounded-full">
                Optional: Upload to Edit
              </p>
            </div>
          ) : (
            <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
              <img 
                src={sourceImage.previewUrl} 
                alt="Source" 
                className="w-full h-auto max-h-80 object-contain mx-auto"
              />
              <button 
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500 text-white rounded-full backdrop-blur-sm transition-colors"
                title="Remove image"
              >
                <X size={16} />
              </button>
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*"
          />
        </div>

        {/* Prompt Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
           <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Sparkles size={20} className="text-slate-500" />
                Prompt
            </h2>
            <button 
                onClick={() => setPrompt('')}
                className="text-xs text-slate-400 hover:text-slate-600"
            >
                Clear
            </button>
           </div>
          
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={sourceImage ? "Describe how to edit the image (e.g., 'Add a red hat', 'Make it sketchy')" : "Describe the image you want to generate..."}
            className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none resize-none text-slate-700 placeholder-slate-400 transition-all text-sm"
          />

          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1">
                 <BoxSelect size={14} /> Aspect Ratio
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {(["1:1", "3:4", "4:3", "9:16", "16:9"] as AspectRatio[]).map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`text-xs py-2 rounded-lg transition-all border font-medium
                    ${aspectRatio === ratio
                      ? 'bg-yellow-100 border-yellow-400 text-yellow-800 shadow-sm' 
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
             <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Example Prompts</span>
                <button onClick={setChineseExample} className="text-xs text-blue-500 hover:underline">
                    Try Detailed Example
                </button>
             </div>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_PROMPTS.slice(0, 3).map((p, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(p)}
                  className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg transition-colors border border-slate-200"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt}
            className={`mt-6 w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-semibold text-white transition-all shadow-md
              ${isGenerating || !prompt 
                ? 'bg-slate-300 cursor-not-allowed shadow-none' 
                : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 active:scale-[0.98]'
              }`}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="animate-spin" size={20} />
                Processing...
              </>
            ) : (
              <>
                <Wand2 size={20} />
                {sourceImage ? 'Edit Image' : 'Generate Image'}
              </>
            )}
          </button>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Result & History */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Result Area */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 min-h-[500px] flex flex-col">
          <div className="flex-grow rounded-xl bg-slate-50 border border-slate-200 border-dashed relative overflow-hidden flex items-center justify-center">
            
            {generatedImage ? (
              <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
                 <img 
                  src={generatedImage} 
                  alt="Generated Result" 
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                    <a 
                        href={generatedImage} 
                        download={`nano-banana-${Date.now()}.png`}
                        className="p-2 bg-white/90 hover:bg-white text-slate-700 rounded-lg shadow-sm border border-slate-200 transition-all flex items-center gap-2 text-sm font-medium backdrop-blur-sm"
                    >
                        <Download size={16} />
                        Download
                    </a>
                </div>
              </div>
            ) : (
                <div className="text-center p-12 max-w-md mx-auto">
                    <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Sparkles className="text-yellow-500 opacity-50" size={40} />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-2">Ready to Create</h3>
                    <p className="text-slate-500">
                        Upload an image to start editing, or simply type a prompt to generate something new from scratch using the <span className="font-mono text-yellow-600 bg-yellow-50 px-1 rounded">gemini-2.5-flash-image</span> model.
                    </p>
                </div>
            )}
            
            {isGenerating && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-slate-200 border-t-yellow-500 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Sparkles size={20} className="text-yellow-500 animate-pulse" />
                            </div>
                        </div>
                        <p className="text-slate-600 font-medium animate-pulse">Consulting the AI Alchemist...</p>
                    </div>
                </div>
            )}
          </div>
        </div>

        {/* History Panel */}
        {history.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <History size={20} className="text-slate-500" />
                History
              </h3>
              <button 
                onClick={clearHistory}
                className="text-xs flex items-center gap-1 text-red-500 hover:text-red-600 px-3 py-1.5 rounded-full hover:bg-red-50 transition-colors font-medium"
              >
                <Trash2 size={14} />
                Clear
              </button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {history.map((item) => (
                <div 
                  key={item.timestamp}
                  onClick={() => selectHistoryItem(item)}
                  className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer border border-slate-200 hover:ring-2 hover:ring-yellow-400 transition-all shadow-sm"
                >
                  <img 
                    src={item.url} 
                    alt={item.prompt} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                    <p className="text-white text-xs line-clamp-2 font-medium">{item.prompt}</p>
                    <p className="text-white/60 text-[10px] mt-1">{new Date(item.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};