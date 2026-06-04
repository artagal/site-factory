export type BlogPost = {
  category: string;
  description: string;
  faqs: Array<{
    answer: string;
    question: string;
  }>;
  generatorPrompt: string;
  keyword: string;
  actionSteps: string[];
  publishedAt: string;
  readTime: string;
  sections: Array<{
    body: string;
    heading: string;
  }>;
  slug: string;
  takeaways: string[];
  title: string;
};

export const blogPosts: BlogPost[] = [
  {
    category: "Things to do",
    description: "A practical guide to finding a real plan when you are bored and do not want another endless search session.",
    faqs: [
      { question: "What should I do when I am bored today?", answer: "Start with your city, budget, time, mood, and who is going. Then choose one nearby activity and one backup." }
    ],
    generatorPrompt: "Use the plan finder to turn mood, time, budget, and city into a real plan.",
    keyword: "best things to do when bored",
    actionSteps: ["Check tonight's discounted openings.", "Choose one main activity.", "Keep one backup nearby."],
    publishedAt: "2026-05-24",
    readTime: "4 min read",
    sections: [
      { heading: "Make the decision smaller", body: "Most boredom searches fail because they start too broad. GoFunMotion narrows the decision to city, mood, time, budget, and who is going." },
      { heading: "Use one anchor activity", body: "A good plan needs one clear anchor: a class, event, walk, deal, meal, or local experience. Everything else can stay flexible." }
    ],
    slug: "best-things-to-do-when-bored",
    takeaways: ["Start with constraints.", "Pick one anchor activity.", "Always keep a backup."],
    title: "Best Things To Do When You're Bored"
  },
  {
    category: "Date night",
    description: "Date night ideas under $50 that feel intentional without requiring a complicated reservation or expensive night out.",
    faqs: [
      { question: "What is a good date night under $50?", answer: "Try a short walk, a low-cost class or activity deal, then dessert or coffee nearby." }
    ],
    generatorPrompt: "Find a date night under $50 based on city, mood, and available time.",
    keyword: "date night ideas under $50",
    actionSteps: ["Start with a walk or coffee.", "Choose one activity deal.", "Add a dessert backup."],
    publishedAt: "2026-05-24",
    readTime: "4 min read",
    sections: [
      { heading: "Low pressure beats overplanning", body: "The best affordable dates are easy to say yes to and leave room for conversation." },
      { heading: "Look for activity deals", body: "Trial classes, comedy nights, pottery, mini golf, and local events can make a normal night feel new." }
    ],
    slug: "date-night-ideas-under-50",
    takeaways: ["Keep it close.", "Use one activity anchor.", "Save a backup."],
    title: "Date Night Ideas Under $50"
  },
  {
    category: "Friends",
    description: "Fun things to do with friends when the group chat cannot decide and everyone needs a clear option.",
    faqs: [
      { question: "How do we pick a group activity fast?", answer: "Choose a time, budget, and activity type, then send two options and one backup." }
    ],
    generatorPrompt: "Find a group-friendly activity for friends this weekend.",
    keyword: "fun things to do with friends this weekend",
    actionSteps: ["Pick a budget.", "Send two options.", "Choose the fastest yes."],
    publishedAt: "2026-05-24",
    readTime: "3 min read",
    sections: [
      { heading: "Groups need fewer options", body: "Too many links make the decision worse. A short list with clear timing gets more yeses." },
      { heading: "Choose activities with a clear start time", body: "Escape rooms, bowling, mini golf, comedy, classes, and events are easier to coordinate than vague hangouts." }
    ],
    slug: "fun-things-to-do-with-friends-this-weekend",
    takeaways: ["Reduce options.", "Use clear times.", "Keep one backup."],
    title: "Fun Things To Do With Friends This Weekend"
  },
  {
    category: "Family",
    description: "Family activities when it rains, including indoor options, kid-friendly deals, and low-stress backup plans.",
    faqs: [
      { question: "What can families do on a rainy day?", answer: "Look for indoor play, museums, workshops, trampoline parks, kids classes, or a cozy food stop nearby." }
    ],
    generatorPrompt: "Find a rainy day family plan with kids-friendly options.",
    keyword: "family activities when it rains",
    actionSteps: ["Filter for indoor.", "Check kid-friendly timing.", "Plan a snack backup."],
    publishedAt: "2026-05-24",
    readTime: "4 min read",
    sections: [
      { heading: "Predictability matters", body: "Family plans work best when parking, timing, food, and indoor backup are easy." },
      { heading: "Deals can reduce friction", body: "Discounted passes and trial classes make trying a new family activity less risky." }
    ],
    slug: "family-activities-when-it-rains",
    takeaways: ["Filter indoor first.", "Check timing.", "Build in food."],
    title: "Family Activities When It Rains"
  },
  {
    category: "Partners",
    description: "How local businesses can fill empty slots with people already searching for something fun to do.",
    faqs: [
      { question: "How can activity businesses fill empty slots?", answer: "List clear offers, promote last-minute availability, and respond quickly to booking requests." }
    ],
    generatorPrompt: "List your business so local customers can request availability.",
    keyword: "how local businesses can fill empty slots",
    actionSteps: ["Create a clear offer.", "Add last-minute availability.", "Respond to requests."],
    publishedAt: "2026-05-24",
    readTime: "4 min read",
    sections: [
      { heading: "Demand is often last-minute", body: "People search for plans when they are ready to go out. Businesses need a simple way to show available experiences." },
      { heading: "Requests are a safe first step", body: "Before checkout exists, request-based booking lets partners confirm availability without overpromising." }
    ],
    slug: "how-local-businesses-can-fill-empty-slots",
    takeaways: ["Use clear listings.", "Promote open slots.", "Confirm requests fast."],
    title: "How Local Businesses Can Fill Empty Slots"
  },
  {
    category: "Deals",
    description: "How to find last-minute activities near you without pretending every fake listing is live inventory.",
    faqs: [
      { question: "Are last-minute activity deals guaranteed?", answer: "Availability should be confirmed by the partner. Request booking until live checkout is implemented." }
    ],
    generatorPrompt: "Browse last-minute activity deals near your city.",
    keyword: "last-minute activities near you",
    actionSteps: ["Choose tonight or weekend.", "Filter by budget.", "Request availability."],
    publishedAt: "2026-05-24",
    readTime: "3 min read",
    sections: [
      { heading: "Last-minute plans need trust", body: "Deal cards should show price, time, category, partner status, and whether availability needs confirmation." },
      { heading: "Use request booking first", body: "Until payment checkout exists, the safest call to action is a booking request, not a purchase claim." }
    ],
    slug: "last-minute-activities-near-you",
    takeaways: ["Check timing.", "Confirm availability.", "Avoid fake partner claims."],
    title: "Last-Minute Activities Near You"
  }
];

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}
