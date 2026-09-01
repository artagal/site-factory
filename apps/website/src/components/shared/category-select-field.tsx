"use client";

import { useEffect, useMemo, useState } from "react";
import { demoCategories } from "../../lib/demoData";
import { getCanonicalCategoryOptions, normalizeCategorySelection, type CategoryOption } from "../../lib/categories";

const fallbackCategories = getCanonicalCategoryOptions(demoCategories, []);

export function CategorySelectField({
  compact = false,
  defaultCategory,
  defaultCategoryId,
  dense = false,
  includeAll = false,
  label = "Category",
  name = "categoryId",
  categoryNameFieldName = "category"
}: {
  categoryNameFieldName?: string;
  compact?: boolean;
  dense?: boolean;
  defaultCategory?: string;
  defaultCategoryId?: string;
  includeAll?: boolean;
  label?: string;
  name?: string;
}) {
  const initial = useMemo(() => normalizeCategorySelection({ category: defaultCategory, categoryId: defaultCategoryId, options: fallbackCategories }), [defaultCategory, defaultCategoryId]);
  const [categories, setCategories] = useState<CategoryOption[]>(fallbackCategories);
  const [selectedCategoryId, setSelectedCategoryId] = useState(includeAll && !defaultCategoryId ? "" : initial.categoryId);
  const [hasUserSelectedCategory, setHasUserSelectedCategory] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      try {
        const response = await fetch("/api/categories", { cache: "no-store" });
        const payload = (await response.json().catch(() => null)) as { categories?: CategoryOption[] } | null;
        const nextCategories = response.ok && Array.isArray(payload?.categories) ? payload.categories : fallbackCategories;
        if (cancelled) return;
        setCategories(nextCategories);
        setSelectedCategoryId((currentCategoryId) => {
          if (hasUserSelectedCategory) {
            return currentCategoryId ? normalizeCategorySelection({ category: defaultCategory, categoryId: currentCategoryId, options: nextCategories }).categoryId : "";
          }
          if (includeAll && !defaultCategoryId) return "";
          return normalizeCategorySelection({ category: defaultCategory, categoryId: defaultCategoryId ?? initial.categoryId, options: nextCategories }).categoryId;
        });
      } catch {
        if (!cancelled) setCategories(fallbackCategories);
      }
    }

    void loadCategories();
    return () => {
      cancelled = true;
    };
  }, [defaultCategory, defaultCategoryId, hasUserSelectedCategory, includeAll, initial.categoryId]);

  const selected = selectedCategoryId
    ? normalizeCategorySelection({ category: defaultCategory, categoryId: selectedCategoryId, options: categories })
    : { category: "", categoryId: "", categoryName: "" };

  return (
    <label className="block">
      <span className={dense ? "sr-only md:not-sr-only md:text-xs md:font-black md:uppercase md:tracking-[0.12em] md:text-[var(--muted-foreground)]" : "text-xs font-black uppercase tracking-[0.12em] text-[var(--muted-foreground)]"}>{label}</span>
      <select
        className={`${dense ? "mt-0 h-11 rounded-lg px-3 py-0 text-sm leading-normal md:mt-1 md:h-12" : `${compact ? "mt-1" : "mt-2"} h-12 rounded-lg px-4 py-0 text-sm leading-normal`} w-full border border-[var(--border-subtle)] bg-[var(--panel)] font-bold text-[var(--foreground)] outline-none transition focus:border-[var(--accent-cyan)]`}
        name={name}
        onChange={(event) => {
          setHasUserSelectedCategory(true);
          setSelectedCategoryId(event.target.value);
        }}
        value={selectedCategoryId}
      >
        {includeAll ? <option value="">All categories</option> : null}
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.label}{category.dealCount > 0 ? ` - ${category.dealCount} deal${category.dealCount === 1 ? "" : "s"}` : ""}
          </option>
        ))}
      </select>
      <input name={categoryNameFieldName} type="hidden" value={selected.categoryName} />
    </label>
  );
}
