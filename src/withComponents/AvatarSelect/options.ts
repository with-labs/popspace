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

export interface IAvatar {
  name: string;
  image: string;
  blink: string;
  backgroundColor: string;
}

const options: IAvatar[] = [
  { name: 'blobby', image: blobby, blink: blobby_blink, backgroundColor: '#FFF8F0' },
  { name: 'molly', image: molly, blink: molly_blink, backgroundColor: '#FFF8F0' },
  { name: 'tilly', image: tilly, blink: tilly_blink, backgroundColor: '#FFF8F0' },
  { name: 'sally', image: sally, blink: sally_blink, backgroundColor: '#FFF8F0' },
  { name: 'polly', image: polly, blink: polly_blink, backgroundColor: '#FFF8F0' },
  { name: 'rolly', image: rolly, blink: rolly_blink, backgroundColor: '#FFF8F0' },
  { name: 'funky', image: funky, blink: funky_blink, backgroundColor: '#FFF8F0' },
];

const randomAvatar = () => {
  return options[Math.floor(Math.random() * options.length)];
};

export { options, randomAvatar };
