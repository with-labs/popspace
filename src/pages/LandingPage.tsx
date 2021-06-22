import landingPageHtml from 'noodle-landing/dist/index.html';
import Helmet from 'react-helmet';

console.log(landingPageHtml);
// const landingPageParsed = document.createElement('html');
// landingPageParsed.innerHTML = landingPageHtml;
// const landingPageHeadContent = landingPageParsed.getElementsByTagName('head').item(0)!.children;
// const landingPageBodyContent = landingPageParsed.getElementsByTagName('body').item(0)!.children;

const landingPageHeadContent = /<head>((?:.|\n)*)<\/head>/.exec(landingPageHtml)![1];
const landingPageBodyContent = /<body>((?:.|\n)*)<\/body>/.exec(landingPageHtml)![1];

export function LandingPage() {
  return (
    <main
      dangerouslySetInnerHTML={{
        __html: `${landingPageHeadContent}${landingPageBodyContent}`,
      }}
    ></main>
  );
}
