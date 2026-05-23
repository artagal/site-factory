"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { generateChallenge } from "../../lib/challengeEngine";
import { challengeCategories } from "../../lib/challenges";
import type { Challenge, ChallengeFilters } from "../../types/challenge";
import { Button } from "./Button";
import { ChallengeCard } from "./ChallengeCard";

const moods = ["bored", "tired", "lonely", "anxious", "adventurous", "social", "lazy", "romantic", "motivated"] as const;
const times = [2, 5, 15, 30, 60] as const;
const intensities = ["easy", "medium", "bold", "crazy but safe"] as const;
const locations = ["at home", "outside", "in the city", "with friends", "with partner", "anywhere"] as const;

const defaults: ChallengeFilters = {
  category: "Random",
  intensity: "easy",
  location: "anywhere",
  mood: "bored",
  timeAvailable: 15
};

function PillGroup<T extends string | number>({
  label,
  onChange,
  options,
  value
}: {
  label: string;
  onChange: (value: T) => void;
  options: readonly T[];
  value: T;
}) {
  return (
    <div>
      <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-white/42">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            className={`rounded-full px-4 py-2 text-sm font-black capitalize transition ${
              value === option ? "bg-lime-300 text-black" : "bg-white/8 text-white/70 hover:bg-white/14"
            }`}
            key={String(option)}
            onClick={() => onChange(option)}
            type="button"
          >
            {typeof option === "number" ? `${option} min` : option}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ChallengeGenerator({ compact = false }: { compact?: boolean }) {
  const [filters, setFilters] = useState<ChallengeFilters>(defaults);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [challenge, setChallenge] = useState<Challenge>(() => generateChallenge(defaults));

  const categoryOptions = useMemo(() => ["Random", ...challengeCategories] as const, []);

  function updateFilter<Key extends keyof ChallengeFilters>(key: Key, value: ChallengeFilters[Key]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function generateNext() {
    const next = generateChallenge(filters, recentIds);
    setChallenge(next);
    setRecentIds((current) => [...current.slice(-2), next.id]);
  }

  return (
    <section className={compact ? "" : "mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-20"} id="generator">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <motion.div
          animate={{ opacity: 1, x: 0 }}
          className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 backdrop-blur-2xl md:p-6"
          initial={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-sm font-black uppercase tracking-[0.18em] text-cyan-300">What do you need right now?</p>
          <h2 className="mt-3 text-3xl font-black leading-tight text-white md:text-5xl">
            Choose your mood. Get a mission.
          </h2>
          <p className="mt-4 text-base leading-7 text-white/62">
            No signup required. The generator uses local challenge intelligence today and is ready for secure AI generation later.
          </p>
          <div className="mt-7 grid gap-6">
            <PillGroup label="Mood" onChange={(value) => updateFilter("mood", value)} options={moods} value={filters.mood} />
            <PillGroup label="Time available" onChange={(value) => updateFilter("timeAvailable", value)} options={times} value={filters.timeAvailable} />
            <PillGroup label="Challenge type" onChange={(value) => updateFilter("category", value)} options={categoryOptions} value={filters.category} />
            <PillGroup label="Intensity" onChange={(value) => updateFilter("intensity", value)} options={intensities} value={filters.intensity} />
            <PillGroup label="Location" onChange={(value) => updateFilter("location", value)} options={locations} value={filters.location} />
            <Button className="w-full" onClick={generateNext}>
              Generate My Challenge
            </Button>
          </div>
        </motion.div>
        <ChallengeCard challenge={challenge} onGenerateAnother={generateNext} />
      </div>
    </section>
  );
}
