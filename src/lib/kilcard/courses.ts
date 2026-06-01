export interface CourseInfo {
  id: string;
  name: string;
  city: string;
  holes: 9 | 18;
  pars: Array<3 | 4 | 5>;
}

export const AR_COURSES: CourseInfo[] = [
  // ── Little Rock / North Little Rock ──────────────────────────────────────
  {
    id: "rebsamen-championship-little-rock",
    name: "Rebsamen Park – Championship",
    city: "Little Rock",
    holes: 18,
    pars: [4,5,3,4,4,4,3,5,4, 4,4,5,4,3,5,3,4,4],
  },
  {
    id: "rebsamen-executive-little-rock",
    name: "Rebsamen Park – Executive",
    city: "Little Rock",
    holes: 9,
    pars: [4,4,3,3,4,3,3,4,4],
  },
  {
    id: "burns-park-championship-north-little-rock",
    name: "Burns Park – Championship",
    city: "North Little Rock",
    holes: 18,
    pars: [4,3,4,5,3,4,4,3,5, 4,5,4,3,4,4,3,4,5],
  },
  {
    id: "burns-park-tournament-north-little-rock",
    name: "Burns Park – Tournament",
    city: "North Little Rock",
    holes: 18,
    pars: [4,4,3,4,5,4,3,4,4, 4,5,5,3,4,4,3,4,3],
  },
  {
    id: "country-club-of-little-rock",
    name: "Country Club of Little Rock",
    city: "Little Rock",
    holes: 18,
    pars: [4,4,4,4,4,3,5,4,3, 4,3,4,4,4,5,3,4,5],
  },

  // ── Maumelle / Roland ─────────────────────────────────────────────────────
  {
    id: "country-club-of-arkansas-maumelle",
    name: "The Country Club of Arkansas",
    city: "Maumelle",
    holes: 18,
    pars: [4,4,3,5,4,3,4,4,5, 4,5,3,4,4,3,4,4,5],
  },
  {
    id: "maumelle-country-club",
    name: "Maumelle Country Club",
    city: "Maumelle",
    holes: 18,
    pars: [4,5,4,4,3,5,4,3,4, 4,4,5,3,4,5,4,3,4],
  },
  {
    id: "alotian-golf-club-roland",
    name: "Alotian Golf Club",
    city: "Roland",
    holes: 18,
    pars: [5,4,4,3,4,3,4,5,4, 4,3,4,4,5,4,3,5,4],
  },

  // ── Fayetteville ─────────────────────────────────────────────────────────
  {
    id: "razorback-park-fayetteville",
    name: "Razorback Park Golf Course",
    city: "Fayetteville",
    holes: 18,
    pars: [4,4,4,3,5,5,3,4,4, 4,4,4,3,3,5,4,5,4],
  },
  {
    id: "stonebridge-meadows-fayetteville",
    name: "Stonebridge Meadows Golf Club",
    city: "Fayetteville",
    holes: 18,
    pars: [4,5,3,4,4,3,4,5,4, 4,5,4,3,4,4,4,3,5],
  },
  {
    id: "fayetteville-country-club",
    name: "Fayetteville Country Club",
    city: "Fayetteville",
    holes: 18,
    pars: [5,4,4,4,5,4,3,4,3, 4,4,3,4,4,3,5,3,4],
  },
  {
    id: "links-at-fayetteville",
    name: "The Links at Fayetteville",
    city: "Fayetteville",
    holes: 9,
    pars: [4,4,3,4,3,4,4,5,4],
  },

  // ── Rogers ────────────────────────────────────────────────────────────────
  {
    id: "pinnacle-country-club-rogers",
    name: "Pinnacle Country Club",
    city: "Rogers",
    holes: 18,
    pars: [4,5,3,4,4,3,5,4,4, 4,3,4,4,5,3,4,3,5],
  },
  {
    id: "shadow-valley-country-club-rogers",
    name: "Shadow Valley Country Club",
    city: "Rogers",
    holes: 18,
    pars: [4,4,5,4,4,3,4,3,5, 4,4,5,3,4,4,5,3,4],
  },
  {
    id: "prairie-creek-country-club-rogers",
    name: "Prairie Creek Country Club",
    city: "Rogers",
    holes: 18,
    pars: [4,3,4,5,4,5,3,4,4, 4,3,4,5,4,5,4,4,3],
  },

  // ── Springdale ────────────────────────────────────────────────────────────
  {
    id: "springdale-country-club",
    name: "Springdale Country Club",
    city: "Springdale",
    holes: 18,
    pars: [4,5,3,4,3,5,5,4,3, 4,3,5,3,4,5,4,4,4],
  },
  {
    id: "brush-creek-springdale",
    name: "Brush Creek Golf Course",
    city: "Springdale",
    holes: 9,
    pars: [3,5,4,3,4,4,5,4,4],
  },
  {
    id: "links-at-springdale",
    name: "The Links at Springdale",
    city: "Springdale",
    holes: 9,
    pars: [4,4,3,3,4,3,5,3,4],
  },

  // ── Bentonville ───────────────────────────────────────────────────────────
  {
    id: "links-at-bentonville",
    name: "Links at Bentonville",
    city: "Bentonville",
    holes: 9,
    pars: [4,3,4,3,4,3,4,3,4],
  },
  {
    id: "links-at-rainbow-curve-bentonville",
    name: "Links at Rainbow Curve",
    city: "Bentonville",
    holes: 9,
    pars: [5,4,3,4,4,3,4,3,5],
  },

  // ── Bella Vista ───────────────────────────────────────────────────────────
  {
    id: "bella-vista-country-club-course",
    name: "Bella Vista CC – Country Club",
    city: "Bella Vista",
    holes: 18,
    pars: [4,3,5,4,4,3,4,5,4, 4,4,5,4,3,4,5,3,4],
  },
  {
    id: "bella-vista-scotsdale",
    name: "Bella Vista CC – Scotsdale",
    city: "Bella Vista",
    holes: 18,
    pars: [4,4,5,3,4,4,3,5,4, 4,4,3,4,4,3,5,4,5],
  },
  {
    id: "bella-vista-dogwood-hills",
    name: "Bella Vista CC – Dogwood Hills",
    city: "Bella Vista",
    holes: 18,
    pars: [4,3,4,4,5,4,3,4,5, 5,4,4,4,4,4,3,4,3],
  },
  {
    id: "bella-vista-kingswood",
    name: "Bella Vista CC – Kingswood",
    city: "Bella Vista",
    holes: 18,
    pars: [4,3,4,5,4,4,3,4,4, 3,4,3,4,5,4,5,3,5],
  },
  {
    id: "bella-vista-highlands",
    name: "Bella Vista CC – Highlands",
    city: "Bella Vista",
    holes: 18,
    pars: [4,4,5,4,3,4,4,5,3, 4,3,5,4,4,4,3,5,4],
  },

  // ── Fort Smith / Greenwood ────────────────────────────────────────────────
  {
    id: "hardscrabble-country-club-fort-smith",
    name: "Hardscrabble Country Club",
    city: "Fort Smith",
    holes: 18,
    pars: [4,3,5,3,4,5,4,3,4, 4,5,4,4,4,3,4,3,4],
  },
  {
    id: "deer-trails-country-club-fort-smith",
    name: "Deer Trails Country Club",
    city: "Fort Smith",
    holes: 9,
    pars: [4,4,4,4,4,3,5,3,5],
  },
  {
    id: "vache-grasse-country-club-greenwood",
    name: "Vache Grasse Country Club",
    city: "Greenwood",
    holes: 18,
    pars: [5,4,3,4,3,4,5,4,4, 5,3,4,4,4,5,3,4,4],
  },

  // ── Hot Springs / Hot Springs Village ─────────────────────────────────────
  {
    id: "hot-springs-cc-park",
    name: "Hot Springs Country Club – Park",
    city: "Hot Springs",
    holes: 18,
    pars: [5,4,3,4,5,4,3,4,4, 3,4,5,5,4,3,4,4,4],
  },
  {
    id: "hot-springs-cc-arlington",
    name: "Hot Springs Country Club – Arlington",
    city: "Hot Springs",
    holes: 18,
    pars: [4,3,4,4,4,5,4,3,5, 5,3,4,4,4,4,4,3,5],
  },
  {
    id: "cortez-golf-hot-springs-village",
    name: "Cortez Golf Course",
    city: "Hot Springs Village",
    holes: 18,
    pars: [4,5,4,4,4,3,5,3,4, 4,5,3,4,4,4,4,3,5],
  },
  {
    id: "desoto-golf-hot-springs-village",
    name: "DeSoto Golf Club",
    city: "Hot Springs Village",
    holes: 18,
    pars: [4,4,4,3,4,5,4,5,3, 4,3,4,4,3,4,5,4,5],
  },
  {
    id: "granada-golf-hot-springs-village",
    name: "Granada Golf Course",
    city: "Hot Springs Village",
    holes: 18,
    pars: [5,4,4,4,5,3,4,3,4, 4,3,5,3,4,5,4,4,4],
  },
  {
    id: "diamante-hot-springs-village",
    name: "Diamante Country Club",
    city: "Hot Springs Village",
    holes: 18,
    pars: [4,4,5,3,4,4,3,5,4, 4,5,3,4,4,4,3,4,5],
  },
  {
    id: "ponce-de-leon-hot-springs-village",
    name: "Ponce de Leon Golf Course",
    city: "Hot Springs Village",
    holes: 18,
    pars: [4,4,5,3,4,4,3,5,4, 4,5,4,3,4,4,3,5,4],
  },
  {
    id: "magellan-hot-springs-village",
    name: "Magellan Golf Club",
    city: "Hot Springs Village",
    holes: 18,
    pars: [4,4,3,5,4,3,5,4,4, 4,3,4,5,4,5,4,3,4],
  },
  {
    id: "isabella-santa-maria-hot-springs-village",
    name: "Isabella – Santa Maria",
    city: "Hot Springs Village",
    holes: 9,
    pars: [5,4,4,3,5,4,3,4,4],
  },
  {
    id: "isabella-pinta-hot-springs-village",
    name: "Isabella – Pinta",
    city: "Hot Springs Village",
    holes: 9,
    pars: [5,4,3,4,4,4,5,3,4],
  },
  {
    id: "isabella-nina-hot-springs-village",
    name: "Isabella – Nina",
    city: "Hot Springs Village",
    holes: 9,
    pars: [5,4,4,3,5,4,4,3,4],
  },

  // ── Benton / Bismarck / Malvern / Glenwood ────────────────────────────────
  {
    id: "longhills-golf-benton",
    name: "Longhills Golf Club",
    city: "Benton",
    holes: 18,
    pars: [4,4,5,4,3,4,4,3,5, 3,5,4,4,4,3,4,4,5],
  },
  {
    id: "degray-lake-resort-bismarck",
    name: "DeGray Lake Resort State Park",
    city: "Bismarck",
    holes: 18,
    pars: [4,4,5,4,3,4,5,3,4, 4,5,4,3,4,4,3,4,5],
  },
  {
    id: "malvern-country-club",
    name: "Malvern Country Club",
    city: "Malvern",
    holes: 18,
    pars: [4,5,4,4,3,4,3,5,4, 4,4,3,4,4,5,3,4,5],
  },
  {
    id: "glenwood-country-club",
    name: "Glenwood Country Club",
    city: "Glenwood",
    holes: 18,
    pars: [4,5,4,5,4,3,4,4,4, 4,4,5,4,3,5,3,3,4],
  },

  // ── Conway / Morrilton / Russellville ─────────────────────────────────────
  {
    id: "conway-country-club",
    name: "Conway Country Club",
    city: "Conway",
    holes: 18,
    pars: [4,3,4,3,5,4,3,4,5, 4,3,5,4,4,5,3,4,4],
  },
  {
    id: "centennial-valley-conway",
    name: "Centennial Valley Country Club",
    city: "Conway",
    holes: 18,
    pars: [4,3,4,3,4,4,5,4,5, 5,4,4,4,3,5,3,4,4],
  },
  {
    id: "morrilton-country-club",
    name: "Morrilton Country Club",
    city: "Morrilton",
    holes: 18,
    pars: [4,4,3,4,3,4,4,4,5, 4,5,4,4,4,3,5,3,4],
  },
  {
    id: "russellville-country-club",
    name: "Russellville Country Club",
    city: "Russellville",
    holes: 18,
    pars: [4,5,4,3,4,4,3,4,4, 4,3,4,4,3,4,5,5,4],
  },

  // ── Cabot / Greystone ────────────────────────────────────────────────────
  {
    id: "greystone-country-club-cabot",
    name: "Greystone Country Club",
    city: "Cabot",
    holes: 18,
    pars: [4,5,4,4,3,4,3,5,4, 4,4,3,4,4,5,3,4,5],
  },

  // ── Texarkana ────────────────────────────────────────────────────────────
  {
    id: "texarkana-country-club",
    name: "Texarkana Country Club",
    city: "Texarkana",
    holes: 18,
    pars: [4,5,3,4,4,3,5,4,4, 4,3,5,3,4,4,5,4,4],
  },

  // ── Pine Bluff / Marion ───────────────────────────────────────────────────
  {
    id: "pine-bluff-country-club",
    name: "Pine Bluff Country Club",
    city: "Pine Bluff",
    holes: 18,
    pars: [5,3,4,4,3,4,4,5,3, 4,5,4,3,5,4,3,4,4],
  },
  {
    id: "harbor-oaks-golf-pine-bluff",
    name: "Harbor Oaks Golf Club",
    city: "Pine Bluff",
    holes: 18,
    pars: [4,5,4,3,4,5,3,4,4, 4,4,5,3,4,4,4,3,5],
  },
  {
    id: "brownstone-country-club-marion",
    name: "Brownstone Country Club",
    city: "Marion",
    holes: 18,
    pars: [4,5,4,4,3,5,3,4,4, 5,3,4,3,4,4,4,4,5],
  },

  // ── Jonesboro / Paragould ─────────────────────────────────────────────────
  {
    id: "jonesboro-country-club",
    name: "Jonesboro Country Club",
    city: "Jonesboro",
    holes: 18,
    pars: [4,3,5,4,5,3,5,3,4, 4,4,3,4,4,4,5,3,4],
  },
  {
    id: "paragould-country-club",
    name: "Paragould Country Club",
    city: "Paragould",
    holes: 18,
    pars: [4,3,4,4,4,4,3,4,5, 4,4,3,5,4,4,3,4,4],
  },
  {
    id: "sugar-creek-country-club-piggott",
    name: "Sugar Creek Country Club",
    city: "Piggott",
    holes: 9,
    pars: [4,3,4,5,4,3,3,5,5],
  },

  // ── Mountain Home / Cherokee Village / Batesville ─────────────────────────
  {
    id: "big-creek-golf-mountain-home",
    name: "Big Creek Golf & Country Club",
    city: "Mountain Home",
    holes: 18,
    pars: [4,5,4,3,5,3,4,4,4, 5,4,4,3,5,4,4,3,4],
  },
  {
    id: "diamond-hills-country-club-diamond-city",
    name: "Diamond Hills Country Club",
    city: "Diamond City",
    holes: 18,
    pars: [4,3,4,4,4,4,4,3,5, 4,3,5,4,3,4,5,4,4],
  },
  {
    id: "cherokee-village-south",
    name: "Cherokee Village – South",
    city: "Cherokee Village",
    holes: 18,
    pars: [4,3,5,4,5,4,4,3,4, 4,4,5,3,4,4,3,4,5],
  },
  {
    id: "cherokee-village-north",
    name: "Cherokee Village – North",
    city: "Cherokee Village",
    holes: 18,
    pars: [4,5,4,3,4,5,4,3,4, 4,3,5,4,4,5,3,4,4],
  },
  {
    id: "batesville-municipal-golf",
    name: "Batesville Municipal Golf Course",
    city: "Batesville",
    holes: 9,
    pars: [5,3,4,3,4,5,4,4,4],
  },

  // ── Heber Springs / Fairfield Bay ─────────────────────────────────────────
  {
    id: "red-apple-inn-heber-springs",
    name: "Red Apple Inn & Country Club",
    city: "Heber Springs",
    holes: 18,
    pars: [5,3,4,4,3,4,4,5,4, 3,5,3,4,5,4,3,4,4],
  },
  {
    id: "mountain-ranch-golf-fairfield-bay",
    name: "Mountain Ranch Golf Club",
    city: "Fairfield Bay",
    holes: 18,
    pars: [4,5,3,4,4,3,4,5,4, 4,4,4,3,5,4,3,4,5],
  },

  // ── Mena / El Dorado ──────────────────────────────────────────────────────
  {
    id: "ouachita-golf-mena",
    name: "Ouachita Golf & Country Club",
    city: "Mena",
    holes: 9,
    pars: [4,4,3,4,3,4,5,4,4],
  },
];

export function searchCourses(query: string): CourseInfo[] {
  const q = query.toLowerCase().trim();
  if (q.length < 2) return [];
  return AR_COURSES.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q)
  ).slice(0, 8);
}
