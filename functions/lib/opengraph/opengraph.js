const axios = require("axios").default
const metascraper = require("metascraper")
const titleRule = require("metascraper-title")
const iframeRule = require("metascraper-iframe")

/**
 * Provides metadata for webpage URLs. Right now this provides
 * a minimal set of properties we care about in With.
 */
class OpenGraph {
  async init() {
    this.scraper = metascraper([titleRule(), iframeRule()])
  }

  async cleanup() {}

  /**
   * Loads link data we care about for a given URL, if it can be scraped.
   *
   * @param {string} url - url of the page to scrape
   *
   * @typedef {Object} LinkMetadata
   * @property {string} iframeUrl - A URL associated with the page which can be embedded cross-origin. Might be the same URL.
   * @property {string} title - The title of the page, inferred from OpenGraph or HTML
   *
   * @returns {Promise<LinkMetadata>} The response will include a title, and an iframeUrl if one could be detected (or null)
   */
  async getGraphData(url) {
    const res = await axios.get(url)
    const html = res.data

    /**
     * Will only include .title and .iframe, properties are added by the
     * rules we define and pass to the initializer above.
     */
    const { iframe, ...metadata } = await this.scraper({ html, url })
    const isProvidedUrlIframeCompatible = this.isIframeCompatible(res)

    const extractedIframeSource = this.extractIframeSource(iframe)

    return {
      ...metadata,
      iframeUrl:
        extractedIframeSource || (isProvidedUrlIframeCompatible ? url : null)
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
   * Extracts the src value from an <iframe /> tag string
   */
  extractIframeSource(iframeEl) {
    if (!iframeEl) return null

    const iframeMatch = /<iframe .*src="(.+?)".*<\/iframe>/.exec(iframeEl)
    if (iframeMatch) {
      return iframeMatch[1]
    }
    return null
  }
}

module.exports = new OpenGraph()
