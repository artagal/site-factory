import { Search } from "lucide-react";
import { CitySelectField } from "../shared/city-select-field";
import type { PlanFinderInput } from "../../types/deals";

const whenOptions = [
  ["today", "Today"],
  ["tonight", "Tonight"],
  ["tomorrow", "Tomorrow"],
  ["weekend", "This weekend"]
];

const whoOptions = [
  ["solo", "Solo"],
  ["date", "Date"],
  ["friends", "Friends"],
  ["family", "Family"],
  ["kids", "Kids"]
];

const budgetOptions = [
  ["free", "Free"],
  ["under25", "Under $25"],
  ["under50", "Under $50"],
  ["under100", "Under $100"],
  ["flexible", "Flexible"]
];

const vibeOptions = [
  ["chill", "Chill"],
  ["romantic", "Romantic"],
  ["active", "Active"],
  ["social", "Social"],
  ["creative", "Creative"],
  ["family-friendly", "Family-friendly"],
  ["adventurous", "Adventurous"],
  ["low-energy", "Low-energy"],
  ["rainy-day", "Rainy day"],
  ["surprise-me", "Surprise me"]
];

const timeOptions = [
  ["30min", "30 minutes"],
  ["1hour", "1 hour"],
  ["2hours", "2 hours"],
  ["half-day", "Half day"],
  ["evening", "Full evening"]
];

const indoorOptions = [
  ["either", "Either"],
  ["indoor", "Indoor"],
  ["outdoor", "Outdoor"]
];

export function PlanFinderForm({
  action = "/find",
  compact = false,
  defaultValues
}: {
  action?: string;
  compact?: boolean;
  defaultValues?: Partial<PlanFinderInput>;
}) {
  return (
    <form action={action} className="rounded-lg border border-white/10 bg-white/[0.04] p-4 md:p-5">
      <div className={compact ? "grid gap-4 sm:grid-cols-2" : "grid gap-4 md:grid-cols-2 lg:grid-cols-4"}>
        <CitySelectField defaultCity={defaultValues?.city} defaultCityId={defaultValues?.cityId} />
        <Select label="When" name="when" options={whenOptions} value={defaultValues?.when ?? "today"} />
        <Select label="Who's going" name="who" options={whoOptions} value={defaultValues?.who ?? "date"} />
        <Select label="Budget" name="budget" options={budgetOptions} value={defaultValues?.budget ?? "under50"} />
        <Select label="Vibe" name="vibe" options={vibeOptions} value={defaultValues?.vibe ?? "surprise-me"} />
        <Select label="Time available" name="timeAvailable" options={timeOptions} value={defaultValues?.timeAvailable ?? "2hours"} />
        <Select label="Indoor/outdoor" name="indoorOutdoor" options={indoorOptions} value={defaultValues?.indoorOutdoor ?? "either"} />
        <button className="mt-auto inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-lime-300 px-5 py-3 text-sm font-black text-[#070816] transition hover:bg-white active:scale-[0.98]" type="submit">
          <Search aria-hidden="true" size={18} />
          Find My Plan
        </button>
      </div>
    </form>
  );
}

function Select({
  label,
  name,
  options,
  value
}: {
  label: string;
  name: string;
  options: string[][];
  value: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.14em] text-white/45">{label}</span>
      <select
        className="mt-2 min-h-12 w-full rounded-lg border border-white/10 bg-black/28 px-4 text-sm font-bold text-white outline-none transition focus:border-lime-300"
        defaultValue={value}
        name={name}
      >
        {options.map(([optionValue, optionLabel]) => (
          <option className="bg-[#070816] text-white" key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}
