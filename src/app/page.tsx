"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Plus, Loader2, Clock, Sparkles } from "lucide-react";

export default function Home() {
  const [content, setContent] = useState("");
  const [expiryMinutes, setExpiryMinutes] = useState(5);
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!content) {
      setError("Please paste some text first.");
      return;
    }
    const byteSize = new Blob([content]).size;
    if (byteSize > 102400) {
      setError("Text is too large. Maximum 100kb allowed.");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const res = await fetch("/api/texts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, expiryMinutes }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create link");
      
      const generatedLink = `${window.location.origin}/${data.id}`;
      setLink(generatedLink);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setLink("");
    setContent("");
    setExpiryMinutes(5);
    setError("");
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30 overflow-hidden relative flex flex-col items-center justify-center p-4 sm:p-8 font-sans">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-fuchsia-600/20 blur-[120px] pointer-events-none" />
      
      <main className="w-full max-w-4xl relative z-10 flex flex-col gap-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-indigo-300 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Secure, ephemeral text sharing</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent pb-2">
            Share text that self-destructs.
          </h1>
          <p className="text-white/50 text-lg sm:text-xl max-w-2xl mx-auto">
            Paste anything up to 100KB. Get a link. It vanishes when time runs out.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!link ? (
            <motion.div 
              key="editor"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white/[0.03] border border-white/10 p-1 sm:p-2 rounded-3xl backdrop-blur-xl shadow-2xl flex flex-col gap-4"
            >
              <div className="relative rounded-2xl overflow-hidden bg-black/40 border border-white/5 group">
                <textarea
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="Paste your secrets here..."
                  className="w-full h-[40vh] sm:h-[50vh] bg-transparent resize-none p-6 text-white/90 focus:outline-none placeholder:text-white/20 font-mono text-sm sm:text-base transition-colors focus:bg-white/[0.02]"
                />
                
                <div className="absolute bottom-4 right-4 flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                    <Clock className="w-4 h-4 text-white/40" />
                    <span className="text-sm text-white/60">Expires in:</span>
                    <input 
                      type="number" 
                      min="1" 
                      max="10" 
                      value={expiryMinutes}
                      onChange={(e) => setExpiryMinutes(Number(e.target.value))}
                      className="w-12 bg-transparent text-white font-medium focus:outline-none text-center"
                    />
                    <span className="text-sm text-white/60">min</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between px-4 pb-2">
                <div className="text-sm text-red-400/80 font-medium h-5">
                   {error && <motion.span initial={{opacity:0}} animate={{opacity:1}}>{error}</motion.span>}
                </div>
                
                <button
                  onClick={handleSubmit}
                  disabled={loading || !content}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] active:scale-95 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      Create Secret Link
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white/[0.03] border border-white/10 p-8 rounded-3xl backdrop-blur-xl shadow-2xl flex flex-col items-center justify-center text-center gap-6 min-h-[40vh]"
            >
              <div className="w-20 h-20 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-bold">Your link is ready!</h2>
              <p className="text-white/50 text-lg">
                Anyone with this link can view and edit the text. <br/>It will automatically expire in {expiryMinutes} minutes.
              </p>
              
              <div className="flex items-center w-full max-w-lg mt-4 bg-black/40 border border-white/10 p-2 rounded-2xl">
                <input 
                  type="text" 
                  readOnly 
                  value={link} 
                  className="flex-1 bg-transparent px-4 text-white/80 focus:outline-none font-mono text-sm"
                />
                <button 
                  onClick={copyToClipboard}
                  className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl transition-colors flex items-center gap-2 font-medium"
                >
                  {copied ? "Copied!" : <><Copy className="w-4 h-4" /> Copy</>}
                </button>
              </div>

              <div className="mt-8 pt-8 border-t border-white/10 w-full flex justify-center">
                 <button onClick={reset} className="text-white/50 hover:text-white transition-colors flex items-center gap-2 font-medium">
                    <Plus className="w-4 h-4" /> Create another
                 </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
