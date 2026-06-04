export type PartnerDealType = {
  customerTypes: string[];
  dealExamples: string[];
  description: string;
  id: string;
  name: string;
  offerTypes: string[];
};

export const partnerDealTypes: PartnerDealType[] = [
  {
    customerTypes: ["Couples", "Friend groups", "Tourists", "Team outings"],
    dealExamples: ["Escape Room Tonight - Was $120, Now $59", "Last room at 8:30 PM - 2-6 players"],
    description: "Great fit because escape rooms often have fixed rooms and unused time windows.",
    id: "escape-rooms",
    name: "Escape rooms",
    offerTypes: ["Last-minute room slot", "Slow-hour discount", "Group deal", "Weeknight opening"]
  },
  {
    customerTypes: ["Friends", "Families", "Date nights", "Teens and college groups"],
    dealExamples: ["Bowling Lane Tonight - Was $50, Now $25", "Mini Golf Friends Deal - 4 spots left"],
    description: "Casual entertainment venues can discount lanes, game cards, and timed sessions.",
    id: "bowling-arcade-mini-golf",
    name: "Bowling, arcades, and mini golf",
    offerTypes: ["Open lane", "Arcade package", "Mini golf tee time", "Weekday family pass"]
  },
  {
    customerTypes: ["Couples", "Friend groups", "Solo creatives", "Birthday groups"],
    dealExamples: ["Pottery Date Night - Was $60, Now $39", "Paint Night Seat - 40% off tonight"],
    description: "Studios can fill unused class seats without discounting their whole calendar.",
    id: "creative-studios",
    name: "Pottery, art, and painting studios",
    offerTypes: ["Class seat", "Workshop opening", "Date-night package", "Last-minute cancellation spot"]
  },
  {
    customerTypes: ["Solo visitors", "Dates", "Friends", "People new in town"],
    dealExamples: ["Salsa Trial Class - Tonight $10", "Beginner Dance Drop-In - 5 spots left"],
    description: "Dance studios need fresh trial students and can monetize open beginner classes.",
    id: "dance-studios",
    name: "Dance studios",
    offerTypes: ["Trial class", "Beginner night", "Drop-in class", "Couples class"]
  },
  {
    customerTypes: ["Solo users", "Beginners", "Active dates", "Wellness-focused users"],
    dealExamples: ["Boxing Trial Class - Was $30, Now $12", "Yoga Slow Hour - 50% off"],
    description: "Fitness studios can turn unsold class capacity into first-time customer acquisition.",
    id: "fitness-studios",
    name: "Fitness, yoga, pilates, and boxing",
    offerTypes: ["First class trial", "Unused class spot", "Slow-hour class", "Intro pass"]
  },
  {
    customerTypes: ["Date nights", "Friends", "Tourists", "People bored tonight"],
    dealExamples: ["Comedy Night Tonight - Was $35, Now $15", "2-for-1 live show seats"],
    description: "Shows can recover revenue from unsold seats close to start time.",
    id: "comedy-live-shows",
    name: "Comedy clubs and live shows",
    offerTypes: ["Unsold tickets", "Last-minute seats", "Weekday show discount", "2-for-1 tickets"]
  },
  {
    customerTypes: ["Parents", "Families", "Weekend planners", "Rainy-day users"],
    dealExamples: ["Kids Indoor Play - Was $25, Now $12", "Trampoline Park Family Pass - Today only"],
    description: "Kids venues can fill weekday and weather-sensitive time windows.",
    id: "kids-activity-centers",
    name: "Kids activity centers",
    offerTypes: ["Indoor play pass", "Trampoline slot", "Weekday family discount", "Rainy-day offer"]
  },
  {
    customerTypes: ["Couples", "Friends", "Food lovers", "Tourists"],
    dealExamples: ["Cooking Class Tonight - Was $85, Now $49", "Dessert Workshop - 3 seats left"],
    description: "Food experiences can sell remaining seats without running broad coupons.",
    id: "cooking-food-workshops",
    name: "Cooking classes and food workshops",
    offerTypes: ["Class seat", "Couples cooking night", "Tasting event", "Dessert workshop"]
  },
  {
    customerTypes: ["Tourists", "Families", "Solo explorers", "Date nights"],
    dealExamples: ["Museum Night Pass - Was $30, Now $15", "Guided Walk - 30% off today"],
    description: "Culture and tour operators can move capacity into clear same-day offers.",
    id: "museums-tours",
    name: "Museums, exhibits, and local tours",
    offerTypes: ["Evening admission", "Tour slot", "Museum night", "Guided walk"]
  },
  {
    customerTypes: ["Solo reset users", "Couples", "Wellness users", "Low-energy plans"],
    dealExamples: ["Sauna + Cold Plunge - Was $45, Now $25", "Massage Cancellation Slot - Today"],
    description: "Wellness businesses can monetize cancellations and off-peak appointment windows.",
    id: "wellness-spa",
    name: "Wellness, spa, sauna, and massage",
    offerTypes: ["Same-day appointment", "Sauna pass", "Massage cancellation", "Weekday wellness pass"]
  },
  {
    customerTypes: ["Friends", "Solo explorers", "Creative communities", "Date nights"],
    dealExamples: ["Open Mic Night - Tonight $8", "Pop-up Workshop - 4 seats left"],
    description: "Pop-ups and events need simple distribution when tickets or seats remain.",
    id: "events-popups",
    name: "Local events and pop-ups",
    offerTypes: ["Unsold tickets", "Workshop seats", "Popup entry", "Open mic tickets"]
  },
  {
    customerTypes: ["Tourists", "Couples", "Friends", "Active users"],
    dealExamples: ["Kayak Rental Today - Was $40, Now $22", "Sunset Bike Tour - 2 spots left"],
    description: "Outdoor operators can discount weather-dependent or late-booking inventory.",
    id: "outdoor-experiences",
    name: "Outdoor experiences and rentals",
    offerTypes: ["Kayak rental", "Bike tour", "Paddleboard slot", "Sunset package"]
  }
];

export const dealFormatExamples = [
  "Tonight only",
  "This weekend",
  "Last-minute slot",
  "Slow-hour deal",
  "2 spots left",
  "Group discount",
  "First class trial",
  "Date night deal",
  "Family pass",
  "Rainy day deal"
];

export function getPartnerDealTypeNames() {
  return partnerDealTypes.map((type) => type.name);
}
