const axios = require("axios").default
const cheerio = require("cheerio")
const getFavicons = require("node-get-favicons")

/**
 * Provides metadata for webpage URLs. Right now this provides
 * a minimal set of properties we care about in With.
 */
class OpenGraph {
  async init() {}

  async cleanup() {}

  /**
   * Loads link data we care about for a given URL, if it can be scraped.
   *
   * @param {string} url - url of the page to scrape
   *
   * @typedef {Object} LinkMetadata - Compiled metadata from all available sources for a link
   * @property {string} iframeUrl - A URL associated with the page which can be embedded cross-origin. Might be the same URL.
   * @property {string} title - The title of the page, inferred from OpenGraph or HTML
   *
   * @returns {Promise<LinkMetadata>} The response will include a title, and an iframeUrl if one could be detected (or null)
   *
   * @typedef {Object} HTMLMetadata - Raw metadata extracted from an HTML string response
   * @property {string} title - The title of the page
   */
  async getGraphData(url) {
    const res = await axios.get(url)
    const html = res.data

    /**
     * Will only include .title and .iframe, properties are added by the
     * rules we define and pass to the initializer above.
     */
    const { title } = this.extractMetadata(html)
    const isProvidedUrlIframeCompatible = this.isIframeCompatible(res)
    const icon = await this.getDefaultFavicon(html, url)

    return {
      title: title || url,
      iframeUrl: isProvidedUrlIframeCompatible ? url : null,
      iconUrl: icon
    }
  }

  /**
   * Determines if the raw URL can be embedded cross-origin in an iframe based
   * on security policy headers in the response.
   *
   * Headers involved are:
   * - x-frame-options: denies iframe access according to the value. If this header is present, it must not be
   *     "DENY" or "SAMEORIGIN", which would block with.so from displaying it.
   *     https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options
   * - content-security-policy: a more recent and more complicated policy, for this one we just bail if it's
   *     present. This could perhaps be approached with more finesse in the future.
   *     https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy
   *
   * @param {Response} response - Axios response
   * @returns {boolean}
   */
  isIframeCompatible(response) {
    return (
      (!response.headers["x-frame-options"] ||
        (response.headers["x-frame-options"] !== "DENY" &&
          response.headers["x-frame-options"] !== "SAMEORIGIN")) &&
      !response.headers["content-security-policy"]
    )
  }

  /**
   * @param {string} html - Raw HTML string
   * @returns {HTMLMetadata}
   */
  extractMetadata(html) {
    const $ = cheerio.load(html)
    // TODO: more?
    const titleEl = $('meta[property="og:title"]')
    return {
      title: (titleEl && titleEl.attr("content")) || null
    }
  }

  async getDefaultFavicon(html, url) {
    const icons = await getFavicons.byHtml(html, url)
    if (icons && icons[0]) return icons[0].href
    return null
  }
}

module.exports = new OpenGraph()
