"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  CheckCircle2, Briefcase, FileText, 
  Search, Award, ChevronRight, 
  Upload, Info, Users, Globe 
} from 'lucide-react';

import servicesData from '@/data/services_data.json';

const SKILLS_OPTIONS = servicesData.categories.map(c => c.name);

const FreelancerSetupPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    bio: "",
    skills: [],
    experience: "",
    portfolioUrl: "",
    name: "",
    phone: "",
    age: "",
    gender: "",
    linkedinUrl: "",
    resumeUrl: ""
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
    <div className="min-h-screen bg-[#09090f] text-[#eefcfb] p-6 flex items-center justify-center font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl w-full bg-[#101019] rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.4)] border border-[#1c1c30] overflow-hidden flex flex-col md:flex-row"
      >
        {/* Progress Sidebar */}
        <div className="md:w-[35%] bg-[#161626] p-12 text-[#eefcfb] flex flex-col justify-between relative overflow-hidden">
           <div className="z-10">
              <div className="w-12 h-12 bg-[#0d9488] text-[#eefcfb] rounded-2xl flex items-center justify-center font-black text-xl mb-12 italic">E</div>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-none mb-8 text-[#eefcfb]">Writer <br /> Profile <br /> Setup.</h2>
              <div className="space-y-6">
                {[
                  { label: "Credentials", active: true },
                  { label: "Expertise", active: true },
                  { label: "Verification", active: false }
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${step.active ? 'border-[#0d9488] bg-[#0d9488]/10' : 'border-[#eefcfb]/10'}`}>
                      {step.active ? <CheckCircle2 size={14} className="text-[#0d9488]" /> : <span className="text-[10px] font-bold text-[#eefcfb]/30">{i+1}</span>}
                    </div>
                    <span className={`text-[11px] font-black uppercase tracking-widest ${step.active ? 'text-[#eefcfb]' : 'text-[#eefcfb]/20'}`}>{step.label}</span>
                  </div>
                ))}
              </div>
           </div>
           
           <div className="z-10 mt-20 opacity-40">
              {/* Decorative elements or text */}
           </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 p-12 overflow-y-auto max-h-[85vh]">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div className="space-y-4">
               <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-3 italic text-[#eefcfb]">
                 <Users size={20} className="text-[#0d9488]" /> Personal Details
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#6b9e9a]">Full Name</label>
                    <input 
                      type="text"
                      className="w-full bg-[#1c1c30] border-2 border-transparent px-6 py-3 rounded-xl font-medium text-sm text-[#eefcfb] outline-none focus:border-[#0d9488] transition-all"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#6b9e9a]">Phone Number</label>
                    <input 
                      type="text"
                      className="w-full bg-[#1c1c30] border-2 border-transparent px-6 py-3 rounded-xl font-medium text-sm text-[#eefcfb] outline-none focus:border-[#0d9488] transition-all"
                      placeholder="Your Phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      required
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#6b9e9a]">Age</label>
                    <input 
                      type="number"
                      className="w-full bg-[#1c1c30] border-2 border-transparent px-6 py-3 rounded-xl font-medium text-sm text-[#eefcfb] outline-none focus:border-[#0d9488] transition-all"
                      placeholder="Age"
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: e.target.value})}
                      required
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#6b9e9a]">Gender</label>
                    <select
                      className="w-full bg-[#1c1c30] border-2 border-transparent px-6 py-3 rounded-xl font-medium text-sm text-[#eefcfb] outline-none focus:border-[#0d9488] transition-all"
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      required
                    >
                      <option value="" disabled className="bg-[#101019]">Select Gender</option>
                      <option value="Male" className="bg-[#101019]">Male</option>
                      <option value="Female" className="bg-[#101019]">Female</option>
                      <option value="Other" className="bg-[#101019]">Other</option>
                    </select>
                 </div>
               </div>
            </div>

            {/* Professional Summary */}
            <div className="space-y-4">
               <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-3 italic text-[#eefcfb]">
                 <Briefcase size={20} className="text-[#0d9488]" /> Professional Summary
               </h3>
               <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#6b9e9a]">Short Bio</label>
                  <textarea 
                    className="w-full bg-[#1c1c30] border-2 border-transparent px-6 py-4 rounded-xl font-medium text-sm text-[#eefcfb] outline-none focus:border-[#0d9488] transition-all h-24"
                    placeholder="Tell us about your expertise..."
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    required
                  />
               </div>
            </div>

            {/* Domain Expertise */}
            <div className="space-y-4">
                <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-3 italic text-[#eefcfb]">
                  <Globe size={20} className="text-[#0d9488]" /> Domain Expertise
                </h3>
                <div className="flex flex-wrap gap-2">
                   {SKILLS_OPTIONS.map((skill) => (
                     <button
                       key={skill}
                       type="button"
                       onClick={() => toggleSkill(skill)}
                       className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                         formData.skills.includes(skill)
                           ? 'bg-[#0d9488] text-[#eefcfb]'
                           : 'bg-[#1c1c30] text-[#6b9e9a] hover:bg-[#21213a]'
                       }`}
                     >
                       {skill}
                     </button>
                   ))}
                </div>
            </div>

            {/* Links and Experience */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                 <label className="text-[10px] font-black uppercase tracking-widest text-[#6b9e9a]">Years Exp.</label>
                 <input 
                   type="number"
                   className="w-full bg-[#1c1c30] border-2 border-transparent px-6 py-3 rounded-xl font-medium text-sm text-[#eefcfb] outline-none focus:border-[#0d9488] transition-all"
                   placeholder="E.G. 5"
                   value={formData.experience}
                   onChange={(e) => setFormData({...formData, experience: e.target.value})}
                   required
                 />
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] font-black uppercase tracking-widest text-[#6b9e9a]">Portfolio Link</label>
                 <input 
                   type="url"
                   className="w-full bg-[#1c1c30] border-2 border-transparent px-6 py-3 rounded-xl font-medium text-sm text-[#eefcfb] outline-none focus:border-[#0d9488] transition-all"
                   placeholder="HTTPS://..."
                   value={formData.portfolioUrl}
                   onChange={(e) => setFormData({...formData, portfolioUrl: e.target.value})}
                 />
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] font-black uppercase tracking-widest text-[#6b9e9a]">Resume Link</label>
                 <input 
                   type="url"
                   className="w-full bg-[#1c1c30] border-2 border-transparent px-6 py-3 rounded-xl font-medium text-sm text-[#eefcfb] outline-none focus:border-[#0d9488] transition-all"
                   placeholder="HTTPS://..."
                   value={formData.resumeUrl}
                   onChange={(e) => setFormData({...formData, resumeUrl: e.target.value})}
                   required
                 />
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] font-black uppercase tracking-widest text-[#6b9e9a]">LinkedIn Link (Optional)</label>
                 <input 
                   type="url"
                   className="w-full bg-[#1c1c30] border-2 border-transparent px-6 py-3 rounded-xl font-medium text-sm text-[#eefcfb] outline-none focus:border-[#0d9488] transition-all"
                   placeholder="HTTPS://..."
                   value={formData.linkedinUrl}
                   onChange={(e) => setFormData({...formData, linkedinUrl: e.target.value})}
                 />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-[#f43f5e]/10 text-[#f43f5e] rounded-2xl text-[10px] font-black border border-[#f43f5e]/20 italic uppercase tracking-widest">
                {error}
              </div>
            )}

            <div className="pt-4 flex items-center justify-between">
               <div className="flex items-center gap-2 text-[#6b9e9a]">
                  <Info size={14} />
                  <span className="text-[9px] font-black uppercase tracking-tight">System review takes ~24 hours</span>
               </div>
               <button 
                 type="submit"
                 disabled={loading}
                 className="bg-[#0d9488] text-[#eefcfb] px-12 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-[#0d9488]/80 transition-all flex items-center gap-4 shadow-2xl shadow-[#0d9488]/10 active:scale-95"
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
