'use client';

interface Props {
  isListening: boolean;
  onToggle: () => void;
  speakerName: string;
  onSpeakerNameChange: (name: string) => void;
}

export default function VoiceControl({ isListening, onToggle, speakerName, onSpeakerNameChange }: Props) {
  return (
    <div className="bg-incident-card border border-incident-border rounded-lg p-6 flex flex-col items-center justify-center">
      <button
        onClick={onToggle}
        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
          isListening ? 'bg-red-500/20 text-red-500 animate-pulse-ring' : 'bg-incident-border text-incident-muted hover:bg-incident-border/80'
        }`}
      >
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      </button>
      <div className="mt-4 text-center">
        <div className="text-sm font-medium text-incident-text mb-2">
          {isListening ? 'Listening...' : 'Click to speak'}
        </div>
        <input
          type="text"
          value={speakerName}
          onChange={(e) => onSpeakerNameChange(e.target.value)}
          placeholder="Speaker Name"
          className="bg-incident-border text-incident-text border border-incident-border/50 rounded px-3 py-1 text-sm text-center focus:outline-none focus:border-blue-500"
        />
      </div>
    </div>
  );
}
