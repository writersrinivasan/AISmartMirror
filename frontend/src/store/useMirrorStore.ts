import { create } from 'zustand';

interface MirrorState {
    isListening: boolean;
    subtitleText: string;
    activeWidget: 'NONE' | 'WEATHER' | 'SCHEDULE';
    widgetData: any;

    // Actions
    setListening: (status: boolean) => void;
    setSubtitleText: (text: string) => void;
    setWidget: (widgetName: 'NONE' | 'WEATHER' | 'SCHEDULE', data: any) => void;
    connectWebSocket: () => void;
    sendAudioChunk: (data: Blob) => void;
    ws: WebSocket | null;
}

export const useMirrorStore = create<MirrorState>((set, get) => ({
    isListening: false,
    subtitleText: '',
    activeWidget: 'NONE',
    widgetData: null,
    ws: null,

    setListening: (status) => set({ isListening: status }),
    setSubtitleText: (text) => set({ subtitleText: text }),
    setWidget: (widgetName, data) => set({ activeWidget: widgetName, widgetData: data }),

    connectWebSocket: () => {
        const { ws } = get();
        if (ws && ws.readyState === WebSocket.OPEN) return;

        console.log("Connecting to Mirror Backend...");
        const socket = new WebSocket('ws://localhost:8000/ws');

        socket.onopen = () => {
            console.log('Connected to backend');
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data.type === 'STATUS') {
                    get().setListening(true);
                }
                else if (data.type === 'AI_RESPONSE') {
                    get().setListening(false);
                    const { text, widget } = data.payload;

                    // Show subtitle
                    get().setSubtitleText(text);

                    // Show corresponding widget
                    if (widget && widget.name) {
                        get().setWidget(widget.name as any, widget.data);
                    } else {
                        get().setWidget('NONE', null);
                    }

                    // Clear subtitle after 10 seconds
                    setTimeout(() => {
                        set({ subtitleText: '', activeWidget: 'NONE', widgetData: null });
                    }, 10000);
                }
            } catch (e) {
                console.error("Failed to parse websocket message", e);
            }
        };

        socket.onclose = () => {
            console.log('Disconnected from backend, attempting to reconnect...');
            set({ ws: null });
            setTimeout(() => {
                get().connectWebSocket();
            }, 5000);
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
            socket.close();
        }

        set({ ws: socket });
    },

    sendAudioChunk: (data: Blob) => {
        const { ws } = get();
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(data);
        }
    }
}));
