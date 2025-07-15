import { useControls, button } from 'leva';
import { GcodeMove } from '../utils/gcodeParser';

export interface IKConfig {
  maxIterations: number;
  convergenceThreshold: number;
  dampingFactor: number;
  smoothingFactor: number;
  enabled: boolean;
}

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
  // IK-specific props
  ikConfig?: IKConfig;
  onIKConfigChange?: (config: IKConfig) => void;
  ikSolverStats?: {
    lastSolveTime: number;
    convergenceAchieved: boolean;
    iterationsUsed: number;
    endEffectorError: number;
  };
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
  onMoveChange,
  gcodeData,
  ikConfig,
  onIKConfigChange,
  ikSolverStats
}: AnimationControlsProps) {
  
  useControls('Robot Animation', {
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
    
    // Current position display (read-only)
    'Current Move': {
      value: `${currentMove + 1} / ${totalMoves}`,
      disabled: true
    },
    
    // Current coordinates (if available)
    ...(gcodeData && gcodeData[currentMove] && {
      'X': {
        value: gcodeData[currentMove].x.toFixed(2),
        disabled: true
      },
      'Y': {
        value: gcodeData[currentMove].y.toFixed(2),
        disabled: true
      },
      'Z': {
        value: gcodeData[currentMove].z.toFixed(2),
        disabled: true
      }
    })
  });
  
  // IK Configuration Controls
  useControls('Inverse Kinematics', {
    // IK Enable/Disable
    'Enable IK': {
      value: ikConfig?.enabled ?? true,
      onChange: (enabled: boolean) => {
        if (onIKConfigChange && ikConfig) {
          onIKConfigChange({ ...ikConfig, enabled });
        }
      }
    },
    
    // IK Algorithm Parameters
    'Max Iterations': {
      value: ikConfig?.maxIterations ?? 10,
      min: 1,
      max: 50,
      step: 1,
      onChange: (maxIterations: number) => {
        if (onIKConfigChange && ikConfig) {
          onIKConfigChange({ ...ikConfig, maxIterations });
        }
      }
    },
    
    'Convergence Threshold': {
      value: ikConfig?.convergenceThreshold ?? 0.01,
      min: 0.001,
      max: 0.1,
      step: 0.001,
      onChange: (convergenceThreshold: number) => {
        if (onIKConfigChange && ikConfig) {
          onIKConfigChange({ ...ikConfig, convergenceThreshold });
        }
      }
    },
    
    'Damping Factor': {
      value: ikConfig?.dampingFactor ?? 0.8,
      min: 0.1,
      max: 1.0,
      step: 0.1,
      onChange: (dampingFactor: number) => {
        if (onIKConfigChange && ikConfig) {
          onIKConfigChange({ ...ikConfig, dampingFactor });
        }
      }
    },
    
    'Smoothing Factor': {
      value: ikConfig?.smoothingFactor ?? 0.1,
      min: 0.01,
      max: 1.0,
      step: 0.01,
      onChange: (smoothingFactor: number) => {
        if (onIKConfigChange && ikConfig) {
          onIKConfigChange({ ...ikConfig, smoothingFactor });
        }
      }
    },
    
    // IK Solver Statistics (read-only)
    ...(ikSolverStats && {
      'Last Solve Time': {
        value: `${ikSolverStats.lastSolveTime.toFixed(2)}ms`,
        disabled: true
      },
      'Convergence': {
        value: ikSolverStats.convergenceAchieved ? 'Yes' : 'No',
        disabled: true
      },
      'Iterations Used': {
        value: `${ikSolverStats.iterationsUsed}`,
        disabled: true
      },
      'End Effector Error': {
        value: `${ikSolverStats.endEffectorError.toFixed(4)}m`,
        disabled: true
      }
    })
  });

  return null; // Leva controls are rendered automatically
}