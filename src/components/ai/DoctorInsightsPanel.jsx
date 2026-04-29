"use client";

import { motion, AnimatePresence } from "motion/react";
import { X, User, Calendar, Clock, FileText, AlertCircle, Activity, Sparkles, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { getPatientInsights } from "../../lib/aiDoctor";

export function DoctorInsightsPanel({ isOpen, onClose, appointment, cachedInsight, onInsightGenerated }) {
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState(null);

  useEffect(() => {
    if (!isOpen || !appointment) return;
    
    if (cachedInsight) {
      setInsight(cachedInsight);
      return;
    }

    const fetchInsight = async () => {
      setLoading(true);
      try {
        const data = await getPatientInsights(appointment);
        setInsight(data);
        if (onInsightGenerated) {
          onInsightGenerated(appointment.id, data);
        }
      } catch (err) {
        setInsight({ error: err.message });
      } finally {
        setLoading(false);
      }
    };

    fetchInsight();
  }, [isOpen, appointment, cachedInsight, onInsightGenerated]);

  // Clear inner state slightly after close
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => setInsight(null), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen && !insight) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          />

          {/* Side Panel / Full Screen Modal on Mobile */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 sm:inset-y-0 sm:left-auto sm:right-0 z-50 w-full sm:max-w-md bg-[#F9FAFB] shadow-2xl flex flex-col sm:border-l sm:border-[#E5E7EB]"
          >
            {/* Header */}
            <div className="bg-white px-6 py-5 border-b border-[#E5E7EB] flex items-center justify-between shadow-sm z-10">
              <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2">
                <Sparkles size={18} className="text-[#0d9488]" />
                AI Triage & Insights
              </h2>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-[#F3F4F6] rounded-full transition-colors text-[#6B7280]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Patient Basic Info Card */}
              {appointment && (
                <div className="p-6 bg-white border-b border-[#E5E7EB]">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#10B981] to-[#047857] rounded-xl flex items-center justify-center text-white text-lg font-bold flex-shrink-0 shadow-sm">
                      {(appointment.patient_name || appointment.title || "P").substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-[17px] font-bold text-[#111827]">
                        {appointment.patient_name || appointment.title || "Patient"}
                      </h3>
                      <p className="text-[14px] text-[#6B7280] font-medium mt-0.5">
                        {appointment.specialization || appointment.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 mt-5 bg-[#F9FAFB] p-3 rounded-lg border border-[#E5E7EB]">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-[#6B7280]" />
                      <span className="text-[13px] font-semibold text-[#374151]">
                        {appointment.date || "Today"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-[#6B7280]" />
                      <span className="text-[13px] font-semibold text-[#374151]">
                        {appointment.time || appointment.time_slot}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Insights Content */}
              <div className="p-6 space-y-6">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                    <div className="flex gap-2">
                      <div className="w-2.5 h-2.5 bg-[#0d9488] rounded-full animate-bounce" />
                      <div className="w-2.5 h-2.5 bg-[#0d9488] rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
                      <div className="w-2.5 h-2.5 bg-[#0d9488] rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
                    </div>
                    <p className="text-[#6B7280] text-[14px] font-medium">Generating patient insights...</p>
                  </div>
                ) : insight?.error ? (
                  <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-5 text-center">
                    <AlertTriangle size={24} className="text-[#EF4444] mx-auto mb-2" />
                    <h4 className="text-[14px] font-bold text-[#991B1B]">Analysis Failed</h4>
                    <p className="text-[13px] text-[#DC2626] mt-1">{insight.error}</p>
                  </div>
                ) : insight ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {/* Priority Banner */}
                    <div className={`p-4 rounded-xl border flex flex-col gap-1.5
                      ${insight.priority === 'High' ? 'bg-[#FEF2F2] border-[#FECACA]' : 
                        insight.priority === 'Medium' ? 'bg-[#FEF3C7] border-[#FDE68A]' : 
                        'bg-[#ECFDF5] border-[#A7F3D0]'}`}
                    >
                      <h4 className={`text-[12px] font-bold uppercase tracking-wider
                        ${insight.priority === 'High' ? 'text-[#991B1B]' : 
                          insight.priority === 'Medium' ? 'text-[#92400E]' : 
                          'text-[#065F46]'}`}
                      >
                        Triage Priority
                      </h4>
                      <div className="flex items-center gap-2">
                        <AlertCircle size={20} className={
                          insight.priority === 'High' ? 'text-[#DC2626]' : 
                          insight.priority === 'Medium' ? 'text-[#D97706]' : 
                          'text-[#059669]'
                        } />
                        <span className={`text-[20px] font-bold
                          ${insight.priority === 'High' ? 'text-[#7F1D1D]' : 
                            insight.priority === 'Medium' ? 'text-[#78350F]' : 
                            'text-[#064E3B]'}`}
                        >
                          {insight.priority} Priority
                        </span>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
                      <h4 className="flex items-center gap-2 text-[13px] font-bold text-[#111827] uppercase tracking-wide mb-3">
                        <FileText size={16} className="text-[#0d9488]" /> Clinical Summary
                      </h4>
                      <p className="text-[14.5px] text-[#4B5563] leading-relaxed">
                        {insight.summary}
                      </p>
                    </div>

                    {/* Suggested Action */}
                    {insight.suggestion && (
                      <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
                        <h4 className="flex items-center gap-2 text-[13px] font-bold text-[#111827] uppercase tracking-wide mb-3">
                          <Activity size={16} className="text-[#0d9488]" /> Suggested Action
                        </h4>
                        <p className="text-[14.5px] text-[#4B5563] font-medium leading-relaxed">
                          {insight.suggestion}
                        </p>
                      </div>
                    )}

                    {/* Notes from Patient */}
                    {(appointment?.notes || appointment?.description) && (
                      <div className="bg-[#F3F4F6] p-5 rounded-xl border border-[#E5E7EB]">
                        <h4 className="text-[12px] font-bold text-[#6B7280] uppercase tracking-wider mb-2">
                          Original Patient Notes
                        </h4>
                        <p className="text-[14px] text-[#374151] italic">
                          "{appointment.notes || appointment.description}"
                        </p>
                      </div>
                    )}
                  </motion.div>
                ) : null}
              </div>
            </div>
            
            {/* Footer */}
            <div className="bg-white p-4 border-t border-[#E5E7EB]">
              <button
                onClick={onClose}
                className="w-full py-3 bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#374151] font-semibold rounded-xl transition-colors"
              >
                Close Panel
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
