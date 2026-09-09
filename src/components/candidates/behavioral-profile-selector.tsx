"use client";

import { useState, useEffect } from "react";

interface BehavioralProfile {
  letter: "C" | "P" | "E" | "A";
  name: string;
  description: string;
}

const PROFILES: BehavioralProfile[] = [
  { letter: "C", name: "Comunicador", description: "Comunicador — forte comunicação e relacionamento" },
  { letter: "P", name: "Planejador", description: "Planejador — organizado e metodológico" },
  { letter: "E", name: "Executor", description: "Executor — ação e implementação" },
  { letter: "A", name: "Analista", description: "Analista — análise e raciocínio crítico" },
];

interface BehavioralProfileSelectorProps {
  value?: string; // CSV format: "C,P,E"
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export function BehavioralProfileSelector({
  value = "",
  onChange,
  disabled = false,
}: BehavioralProfileSelectorProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (value) {
      setSelected(new Set(value.split(",").filter(Boolean)));
    }
  }, [value]);

  const handleToggle = (letter: string) => {
    if (disabled) return;

    const newSelected = new Set(selected);
    if (newSelected.has(letter)) {
      newSelected.delete(letter);
    } else {
      newSelected.add(letter);
    }

    setSelected(newSelected);

    // Convert to CSV format
    const newValue = Array.from(newSelected).sort().join(",");
    onChange?.(newValue);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {PROFILES.map((profile) => (
          <button
            key={profile.letter}
            type="button"
            onClick={() => handleToggle(profile.letter)}
            disabled={disabled}
            title={profile.description}
            className={`
              flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold
              transition-all duration-200
              ${
                selected.has(profile.letter)
                  ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-950 dark:text-blue-200"
                  : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-neutral-500"
              }
              ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
            `}
          >
            {profile.letter}
          </button>
        ))}
      </div>

      {/* Hidden input for form submission */}
      <input type="hidden" name="behavioralProfiles" value={Array.from(selected).sort().join(",")} />

      {/* Display selected profiles */}
      {selected.size > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {Array.from(selected)
            .sort()
            .map((letter) => {
              const profile = PROFILES.find((p) => p.letter === letter);
              return (
                <div
                  key={letter}
                  className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-200"
                >
                  <span className="font-semibold">{letter}</span>
                  <span className="text-blue-600 dark:text-blue-300">{profile?.name}</span>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
