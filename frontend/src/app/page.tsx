'use client';

import { useEffect, useState, useRef } from 'react';
import { useMirrorStore } from '@/store/useMirrorStore';
import ClockWidget from '@/components/ClockWidget';
import WeatherWidget from '@/components/WeatherWidget';
import SubtitleWidget from '@/components/SubtitleWidget';
import { Mic } from 'lucide-react';

import ClientOnly from '@/components/ClientOnly';

export default function Home() {
  const {
    connectWebSocket,
    sendAudioChunk,
    isListening,
    subtitleText,
    activeWidget,
    widgetData
  } = useMirrorStore();

  useEffect(() => {
    connectWebSocket();
  }, [connectWebSocket]);

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Real Audio Capture
  const toggleRecording = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      }
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          sendAudioChunk(event.data);
        }
      };

      // We'll send chunks every 500ms for near-real-time streaming
      mediaRecorder.start(500);
      setIsRecording(true);

    } catch (err) {
      console.error("Failed to access microphone:", err);
      alert("Please allow microphone access to use the Smart Mirror.");
    }
  };

  return (
    <main className="relative w-full h-full flex flex-col justify-between p-12">

      {/* Top Layer: Important Glanceable Information */}
      <div className="flex justify-between items-start w-full">

        {/* Top Left: Dynamic Widgets (e.g., Weather appears here) */}
        <div className="flex flex-col gap-6">
          <div className={`transition-opacity duration-1000 ${activeWidget === 'WEATHER' ? 'opacity-100' : 'opacity-0'}`}>
            {activeWidget === 'WEATHER' && widgetData && (
              <WeatherWidget data={widgetData} />
            )}
          </div>

          {/* We could add Schedule widget here later */}
          <div className={`transition-opacity duration-1000 ${activeWidget === 'SCHEDULE' ? 'opacity-100' : 'opacity-0'}`}>
            {activeWidget === 'SCHEDULE' && widgetData && (
              <div className="bg-white/5 backdrop-blur-sm p-6 rounded-3xl border border-white/10 w-96">
                <h3 className="text-xl font-light mb-4 text-gray-300 border-b border-white/10 pb-2">Today's Schedule</h3>
                <div className="space-y-4">
                  {widgetData.meetings?.map((m: any, i: number) => (
                    <div key={i} className="flex gap-4">
                      <span className="text-sm text-gray-400 min-w-[70px] pt-1">{m.time}</span>
                      <span className="text-lg font-medium">{m.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Top Right: Persistent Clock */}
        <div className="flex-shrink-0">
          <ClientOnly>
            <ClockWidget />
          </ClientOnly>
        </div>

      </div>

      {/* Bottom Layer: AI Subtitles and Interaction */}
      <div className="w-full flex-grow flex flex-col justify-end pb-12">
        <SubtitleWidget text={subtitleText} isListening={isListening || isRecording} />

        {/* Mic toggle for real recording */}
        <button
          onClick={toggleRecording}
          className={`absolute bottom-6 right-6 transition-all duration-300 p-4 rounded-full border ${isRecording
            ? 'bg-red-500/20 border-red-500/50 text-red-400 opacity-100 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
            : 'bg-white/10 border-white/20 opacity-30 hover:opacity-100 text-white'
            }`}
          title="Toggle Voice Input"
        >
          <Mic className="w-6 h-6" />
        </button>
      </div>

    </main>
  );
}
