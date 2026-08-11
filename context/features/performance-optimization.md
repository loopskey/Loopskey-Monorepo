# Feature: Performance Optimization Standard

## Goal

Improve overall application performance, Core Web Vitals, bundle size, loading speed, and runtime efficiency while maintaining functionality and code quality.

This document defines the minimum performance standards that should be followed across all frontend projects.

---

# Performance Budget

Every feature should respect the following targets whenever possible.

| Metric                 | Target                    |
| ---------------------- | ------------------------- |
| LCP                    | < 2.5s                    |
| CLS                    | < 0.1                     |
| INP                    | < 200ms                   |
| FCP                    | < 1.8s                    |
| TTFB                   | < 800ms                   |
| Initial JS             | Keep as small as possible |
| Lighthouse Performance | 90+                       |

---

# Priority 1 (Critical)

## 1. Optimize Largest Contentful Paint (LCP)

Always identify the actual LCP element before making optimizations.

Possible improvements:

- Optimize server response time
- Reduce blocking resources
- Preload critical assets
- Optimize hero images
- Reduce hydration work
- Delay non-critical JavaScript
- Reduce unnecessary client components
- Use streaming/server rendering where appropriate

---

## 2. Reduce JavaScript Size

Every page should only load the JavaScript it actually needs.

Apply whenever possible:

- Dynamic imports
- Route level code splitting
- Component level lazy loading
- Tree shaking
- Remove unused dependencies
- Remove duplicate libraries
- Avoid importing entire utility libraries
- Replace heavy libraries with lighter alternatives when possible

---

## 3. Eliminate Render Blocking Resources

Minimize resources that delay the first render.

Review:

- CSS loading
- JavaScript loading
- Third-party scripts
- Fonts

Strategies:

- Inline critical CSS
- Defer non-critical JS
- Async third-party scripts
- Load analytics after interaction when possible

---

## 4. Image Optimization

Images should never be larger than necessary.

Requirements:

- Use responsive images
- Use modern formats (WebP / AVIF)
- Compress images
- Lazy load below-the-fold images
- Preload only the LCP image
- Avoid loading full-resolution images for thumbnails
- Use properly sized image variants
- Set width and height to avoid layout shifts

For Next.js:

- Prefer next/image unless a valid exception exists.

---

## 5. Caching Strategy

Review caching for:

- Static assets
- Images
- Fonts
- API responses
- CDN

Ensure appropriate:

- Cache-Control
- ETag
- Immutable assets
- ISR where applicable
- CDN caching

---

# Priority 2 (High)

## 6. Backend Performance

Frontend performance is often limited by backend response time.

Review:

- API latency
- Database queries
- N+1 queries
- Slow joins
- Missing indexes
- Cache opportunities

Measure:

- TTFB
- Endpoint duration
- Database execution time

---

## 7. Font Optimization

Requirements:

- preload critical fonts
- font-display: swap
- self-host fonts when possible
- reduce font weights
- reduce unused font families

---

## 8. Prevent Layout Shift (CLS)

Every visible element should reserve its layout space.

Review:

- Images
- Ads
- Dynamic components
- Async content
- Font loading

Avoid:

- Layout jumping
- Late inserted DOM elements
- Unknown image dimensions

---

## 9. Bundle Analysis

Regularly analyze production bundles.

Check:

- Duplicate packages
- Large dependencies
- Dead code
- Unused exports
- Shared chunk size

Recommended tools:

- Next Bundle Analyzer
- Source Map Explorer

---

# Priority 3 (Recommended)

## 10. Third-party Scripts

Audit every external script.

Remove anything unnecessary.

Load scripts:

- async
- defer
- after user interaction when possible

Examples:

- Analytics
- Chat widgets
- Heatmaps
- Marketing scripts

---

## 11. Reduce Hydration Cost

Avoid unnecessary client-side hydration.

Prefer:

- Server Components
- Static Rendering
- Partial Hydration
- Islands Architecture where supported

Reduce:

- useEffect
- Client Components
- Large React trees

---

## 12. React Rendering Optimization

Review unnecessary renders.

Apply:

- React.memo
- useMemo
- useCallback
- Stable object references
- Virtualized lists
- Pagination

Avoid:

- Anonymous props
- Unstable dependencies
- Expensive renders

---

## 13. Data Fetching Optimization

Reduce unnecessary requests.

Apply:

- Request deduplication
- Caching
- Parallel fetching
- Pagination
- Infinite loading
- Prefetching
- Background revalidation

Avoid:

- Waterfall requests
- Duplicate API calls

---

## 14. Network Optimization

Reduce transferred bytes.

Enable:

- Brotli
- Gzip
- HTTP/2 or HTTP/3
- Compression
- CDN

Reduce:

- Payload size
- Request count

---

## 15. CSS Optimization

Review:

- Unused CSS
- Duplicate styles
- Critical CSS
- CSS Modules
- Tailwind purge

Avoid shipping unused styles.

---

## 16. Dependency Audit

Periodically review dependencies.

Remove:

- Unused packages
- Duplicate functionality
- Heavy libraries

Replace heavy libraries with lightweight alternatives when practical.

---

## 17. Resource Prioritization

Prioritize loading:

Critical:

- Hero image
- Critical CSS
- Primary font

Delay:

- Analytics
- Widgets
- Below-the-fold images
- Non-critical components

---

## 18. Performance Monitoring

Performance should be continuously monitored.

Recommended metrics:

- LCP
- CLS
- INP
- FCP
- TTFB
- Bundle Size
- JS Execution Time

Recommended tools:

- Lighthouse
- Google PageSpeed Insights
- Chrome DevTools
- Web Vitals
- Sentry Performance
- Vercel Analytics

---

# Development Rules

Every new feature should:

- Avoid increasing bundle size unnecessarily.
- Avoid adding render-blocking resources.
- Lazy load heavy components.
- Lazy load below-the-fold content.
- Optimize images.
- Reserve layout space.
- Minimize client-side JavaScript.
- Avoid unnecessary re-renders.
- Prefer server rendering when appropriate.
- Use caching whenever possible.
- Remove dead code before merging.

---

# Pull Request Checklist

Before merging:

- [ ] Lighthouse checked
- [ ] No unnecessary JavaScript added
- [ ] Images optimized
- [ ] Bundle analyzed (if bundle increased significantly)
- [ ] No unnecessary client component
- [ ] Lazy loading applied where appropriate
- [ ] No major CLS introduced
- [ ] API performance reviewed if new endpoints added
- [ ] Third-party scripts reviewed
- [ ] Performance regression checked

---

# Acceptance Criteria

A feature is considered performance-compliant when:

- Core Web Vitals remain within target thresholds.
- No significant bundle size regression is introduced.
- No unnecessary client-side rendering is added.
- Images and fonts follow optimization standards.
- Lighthouse score does not regress significantly.
- Performance monitoring shows no measurable degradation.
