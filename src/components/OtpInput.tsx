"use client";

import React from "react";

type OtpInputProps = {
  length?: number;
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  className?: string;
  "aria-describedby"?: string;
};

export function OtpInput({
  length = 6,
  value,
  onChange,
  disabled,
  className,
  ...rest
}: OtpInputProps) {
  const inputsRef = React.useRef<Array<HTMLInputElement | null>>([]);

  // Ensure value always matches the length
  const safeValue = (value || "").slice(0, length).padEnd(length, " ");
  const chars = safeValue.split("");

  const focusAt = (idx: number) => {
    const el = inputsRef.current[idx];
    if (el) el.focus();
  };

  const setChar = (idx: number, char: string) => {
    const next = chars.slice();
    next[idx] = char;
    onChange(next.join("").replaceAll(" ", ""));
  };

  const handleChange = (
    idx: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const raw = e.target.value;
    const onlyDigits = raw.replace(/\D/g, "");

    if (!onlyDigits) {
      setChar(idx, " ");
      return;
    }

    // handle multiple digits (paste or fast typing)
    const next = chars.slice();
    let cursor = idx;
    for (const ch of onlyDigits) {
      if (cursor >= length) break;
      next[cursor] = ch;
      cursor++;
    }
    onChange(next.join("").replaceAll(" ", ""));

    // move focus to next empty cell if possible
    if (cursor < length) {
      focusAt(cursor);
    } else {
      // keep focus on last
      focusAt(length - 1);
    }
  };

  const handleKeyDown = (
    idx: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (chars[idx] !== " ") {
        setChar(idx, " ");
        focusAt(idx);
        return;
      }
      // move back to previous and clear it
      const prev = Math.max(0, idx - 1);
      setChar(prev, " ");
      focusAt(prev);
    }

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusAt(Math.max(0, idx - 1));
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      focusAt(Math.min(length - 1, idx + 1));
    }
  };

  const handlePaste = (
    idx: number,
    e: React.ClipboardEvent<HTMLInputElement>
  ) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!text) return;
    const next = chars.slice();
    let cursor = idx;
    for (const ch of text) {
      if (cursor >= length) break;
      next[cursor] = ch;
      cursor++;
    }
    onChange(next.join("").replaceAll(" ", ""));
    focusAt(Math.min(cursor, length - 1));
  };

  return (
    <div className={`grid grid-cols-6 gap-2 ${className}`}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el: any) => (inputsRef.current[i] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="one-time-code"
          aria-label={`Digit ${i + 1}`}
          className="md:h-12 h-10 rounded-md border border-theme-text-secondary ring-theme-text-secondary bg-white text-card-foreground text-center text-lg font-medium outline-none focus:ring-2 focus:ring-ring focus:border-ring    disabled:opacity-50 disabled:cursor-not-allowed"
          value={chars[i] === " " ? "" : chars[i]}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={(e) => handlePaste(i, e)}
          disabled={disabled}
          maxLength={1}
          {...rest}
        />
      ))}
    </div>
  );
}
