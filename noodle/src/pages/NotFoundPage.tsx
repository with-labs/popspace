import { Logo } from '@components/Logo/Logo';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * These contents are defined as strings so they'll be easy to edit without messing
 * with React logic for Laurent and anyone else interested.
 */

const stylesheet = `
*{
margin: 0;
padding: 0;
border: 0;
}

html, body{
height: 100%;
width: 100%;
overflow: hidden;
background: #333;
}

#overlay {
text-align: center;
position: absolute;
z-index: 999;
top: 50%;
left: 50%;
transform: translatex(-50%) translatey(-50%);
}

h1 {
color: white;
font-family: Silka, "Helvetica", sans-serif;
font-weight: 900;
font-size: 60px;
line-height: 60px;
margin-top: 32px;
}

a, a:link, a:visited {
  display: inline-block;
  margin-top: 32px;
  padding: 12px 16px;
  background-color: #fff;
  color: #4B2D7A;
  font-family: Silka, "Helvetica", sans-serif;
  font-weight: 700;
  font-size: 18px;
  text-decoration: none;
  text-align: center;
  border-radius: 4px;
}

a:hover {
  color: #000;
}
`;

const animatePage = (canvas: HTMLCanvasElement) => {
  const backgroundImage = new Image();
  backgroundImage.src = '/404/images/background.jpg';

  let bgOffsetX = 0;
  let bgOffsetY = 0;
  let bgCosX = 0;
  let bgCosY = 0;

  const imageUrl = [
    '/404/images/image0.png',
    '/404/images/image1.png',
    '/404/images/image2.png',
    '/404/images/image3.png',
    '/404/images/image4.png',
    '/404/images/image5.png',
    '/404/images/image6.png',
    '/404/images/image7.png',
    '/404/images/image8.png',
    '/404/images/image9.png',
    '/404/images/image10.png',
    '/404/images/image11.png',
    '/404/images/image12.png',
    '/404/images/image13.png',
  ];

  const imageObj = [];
  const sprites: any[] = [];

  for (let i = 0; i < imageUrl.length; i++) {
    const image = new Image();
    image.src = imageUrl[i];
    imageObj.push(image);
  }

  let w = 0;
  let h = 0;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const ctx = canvas.getContext('2d')!;
  canvas.style.position = 'absolute';
  canvas.style.top = '0px';
  canvas.style.left = '0px';
  document.body.appendChild(canvas);

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();

  window.addEventListener('resize', resize);

  function rand(min: number, max?: number) {
    return Math.random() * (max ? max - min : min) + (max ? min : 0);
  }

  for (let i = 0; i < imageUrl.length; i++) {
    const image = new Image();
    image.src = imageUrl[i];
    imageObj.push(image);

    sprites.push({
      x: rand(w),
      y: rand(h),
      xr: 0,
      yr: 0,
      r: rand(Math.PI * 2),
      scale: rand(0.2, 0.7),
      dx: rand(-1, 1),
      dy: rand(-1, 1),
      dr: rand(-0.005, 0.005),
      image: image,
    });
  }
  sprites.sort(function (a, b) {
    return a.scale - b.scale;
  });

  function drawImage(spr: any) {
    ctx.setTransform(spr.scale, 0, 0, spr.scale, spr.xr, spr.yr);
    ctx.rotate(spr.r);
    ctx.drawImage(spr.image, -spr.image.width / 2, -spr.image.height / 2);
  }

  function update() {
    let ihM, iwM;
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    bgOffsetX -= 0.003;
    bgOffsetY += 0.003;

    bgCosX = Math.cos(bgOffsetX) * 200;
    bgCosY = Math.sin(bgOffsetY) * 200;

    ctx.setTransform(1, 0, 0, 1, bgCosX, bgCosY);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const ptrn = ctx.createPattern(backgroundImage, 'repeat')!;
    ctx.fillStyle = ptrn;
    ctx.fillRect(-bgCosX, -bgCosY, canvas.width, canvas.height);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    for (let i = 0; i < sprites.length; i++) {
      const spr = sprites[i];
      const iw = spr.image.width;
      const ih = spr.image.height;
      spr.x += spr.dx;
      spr.y += spr.dy;
      spr.r += spr.dr;
      iwM = iw * spr.scale * 2 + w;
      ihM = ih * spr.scale * 2 + h;
      spr.xr = (((spr.x % iwM) + iwM) % iwM) - iw * spr.scale;
      spr.yr = (((spr.y % ihM) + ihM) % ihM) - ih * spr.scale;
      drawImage(spr);
    }

    requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
};

export function NotFoundPage() {
  const { t } = useTranslation();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!canvasRef.current) return;
    animatePage(canvasRef.current);
  }, []);

  return (
    <main>
      <style>{stylesheet}</style>
      <canvas ref={canvasRef} id="background"></canvas>
      <div id="overlay">
        <Logo />
        <h1>{t('pages.404.title')}</h1>
        <a href="/">{t('pages.404.cta')}</a>
      </div>
    </main>
  );
}
