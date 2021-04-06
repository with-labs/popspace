import { useEffect } from 'react';

export function useCrisp() {
  useEffect(() => {
    window.$crisp = [];
    // this from our crisp account
    window.CRISP_WEBSITE_ID = '7f95930d-96f9-40e6-8418-604c3b7e48d4';

    (function () {
      var d = document;
      var s = d.createElement('script');

      s.src = 'https://client.crisp.chat/l.js';
      s.async = true;
      d.getElementsByTagName('head')[0].appendChild(s);
    })();

    function hideChat() {
      window.$crisp.push(['do', 'chat:hide']);
    }

    // we want to hide the default button when and only pop the chat when the user since
    // it takes up too much room in our ui
    window.$crisp.push(['on', 'chat:closed', hideChat]);
    hideChat();
  }, []);
}
