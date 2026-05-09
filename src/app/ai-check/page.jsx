"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Button } from "../../components/common/Button";
import { DoctorCard } from "../../components/doctor/DoctorCard";
import { Sparkles, Activity, AlertCircle, Search } from "lucide-react";
import { getDoctorSuggestion } from "../../lib/ai";
import { getDoctors } from "../../lib/doctors";

export default function AiCheckPage() {
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiResult, setAiResult] = useState(null);
  const [recommendedDoctors, setRecommendedDoctors] = useState([]);

  const handleAnalyze = async () => {
    if (!symptoms.trim()) {
      setError("Please describe your symptoms first.");
      return;
    }

    setError("");
    setLoading(true);
    setAiResult(null);
    setRecommendedDoctors([]);

    try {
      const suggestion = await getDoctorSuggestion(symptoms);
      setAiResult(suggestion);

      // Fetch doctors and filter by specialization
      const { data: allDoctors } = await getDoctors();
      
      const matchedDoctors = allDoctors.filter(doc => {
        if (!doc.specialization) return false;
        
        // Ensure robust matching by lowering case and handling variations
        const aiSpec = suggestion.specialization.toLowerCase();
        const docSpec = doc.specialization.toLowerCase();
        
        return docSpec.includes(aiSpec) || aiSpec.includes(docSpec) || aiSpec.includes(docSpec.replace('ist', 'y'));
      });

      setRecommendedDoctors(matchedDoctors);
    } catch (err) {
      setError(err.message || "Failed to analyze symptoms. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="patient">
      <div className="max-w-4xl mx-auto space-y-8 pb-10">
        
        {/* Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#f0fdfa] rounded-xl flex items-center justify-center">
              <Sparkles className="text-[#0d9488]" size={22} />
            </div>
            <h1 className="text-3xl font-bold text-[#111827]">
              AI Symptom Checker
            </h1>
          </div>
          <p className="text-[#6B7280] text-[15px] max-w-2xl">
            Describe how you're feeling, and our AI assistant will recommend the right medical specialization and connect you with available doctors instantly.
          </p>
        </motion.div>

        {/* Input Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6 sm:p-8"
        >
          <label className="text-[14px] font-bold text-[#111827] flex items-center gap-2 mb-3">
            <Activity size={18} className="text-[#0d9488]" />
            Describe Your Symptoms
          </label>
          <textarea
            value={symptoms}
            onChange={(e) => {
              setSymptoms(e.target.value);
              if (error) setError("");
            }}
            placeholder="E.g., I have been experiencing severe chest pain and shortness of breath since yesterday morning..."
            className="w-full min-h-[140px] p-4 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] focus:border-[#0d9488] focus:outline-none focus:ring-[3px] focus:ring-[#0d9488]/20 transition-all resize-y text-[15px] text-[#111827]"
          />
          
          {error && (
            <div className="mt-3 flex items-center gap-2 text-[#EF4444] text-[13.5px] font-medium bg-[#FEF2F2] px-3 py-2 rounded-lg border border-[#FECACA]">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="mt-5 flex justify-end">
            <div className="w-full sm:w-auto min-w-[200px]">
              <Button
                variant="solid"
                onClick={handleAnalyze}
                disabled={loading || !symptoms.trim()}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Search size={18} />
                    <span>Analyze Symptoms</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* AI Result Section */}
        {aiResult && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden"
          >
            <div className="bg-gradient-to-r from-[#0d9488] to-[#0369a1] p-6 text-white">
              <h2 className="text-[14px] font-semibold tracking-wider uppercase text-[#ccfbf1] mb-1">
                AI Recommendation
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold drop-shadow-sm">
                  {aiResult.specialization}
                </span>
                <Sparkles className="text-[#fde047]" size={24} />
              </div>
              <p className="mt-3 text-[15px] text-white/90 leading-relaxed max-w-3xl">
                {aiResult.reason}
              </p>
            </div>

            <div className="p-6 sm:p-8 bg-[#F9FAFB]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#111827]">
                  Recommended Doctors
                </h3>
                <span className="text-[13px] font-semibold text-[#0d9488] bg-[#f0fdfa] px-3 py-1 rounded-full border border-[#ccfbf1]">
                  {recommendedDoctors.length} {recommendedDoctors.length === 1 ? 'Match' : 'Matches'} Found
                </span>
              </div>

              {recommendedDoctors.length === 0 ? (
                <div className="bg-white border border-[#E5E7EB] rounded-xl p-8 text-center shadow-sm">
                  <div className="w-16 h-16 bg-[#F3F4F6] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search size={28} className="text-[#9CA3AF]" />
                  </div>
                  <h4 className="text-[16px] font-bold text-[#111827] mb-1">No exact matches found</h4>
                  <p className="text-[14px] text-[#6B7280]">
                    We couldn't find any available {aiResult.specialization}s in our network right now. Try booking a General Physician instead.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {recommendedDoctors.map((doc, idx) => (
                    <DoctorCard key={doc.id} doctor={doc} index={idx} />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}