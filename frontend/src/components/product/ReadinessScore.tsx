import { ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

interface MissingField {
    field: string;
    points: number;
    message: string;
}

interface ReadinessScoreProps {
    score: number;
    missingFields: MissingField[];
    onFixItem: (field: string) => void;
}

export default function ReadinessScore({ score, missingFields, onFixItem }: ReadinessScoreProps) {
    const isReady = score >= 70;
    const colorClass = score >= 70 ? 'text-secondary' : score >= 50 ? 'text-primary' : 'text-error';
    const bgClass = score >= 70 ? 'bg-secondary-container/20 border-secondary' : score >= 50 ? 'bg-primary-container/20 border-primary' : 'bg-error-container/20 border-error';

    return (
        <div className="flex flex-col gap-4 w-full">
            <div className={`bg-surface-container-lowest border rounded-3xl p-5 shadow-sm flex items-center gap-5 ${bgClass}`}>
                <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path strokeDasharray="100, 100" className="text-surface-container-high" stroke="currentColor" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path strokeDasharray={`${score}, 100`} className={colorClass} stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-xl font-black ${colorClass}`}>{score}%</span>
                    </div>
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-on-surface mb-1 text-lg flex items-center gap-1.5">
                        {isReady ? (
                            <><CheckCircle2 className="w-5 h-5 text-secondary" /> Ready to Publish</>
                        ) : (
                            <><AlertCircle className="w-5 h-5 text-error" /> Needs Attention</>
                        )}
                    </h4>
                    <p className="text-sm text-on-surface-variant font-medium">
                        {isReady ? 'Your product passport looks great!' : `You need ${70 - score} more points to meet buyer standards.`}
                    </p>
                </div>
            </div>

            {missingFields.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-[11px] font-bold text-outline uppercase tracking-wider pl-1">Missing Information</h4>
                    {missingFields.map((item, idx) => (
                        <div key={idx} onClick={() => onFixItem(item.field)} className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 shadow-sm flex items-center justify-between cursor-pointer hover:border-primary transition-all group">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-error-container flex items-center justify-center shrink-0">
                                    <AlertCircle className="w-4 h-4 text-error" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">{item.message}</p>
                                    <p className="text-[11px] font-bold text-primary uppercase tracking-wider mt-0.5">+{item.points} points</p>
                                </div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center group-hover:bg-primary-container group-hover:text-primary transition-colors shrink-0">
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
