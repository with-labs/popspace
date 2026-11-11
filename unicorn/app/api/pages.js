class Pages {
  constructor(express, next) {
    this.express = express;
    this.next = next;
  }

  init() {
    this.initGeneric();
  }

  initGeneric() {
    // unicorn serves no images, so keep Next's image optimizer closed
    this.express.all('/_next/image', (req, res) => {
      res.status(404).end();
    });

    this.express.get('/', (req, res) => {
      return this.next.render(req, res, `/main`, req.query);
    });

    // Next serves its own pages and /_next assets
    const handle = this.next.getRequestHandler();
    this.express.get('*', (req, res) => {
      return handle(req, res);
    });
  }
}

module.exports = Pages;
