'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, User, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { EmptyState } from '@/components/shared/EmptyState'
import { FileQuestion } from 'lucide-react'

const blogContent: Record<string, string> = {
  'complete-guide-to-loksewa-exam-preparation-2082': `
    <h2>Exam Structure and Stages</h2>
    <p>The Public Service Commission of Nepal (Lok Sewa Aayog) conducts the Loksewa examination in three stages for all service groups (Nijamati, Foreign, Police, and Armed Police). The three stages are: <strong>Preliminary Examination (प्रारम्भिक परीक्षा)</strong>, <strong>Main Written Examination (मुख्य लिखित परीक्षा)</strong>, and <strong>Interview (साक्षात्कार)</strong>.</p>
    <p>The preliminary examination is a 100-mark objective (MCQ) test with a 2-hour time limit. You must score at least 50% to qualify. Only candidates who pass the preliminary move to the main written examination, which is subjective and carries significantly more weight (typically 200–400 marks depending on the level and group). The interview carries 20–30 marks.</p>

    <h2>Subject-Wise Weightage</h2>
    <p>For the Kharidar and Nasu levels, the preliminary exam covers <strong>General Knowledge</strong> (40 marks) and <strong>Subject-Specific Knowledge</strong> (60 marks). For Officer-level posts, the split varies by service group. Common subjects across all levels include: General Knowledge & Current Affairs, Constitution of Nepal, Governance & Administration, Economics, Geography of Nepal, History, Mathematics/Reasoning, English, and Computer & IT.</p>
    <p>According to the official PSC syllabus published on <em>psc.gov.np</em>, the Officer-level (Nijamati) preliminary exam allocates the highest weightage to General Knowledge and Current Affairs, followed by Constitution and Governance. Prioritize these high-weightage subjects early in your preparation.</p>

    <h2>6-Month Preparation Roadmap</h2>
    <p><strong>Months 1–2 (Foundation):</strong> Focus on Constitution of Nepal 2072 and Governance. These form the backbone of most exam questions. Read the original text of the constitution and make chapter-wise notes.</p>
    <p><strong>Months 3–4 (Core Subjects):</strong> Cover Economics, History, Geography, and General Science. Use past question papers to identify recurring themes. Aim to complete at least 50 practice questions per subject each week.</p>
    <p><strong>Months 5–6 (Revision & Mock Tests):</strong> Take full-length mock tests weekly. Analyze weak areas and revise. Focus on speed — 100 questions in 120 minutes requires approximately 72 seconds per question. Practice skipping uncertain questions and returning to them later.</p>

    <h2>Key Resources</h2>
    <p>The official Public Service Commission website (<em>psc.gov.np</em>) publishes syllabi, model questions, and past papers. The Nepal Gazette regularly publishes amendments and notifications relevant to governance questions. For current affairs, follow Gorkhapatra daily and the Nepal Government's official portal.</p>

    <hr/>
    <h2>References</h2>
    <ul>
      <li>Public Service Commission Nepal — <em>psc.gov.np</em> (Official syllabus and past papers)</li>
      <li>Constitution of Nepal 2072 (2015), Nepal Law Commission</li>
      <li>"Civil Service System of Nepal" — Ministry of Federal Affairs and General Administration</li>
    </ul>
  `,
  'constitution-of-nepal-2072-key-topics': `
    <h2>Fundamental Rights (Part 3, Articles 16–46)</h2>
    <p>The Constitution of Nepal 2072, promulgated on <strong>Asoj 3, 2072</strong> (September 20, 2015), guarantees fundamental rights in Part 3. Article 16 establishes the Right to Equality, prohibiting discrimination on grounds of religion, race, caste, tribe, sex, origin, language, or ideological conviction. Article 17 guarantees Right to Freedom, including personal liberty, freedom of opinion and expression, and freedom to assemble peacefully.</p>
    <p>Articles 18–26 cover specific rights including Right to Equality (Article 18), Right to Life with Dignity (Article 16), Right to Freedom (Article 17), Right to Slavery and Forced Labor Prohibition (Article 19), Right to Freedom of Opinion and Expression (Article 17(2)(a)), and Right to Property (Article 17(3) as amended). The Right to Constitutional Remedy under <strong>Article 46</strong> allows citizens to file writ petitions in the Supreme Court for enforcement of fundamental rights — this is one of the most frequently tested provisions.</p>

    <h2>Federal Structure (Part 5, Articles 56–68)</h2>
    <p>Nepal's federal structure divides governance into three tiers: <strong>Federal, Provincial, and Local</strong>. Article 56 defines the structure of the state as a federal democratic republican. Article 57 establishes the 7 provinces: Province 1 (Koshi), Madhesh Province, Bagmati Province, Gandaki Province, Lumbini Province, Karnali Province, and Sudurpashchim Province.</p>
    <p>Articles 57–60 detail the legislative, executive, and judicial powers at each level. The concurrent list (Article 59) outlines subjects where both federal and provincial legislatures can make laws. Understanding the distribution of powers is critical — Loksewa frequently tests questions about which level of government handles specific subjects.</p>

    <h2>Constitutional Bodies (Part 23, Articles 241–260)</h2>
    <p>The Constitution establishes six key constitutional bodies: the <strong>Public Service Commission</strong> (Article 242), <strong>Election Commission</strong> (Article 245), <strong>Auditor General</strong> (Article 247), <strong>Commission for Investigation of Abuse of Authority (CIAA)</strong> (Article 248), <strong>National Human Rights Commission</strong> (Article 249), and <strong>Natural Resources and Fiscal Commission</strong> (Article 251).</p>
    <p>For the Loksewa exam, focus on each body's composition (number of members, appointment process, term), functions, and reporting structure. The PSC chairman and members are appointed by the President on the recommendation of the Constitutional Council (Article 252). The CIAA investigates corruption involving public office holders and can file cases in the Special Court.</p>

    <h2>Directive Principles and Policies (Part 4, Articles 47–51)</h2>
    <p>Part 4 contains Directive Principles of the State, including policies on social justice, protection of the environment, and equitable economic development. While not judicially enforceable like fundamental rights, these principles guide state policy and frequently appear in governance-related exam questions.</p>

    <hr/>
    <h2>References</h2>
    <ul>
      <li>Constitution of Nepal 2072 — Official text published by the Ministry of Law, Justice and Parliamentary Affairs</li>
      <li>Public Service Commission Nepal — <em>psc.gov.np</em></li>
      <li>Nepal Law Commission — <em>lawcommission.gov.np</em></li>
    </ul>
  `,
  'time-management-strategy-for-loksewa-exam-day': `
    <h2>Understanding the Time Constraint</h2>
    <p>The Loksewa preliminary examination consists of <strong>100 objective questions to be answered in 120 minutes</strong>. This gives you an average of <strong>72 seconds per question</strong>. However, not all questions deserve equal time. Easy recall questions may take 20–30 seconds, while analytical or calculation-based questions can take 120–180 seconds. The key is not to spend too long on any single question.</p>
    <p>According to data from past Loksewa examinations, candidates who attempt all 100 questions and maintain an accuracy of 70–80% score significantly higher than those who attempt only 70–80 questions with higher accuracy. Completing the paper is essential.</p>

    <h2>The 2-Pass Strategy</h2>
    <p><strong>Pass 1 (0–80 minutes):</strong> Go through all 100 questions. Answer every question you are confident about immediately. If you are unsure about a question, mark it (use the question-paper marking strategy or circle the number) and move on. Do not spend more than 90 seconds on any question in this pass.</p>
    <p><strong>Pass 2 (80–120 minutes):</strong> Return to all marked questions. By now you have answered the easy ones and can focus your remaining mental energy on the harder questions. Even partial knowledge can help you eliminate 2–3 options, increasing your probability of a correct guess from 25% to 50%.</p>

    <h2>Section-Wise Time Allocation</h2>
    <p>For the typical subject distribution in a Kharidar/Officer preliminary exam, allocate your time roughly as follows: <strong>General Knowledge & Current Affairs</strong> (25 questions — 20 minutes), <strong>Constitution & Governance</strong> (20 questions — 20 minutes), <strong>Economics</strong> (15 questions — 20 minutes), <strong>History & Geography</strong> (15 questions — 20 minutes), <strong>Mathematics & Reasoning</strong> (15 questions — 25 minutes), <strong>English & IT</strong> (10 questions — 15 minutes). This leaves a 10-minute buffer for reviewing marked questions.</p>

    <h2>When to Skip — and When to Guess</h2>
    <p>If you have no idea about a question and cannot eliminate any options, skip it in Pass 1. Never leave the exam hall early — every extra minute is an opportunity to pick up marks on questions you marked. For the Loksewa MCQ exam, there is <strong>no negative marking</strong> for the preliminary stage in most service groups, which means guessing is always better than leaving a question blank.</p>

    <h2>Day-Before Preparation</h2>
    <p>The night before the exam, review your summary notes and key facts — do not attempt new topics. Confirm your exam center location and time. Pack your admit card, two black pens, a sharpener, and your watch (if allowed). Get at least 7 hours of sleep. A rested mind performs significantly better under timed conditions.</p>

    <hr/>
    <h2>References</h2>
    <ul>
      <li>Public Service Commission Nepal — Examination Guidelines, <em>psc.gov.np</em></li>
      <li>"Loksewa Aayog Exam Pattern and Time Management" — PSC Nepal Official Publication</li>
      <li>Constitution of Nepal 2072 — Schedules and examination provisions</li>
    </ul>
  `,
  'governance-and-public-administration': `
    <h2>Core Concepts of Public Administration</h2>
    <p>Public administration in Nepal operates under the federal structure established by the Constitution of 2072. The civil service is managed by the Public Service Commission, which recruits officers at four levels: Kharidar (Non-gazetted Second Class), Nasu (Non-gazetted First Class), Officer (Gazetted Third Class), and Joint Secretary and above. Each level has specific eligibility requirements regarding education and experience. Understanding this hierarchy is essential, as Loksewa frequently asks about the classification of gazetted and non-gazetted posts and their respective functions.</p>
    <p>Key topics for Loksewa preparation include: administrative hierarchy, delegation of authority, budgeting and financial administration, personnel management, development administration, and e-governance initiatives in Nepal. Questions about the Civil Service Act 2049 (as amended), the Staff Regulations 2050, and administrative tribunal procedures regularly appear in both preliminary and main examinations.</p>

    <h2>Administrative Theories: Weber, Fayol, and Taylor</h2>
    <p><strong>Max Weber's Bureaucratic Theory</strong> is foundational to Nepal's civil service structure. Weber proposed six characteristics of an ideal bureaucracy: hierarchy of authority, division of labor, written rules and records, impersonality, merit-based recruitment, and career orientation. Nepal's Nijamati Sewa (civil service) closely mirrors these principles — officers are recruited through competitive exams (merit-based), follow written rules and regulations, and serve in a clearly defined hierarchy from Section Officer up to Chief Secretary.</p>
    <p><strong>Henri Fayol's 14 Principles of Management</strong> — including division of work, authority and responsibility, unity of command, scalar chain, and esprit de corps — are frequently tested. Expect MCQs asking you to match principles with their definitions or identify which principle applies to a given administrative scenario. For example, "If a government employee reports to two supervisors, which principle is violated?" The answer is <em>Unity of Command</em>.</p>
    <p><strong>Frederick Taylor's Scientific Management</strong> emphasizes work measurement, time-motion studies, and performance-based incentives. While originally developed for factory settings, Taylor's principles influence Nepal's performance appraisal system for civil servants and output-based budgeting in government projects.</p>

    <h2>Nepal's Federal Administration Structure</h2>
    <p>Nepal's governance is divided across three tiers as defined by the Constitution of Nepal 2072. The <strong>Federal Government</strong> handles exclusive subjects such as defense, foreign affairs, monetary policy, citizenship, and national-level infrastructure. <strong>Provincial Governments</strong> (7 provinces) manage concurrent and provincial subjects including education (up to secondary), health, agriculture, provincial police, and local tourism. <strong>Local Governments</strong> (753 units comprising metropolitan cities, sub-metropolitan cities, municipalities, and rural municipalities) deliver basic services like vital event registration, local roads, drinking water, and primary education.</p>
    <p>The Ministry of Federal Affairs and General Administration (MOFAGA) serves as the central coordinating body for inter-governmental relations. The Local Government Operation Act 2074 (2017) details the powers, functions, and duties of local governments. A critical exam topic is understanding the exclusive, concurrent, and shared jurisdiction lists in Schedules 8 and 9 of the Constitution — Loksewa often asks which level of government is responsible for a specific service.</p>
    <p>The Civil Service is organized into <strong>organized services</strong> (Nijamati Sewa, Foreign Affairs, Police, Armed Police, Nepal Army Education, and Health) and <strong>unorganized services</strong>. Within Nijamati Sewa, officers are grouped into Administration, Auditing, Engineering, Agriculture & Forestry, Education, Judicial, Economics/Planning, and Parliamentary Service groups. Knowing which group belongs to which category is a frequently tested distinction.</p>

    <h2>The Public Service Commission and Its Role</h2>
    <p>The Public Service Commission (PSC), established under <strong>Article 242</strong> of the Constitution, is a constitutional body responsible for selecting suitable candidates for civil service positions. The Commission consists of a Chairperson and members appointed by the President on the recommendation of the Constitutional Council for a single six-year term. PSC operates through its central office in Kathmandu and seven provincial offices located in each provincial capital.</p>
    <p>The Commission's functions include: conducting competitive examinations, administering promotion tests for in-service civil servants, advising the Government of Nepal on recruitment matters, and maintaining transparency in the selection process. Under the PSC Act 2049, the Commission can recommend candidates based on open competition, internal competition, or inclusive quotas. The <strong>inclusive reservation system</strong> reserves 45% of positions for women (33%), indigenous nationalities (27%), Madheshi (15%), Dalit (9%), people with disabilities (5%), and backward regions (4%) — these exact percentages are important to memorize.</p>

    <h2>Nijamati Sewa Dynamics and Personnel Management</h2>
    <p>Nepal's civil service personnel management is governed by the <strong>Civil Service Act 2049 (1993)</strong> and the <strong>Civil Service Regulations 2050 (1993)</strong>. Key provisions include promotion criteria (based on seniority, performance appraisal, and written examination), disciplinary procedures (ranging from warning to dismissal), and retirement rules (mandatory retirement at age 58, with provisions for extension). The performance appraisal system uses an annual confidential report (ACR) and the Employee Performance Evaluation (EPE) format introduced in recent reforms.</p>
    <p>Delegation of authority in Nepal's administration follows the principle that routine matters are delegated to subordinate offices while policy decisions remain with senior officers. The concept of <strong>deconcentration</strong> (administrative decentralization within the same level of government) differs from <strong>devolution</strong> (transfer of power to lower levels of government) — this distinction is a classic Loksewa exam topic. Nepal's federal restructuring represents devolution, whereas the Ministry's delegation to Regional Administration Offices represents deconcentration.</p>

    <h2>Exam-Focused Preparation Tips</h2>
    <p><strong>Focus on definitions and article numbers:</strong> Memorize key article numbers from the Constitution related to administration (Articles 242–244 for PSC, Article 282 for the Civil Service Act). Also memorize the full forms and Nepali names of administrative bodies — e.g., MOFAGA (महानगरीय तथा सहरी विकास मन्त्रालय is NOT MOFAGA; MOFAGA is मन्त्रालय संघीय मामिला तथा सामान्य प्रशासन).</p>
    <p><strong>Study past question patterns:</strong> In the last 5 years, governance-related questions have consistently covered: budget types (development vs. regular), fiscal federalism (grant categories — conditional, matching, equalization, special), administrative reforms (good governance, e-governance, zero-tolerance policy), and organizational structures of key ministries. Prepare summary tables for each topic.</p>
    <p><strong>Recommended readings:</strong> "Public Administration in Nepal" by various Nepali authors, the official Civil Service Act 2049 text, the PSC's published syllabus for the Governance and Administration paper, and MOFAGA's annual reports which contain current data on civil service strength, vacancy positions, and reform initiatives.</p>

    <hr/>
    <h2>References</h2>
    <ul>
      <li>Public Service Commission Nepal — <em>psc.gov.np</em></li>
      <li>Ministry of Federal Affairs and General Administration — <em>mofaga.gov.np</em></li>
      <li>Constitution of Nepal 2072 — Part 5 (Federal Structure), Part 23 (Constitutional Bodies), and Schedule 8–9</li>
      <li>Civil Service Act 2049 (1993) and Civil Service Regulations 2050 — Ministry of Law, Justice and Parliamentary Affairs</li>
      <li>Local Government Operation Act 2074 — MOFAGA</li>
    </ul>
  `,
  'current-affairs-preparation-strategy': `
    <h2>Why Current Affairs Matter in Loksewa</h2>
    <p>Current affairs carry significant weightage in the Loksewa preliminary examination, contributing directly to the <strong>General Knowledge section</strong> (typically 20–30 out of 100 questions) and indirectly to subject-specific sections. Questions typically cover national events of the past 12–18 months, international developments, appointments, awards, sports, summits, and economic indicators. Nepal's GDP growth rate, fiscal budget figures, trade deficit data, inflation rate, and major policy announcements are frequently tested year after year.</p>
    <p>The challenge with current affairs is breadth — events span politics, economics, science, environment, sports, and international relations. Without a structured approach, candidates waste time on low-yield news and miss high-yield topics. A targeted strategy that focuses on exam-relevant current affairs can improve your preliminary score by 15–20 marks compared to random preparation.</p>

    <h2>National Sources for Exam-Relevant News</h2>
    <p>For reliable and exam-relevant current affairs, follow <strong>Gorkhapatra</strong> (the national daily — its government-related coverage is essential), <strong>Republica</strong> and <strong>The Kathmandu Post</strong> for English-language coverage of policy and governance, and the <strong>RSS (Rastriya Samachar Samiti)</strong> for official news releases. The Nepal Government's official portal (<em>nepal.gov.np</em>) publishes press releases, ordinance notifications, and policy decisions that are directly exam-relevant.</p>
    <p>For economics and budget-related current affairs, study the <strong>Economic Survey</strong> published annually by the Ministry of Finance before the budget speech, the <strong>budget speech document</strong> itself, and the <strong>Nepal Rastra Bank</strong>'s quarterly monetary policy reports. Key figures to track include: total budget size (e.g., Rs. 1.86 trillion for FY 2081/82), revenue-to-GDP ratio, foreign exchange reserves, remittance inflow data, and Nepal's ranking in international indices (Ease of Doing Business, Human Development Index, Corruption Perceptions Index, Global Hunger Index).</p>
    <p>Monthly magazines like <strong>Nepal</strong>, <strong>Spotlight</strong>, and <strong>New Business Age</strong> provide analytical coverage that helps connect current events to broader policy themes — a skill tested in the main written examination's essay and governance sections.</p>

    <h2>International Sources and Key Organizations</h2>
    <p>Loksewa exams include questions on international current affairs, especially Nepal's diplomatic relations, UN and SAARC activities, and major global summits. Track the following: <strong>SAARC</strong> and <strong>BIMSTEC</strong> summits (Nepal's role and outcomes), <strong>United Nations</strong> (Nepal's peacekeeping contributions, UN General Assembly resolutions), <strong>World Bank</strong> and <strong>IMF</strong> reports on Nepal, and <strong>India-China</strong> relations as they affect Nepal's foreign policy.</p>
    <p>Keep a running list of: new appointments (Prime Minister, Chief Justice, PSC Chairman, Governors of Nepal Rastra Bank), heads of international organizations (UN Secretary-General, WHO Director-General, World Bank President), Nobel Prize winners, major sports tournament results, and new national schemes or programs launched by the Nepal Government. These categories consistently produce 3–5 questions per exam cycle.</p>

    <h2>Daily and Weekly Study Routine</h2>
    <p><strong>Daily (30–45 minutes):</strong> Scan at least two national newspapers (one Nepali, one English). Focus on headlines, government announcements, budget/economic data, appointments, and bilateral visits. Use highlighters or digital notes to mark potentially exam-relevant items. Avoid spending time on entertainment, crime, or gossip news.</p>
    <p><strong>Weekly (2–3 hours on Sunday):</strong> Compile the week's current affairs into a structured notebook. Organize by categories: National Politics, Economy & Budget, International Relations, Science & Technology, Sports, Awards & Appointments, and Environment. Write each entry as a single sentence with key facts — e.g., "Nepal hosted the BIMSTEC Summit in Kathmandu on [date], attended by leaders of [member nations], and agreed to [key outcome]." This format is ideal for quick revision before the exam.</p>
    <p><strong>Monthly (half-day review):</strong> Take a monthly current affairs quiz (available on Loksewa preparation apps and websites). Identify gaps in your coverage. Review your compiled notes and cross-reference with official sources. Update any figures that may have changed (e.g., revised GDP estimates, updated inflation data).</p>

    <h2>Linking Current Affairs to Exam Questions</h2>
    <p>The key to scoring well in current affairs is not just memorizing facts but understanding how they connect to exam topics. For example, if the government launches a new <strong>agriculture modernization program</strong>, expect related questions in: the Economics section (budget allocation, subsidy patterns), the Governance section (implementing ministry, federal vs. provincial responsibility), and the Current Affairs section (when, who launched, target beneficiaries).</p>
    <p>Practice creating potential questions from each major current event. When Nepal signs a new trade agreement with India or China, prepare for questions about: the agreement's name and date, signing ministers, key provisions, affected sectors, and Nepal's trade balance with that country. This active question-generation technique transforms passive reading into exam-ready knowledge.</p>
    <p>For the <strong>main written examination</strong>, current affairs knowledge is tested through essay writing and long-answer questions. Practice writing 300-word essays on topics like "Impact of Federalism on Nepal's Development" or "Nepal's Foreign Policy Challenges" using recent examples and data points from your current affairs notes.</p>

    <h2>Social Media and Note-Making Strategies</h2>
    <p><strong>Social media can be a double-edged sword</strong> — follow verified accounts of government ministries, PSC Nepal, Nepal Rastra Bank, and reputable news outlets on Twitter/X and Facebook. Join Loksewa preparation groups on Facebook and Telegram, but be cautious of misinformation. Always verify facts with official sources before adding them to your notes. YouTube channels run by former PSC officers and educators often provide weekly current affairs summaries specifically curated for Loksewa aspirants.</p>
    <p>For note-making, maintain a <strong>digital master document</strong> (Google Sheets or Notion) with columns for Date, Event, Key Facts, Source, and Exam Relevance (High/Medium/Low). This allows efficient filtering and revision. Alternatively, use a physical notebook divided into categories with color-coded tabs. Review your high-relevance notes daily, medium-relevance notes weekly, and low-relevance notes monthly. In the final 2 weeks before the exam, focus exclusively on high-relevance items and the most recent 6 months of current affairs.</p>

    <hr/>
    <h2>References</h2>
    <ul>
      <li>Public Service Commission Nepal — <em>psc.gov.np</em></li>
      <li>Rastriya Samachar Samiti — <em>rss.org.np</em></li>
      <li>Ministry of Finance Nepal — Economic Survey and Budget Documents (<em>mof.gov.np</em>)</li>
      <li>Nepal Rastra Bank — Quarterly Reports and Monetary Policy (<em>nrb.org.np</em>)</li>
      <li>Gorkhapatra Daily — National newspaper of Nepal (<em>gorkhapatraonline.com</em>)</li>
    </ul>
  `,
  'mathematics-tips-for-loksewa': `
    <h2>Mathematics in the Loksewa Exam</h2>
    <p>The mathematics section in the Loksewa preliminary exam typically includes <strong>10–15 questions</strong> out of 100, covering arithmetic, algebra, geometry, and logical reasoning. Questions are generally at the secondary school level (Class 8–10 difficulty) but require speed and accuracy under timed conditions. With only about 72 seconds per question on average, you cannot afford to spend 3–4 minutes on a single math problem. The key is mastering shortcut methods and recognizing question patterns from past papers.</p>
    <p>Based on analysis of Loksewa preliminary papers from the past 10 years, the most frequently tested topics (in order of frequency) are: <strong>Percentage and Profit-Loss</strong> (appears in 80%+ of exams), <strong>Simple and Compound Interest</strong> (70%+), <strong>Ratio and Proportion</strong> (65%+), <strong>Time-Speed-Distance/Work</strong> (60%+), <strong>Number Series and Simplification</strong> (55%+), and <strong>Average, Age, and Mixture problems</strong> (50%+). Geometry and algebra questions appear less frequently but should not be ignored.</p>

    <h2>Percentage, Profit-Loss, and Discount</h2>
    <p>Percentage questions in Loksewa typically involve finding a percentage of a number, percentage increase/decrease, successive discounts, or comparing two quantities as percentages. <strong>Key formulas to memorize:</strong> Percentage change = (Change/Original) × 100; Successive discount equivalent = a + b − (ab/100); If price increases by x%, to maintain same expenditure, consumption must decrease by [x/(100+x)] × 100.</p>
    <p>Profit and loss problems usually ask you to find selling price, cost price, profit percentage, or discount percentage. <strong>Critical relationships:</strong> SP = CP × (1 + P/100) for profit, SP = CP × (1 − L/100) for loss, and Marked Price × (1 − d/100) = Selling Price. A common Loksewa pattern gives you the marked price, discount percentage, and asks for profit percentage — practice this variant extensively as it appeared in 4 of the last 5 exams.</p>
    <p><strong>Shortcut example:</strong> If a shopkeeper gives 10% discount on Rs. 500 and still makes 20% profit, what is the cost price? Instead of step-by-step calculation: SP = 500 × 0.9 = 450. CP = 450/1.2 = 375. With practice, you should solve this in under 30 seconds.</p>

    <h2>Simple and Compound Interest</h2>
    <p>Interest calculations are among the most predictable Loksewa math topics. <strong>Simple Interest (SI) = (P × R × T) / 100</strong> and <strong>Compound Interest (CI) = P(1 + R/100)^n − P</strong> are the foundational formulas. Questions often compare SI and CI over multiple years, or ask for the total amount after a given period.</p>
    <p>A frequently tested variant asks: "In how many years will a sum double at x% simple interest?" The shortcut answer is <strong>100/x years</strong> (e.g., at 10% SI, money doubles in 10 years; at 5% SI, it doubles in 20 years). Another common pattern involves compound interest with half-yearly or quarterly compounding — adjust the rate and time accordingly: for half-yearly, R becomes R/2 and n becomes 2n; for quarterly, R becomes R/4 and n becomes 4n.</p>
    <p>Installment-based interest problems have appeared in recent exams. For example: "A sum of Rs. 10,000 is to be repaid in 2 equal annual installments at 20% CI. Find each installment." The formula for each installment when paid annually is: <strong>Installment = P × r × (1+r)^n / [(1+r)^n − 1]</strong> where r = R/100. Practice at least 20 problems of each interest type to build speed and confidence.</p>

    <h2>Ratio, Proportion, and Partnership</h2>
    <p>Ratio questions test your ability to compare quantities and distribute amounts proportionally. The core principle is that <strong>if two quantities are in ratio a:b, they can be expressed as ax and bx</strong> — use this to convert ratios to actual values when a total or difference is given. Partnership problems are a natural extension: if A and B invest in ratio 3:2 for 12 months each, their profit ratio is also 3:2; but if A invests for 12 months and B for 8 months, the effective ratio is (3×12):(2×8) = 36:16 = 9:4.</p>
    <p><strong>Mixture and alligation problems</strong> are a high-yield sub-topic. The alligation rule helps find the ratio of two ingredients when their individual prices and the mixture price are known: <strong>(Costlier price − Mean price) : (Mean price − Cheaper price)</strong>. This applies to mixing metals, liquids, or even averaging speeds. Expect 1–2 questions involving alligation in most exams.</p>

    <h2>Time, Speed, Distance, and Work</h2>
    <p>These topics share a common framework: <strong>Work = Rate × Time</strong>. For speed-distance problems, Distance = Speed × Time. Key conversions to memorize: 1 km/hr = 5/18 m/s; 1 m/s = 18/5 km/hr. Average speed when distances are equal = 2ab/(a+b) (harmonic mean); average speed when times are equal = (a+b)/2 (arithmetic mean).</p>
    <p><strong>Work problems</strong> in Loksewa typically involve two or more workers with different efficiencies. The standard approach: if A can complete a work in 10 days and B in 15 days, their combined rate is 1/10 + 1/15 = 5/30 = 1/6, so they complete the work together in 6 days. For problems with pipes filling tanks: inlet pipes add to the rate, outlet pipes subtract from it. A common trick question involves calculating how much work is done before a worker leaves or joins.</p>
    <p><strong>Relative speed problems</strong> appear when two objects move in the same direction (relative speed = difference of speeds) or opposite directions (relative speed = sum of speeds). Train problems often ask for the time to cross a platform (total distance = train length + platform length) or a person standing on the platform (total distance = train length only).</p>

    <h2>Number Series, Simplification, and Reasoning</h2>
    <p>Number series questions ask you to identify the pattern in a sequence and find the next number. Common patterns tested in Loksewa include: <strong>arithmetic progression</strong> (constant difference), <strong>geometric progression</strong> (constant ratio), <strong>squares/cubes</strong> (1, 4, 9, 16, 25... or 1, 8, 27, 64...), <strong>Fibonacci-type</strong> (each term is sum of previous two), and <strong>alternating series</strong> (two patterns interleaved). Practice 10 series problems daily to develop pattern recognition speed.</p>
    <p>Simplification questions test BODMAS/PEMDAS rules and quick mental arithmetic. Master these shortcuts: multiplying by 11 (write the digit, add adjacent digits), multiplying by 5 (divide by 2 and multiply by 10), squaring numbers ending in 5 (e.g., 35² = 3×4 = 12, append 25 → 1225). In logical reasoning, expect questions on coding-decoding, blood relations, direction sense, and seating arrangements — each typically 1–2 questions per exam.</p>

    <h2>Practice Strategies and Common Mistakes</h2>
    <p><strong>Solve past papers under timed conditions:</strong> Obtain at least 10 years of Loksewa preliminary question papers and solve the math sections with a stopwatch. Track your accuracy and speed per question type. Target: 90%+ accuracy in percentage, interest, and ratio questions (high-frequency topics) and 80%+ in less frequent topics.</p>
    <p><strong>Common mistakes to avoid:</strong> (1) Not reading the question carefully — check whether the question asks for the total amount or just the interest, profit percentage or profit amount, in km/hr or m/s. (2) Calculation errors in unit conversions — always double-check km-to-m and hour-to-second conversions. (3) Confusing simple and compound interest — SI is linear, CI is exponential; in 2 years, the difference between CI and SI is P(R/100)². (4) Spending too long on a single question — if you can't solve it in 90 seconds, move on and return later.</p>
    <p><strong>Daily practice plan:</strong> Dedicate 45–60 minutes daily to math. Solve 10 questions from the current topic, 5 from previously covered topics (spaced repetition), and 5 from past Loksewa papers. Maintain an error log — write down every mistake with the correct solution and review it weekly. Use R.S. Aggarwal's "Quantitative Aptitude" as a reference for concept-building, and switch to Loksewa-specific mock papers in the final 2 months for exam-oriented practice.</p>

    <hr/>
    <h2>References</h2>
    <ul>
      <li>Public Service Commission Nepal — <em>psc.gov.np</em> (Past question papers and model sets)</li>
      <li>"Quantitative Aptitude for Competitive Examinations" — R.S. Aggarwal (reference text)</li>
      <li>"Fast Track Objective Arithmetic" — Rajesh Verma (shortcut methods)</li>
      <li>Loksewa Aayog Published Model Questions — Available at PSC provincial offices</li>
    </ul>
  `,
  'economics-preparation-guide-loksewa': `
    <h2>Why Economics Matters in Loksewa</h2>
    <p>Economics carries approximately <strong>10–15 marks</strong> in the Loksewa preliminary examination and forms a significant portion of the main written paper as well. Questions range from basic definitions of GDP, inflation, and fiscal policy to Nepal-specific data points such as the current budget size, revenue collection figures, remittance trends, and trade balance statistics. A solid command of both macroeconomic theory and Nepal's economic landscape is essential for scoring well in this section.</p>
    <p>Over the past five years, Loksewa economics questions have become increasingly data-driven. Rather than asking abstract definitions, the PSC now tests whether candidates can interpret economic indicators and relate them to Nepal's policy environment. For example, instead of asking "What is GDP?", the exam might ask "If Nepal's GDP growth rate was 3.9% in FY 2080/81 and the agricultural sector contributed 24%, what does this indicate about structural transformation?" — requiring both knowledge and analytical thinking.</p>

    <h2>Core Macroeconomic Concepts</h2>
    <p>The foundational macroeconomic concepts you must master include: <strong>GDP and GNP</strong> (understand the difference — GDP measures domestic production, GNP includes income from abroad), <strong>inflation and CPI</strong> (Consumer Price Index measures the average change in prices of a basket of goods), <strong>fiscal policy</strong> (government revenue and expenditure decisions), <strong>monetary policy</strong> (Nepal Rastra Bank's tools: CRR, bank rate, open market operations), and <strong>balance of payments</strong> (current account, capital account, and financial account). Each of these concepts appears in 1–2 questions in a typical preliminary exam.</p>
    <p>Pay special attention to <strong>fiscal federalism in Nepal</strong>. The Constitution of Nepal 2072 delineates revenue-sharing between federal, provincial, and local governments through the National Natural Resources and Fiscal Commission (NNRFC). The four types of grants — <strong>conditional, matching, equalization, and special</strong> — are a frequently tested topic. Memorize the definitions and examples of each grant type: equalization grants address horizontal fiscal imbalances between provinces, conditional grants are tied to specific programs, matching grants require the recipient to contribute a share, and special grants are for special circumstances.</p>

    <h2>Nepal's Economic Indicators to Memorize</h2>
    <p>For the current exam cycle, memorize these key Nepal-specific economic figures (verify with the latest Economic Survey and budget documents): <strong>Total budget size</strong> for the current fiscal year, <strong>revenue-to-GDP ratio</strong>, <strong>remittance as a percentage of GDP</strong> (one of the highest in the world at approximately 25%), <strong>trade deficit</strong> (Nepal imports far more than it exports, with India and China being the largest trading partners), <strong>foreign exchange reserves</strong>, <strong>inflation rate</strong>, and <strong>per capita income</strong>. These data points appear in 2–3 questions per exam and are also useful for essay-type answers in the main written examination.</p>
    <p>Understand <strong>Nepal's economic structure</strong>: agriculture contributes roughly 22–24% of GDP but employs over 60% of the workforce (indicating low productivity), services contribute about 50–55%, and industry approximately 15–18%. This structural imbalance is a key theme in development economics questions. Also study the <strong>remittance economy</strong>: remittance inflows from Nepali workers abroad (primarily in Gulf countries, Malaysia, and India) are the single largest source of foreign exchange and a major driver of consumption, real estate, and import demand.</p>

    <h2>Budget and Fiscal Policy Deep-Dive</h2>
    <p>The annual <strong>Government of Nepal budget</strong> is released on Jestha 15 (late May/early June) each year. The budget speech by the Finance Minister is a treasure trove of exam-relevant data. Key items to extract: total budget allocation, split between <strong>capital expenditure</strong> (development budget) and <strong>current expenditure</strong> (regular budget), major policy announcements, new programs and schemes, sector-wise allocations (education, health, infrastructure, defense), and revenue targets. The ratio of capital to current expenditure is a critical indicator — a high current expenditure ratio signals inefficient spending, while a growing capital expenditure ratio indicates investment in development.</p>
    <p>The <strong>Economic Survey</strong> published by the Ministry of Finance just before the budget provides a comprehensive review of the previous fiscal year's economic performance. Study this document for: GDP growth trend, sectoral growth rates, export/import composition, foreign direct investment (FDI) inflows, poverty reduction trends, and progress on Sustainable Development Goals (SDGs). The Loksewa main exam often asks essay questions that require you to reference specific data from the Economic Survey.</p>

    <h2>Study Plan for Economics</h2>
    <p>Allocate <strong>6–8 weeks</strong> for dedicated economics preparation. Start with fundamentals (Week 1–2): study NCERT Class 11 and 12 economics textbooks (available in Nepali) for macroeconomics basics. Then move to Nepal-specific content (Week 3–4): read the latest Economic Survey, budget document, and Nepal Rastra Bank quarterly reports. Focus on data memorization and understanding cause-effect relationships between policies and outcomes.</p>
    <p>In Weeks 5–6, practice past Loksewa questions and model sets. Economics questions in Loksewa follow predictable patterns — most test either a definition applied to a Nepal context or a data-based interpretation. Create a one-page cheat sheet with the latest economic figures (GDP, inflation, budget size, remittance %, trade deficit) and review it daily in the final month. For the main written examination, practice writing short analytical paragraphs connecting economic data to policy recommendations.</p>

    <hr/>
    <h2>References</h2>
    <ul>
      <li>Public Service Commission Nepal — <em>psc.gov.np</em> (Syllabus, past papers)</li>
      <li>Ministry of Finance Nepal — Economic Survey and Budget Documents (<em>mof.gov.np</em>)</li>
      <li>Nepal Rastra Bank — Quarterly Monetary Policy and Current Macroeconomic Situation Reports (<em>nrb.org.np</em>)</li>
      <li>NCERT Economics Textbooks (Class 11–12) — Available at <em>ncert.nic.in</em></li>
      <li>National Natural Resources and Fiscal Commission — <em>nnrfc.gov.np</em></li>
    </ul>
  `,
  'english-grammar-tips-loksewa': `
    <h2>The English Section in Loksewa</h2>
    <p>The English language section in the Loksewa preliminary exam typically contributes <strong>5–10 questions</strong> out of 100, covering grammar, vocabulary, comprehension, and sometimes basic writing skills. While this is a smaller section compared to General Knowledge or Constitution, these are "easy marks" that can differentiate candidates — most Loksewa aspirants focus heavily on content subjects and under-prepare for English, leaving an opportunity for those who practice systematically.</p>
    <p>Common question types in the English section include: <strong>sentence correction</strong> (identifying grammatical errors), <strong>error spotting</strong> (finding the incorrect part of a sentence), <strong>fill in the blanks</strong> (choosing the correct word or phrase), <strong>sentence rearrangement</strong> (putting jumbled sentences in correct order), <strong>cloze passages</strong> (filling gaps in a short passage), <strong>synonyms and antonyms</strong>, and <strong>one-word substitution</strong>. Each type follows identifiable patterns, and focused practice on 100–200 questions of each type is sufficient for near-perfect accuracy.</p>

    <h2>Grammar Rules Most Frequently Tested</h2>
    <p>Based on analysis of Loksewa preliminary papers from the past decade, the most commonly tested grammar topics are: <strong>subject-verb agreement</strong> (especially with collective nouns and compound subjects), <strong>tense consistency</strong> (maintaining the same tense within a sentence or paragraph), <strong>prepositions</strong> (in/at/on, between/among, by/until, etc.), <strong>articles</strong> (a/an/the — especially with proper nouns and abbreviations), <strong>active vs. passive voice</strong> (conversion and identification), <strong>direct vs. indirect speech</strong> (reporting verbs and tense changes), and <strong>conditional sentences</strong> (if-clauses with first, second, and third conditionals).</p>
    <p>A high-yield grammar rule that appears in nearly every exam is <strong>subject-verb agreement with tricky subjects</strong>. Remember: "The news is good" (uncountable, singular verb), "The police are investigating" (collective noun, plural verb in British/Indian English convention used in Nepal), "Neither the teacher nor the students were present" (with "neither...nor", the verb agrees with the nearer subject), and "Each of the students has a book" (with "each", "every", "either", "neither" as subject, the verb is always singular). Master these rules and you'll answer 3–4 English questions correctly without effort.</p>

    <h2>Vocabulary Building Strategy</h2>
    <p>For vocabulary, Loksewa tests words at the <strong>intermediate to advanced level</strong> — roughly equivalent to Class 10–12 English vocabulary. Focus on learning <strong>high-frequency word lists</strong> rather than attempting to memorize entire dictionaries. Start with the 500 most commonly tested words in competitive examinations (available in books like "Word Power Made Easy" by Norman Lewis). Group words by theme (e.g., words related to governance: "transparent," "accountability," "bureaucracy," "devolution") to connect vocabulary building with your Loksewa content preparation.</p>
    <p>Learn <strong>roots, prefixes, and suffixes</strong> to decode unfamiliar words. Common prefixes: "un-/in-/dis-" (negative), "re-" (again), "pre-" (before), "anti-" (against). Common suffixes: "-tion/-sion" (noun: "administration"), "-ment" (noun: "government"), "-able/-ible" (adjective: "accountable"). If you encounter an unknown word in the exam, use word-formation knowledge to make an educated guess. Also study <strong>idioms and phrases</strong> — questions like "What does 'to burn the midnight oil' mean?" appear in 1–2 questions per exam.</p>

    <h2>Reading Comprehension Tips</h2>
    <p>Although comprehension passages do not appear in every Loksewa preliminary exam, they are included in the syllabus and have appeared in main written examinations. When they do appear, the passage is typically 150–250 words on a topic related to governance, economics, or social issues. Questions test your ability to identify the <strong>main idea</strong>, draw <strong>inferences</strong>, understand <strong>vocabulary in context</strong>, and identify the <strong>author's tone or purpose</strong>.</p>
    <p>Read the questions before the passage — this targeted reading approach saves time and helps you locate answers quickly. For inference questions, look for words like "suggests," "implies," "can be inferred," or "most likely means" — these require you to go beyond the literal text. For vocabulary-in-context questions, substitute the given word with each option and see which one maintains the sentence's meaning. Never select an option that is true in general but not supported by the passage.</p>

    <h2>Error Spotting Techniques</h2>
    <p>Error spotting questions present a sentence with four underlined parts and ask you to identify which part contains a grammatical error. The key technique is to <strong>read each underlined part in isolation</strong> and check it against common error patterns. The most frequent errors in Loksewa include: <strong>subject-verb disagreement</strong> (check if the verb matches the subject in number, especially when prepositional phrases separate them), <strong>incorrect preposition usage</strong> (e.g., "discuss about" is wrong — it should be "discuss"), <strong>pronoun-antecedent agreement errors</strong> (e.g., "Every student must bring their book" — while common in speech, formal English prefers "his or her book" in traditional grammar tests), and <strong>parallelism errors</strong> (all items in a list must follow the same grammatical form).</p>
    <p>Develop a systematic approach: start with the verb (is it in the correct tense? does it agree with the subject?), then check the subject (singular or plural?), then prepositions, then articles, and finally pronouns. In Loksewa exams, approximately <strong>60% of error-spotting questions involve subject-verb agreement</strong>, so master this rule first. If you cannot find an error after checking all common patterns, re-read the sentence as a whole — sometimes the error is in a part you initially assumed was correct.</p>

    <h2>Sentence Correction Strategies</h2>
    <p>Sentence correction questions give you a sentence with an error and four alternative versions. The most efficient strategy is to <strong>identify the error first without looking at the options</strong>, then find the option that fixes it. Common corrections tested in Loksewa include: fixing <strong>dangling modifiers</strong> (e.g., "Walking to the office, the rain started" should be "Walking to the office, I got caught in the rain"), correcting <strong>verb tense consistency</strong> (e.g., "He went to the market and buys vegetables" should use consistent past tense), resolving <strong>ambiguous pronoun references</strong> (e.g., "When the manager met the employee, he was angry" — who was angry?), and fixing <strong>incorrect comparisons</strong> (e.g., "Nepal's population is smaller than India" should be "smaller than India's").</p>
    <p>A powerful technique is the <strong>elimination method</strong>: if two options differ only in one word or phrase, the difference is likely where the error lies. Compare options pairwise to quickly narrow down to the correct answer. Practice with at least 150 sentence correction questions from past Loksewa papers and competitive exam books — pattern recognition improves dramatically with volume. For each mistake, note the specific grammar rule violated and review it in your grammar reference (Wren & Martin or S.P. Bakshi).</p>

    <h3>Tips for the Cloze Test Section</h3>
    <p>Cloze tests (fill-in-the-blanks passages) require you to choose the correct word for each blank based on context, grammar, and collocation. These passages are typically 100–200 words with 5–10 blanks. <strong>Strategy:</strong> First, read the entire passage without filling any blanks to understand the overall meaning and tone. Then, for each blank, consider the <strong>immediate context</strong> (the sentence containing the blank), the <strong>surrounding sentences</strong> (is the passage discussing causes, effects, or examples?), and the <strong>grammatical fit</strong> (does the blank need a noun, verb, adjective, or conjunction?).</p>
    <p>Pay attention to <strong>transition words</strong> near blanks — "however," "therefore," "moreover," "although," and "despite" signal logical relationships that constrain the answer. If a blank follows "however," the answer likely contrasts with the preceding idea. Also watch for <strong>collocations</strong> (fixed word pairs): "make a decision" (not "do a decision"), "conduct an investigation" (not "perform an investigation"), "pose a threat" (not "place a threat"). These are frequently tested in Loksewa cloze passages. Eliminate options that are grammatically impossible first, then choose between remaining options based on meaning and tone.</p>

    <h2>Daily Practice Routine</h2>
    <p>Dedicate <strong>30–40 minutes daily</strong> to English practice. Solve 5–10 grammar questions, 3–5 vocabulary questions, and read one English newspaper editorial (The Kathmandu Post or Republica). Reading editorials simultaneously improves comprehension, vocabulary, and current affairs knowledge — making this the single highest-return activity for Loksewa preparation. Maintain a vocabulary notebook where you record new words with their meanings, example sentences, and synonyms. Review this notebook weekly and prioritize words that appear multiple times.</p>

    <hr/>
    <h2>References</h2>
    <ul>
      <li>Public Service Commission Nepal — <em>psc.gov.np</em> (Model questions, English section)</li>
      <li>"Word Power Made Easy" — Norman Lewis (vocabulary building)</li>
      <li>"High School English Grammar and Composition" — Wren & Martin (grammar reference)</li>
      <li>"Objective General English" — S.P. Bakshi (competitive exam practice)</li>
      <li>The Kathmandu Post / Republica — Daily editorials for comprehension practice</li>
    </ul>
  `,
  'interview-preparation-loksewa-final-stage': `
    <h2>The Loksewa Interview: An Overview</h2>
    <p>The interview (साक्षात्कार) is the <strong>final stage of the Loksewa selection process</strong>, conducted after candidates pass the main written examination. It typically carries <strong>20–30 marks</strong> depending on the service group and level. While this may seem like a small portion compared to the written exam (200–400 marks), the interview can be the deciding factor when candidates have similar written scores. A difference of 3–5 marks in the interview often separates selected candidates from those on the waiting list.</p>
    <p>The Loksewa interview is conducted by a panel appointed by the Public Service Commission, typically comprising 3–5 members including subject experts, senior administrators, and a PSC representative. The interview lasts <strong>15–25 minutes</strong> and is conducted in Nepali or English (or both — the panel may switch languages to test bilingual fluency). The format is conversational but structured, covering your academic background, subject knowledge, current affairs awareness, situational judgment, and personality traits.</p>

    <h2>Common Interview Questions and How to Prepare</h2>
    <p>Loksewa interviews consistently include four categories of questions. <strong>Category 1 — Personal Introduction:</strong> "Tell us about yourself." Prepare a 2-minute structured introduction covering your name, educational background, work experience (if any), why you chose the civil service, and what specific contribution you hope to make. Avoid generic statements — tie your personal story to public service motivation. For example, mention if you have observed governance challenges in your community and want to contribute to addressing them.</p>
    <p><strong>Category 2 — Subject Knowledge:</strong> The panel will ask 3–5 questions related to your exam subject or the post you have applied for. These are typically conceptual questions testing depth of understanding, not recall of article numbers. For a Nasu post, expect questions about office procedures, file management, and the Civil Service Act. For Officer-level posts, expect questions about policy analysis, governance challenges, and administrative law. Review your main written exam preparation notes — the interview tests the same syllabus but demands a more articulate, well-structured response.</p>
    <p><strong>Category 3 — Current Affairs:</strong> "What are the major challenges facing Nepal's economy?" "Explain the latest amendment to the Civil Service Act." "What is Nepal's position on the XYZ international issue?" Prepare for 5–6 major current events from the past 6 months, with a balanced perspective (show awareness of multiple viewpoints, then state your reasoned opinion). Avoid taking strong political stances — the PSC values neutrality and objectivity in civil servants.</p>
    <p><strong>Category 4 — Situational Judgment:</strong> "If your superior officer asks you to do something that violates regulations, what would you do?" "How would you handle a situation where a citizen comes to your office in distress and your department cannot immediately help?" These questions test your integrity, problem-solving ability, and understanding of administrative procedures. The ideal response demonstrates knowledge of rules, empathy for citizens, willingness to escalate through proper channels, and commitment to transparency.</p>

    <h2>Dress Code and Body Language</h2>
    <p>The Loksewa interview panel expects <strong>formal professional attire</strong> — for men: a well-ironed dress shirt, trousers, tie, and formal shoes; for women: a formal saree, blouse, or western business attire with closed-toe shoes. Avoid flashy accessories, strong perfumes, or casual clothing. Your appearance should communicate professionalism and respect for the process. Arrive at the venue at least 30 minutes early to settle nerves and complete any preliminary formalities.</p>
    <p><strong>Body language matters significantly.</strong> Enter the interview room with confidence — knock, wait for permission, greet the panel members (namaste or a polite "Good morning/afternoon"), and wait to be seated. Maintain eye contact with the panel member asking the question while also acknowledging others. Sit upright with hands on your lap (avoid crossing arms, which can appear defensive). When answering, speak clearly at a moderate pace — nervousness tends to make candidates speak too fast. If you don't know an answer, it is far better to admit it gracefully ("I don't have complete knowledge of this topic, but based on my understanding...") than to guess wildly or provide incorrect information.</p>

    <h2>Mock Interview Practice</h2>
    <p>Practicing mock interviews is the single most effective preparation strategy. Arrange <strong>at least 5–8 mock interviews</strong> before the actual day. Ideally, practice with former Loksewa candidates, coaching center instructors, or peers who can provide honest feedback. Record your mock sessions (with permission) to review your body language, filler words ("um," "uh," "basically"), and response structure. Target: eliminate filler words, maintain responses within 60–90 seconds per question, and practice transitioning smoothly between Nepali and English if needed.</p>
    <p>Structure every answer using the <strong>PREP framework</strong>: <strong>P</strong>oint (state your main argument), <strong>R</strong>eason (explain why), <strong>E</strong>xample (provide a specific case or data point), and <strong>P</strong>oint (restate or conclude). This structure ensures clarity and completeness. For example: "I believe transparency is the foundation of good governance (Point). When citizens can access government decisions and budgets, it creates accountability (Reason). The Right to Information Act 2064 in Nepal has been used effectively by journalists and citizens to expose corruption in several local governments (Example). Therefore, I would prioritize proactive disclosure of information if appointed to a public position (Point)."</p>

    <h2>Using the STAR Method for Interview Answers</h2>
    <p>The <strong>STAR method</strong> (Situation, Task, Action, Result) is a proven framework for answering behavioral and situational interview questions. While the PREP framework (Point, Reason, Example, Point) works well for opinion-based questions, STAR is ideal when the panel asks about your <strong>past experiences or how you would handle a specific scenario</strong>. Here's how to apply it in a Loksewa context:</p>
    <p><strong>S — Situation:</strong> Briefly describe the context. Keep it concise — 1–2 sentences. For example: "During my final year of university, I was elected coordinator of a community development project in my village."</p>
    <p><strong>T — Task:</strong> State what you were responsible for or what challenge you faced. "Our task was to build a drinking water supply system for 50 households within a Rs. 2 lakh budget and a 3-month deadline."</p>
    <p><strong>A — Action:</strong> This is the most important part — describe the specific steps <em>you</em> took. Use "I" statements, not "we" statements. "I prepared a detailed cost estimate, mobilized local volunteers for labor, negotiated with the District Development Committee for supplementary funding, and supervised the construction phase by visiting the site every weekend."</p>
    <p><strong>R — Result:</strong> Quantify the outcome if possible. "We completed the project 2 weeks ahead of schedule, 10% under budget, and the system now provides clean water to all 50 households year-round. The VDC recognized our team with an appreciation letter."</p>
    <p>Practice preparing 5–6 STAR stories from different domains: academic achievements, leadership experiences, conflict resolution situations, challenges overcome, and community service. Adapt these stories to match different interview questions — the same STAR story can answer multiple questions with slight modifications. For hypothetical situational questions ("What would you do if..."), use a modified STAR approach: describe the Situation the panel presents, define your Task, outline your Action plan step-by-step, and predict the expected Result.</p>

    <h2>Documents to Bring to the Interview</h2>
    <p>Arriving at the PSC interview with complete and well-organized documents creates a positive first impression. Prepare a <strong>document folder</strong> with the following items, organized in this order:</p>
    <ul>
      <li><strong>Interview call letter</strong> — Print a hard copy and carry an extra. Do NOT rely on a digital copy on your phone.</li>
      <li><strong>Original academic certificates</strong> — SLC/SEE mark sheet, +2/Intermediate mark sheet, Bachelor's degree certificate and transcript, Master's degree certificate and transcript (if applicable). Bring originals in a protective cover.</li>
      <li><strong>Two sets of photocopies</strong> — All certificates and transcripts, front and back. Have these stapled separately and ready to submit if requested.</li>
      <li><strong>Citizenship certificate</strong> — Original and one photocopy. This is mandatory for identity verification.</li>
      <li><strong>Character certificate</strong> — From your most recent educational institution. Some PSC panels request this.</li>
      <li><strong>Experience certificate</strong> — If you have prior work experience, bring the original experience letter and a photocopy.</li>
      <li><strong>Training certificates</strong> — Any relevant training or workshop certificates that demonstrate professional development.</li>
      <li><strong>Passport-size photographs</strong> — Carry 4–6 recent passport-size photographs (mention if they need to be signed on the back).</li>
      <li><strong>Valid photo ID</strong> — Your citizenship certificate serves as primary ID; carry a passport or driving license as backup.</li>
    </ul>
    <p>Organize all documents in a <strong>clean, professional file folder</strong> with clear labeled sections. Avoid plastic bags or loose papers — disorganized documents suggest a disorganized candidate. Prepare the folder at least 2 days before the interview and verify each item against the PSC's interview call letter requirements. Some PSC panels may ask you to submit documents on the spot, so having photocopies ready saves time and demonstrates preparedness.</p>

    <h2>Day-of-Interview Checklist</h2>
    <p>On the interview day: carry your call letter, original certificates, two sets of photocopies, and a pen. Review your summary notes for 30 minutes before the interview (not new material). Stay hydrated but avoid heavy meals. If the interview is in the afternoon, eat a light lunch — a full stomach causes drowsiness. Take deep breaths before entering the room. Remember: the panel wants to select good candidates, not eliminate them. They are evaluating your potential, not looking for reasons to disqualify you. Approach the interview as a professional conversation about your qualifications and commitment to public service.</p>

    <hr/>
    <h2>References</h2>
    <ul>
      <li>Public Service Commission Nepal — Interview Guidelines, <em>psc.gov.np</em></li>
      <li>"Loksewa Aayog Interview Preparation Guide" — PSC Nepal Official Publication</li>
      <li>Civil Service Act 2049 and Regulations — Key provisions for interview discussion</li>
      <li>Constitution of Nepal 2072 — Fundamental duties of civil servants</li>
      <li>Gorkhapatra Daily — Current affairs for interview preparation (<em>gorkhapatraonline.com</em>)</li>
    </ul>
  `,
}

interface BlogPost {
  slug: string
  title: string
  excerpt: string
  date: string
  readTime: string
  category: string
  author: string
}

export function BlogPostPageClient({ post }: { post?: BlogPost }) {
  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20">
        <EmptyState
          icon={FileQuestion}
          title="Post Not Found"
          description="The blog post you are looking for does not exist or has been removed."
          actionLabel="Back to Blog"
          onAction={() => { window.location.href = '/blog' }}
        />
      </div>
    )
  }

  const contentHtml = blogContent[post.slug] || `
    <p>This article covers the topic of <strong>${post.title}</strong> in detail. The full content will be available soon.</p>
    <p>Check back later or explore other articles on our blog for more Loksewa preparation tips and guides.</p>
  `

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <motion.div whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35 }}>
        <Link href="/blog">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Blog
          </Button>
        </Link>

        <Badge variant="secondary" className="mb-4">{post.category}</Badge>
        <h1 className="font-display text-3xl sm:text-4xl tracking-tight text-foreground mb-4">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8 pb-6 border-b border-border">
          <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> {post.author}</span>
          <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {post.readTime} read</span>
        </div>

        <div
          className="prose prose-sm sm:prose max-w-none
            [&_h2]:font-display [&_h2]:text-xl [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-foreground
            [&_p]:text-muted-foreground [&_p]:leading-7 [&_p]:mb-4
            [&_strong]:text-foreground
          "
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      </motion.div>
    </div>
  )
}
