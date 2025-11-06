let currentUtterance: SpeechSynthesisUtterance | null = null;

export function isSpeakingSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function speakText(text: string, onend?: () => void) {
  if (!isSpeakingSupported()) return;
  stopSpeaking();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'zh-CN';
  u.rate = 1.0;
  u.pitch = 1.0;
  u.onend = () => {
    if (currentUtterance === u) currentUtterance = null;
    onend?.();
  };
  currentUtterance = u;
  window.speechSynthesis.speak(u);
}

export function stopSpeaking() {
  if (!isSpeakingSupported()) return;
  if (currentUtterance) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}


