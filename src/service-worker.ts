/// <reference lib="webworker" />
/* eslint-disable no-console */
/* eslint-disable no-restricted-globals */

// This service worker can be customized!
// See https://developers.google.com/web/tools/workbox/modules
// for the list of available Workbox modules, or add any other
// code you'd like.
// You can also remove this file if you'd prefer not to use a
// service worker, and the Workbox build step will be skipped.

import { clientsClaim, RouteHandler } from 'workbox-core';
import * as navigationPreload from 'workbox-navigation-preload';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { CacheFirst, NetworkOnly } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope;

clientsClaim();

// Precaching is not enabled, but we still have to reference the __WB_MANIFEST variable
// in this file to compile correctly.
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ignored = self.__WB_MANIFEST;

// https://developers.google.com/web/tools/workbox/guides/advanced-recipes#offer_a_page_reload_for_users
// Online-first service worker implementation

const CACHE_NAME = 'offline-html';
// This assumes /offline.html is a URL for your self-contained
// (no external images or styles) offline page.
const FALLBACK_HTML_URL = '/offline.html';
const FONT_FILES = ['eot', 'ttf', 'woff', 'woff2'].reduce((list, ext) => {
  ['regular', 'semibold', 'bold'].forEach((weight) => {
    list.push(`/fonts/silka-${weight}-webfont.${ext}`);
  });
  return list;
}, new Array<string>());
const FALLBACK_ASSETS = [FALLBACK_HTML_URL, '/offline.png', ...FONT_FILES];
// Populate the cache with the offline HTML page when the
// service worker is installed.
self.addEventListener('install', async (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        cache.addAll(FALLBACK_ASSETS);
      })
      .then(() => {
        console.debug('Cached offline page');
      })
  );
});

navigationPreload.enable();

const networkOnly = new NetworkOnly();
const navigationHandler: RouteHandler = async (params) => {
  try {
    // Attempt a network request.
    return await networkOnly.handle(params);
  } catch (error) {
    console.debug('Navigation over network failed; falling back to offline page');
    // If it fails, return the cached fallback HTML.
    const cached = await caches.match(FALLBACK_HTML_URL, {
      cacheName: CACHE_NAME,
    });
    if (cached) return cached;
    throw error;
  }
};

// Register this strategy to handle all navigations.
registerRoute(new NavigationRoute(navigationHandler));

// Register cache for assets needed by offline page
registerRoute(({ url }) => FALLBACK_ASSETS.includes(url.pathname), new CacheFirst());

// This allows the web app to trigger skipWaiting via
// registration.waiting.postMessage({type: 'SKIP_WAITING'})
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Any other custom service worker logic can go here.
