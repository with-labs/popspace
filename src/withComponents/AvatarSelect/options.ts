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

import snake from '../../images/avatars/snake.png';
import snake_blink from '../../images/avatars/snake_blink.png';

import swampy from '../../images/avatars/swampy.png';
import swampy_blink from '../../images/avatars/swampy_blink.png';

import whitebat from '../../images/avatars/whitebat.png';
import whitebat_blink from '../../images/avatars/whitebat_blink.png';

const options = [
  { name: 'alienbot', image: alienbot, blink: alienbot_blink },
  { name: 'beetle', image: beetle, blink: beetle_blink },
  { name: 'bluebird', image: bluebird, blink: bluebird_blink },
  { name: 'bluepup', image: bluepup, blink: bluepup_blink },
  { name: 'bubbles', image: bubbles, blink: bubbles_blink },
  { name: 'cloud', image: cloud, blink: cloud_blink },
  { name: 'fishy', image: fishy, blink: fishy_blink },
  { name: 'fox', image: fox, blink: fox_blink },
  { name: 'jackal', image: jackal, blink: jackal_blink },
  { name: 'kitty', image: kitty, blink: kitty_blink },
  { name: 'leaf', image: leaf, blink: leaf_blink },
  { name: 'mantis', image: mantis, blink: mantis_blink },
  { name: 'monkey', image: monkey, blink: monkey_blink },
  { name: 'orc', image: orc, blink: orc_blink },
  { name: 'pinkbaar', image: pinkbaar, blink: pinkbaar_blink },
  { name: 'puppy', image: puppy, blink: puppy_blink },
  { name: 'redbot', image: redbot, blink: redbot_blink },
  { name: 'redpup', image: redpup, blink: redpup_blink },
  { name: 'ruff', image: ruff, blink: ruff_blink },
  { name: 'seal', image: seal, blink: seal_blink },
  { name: 'shaggydog', image: shaggydog, blink: shaggydog_blink },
  { name: 'snake', image: snake, blink: snake_blink },
  { name: 'swampy', image: swampy, blink: swampy_blink },
  { name: 'whitebat', image: whitebat, blink: whitebat_blink },
];

const randomAvatar = () => {
  return options[Math.floor(Math.random() * options.length)];
};

export { options, randomAvatar };
