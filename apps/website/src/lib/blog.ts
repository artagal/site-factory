export const blogPosts = [
  {
    description:
      "Simple, fun things to do when your brain wants another feed refresh but your day needs real motion.",
    slug: "things-to-do-instead-of-doomscrolling",
    title: "10 Things To Do Instead Of Doomscrolling"
  },
  {
    description:
      "Why tiny missions, low-stakes social reps, and real-world action can help confidence compound.",
    slug: "small-real-life-challenges-build-confidence",
    title: "How Small Real-Life Challenges Build Confidence"
  },
  {
    description:
      "Movement changes mood because your body is not separate from your attention, energy, or motivation.",
    slug: "why-movement-changes-your-mood",
    title: "Why Movement Changes Your Mood"
  },
  {
    description:
      "Boredom can be a signal that your brain is ready for novelty. Here are better ways to use it.",
    slug: "fun-things-to-do-when-you-are-bored",
    title: "Fun Things To Do When You’re Bored"
  },
  {
    description:
      "Make weekends feel longer by adding one memorable mission instead of letting time dissolve into scrolling.",
    slug: "how-to-make-weekends-feel-longer",
    title: "How To Make Weekends Feel Longer"
  },
  {
    description:
      "Social confidence does not require a personality transplant. It starts with safe, tiny reps.",
    slug: "simple-social-challenges-for-shy-people",
    title: "Simple Social Challenges For Shy People"
  }
];

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}
