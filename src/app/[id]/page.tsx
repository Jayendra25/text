"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Save, AlertCircle, Home, Check } from "lucide-react";
import Link from "next/link";

export default function TextEditorPage() {
  const params = useParams();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchText = async () => {
      try {
        const res = await fetch(`/api/texts/${params.id}`);
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || "Text not found");
        
        setContent(data.text.content);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchText();
  }, [params.id]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSaved(false);
    
    try {
      const res = await fetch(`/api/texts/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save text");
      
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl text-center max-w-md w-full"
        >
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Oops!</h2>
          <p className="text-red-200 mb-8">{error}</p>
          <Link href="/" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl font-medium transition-colors">
            <Home className="w-4 h-4" /> Go back home
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30 overflow-hidden relative flex flex-col items-center justify-center p-4 sm:p-8 font-sans">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-fuchsia-600/20 blur-[120px] pointer-events-none" />
      
      <main className="w-full max-w-5xl relative z-10 flex flex-col h-[85vh]">
        <div className="flex items-center justify-between mb-6">
           <Link href="/" className="text-white/50 hover:text-white transition-colors flex items-center gap-2 font-medium">
             <Home className="w-4 h-4" /> Home
           </Link>
           <button
             onClick={handleSave}
             disabled={saving}
             className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white px-6 py-2 rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(79,70,229,0.2)] flex items-center gap-2"
           >
             {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
             {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
           </button>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 bg-white/[0.03] border border-white/10 p-1 rounded-3xl backdrop-blur-xl shadow-2xl flex flex-col relative"
        >
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 w-full bg-transparent resize-none p-6 text-white/90 focus:outline-none placeholder:text-white/20 font-mono text-base transition-colors rounded-3xl"
          />
        </motion.div>
      </main>
    </div>
  );
}
