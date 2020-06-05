// Original avatars from David Lanham

import alienbot from '../../images/avatars/alienbot.png';
import alienbot_blink from '../../images/avatars/alienbot_blink.png';

import beetle from '../../images/avatars/beetle.png';
import beetle_blink from '../../images/avatars/beetle_blink.png';

import bluebird from '../../images/avatars/bluebird.png';
import bluebird_blink from '../../images/avatars/bluebird_blink.png';

import bluepup from '../../images/avatars/bluepup.png';
import bluepup_blink from '../../images/avatars/bluepup_blink.png';

import bubbles from '../../images/avatars/bubbles.png';
import bubbles_blink from '../../images/avatars/bubbles_blink.png';

import cloud from '../../images/avatars/cloud.png';
import cloud_blink from '../../images/avatars/cloud_blink.png';

import fishy from '../../images/avatars/fishy.png';
import fishy_blink from '../../images/avatars/fishy_blink.png';

import fox from '../../images/avatars/fox.png';
import fox_blink from '../../images/avatars/fox_blink.png';

import jackal from '../../images/avatars/jackal.png';
import jackal_blink from '../../images/avatars/jackal_blink.png';

import kitty from '../../images/avatars/kittty.png';
import kitty_blink from '../../images/avatars/kittty_blink.png';

import leaf from '../../images/avatars/leaf.png';
import leaf_blink from '../../images/avatars/leaf_blink.png';

import mantis from '../../images/avatars/mantis.png';
import mantis_blink from '../../images/avatars/mantis_blink.png';

import monkey from '../../images/avatars/monkey.png';
import monkey_blink from '../../images/avatars/monkey_blink.png';

import orc from '../../images/avatars/orc.png';
import orc_blink from '../../images/avatars/orc_blink.png';

import pinkbaar from '../../images/avatars/pinkbaar.png';
import pinkbaar_blink from '../../images/avatars/pinkbaar_blink.png';

import puppy from '../../images/avatars/puppy.png';
import puppy_blink from '../../images/avatars/puppy_blink.png';

import redbot from '../../images/avatars/redbot.png';
import redbot_blink from '../../images/avatars/redbot_blink.png';

import redpup from '../../images/avatars/redpup.png';
import redpup_blink from '../../images/avatars/redpup_blink.png';

import ruff from '../../images/avatars/ruff.png';
import ruff_blink from '../../images/avatars/ruff_blink.png';

import seal from '../../images/avatars/seal.png';
import seal_blink from '../../images/avatars/seal_blink.png';

import shaggydog from '../../images/avatars/shaggydog.png';
import shaggydog_blink from '../../images/avatars/shaggydog_blink.png';

// import snake from '../../images/avatars/snake.png';
// import snake_blink from '../../images/avatars/snake_blink.png';

import swampy from '../../images/avatars/swampy.png';
import swampy_blink from '../../images/avatars/swampy_blink.png';

import whitebat from '../../images/avatars/whitebat.png';
import whitebat_blink from '../../images/avatars/whitebat_blink.png';

// New avatars from Laurent

import cactus from '../../images/avatars/cactus.png';
import cactus_blink from '../../images/avatars/cactus_blink.png';

import cow from '../../images/avatars/cow.png';
import cow_blink from '../../images/avatars/cow_blink.png';

import cup from '../../images/avatars/cup.png';
import cup_blink from '../../images/avatars/cup_blink.png';

import neutral from '../../images/avatars/neutral.png';
import neutral_blink from '../../images/avatars/neutral_blink.png';

import pig from '../../images/avatars/pig.png';
import pig_blink from '../../images/avatars/pig_blink.png';

import robot01 from '../../images/avatars/robot01.png';
import robot01_blink from '../../images/avatars/robot01_blink.png';

import robot02 from '../../images/avatars/robot02.png';
import robot02_blink from '../../images/avatars/robot02_blink.png';

import robot03 from '../../images/avatars/robot03.png';
import robot03_blink from '../../images/avatars/robot03_blink.png';

import smile from '../../images/avatars/smile.png';
import smile_blink from '../../images/avatars/smile_blink.png';

import star from '../../images/avatars/star.png';
import star_blink from '../../images/avatars/star_blink.png';

import sun from '../../images/avatars/sun.png';
import sun_blink from '../../images/avatars/sun_blink.png';

import whale from '../../images/avatars/whale.png';
import whale_blink from '../../images/avatars/whale_blink.png';

export interface IAvatar {
  name: string;
  image: string;
  blink: string;
  backgroundColor: string;
}

const options: IAvatar[] = [
  { name: 'alienbot', image: alienbot, blink: alienbot_blink, backgroundColor: '#fbeefb' },
  { name: 'beetle', image: beetle, blink: beetle_blink, backgroundColor: '#f0eef1' },
  { name: 'bluebird', image: bluebird, blink: bluebird_blink, backgroundColor: '#e1f3fe' },
  { name: 'bluepup', image: bluepup, blink: bluepup_blink, backgroundColor: '#e1f3fe' },
  { name: 'bubbles', image: bubbles, blink: bubbles_blink, backgroundColor: '#fce3e9' },
  { name: 'cloud', image: cloud, blink: cloud_blink, backgroundColor: '#ecf3ef' },
  { name: 'fishy', image: fishy, blink: fishy_blink, backgroundColor: '#edf9e6' },
  { name: 'fox', image: fox, blink: fox_blink, backgroundColor: '#fffae0' },
  { name: 'jackal', image: jackal, blink: jackal_blink, backgroundColor: '#fbeee4' },
  { name: 'kitty', image: kitty, blink: kitty_blink, backgroundColor: '#f9fae5' },
  { name: 'leaf', image: leaf, blink: leaf_blink, backgroundColor: '#edf9e6' },
  { name: 'mantis', image: mantis, blink: mantis_blink, backgroundColor: '#f7fae6' },
  { name: 'monkey', image: monkey, blink: monkey_blink, backgroundColor: '#f8e8ec' },
  { name: 'orc', image: orc, blink: orc_blink, backgroundColor: '#eaecf5' },
  { name: 'pinkbaar', image: pinkbaar, blink: pinkbaar_blink, backgroundColor: '#feebe2' },
  { name: 'puppy', image: puppy, blink: puppy_blink, backgroundColor: '#fef3e1' },
  { name: 'redbot', image: redbot, blink: redbot_blink, backgroundColor: '#fef7e1' },
  { name: 'redpup', image: redpup, blink: redpup_blink, backgroundColor: '#e8f8f6' },
  { name: 'ruff', image: ruff, blink: ruff_blink, backgroundColor: '#fbeee4' },
  { name: 'seal', image: seal, blink: seal_blink, backgroundColor: '#e1f3fe' },
  { name: 'shaggydog', image: shaggydog, blink: shaggydog_blink, backgroundColor: '#f7eae8' },
  { name: 'swampy', image: swampy, blink: swampy_blink, backgroundColor: '#feffe1' },
  { name: 'whitebat', image: whitebat, blink: whitebat_blink, backgroundColor: '#fee8e2' },
  { name: 'cactus', image: cactus, blink: cactus_blink, backgroundColor: '#EBF9E1' },
  { name: 'cow', image: cow, blink: cow_blink, backgroundColor: '#FEF1F6' },
  { name: 'cup', image: cup, blink: cup_blink, backgroundColor: '#F3F9FC' },
  { name: 'neutral', image: neutral, blink: neutral_blink, backgroundColor: '#FCF9DC' },
  { name: 'pig', image: pig, blink: pig_blink, backgroundColor: '#FEF1F6' },
  { name: 'robot01', image: robot01, blink: robot01_blink, backgroundColor: '#FFF4F2' },
  { name: 'robot02', image: robot02, blink: robot02_blink, backgroundColor: '#F6FDFC' },
  { name: 'robot03', image: robot03, blink: robot03_blink, backgroundColor: '#F6F9FD' },
  { name: 'smile', image: smile, blink: smile_blink, backgroundColor: '#FCF9DC' },
  { name: 'star', image: star, blink: star_blink, backgroundColor: '#FCFADE' },
  { name: 'sun', image: sun, blink: sun_blink, backgroundColor: '#FCFADE' },
  { name: 'whale', image: whale, blink: whale_blink, backgroundColor: '#F1FAFE' },
];

const randomAvatar = () => {
  return options[Math.floor(Math.random() * options.length)];
};

export { options, randomAvatar };
