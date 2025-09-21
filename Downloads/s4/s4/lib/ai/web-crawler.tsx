interface PageData {
  url: string
  title: string
  metaDescription: string
  contentText: string
  htmlContent: string
  images: string[]
  links: string[]
  forms: any[]
  scripts: string[]
  stylesheets: string[]
}

function isLocalhostUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname.toLowerCase()

    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.") ||
      hostname.startsWith("172.") ||
      hostname.endsWith(".local")
    )
  } catch {
    return false
  }
}

export async function crawlWebsite(baseUrl: string): Promise<PageData[]> {
  const isLocalhost = isLocalhostUrl(baseUrl)

  if (isLocalhost) {
    throw new Error(
      "Localhost URLs cannot be crawled from our servers. Please ensure your local development server is running and accessible, or deploy your website to a public URL for testing.",
    )
  }

  // Normalize the base URL
  const normalizedBaseUrl = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`

  const visitedUrls = new Set<string>()
  const pagesToCrawl = [normalizedBaseUrl]
  const crawledData: PageData[] = []
  const maxPages = 5
  const timeout = 15000 // Increased timeout for better reliability

  while (pagesToCrawl.length > 0 && crawledData.length < maxPages) {
    const currentUrl = pagesToCrawl.shift()!

    if (visitedUrls.has(currentUrl)) continue
    visitedUrls.add(currentUrl)

    try {
      console.log(`[v0] Crawling page: ${currentUrl}`)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      // Add delay between requests to avoid rate limiting
      if (visitedUrls.size > 1) {
        await new Promise(resolve => setTimeout(resolve, 2000)) // 2 second delay
      }

      const response = await fetch(currentUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept-Encoding": "gzip, deflate, br",
          "Cache-Control": "no-cache",
          "Pragma": "no-cache",
          "Sec-Ch-Ua": '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
          "Sec-Ch-Ua-Mobile": "?0",
          "Sec-Ch-Ua-Platform": '"Windows"',
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "none",
          "Sec-Fetch-User": "?1",
          "Upgrade-Insecure-Requests": "1"
        },
        signal: controller.signal,
        redirect: 'follow'
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        console.log(`[v0] Failed to fetch ${currentUrl}: ${response.status} ${response.statusText}`)

        // Handle specific error cases
        if (response.status === 429) {
          console.log(`[v0] Rate limited. Waiting longer before retry...`)
          await new Promise(resolve => setTimeout(resolve, 10000)) // Wait 10 seconds for rate limit

          // If this is the first page, try twice more with longer delays
          if (crawledData.length === 0 && !visitedUrls.has(currentUrl + '_retry')) {
            console.log(`[v0] Retrying ${currentUrl} after rate limit delay`)
            visitedUrls.add(currentUrl + '_retry') // Mark as retried
            await new Promise(resolve => setTimeout(resolve, 5000)) // Additional delay
            pagesToCrawl.unshift(currentUrl)
            continue
          } else if (crawledData.length === 0) {
            console.log(`[v0] Rate limited persistently, will create fallback analysis`)
          }
        }

        // Handle other client/server errors
        if (response.status >= 400 && response.status < 500) {
          console.log(`[v0] Client error ${response.status} for ${currentUrl}`)
        } else if (response.status >= 500) {
          console.log(`[v0] Server error ${response.status} for ${currentUrl}`)
        }

        // If this is the first page and it fails, try different approaches
        if (crawledData.length === 0) {
          // Try with www prefix if not present
          if (!currentUrl.includes('www.') && currentUrl.startsWith('https://')) {
            const wwwUrl = currentUrl.replace('https://', 'https://www.')
            console.log(`[v0] Retrying with www: ${wwwUrl}`)
            pagesToCrawl.unshift(wwwUrl)
            continue
          }
          // Try HTTP if HTTPS fails (but not for rate limit errors)
          if (currentUrl.startsWith('https://') && response.status !== 429) {
            const httpUrl = currentUrl.replace('https://', 'http://')
            console.log(`[v0] Retrying with HTTP: ${httpUrl}`)
            pagesToCrawl.unshift(httpUrl)
            continue
          }
        }
        continue
      }

      const html = await response.text()

      // Validate we got actual HTML content
      if (!html || html.length < 50) {
        console.log(`[v0] Empty or very small response from ${currentUrl}`)
        continue
      }

      // For SPAs or sites with minimal server-side content, be more lenient
      if (!html.toLowerCase().includes('<html') && !html.toLowerCase().includes('<!doctype')) {
        console.log(`[v0] Non-HTML content received from ${currentUrl}, attempting to extract what we can`)

        // If this is the first page and it's not HTML, create a basic entry
        if (crawledData.length === 0) {
          console.log(`[v0] Creating minimal entry for SPA or API endpoint: ${currentUrl}`)
          const fallbackData: PageData = {
            url: currentUrl,
            title: `Website at ${currentUrl}`,
            metaDescription: "Single Page Application or API endpoint",
            contentText: html.substring(0, 1000), // Use whatever content we got
            htmlContent: html.substring(0, 5000),
            images: [],
            links: [],
            forms: [],
            scripts: [],
            stylesheets: []
          }
          crawledData.push(fallbackData)
        }
        continue
      }

      const pageData = await parseHTML(currentUrl, html)
      crawledData.push(pageData)

      console.log(`[v0] Successfully crawled: ${currentUrl} (${pageData.title || 'No title'})`)

      // Extract internal links for further crawling
      const internalLinks = pageData.links.filter((link) => {
        try {
          const url = new URL(link, normalizedBaseUrl)
          const baseHost = new URL(normalizedBaseUrl).hostname
          return url.hostname === baseHost || url.hostname === `www.${baseHost}` || url.hostname === baseHost.replace('www.', '')
        } catch {
          return false
        }
      })

      // Add new links to crawl queue (limit to 3 additional pages)
      internalLinks.slice(0, 3).forEach((link) => {
        try {
          const fullUrl = link.startsWith("/") ? new URL(link, normalizedBaseUrl).href : link
          if (!visitedUrls.has(fullUrl) && !pagesToCrawl.includes(fullUrl)) {
            // Skip certain types of URLs
            const skipPatterns = [
              /\.(pdf|doc|docx|zip|exe|dmg)$/i,
              /mailto:/i,
              /tel:/i,
              /#/,
              /\?/  // Skip URLs with query parameters for now
            ]

            if (!skipPatterns.some(pattern => pattern.test(fullUrl))) {
              pagesToCrawl.push(fullUrl)
            }
          }
        } catch (error) {
          console.log(`[v0] Invalid URL: ${link}`)
        }
      })
    } catch (error) {
      console.error(`[v0] Error crawling ${currentUrl}:`, error)

      // If this is the main page and we haven't crawled anything yet, create a basic entry
      if (crawledData.length === 0 && currentUrl === normalizedBaseUrl) {
        console.log(`[v0] Creating fallback entry for ${currentUrl}`)
        const fallbackData: PageData = {
          url: currentUrl,
          title: `Website at ${currentUrl}`,
          metaDescription: "Unable to fully analyze this page",
          contentText: "Basic analysis performed",
          htmlContent: "<html><head><title>Fallback</title></head><body>Basic content</body></html>",
          images: [],
          links: [],
          forms: [],
          scripts: [],
          stylesheets: []
        }
        crawledData.push(fallbackData)
      }
      continue
    }
  }

  if (crawledData.length === 0) {
    console.log(`[v0] No pages crawled successfully, creating fallback analysis entry`)

    // Create a fallback entry for analysis even if we can't crawl
    const fallbackData: PageData = {
      url: normalizedBaseUrl,
      title: `Analysis for ${normalizedBaseUrl}`,
      metaDescription: "Unable to crawl - performing limited analysis",
      contentText: "This website could not be fully crawled due to access restrictions, rate limiting, or other technical limitations. A basic analysis has been performed based on the URL structure and available public information.",
      htmlContent: `<html><head><title>Fallback Analysis</title></head><body><h1>Limited Analysis Mode</h1><p>Website: ${normalizedBaseUrl}</p></body></html>`,
      images: [],
      links: [],
      forms: [],
      scripts: [],
      stylesheets: []
    }
    crawledData.push(fallbackData)
    console.log(`[v0] Created fallback analysis entry for ${normalizedBaseUrl}`)
  }

  console.log(`[v0] Crawled ${crawledData.length} pages successfully`)
  return crawledData
}

async function parseHTML(url: string, html: string): Promise<PageData> {
  try {
    // More robust title extraction
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i) ||
                      html.match(/<h1[^>]*>([^<]+)<\/h1>/i)
    const title = titleMatch ? titleMatch[1].trim().replace(/\s+/g, ' ') : `Page at ${url}`

    // More robust meta description extraction
    const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
                          html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["'][^>]*>/i)
    const metaDescription = metaDescMatch ? metaDescMatch[1].trim() : ""

    // Extract text content more carefully
    let contentText = html
      // Remove script and style tags completely
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, "")
      // Remove comments
      .replace(/<!--[\s\S]*?-->/g, "")
      // Remove HTML tags but keep the content
      .replace(/<[^>]+>/g, " ")
      // Clean up whitespace
      .replace(/\s+/g, " ")
      .trim()

    // If content is too short, try to extract from specific tags
    if (contentText.length < 100) {
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
      if (bodyMatch) {
        contentText = bodyMatch[1]
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
      }
    }

    // Extract images with better error handling
    const imageMatches = html.match(/<img[^>]*>/gi) || []
    const images = imageMatches
      .map((match) => {
        const srcMatch = match.match(/src=["']([^"']+)["']/i)
        if (srcMatch && srcMatch[1]) {
          const src = srcMatch[1]
          // Convert relative URLs to absolute
          if (src.startsWith('/')) {
            const baseUrl = new URL(url)
            return `${baseUrl.origin}${src}`
          } else if (src.startsWith('http')) {
            return src
          } else {
            return new URL(src, url).href
          }
        }
        return null
      })
      .filter(Boolean) as string[]

    // Extract links with better handling
    const linkMatches = html.match(/<a[^>]*href=["']([^"']+)["'][^>]*>/gi) || []
    const links = linkMatches
      .map((match) => {
        const hrefMatch = match.match(/href=["']([^"']+)["']/i)
        if (hrefMatch && hrefMatch[1]) {
          const href = hrefMatch[1]
          // Skip javascript:, mailto:, tel: links
          if (href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
            return null
          }
          // Convert relative URLs to absolute
          if (href.startsWith('/')) {
            const baseUrl = new URL(url)
            return `${baseUrl.origin}${href}`
          } else if (href.startsWith('http')) {
            return href
          } else if (!href.startsWith('#')) {
            try {
              return new URL(href, url).href
            } catch {
              return null
            }
          }
        }
        return null
      })
      .filter(Boolean) as string[]

    // Extract forms with better handling
    const formMatches = html.match(/<form[^>]*>[\s\S]*?<\/form>/gi) || []
    const forms = formMatches.map((formHtml, index) => {
      const methodMatch = formHtml.match(/method=["']([^"']+)["']/i)
      const actionMatch = formHtml.match(/action=["']([^"']+)["']/i)

      return {
        id: index,
        html: formHtml.substring(0, 1000), // Limit form HTML length
        method: methodMatch ? methodMatch[1].toUpperCase() : "GET",
        action: actionMatch ? actionMatch[1] : "",
      }
    })

    // Extract scripts
    const scriptMatches = html.match(/<script[^>]*src=["']([^"']+)["'][^>]*>/gi) || []
    const scripts = scriptMatches
      .map((match) => {
        const srcMatch = match.match(/src=["']([^"']+)["']/i)
        if (srcMatch && srcMatch[1]) {
          const src = srcMatch[1]
          if (src.startsWith('/')) {
            const baseUrl = new URL(url)
            return `${baseUrl.origin}${src}`
          }
          return src
        }
        return null
      })
      .filter(Boolean) as string[]

    // Extract stylesheets
    const cssMatches = html.match(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi) || []
    const stylesheets = cssMatches
      .map((match) => {
        const hrefMatch = match.match(/href=["']([^"']+)["']/i)
        if (hrefMatch && hrefMatch[1]) {
          const href = hrefMatch[1]
          if (href.startsWith('/')) {
            const baseUrl = new URL(url)
            return `${baseUrl.origin}${href}`
          }
          return href
        }
        return null
      })
      .filter(Boolean) as string[]

    return {
      url,
      title: title.substring(0, 200), // Limit title length
      metaDescription: metaDescription.substring(0, 300), // Limit meta description
      contentText: contentText.substring(0, 5000), // Limit content length
      htmlContent: html.substring(0, 15000), // Increased HTML limit but still reasonable
      images: images.slice(0, 50), // Limit number of images
      links: links.slice(0, 100), // Limit number of links
      forms,
      scripts: scripts.slice(0, 20), // Limit number of scripts
      stylesheets: stylesheets.slice(0, 20), // Limit number of stylesheets
    }
  } catch (error) {
    console.error(`[v0] Error parsing HTML for ${url}:`, error)

    // Return basic fallback data
    return {
      url,
      title: `Website at ${url}`,
      metaDescription: "",
      contentText: "Unable to parse page content",
      htmlContent: html.substring(0, 1000),
      images: [],
      links: [],
      forms: [],
      scripts: [],
      stylesheets: [],
    }
  }
}
