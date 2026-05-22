import type { Faq } from "./seo";

export type FactoryTemplate =
  | "ai-model-portfolio-page"
  | "app-landing-page"
  | "validation-landing-page";

export type FactoryPreviewPage = {
  contentHref?: string;
  faqs: Faq[];
  hero: {
    eyebrow: string;
    summary: string;
    title: string;
  };
  highlights: Array<{
    text: string;
    title: string;
  }>;
  href: string;
  name: string;
  sections: Array<{
    label: string;
    text: string;
    title: string;
  }>;
  seo: {
    description: string;
    title: string;
  };
  slug: string;
  summary: string;
  template: FactoryTemplate;
  templateLabel: string;
};

const previewPages: FactoryPreviewPage[] = [
  {
    contentHref: "/content/work-organizer/blog/how-to-organize-work-without-another-spreadsheet",
    faqs: [
      {
        question: "Can Work Organizer content stay local before launch?",
        answer:
          "Yes. Site Factory keeps page drafts, SEO notes, and blog content in local Markdown and MDX files until publishing is intentionally added."
      }
    ],
    hero: {
      eyebrow: "Work Organizer",
      summary:
        "A landing-page direction for a calm task and workflow organizer that helps operators see what matters without building another spreadsheet.",
      title: "Organize messy work into a daily operating rhythm"
    },
    highlights: [
      {
        title: "Daily command center",
        text: "Turn loose tasks, follow-ups, and project notes into a focused work queue."
      },
      {
        title: "SEO-ready education",
        text: "Use blog drafts to capture pain points around work tracking, prioritization, and lightweight systems."
      },
      {
        title: "Prototype path",
        text: "Leave room for future service prototypes without committing to live infrastructure."
      }
    ],
    href: "/previews/work-organizer",
    name: "Work Organizer",
    sections: [
      {
        label: "Audience",
        title: "Small teams and solo operators",
        text: "People who need a practical work system but do not want a heavyweight project management rollout."
      },
      {
        label: "Offer",
        title: "Simple operating clarity",
        text: "A product story centered on capture, prioritization, review, and reliable follow-through."
      },
      {
        label: "Next content",
        title: "Workflow comparison pages",
        text: "Create SEO pages for task trackers, work planners, and spreadsheet alternatives."
      }
    ],
    seo: {
      description:
        "Preview a local landing page and SEO direction for Work Organizer, a simple operating system for messy work.",
      title: "Work Organizer Landing Page Preview"
    },
    slug: "work-organizer",
    summary: "Landing-page preview for a focused work planning app.",
    template: "app-landing-page",
    templateLabel: "App landing"
  },
  {
    contentHref: "/content/contactor/blog/what-to-track-before-hiring-a-home-service-contractor",
    faqs: [
      {
        question: "Is Contactor connected to contractors or lead systems?",
        answer:
          "No. The current Site Factory version only stores local content and previews. Any live integrations should be added later by explicit request."
      }
    ],
    hero: {
      eyebrow: "Contactor",
      summary:
        "A content-first direction for helping homeowners compare bids, organize project details, and ask better questions before hiring.",
      title: "Make contractor hiring easier to compare"
    },
    highlights: [
      {
        title: "Decision support",
        text: "Frame project scope, bid details, and red flags in plain language."
      },
      {
        title: "Local SEO path",
        text: "Build pages around project types, homeowner questions, and service-area intent."
      },
      {
        title: "Draft-first publishing",
        text: "Generate WordPress-ready drafts locally before any CMS credentials exist."
      }
    ],
    href: "/previews/contactor",
    name: "Contactor",
    sections: [
      {
        label: "Audience",
        title: "Homeowners preparing to hire",
        text: "Visitors who need clarity before they request estimates or compare service providers."
      },
      {
        label: "Offer",
        title: "Track the right details",
        text: "Scope, timing, licenses, warranties, change orders, and payment milestones."
      },
      {
        label: "Next content",
        title: "Local service page library",
        text: "Create city and project-specific drafts for future SEO testing."
      }
    ],
    seo: {
      description:
        "Preview a local landing page and SEO direction for Contactor, a homeowner project comparison concept.",
      title: "Contactor Landing Page Preview"
    },
    slug: "contactor",
    summary: "Landing-page preview for contractor hiring and project tracking.",
    template: "app-landing-page",
    templateLabel: "App landing"
  },
  {
    contentHref: "/content/gofunmotion/models/mia-carter",
    faqs: [
      {
        question: "Can GoFunMotion model pages be generated without paid APIs?",
        answer:
          "Yes. The current samples use local files only. Image generation, publishing, and paid APIs are intentionally outside this foundation."
      }
    ],
    hero: {
      eyebrow: "GoFunMotion AI Portfolio",
      summary:
        "A portfolio-page pattern for AI model profiles, scene concepts, brand-safe biography text, and content planning notes.",
      title: "Build polished AI model portfolio pages from local briefs"
    },
    highlights: [
      {
        title: "Model positioning",
        text: "Keep character voice, visual direction, and audience fit in one structured draft."
      },
      {
        title: "Portfolio-ready layout",
        text: "Preview creator-style pages before image or video production enters the workflow."
      },
      {
        title: "Reusable metadata",
        text: "Store model facts and page SEO fields in predictable local files."
      }
    ],
    href: "/previews/gofunmotion",
    name: "GoFunMotion",
    sections: [],
    seo: {
      description:
        "Preview a local AI model portfolio page structure for GoFunMotion and the Mia Carter sample profile.",
      title: "GoFunMotion AI Portfolio Preview"
    },
    slug: "gofunmotion",
    summary: "AI model portfolio preview featuring the Mia Carter sample.",
    template: "ai-model-portfolio-page",
    templateLabel: "Model portfolio"
  },
  {
    contentHref: "/content/validation/beauty-drop/beauty-drop-validation",
    faqs: [
      {
        question: "Does BeautyDrop collect real customer or provider data yet?",
        answer:
          "No. The current version is static and local. Any forms, analytics, live booking, or payments should be added later by explicit request."
      }
    ],
    hero: {
      eyebrow: "BeautyDrop validation",
      summary:
        "A validation direction for a last-minute beauty appointment marketplace that connects discounted open slots with nearby customers.",
      title: "Validate last-minute beauty deals before building the app"
    },
    highlights: [
      {
        title: "Customer-side demand",
        text: "Test whether customers click into discounted same-day and next-day beauty appointment cards."
      },
      {
        title: "Provider-side supply",
        text: "Test whether beauty professionals understand and want to post cancellations, slow-hour deals, and model-needed slots."
      },
      {
        title: "Narrow launch scope",
        text: "Keep the first test focused on one local market and a few high-intent beauty categories."
      }
    ],
    href: "/previews/beauty-drop",
    name: "BeautyDrop",
    sections: [
      {
        label: "Audience",
        title: "Customers and local beauty pros",
        text: "The marketplace needs both discounted appointment demand and real provider openings in the same city."
      },
      {
        label: "First offer",
        title: "Last-minute beauty slots",
        text: "Nails, lashes, brows, and hair openings are concrete enough to test price, timing, and category interest."
      },
      {
        label: "Next validation",
        title: "Manual matching before app logic",
        text: "Use the prototype to learn request behavior before adding booking workflows, payments, or provider accounts."
      }
    ],
    seo: {
      description:
        "Preview a local validation page direction for BeautyDrop, a marketplace for last-minute discounted beauty appointment openings.",
      title: "BeautyDrop Validation Landing Page Preview"
    },
    slug: "beauty-drop",
    summary: "Validation-page preview for testing a beauty product concept.",
    template: "validation-landing-page",
    templateLabel: "Validation"
  }
];

export function getPreviewPages() {
  return previewPages;
}

export function getPreviewPage(slug: string) {
  return previewPages.find((page) => page.slug === slug);
}
