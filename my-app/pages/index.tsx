import { useState, useEffect, useRef } from "react";
import { Geist } from "next/font/google";
import type {
  AlarmState,
  GenerateMessageResponse,
  AnalyzeExcuseResponse,
  PostStatsResponse,
} from "../types/alarm";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export default function Home() {
  const [alarmTime, setAlarmTime] = useState<string>("");
  const [snoozeCount, setSnoozeCount] = useState<number>(0);
  const [isAlarmActive, setIsAlarmActive] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("No alarm set");
  const [alarmMessage, setAlarmMessage] = useState<string>("Time to wake up!");
  const [excuse, setExcuse] = useState<string>("");
  const [roastMessage, setRoastMessage] = useState<string>("");
  const [threatMessage, setThreatMessage] = useState<string>("");
  const [crushName, setCrushName] = useState<string>("");
  const [twitterHandle, setTwitterHandle] = useState<string>("");
  const [showExcuseInput, setShowExcuseInput] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Check alarm time every second
  useEffect(() => {
    const interval = setInterval(() => {
      if (alarmTime && !isAlarmActive) {
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
          .getMinutes()
          .toString()
          .padStart(2, "0")}`;

        if (currentTime === alarmTime) {
          triggerAlarm();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [alarmTime, isAlarmActive]);

  const setAlarm = () => {
    if (!alarmTime) {
      alert("Please select a time for your alarm!");
      return;
    }

    setSnoozeCount(0);
    setStatusMessage(`Alarm set for ${alarmTime}`);
    setShowExcuseInput(false);
    setRoastMessage("");
    setThreatMessage("");
  };

  const triggerAlarm = async () => {
    setIsAlarmActive(true);

    // Generate snarky message from backend
    try {
      const response = await fetch(`${API_BASE_URL}/api/generate-message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          snoozeCount,
          alarmTime,
        }),
      });

      const data: GenerateMessageResponse = await response.json();
      setAlarmMessage(data.message);

      // Play audio if provided
      if (data.audioUrl && audioRef.current) {
        audioRef.current.src = data.audioUrl;
        audioRef.current.play().catch(console.error);
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Error generating message:", error);
      setAlarmMessage("WAKE UP! Your alarm is ringing!");
    }

    // Play default alarm sound if no audio from backend
    if (audioRef.current && !audioRef.current.src) {
      playDefaultAlarm();
    }
  };

  const playDefaultAlarm = () => {
    if (audioRef.current) {
      // Simple beep sound as fallback
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = "sine";
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);

      oscillator.start();
      setTimeout(() => oscillator.stop(), 200);
    }
  };

  const handleSnooze = async () => {
    const newSnoozeCount = snoozeCount + 1;
    setSnoozeCount(newSnoozeCount);

    // Show excuse input after first snooze
    if (newSnoozeCount >= 1) {
      setShowExcuseInput(true);
    }

    // Trigger social media threat after 3 snoozes
    if (newSnoozeCount >= 3) {
      const name = crushName || "your crush";
      const handle = twitterHandle || "@you";
      setThreatMessage(
        `WARNING: One more snooze and I'm posting to ${name} that you've hit snooze ${newSnoozeCount} times! Your wake-up stats will be posted from ${handle}!`
      );
    }

    // Actually post if they hit snooze again after threat
    if (newSnoozeCount >= 4) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/post-stats`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            snoozeCount: newSnoozeCount,
            alarmTime,
            crushName,
            twitterHandle,
          }),
        });

        const data: PostStatsResponse = await response.json();
        alert(`Your embarrassing wake-up stats have been posted! ${data.message}`);
      } catch (error) {
        console.error("Error posting stats:", error);
        alert(`You've snoozed ${newSnoozeCount} times. Lucky for you, the posting failed!`);
      }
    }

    // Close modal and set new alarm for 5 minutes
    setIsAlarmActive(false);
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    const newAlarmTime = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
    setAlarmTime(newAlarmTime);
    setStatusMessage(`Snoozed until ${newAlarmTime}. Snoozes: ${newSnoozeCount}`);

    // Stop audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const analyzeExcuse = async () => {
    if (!excuse) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/analyze-excuse`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          excuse,
          snoozeCount,
        }),
      });

      const data: AnalyzeExcuseResponse = await response.json();
      setRoastMessage(data.roast);
    } catch (error) {
      console.error("Error analyzing excuse:", error);
      setRoastMessage("Nice try, but that excuse is as weak as your willpower to wake up.");
    }
  };

  const dismissAlarm = () => {
    setIsAlarmActive(false);
    setSnoozeCount(0);
    setAlarmTime("");
    setStatusMessage("Alarm dismissed. Good job waking up!");
    setShowExcuseInput(false);
    setThreatMessage("");
    setRoastMessage("");
    setExcuse("");
    setIsPlaying(false);

    // Stop audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  // Mad Character Component
  const MadCharacter = ({ angerLevel }: { angerLevel: number }) => {
    // angerLevel: 0-4 (based on snooze count)
    const getEyeStyle = () => {
      if (angerLevel >= 3) return "angry";
      if (angerLevel >= 1) return "annoyed";
      return "normal";
    };

    const eyeStyle = getEyeStyle();

    return (
      <div className="flex justify-center mb-6">
        <div className="relative">
          {/* Face circle */}
          <div
            className={`w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 shadow-2xl flex items-center justify-center transition-all duration-300 ${
              angerLevel >= 3 ? "animate-shake-hard" : angerLevel >= 1 ? "animate-shake" : ""
            }`}
          >
            {/* Eyes */}
            <div className="flex gap-6 mb-4">
              {/* Left eye */}
              <div className="relative">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-white rounded-full shadow-lg">
                  <div
                    className={`w-3 h-3 md:w-4 md:h-4 bg-gray-900 rounded-full absolute transition-all duration-200 ${
                      eyeStyle === "angry"
                        ? "top-0 left-1/2 -translate-x-1/2"
                        : eyeStyle === "annoyed"
                        ? "top-1 left-1/2 -translate-x-1/2"
                        : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    }`}
                  />
                </div>
                {/* Angry eyebrow */}
                {eyeStyle === "angry" && (
                  <div className="absolute -top-3 left-0 w-8 h-1 bg-gray-900 rounded transform -rotate-12"></div>
                )}
              </div>

              {/* Right eye */}
              <div className="relative">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-white rounded-full shadow-lg">
                  <div
                    className={`w-3 h-3 md:w-4 md:h-4 bg-gray-900 rounded-full absolute transition-all duration-200 ${
                      eyeStyle === "angry"
                        ? "top-0 left-1/2 -translate-x-1/2"
                        : eyeStyle === "annoyed"
                        ? "top-1 left-1/2 -translate-x-1/2"
                        : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    }`}
                  />
                </div>
                {/* Angry eyebrow */}
                {eyeStyle === "angry" && (
                  <div className="absolute -top-3 right-0 w-8 h-1 bg-gray-900 rounded transform rotate-12"></div>
                )}
              </div>
            </div>
          </div>

          {/* Anger steam particles */}
          {angerLevel >= 2 && (
            <>
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-steam-right opacity-60"></div>
              <div className="absolute -top-2 -left-2 w-4 h-4 bg-red-500 rounded-full animate-steam-left opacity-60"></div>
            </>
          )}
        </div>
      </div>
    );
  };

  // Voice Wave Visualization Component
  const VoiceWave = ({ isActive }: { isActive: boolean }) => {
    const bars = Array.from({ length: 30 });

    return (
      <div className="flex items-center justify-center gap-1 h-24 mb-6">
        {bars.map((_, i) => (
          <div
            key={i}
            className={`w-1 md:w-1.5 bg-gradient-to-t from-cyan-500 to-blue-500 rounded-full transition-all ${
              isActive ? "animate-wave" : "h-2"
            }`}
            style={{
              animationDelay: `${i * 0.05}s`,
              height: isActive ? undefined : '8px'
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div
      className={`${geistSans.className} min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-900`}
    >
      <div className="container mx-auto px-3 py-4 md:px-4 md:py-8 max-w-4xl">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl md:rounded-2xl shadow-2xl p-4 md:p-8 text-white text-center mb-4 md:mb-8">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-1 md:mb-2">Passive-Aggressive Alarm Clock</h1>
          <p className="text-sm md:text-lg lg:text-xl opacity-90">Wake up or face the consequences</p>
        </header>

        {/* Main Content */}
        <main className="bg-white rounded-xl md:rounded-2xl shadow-2xl p-4 md:p-8 mb-4 md:mb-8">
          {/* Character Display on Main Page */}
          <div className="flex justify-center mb-6">
            <MadCharacter angerLevel={Math.min(snoozeCount, 4)} />
          </div>

          {/* Alarm Section */}
          <div className="bg-gray-50 rounded-lg md:rounded-xl p-4 md:p-6 mb-4 md:mb-6">
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-stretch sm:items-center justify-center mb-4">
              <input
                type="time"
                value={alarmTime}
                onChange={(e) => setAlarmTime(e.target.value)}
                className="text-2xl md:text-3xl p-3 md:p-4 border-2 border-blue-600 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-600 min-h-[44px]"
              />
              <button
                onClick={setAlarm}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 md:px-8 md:py-4 rounded-lg text-lg md:text-xl font-semibold hover:scale-105 transition-transform active:scale-95 min-h-[44px] shadow-lg"
              >
                Set Alarm
              </button>
            </div>

            <div className="text-center">
              <p className="text-base md:text-xl text-gray-600 mb-2">{statusMessage}</p>
              {snoozeCount > 0 && (
                <p className="text-lg md:text-xl text-blue-600 font-bold">Snoozes: {snoozeCount}</p>
              )}
            </div>
          </div>

          {/* Settings Section */}
          <div className="bg-gray-50 rounded-lg md:rounded-xl p-4 md:p-6 mb-4 md:mb-6">
            <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-gray-800">Settings</h3>
            <div className="space-y-3 md:space-y-4">
              <div>
                <label className="block text-sm md:text-base text-gray-700 font-medium mb-2">
                  Crush&apos;s Name (for threats):
                </label>
                <input
                  type="text"
                  value={crushName}
                  onChange={(e) => setCrushName(e.target.value)}
                  placeholder="Optional"
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 text-base min-h-[44px]"
                />
              </div>
              <div>
                <label className="block text-sm md:text-base text-gray-700 font-medium mb-2">
                  Your Twitter Handle:
                </label>
                <input
                  type="text"
                  value={twitterHandle}
                  onChange={(e) => setTwitterHandle(e.target.value)}
                  placeholder="@yourhandle"
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 text-base min-h-[44px]"
                />
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-blue-50 rounded-lg md:rounded-xl p-4 md:p-6">
            <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-blue-900">How it works:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm md:text-base text-gray-700">
              <li>Set an alarm time</li>
              <li>When it rings, you&apos;ll hear a snarky voice message (ElevenLabs)</li>
              <li>Hit snooze? The AI analyzes your excuse and roasts you (Gemini)</li>
              <li>Keep snoozing? Social media threats activate (Cloudflare Workers)</li>
              <li>Final snooze? Your embarrassing wake-up stats get posted!</li>
            </ol>
          </div>
        </main>

        {/* Alarm Modal */}
        {isAlarmActive && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-3 md:p-4 animate-fadeIn">
            <div className="bg-white rounded-xl md:rounded-2xl p-5 md:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto animate-slideUp">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-cyan-600 text-center mb-4 md:mb-6 animate-shake">
                WAKE UP!
              </h2>

              {/* Mad Character */}
              <MadCharacter angerLevel={snoozeCount} />

              {/* Voice Wave Visualization */}
              <VoiceWave isActive={isPlaying} />

              <p className="text-base md:text-lg lg:text-xl text-center mb-4 md:mb-6 text-gray-800">{alarmMessage}</p>

              <audio ref={audioRef} loop />

              {/* Excuse Section */}
              {showExcuseInput && (
                <div className="mb-4 md:mb-6">
                  <label className="block text-sm md:text-base text-gray-700 font-bold mb-2">
                    Why are you snoozing?
                  </label>
                  <input
                    type="text"
                    value={excuse}
                    onChange={(e) => setExcuse(e.target.value)}
                    onBlur={analyzeExcuse}
                    placeholder="Enter your excuse..."
                    className="w-full p-3 border-2 border-gray-300 rounded-lg mb-3 focus:outline-none focus:border-cyan-500 text-base min-h-[44px]"
                  />
                  {roastMessage && (
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 p-3 md:p-4 rounded italic text-yellow-800 text-sm md:text-base">
                      {roastMessage}
                    </div>
                  )}
                </div>
              )}

              {/* Threat Message */}
              {threatMessage && (
                <div className="bg-red-100 border-l-4 border-red-500 p-3 md:p-4 rounded mb-4 md:mb-6 text-red-800 font-bold text-sm md:text-base">
                  {threatMessage}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <button
                  onClick={handleSnooze}
                  className="flex-1 bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 text-gray-900 px-5 py-3 md:px-6 md:py-4 rounded-lg text-lg md:text-xl font-semibold transition-transform hover:scale-105 active:scale-95 min-h-[44px]"
                >
                  Snooze (5 min)
                </button>
                <button
                  onClick={dismissAlarm}
                  className="flex-1 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white px-5 py-3 md:px-6 md:py-4 rounded-lg text-lg md:text-xl font-semibold transition-transform hover:scale-105 active:scale-95 min-h-[44px]"
                >
                  I&apos;m Awake!
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-10px);
          }
          75% {
            transform: translateX(10px);
          }
        }

        @keyframes shake-hard {
          0%,
          100% {
            transform: translateX(0) rotate(0deg);
          }
          10% {
            transform: translateX(-15px) rotate(-5deg);
          }
          30% {
            transform: translateX(15px) rotate(5deg);
          }
          50% {
            transform: translateX(-15px) rotate(-5deg);
          }
          70% {
            transform: translateX(15px) rotate(5deg);
          }
          90% {
            transform: translateX(-15px) rotate(-5deg);
          }
        }

        @keyframes steam-left {
          0% {
            transform: translate(0, 0) scale(0.5);
            opacity: 0.6;
          }
          100% {
            transform: translate(-20px, -40px) scale(1.2);
            opacity: 0;
          }
        }

        @keyframes steam-right {
          0% {
            transform: translate(0, 0) scale(0.5);
            opacity: 0.6;
          }
          100% {
            transform: translate(20px, -40px) scale(1.2);
            opacity: 0;
          }
        }

        @keyframes wave {
          0%,
          100% {
            height: 8px;
          }
          50% {
            height: 64px;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s;
        }

        .animate-slideUp {
          animation: slideUp 0.3s;
        }

        .animate-shake {
          animation: shake 0.5s infinite;
        }

        .animate-shake-hard {
          animation: shake-hard 0.3s infinite;
        }

        .animate-steam-left {
          animation: steam-left 1.5s infinite;
        }

        .animate-steam-right {
          animation: steam-right 1.5s infinite;
        }

        .animate-wave {
          animation: wave 0.8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
