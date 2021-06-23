// Store a ref param in memory for a whole session whenever we
// detect one in the URL. This makes it easy to reference the referral
// source for this session without passing it around manually.

import history from '@src/history';

let ref: string | null = null;

export function setRef(newRef: string) {
  ref = newRef;
}

export function getRef() {
  return ref;
}

// the magic - listen for navigation events and record any ref param
function checkForRef(location: { search: string }) {
  const params = new URLSearchParams(location.search);
  const refParam = params.get('ref');
  if (refParam) {
    setRef(refParam);
  }
}
history.listen(checkForRef);
// check on startup
if (typeof window !== undefined) {
  checkForRef(window.location);
}
