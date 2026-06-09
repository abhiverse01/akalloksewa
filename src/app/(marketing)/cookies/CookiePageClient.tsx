'use client'

import { LegalPageLayout } from '@/components/legal/LegalPageLayout'

export function CookiePageClient() {
  return (
    <LegalPageLayout
      title="Cookie Policy"
      effectiveDate="January 1, 2025"
      lastUpdated="June 6, 2025"
    >
      <h2>1. Overview</h2>
      <p>
        This Cookie Policy explains how AkalLoksewa uses browser storage technologies to provide and improve
        our Loksewa preparation platform. During Phase 1, our approach to data storage is fundamentally
        different from most web applications — we prioritize your privacy by keeping all data local on your
        device.
      </p>
      <p>
        In this policy, &quot;cookies&quot; refers broadly to all browser storage mechanisms, including traditional
        cookies, localStorage, sessionStorage, and IndexedDB. We believe in being transparent about every
        piece of data your browser stores when you use our platform.
      </p>

      <h2>2. No Traditional Cookies</h2>
      <p>
        AkalLoksewa does <strong>not use traditional HTTP cookies</strong> during Phase 1. We do not set any
        cookies for tracking, authentication, analytics, or advertising purposes. You will not find any
        AkalLoksewa cookies in your browser&apos;s cookie settings.
      </p>
      <p>
        This means there are no third-party cookies from services like Google Analytics, Facebook, or any
        advertising networks. Your browsing activity on AkalLoksewa is not tracked by us or by any external
        service.
      </p>

      <h2>3. LocalStorage Usage</h2>
      <p>
        We use the browser&apos;s <strong>localStorage</strong> to store minimal preference data. LocalStorage is a
        key-value storage mechanism built into modern browsers. The data stored includes:
      </p>
      <ul>
        <li><strong>Theme Preference:</strong> Your selected theme (light, dark, or system) so the platform loads with your preferred appearance.</li>
        <li><strong>UI Preferences:</strong> Any interface settings you configure, such as default question count, time limits, or display preferences.</li>
      </ul>
      <p>
        This data is stored as simple key-value pairs and contains no personally identifiable information. It
        is accessible only to our website (origin-scoped) and cannot be read by other websites.
      </p>

      <h2>4. IndexedDB Usage</h2>
      <p>
        The primary data storage for AkalLoksewa is <strong>IndexedDB</strong>, a low-level browser API for
        storing significant amounts of structured data on the client side. Our IndexedDB database is named
        &quot;akalloksewa&quot; and contains the following object stores:
      </p>
      <ul>
        <li><strong>questions:</strong> Your practice question bank with full question text, options, explanations, and metadata.</li>
        <li><strong>testSessions:</strong> Complete test history including answers, scores, and timing data.</li>
        <li><strong>notes:</strong> Your study notes organized by subject with tags.</li>
        <li><strong>bookmarks:</strong> Questions you&apos;ve bookmarked for review.</li>
        <li><strong>analyticsEvents:</strong> Practice and test event data for generating your performance charts.</li>
        <li><strong>userProfile:</strong> Your display name, study goals, streak count, and preferences.</li>
        <li><strong>ingestBatches:</strong> History of content imports through the ingestor tool.</li>
      </ul>
      <p>
        IndexedDB data is stored entirely in your browser and is never transmitted to external servers. It
        persists across browser sessions until you explicitly clear it or clear your browser data.
      </p>

      <h2>5. No Third-Party Storage</h2>
      <p>
        We do not use any third-party storage solutions or services. No data is sent to or stored by external
        analytics platforms, advertising networks, or data processing services. The only data storage occurs
        within your browser&apos;s built-in mechanisms (localStorage and IndexedDB).
      </p>

      <h2>6. Managing Your Storage</h2>
      <p>
        You have full control over the data stored in your browser. You can manage it in the following ways:
      </p>
      <ul>
        <li><strong>Within the App:</strong> Use the Settings page to reset or clear specific data categories.</li>
        <li><strong>Browser Settings:</strong> Clear site data through your browser&apos;s settings (usually under Privacy &gt; Site Data).</li>
        <li><strong>Developer Tools:</strong> Use browser developer tools (F12) to inspect and clear IndexedDB or localStorage directly.</li>
        <li><strong>Full Clear:</strong> Clearing all browsing data will remove all AkalLoksewa data from your device.</li>
      </ul>
      <p>
        Please note that clearing storage data is permanent and cannot be undone. We recommend exporting any
        important notes or study data before clearing.
      </p>

      <h2>7. Future Phases</h2>
      <p>
        As AkalLoksewa evolves to future phases, we may introduce server-side features that require
        additional data storage mechanisms. Any changes to our storage practices will be communicated through
        an updated version of this Cookie Policy, and we will seek your explicit consent before implementing
        any new tracking or data collection technologies.
      </p>
      <p>
        We are committed to maintaining our privacy-first approach even as we add new features, and any
        server-side data handling will be clearly documented and consent-based.
      </p>

      <h2>8. Contact</h2>
      <p>
        If you have questions about this Cookie Policy or our use of browser storage, please contact us
        through our Contact page or email privacy@akalloksewa.com.
      </p>
    </LegalPageLayout>
  )
}
