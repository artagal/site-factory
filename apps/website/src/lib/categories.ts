import { demoCategories, demoListings } from "./demoData";
import { slugify } from "./slug";
import type { Category } from "../types/deals";

export type CategoryOption = Pick<Category, "accentColor" | "active" | "description" | "icon" | "id" | "name" | "slug" | "sortOrder"> & {
  dealCount: number;
  label: string;
};

export function getCanonicalCategoryOptions(categories: Category[] = demoCategories): CategoryOption[] {
  const dealCounts = new Map<string, number>();
  for (const listing of demoListings) {
    for (const categoryId of listing.categoryIds) {
      dealCounts.set(categoryId, (dealCounts.get(categoryId) ?? 0) + 1);
    }
  }

  return categories
    .map((category) => ({
      accentColor: category.accentColor,
      active: category.active,
      dealCount: dealCounts.get(category.slug || category.id) ?? dealCounts.get(category.id) ?? 0,
      description: category.description,
      icon: category.icon,
      id: category.slug || category.id,
      label: category.name,
      name: category.name,
      slug: category.slug || category.id,
      sortOrder: category.sortOrder
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder || Number(b.dealCount > 0) - Number(a.dealCount > 0) || a.name.localeCompare(b.name));
}

export function getDefaultCategoryOption(options: CategoryOption[] = getCanonicalCategoryOptions()) {
  return options.find((category) => category.dealCount > 0 && category.active) ?? options.find((category) => category.active) ?? options[0];
}

export function findCategoryOption(value: string | null | undefined, options: CategoryOption[] = getCanonicalCategoryOptions()) {
  const normalized = slugify(value ?? "");
  if (!normalized) return undefined;

  return options.find((category) => [category.id, category.slug, category.name, category.label].map(slugify).includes(normalized));
}

export function normalizeCategorySelection({
  category,
  categoryId,
  options = getCanonicalCategoryOptions()
}: {
  category?: string | null;
  categoryId?: string | null;
  options?: CategoryOption[];
}) {
  const selected = findCategoryOption(categoryId, options) ?? findCategoryOption(category, options) ?? getDefaultCategoryOption(options);

  return {
    category: selected?.name ?? "Date Night",
    categoryId: selected?.id ?? "date-night",
    categoryName: selected?.name ?? "Date Night"
  };
}
