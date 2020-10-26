// New avatars from Farrah

import blobby from '../../images/avatars/blobby.png';
import blobby_blink from '../../images/avatars/blobby_blinking.png';

import molly from '../../images/avatars/molly.png';
import molly_blink from '../../images/avatars/molly_blinking.png';

import tilly from '../../images/avatars/tilly.png';
import tilly_blink from '../../images/avatars/tilly_blinking.png';

import sally from '../../images/avatars/sally.png';
import sally_blink from '../../images/avatars/sally_blinking.png';

import polly from '../../images/avatars/polly.png';
import polly_blink from '../../images/avatars/polly_blinking.png';

import rolly from '../../images/avatars/rolly.png';
import rolly_blink from '../../images/avatars/rolly_blinking.png';

import funky from '../../images/avatars/funky.png';
import funky_blink from '../../images/avatars/funky_blinking.png';

import bear from '../../images/avatars/bear.png';
import bear_blink from '../../images/avatars/bear_blink.png';

import panda from '../../images/avatars/panda.png';
import panda_blink from '../../images/avatars/panda_blink.png';

import greenparrot from '../../images/avatars/greenparrot.png';
import greenparrot_blink from '../../images/avatars/greenparrot_blink.png';

import penguin from '../../images/avatars/penguin.png';
import penguin_blink from '../../images/avatars/penguin_blink.png';

import icecream from '../../images/avatars/icecream.png';
import icecream_blink from '../../images/avatars/icecream_blink.png';

import orangecat from '../../images/avatars/orangecat.png';
import orangecat_blink from '../../images/avatars/orangecat_blink.png';

// Old avatars from David

import bluebird from '../../images/avatars/bluebird.png';
import bluebird_blink from '../../images/avatars/bluebird_blink.png';

import bluepup from '../../images/avatars/bluepup.png';
import bluepup_blink from '../../images/avatars/bluepup_blink.png';

import cloud from '../../images/avatars/cloud.png';
import cloud_blink from '../../images/avatars/cloud_blink.png';

import fox from '../../images/avatars/fox.png';
import fox_blink from '../../images/avatars/fox_blink.png';

import jackal from '../../images/avatars/jackal.png';
import jackal_blink from '../../images/avatars/jackal_blink.png';

import kitty from '../../images/avatars/kittty.png';
import kitty_blink from '../../images/avatars/kittty_blink.png';

import leaf from '../../images/avatars/leaf.png';
import leaf_blink from '../../images/avatars/leaf_blink.png';

import orc from '../../images/avatars/orc.png';
import orc_blink from '../../images/avatars/orc_blink.png';

import puppy from '../../images/avatars/puppy.png';
import puppy_blink from '../../images/avatars/puppy_blink.png';

import redbot from '../../images/avatars/redbot.png';
import redbot_blink from '../../images/avatars/redbot_blink.png';

import redpup from '../../images/avatars/redpup.png';
import redpup_blink from '../../images/avatars/redpup_blink.png';

import ruff from '../../images/avatars/ruff.png';
import ruff_blink from '../../images/avatars/ruff_blink.png';

import shaggydog from '../../images/avatars/shaggydog.png';
import shaggydog_blink from '../../images/avatars/shaggydog_blink.png';


export interface IAvatar {
  name: string;
  image: string;
  blink: string;
  backgroundColor: string;
}

const options: IAvatar[] = [
  { name: 'blobby', image: blobby, blink: blobby_blink, backgroundColor: '#FFE2A1' },
  { name: 'molly', image: molly, blink: molly_blink, backgroundColor: '#FFE2A1' },
  { name: 'tilly', image: tilly, blink: tilly_blink, backgroundColor: '#FFE2A1' },
  { name: 'sally', image: sally, blink: sally_blink, backgroundColor: '#FFE2A1' },
  { name: 'polly', image: polly, blink: polly_blink, backgroundColor: '#FFE2A1' },
  { name: 'rolly', image: rolly, blink: rolly_blink, backgroundColor: '#FFE2A1' },
  { name: 'funky', image: funky, blink: funky_blink, backgroundColor: '#FFE2A1' },
  { name: 'greenparrot', image: greenparrot, blink: greenparrot_blink, backgroundColor: '#FFE2A1' },
  { name: 'penguin', image: penguin, blink: penguin_blink, backgroundColor: '#FFE2A1' },
  { name: 'icecream', image: icecream, blink: icecream_blink, backgroundColor: '#FFE2A1' },
  { name: 'orangecat', image: orangecat, blink: orangecat_blink, backgroundColor: '#FFE2A1' },
  { name: 'bluebird', image: bluebird, blink: bluebird_blink, backgroundColor: '#e1f3fe' },
  { name: 'bluepup', image: bluepup, blink: bluepup_blink, backgroundColor: '#e1f3fe' },
  { name: 'cloud', image: cloud, blink: cloud_blink, backgroundColor: '#ecf3ef' },
  { name: 'fox', image: fox, blink: fox_blink, backgroundColor: '#fffae0' },
  { name: 'jackal', image: jackal, blink: jackal_blink, backgroundColor: '#fbeee4' },
  { name: 'kitty', image: kitty, blink: kitty_blink, backgroundColor: '#f9fae5' },
  { name: 'leaf', image: leaf, blink: leaf_blink, backgroundColor: '#edf9e6' },
  { name: 'orc', image: orc, blink: orc_blink, backgroundColor: '#eaecf5' },
  { name: 'puppy', image: puppy, blink: puppy_blink, backgroundColor: '#fef3e1' },
  { name: 'redbot', image: redbot, blink: redbot_blink, backgroundColor: '#fef7e1' },
  { name: 'redpup', image: redpup, blink: redpup_blink, backgroundColor: '#e8f8f6' },
  { name: 'ruff', image: ruff, blink: ruff_blink, backgroundColor: '#fbeee4' },
  { name: 'shaggydog', image: shaggydog, blink: shaggydog_blink, backgroundColor: '#f7eae8' },
];

const randomAvatar = () => {
  return options[Math.floor(Math.random() * options.length)];
};

export { options, randomAvatar };
