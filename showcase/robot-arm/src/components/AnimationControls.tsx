import { useControls, button } from 'leva';
import { GcodeMove } from '../utils/gcodeParser';

interface AnimationControlsProps {
  isPlaying: boolean;
  currentMove: number;
  totalMoves: number;
  animationSpeed: number;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onMoveChange: (moveIndex: number) => void;
  gcodeData?: GcodeMove[];
}

export function AnimationControls({
  isPlaying,
  currentMove,
  totalMoves,
  animationSpeed,
  onPlay,
  onPause,
  onReset,
  onSpeedChange,
  onMoveChange
}: AnimationControlsProps) {
  
  useControls('Robot Animation', () => ({
    // Playback controls
    'Play/Pause': button(() => {
      if (isPlaying) {
        onPause();
      } else {
        onPlay();
      }
    }),
    'Reset': button(onReset),
    
    // Progress control
    'Progress': {
      value: currentMove,
      min: 0,
      max: Math.max(totalMoves - 1, 0),
      step: 1,
      onChange: onMoveChange
    },
    
    // Speed control
    'Speed': {
      value: animationSpeed,
      min: 0.1,
      max: 5.0,
      step: 0.1,
      onChange: onSpeedChange
    },
    
    
    
  }), [isPlaying]);

  return null; // Leva controls are rendered automatically
}