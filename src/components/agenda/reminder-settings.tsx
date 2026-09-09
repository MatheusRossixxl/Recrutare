"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { updateInterviewReminder } from "@/lib/actions";

interface ReminderSettingsProps {
  interviewId: string;
  currentMinutes?: number | null;
}

const REMINDER_OPTIONS = [
  { value: 10, label: "10 minutos antes" },
  { value: 20, label: "20 minutos antes" },
  { value: 30, label: "30 minutos antes" },
  { value: 60, label: "1 hora antes" },
];

export function ReminderSettings({ interviewId, currentMinutes }: ReminderSettingsProps) {
  const [value, setValue] = useState<string>(currentMinutes?.toString() || "");
  const [saving, setSaving] = useState(false);

  async function handleChange(newValue: string) {
    setValue(newValue);
    setSaving(true);
    try {
      const minutes = parseInt(newValue, 10);
      await updateInterviewReminder(interviewId, minutes);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
        <Bell className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <p className="text-xs font-medium text-muted-foreground mb-1">Lembrete</p>
        <select
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          disabled={saving}
          className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-xs shadow-sm"
        >
          <option value="">Sem lembrete</option>
          {REMINDER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
