const path = require('path')

module.exports = {
  // the monorepo root holds the yarn.lock that installs unicorn's packages
  outputFileTracingRoot: path.join(__dirname, '..'),
  poweredByHeader: false,
  // unicorn serves no images; app/api/pages.js also closes /_next/image
  images: { unoptimized: true },
}
