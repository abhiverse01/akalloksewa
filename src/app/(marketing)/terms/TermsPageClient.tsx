'use client'

import { LegalPageLayout } from '@/components/legal/LegalPageLayout'

export function TermsPageClient() {
  return (
    <LegalPageLayout
      title="Terms of Service"
      effectiveDate="January 1, 2025"
      lastUpdated="June 6, 2025"
    >
      {/* ─────────────────────────────────────────── 1. Acceptance of Terms ─── */}
      <h2>1. Acceptance of Terms</h2>
      <p>
        Welcome to AkalLoksewa (&quot;Platform,&quot; &quot;Service,&quot; or &quot;we&quot;). These Terms of Service
        (&quot;Terms&quot;) constitute a legally binding agreement between you (&quot;User,&quot; &quot;you,&quot; or
        &quot;your&quot;) and AkalLoksewa, operated by Abhishek Shah (&quot;Operator&quot;), governing your access
        to and use of the AkalLoksewa web application and all associated features, tools, and content
        (collectively, the &quot;Service&quot;).
      </p>
      <p>
        By accessing, browsing, registering for, or using the Service in any manner, you acknowledge that
        you have read, understood, and agree to be bound by these Terms in their entirety, together with our
        Privacy Policy and Cookie Policy, which are incorporated herein by reference. If you do not agree
        with any provision of these Terms, you must immediately cease all use of the Service and close any
        browser tabs or windows displaying the Platform.
      </p>
      <p>
        Your continued use of the Service following the posting of any amendments to these Terms constitutes
        your acceptance of such amendments. We encourage you to review these Terms periodically. Where
        required by applicable law, we will provide reasonable advance notice of material changes. These
        Terms apply to all visitors, users, and others who access or use the Service without exception.
      </p>

      <hr />

      {/* ─────────────────────────────────────── 2. User Accounts & Registration ─── */}
      <h2>2. User Accounts &amp; Registration</h2>
      <p>
        During the current phase of the Service, AkalLoksewa operates as a fully client-side application.
        User profiles are created and stored locally within your browser&apos;s IndexedDB storage. There is
        no server-side authentication system, central database, or cloud-based account management at this
        time. This means your account exists solely on the device and browser from which it was created.
      </p>
      <p>
        When creating a local profile, you may provide a display name, avatar initials, daily study goals,
        and theme preferences. You are responsible for ensuring that any information you provide is accurate
        and does not violate any applicable laws. You agree not to impersonate any person or entity or
        falsely represent your identity or affiliation.
      </p>
      <p>
        Because accounts are stored exclusively in your browser, we cannot recover, restore, or migrate
        your data if your browser storage is cleared, your device is lost or damaged, or you switch to a
        different browser or device. We strongly recommend periodically exporting any data you wish to
        preserve. You may create separate local profiles on different devices, but these profiles are
        entirely independent and data does not synchronize between them unless you manually export and import
        it.
      </p>
      <p>
        You are responsible for maintaining the security of your device and browser environment. Any actions
        taken through your local profile are deemed to have been taken by you. If you share a device with
        others, be aware that other users of that device may be able to access your local profile data.
      </p>

      <hr />

      {/* ──────────────────────────────────── 3. Description of Service ─── */}
      <h2>3. Service Description</h2>
      <p>
        AkalLoksewa is a comprehensive web-based examination preparation platform designed specifically for
        individuals preparing for the Public Service Commission of Nepal examinations, commonly known as
        Lok Sewa Aayog exams. The Service is intended to supplement your study efforts by providing a
        structured, interactive, and privacy-focused environment for exam practice and revision.
      </p>
      <p>
        The current feature set includes, but is not limited to:
      </p>
      <ul>
        <li>
          <strong>Practice Question Banks</strong> &mdash; A curated collection of practice questions
          organized by subject, topic, difficulty level, and exam category. You may import questions via the
          content ingestor or create your own.
        </li>
        <li>
          <strong>Timed Mock Tests</strong> &mdash; Simulated examination environments with configurable
          time limits, subject filters, and question counts that replicate the conditions of actual Loksewa
          examinations.
        </li>
        <li>
          <strong>Performance Analytics</strong> &mdash; Detailed dashboards tracking your accuracy rates,
          completion speeds, subject-wise strengths and weaknesses, study streaks, and cumulative progress
          over time.
        </li>
        <li>
          <strong>Syllabus Tracking</strong> &mdash; Subject-wise syllabus coverage indicators that help you
          identify which topics you have practiced and which require further attention.
        </li>
        <li>
          <strong>Note-Taking Capabilities</strong> &mdash; A built-in notes module allowing you to create,
          tag, and organize study notes by subject for quick reference during revision sessions.
        </li>
        <li>
          <strong>Content Ingestor</strong> &mdash; A tool that allows you to paste or upload text-based
          study materials and automatically parse them into structured practice questions stored locally in
          your browser.
        </li>
        <li>
          <strong>Bookmarking</strong> &mdash; The ability to bookmark specific questions for later review
          or focused practice sessions.
        </li>
      </ul>
      <p>
        The Service is provided on a best-effort basis for educational and practice purposes only. AkalLoksewa
        is <strong>not</strong> affiliated with, endorsed by, or connected to the Public Service Commission of
        Nepal (Lok Sewa Aayog) in any capacity. The content provided through the Service should not be
        considered official examination material, and we make no guarantees regarding its accuracy,
        completeness, or relevance to actual examination content.
      </p>
      <p>
        We reserve the right to modify, suspend, or discontinue any feature of the Service at any time,
        with or without notice, without incurring any liability to you.
      </p>

      <hr />

      {/* ─────────────────────────────── 4. User Content & Submissions ─── */}
      <h2>4. User Content &amp; Submissions</h2>
      <p>
        The Service allows you to create, import, and store content within your local browser environment,
        including practice questions, study notes, answers, bookmarks, and ingested study materials
        (collectively, &quot;User Content&quot;). By using these features, you acknowledge and agree to the following:
      </p>
      <ul>
        <li>
          You represent and warrant that you have the right to use, process, and store any content you
          submit or import into the Platform, and that such content does not infringe upon the intellectual
          property rights, privacy rights, or any other rights of any third party.
        </li>
        <li>
          You are solely responsible for the accuracy, legality, and appropriateness of all User Content
          you create or import. You agree not to submit content that is unlawful, defamatory, obscene,
          threatening, abusive, harassing, discriminatory, or otherwise objectionable.
        </li>
        <li>
          Content processed by the ingestor tool is generated locally using client-side parsing logic and
          may not always be fully accurate. You assume full responsibility for reviewing, correcting, and
          validating any questions or materials generated through the ingestor before relying on them for
          study purposes.
        </li>
        <li>
          You retain full ownership of all User Content you create or import. AkalLoksewa does not claim
          any ownership interest in your User Content, nor does it license, sublicense, or distribute it.
        </li>
      </ul>
      <p>
        Since all User Content is stored exclusively on your device and never transmitted to any server, you
        bear sole responsibility for backing up, securing, and managing your content. We are unable to
        retrieve, recover, or restore User Content once it is deleted from your browser&apos;s local storage.
      </p>

      <hr />

      {/* ───────────────────────────────── 5. Intellectual Property ─── */}
      <h2>5. Intellectual Property</h2>
      <p>
        The AkalLoksewa Platform, including but not limited to its source code, user interface design,
        visual elements, logos, trademarks, service marks, trade dress, documentation, question parsing
        algorithms, and all other proprietary components (collectively, &quot;Platform IP&quot;), is the exclusive
        intellectual property of Abhishek Shah, the Operator, and is protected by applicable copyright,
        trademark, and other intellectual property laws of Nepal and international treaties.
      </p>
      <p>
        Subject to your compliance with these Terms, we grant you a limited, non-exclusive, non-transferable,
        revocable, personal license to access and use the Service for its intended educational purposes. This
        license does not include the right to:
      </p>
      <ul>
        <li>Reproduce, distribute, publish, display, or publicly perform any part of the Platform IP.</li>
        <li>Modify, adapt, translate, reverse engineer, decompile, or disassemble the Platform or its source code.</li>
        <li>Create derivative works based on the Platform IP or incorporate it into any other product or service.</li>
        <li>Remove, alter, or obscure any proprietary notices, labels, or branding displayed on or within the Platform.</li>
        <li>Use any automated means, including bots, scrapers, or spiders, to access or extract data from the Platform.</li>
        <li>Redistribute, sell, sublicense, lease, or commercially exploit access to the Service or any portion thereof.</li>
      </ul>
      <p>
        Practice questions, study materials, and educational content provided within the Platform are intended
        solely for your personal, non-commercial use. You may not redistribute, sell, license, or commercially
        exploit such content without the express written consent of the Operator. Any unauthorized use of the
        Platform IP may constitute a violation of applicable law and may result in legal action.
      </p>

      <hr />

      {/* ──────────────────────────────── 6. Payment & Refund Policy ─── */}
      <h2>6. Payment &amp; Refund Policy</h2>
      <p>
        During the current phase of the Service, AkalLoksewa is offered as a free platform with no required
        payments, subscriptions, or purchases. All features are accessible without charge. However, we
        reserve the right to introduce premium features, paid plans, or in-application purchases in the
        future. Should we elect to do so, we will update these Terms to reflect the applicable payment and
        refund policies and will notify users of any material changes.
      </p>
      <p>
        If and when paid features are introduced, the following general principles will apply:
      </p>
      <ul>
        <li>
          All applicable pricing will be clearly displayed before you confirm any purchase. Prices may be
          stated in Nepalese Rupees (NPR) or an equivalent foreign currency at our discretion.
        </li>
        <li>
          Payment processing, if applicable, will be conducted through recognized third-party payment
          processors. We do not store your credit card details, banking information, or other sensitive
          financial data on any server. All financial data handling will be delegated to PCI-DSS compliant
          payment service providers.
        </li>
        <li>
          Refund requests will be evaluated on a case-by-case basis in accordance with the refund policy
          in effect at the time of purchase. Generally, refunds will not be provided for digital products
          or services that have been fully delivered and accessed, except where required by applicable
          consumer protection laws of Nepal.
        </li>
      </ul>
      <p>
        We reserve the right to change pricing at any time by posting updated rates on the Platform.
        Price changes will take effect for new purchases only and will not retroactively affect existing
        subscriptions or purchases.
      </p>

      <hr />

      {/* ─────────────────────────────── 7. Prohibited Conduct ─── */}
      <h2>7. Prohibited Conduct</h2>
      <p>
        When using the Service, you agree not to engage in any of the following activities:
      </p>
      <ul>
        <li>
          <strong>Unauthorized Access:</strong> Attempting to gain unauthorized access to any portion of the
          Service, associated systems, or networks through hacking, password mining, social engineering, or
          any other means.
        </li>
        <li>
          <strong>Abuse of Features:</strong> Using the content ingestor or any other feature to process,
          store, or distribute content that is unlawful, harmful, defamatory, pornographic, obscene,
          discriminatory, or otherwise objectionable under the laws of Nepal.
        </li>
        <li>
          <strong>Interference:</strong> Interfering with or disrupting the integrity or performance of the
          Service, including introducing viruses, malware, or other harmful code, or overloading
          infrastructure through automated requests.
        </li>
        <li>
          <strong>Circumvention:</strong> Bypassing, disabling, or otherwise interfering with any
          security-related features of the Service, including rate limits and access controls.
        </li>
        <li>
          <strong>Misrepresentation:</strong> Impersonating any person or entity, or falsely claiming an
          affiliation with any person, entity, or government body, including the Public Service Commission
          of Nepal.
        </li>
        <li>
          <strong>Commercial Exploitation:</strong> Using the Service for any commercial purpose not
          expressly authorized by these Terms, including reselling access to the Platform or its content.
        </li>
        <li>
          <strong>Violation of Law:</strong> Using the Service in any manner that violates any applicable
          federal, provincial, local, or international law or regulation, including laws governing
          intellectual property, data protection, and consumer protection in Nepal.
        </li>
      </ul>
      <p>
        We reserve the right to investigate and take appropriate action against anyone who, in our sole
        discretion, violates this provision. Such action may include restricting access to certain features
        or, in extreme cases, implementing technical measures to block access to the Service from specific
        devices or browsers.
      </p>

      <hr />

      {/* ──────────────────────────── 8. Disclaimer of Warranties ─── */}
      <h2>8. Disclaimer of Warranties</h2>
      <p>
        THE SERVICE IS PROVIDED TO YOU ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS, WITHOUT WARRANTIES OF
        ANY KIND, WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE. TO THE MAXIMUM EXTENT PERMITTED
        BY APPLICABLE LAW, AKALLOKSEWA AND THE OPERATOR EXPRESSLY DISCLAIM ALL WARRANTIES, INCLUDING
        BUT NOT LIMITED TO:
      </p>
      <ul>
        <li>
          Implied warranties of merchantability, fitness for a particular purpose, title, and
          non-infringement.
        </li>
        <li>
          Warranties that the Service will be uninterrupted, timely, secure, error-free, or free of
          viruses, malware, or other harmful components.
        </li>
        <li>
          Warranties that the educational content, practice questions, or study materials provided through
          the Service are accurate, complete, current, or aligned with actual Lok Sewa Aayog examination
          patterns, syllabi, or standards.
        </li>
        <li>
          Warranties that any results, scores, or performance metrics generated by the Service accurately
          reflect your likelihood of success on actual examinations.
        </li>
      </ul>
      <p>
        You understand and agree that your use of the Service is at your sole risk. No advice or
        information, whether oral or written, obtained by you from or through the Service shall create
        any warranty not expressly stated in these Terms. The Service is a study aid and should be used
        as a supplement to, not a replacement for, official examination preparation resources and
        materials published by the Public Service Commission of Nepal.
      </p>

      <hr />

      {/* ─────────────────────────── 9. Limitation of Liability ─── */}
      <h2>9. Limitation of Liability</h2>
      <p>
        TO THE FULLEST EXTENT PERMITTED BY THE LAWS OF NEPAL, IN NO EVENT SHALL AKALLOKSEWA, THE
        OPERATOR (ABHISHEK SHAH), OR ANY OF THEIR RESPECTIVE OFFICERS, DIRECTORS, EMPLOYEES, AGENTS,
        SUCCESSORS, OR ASSIGNS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL,
        EXEMPLARY, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATING TO YOUR USE OF, OR INABILITY TO
        USE, THE SERVICE.
      </p>
      <p>
        This limitation of liability applies regardless of the legal theory under which the claim is made,
        whether in contract, tort (including negligence), strict liability, or any other legal theory, even
        if we have been advised of the possibility of such damages. Specific exclusions include, but are
        not limited to:
      </p>
      <ul>
        <li>Loss of data, including study notes, bookmarks, test history, and user profile information, resulting from browser storage clearing, device failure, or any other cause.</li>
        <li>Failure to achieve a desired score or outcome on actual Lok Sewa Aayog examinations.</li>
        <li>Any errors, inaccuracies, or omissions in the educational content, practice questions, or study materials provided through the Service.</li>
        <li>Any unauthorized access to or alteration of your locally stored data by third parties.</li>
        <li>Any interruption or cessation of the Service, whether planned or unplanned.</li>
        <li>Any loss of profits, revenue, business opportunities, or other financial or economic losses.</li>
      </ul>
      <p>
        IN NO EVENT SHALL OUR TOTAL AGGREGATE LIABILITY TO YOU FOR ALL CLAIMS ARISING OUT OF OR RELATING
        TO THE SERVICE EXCEED THE AMOUNT, IF ANY, THAT YOU HAVE ACTUALLY PAID TO US FOR USE OF THE SERVICE
        DURING THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO THE CLAIM. SINCE THE SERVICE IS
        CURRENTLY OFFERED FREE OF CHARGE, THIS LIMITATION MEANS OUR TOTAL LIABILITY TO YOU IS ZERO.
      </p>

      <hr />

      {/* ──────────────────────── 10. Privacy Policy Reference ─── */}
      <h2>10. Privacy Policy Reference</h2>
      <p>
        Your use of the Service is also governed by our Privacy Policy, which describes how we handle
        information in connection with the Service. The Privacy Policy is an integral part of these Terms
        and is incorporated herein by reference.
      </p>
      <p>
        We encourage you to read the Privacy Policy carefully. It explains, among other things, that
        AkalLoksewa is a privacy-first platform that stores <strong>all user data exclusively on your local
        device using the browser&apos;s IndexedDB</strong>. We do not transmit, collect, or store any personal
        data on remote servers. No user data is sent to any server at any time. This client-side-only
        architecture is a core feature of the Platform and represents our commitment to your privacy and
        data sovereignty.
      </p>
      <p>
        If you have any questions about our data practices, please consult the Privacy Policy accessible
        through the Platform footer navigation, or contact us at privacy@akalloksewa.com.
      </p>

      <hr />

      {/* ──────────────────────────── 11. Changes to Terms ─── */}
      <h2>11. Changes to Terms</h2>
      <p>
        We reserve the right to amend, revise, or replace these Terms at any time and at our sole
        discretion. When we make material changes, we will update the &quot;Last Updated&quot; date at the top
        of this page and, where appropriate, provide additional notice through the Platform, such as a
        banner notification or email alert (if you have provided an email address in the future).
      </p>
      <p>
        Changes to these Terms will become effective immediately upon posting unless a different effective
        date is specified. Your continued use of the Service after the revised Terms become effective
        constitutes your acceptance of the changes. If you do not agree to the modified Terms, you must
        discontinue use of the Service and remove the application data from your device.
      </p>
      <p>
        We recommend periodically reviewing these Terms to stay informed of any updates. Archived versions
        of previous Terms may be made available upon reasonable request.
      </p>

      <hr />

      {/* ──────────────────────────── 12. Governing Law ─── */}
      <h2>12. Governing Law</h2>
      <p>
        These Terms shall be governed by, construed, and enforced in accordance with the laws of Nepal,
        without regard to its conflict of law principles. The United Nations Convention on Contracts for
        the International Sale of Goods shall not apply.
      </p>
      <p>
        Any dispute, claim, or controversy arising out of or relating to these Terms, or the breach,
        termination, enforcement, interpretation, or validity thereof, including the determination of
        the scope or applicability of this agreement to arbitrate, shall be subject to the exclusive
        jurisdiction of the competent courts of Nepal. You hereby irrevocably consent to the personal
        jurisdiction and venue of the courts located in Nepal and waive any objection based on
        inconvenient forum or lack of jurisdiction.
      </p>
      <p>
        If any provision of these Terms is held to be invalid, illegal, or unenforceable by a court of
        competent jurisdiction, such provision shall be modified to the minimum extent necessary to make
        it valid and enforceable, and the remaining provisions shall continue in full force and effect.
        The failure of either party to enforce any right or provision of these Terms shall not constitute
        a waiver of such right or provision.
      </p>

      <hr />

      {/* ───────────────────────── 13. Contact Information ─── */}
      <h2>13. Contact Information</h2>
      <p>
        If you have any questions, concerns, or feedback regarding these Terms of Service, please do not
        hesitate to reach out to us. We are committed to addressing your inquiries promptly and
        transparently.
      </p>
      <p>
        <strong>Operator:</strong> Abhishek Shah
      </p>
      <p>
        <strong>Platform:</strong> AkalLoksewa
      </p>
      <p>
        <strong>Email:</strong> legal@akalloksewa.com
      </p>
      <p>
        For general inquiries, please visit the Contact page accessible through the Platform navigation.
        We will endeavor to respond to all legitimate inquiries within a reasonable timeframe.
      </p>
    </LegalPageLayout>
  )
}
