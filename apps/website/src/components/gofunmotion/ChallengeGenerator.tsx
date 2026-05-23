"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Clock3, MapPin, Radio, WandSparkles } from "lucide-react";
import { generateChallenge } from "../../lib/challengeEngine";
import { challengeCategories, challengeTemplates } from "../../lib/challenges";
import type { Challenge, ChallengeFilters } from "../../types/challenge";
import { Button } from "./Button";
import { ChallengeCard } from "./ChallengeCard";
import { MissionMachine } from "./MissionMachine";

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

const initialChallenge = challengeTemplates.find((challenge) => challenge.id === "move-01") ?? challengeTemplates[0];

const moodOptions: Array<{ caption: string; filters: Partial<ChallengeFilters>; label: string }> = [
  { caption: "Get me unstuck.", filters: { category: "Anti-Doomscroll", mood: "bored", timeAvailable: 5 }, label: "bored" },
  { caption: "Make the day feel warmer.", filters: { category: "Social", mood: "lonely", timeAvailable: 15 }, label: "lonely" },
  { caption: "Give me a calm reset.", filters: { category: "Mind Reset", mood: "anxious", intensity: "easy" }, label: "anxious" },
  { caption: "Low-energy, still real.", filters: { category: "Move", mood: "tired", timeAvailable: 5 }, label: "tired" },
  { caption: "Send me somewhere.", filters: { category: "Explore", mood: "adventurous", location: "outside" }, label: "adventurous" },
  { caption: "Tiny first step.", filters: { category: "Anti-Doomscroll", mood: "lazy", intensity: "easy" }, label: "unmotivated" },
  { caption: "Give me people energy.", filters: { category: "Social", mood: "social", location: "anywhere" }, label: "social" },
  { caption: "Small courage rep.", filters: { category: "Confidence", mood: "adventurous", intensity: "medium" }, label: "need confidence" },
  { caption: "Surprise me.", filters: { category: "Random", mood: "motivated", location: "anywhere" }, label: "random" }
];

const presets: Array<{ description: string; filters: ChallengeFilters; label: string }> = [
  {
    description: "Fast reset when you are stuck in the feed.",
    filters: { category: "Anti-Doomscroll", intensity: "easy", location: "anywhere", mood: "bored", timeAvailable: 5 },
    label: "Anti-scroll reset"
  },
  {
    description: "Small social action without making it weird.",
    filters: { category: "Social", intensity: "medium", location: "anywhere", mood: "lonely", timeAvailable: 15 },
    label: "Social courage"
  },
  {
    description: "Simple couple idea for today, not someday.",
    filters: { category: "Couples", intensity: "easy", location: "with partner", mood: "romantic", timeAvailable: 30 },
    label: "Date spark"
  },
  {
    description: "Get your body moving with zero planning.",
    filters: { category: "Move", intensity: "medium", location: "outside", mood: "motivated", timeAvailable: 15 },
    label: "Move fast"
  }
];

const delightMessages = [
  "No perfect plan needed. Just one small mission.",
  "Scrolling loop detected. Motion recommended.",
  "Your next memory is probably outside.",
  "Tiny courage mission unlocked.",
  "Real life is loading...",
  "Challenge accepted. Go make today less boring."
];

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
      <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-white/58">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            className={`rounded-full px-4 py-2 text-sm font-black capitalize transition focus:outline-none focus:ring-2 focus:ring-lime-300 ${
              value === option
                ? "bg-lime-300 text-black shadow-[0_0_28px_rgba(190,242,100,0.24)]"
                : "border border-white/10 bg-white/[0.075] text-white/82 hover:bg-white/14"
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
  const reduceMotion = useReducedMotion();
  const [filters, setFilters] = useState<ChallengeFilters>(defaults);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [challenge, setChallenge] = useState<Challenge>(initialChallenge);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinRound, setSpinRound] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const categoryOptions = useMemo(() => ["Random", ...challengeCategories] as const, []);
  const selectedFeeling = moodOptions.find((option) => option.filters.mood === filters.mood && option.filters.category === filters.category)?.label ?? filters.mood;
  const delightMessage = delightMessages[spinRound % delightMessages.length];
  const hasSpun = spinRound > 0;

  function updateFilter<Key extends keyof ChallengeFilters>(key: Key, value: ChallengeFilters[Key]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function generateNext(nextFilters = filters) {
    if (isSpinning) {
      return;
    }

    setIsSpinning(true);
    if (window.innerWidth < 768) {
      window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 30);
    }
    window.setTimeout(
      () => {
        const next = generateChallenge(nextFilters, recentIds);
        setChallenge(next);
        setRecentIds((current) => [...current.slice(-2), next.id]);
        setSpinRound((current) => current + 1);
        setIsSpinning(false);
      },
      reduceMotion ? 80 : 1180
    );
  }

  function applyPreset(nextFilters: ChallengeFilters) {
    setFilters(nextFilters);
    generateNext(nextFilters);
  }

  function chooseFeeling(partialFilters: Partial<ChallengeFilters>) {
    const nextFilters = { ...filters, ...partialFilters };
    setFilters(nextFilters);
  }

  return (
    <section className={compact ? "" : "mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16"} id="generator">
      <div className="mb-6 max-w-3xl">
        <p className="inline-flex items-center gap-2 rounded-full bg-cyan-300/10 px-3 py-2 text-sm font-black uppercase tracking-[0.18em] text-cyan-200">
          <WandSparkles aria-hidden="true" size={16} />
          Core product loop
        </p>
        <h2 className="mt-4 text-4xl font-black leading-tight text-white md:text-6xl">
          How are you feeling right now?
        </h2>
        <p className="mt-4 text-lg font-semibold leading-8 text-white/68">
          Pick your mood, get one mission, start it, complete it, then earn XP and keep your streak alive.
        </p>
      </div>
      <div className="mb-6 grid gap-3 rounded-[2rem] border border-white/10 bg-white/[0.05] p-3 backdrop-blur-2xl sm:grid-cols-2 lg:grid-cols-6">
        {[
          ["1", "Mood"],
          ["2", "Mission"],
          ["3", "Start"],
          ["4", "Complete"],
          ["5", "XP + streak"],
          ["6", "Save/share"]
        ].map(([number, label]) => (
          <div className="flex items-center gap-3 rounded-2xl bg-black/24 p-3" key={number}>
            <span className="flex size-9 items-center justify-center rounded-full bg-white text-sm font-black text-black">
              {number}
            </span>
            <span className="text-sm font-black leading-tight text-white">{label}</span>
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
        <motion.div
          animate={{ opacity: 1, x: 0 }}
          className="rounded-[2rem] border border-white/10 bg-white/[0.075] p-4 shadow-[0_24px_90px_rgba(0,0,0,0.25)] backdrop-blur-2xl md:p-6"
          initial={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4 }}
        >
          <h3 className="text-2xl font-black leading-tight text-white md:text-3xl">
            What do you need right now?
          </h3>
          <p className="mt-3 text-base font-semibold leading-7 text-white/70">
            Tap the feeling closest to now. The rest should take seconds.
          </p>
          <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {moodOptions.map((option) => {
              const active = selectedFeeling === option.label;
              return (
                <button
                  className={`group rounded-2xl border p-4 text-left transition duration-300 focus:outline-none focus:ring-2 focus:ring-lime-300 ${
                    active
                      ? "border-lime-300/60 bg-lime-300 text-black shadow-[0_0_42px_rgba(190,242,100,0.22)]"
                      : "border-white/10 bg-white/[0.055] text-white hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-white/[0.09]"
                  }`}
                  key={option.label}
                  onClick={() => chooseFeeling(option.filters)}
                  type="button"
                >
                  <span className="text-base font-black capitalize">{option.label}</span>
                  <span className={`mt-1 block text-xs font-bold leading-5 ${active ? "text-black/60" : "text-white/48"}`}>{option.caption}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {presets.map((preset) => (
              <button
                className="group rounded-2xl border border-white/10 bg-black/24 p-4 text-left transition hover:border-lime-300/40 hover:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-lime-300"
                key={preset.label}
                onClick={() => applyPreset(preset.filters)}
                type="button"
              >
                <span className="flex items-center justify-between gap-3 text-sm font-black text-white">
                  {preset.label}
                  <ArrowRight aria-hidden="true" className="text-lime-300 transition group-hover:translate-x-1" size={16} />
                </span>
                <span className="mt-2 block text-xs font-semibold leading-5 text-white/54">{preset.description}</span>
              </button>
            ))}
          </div>
          <div className="mt-7 grid gap-6">
            <PillGroup label="Time available" onChange={(value) => updateFilter("timeAvailable", value)} options={times} value={filters.timeAvailable} />
            <PillGroup label="Challenge type" onChange={(value) => updateFilter("category", value)} options={categoryOptions} value={filters.category} />
            <PillGroup label="Intensity" onChange={(value) => updateFilter("intensity", value)} options={intensities} value={filters.intensity} />
            <PillGroup label="Location" onChange={(value) => updateFilter("location", value)} options={locations} value={filters.location} />
            <div className="rounded-2xl border border-lime-300/20 bg-lime-300/10 p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-lime-200">Mission setup</p>
              <div className="mt-3 flex flex-wrap gap-2 text-sm font-black text-white">
                <span className="rounded-full bg-black/28 px-3 py-2 capitalize">{selectedFeeling}</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-black/28 px-3 py-2">
                  <Clock3 aria-hidden="true" size={15} />
                  {filters.timeAvailable} min
                </span>
                <span className="rounded-full bg-black/28 px-3 py-2">{filters.category}</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-black/28 px-3 py-2 capitalize">
                  <MapPin aria-hidden="true" size={15} />
                  {filters.location}
                </span>
              </div>
            </div>
            <div className="sticky bottom-3 z-20 rounded-[1.35rem] border border-lime-300/20 bg-[#070816]/78 p-2 shadow-[0_16px_55px_rgba(0,0,0,0.42)] backdrop-blur-2xl lg:static lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
              <Button className="min-h-14 w-full text-base shadow-[0_0_55px_rgba(190,242,100,0.2)]" disabled={isSpinning} onClick={() => generateNext()}>
                <Radio aria-hidden="true" size={18} />
                {isSpinning ? "Shuffling..." : hasSpun ? "Spin Again" : "Spin the Challenge"}
              </Button>
            </div>
          </div>
        </motion.div>
        <div className="scroll-mt-20 grid gap-4" ref={resultRef}>
          <MissionMachine
            challenge={challenge}
            delightMessage={delightMessage}
            isSpinning={isSpinning}
            onSoundToggle={() => setSoundEnabled((current) => !current)}
            soundEnabled={soundEnabled}
            spinRound={spinRound}
          />
          <AnimatePresence mode="wait">
            <ChallengeCard challenge={challenge} isRevealing={isSpinning} key={challenge.id} onGenerateAnother={() => generateNext()} />
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
