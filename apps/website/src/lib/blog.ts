export type BlogPost = {
  category: string;
  description: string;
  faqs: Array<{
    answer: string;
    question: string;
  }>;
  generatorPrompt: string;
  keyword: string;
  missions: string[];
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
    category: "Anti-doomscroll",
    description:
      "A practical list of things to do instead of doomscrolling, with small real-life actions you can start in two minutes.",
    faqs: [
      {
        question: "What should I do instead of doomscrolling?",
        answer:
          "Start with one tiny physical action: stand up, walk for five minutes, text one person, drink water, or step outside without opening another app."
      },
      {
        question: "How do I stop scrolling when I am bored?",
        answer:
          "Make the replacement easier than the feed. Pick a short mission with a clear end point and do it before you negotiate with yourself."
      }
    ],
    generatorPrompt: "I am scrolling too much. Give me one quick anti-doomscroll mission.",
    keyword: "things to do instead of doomscrolling",
    missions: [
      "Put your phone face down and walk around your room for two minutes.",
      "Step outside for five minutes without headphones.",
      "Text one person something specific you appreciate about them."
    ],
    publishedAt: "2026-05-23",
    readTime: "4 min read",
    sections: [
      {
        heading: "Replace the feed with a frictionless first step",
        body:
          "Doomscrolling wins when the next real-world option feels vague. The fix is not a giant plan. It is a clear action that starts immediately and ends quickly."
      },
      {
        heading: "Use your body before your brain starts debating",
        body:
          "A short walk, a stretch, a glass of water, or one cleaned surface changes the state of the room and gives your attention something real to attach to."
      },
      {
        heading: "Make the replacement social or sensory",
        body:
          "The best alternatives usually involve movement, contact, light, sound, or novelty. That is why tiny missions work better than another productivity rule."
      }
    ],
    slug: "things-to-do-instead-of-doomscrolling",
    takeaways: [
      "Make the next real action smaller than the next scroll.",
      "Choose movement, sunlight, or contact first.",
      "Use a generator when you cannot pick the next thing yourself."
    ],
    title: "10 Things To Do Instead Of Doomscrolling"
  },
  {
    category: "Boredom ideas",
    description:
      "Fun things to do when bored that feel easy, social, active, and real instead of sending you back into the same feed loop.",
    faqs: [
      {
        question: "What are fun things to do when bored at home?",
        answer:
          "Try a five-minute reset: rearrange one small area, make a snack differently, record a short voice note, stretch, or start a tiny creative challenge."
      },
      {
        question: "What are fun things to do when bored outside?",
        answer:
          "Walk a route you never take, find a new cafe, take three photos of one color, or give yourself a simple city quest."
      }
    ],
    generatorPrompt: "I am bored. Give me something fun and real to do right now.",
    keyword: "fun things to do when bored",
    missions: [
      "Find something blue within five minutes and take one photo.",
      "Walk to the closest place you have never entered.",
      "Send your group chat one spontaneous low-pressure plan."
    ],
    publishedAt: "2026-05-23",
    readTime: "5 min read",
    sections: [
      {
        heading: "Boredom is a signal, not a failure",
        body:
          "Boredom often means your brain wants novelty. The feed gives novelty without memory. A real-life mission gives novelty with a story attached."
      },
      {
        heading: "Pick something with a visible finish line",
        body:
          "The best boredom ideas are small enough to start now: ten minutes, one message, one walk, one photo, one tiny experiment."
      },
      {
        heading: "Use context modes",
        body:
          "Morning reset, lunch break mission, Friday night mode, and weekend adventure all work because they match the moment instead of asking for a perfect plan."
      }
    ],
    slug: "fun-things-to-do-when-you-are-bored",
    takeaways: [
      "Boredom gets easier when the action is specific.",
      "Real-world novelty creates better memories than passive scrolling.",
      "Start with time, location, and mood."
    ],
    title: "Fun Things To Do When You Are Bored"
  },
  {
    category: "Confidence",
    description:
      "Small real-life challenges build confidence because they turn courage into repeatable, low-pressure reps.",
    faqs: [
      {
        question: "Can small challenges really build confidence?",
        answer:
          "Yes. Confidence grows when you repeatedly take safe, small actions that prove you can handle discomfort."
      }
    ],
    generatorPrompt: "I need confidence. Give me one small courage mission.",
    keyword: "confidence challenges",
    missions: [
      "Ask one simple question in person today.",
      "Record a 20-second confident voice note for yourself.",
      "Wear one slightly bolder detail than usual."
    ],
    publishedAt: "2026-05-23",
    readTime: "4 min read",
    sections: [
      {
        heading: "Confidence is built in reps",
        body:
          "Most people wait to feel confident before acting. GoFunMotion flips that order: take one safe action, then let confidence catch up."
      },
      {
        heading: "Low stakes matter",
        body:
          "The best courage missions do not require a dramatic personality change. They are small enough to complete and meaningful enough to remember."
      }
    ],
    slug: "small-real-life-challenges-build-confidence",
    takeaways: [
      "Confidence follows safe action.",
      "Small social risks are enough to create momentum.",
      "Repeatable missions beat vague advice."
    ],
    title: "How Small Real-Life Challenges Build Confidence"
  },
  {
    category: "Movement",
    description:
      "Movement changes your mood by interrupting the scrolling loop and giving your attention a physical reset.",
    faqs: [
      {
        question: "Why does movement improve mood?",
        answer:
          "Movement changes breathing, posture, light exposure, and attention. Even a short walk can interrupt a stuck mental loop."
      }
    ],
    generatorPrompt: "I feel stuck. Give me a movement challenge under 10 minutes.",
    keyword: "movement changes your mood",
    missions: [
      "Walk outside for seven minutes with your phone in your pocket.",
      "Do 15 squats and drink a glass of water.",
      "Stretch your shoulders for two minutes near natural light."
    ],
    publishedAt: "2026-05-23",
    readTime: "3 min read",
    sections: [
      {
        heading: "Your body is part of your attention system",
        body:
          "When you sit still and scroll, your body and attention both get narrow. Movement widens the frame and gives your mood a new input."
      },
      {
        heading: "Short is enough",
        body:
          "You do not need a full workout to shift state. A walk, stretch, or set of stairs can be enough to break the automatic loop."
      }
    ],
    slug: "why-movement-changes-your-mood",
    takeaways: [
      "Movement is a fast state change.",
      "Tiny physical actions can reset attention.",
      "A mission makes movement easier to start."
    ],
    title: "Why Movement Changes Your Mood"
  },
  {
    category: "Social courage",
    description:
      "Simple social challenges for shy people that create connection without forcing awkward dares or fake confidence.",
    faqs: [
      {
        question: "What is a good social challenge for shy people?",
        answer:
          "Send one sincere message, ask a simple question, or give one genuine compliment. Keep it respectful and low pressure."
      }
    ],
    generatorPrompt: "I am shy but want connection. Give me one safe social mission.",
    keyword: "social challenges for shy people",
    missions: [
      "Send one voice note instead of a text.",
      "Ask someone how their day is and listen to the full answer.",
      "Give one sincere compliment by message or in person."
    ],
    publishedAt: "2026-05-23",
    readTime: "4 min read",
    sections: [
      {
        heading: "Social confidence starts small",
        body:
          "You do not need to become loud. You need one safe moment where you choose contact instead of avoidance."
      },
      {
        heading: "Respectful is the rule",
        body:
          "Good social challenges do not pressure strangers or create discomfort. They create openings for real connection."
      }
    ],
    slug: "simple-social-challenges-for-shy-people",
    takeaways: [
      "Social missions should be small and respectful.",
      "Messaging counts when it creates real contact.",
      "Confidence grows through repeated low-pressure reps."
    ],
    title: "Simple Social Challenges For Shy People"
  },
  {
    category: "Weekend",
    description:
      "Make weekends feel longer by adding one memorable real-life mission instead of letting the whole weekend dissolve into scrolling.",
    faqs: [
      {
        question: "How can I make my weekend feel longer?",
        answer:
          "Add one novel activity with a clear memory: a new route, a new cafe, a sunset walk, a friend plan, or a small city quest."
      }
    ],
    generatorPrompt: "Make my weekend feel longer with one real-life mission.",
    keyword: "how to make weekends feel longer",
    missions: [
      "Try one place you have walked past but never entered.",
      "Take a sunset walk and do not post the photo immediately.",
      "Plan a one-hour micro-adventure before noon."
    ],
    publishedAt: "2026-05-23",
    readTime: "4 min read",
    sections: [
      {
        heading: "Memory makes time feel bigger",
        body:
          "Weekends disappear when every hour feels the same. One new real-world moment gives the weekend a marker."
      },
      {
        heading: "Do one thing early",
        body:
          "A small mission before the day drifts gives the rest of the weekend more shape."
      }
    ],
    slug: "how-to-make-weekends-feel-longer",
    takeaways: [
      "Novelty creates stronger weekend memories.",
      "One early mission can change the day.",
      "Keep the plan small enough to actually do."
    ],
    title: "How To Make Weekends Feel Longer"
  },
  {
    category: "Anti-doomscroll",
    description:
      "A simple anti-doomscroll routine for evenings when your phone is winning and the night starts to feel wasted.",
    faqs: [
      {
        question: "How do I stop doomscrolling at night?",
        answer:
          "Use a short reset: put the phone down, change rooms, drink water, step outside or near a window, then choose one non-screen action."
      }
    ],
    generatorPrompt: "It is nighttime and I am doomscrolling. Give me one reset mission.",
    keyword: "stop doomscrolling at night",
    missions: [
      "Put the phone across the room and clean one tiny area for three minutes.",
      "Stand near a window and name five things you can see.",
      "Write one sentence about how you want tomorrow morning to feel."
    ],
    publishedAt: "2026-05-23",
    readTime: "3 min read",
    sections: [
      {
        heading: "Night scrolling needs a physical interrupt",
        body:
          "At night, willpower is usually low. A physical change works better than a mental promise."
      },
      {
        heading: "Make the next action gentle",
        body:
          "The point is not to punish yourself for scrolling. The point is to give your nervous system a calmer landing."
      }
    ],
    slug: "how-to-stop-doomscrolling-at-night",
    takeaways: [
      "Move the phone before deciding what to do next.",
      "Use low-energy missions at night.",
      "End the loop with one real action."
    ],
    title: "How To Stop Doomscrolling At Night"
  },
  {
    category: "Boredom ideas",
    description:
      "Things to do when bored at home that are simple, screen-light, and designed to create momentum fast.",
    faqs: [
      {
        question: "What can I do when I am bored at home?",
        answer:
          "Pick one tiny mission: move for two minutes, rearrange one shelf, cook something simple, call someone, draw badly, or clean one corner."
      }
    ],
    generatorPrompt: "I am bored at home. Give me a short mission.",
    keyword: "things to do when bored at home",
    missions: [
      "Make a 10-second video about your current mood and do not post it.",
      "Draw something badly on purpose.",
      "Reset one tiny surface in your room."
    ],
    publishedAt: "2026-05-23",
    readTime: "4 min read",
    sections: [
      {
        heading: "Home can still feel playable",
        body:
          "You do not need to leave the house for a reset. You need a small constraint that makes the room feel less automatic."
      },
      {
        heading: "Use creative friction",
        body:
          "Bad drawing, quick photos, tiny cleaning, and low-stakes cooking all interrupt boredom without demanding perfection."
      }
    ],
    slug: "things-to-do-when-bored-at-home",
    takeaways: [
      "Home missions should be low-friction.",
      "Creative constraints make familiar spaces feel new.",
      "Two minutes is enough to start."
    ],
    title: "Things To Do When Bored At Home"
  },
  {
    category: "Explore",
    description:
      "City adventure ideas for people who want to get outside without planning a full trip or spending a lot of money.",
    faqs: [
      {
        question: "How do I explore my city when I have no plan?",
        answer:
          "Choose a small rule: take a different street, find a quiet place within ten minutes, visit one new cafe, or photograph one color."
      }
    ],
    generatorPrompt: "Give me a small city adventure mission.",
    keyword: "city adventure ideas",
    missions: [
      "Walk down a street you normally skip.",
      "Find the nearest quiet place within ten minutes.",
      "Take three photos of ordinary objects from unusual angles."
    ],
    publishedAt: "2026-05-23",
    readTime: "4 min read",
    sections: [
      {
        heading: "Exploration does not require a big plan",
        body:
          "A city becomes interesting when you add a rule. One color, one street, one new doorway, one quiet corner."
      },
      {
        heading: "Small discoveries compound",
        body:
          "The point is not tourism. The point is making your normal environment feel less invisible."
      }
    ],
    slug: "small-city-adventure-ideas",
    takeaways: [
      "Use simple rules to explore familiar places.",
      "Keep city missions safe and nearby.",
      "A ten-minute adventure can still create a memory."
    ],
    title: "Small City Adventure Ideas When You Need To Get Outside"
  },
  {
    category: "Couples",
    description:
      "Spontaneous date ideas for couples who want something fun today without overplanning or scrolling through options forever.",
    faqs: [
      {
        question: "What is a spontaneous date idea for tonight?",
        answer:
          "Take a no-phone walk, pick a random dessert place, ask one new question, or build a tiny surprise around something your partner likes."
      }
    ],
    generatorPrompt: "Give us a spontaneous couple challenge for tonight.",
    keyword: "spontaneous date ideas",
    missions: [
      "Take a 15-minute walk together with phones away.",
      "Choose a random dessert place and split one thing.",
      "Ask your partner one question you have never asked."
    ],
    publishedAt: "2026-05-23",
    readTime: "3 min read",
    sections: [
      {
        heading: "Small dates beat endless planning",
        body:
          "Couples do not always need a perfect reservation. Sometimes the better move is one specific shared mission."
      },
      {
        heading: "Make it easy to say yes",
        body:
          "Good spontaneous dates are nearby, low-pressure, and clear enough to start quickly."
      }
    ],
    slug: "spontaneous-date-ideas-for-couples",
    takeaways: [
      "A date mission should be easy to accept.",
      "No-phone time makes simple plans feel stronger.",
      "Novel questions can refresh connection."
    ],
    title: "Spontaneous Date Ideas For Couples"
  },
  {
    category: "Friends",
    description:
      "Fun challenges to do with friends when nobody can decide what to do and the group chat is going nowhere.",
    faqs: [
      {
        question: "What challenge can I do with friends today?",
        answer:
          "Try a no-phone walk, a quick photo mission, a random dessert stop, a small fitness challenge, or a ten-minute city quest."
      }
    ],
    generatorPrompt: "Give my friends and me a fun challenge for today.",
    keyword: "fun challenges to do with friends",
    missions: [
      "Send the group chat a plan with a time and place.",
      "Take a funny photo together with one random rule.",
      "Challenge a friend to a safe 20-squat reset."
    ],
    publishedAt: "2026-05-23",
    readTime: "4 min read",
    sections: [
      {
        heading: "Groups need a specific first move",
        body:
          "Most plans die because nobody names the first action. A challenge gives the group a simple thing to react to."
      },
      {
        heading: "Keep it safe and low pressure",
        body:
          "Friend challenges should create energy, not embarrassment. Make them optional, respectful, and easy to join."
      }
    ],
    slug: "fun-challenges-to-do-with-friends",
    takeaways: [
      "Specific prompts beat vague plans.",
      "Friend missions should be social, safe, and quick.",
      "A group chat needs a first move."
    ],
    title: "Fun Challenges To Do With Friends"
  },
  {
    category: "Mind reset",
    description:
      "Quick mood reset ideas for anxious, tired, or overstimulated moments when you need one small real-world action.",
    faqs: [
      {
        question: "What is a quick mood reset?",
        answer:
          "Try slow breathing for 60 seconds, drink water near natural light, clean one tiny area, or walk outside for five minutes."
      }
    ],
    generatorPrompt: "I need a calm mood reset under five minutes.",
    keyword: "quick mood reset ideas",
    missions: [
      "Breathe slowly for 60 seconds.",
      "Drink a glass of water near natural light.",
      "Write one thing you are avoiding, then one tiny next step."
    ],
    publishedAt: "2026-05-23",
    readTime: "3 min read",
    sections: [
      {
        heading: "Reset before you solve",
        body:
          "When you feel overloaded, the first goal is not to solve your whole life. It is to change state enough to choose clearly."
      },
      {
        heading: "Use sensory anchors",
        body:
          "Light, breath, water, movement, and a clean surface all give your attention something stable."
      }
    ],
    slug: "quick-mood-reset-ideas",
    takeaways: [
      "A mood reset should be short and physical.",
      "Sensory input can interrupt overthinking.",
      "One calm mission is enough to begin."
    ],
    title: "Quick Mood Reset Ideas"
  },
  {
    category: "Anti-doomscroll",
    description:
      "How to build an anti-doomscroll habit with tiny real-life challenges instead of relying on willpower alone.",
    faqs: [
      {
        question: "How do I build an anti-doomscroll habit?",
        answer:
          "Pair scrolling triggers with tiny replacement missions: stand up, move, text someone, step outside, or complete one daily challenge."
      }
    ],
    generatorPrompt: "Help me build an anti-doomscroll habit with one mission.",
    keyword: "anti doomscroll habit",
    missions: [
      "Every time you catch the feed loop, stand up before deciding what to do.",
      "Replace one scrolling break with a five-minute walk.",
      "Complete the daily mission before opening a short-form video app."
    ],
    publishedAt: "2026-05-23",
    readTime: "4 min read",
    sections: [
      {
        heading: "Habits need replacement, not just restriction",
        body:
          "Deleting apps may help, but the stronger habit is having a default real-life action ready."
      },
      {
        heading: "Reward the replacement",
        body:
          "XP, streaks, and badges work because they make the real-world action visible."
      }
    ],
    slug: "how-to-build-an-anti-doomscroll-habit",
    takeaways: [
      "Replace the scroll with a tiny action.",
      "Use triggers instead of vague goals.",
      "Reward real-life completions."
    ],
    title: "How To Build An Anti-Doomscroll Habit"
  },
  {
    category: "Daily challenge",
    description:
      "Why a daily challenge can make your day feel less automatic by giving you one small mission to complete.",
    faqs: [
      {
        question: "Why do daily challenges work?",
        answer:
          "They reduce decision fatigue. Instead of choosing from endless options, you get one small action that can be completed today."
      }
    ],
    generatorPrompt: "Give me one daily challenge that makes today less automatic.",
    keyword: "daily challenge ideas",
    missions: [
      "Do one thing before checking your main feed.",
      "Take a ten-minute walk and notice three details.",
      "Send one message that creates real contact."
    ],
    publishedAt: "2026-05-23",
    readTime: "3 min read",
    sections: [
      {
        heading: "One mission lowers the friction",
        body:
          "The power of a daily challenge is that it removes the decision. You just need to accept and complete."
      },
      {
        heading: "Streaks should support, not shame",
        body:
          "A streak is useful when it reminds you that small actions count. It should create momentum, not pressure."
      }
    ],
    slug: "daily-challenge-ideas-for-real-life",
    takeaways: [
      "Daily missions reduce choice overload.",
      "The best daily challenge is safe and specific.",
      "Completion should feel rewarding."
    ],
    title: "Daily Challenge Ideas For Real Life"
  },
  {
    category: "Creators",
    description:
      "Real-life challenge ideas for creators who want short-form content that is active, safe, and more interesting than another scroll.",
    faqs: [
      {
        question: "What are safe real-life challenge ideas for creators?",
        answer:
          "Use challenges based on movement, exploration, creativity, or kindness. Avoid danger, harassment, public pressure, and risky stunts."
      }
    ],
    generatorPrompt: "Give me a safe creator-friendly real-life challenge.",
    keyword: "real life challenge ideas",
    missions: [
      "Film a ten-second mood reset before and after a walk.",
      "Take three unusual photos of ordinary objects.",
      "Document one tiny city discovery without bothering anyone."
    ],
    publishedAt: "2026-05-23",
    readTime: "4 min read",
    sections: [
      {
        heading: "Good challenge content does not need danger",
        body:
          "The most reusable creator prompts are safe, relatable, and easy for viewers to try themselves."
      },
      {
        heading: "Make the viewer want to move",
        body:
          "A strong challenge should leave someone thinking, I could do that today."
      }
    ],
    slug: "real-life-challenge-ideas-for-creators",
    takeaways: [
      "Safe challenges can still be compelling.",
      "Creator prompts should be easy to replicate.",
      "Movement and novelty make short-form content stronger."
    ],
    title: "Real-Life Challenge Ideas For Creators"
  },
  {
    category: "Low energy",
    description:
      "Low-energy things to do when you want motion but do not have the motivation for a big plan.",
    faqs: [
      {
        question: "What can I do when I have low energy?",
        answer:
          "Choose a gentle mission: drink water, stretch, stand in natural light, clean one tiny spot, or take a very short walk."
      }
    ],
    generatorPrompt: "I have low energy. Give me one gentle mission.",
    keyword: "low energy things to do",
    missions: [
      "Stand up and stretch your shoulders for two minutes.",
      "Drink water and sit near natural light.",
      "Clean one tiny area for three minutes."
    ],
    publishedAt: "2026-05-23",
    readTime: "3 min read",
    sections: [
      {
        heading: "Low energy needs a low-friction win",
        body:
          "If the mission is too hard, it becomes another thing to avoid. Keep the first action almost too easy."
      },
      {
        heading: "Gentle still counts",
        body:
          "Momentum does not have to look intense. Sometimes the win is simply interrupting the stuck pattern."
      }
    ],
    slug: "low-energy-things-to-do-instead-of-scrolling",
    takeaways: [
      "Make the first action gentle.",
      "Low-energy missions should still create a state change.",
      "Completion matters more than intensity."
    ],
    title: "Low-Energy Things To Do Instead Of Scrolling"
  },
  {
    category: "Outside",
    description:
      "Touch grass ideas that help you get outside safely, notice the world again, and break the scrolling loop.",
    faqs: [
      {
        question: "What does touch grass mean in real life?",
        answer:
          "It means stepping away from the online loop and reconnecting with the physical world through movement, daylight, and attention."
      }
    ],
    generatorPrompt: "Give me a safe touch grass mission.",
    keyword: "touch grass ideas",
    missions: [
      "Walk outside for seven minutes and notice three sounds.",
      "Stand outside without headphones for five minutes.",
      "Take one photo of the sky and do not post it immediately."
    ],
    publishedAt: "2026-05-23",
    readTime: "3 min read",
    sections: [
      {
        heading: "Outside is an attention reset",
        body:
          "Light, distance, and movement give your brain different inputs than the feed."
      },
      {
        heading: "Keep it simple and safe",
        body:
          "Touch grass should mean a grounded reset, not a risky dare. Choose safe places and stay aware of your surroundings."
      }
    ],
    slug: "touch-grass-ideas-that-actually-help",
    takeaways: [
      "Outside missions should be safe and short.",
      "Do not turn the reset into another posting loop.",
      "Notice details you normally skip."
    ],
    title: "Touch Grass Ideas That Actually Help"
  },
  {
    category: "AI challenge generator",
    description:
      "How an AI challenge generator can help you choose what to do when you are bored, stuck, lonely, tired, or scrolling too much.",
    faqs: [
      {
        question: "What is an AI challenge generator?",
        answer:
          "It is a tool that turns your mood, time, location, and intensity into a specific real-world mission you can complete."
      }
    ],
    generatorPrompt: "Use my mood and time to generate a real-life challenge.",
    keyword: "AI challenge generator",
    missions: [
      "Choose your mood and generate one mission.",
      "Complete the mission before generating another.",
      "Save or share the challenge if it worked."
    ],
    publishedAt: "2026-05-23",
    readTime: "4 min read",
    sections: [
      {
        heading: "The value is the decision shortcut",
        body:
          "When you are bored or stuck, picking from endless options can become another feed. A generator should give you one useful next move."
      },
      {
        heading: "Good challenges are filtered for safety",
        body:
          "Real-life missions should be safe, legal, respectful, and simple enough to complete without pressure."
      }
    ],
    slug: "ai-challenge-generator-for-real-life",
    takeaways: [
      "The generator should reduce decision fatigue.",
      "Filters make missions more relevant.",
      "The goal is real action, not endless generation."
    ],
    title: "AI Challenge Generator For Real Life"
  }
];

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}
