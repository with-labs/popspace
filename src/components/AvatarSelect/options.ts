import bakedpotato from '../../images/avatars/bakedpotato.png';
import bakedpotato_blink from '../../images/avatars/bakedpotato_blink.png';

import bear from '../../images/avatars/bear.png';
import bear_blink from '../../images/avatars/bear_blink.png';

import beermug from '../../images/avatars/beermug.png';
import beermug_blink from '../../images/avatars/beermug_blink.png';

import blobby from '../../images/avatars/blobby.png';
import blobby_blink from '../../images/avatars/blobby_blink.png';

import bluebird from '../../images/avatars/bluebird.png';
import bluebird_blink from '../../images/avatars/bluebird_blink.png';

import bluepup from '../../images/avatars/bluepup.png';
import bluepup_blink from '../../images/avatars/bluepup_blink.png';

import bluerobot from '../../images/avatars/bluerobot.png';
import bluerobot_blink from '../../images/avatars/bluerobot_blink.png';

import burger from '../../images/avatars/burger.png';
import burger_blink from '../../images/avatars/burger_blink.png';

import cake from '../../images/avatars/cake.png';
import cake_blink from '../../images/avatars/cake_blink.png';

import cloud from '../../images/avatars/cloud.png';
import cloud_blink from '../../images/avatars/cloud_blink.png';

import corgi from '../../images/avatars/corgi.png';
import corgi_blink from '../../images/avatars/corgi_blink.png';

import croissant from '../../images/avatars/croissant.png';
import croissant_blink from '../../images/avatars/croissant_blink.png';

import cup from '../../images/avatars/cup.png';
import cup_blink from '../../images/avatars/cup_blink.png';

import donut from '../../images/avatars/donut.png';
import donut_blink from '../../images/avatars/donut_blink.png';

import fox from '../../images/avatars/fox.png';
import fox_blink from '../../images/avatars/fox_blink.png';

import funky from '../../images/avatars/funky.png';
import funky_blink from '../../images/avatars/funky_blink.png';

import greenparrot from '../../images/avatars/greenparrot.png';
import greenparrot_blink from '../../images/avatars/greenparrot_blink.png';

import icecream from '../../images/avatars/icecream.png';
import icecream_blink from '../../images/avatars/icecream_blink.png';

import jackal from '../../images/avatars/jackal.png';
import jackal_blink from '../../images/avatars/jackal_blink.png';

import kitty from '../../images/avatars/kitty.png';
import kitty_blink from '../../images/avatars/kitty_blink.png';

import leaf from '../../images/avatars/leaf.png';
import leaf_blink from '../../images/avatars/leaf_blink.png';

import molly from '../../images/avatars/molly.png';
import molly_blink from '../../images/avatars/molly_blink.png';

import neko from '../../images/avatars/neko.png';
import neko_blink from '../../images/avatars/neko_blink.png';

import onigiri from '../../images/avatars/onigiri.png';
import onigiri_blink from '../../images/avatars/onigiri_blink.png';

import orangecat from '../../images/avatars/orangecat.png';
import orangecat_blink from '../../images/avatars/orangecat_blink.png';

import orc from '../../images/avatars/orc.png';
import orc_blink from '../../images/avatars/orc_blink.png';

import panda from '../../images/avatars/panda.png';
import panda_blink from '../../images/avatars/panda_blink.png';

import penguin from '../../images/avatars/penguin.png';
import penguin_blink from '../../images/avatars/penguin_blink.png';

import pepperoni from '../../images/avatars/pepperoni.png';
import pepperoni_blink from '../../images/avatars/pepperoni_blink.png';

import polly from '../../images/avatars/polly.png';
import polly_blink from '../../images/avatars/polly_blink.png';

import poop from '../../images/avatars/poop.png';
import poop_blink from '../../images/avatars/poop_blink.png';

import puppy from '../../images/avatars/puppy.png';
import puppy_blink from '../../images/avatars/puppy_blink.png';

import redpup from '../../images/avatars/redpup.png';
import redpup_blink from '../../images/avatars/redpup_blink.png';

import redrobot from '../../images/avatars/redrobot.png';
import redrobot_blink from '../../images/avatars/redrobot_blink.png';

import rolly from '../../images/avatars/rolly.png';
import rolly_blink from '../../images/avatars/rolly_blink.png';

import ruff from '../../images/avatars/ruff.png';
import ruff_blink from '../../images/avatars/ruff_blink.png';

import sally from '../../images/avatars/sally.png';
import sally_blink from '../../images/avatars/sally_blink.png';

import shaggydog from '../../images/avatars/shaggydog.png';
import shaggydog_blink from '../../images/avatars/shaggydog_blink.png';

import taco from '../../images/avatars/taco.png';
import taco_blink from '../../images/avatars/taco_blink.png';

import tilly from '../../images/avatars/tilly.png';
import tilly_blink from '../../images/avatars/tilly_blink.png';

import trex from '../../images/avatars/trex.png';
import trex_blink from '../../images/avatars/trex_blink.png';

import unicorn from '../../images/avatars/unicorn.png';
import unicorn_blink from '../../images/avatars/unicorn_blink.png';


export interface IAvatar {
  name: string;
  image: string;
  blink: string;
  backgroundColor: string;
}

const options: IAvatar[] = [
  { name: 'bakedpotato', image: bakedpotato, blink: bakedpotato_blink, backgroundColor: '#FFD7C0' },
  { name: 'bear', image: bear, blink: bear_blink, backgroundColor: '#FFCD96' },
  { name: 'beermug', image: beermug, blink: beermug_blink, backgroundColor: '#77C6FF' },
  { name: 'blobby', image: blobby, blink: blobby_blink, backgroundColor: '#FFE2A1' },
  { name: 'bluebird', image: bluebird, blink: bluebird_blink, backgroundColor: '#e1f3fe' },
  { name: 'bluepup', image: bluepup, blink: bluepup_blink, backgroundColor: '#e1f3fe' },
  { name: 'bluerobot', image: bluerobot, blink: bluerobot_blink, backgroundColor: '#FFD8C1' },
  { name: 'burger', image: burger, blink: burger_blink, backgroundColor: '#D7EBB7' },
  { name: 'cake', image: cake, blink: cake_blink, backgroundColor: '#D7EBB7' },
  { name: 'cloud', image: cloud, blink: cloud_blink, backgroundColor: '#ecf3ef' },
  { name: 'corgi', image: corgi, blink: corgi_blink, backgroundColor: '#D7EBB7' },
  { name: 'croissant', image: croissant, blink: croissant_blink, backgroundColor: '#FFEDAE' },
  { name: 'cup', image: cup, blink: cup_blink, backgroundColor: '#fff5ea' },
  { name: 'donut', image: donut, blink: donut_blink, backgroundColor: '#fff5ea' },
  { name: 'fox', image: fox, blink: fox_blink, backgroundColor: '#fffae0' },
  { name: 'funky', image: funky, blink: funky_blink, backgroundColor: '#FFE2A1' },
  { name: 'greenparrot', image: greenparrot, blink: greenparrot_blink, backgroundColor: '#FFE2A1' },
  { name: 'icecream', image: icecream, blink: icecream_blink, backgroundColor: '#FFE2A1' },
  { name: 'jackal', image: jackal, blink: jackal_blink, backgroundColor: '#fbeee4' },
  { name: 'kitty', image: kitty, blink: kitty_blink, backgroundColor: '#f9fae5' },
  { name: 'leaf', image: leaf, blink: leaf_blink, backgroundColor: '#edf9e6' },
  { name: 'molly', image: molly, blink: molly_blink, backgroundColor: '#FFE2A1' },
  { name: 'neko', image: neko, blink: neko_blink, backgroundColor: '#EA4600' },
  { name: 'onigiri', image: onigiri, blink: onigiri_blink, backgroundColor: '#FF835B' },
  { name: 'orangecat', image: orangecat, blink: orangecat_blink, backgroundColor: '#FFE2A1' },
  { name: 'orc', image: orc, blink: orc_blink, backgroundColor: '#eaecf5' },
  { name: 'panda', image: panda, blink: panda_blink, backgroundColor: '#77C6FF' },
  { name: 'penguin', image: penguin, blink: penguin_blink, backgroundColor: '#FFE2A1' },
  { name: 'pepperoni', image: pepperoni, blink: pepperoni_blink, backgroundColor: '#D7EBB7' },
  { name: 'polly', image: polly, blink: polly_blink, backgroundColor: '#FFE2A1' },
  { name: 'poop', image: poop, blink: poop_blink, backgroundColor: '#ffd3d3' },
  { name: 'puppy', image: puppy, blink: puppy_blink, backgroundColor: '#fef3e1' },
  { name: 'redpup', image: redpup, blink: redpup_blink, backgroundColor: '#e8f8f6' },
  { name: 'redrobot', image: redrobot, blink: redrobot_blink, backgroundColor: '#8BE0CC' },
  { name: 'rolly', image: rolly, blink: rolly_blink, backgroundColor: '#FFE2A1' },
  { name: 'ruff', image: ruff, blink: ruff_blink, backgroundColor: '#fbeee4' },
  { name: 'sally', image: sally, blink: sally_blink, backgroundColor: '#FFE2A1' },
  { name: 'shaggydog', image: shaggydog, blink: shaggydog_blink, backgroundColor: '#f7eae8' },
  { name: 'taco', image: taco, blink: taco_blink, backgroundColor: '#FFECD6' },
  { name: 'tilly', image: tilly, blink: tilly_blink, backgroundColor: '#FFE2A1' },
  { name: 'trex', image: trex, blink: trex_blink, backgroundColor: '#FFDFB9' },
  { name: 'unicorn', image: unicorn, blink: unicorn_blink, backgroundColor: '#9AAAFF' },
];

const randomAvatar = () => {
  return options[Math.floor(Math.random() * options.length)];
};

export { options, randomAvatar };
