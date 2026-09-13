import { ArrowRight, XCircle } from 'lucide-react';

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
    const colorClass = score >= 70 ? 'text-green-500' : score >= 50 ? 'text-brand-dark' : 'text-red-500';

    return (
        <div className="flex flex-col gap-6 w-full">
            <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm flex items-center gap-6">
                <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path strokeDasharray="100, 100" className="text-stone-200" stroke="currentColor" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path strokeDasharray={`${score}, 100`} className={colorClass} stroke="currentColor" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-bold text-stone-800">{score}%</span>
                    </div>
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-stone-800 mb-1">
                        {isReady ? 'Ready to Publish' : 'Complete Required Fields'}
                    </h4>
                    <p className="text-sm text-stone-500">
                        {isReady ? 'Your product looks great!' : `You need ${70 - score} more points to publish.`}
                    </p>
                </div>
            </div>

            {missingFields.length > 0 && (
                <div className="space-y-3">
                    <h4 className="font-bold text-stone-800">Missing Information</h4>
                    {missingFields.map((item, idx) => (
                        <div key={idx} onClick={() => onFixItem(item.field)} className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm flex items-center justify-between cursor-pointer hover:border-brand-dark transition-colors">
                            <div className="flex items-center gap-3">
                                <XCircle className="w-5 h-5 text-red-500" />
                                <div>
                                    <p className="text-sm font-bold text-stone-800">{item.message}</p>
                                    <p className="text-xs font-semibold text-brand-dark">+{item.points} points</p>
                                </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-stone-400" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
