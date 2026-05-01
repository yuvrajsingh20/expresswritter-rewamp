"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  CheckCircle2, Briefcase, FileText, 
  Search, Award, ChevronRight, 
  Upload, Info 
} from 'lucide-react';

const SKILLS_OPTIONS = [
  "SOP", "LOR", "Statement of Purpose", "Letter of Recommendation", 
  "Personal Statement", "Admission Essay", "Resume Writing", 
  "Academic Research", "Technical Writing", "STEM", "Business & Finance"
];

const FreelancerSetupPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    bio: "",
    skills: [],
    experience: "",
    portfolioUrl: ""
  });

  const toggleSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.skills.length === 0) {
      setError("Please select at least one core skill.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/onboard/freelancer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push("/freelancer/dashboard?onboarded=true");
      } else {
        const data = await res.json();
        setError(data.message || "Failed to save profile.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfdfe] text-[#0a192f] p-6 flex items-center justify-center font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl w-full bg-white rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden flex flex-col md:flex-row"
      >
        {/* Progress Sidebar */}
        <div className="md:w-[35%] bg-[#0a192f] p-12 text-white flex flex-col justify-between relative overflow-hidden">
           <div className="z-10">
              <div className="w-12 h-12 bg-white text-[#0a192f] rounded-2xl flex items-center justify-center font-black text-xl mb-12 italic">E</div>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-none mb-8">Writer <br /> Profile <br /> Setup.</h2>
              <div className="space-y-6">
                {[
                  { label: "Credentials", active: true },
                  { label: "Expertise", active: true },
                  { label: "Verification", active: false }
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${step.active ? 'border-blue-400 bg-blue-400/10' : 'border-white/10'}`}>
                      {step.active ? <CheckCircle2 size={14} className="text-blue-400" /> : <span className="text-[10px] font-bold text-white/30">{i+1}</span>}
                    </div>
                    <span className={`text-[11px] font-black uppercase tracking-widest ${step.active ? 'text-white' : 'text-white/20'}`}>{step.label}</span>
                  </div>
                ))}
              </div>
           </div>
           
           <div className="z-10 mt-20 opacity-40">
              <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">Protocol v1.0.4 <br /> Institutional Verification Suite</p>
           </div>
           
           <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px]" />
        </div>

        {/* Form Area */}
        <div className="flex-1 p-10 md:p-16">
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-6">
               <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3 italic">
                 <Briefcase size={20} className="text-blue-600" /> Professional Summary
               </h3>
               <textarea 
                 className="w-full bg-slate-50 border-2 border-transparent p-6 rounded-3xl font-medium text-sm outline-none focus:bg-white focus:border-blue-600 transition-all resize-none shadow-sm"
                 rows={3}
                 placeholder="DESCRIBE YOUR ACADEMIC WRITING BACKGROUND..."
                 value={formData.bio}
                 onChange={(e) => setFormData({...formData, bio: e.target.value})}
               />
            </div>

            <div className="space-y-6">
               <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3 italic">
                 <Award size={24} className="text-blue-600" /> Domain Expertise
               </h3>
               <div className="flex flex-wrap gap-3">
                  {SKILLS_OPTIONS.map(skill => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-6 py-3 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-300 border-2 ${
                        formData.skills.includes(skill) 
                          ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20 rotate-1' 
                          : 'bg-white border-slate-100 text-slate-400 hover:border-blue-600'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-300 ml-4">Years Exp.</label>
                 <input 
                   type="number"
                   className="w-full bg-slate-50 border-2 border-transparent px-8 py-5 rounded-2xl font-black text-sm outline-none focus:bg-white focus:border-blue-600 transition-all"
                   placeholder="E.G. 5"
                   value={formData.experience}
                   onChange={(e) => setFormData({...formData, experience: e.target.value})}
                 />
              </div>
              <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-300 ml-4">Portfolio Link</label>
                 <input 
                   type="url"
                   className="w-full bg-slate-50 border-2 border-transparent px-8 py-5 rounded-2xl font-black text-sm outline-none focus:bg-white focus:border-blue-600 transition-all"
                   placeholder="HTTPS://..."
                   value={formData.portfolioUrl}
                   onChange={(e) => setFormData({...formData, portfolioUrl: e.target.value})}
                 />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black border border-red-100 italic uppercase tracking-widest">
                {error}
              </div>
            )}

            <div className="pt-4 flex items-center justify-between">
               <div className="flex items-center gap-2 text-slate-300">
                  <Info size={14} />
                  <span className="text-[9px] font-black uppercase tracking-tight">System review takes ~24 hours</span>
               </div>
               <button 
                 type="submit"
                 disabled={loading}
                 className="bg-[#0a192f] text-white px-12 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-black transition-all flex items-center gap-4 shadow-2xl shadow-blue-900/10 active:scale-95"
               >
                 {loading ? "INITIALIZING..." : "SUBMIT PORTFOLIO"} <ChevronRight size={16} strokeWidth={4} />
               </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default FreelancerSetupPage;
