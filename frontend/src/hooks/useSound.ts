import { useEffect, useRef, useCallback } from 'react';

// 使用 Web Audio API 生成音效，无需外部文件
const useSound = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // 初始化 AudioContext
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // 播放频率音调
  const playTone = useCallback((
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume: number = 0.3
  ) => {
    if (!audioContextRef.current) return;

    // 恢复 AudioContext（如果被挂起）
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    // 音量包络（避免爆音）
    gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, audioContextRef.current.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, audioContextRef.current.currentTime + duration);

    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + duration);
  }, []);

  // 答对音效 - 清脆的叮铃声
  const playCorrect = useCallback(() => {
    // 播放两个音调：高音 + 和弦
    playTone(523.25, 0.3, 'sine', 0.3); // C5
    setTimeout(() => playTone(659.25, 0.4, 'sine', 0.2), 50); // E5
    setTimeout(() => playTone(783.99, 0.5, 'sine', 0.2), 100); // G5
  }, [playTone]);

  // 答错音效 - 低沉的提示音
  const playWrong = useCallback(() => {
    playTone(200, 0.3, 'triangle', 0.3);
    setTimeout(() => playTone(150, 0.4, 'triangle', 0.2), 150);
  }, [playTone]);

  // 连击音效 - 上升的音调
  const playCombo = useCallback((comboLevel: number) => {
    const baseFreq = 400 + (comboLevel * 100);
    playTone(baseFreq, 0.2, 'sine', 0.2);
    setTimeout(() => playTone(baseFreq + 200, 0.3, 'sine', 0.15), 80);
  }, [playTone]);

  // 成就解锁音效 - 华丽的上行音阶
  const playAchievement = useCallback(() => {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, index) => {
      setTimeout(() => playTone(freq, 0.3, 'sine', 0.25), index * 100);
    });
  }, [playTone]);

  // 庆祝音效 - 彩带飘落的效果音
  const playCelebrate = useCallback(() => {
    // 播放一段欢快的旋律
    const melody = [523.25, 659.25, 783.99, 659.25, 783.99, 1046.50];
    melody.forEach((freq, index) => {
      setTimeout(() => playTone(freq, 0.25, 'sine', 0.2), index * 120);
    });
  }, [playTone]);

  return {
    playCorrect,
    playWrong,
    playCombo,
    playAchievement,
    playCelebrate
  };
};

export default useSound;
