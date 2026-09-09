interface Profile {
  letter: "C" | "P" | "E" | "A";
  name: string;
}

const PROFILES: Record<string, Profile> = {
  C: { letter: "C", name: "Comunicador" },
  P: { letter: "P", name: "Planejador" },
  E: { letter: "E", name: "Executor" },
  A: { letter: "A", name: "Analista" },
};

interface BehavioralProfileBadgesProps {
  value?: string | null; // CSV format: "C,P,E"
  compact?: boolean; // If true, only show letters in small circles
}

export function BehavioralProfileBadges({
  value,
  compact = false,
}: BehavioralProfileBadgesProps) {
  if (!value) return null;

  const profiles = value
    .split(",")
    .filter(Boolean)
    .map((letter) => PROFILES[letter])
    .filter(Boolean);

  if (profiles.length === 0) return null;

  if (compact) {
    return (
      <div className="flex gap-1.5">
        {profiles.map((profile) => (
          <div
            key={profile.letter}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-blue-300 bg-blue-50 text-xs font-semibold text-blue-700 dark:border-blue-600 dark:bg-blue-950 dark:text-blue-200"
            title={profile.name}
          >
            {profile.letter}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {profiles.map((profile) => (
        <div
          key={profile.letter}
          className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-200"
        >
          <span className="font-semibold">{profile.letter}</span>
          <span className="text-blue-600 dark:text-blue-300">{profile.name}</span>
        </div>
      ))}
    </div>
  );
}
