
import {useSettingsStore } from "@/stores/settings";
import { useCallback, useEffect, useState } from "react";

// フックの引数の型を定義
export type KeyProps = {
  conditions: (e: KeyboardEvent) => boolean;
};

export const useKey = ({ conditions }: KeyProps) => {
  // 指定されたキー（群）が押されているかどうかの状態
  const [isPressed, setIsPressed] = useState(false);
  // 指定されたキー（群）二つ目が押されているかどうかの状態
  const [isSecondPressed, setIsSecondPressed] = useState(false);
  // 指定されたキー（群）が一度でも押されたかどうかの状態
  const [isPressedOnce, setIsPressedOnce] = useState(false);
  const {isInputFocused, isIgnoreKey} = useSettingsStore();

  // 状態をリセットする関数
  const resetState = useCallback(() => {
    setIsPressed(false);
    setIsSecondPressed(false);
    setIsPressedOnce(false);
  }, []);

  // commandキー押されている間はkeyupイベントが発火しないため、一定時間後にリセットする必要がある
  // なので、commandキーはisPressedOnceしか使えない
  // https://stackoverflow.com/questions/25438608/javascript-keyup-isnt-called-when-command-and-another-is-pressed

  // キーボードイベントとタブの可視性変更のイベントリスナーを設定
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isInputFocused || isIgnoreKey) return;
      if (conditions(e)) {
        if (!isPressed) {
          setIsPressed(true);
        } else if (isPressed && !isSecondPressed) {
          setIsSecondPressed(true);
        }

        if (e.metaKey) {
          setTimeout(() => {
            resetState();
          }, 100);
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (isInputFocused || isIgnoreKey) return; // input要素にFocusあたってる場合は無効化
      if (conditions(e)) {
        //setIsPressed(false);
        if (isSecondPressed) {
          setIsSecondPressed(false);
        } else if (isPressed && !isSecondPressed) {
          setIsPressed(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    document.addEventListener("visibilitychange", resetState);

    // クリーンアップ関数
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("visibilitychange", resetState);
    };
  }, [
    conditions,
    resetState,
    isPressed,
    isSecondPressed,
    isInputFocused,
    isIgnoreKey
  ]);

  // isPressedOnceの状態を更新
  useEffect(() => {
    if (isPressed) setIsPressedOnce(true);
  }, [isPressed]);

  useEffect(() => {
    if (isInputFocused || isIgnoreKey) return; // input要素にFocusあたってる場合は無効化
    if (isPressedOnce) setIsPressedOnce(false);
  }, [isPressedOnce, isInputFocused]);

  // フックの戻り値
  return { isPressed, isSecondPressed, isPressedOnce };
};
