const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const TEMPLATES = {
  new: require('./seed_data/templates/new.json'),
  all_hands: require('./seed_data/templates/all_hands.json'),
  brainstorm: require('./seed_data/templates/brainstorm.json'),
  daily: require('./seed_data/templates/daily.json'),
  happy_hour: require('./seed_data/templates/happy_hour.json'),
  one_on_one: require('./seed_data/templates/one_on_one.json'),
  remote_interview: require('./seed_data/templates/remote_interview.json'),
  retrospective: require('./seed_data/templates/retrospective.json'),
  weekly: require('./seed_data/templates/weekly.json'),
};

const TEMPLATE_WALLPAPERS = [
  {
    name: 'Grid Tile',
    url: '/wallpapers/tile_blank.png',
    mimetype: 'image/png',
    category: 'patterns',
    artistName: 'Farrah Yoo',
    dominantColor: '#f4f5f8',
  },
  {
    name: 'Corkboard',
    url: '/wallpapers/tile_brainstorm.png',
    mimetype: 'image/png',
    category: 'patterns',
    artistName: 'Farrah Yoo',
    dominantColor: '#dfc4a1',
  },
  {
    name: 'Hardwood',
    url: '/wallpapers/tile_daily.png',
    mimetype: 'image/png',
    category: 'patterns',
    artistName: 'Farrah Yoo',
    dominantColor: '#e3ccad',
  },
  {
    name: 'Grassy Field',
    url: '/wallpapers/tile_happyHour.png',
    mimetype: 'image/png',
    category: 'patterns',
    artistName: 'Farrah Yoo',
    dominantColor: '#8bab62',
  },
  {
    name: 'Green Room',
    url: '/wallpapers/tile_interview.png',
    mimetype: 'image/png',
    category: 'patterns',
    artistName: 'Farrah Yoo',
    dominantColor: '#4e756b',
  },
  {
    name: 'Cozy Chairs',
    url: '/wallpapers/tile_one_on_one.png',
    mimetype: 'image/png',
    category: 'patterns',
    artistName: 'Farrah Yoo',
    dominantColor: '#ffe9b3',
  },
  {
    name: 'Purple Room',
    url: '/wallpapers/tile_retro.png',
    mimetype: 'image/png',
    category: 'patterns',
    artistName: 'Farrah Yoo',
    dominantColor: '#787aad',
  },
  {
    name: 'Brick Wall',
    url: '/wallpapers/tile_weekly.png',
    mimetype: 'image/png',
    category: 'patterns',
    artistName: 'Farrah Yoo',
    dominantColor: '#fbab9f',
  },
  {
    name: 'Blue Chairs',
    url: '/wallpapers/tile_allHands.png',
    mimetype: 'image/png',
    category: 'patterns',
    artistName: 'Farrah Yoo',
    dominantColor: '#eef8ff',
  },
  {
    name: 'Greenhouse',
    url: '/wallpapers/one_on_one_greenhouse_1800.png',
    mimetype: 'image/png',
    category: 'spaces',
    artistName: 'Alexis Taylor',
    dominantColor: '#a8d9ca',
  },
];

const SYSTEM_USER_ID = BigInt(-5000);

async function seed() {
  // create system templates
  await Promise.all(
    Object.entries(TEMPLATES).map(async ([key, value]) => {
      await prisma.roomTemplate.upsert({
        where: { name: key },
        update: {},
        create: {
          name: key,
          creatorId: SYSTEM_USER_ID,
          data: value,
        },
      });
    }),
  );

  // create system wallpapers
  await Promise.all(
    TEMPLATE_WALLPAPERS.map(async (data) => {
      await prisma.wallpaper.upsert({
        where: { url: data.url },
        update: {},
        create: {
          ...data,
          creatorId: SYSTEM_USER_ID,
        },
      });
    }),
  );

  process.exit(0);
}

seed();