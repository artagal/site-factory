import type { Challenge, ChallengeCategory } from "../types/challenge";
import { getRarityFromChallenge } from "./rarity";

const safetyNote =
  "Keep it safe, legal, respectful, and optional. Skip anything that does not fit your body, location, or situation.";

type Seed = Omit<Challenge, "id" | "xpReward" | "safetyNote">;

const xpByDifficulty = {
  easy: 30,
  medium: 70,
  bold: 120
} as const;

function challenge(category: ChallengeCategory, index: number, seed: Seed): Challenge {
  const xpReward = xpByDifficulty[seed.difficulty];

  return {
    ...seed,
    category,
    id: `${category.toLowerCase().replaceAll(" ", "-")}-${String(index + 1).padStart(2, "0")}`,
    rarity: getRarityFromChallenge({
      difficulty: seed.difficulty,
      timeEstimateMinutes: seed.timeEstimateMinutes,
      xpReward
    }),
    safetyNote,
    xpReward
  };
}

const antiDoomscroll: Seed[] = [
  ["Phone Flip Reset", "Put your phone face down and walk around your room for 2 minutes.", 2, "easy", "low", ["bored", "lazy"], ["at home", "anywhere"], "Breaking the automatic reach-for-phone loop gives your attention a clean restart."],
  ["Window Five", "Look out a window and name 5 things you can see, then take one slow breath.", 2, "easy", "low", ["tired", "anxious"], ["at home", "anywhere"], "Visual scanning pulls your brain back into the present moment."],
  ["No-Headphones Walk", "Go outside for 5 minutes without headphones and notice the soundscape around you.", 5, "easy", "low", ["bored", "anxious"], ["outside"], "Gentle sensory input helps reset attention without adding another feed."],
  ["Tab Funeral", "Close or delete one distracting tab, app shortcut, or notification source.", 2, "easy", "low", ["motivated", "tired"], ["at home", "anywhere"], "Removing one trigger makes the next good choice easier."],
  ["Stare At The Sky", "Step outside or near a window and look at the sky for 90 seconds.", 2, "easy", "low", ["tired", "anxious"], ["outside", "at home"], "Looking far away relaxes eye strain and interrupts digital tunnel vision."],
  ["Two-Minute Tidy", "Clean one tiny surface before you unlock your phone again.", 2, "easy", "low", ["lazy", "bored"], ["at home"], "A small visible win creates momentum without needing motivation first."],
  ["Scroll Swap", "When you want to scroll, do 10 slow shoulder rolls first.", 2, "easy", "low", ["lazy", "tired"], ["anywhere"], "Replacing the cue with movement makes the habit loop less automatic."],
  ["Doorway Pause", "Stand in a doorway, stretch both arms, and take 5 slow breaths.", 2, "easy", "low", ["anxious", "tired"], ["at home", "anywhere"], "A posture shift helps your nervous system downshift quickly."],
  ["Mini Walk Rule", "Walk to the nearest door, window, or mailbox before opening another app.", 5, "easy", "low", ["bored", "lazy"], ["at home", "outside"], "Movement adds friction to passive scrolling and gives you a real-world cue."],
  ["Real Object Hunt", "Find one object near you that has an interesting texture and inspect it for 30 seconds.", 2, "easy", "low", ["bored"], ["anywhere"], "Curiosity gives your brain novelty without needing a screen."]
].map(([title, description, timeEstimateMinutes, difficulty, intensity, moodTags, locationType, whyItHelps]) => ({
  title,
  description,
  timeEstimateMinutes,
  difficulty,
  intensity,
  moodTags,
  locationType,
  whyItHelps
} as Seed));

const move: Seed[] = [
  ["Touch Grass Sprint", "Go outside for 7 minutes. No phone. Walk until you notice 3 things you usually ignore.", 7, "easy", "low", ["bored", "lazy"], ["outside"], "Small physical movement breaks the scrolling loop and resets attention."],
  ["Stair Spark", "Take the stairs once today or walk one extra flight if stairs are available.", 5, "easy", "medium", ["motivated", "lazy"], ["anywhere", "in the city"], "A tiny burst of effort can change your state faster than thinking about it."],
  ["Squat Button", "Do 15 bodyweight squats at a steady pace.", 2, "easy", "medium", ["motivated", "bored"], ["at home", "anywhere"], "Leg movement increases energy and helps clear mental fog."],
  ["Block Loop", "Walk one block or one loop around your building.", 10, "easy", "low", ["tired", "bored"], ["outside", "in the city"], "A simple route removes decision fatigue and gets your body moving."],
  ["Shoulder Reset", "Stretch your shoulders and neck for 2 minutes, slowly and without forcing anything.", 2, "easy", "low", ["tired", "anxious"], ["at home", "anywhere"], "Releasing tension can improve mood and make your body feel less stuck."],
  ["Dance One Song", "Play one upbeat song and move however you want until it ends.", 5, "medium", "medium", ["bored", "motivated"], ["at home", "with friends"], "Music and movement create a quick emotional shift."],
  ["Sunlight Lap", "Walk outside or near natural light for 10 minutes.", 10, "easy", "low", ["tired", "lazy"], ["outside", "at home"], "Natural light helps your brain understand that the day is still happening."],
  ["Desk Escape", "Stand up, walk to another room, and come back only after 20 slow steps.", 2, "easy", "low", ["tired", "bored"], ["at home", "anywhere"], "Changing rooms interrupts the mental rut created by staying still."],
  ["Fresh Air Timer", "Set a 5-minute timer and walk outside until it ends.", 5, "easy", "low", ["anxious", "bored"], ["outside"], "A timer makes the challenge easy to start and easy to finish."],
  ["Posture Power-Up", "Stand tall for 60 seconds like you are about to enter a room with confidence.", 2, "easy", "low", ["anxious", "motivated"], ["anywhere"], "Body posture can nudge your confidence before your thoughts catch up."]
].map(([title, description, timeEstimateMinutes, difficulty, intensity, moodTags, locationType, whyItHelps]) => ({ title, description, timeEstimateMinutes, difficulty, intensity, moodTags, locationType, whyItHelps } as Seed));

const social: Seed[] = [
  ["Tiny Appreciation", "Text someone one specific thing you appreciate about them.", 3, "easy", "low", ["lonely", "social"], ["anywhere"], "Connection grows through specific, low-pressure contact."],
  ["Voice Note Upgrade", "Send a short voice message instead of a text.", 5, "medium", "medium", ["social", "lonely"], ["anywhere"], "Your voice adds warmth and makes digital connection feel more human."],
  ["Real Question", "Ask someone how their day is and listen without trying to fix it.", 5, "easy", "low", ["social", "lonely"], ["with friends", "anywhere"], "Attention is one of the simplest ways to create connection."],
  ["Compliment Spark", "Give one sincere compliment today, in person or by message.", 3, "medium", "medium", ["social", "anxious"], ["anywhere"], "Confidence grows when you practice small generous social risks."],
  ["Old Friend Ping", "Message someone you have not talked to in a while with a simple hello.", 5, "medium", "medium", ["lonely", "bored"], ["anywhere"], "Reopening a warm connection can shift loneliness into action."],
  ["Plan Seed", "Send one person a simple plan idea for this week.", 5, "medium", "medium", ["social", "motivated"], ["anywhere"], "Plans become real when you make the first invitation."],
  ["Gratitude Receipt", "Tell someone what they did that made your life easier recently.", 5, "medium", "medium", ["social"], ["anywhere"], "Specific gratitude strengthens relationships without being performative."],
  ["Listen Mode", "In your next conversation, ask one follow-up question before talking about yourself.", 5, "easy", "low", ["social"], ["with friends", "anywhere"], "Follow-up questions make people feel seen and help you be present."],
  ["Group Chat Spark", "Drop one spontaneous, low-pressure idea into a group chat.", 3, "easy", "low", ["bored", "social"], ["with friends", "anywhere"], "A tiny plan can turn a passive chat into a real moment."],
  ["Kind Check-In", "Ask someone if there is anything they are looking forward to this week.", 5, "easy", "low", ["lonely", "social"], ["anywhere"], "Positive questions can make connection feel lighter and easier."]
].map(([title, description, timeEstimateMinutes, difficulty, intensity, moodTags, locationType, whyItHelps]) => ({ title, description, timeEstimateMinutes, difficulty, intensity, moodTags, locationType, whyItHelps } as Seed));

const explore: Seed[] = [
  ["Blue Hunt", "Go outside and find three blue things you never noticed before.", 10, "easy", "low", ["bored", "adventurous"], ["outside", "in the city"], "A simple search turns familiar streets into a small adventure."],
  ["New Street Rule", "Walk down a street or aisle you rarely take.", 15, "easy", "low", ["adventurous", "bored"], ["outside", "in the city"], "Novel routes make your environment feel bigger and more alive."],
  ["Café Maybe", "Find a café, shop, or public place you have never visited and save it for later.", 15, "easy", "low", ["adventurous"], ["in the city", "outside"], "Discovery creates future options and breaks routine."],
  ["Quiet Place Finder", "Find a quiet place within 10 minutes of you.", 15, "easy", "low", ["anxious", "adventurous"], ["outside", "in the city"], "Knowing where calm exists nearby makes your world feel more usable."],
  ["Texture Walk", "Take a short walk and photograph one interesting texture.", 10, "easy", "low", ["creative", "bored"], ["outside", "in the city"], "Creative noticing makes everyday places feel fresh."],
  ["Sunset Scout", "Find one place near you that would be good for watching sunset.", 30, "medium", "low", ["adventurous", "romantic"], ["outside", "in the city"], "Scouting a future moment gives your day a cinematic edge."],
  ["Tiny Tourist", "Pretend you are visiting your neighborhood for the first time for 15 minutes.", 15, "medium", "medium", ["adventurous", "bored"], ["outside", "in the city"], "A tourist mindset restores curiosity in familiar places."],
  ["Bench Break", "Find a bench, step, or safe public spot and sit there for 5 minutes.", 10, "easy", "low", ["tired", "anxious"], ["outside", "in the city"], "Being still outside can feel more restorative than staying still online."],
  ["Local Map Peek", "Open a map, pick a nearby green space or landmark, and walk toward it.", 30, "medium", "medium", ["adventurous", "motivated"], ["outside", "in the city"], "A destination converts vague boredom into a simple mission."],
  ["Photo Proof", "Take one photo that proves you left your usual route today.", 15, "easy", "low", ["bored", "adventurous"], ["outside", "in the city"], "A small artifact helps your brain remember that the day was different."]
].map(([title, description, timeEstimateMinutes, difficulty, intensity, moodTags, locationType, whyItHelps]) => ({ title, description, timeEstimateMinutes, difficulty, intensity, moodTags, locationType, whyItHelps } as Seed));

const confidence: Seed[] = [
  ["Tiny Courage Mission", "Give one genuine compliment to someone today, in person or by message.", 3, "medium", "medium", ["anxious", "social"], ["anywhere"], "Confidence grows when you take small social risks."],
  ["Question Rep", "Ask a simple question to a person or staff member instead of silently guessing.", 5, "medium", "medium", ["anxious", "motivated"], ["in the city", "anywhere"], "Low-stakes asking trains your nervous system that contact is survivable."],
  ["Bold Detail", "Wear or add one slightly bolder detail than usual.", 5, "easy", "low", ["motivated"], ["anywhere"], "Small expression choices help you practice being seen."],
  ["Twenty-Second Voice", "Record a 20-second video or audio note of yourself speaking clearly.", 5, "medium", "medium", ["anxious", "motivated"], ["at home"], "Hearing yourself practice makes confidence more familiar."],
  ["One Small No", "Say no to one small thing you do not actually want today.", 5, "bold", "high", ["motivated", "anxious"], ["anywhere"], "Boundaries build self-trust one rep at a time."],
  ["Eye Contact Rep", "In one conversation, make comfortable eye contact for one extra second.", 5, "medium", "medium", ["social", "anxious"], ["anywhere"], "Tiny presence cues can make you feel more grounded."],
  ["Opinion Out Loud", "Say one honest preference out loud, even if it is small.", 5, "medium", "medium", ["motivated", "social"], ["with friends", "anywhere"], "Naming preferences helps you stop disappearing into default choices."],
  ["Solo Order", "Order or request something clearly without apologizing for it.", 5, "medium", "medium", ["anxious", "motivated"], ["in the city"], "Direct speech is a practical confidence skill."],
  ["Mirror Reset", "Look in the mirror and say one sentence you need to hear today.", 2, "easy", "low", ["anxious", "tired"], ["at home"], "Self-directed language can shift the tone of your inner loop."],
  ["Brave Button", "Do one tiny thing you have been postponing because it feels awkward.", 15, "bold", "high", ["motivated", "anxious"], ["anywhere"], "Avoidance shrinks when you take one contained action."]
].map(([title, description, timeEstimateMinutes, difficulty, intensity, moodTags, locationType, whyItHelps]) => ({ title, description, timeEstimateMinutes, difficulty, intensity, moodTags, locationType, whyItHelps } as Seed));

const couples: Seed[] = [
  ["No-Phone Walk", "Take a 15-minute walk together with no phones in hand.", 15, "easy", "low", ["romantic", "tired"], ["with partner", "outside"], "Shared attention turns ordinary time into connection."],
  ["New Question", "Ask your partner one question you have never asked before.", 10, "easy", "low", ["romantic"], ["with partner", "at home"], "Novel questions keep familiarity from becoming autopilot."],
  ["Dessert Dice", "Choose a dessert place at random and go or plan when to go.", 30, "medium", "medium", ["romantic", "adventurous"], ["with partner", "in the city"], "Tiny spontaneity makes a normal day feel like a date."],
  ["Compliment Trade", "Each person gives one specific compliment that is not about appearance.", 5, "easy", "low", ["romantic"], ["with partner", "anywhere"], "Specific appreciation creates warmth without needing a big plan."],
  ["Tiny Surprise", "Plan one tiny surprise for tonight or this week.", 15, "medium", "medium", ["romantic", "motivated"], ["with partner", "anywhere"], "Anticipation adds energy to routine."],
  ["Memory Walk", "Walk together and each share one favorite memory from the past year.", 15, "easy", "low", ["romantic"], ["with partner", "outside"], "Remembering good moments strengthens the story you share."],
  ["Kitchen Soundtrack", "Make a snack or drink together while playing one song each.", 15, "easy", "low", ["romantic", "lazy"], ["with partner", "at home"], "Simple rituals become more fun with intentional sound and attention."],
  ["Two-Option Date", "Each person offers one low-effort date idea, then pick one.", 10, "easy", "low", ["romantic", "bored"], ["with partner"], "Reducing choices makes action more likely."],
  ["Photo Booth Minute", "Take three silly photos together without judging them.", 5, "easy", "low", ["romantic", "bored"], ["with partner"], "Play creates closeness without requiring deep conversation."],
  ["Future Micro-Plan", "Plan one small thing you want to do together in the next 7 days.", 10, "easy", "low", ["romantic", "motivated"], ["with partner"], "Future plans help relationships feel active and alive."]
].map(([title, description, timeEstimateMinutes, difficulty, intensity, moodTags, locationType, whyItHelps]) => ({ title, description, timeEstimateMinutes, difficulty, intensity, moodTags, locationType, whyItHelps } as Seed));

const friends: Seed[] = [
  ["Spontaneous Plan Drop", "Send your group chat one low-pressure plan for today or tomorrow.", 5, "medium", "medium", ["bored", "social"], ["with friends", "anywhere"], "Someone has to create the first spark."],
  ["Pushup Ping", "Challenge a friend to do 20 pushups, squats, or jumping jacks with you remotely.", 5, "medium", "medium", ["motivated", "social"], ["with friends", "at home"], "Friendly accountability makes movement more fun."],
  ["One-Round Game", "Play one quick party, card, or guessing game.", 15, "easy", "low", ["bored", "social"], ["with friends", "at home"], "Short games make hangouts feel intentional without overplanning."],
  ["Funny Photo Quest", "Take a funny photo together that captures the mood of the day.", 5, "easy", "low", ["bored", "social"], ["with friends"], "Shared artifacts become memories."],
  ["Snack Mission", "Pick one snack or drink destination and go together.", 30, "easy", "low", ["social", "adventurous"], ["with friends", "in the city"], "Food quests are easy entry points into real-world plans."],
  ["Compliment Circle", "Each person says one thing they appreciate about another person.", 10, "medium", "medium", ["social"], ["with friends"], "Positive attention strengthens group energy."],
  ["Playlist Swap", "Everyone plays one song they are into right now.", 15, "easy", "low", ["social", "lazy"], ["with friends", "at home"], "Music makes low-energy hangouts feel curated."],
  ["Walk And Talk", "Invite a friend to walk for 15 minutes while you talk.", 15, "easy", "low", ["lonely", "social"], ["with friends", "outside"], "Side-by-side movement makes conversation easier."],
  ["Mini Tournament", "Create a tiny competition: best photo, fastest tidy, or weirdest object nearby.", 15, "medium", "medium", ["bored", "social"], ["with friends"], "Playful constraints create instant energy."],
  ["Two-Person Errand", "Turn one boring errand into a friend mission.", 30, "easy", "low", ["bored", "social"], ["with friends", "in the city"], "Company makes ordinary tasks feel lighter."]
].map(([title, description, timeEstimateMinutes, difficulty, intensity, moodTags, locationType, whyItHelps]) => ({ title, description, timeEstimateMinutes, difficulty, intensity, moodTags, locationType, whyItHelps } as Seed));

const creative: Seed[] = [
  ["Three Weird Angles", "Take 3 photos of ordinary objects from unusual angles.", 10, "easy", "low", ["creative", "bored"], ["anywhere"], "Creative constraints train you to see your world differently."],
  ["One Sentence Diary", "Write one sentence about today that sounds like a movie title.", 2, "easy", "low", ["tired", "creative"], ["anywhere"], "Small creative expression makes the day feel less automatic."],
  ["Bad Drawing Pass", "Draw something badly on purpose for 3 minutes.", 5, "easy", "low", ["creative", "anxious"], ["at home", "anywhere"], "Removing pressure makes creativity easier to start."],
  ["Mood Video", "Make a 10-second video that captures your current mood without showing your face if you prefer.", 5, "easy", "low", ["creative", "bored"], ["anywhere"], "Creative output turns passive feeling into active expression."],
  ["Color Collection", "Find and photograph five objects with the same color.", 15, "easy", "low", ["creative", "adventurous"], ["anywhere", "outside"], "A color mission transforms your environment into a scavenger hunt."],
  ["Tiny Soundtrack", "Pick one song that would be the soundtrack for this exact moment.", 3, "easy", "low", ["creative", "tired"], ["anywhere"], "Naming the mood gives it shape and makes it easier to move through."],
  ["Caption The Room", "Write a funny caption for the room or place you are in.", 2, "easy", "low", ["creative", "bored"], ["anywhere"], "Humor creates distance from boredom."],
  ["Object Story", "Choose one object nearby and invent a 3-sentence backstory for it.", 5, "easy", "low", ["creative", "bored"], ["anywhere"], "Storytelling turns ordinary surroundings into raw material."],
  ["Micro Moodboard", "Save or photograph three real-world textures that match your current vibe.", 15, "easy", "low", ["creative", "adventurous"], ["anywhere"], "Collecting visual references gets you out of passive consumption."],
  ["Ten-Word Poem", "Write a 10-word poem about something you can see right now.", 5, "easy", "low", ["creative", "tired"], ["anywhere"], "A tiny creative win proves you can make something quickly."]
].map(([title, description, timeEstimateMinutes, difficulty, intensity, moodTags, locationType, whyItHelps]) => ({ title, description, timeEstimateMinutes, difficulty, intensity, moodTags, locationType, whyItHelps } as Seed));

const mindReset: Seed[] = [
  ["Sixty-Second Breath", "Breathe slowly for 60 seconds. Count longer exhales than inhales.", 2, "easy", "low", ["anxious", "tired"], ["anywhere"], "Slow exhaling tells your nervous system that you are not in immediate danger."],
  ["Water And Light", "Drink a glass of water and stand near natural light for one minute.", 2, "easy", "low", ["tired", "lazy"], ["at home", "anywhere"], "Hydration plus light is a simple body-level reset."],
  ["Avoidance Note", "Write one thing you are avoiding, then write the smallest next action.", 5, "easy", "low", ["anxious", "motivated"], ["at home", "anywhere"], "Naming avoidance turns a vague cloud into a manageable step."],
  ["Tiny Area Clean", "Clean one tiny area for 3 minutes and stop when the timer ends.", 5, "easy", "low", ["anxious", "lazy"], ["at home"], "Controlled tidying gives your brain a quick sense of order."],
  ["Unclench Check", "Relax your jaw, shoulders, and hands three times.", 2, "easy", "low", ["anxious", "tired"], ["anywhere"], "Your body often holds stress before your mind notices it."],
  ["Future Self Ping", "Ask: what would make the next hour 5 percent better?", 2, "easy", "low", ["tired", "motivated"], ["anywhere"], "Tiny improvements are easier to act on than big life changes."],
  ["Noise Down", "Spend 5 minutes with no music, video, podcast, or feed.", 5, "easy", "low", ["tired", "anxious"], ["anywhere"], "Reducing input gives your attention room to recover."],
  ["Grounding Five", "Name 5 things you see, 4 you feel, 3 you hear, 2 you smell, and 1 you taste.", 5, "easy", "low", ["anxious"], ["anywhere"], "Grounding redirects attention from spiraling thoughts to sensory reality."],
  ["One Thought Dump", "Write every distracting thought for 3 minutes without editing.", 5, "easy", "low", ["anxious", "tired"], ["at home"], "Externalizing thoughts can make them feel less loud."],
  ["Reset Walk", "Walk slowly for 5 minutes and match your breath to your steps.", 5, "easy", "low", ["anxious", "tired"], ["outside", "anywhere"], "Rhythmic movement is a practical calm-down tool."]
].map(([title, description, timeEstimateMinutes, difficulty, intensity, moodTags, locationType, whyItHelps]) => ({ title, description, timeEstimateMinutes, difficulty, intensity, moodTags, locationType, whyItHelps } as Seed));

const fitness: Seed[] = [
  ["Wall Push Set", "Do 20 wall pushups or 10 regular pushups.", 5, "easy", "medium", ["motivated", "lazy"], ["at home", "anywhere"], "Low-barrier strength work creates energy quickly."],
  ["Core Minute", "Hold a plank or modified plank for up to 60 seconds.", 2, "medium", "medium", ["motivated"], ["at home"], "A short effort builds body awareness and focus."],
  ["Mobility Snack", "Do 5 slow lunges per side, using support if needed.", 5, "medium", "medium", ["motivated", "tired"], ["at home", "anywhere"], "Mobility work wakes up muscles that sitting turns off."],
  ["Walk Fast Finish", "Walk fast for 3 minutes, then slow down for 2 minutes.", 5, "medium", "medium", ["motivated"], ["outside", "in the city"], "A short pace change boosts circulation without a full workout."],
  ["Calf Raise Queue", "Do 25 calf raises while waiting for something.", 2, "easy", "low", ["lazy", "motivated"], ["anywhere"], "Habit-stacking turns idle time into movement."],
  ["Stretch Circuit", "Do 30 seconds each: hamstrings, chest, shoulders, ankles.", 5, "easy", "low", ["tired", "motivated"], ["at home"], "Short mobility reduces stiffness and makes movement feel easier."],
  ["Stairs Challenge", "Climb stairs for 5 minutes at a safe pace.", 5, "medium", "high", ["motivated"], ["in the city", "anywhere"], "A safe stair burst builds intensity fast."],
  ["Balance Reset", "Stand on one foot for 30 seconds each side.", 2, "easy", "low", ["tired", "lazy"], ["anywhere"], "Balance work brings attention back into your body."],
  ["Mini Sweat", "Do 3 rounds: 10 squats, 10 jumping jacks, 10-second rest.", 10, "medium", "high", ["motivated"], ["at home"], "A tiny circuit can convert restless energy into momentum."],
  ["Cool Down Walk", "Take a gentle 10-minute walk after eating or working.", 10, "easy", "low", ["tired", "lazy"], ["outside", "in the city"], "Easy walking helps digestion, mood, and energy without pressure."]
].map(([title, description, timeEstimateMinutes, difficulty, intensity, moodTags, locationType, whyItHelps]) => ({ title, description, timeEstimateMinutes, difficulty, intensity, moodTags, locationType, whyItHelps } as Seed));

const allSeeds: Array<[ChallengeCategory, Seed[]]> = [
  ["Anti-Doomscroll", antiDoomscroll],
  ["Move", move],
  ["Social", social],
  ["Explore", explore],
  ["Confidence", confidence],
  ["Couples", couples],
  ["Friends", friends],
  ["Creative", creative],
  ["Mind Reset", mindReset],
  ["Fitness", fitness]
];

export const challengeTemplates: Challenge[] = allSeeds.flatMap(([category, seeds]) =>
  seeds.map((seed, index) => challenge(category, index, seed))
);

export const challengeCategories = allSeeds.map(([category]) => category);

export const categoryCopy: Record<ChallengeCategory, { blurb: string; gradient: string; sample: string }> = {
  "Anti-Doomscroll": {
    blurb: "Short missions that break the feed loop and bring your attention back.",
    gradient: "from-fuchsia-500 via-purple-500 to-blue-500",
    sample: "Phone Flip Reset"
  },
  Move: {
    blurb: "Tiny movement challenges for energy, posture, and momentum.",
    gradient: "from-lime-400 via-emerald-400 to-cyan-400",
    sample: "Touch Grass Sprint"
  },
  Social: {
    blurb: "Low-pressure connection prompts that make people feel closer.",
    gradient: "from-pink-500 via-rose-500 to-orange-400",
    sample: "Tiny Appreciation"
  },
  Explore: {
    blurb: "City and neighborhood quests that make familiar places feel new.",
    gradient: "from-blue-500 via-cyan-400 to-lime-300",
    sample: "Tiny Tourist"
  },
  Confidence: {
    blurb: "Small courage reps for speaking up, being seen, and building trust in yourself.",
    gradient: "from-violet-500 via-fuchsia-500 to-pink-500",
    sample: "Tiny Courage Mission"
  },
  Couples: {
    blurb: "Spontaneous prompts for dates, warmth, and shared memories.",
    gradient: "from-rose-500 via-pink-500 to-purple-500",
    sample: "No-Phone Walk"
  },
  Friends: {
    blurb: "Group missions that turn passive chats into real plans.",
    gradient: "from-orange-400 via-pink-500 to-purple-500",
    sample: "Spontaneous Plan Drop"
  },
  Creative: {
    blurb: "Photo, video, writing, and observation sparks for expressive days.",
    gradient: "from-yellow-300 via-pink-400 to-purple-500",
    sample: "Three Weird Angles"
  },
  "Mind Reset": {
    blurb: "Calm, grounding missions for noisy brains and heavy days.",
    gradient: "from-sky-400 via-blue-500 to-violet-500",
    sample: "Sixty-Second Breath"
  },
  Fitness: {
    blurb: "Light fitness hits that feel doable, not punishing.",
    gradient: "from-green-400 via-lime-400 to-yellow-300",
    sample: "Mini Sweat"
  }
};
