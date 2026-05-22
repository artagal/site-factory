import type { Faq } from "./seo";

export type BeautyDropDeal = {
  category: string;
  dealPrice: number;
  location: string;
  originalPrice: number;
  service: string;
  time: string;
};

export const beautyDropFaqs: Faq[] = [
  {
    question: "Is BeautyDrop taking real bookings yet?",
    answer:
      "Not yet. This version is a validation prototype for testing demand before building booking, payments, provider accounts, or customer accounts."
  },
  {
    question: "Who is BeautyDrop for?",
    answer:
      "BeautyDrop is for customers who want same-day or next-day beauty deals and for beauty professionals who want to fill cancellations, slow hours, and model-needed sessions."
  },
  {
    question: "Will BeautyDrop handle payments later?",
    answer:
      "Payments are intentionally out of scope for this prototype. A future production app can add booking rules, deposits, or payment flows after demand is validated."
  },
  {
    question: "What cities should be tested first?",
    answer:
      "The first validation should focus on one dense local market with active independent nail, lash, brow, and hair professionals so supply and demand can be measured clearly."
  }
];

export const beautyDropCategories = [
  "Nails",
  "Hair",
  "Lashes",
  "Brows",
  "Facials",
  "Makeup",
  "Waxing"
];

export const customerBenefits = [
  {
    title: "Save 30-50%",
    text: "Find discounted beauty services when providers have open time they want to fill."
  },
  {
    title: "Book today or tomorrow",
    text: "Browse time-sensitive openings without planning your beauty routine weeks ahead."
  },
  {
    title: "Discover new beauty pros",
    text: "Try local nail techs, stylists, lash artists, brow artists, and estheticians nearby."
  }
];

export const proBenefits = [
  {
    title: "Fill cancellations",
    text: "Turn last-minute gaps into revenue instead of losing the appointment window."
  },
  {
    title: "Attract new clients",
    text: "Use a discounted first visit to introduce your work to customers nearby."
  },
  {
    title: "Promote slow hours",
    text: "Move quiet weekday or off-peak slots without discounting your whole menu."
  },
  {
    title: "Post open slots fast",
    text: "Share the service, time, price, and notes needed for a customer request."
  }
];

export const modelNeededUseCases = [
  "Portfolio-building appointments",
  "Training and supervised practice",
  "New service techniques",
  "Content days and before-after work",
  "Discounted sessions with clear expectations"
];

export const beautyDropDeals: BeautyDropDeal[] = [
  {
    category: "Nails",
    dealPrice: 35,
    location: "Downtown placeholder",
    originalPrice: 70,
    service: "Gel manicure",
    time: "Today 3:30 PM"
  },
  {
    category: "Lashes",
    dealPrice: 60,
    location: "Midtown placeholder",
    originalPrice: 120,
    service: "Lash fill",
    time: "Tomorrow 11:00 AM"
  },
  {
    category: "Hair",
    dealPrice: 40,
    location: "Westside placeholder",
    originalPrice: 80,
    service: "Haircut",
    time: "Today 5:00 PM"
  },
  {
    category: "Brows",
    dealPrice: 25,
    location: "Uptown placeholder",
    originalPrice: 50,
    service: "Brow shaping",
    time: "Tomorrow 1:00 PM"
  }
];

export function getDiscountPercent(deal: Pick<BeautyDropDeal, "dealPrice" | "originalPrice">) {
  return Math.round(((deal.originalPrice - deal.dealPrice) / deal.originalPrice) * 100);
}
