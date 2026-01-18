import React, { useEffect, useState } from 'react';
import { Task } from '../types';
import { aiService, InsightReport } from '../services/aiService';

interface AIInsightModalProps {
    isOpen: boolean;
    onClose: () => void;
    tasks: Task[];
}

const AIInsightModal: React.FC<AIInsightModalProps> = ({ isOpen, onClose, tasks }) => {
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState<InsightReport | null>(null);

    useEffect(() => {
        if (isOpen) {
            handleGenerateReport();
        } else {
            setReport(null); // Reset
        }
    }, [isOpen]);

    const handleGenerateReport = async () => {
        setLoading(true);
        const result = await aiService.generateInsightReport(tasks);
        setReport(result);
        setLoading(false);
    };

    if (!isOpen) return null;

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-success bg-success/10 border-success/20';
        if (score >= 50) return 'text-warning bg-warning/10 border-warning/20';
        return 'text-danger bg-danger/10 border-danger/20';
    };

    const getTypeIcon = (type: string) => {
        switch(type) {
            case 'risk': return <i className="fas fa-exclamation-triangle text-danger"></i>;
            case 'success': return <i className="fas fa-check-circle text-success"></i>;
            default: return <i className="fas fa-info-circle text-info"></i>;
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" 
                onClick={onClose}
            ></div>

            {/* Modal Container */}
            <div className="bg-surface w-[700px] max-w-full max-h-[90vh] rounded-3xl shadow-2xl border border-white/20 relative z-10 flex flex-col animate-in fade-in zoom-in-95 duration-300 overflow-hidden">
                
                {/* Header - Glassmorphism Gradient */}
                <div className="relative bg-gradient-to-r from-violet-600 to-indigo-600 p-6 md:p-8 text-white shrink-0 overflow-hidden">
                    {/* Decorative Circles */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/20 to-transparent"></div>

                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 opacity-80 mb-1">
                                <i className="fas fa-sparkles text-yellow-300 animate-pulse"></i>
                                <span className="text-xs font-bold uppercase tracking-widest">AI Project Analysis</span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Team Insight</h2>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center transition-all active:scale-95"
                        >
                            <i className="fas fa-times text-sm"></i>
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-surface relative">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-6">
                            <div className="relative w-20 h-20">
                                <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <i className="fas fa-brain text-primary text-xl animate-pulse"></i>
                                </div>
                            </div>
                            <div className="text-center">
                                <h3 className="text-lg font-bold text-textMain">Đang phân tích dữ liệu...</h3>
                                <p className="text-sm text-textMuted mt-1">AI đang rà soát tiến độ và rủi ro của {tasks.length} công việc</p>
                            </div>
                        </div>
                    ) : report ? (
                        <div className="p-6 md:p-8 flex flex-col gap-8">
                            
                            {/* 1. Score & Summary Section */}
                            <div className="flex flex-col md:flex-row gap-6 items-center">
                                {/* Score Circle */}
                                <div className={`relative w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center border-[6px] ${getScoreColor(report.projectHealthScore)} bg-surface shadow-inner-light`}>
                                    <div className="text-center">
                                        <div className="text-2xl md:text-3xl font-black text-textMain leading-none">
                                            {report.projectHealthScore}
                                        </div>
                                        <div className="text-[10px] font-bold text-textMuted uppercase mt-1">Health Score</div>
                                    </div>
                                    {/* Sentiment Icon Badge */}
                                    <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-surface border border-border shadow-sm flex items-center justify-center text-lg">
                                        {report.sentiment === 'Positive' ? '🚀' : report.sentiment === 'Negative' ? '⚠️' : '⚖️'}
                                    </div>
                                </div>

                                {/* Summary Text */}
                                <div className="flex-1 bg-background/50 rounded-2xl p-5 border border-border">
                                    <h3 className="text-sm font-bold text-textMuted uppercase tracking-wider mb-2">Tổng quan</h3>
                                    <p className="text-base md:text-lg font-medium text-textMain leading-relaxed">
                                        "{report.summary}"
                                    </p>
                                </div>
                            </div>

                            {/* 2. Observations Grid */}
                            <div>
                                <h3 className="text-sm font-bold text-textMuted uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <i className="fas fa-microscope"></i> Phân tích chi tiết
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {report.observations.map((obs, idx) => (
                                        <div key={idx} className={`p-4 rounded-2xl border bg-surface shadow-sm hover:shadow-md transition-shadow ${
                                            obs.type === 'risk' ? 'border-danger/20 bg-danger/5' : 
                                            obs.type === 'success' ? 'border-success/20 bg-success/5' : 
                                            'border-border'
                                        }`}>
                                            <div className="flex items-start gap-3">
                                                <div className={`mt-0.5 text-lg ${
                                                    obs.type === 'risk' ? 'text-danger' : 
                                                    obs.type === 'success' ? 'text-success' : 'text-info'
                                                }`}>
                                                    {getTypeIcon(obs.type)}
                                                </div>
                                                <div>
                                                    <h4 className={`font-bold text-sm mb-1 ${
                                                        obs.type === 'risk' ? 'text-danger' : 'text-textMain'
                                                    }`}>
                                                        {obs.title}
                                                    </h4>
                                                    <p className="text-sm text-textMuted leading-relaxed">
                                                        {obs.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 3. Action Plan */}
                            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/10 dark:to-blue-900/10 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-500/20">
                                <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <i className="fas fa-clipboard-check"></i> Đề xuất hành động
                                </h3>
                                <div className="space-y-3">
                                    {report.actionPlan.map((action, idx) => (
                                        <div key={idx} className="flex items-center gap-3 bg-surface p-3 rounded-xl border border-indigo-100 dark:border-white/5 shadow-sm">
                                            <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                                                {idx + 1}
                                            </div>
                                            <span className="text-sm font-medium text-textMain">{action}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-textMuted">
                            <i className="fas fa-exclamation-circle text-3xl mb-2 opacity-50"></i>
                            <p>Không thể tạo báo cáo. Vui lòng thử lại.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 md:px-8 md:py-5 border-t border-border bg-surface flex justify-between items-center shrink-0 safe-area-bottom">
                    <span className="text-[10px] text-textMuted font-medium italic hidden md:inline">
                        Powered by Google Gemini 2.0 Flash
                    </span>
                    <div className="flex gap-3 w-full md:w-auto">
                        <button 
                            onClick={handleGenerateReport} 
                            disabled={loading}
                            className="flex-1 md:flex-none px-5 py-2.5 rounded-xl text-sm font-bold text-textMain hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                        >
                            <i className="fas fa-redo-alt"></i> Phân tích lại
                        </button>
                        <button 
                            onClick={onClose} 
                            className="flex-1 md:flex-none px-6 py-2.5 bg-textMain text-surface rounded-xl text-sm font-bold shadow-lg hover:opacity-90 transition-opacity"
                        >
                            Đã hiểu
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIInsightModal;