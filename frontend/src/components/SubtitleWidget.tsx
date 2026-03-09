'use client';

interface SubtitleWidgetProps {
    text: string;
    isListening: boolean;
}

export default function SubtitleWidget({ text, isListening }: SubtitleWidgetProps) {
    return (
        <div className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto transition-all duration-500 min-h-[100px]">

            {/* Listening Indicator */}
            {isListening && (
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse delay-75" />
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse delay-150" />
                </div>
            )}

            {/* Spoken Text Subtitles */}
            <div className={`text-center transition-opacity duration-1000 ${text ? 'opacity-100' : 'opacity-0'}`}>
                <p className="text-3xl font-light text-white/90 drop-shadow-md leading-relaxed tracking-wide">
                    {text}
                </p>
            </div>

        </div>
    );
}
