'use client'

import { LegalPageLayout } from '@/components/legal/LegalPageLayout'

export function PrivacyPageClient() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      effectiveDate="January 1, 2025"
      lastUpdated="June 6, 2025"
    >
      {/* ──────────────────────── 1. Introduction ─── */}
      <h2>1. Introduction</h2>
      <p>
        AkalLoksewa (&quot;we,&quot; &quot;our,&quot; &quot;us,&quot; or the &quot;Platform&quot;), operated by Abhishek Shah
        (&quot;Operator&quot;), is committed to protecting your privacy. This Privacy Policy explains how we
        handle information when you use our Loksewa (Public Service Commission) examination preparation
        platform. We believe transparency is the foundation of trust, and this policy outlines our data
        practices in clear, straightforward language so you can make informed decisions about using
        our Service.
      </p>
      <p>
        By accessing or using AkalLoksewa, you acknowledge that you have read and understood this Privacy
        Policy. If you do not agree with the practices described herein, please do not access or use the
        Platform. We encourage you to review this policy periodically to stay informed about how we are
        protecting your information.
      </p>
      <p>
        This Privacy Policy applies to all users of the AkalLoksewa web application and all associated
        features accessible through our domain. It applies in addition to, and is incorporated into, our
        Terms of Service.
      </p>

      <hr />

      {/* ──────────────────────── 2. Information We Collect ─── */}
      <h2>2. Information We Collect</h2>
      <p>
        AkalLoksewa is built with a fundamentally different architecture from most web applications. We
        want to be completely transparent: <strong>we do not collect, transmit, or store any personal
        data on any remote server</strong>. The Platform operates as a client-side application, and all
        data generated during your use of the Service remains on your local device at all times.
      </p>

      <h3>2.1 Account Data (Stored Locally)</h3>
      <p>
        When you create your local profile within the browser, the following information is stored
        exclusively in your device&apos;s IndexedDB and never leaves your browser:
      </p>
      <ul>
        <li><strong>Display Name:</strong> The name you choose to identify your profile within the application.</li>
        <li><strong>Avatar Initials:</strong> Initials derived from your display name, used for visual identification.</li>
        <li><strong>Daily Study Goal:</strong> Your self-set daily target for study questions or minutes.</li>
        <li><strong>Theme Preference:</strong> Your selection of light, dark, or system theme mode.</li>
        <li><strong>Streak Data:</strong> Your consecutive day study streak, calculated locally based on your activity.</li>
      </ul>
      <p>
        We do not require your email address, phone number, real name, government identification, or
        any other personally identifiable information to use the Service. We do not operate any
        server-side authentication, registration, or login system.
      </p>

      <h3>2.2 Usage Data (Stored Locally)</h3>
      <p>
        As you interact with the Platform, the following usage data is generated and stored locally in
        your browser&apos;s IndexedDB:
      </p>
      <ul>
        <li><strong>Practice Questions:</strong> Questions you import, create, answer, and review.</li>
        <li><strong>Test Sessions:</strong> Complete mock test histories including your answers, scores, time taken, and subject-wise breakdowns.</li>
        <li><strong>Study Notes:</strong> Notes you create and organize by subject and tags.</li>
        <li><strong>Bookmarks:</strong> Questions you have flagged for later review.</li>
        <li><strong>Performance Analytics:</strong> Accuracy rates, completion speeds, strengths and weaknesses, and cumulative progress metrics.</li>
        <li><strong>Ingest Batches:</strong> Records of content you have imported through the ingestor tool.</li>
        <li><strong>Syllabus Coverage:</strong> Tracking data indicating which topics you have practiced.</li>
      </ul>
      <p>
        <strong>Critical Point:</strong> None of this data is ever transmitted to any server. It is created
        in your browser, stored in your browser, and remains in your browser until you choose to delete it.
        There is no backend database, no API endpoints that receive user data, and no cloud synchronization.
      </p>

      <h3>2.3 Automatically Collected Technical Data</h3>
      <p>
        We do not collect IP addresses, browser fingerprints, device identifiers, geolocation data, or
        browsing history. We do not operate any server-side analytics, logging, or monitoring systems
        that track individual user behavior. If your web hosting provider (e.g., Vercel, Cloudflare)
        generates standard server access logs, those logs contain only the IP address, user-agent string,
        and requested URL at the network level&mdash;and we do not access, process, or analyze these logs.
      </p>

      <hr />

      {/* ──────────────────────── 3. How We Use Your Information ─── */}
      <h2>3. How We Use Your Information</h2>
      <p>
        Since all data remains on your device and is never transmitted to us, we do not &quot;use&quot; your
        information in any traditional sense. We do not analyze your study habits, profile your behavior,
        serve targeted advertisements, or share your data with any third party for any purpose.
      </p>
      <p>
        The Platform uses your locally stored data solely to provide its intended functionality within your
        browser session:
      </p>
      <ul>
        <li>
          <strong>Personalization:</strong> Displaying your name, avatar, and theme preferences to customize
          your experience.
        </li>
        <li>
          <strong>Study Features:</strong> Presenting practice questions, tracking your progress, generating
          mock tests, and calculating performance analytics based on your locally recorded activity.
        </li>
        <li>
          <strong>Content Management:</strong> Organizing your notes, bookmarks, and ingested study materials
          for easy retrieval and review.
        </li>
        <li>
          <strong>Motivation:</strong> Calculating and displaying your study streaks and daily goals based on
          your local activity data.
        </li>
      </ul>
      <p>
        All of these operations happen entirely within your browser using client-side JavaScript. No
        data is sent to any external service, API, or server for processing. The Platform functions
        identically whether you are connected to the internet or not (after the initial page load).
      </p>

      <hr />

      {/* ──────────────────────── 4. Data Storage (IndexedDB) ─── */}
      <h2>4. Data Storage &mdash; IndexedDB (Client-Side Only)</h2>
      <p>
        This section is critically important and we want to make it abundantly clear:
      </p>
      <blockquote>
        <strong>
          AkalLoksewa stores ALL user data exclusively in your browser&apos;s IndexedDB. We operate no
          backend databases, no cloud storage, and no data collection endpoints. Your data never
          leaves your device. This is by design, not by omission.
        </strong>
      </blockquote>
      <p>
        IndexedDB is a browser-based database technology that allows web applications to store structured
        data on your local device. It is similar to localStorage but supports significantly larger data
        volumes and more complex data structures. Data stored in IndexedDB is:
      </p>
      <ul>
        <li>
          <strong>Scoped to our origin:</strong> Only the AkalLoksewa application (loaded from our domain)
          can read or write to our IndexedDB databases. Other websites cannot access your AkalLoksewa data.
        </li>
        <li>
          <strong>Persistent across sessions:</strong> Data persists between browser sessions until you
          explicitly clear it or the browser evicts it under storage pressure.
        </li>
        <li>
          <strong>Completely local:</strong> IndexedDB data resides on your physical device. There is no
          remote synchronization, backup, or replication. If your device is offline, your data is still
          fully accessible.
        </li>
        <li>
          <strong>Deletable at any time:</strong> You can delete your data at any time by clearing your
          browser&apos;s site data for our domain, using the application&apos;s built-in reset functionality, or
          manually deleting the IndexedDB database named &quot;akalloksewa&quot; through your browser&apos;s developer
          tools.
        </li>
      </ul>
      <p>
        Because IndexedDB is a local storage mechanism, we have no ability to access, view, modify, or
        recover your data remotely. If you clear your browser data, use incognito/private browsing mode,
        uninstall your browser, or lose your device, all locally stored data will be permanently deleted
        and cannot be recovered by us. We strongly recommend periodically exporting any important notes
        or data you wish to preserve as a backup measure.
      </p>

      <hr />

      {/* ──────────────────────── 5. Third-Party Services ─── */}
      <h2>5. Third-Party Services</h2>
      <p>
        AkalLoksewa is designed as a self-contained, privacy-first application. We intentionally minimize
        third-party integrations to protect your privacy. Currently, the Platform does not integrate with:
      </p>
      <ul>
        <li>Analytics services (e.g., Google Analytics, Mixpanel, Amplitude)</li>
        <li>Advertising networks (e.g., Google Ads, Meta Ads)</li>
        <li>Tracking pixels or beacons (e.g., Facebook Pixel, LinkedIn Insight Tag)</li>
        <li>Customer identification services (e.g., Intercom, Crisp, Zendesk)</li>
        <li>Error monitoring services that capture user data</li>
        <li>Content delivery networks that log personal information</li>
        <li>Social media integration (e.g., Facebook Login, Google Sign-In)</li>
      </ul>
      <p>
        The Platform is hosted on a web hosting infrastructure (such as Vercel or a similar provider)
        that delivers the static application files to your browser. These hosting providers may maintain
        standard server access logs for operational purposes (DDoS protection, uptime monitoring, etc.),
        but these logs are not accessed, processed, or analyzed by AkalLoksewa for any user-tracking
        purpose.
      </p>
      <p>
        If we introduce any third-party integrations in the future that could affect your privacy, we
        will update this Privacy Policy with full transparency about what data is shared and with whom,
        and we will obtain your explicit consent where required by applicable law.
      </p>

      <hr />

      {/* ──────────────────────── 6. Cookies ─── */}
      <h2>6. Cookies &amp; Browser Storage</h2>
      <p>
        AkalLoksewa uses minimal browser storage technologies to enhance your experience. Here is a
        complete and transparent breakdown of what we store and where:
      </p>
      <ul>
        <li>
          <strong>IndexedDB:</strong> All user-generated data (questions, notes, test results, analytics,
          bookmarks, user profile) is stored in IndexedDB as described in Section 4. This is the primary
          data store for the application.
        </li>
        <li>
          <strong>localStorage:</strong> We use localStorage to persist a small set of UI preference data,
          including your theme selection (light, dark, or system), sidebar collapse state, and other
          minor interface preferences. No personally identifiable information is stored in localStorage.
        </li>
        <li>
          <strong>Cookies:</strong> We do not set any cookies during normal operation. There are no
          tracking cookies, advertising cookies, or analytics cookies. If our hosting provider sets
          operational cookies (e.g., for CDN routing or CSRF protection), those are managed at the
          infrastructure level and are not used by our application logic.
        </li>
      </ul>
      <p>
        Your browser may offer settings to manage or disable cookies and local storage. Note that
        disabling IndexedDB or localStorage may prevent the AkalLoksewa application from functioning
        properly, as these technologies are essential for storing your study data locally. We recommend
        keeping these features enabled for the best experience.
      </p>

      <hr />

      {/* ──────────────────────── 7. Data Security ─── */}
      <h2>7. Data Security</h2>
      <p>
        While all user data is stored locally and never transmitted to any server, we implement security
        best practices to protect the application itself and your browsing experience:
      </p>
      <ul>
        <li>
          <strong>Same-Origin Policy:</strong> The IndexedDB databases used by the Platform are scoped to
          our domain origin and cannot be accessed by scripts running on other websites, in accordance
          with the browser&apos;s same-origin security policy.
        </li>
        <li>
          <strong>HTTPS Encryption:</strong> The Platform is served over HTTPS, ensuring that the initial
          page load and all subsequent resource requests are encrypted in transit, preventing man-in-the-middle
          attacks and eavesdropping on your connection.
        </li>
        <li>
          <strong>Content Security Policy:</strong> We implement Content Security Policy headers where
          applicable to prevent cross-site scripting (XSS) attacks and unauthorized code execution.
        </li>
        <li>
          <strong>Secure Coding Practices:</strong> The Platform&apos;s source code follows OWASP
          (Open Worldwide Application Security Project) guidelines for frontend security, including input
          sanitization and safe DOM manipulation.
        </li>
      </ul>
      <p>
        However, since data is stored on your device, the security of that data also depends on factors
        outside our control, including:
      </p>
      <ul>
        <li>The physical security of your device against theft or unauthorized access.</li>
        <li>Your browser security settings and whether you keep your browser updated.</li>
        <li>Your operating system&apos;s security measures and encryption features (e.g., full-disk encryption).</li>
        <li>Whether you share your device with others who may access your browser data.</li>
        <li>The presence of malicious browser extensions or malware on your device.</li>
      </ul>
      <p>
        We recommend keeping your browser and operating system up to date, using device encryption (such
        as BitLocker, FileVault, or Android/iOS device encryption), and being cautious about browser
        extensions you install, as extensions with broad permissions may access IndexedDB data.
      </p>

      <hr />

      {/* ──────────────────────── 8. Children&apos;s Privacy ─── */}
      <h2>8. Children&apos;s Privacy</h2>
      <p>
        AkalLoksewa is designed for individuals preparing for Nepal&apos;s civil service examinations (Lok
        Sewa Aayog), which typically require candidates to be at least 18 years of age. However, we
        recognize that younger students may use the Platform for general academic preparation.
      </p>
      <p>
        <strong>You must be at least 13 years old to use AkalLoksewa.</strong> We do not knowingly collect
        personal information from children under the age of 13. Since all data is stored locally in your
        browser and we have no mechanism to collect data from users of any age, this policy is primarily
        a statement of our intent and design philosophy.
      </p>
      <p>
        If you are a parent or guardian and believe that a child under the age of 13 has created a profile
        or stored data on this Platform, you may delete the data by clearing the browser&apos;s site data for
        our domain or contacting us at privacy@akalloksewa.com for guidance on how to remove local data.
        Upon receiving a verifiable request, we will provide instructions for permanently deleting all
        locally stored data from the relevant device.
      </p>

      <hr />

      {/* ──────────────────────── 9. Your Rights ─── */}
      <h2>9. Your Rights</h2>
      <p>
        Because AkalLoksewa stores all data locally on your device and does not collect or transmit any
        personal data to any server, you have complete and direct control over your information at all
        times. Your rights include:
      </p>
      <ul>
        <li>
          <strong>Right to Access:</strong> You can view all of your data at any time by navigating through
          the application interface. Your questions, notes, test results, bookmarks, and profile information
          are always visible and accessible within the Platform.
        </li>
        <li>
          <strong>Right to Rectification:</strong> You can edit, correct, or update any of your locally
          stored data at any time through the application&apos;s built-in editing features.
        </li>
        <li>
          <strong>Right to Erasure:</strong> You can delete your data at any time by: (a) using the
          application&apos;s built-in data management or reset features, (b) clearing your browser&apos;s site
          data for our domain, (c) using your browser&apos;s developer tools to delete the IndexedDB database
          named &quot;akalloksewa,&quot; or (d) uninstalling the browser entirely. Deletion is immediate and
          irreversible.
        </li>
        <li>
          <strong>Right to Data Portability:</strong> You can export your data from the application at any
          time using any built-in export features that may be available. We recommend periodically
          exporting important notes and study materials as a personal backup.
        </li>
        <li>
          <strong>Right to Object:</strong> Since we do not process any of your data on our end, there is
          nothing to object to. You have full sovereignty over your data.
        </li>
        <li>
          <strong>Right to Withdraw Consent:</strong> If we introduce any data collection in the future
          that requires your consent, you may withdraw that consent at any time by ceasing to use the
          relevant feature or by contacting us.
        </li>
      </ul>
      <p>
        If you have questions about exercising any of these rights, please contact us at
        privacy@akalloksewa.com and we will respond with appropriate guidance.
      </p>

      <hr />

      {/* ──────────────────────── 10. Changes to This Policy ─── */}
      <h2>10. Changes to This Privacy Policy</h2>
      <p>
        We may update this Privacy Policy from time to time to reflect changes in our practices,
        technology, features, or legal requirements. We are committed to maintaining the privacy-first
        principles described herein, and any future changes will be made with transparency and user trust
        as our guiding priorities.
      </p>
      <p>
        When we make changes to this policy, we will:
      </p>
      <ul>
        <li>Update the &quot;Last Updated&quot; date at the top of this page to reflect the date of the most recent revision.</li>
        <li>Post the updated policy on this page with all changes clearly documented.</li>
        <li>For material changes that significantly affect your privacy rights, provide additional notice through the Platform, such as a prominent banner notification.</li>
      </ul>
      <p>
        Your continued use of the Platform after any changes to this Privacy Policy constitutes your
        acceptance of the updated terms. We encourage you to review this page periodically to stay
        informed about our ongoing commitment to your privacy.
      </p>
      <p>
        Archived versions of previous Privacy Policies may be made available upon reasonable request by
        contacting privacy@akalloksewa.com.
      </p>

      <hr />

      {/* ──────────────────────── 11. Contact Information ─── */}
      <h2>11. Contact Information</h2>
      <p>
        If you have any questions, concerns, or requests regarding this Privacy Policy, our data
        practices, or your rights as a user of AkalLoksewa, please do not hesitate to reach out. We
        are committed to addressing your privacy concerns promptly, transparently, and thoroughly.
      </p>
      <p>
        <strong>Operator:</strong> Abhishek Shah
      </p>
      <p>
        <strong>Platform:</strong> AkalLoksewa
      </p>
      <p>
        <strong>Privacy Email:</strong> privacy@akalloksewa.com
      </p>
      <p>
        <strong>General Inquiries:</strong> legal@akalloksewa.com
      </p>
      <p>
        For additional ways to reach us, please visit the Contact page accessible through the Platform
        navigation. We will endeavor to respond to all legitimate privacy-related inquiries within a
        reasonable timeframe.
      </p>
    </LegalPageLayout>
  )
}
