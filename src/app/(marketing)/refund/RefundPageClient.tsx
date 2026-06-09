'use client'

import { LegalPageLayout } from '@/components/legal/LegalPageLayout'

export function RefundPageClient() {
  return (
    <LegalPageLayout
      title="Refund Policy"
      effectiveDate="January 1, 2025"
      lastUpdated="June 6, 2025"
    >
      <h2>1. Free Product (Phase 1)</h2>
      <p>
        AkalLoksewa is currently in <strong>Phase 1 and is completely free to use</strong>. No payment,
        subscription, or purchase of any kind is required to access any features of the platform. All
        functionality — including practice questions, mock tests, analytics, note-taking, bookmarks, the
        content ingestor, and syllabus tracking — is available at no cost to all users.
      </p>
      <p>
        Since there is no payment involved during this phase, there are no refunds applicable. You can use
        the platform as much as you like without any financial commitment, time limits, or feature
        restrictions. We are committed to keeping the core learning experience accessible to all Loksewa
        aspirants during this initial phase.
      </p>

      <h2>2. Future Pricing Plans</h2>
      <p>
        As we develop and expand AkalLoksewa into future phases, we may introduce premium features or
        subscription plans. Any future pricing will be communicated clearly and transparently before it takes
        effect. We will provide adequate notice of any changes, and users will have the opportunity to
        review and accept new terms before any payment is required.
      </p>
      <p>
        Our goal is to always maintain a generous free tier that provides meaningful preparation value.
        Any premium features will be supplementary enhancements, not essential tools locked behind a
        paywall. We believe that quality Loksewa preparation should be accessible to everyone, regardless
        of their financial situation.
      </p>

      <h2>3. Voluntary Contributions</h2>
      <p>
        In the future, we may introduce optional, voluntary contribution mechanisms (such as donations or
        &quot;buy us a coffee&quot; style tips) to support the continued development and maintenance of the
        platform. These contributions would be entirely optional and would not affect access to any
        features. If such mechanisms are introduced, separate terms governing voluntary contributions
        will be provided.
      </p>

      <h2>4. Data Value</h2>
      <p>
        All data you create on AkalLoksewa — questions, notes, test results, analytics — is stored locally
        on your device. This data has no monetary value in the context of our platform, and we do not
        purchase, sell, or trade user data. Your study data is yours and remains accessible to you for
        as long as you maintain it on your device.
      </p>

      <h2>5. No Hidden Fees</h2>
      <p>
        There are no hidden fees, charges, or costs associated with using AkalLoksewa during Phase 1. We
        do not require credit card information, do not have in-app purchases, and do not display paid
        advertising. The platform is funded independently and is provided as a free educational resource
        for the Loksewa preparation community.
      </p>

      <h2>6. Questions About Pricing</h2>
      <p>
        If you have any questions about this Refund Policy, our current free-access model, or any future
        pricing plans, please do not hesitate to reach out through our Contact page. We value transparency
        and are happy to address any concerns about costs or billing practices.
      </p>
    </LegalPageLayout>
  )
}
