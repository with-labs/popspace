// trigger reloads when navigating to a page from history - fixes Chrome behavior
// of caching back navigation which breaks our dual-page app stuff
var landingPages = ['thankyou', 'privacy-policy', 'terms-of-service'];
window.addEventListener('popstate', function () {
  if (landingPages.includes(window.location.pathname)) return;
  window.location.reload();
});
