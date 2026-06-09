/**
 * Classifier — Auto subject/chapter tagger
 * Uses comprehensive Nepali+English keyword dictionaries for all 17 Loksewa subjects
 */

import type { LoksewaSubject, Difficulty } from '@/types/question'
import { LOKSEWA_SUBJECTS } from '@/lib/constants'

// ─── Subject Keywords ────────────────────────────────────────────────

interface SubjectKeywordEntry {
  keywords: string[]
  nepaliKeywords: string[]
  weight: number // Higher weight = stronger signal
}

const SUBJECT_KEYWORDS: Record<LoksewaSubject, SubjectKeywordEntry> = {
  'nepali': {
    keywords: ['nepali', 'vyakaran', 'grammar', 'sahitya', 'literature', 'nibandh', 'essay', 'patra', 'letter', 'anuvad', 'translation', 'kavita', 'poem', 'upasarga', 'prefix', 'pratyaya', 'suffix', 'linga', 'gender', 'vachan', 'number', 'karak', 'case', 'kriya', 'verb', 'sarvanam', 'pronoun', 'visheshan', 'adjective', 'ling', 'lakar', 'tense', 'pad', 'word', 'shabd', 'sandhi', 'samas', 'compound'],
    nepaliKeywords: ['नेपाली', 'व्याकरण', 'साहित्य', 'निबन्ध', 'पत्र', 'अनुवाद', 'कविता', 'उपसर्ग', 'प्रत्यय', 'लिङ्ग', 'वचन', 'कारक', 'क्रिया', 'सर्वनाम', 'विशेषण', 'लकार', 'पद', 'शब्द', 'सन्धि', 'समास', 'रस', 'छन्द', 'गद्य', 'पद्य', 'भाषा'],
    weight: 1.0,
  },
  'english': {
    keywords: ['english', 'grammar', 'vocabulary', 'comprehension', 'writing', 'translation', 'tense', 'preposition', 'article', 'clause', 'phrase', 'sentence', 'synonym', 'antonym', 'idiom', 'passage'],
    nepaliKeywords: ['अंग्रेजी', 'व्याकरण', 'शब्दावली', 'टाइम', 'प्रीपोजिसन'],
    weight: 1.0,
  },
  'general-knowledge': {
    keywords: ['general knowledge', 'gk', 'geography', 'nepal', 'mountain', 'everest', 'flag', 'national', 'bird', 'flower', 'animal', 'river', 'lake', 'festival', 'temple', 'world', 'capital', 'country', 'continent', 'ocean', 'sports', 'cricket', 'football', 'award', 'nobel', 'prize', 'organization', 'un', 'unicef', 'who', 'unesco', 'asean', 'saarc'],
    nepaliKeywords: ['सामान्य ज्ञान', 'भूगोल', 'पहाड', 'सगरमाथा', 'झण्डा', 'राष्ट्रिय', 'पक्षी', 'फूल', 'जनावर', 'नदी', 'ताल', 'चाडपर्व', 'मन्दिर', 'विश्व', 'राजधानी', 'देश', 'महादेश', 'सागर', 'खेलकुद', 'क्रिकेट', 'फुटबल', 'पुरस्कार', 'नोबेल', 'संस्था', 'संयुक्त राष्ट्र', 'सार्क', 'एसियान'],
    weight: 1.0,
  },
  'current-affairs': {
    keywords: ['current', 'recent', 'latest', '2024', '2025', '2026', 'news', 'policy', 'government', 'minister', 'prime minister', 'president', 'election', 'summit', 'agreement', 'treaty', 'budget', 'gdp', 'inflation', 'economy', 'trade', 'import', 'export', 'plan', 'development', 'infrastructure', 'project'],
    nepaliKeywords: ['समसामयिक', 'हालको', 'समाचार', 'नीति', 'सरकार', 'मन्त्री', 'प्रधानमन्त्री', 'राष्ट्रपति', 'निर्वाचन', 'सम्मेलन', 'सन्धि', 'बजेट', 'जीडीपी', 'मुद्रास्फीति', 'अर्थतन्त्र', 'व्यापार', 'आयात', 'निर्यात', 'योजना', 'विकास', 'पूर्वाधार', 'परियोजना', 'संघीय', 'प्रदेश', 'स्थानीय'],
    weight: 1.0,
  },
  'constitution': {
    keywords: ['constitution', 'article', 'fundamental rights', 'directive principles', 'parliament', 'executive', 'judiciary', 'federal', 'provincial', 'local government', 'election commission', 'public service commission', 'psc', 'loksewa', 'citizenship', 'amendment', 'supreme court', 'constitutional', 'sovereignty', 'democracy', 'republic', 'secular', 'inclusive', 'human rights', 'right to', 'freedom of', 'duty'],
    nepaliKeywords: ['संविधान', 'अनुच्छेद', 'मौलिक हक', 'निर्देशक सिद्धान्त', 'संसद', 'कार्यपालिका', 'न्यायपालिका', 'संघीय', 'प्रदेश', 'स्थानीय सरकार', 'निर्वाचन आयोग', 'लोकसेवा आयोग', 'नागरिकता', 'संशोधन', 'सर्वोच्च', 'संवैधानिक', 'सार्वभौमिकता', 'लोकतन्त्र', 'गणतन्त्र', 'धर्मनिरपेक्ष', 'समावेशी', 'मानव अधिकार', 'अधिकार', 'स्वतन्त्रता', 'कर्तव्य', 'प्रस्तावना', 'राज्य', 'प्रमुख', 'सभामुख', 'सदन', 'राष्ट्रिय सभा', 'प्रतिनिधि सभा', 'संविधान सभा', 'बहुदलीय', 'संसदीय'],
    weight: 1.2,
  },
  'governance': {
    keywords: ['governance', 'civil service', 'administration', 'bureaucracy', 'public', 'service', 'psc', 'nijamati', 'federal structure', 'devolution', 'decentralization', 'planning', 'development plan', 'annual plan', 'budget', 'tax', 'revenue', 'audit', 'accountability', 'transparency', 'good governance', 'e-governance', 'public service delivery', 'ministry', 'department', 'office', 'secretary', 'joint secretary', 'under secretary', 'section officer'],
    nepaliKeywords: ['शासन प्रणाली', 'लोकसेवा', 'निजामती', 'सेवा', 'प्रशासन', 'संघीय संरचना', 'विकेन्द्रीकरण', 'योजना', 'विकास योजना', 'बजेट', 'कर', 'राजस्व', 'लेखापरीक्षण', 'जवाफदेहिता', 'पारदर्शिता', 'अच्छो शासन', 'सेवा प्रदान', 'मन्त्रालय', 'विभाग', 'कार्यालय', 'सचिव', 'संयुक्त सचिव', 'उपसचिव', 'सहायक सचिव', 'कार्यलय', 'सरकारी कर्मचारी'],
    weight: 1.1,
  },
  'mathematics': {
    keywords: ['math', 'mathematics', 'algebra', 'geometry', 'statistics', 'trigonometry', 'probability', 'calculus', 'arithmetic', 'equation', 'fraction', 'percentage', 'ratio', 'proportion', 'profit', 'loss', 'interest', 'simple interest', 'compound interest', 'area', 'volume', 'perimeter', 'mean', 'median', 'mode', 'average', 'set', 'matrix', 'permutation', 'combination', 'speed', 'distance', 'time', 'work'],
    nepaliKeywords: ['गणित', 'बीजगणित', 'ज्यामिति', 'तथ्याङ्क', 'त्रिकोणमिति', 'सम्भाव्यता', 'समीकरण', 'अंश', 'प्रतिशत', 'अनुपात', 'नाफा', 'घाटा', 'ब्याज', 'साधारण ब्याज', 'चक्रिय ब्याज', 'क्षेत्रफल', 'आयतन', 'परिधि', 'औसत', 'गति', 'दूरी', 'समय', 'काम'],
    weight: 1.1,
  },
  'science-technology': {
    keywords: ['science', 'technology', 'physics', 'chemistry', 'biology', 'computer', 'it', 'innovation', 'atom', 'molecule', 'cell', 'dna', 'gravity', 'energy', 'electricity', 'light', 'sound', 'heat', 'photosynthesis', 'newton', 'einstein', 'internet', 'software', 'hardware', 'network', 'database', 'ai', 'artificial intelligence', 'robot'],
    nepaliKeywords: ['विज्ञान', 'प्रविधि', 'भौतिक', 'रसायन', 'जीवविज्ञान', 'कम्प्युटर', 'अणु', 'कोशिका', 'डीएनए', 'गुरुत्व', 'शक्ति', 'बिजुली', 'प्रकाश', 'ध्वनि', 'ताप', 'इन्टरनेट', 'सफ्टवेयर', 'हार्डवेयर'],
    weight: 1.0,
  },
  'geography': {
    keywords: ['geography', 'mountain', 'river', 'lake', 'climate', 'weather', 'plateau', 'valley', 'terai', 'hill', 'himalaya', 'everest', 'koshi', 'karnali', 'bagmati', 'gandaki', 'mahakali', 'mechi', 'monsoon', 'forest', 'biodiversity', 'ecosystem', 'physical', 'human', 'population', 'demography', 'map', 'latitude', 'longitude', 'altitude', 'elevation'],
    nepaliKeywords: ['भूगोल', 'पहाड', 'नदी', 'ताल', 'जलवायु', 'मौसम', 'उपत्यका', 'तराई', 'पहाडी', 'हिमाल', 'सगरमाथा', 'कोशी', 'कर्णाली', 'बागमती', 'गण्डकी', 'महाकाली', 'मेची', 'मनसुन', 'वन', 'जैवविविधता', 'जनसंख्या', 'नक्सा', 'अक्षांश', 'देशान्तर', 'उचाई'],
    weight: 1.0,
  },
  'history': {
    keywords: ['history', 'ancient', 'medieval', 'modern', 'king', 'kingdom', 'dynasty', 'war', 'battle', 'treaty', 'unification', 'prithvi narayan shah', 'gorkha', 'rana', 'democracy', 'revolution', 'movement', 'independence', 'mughal', 'british', 'colonial', 'empire', 'sugar', 'licchavi', 'malla', 'kathmandu', 'bhaktapur', 'patan', 'shah', 'constitutional', 'panchayat', 'referendum'],
    nepaliKeywords: ['इतिहास', 'प्राचीन', 'मध्यकालीन', 'आधुनिक', 'राजा', 'राज्य', 'वंश', 'युद्ध', 'सन्धि', 'एकीकरण', 'पृथ्वी नारायण शाह', 'गोरखा', 'राणा', 'लोकतन्त्र', 'क्रान्ति', 'आन्दोलन', 'स्वतन्त्रता', 'लिच्छवी', 'मल्ल', 'काठमाडौं', 'भक्तपुर', 'पाटन', 'शाह', 'पञ्चायत', 'जनमत'],
    weight: 1.0,
  },
  'economics': {
    keywords: ['economics', 'economy', 'macro', 'micro', 'gdp', 'inflation', 'deflation', 'monetary', 'fiscal', 'budget', 'tax', 'revenue', 'trade', 'export', 'import', 'balance of payment', 'foreign exchange', 'remittance', 'unemployment', 'poverty', 'development', 'planning', 'nepal rastra bank', 'central bank', 'commercial bank', 'world bank', 'imf', 'aid', 'grant', 'loan', 'debt', 'investment', 'fdi', 'remittance', 'income', 'consumption'],
    nepaliKeywords: ['अर्थशास्त्र', 'अर्थतन्त्र', 'मूल्य', 'मुद्रास्फीति', 'बजेट', 'कर', 'राजस्व', 'व्यापार', 'निर्यात', 'आयात', 'विनिमय दर', 'प्रवासी', 'रेमिटेन्स', 'बेरोजगारी', 'गरिबी', 'नेपाल राष्ट्र बैंक', 'केन्द्रिय बैंक', 'वाणिज्य बैंक', 'विश्व बैंक', 'आईएमएफ', 'सहायता', 'ऋण', 'लगानी', 'आय', 'खर्च'],
    weight: 1.0,
  },
  'law': {
    keywords: ['law', 'legal', 'act', 'regulation', 'code', 'civil', 'criminal', 'court', 'justice', 'lawyer', 'advocate', 'judge', 'case', 'trial', 'verdict', 'appeal', 'jurisdiction', 'constitutional law', 'civil law', 'criminal law', 'administrative law', 'international law', 'tort', 'contract', 'property', 'family law', 'labor law', 'human rights', 'ipc', 'crpc', 'evidence'],
    nepaliKeywords: ['कानून', 'न्याय', 'एक्ट', 'नियम', 'संहिता', 'अदालत', 'न्यायाधीश', 'वकिल', 'मुद्दा', 'निर्णय', 'अपिल', 'अधिकार क्षेत्र', 'संवैधानिक कानून', 'देवानी', 'फौजदारी', 'प्रशासनिक', 'अन्तर्राष्ट्रिय कानून'],
    weight: 1.0,
  },
  'public-administration': {
    keywords: ['public administration', 'admin', 'organization', 'personnel', 'financial', 'development', 'principles', 'management', 'leadership', 'decision making', 'planning', 'coordination', 'control', 'delegation', 'authority', 'responsibility', 'hierarchy', 'bureaucracy', 'weber', 'taylor', 'fayol', 'new public management', 'governance', 'policy', 'implementation', 'evaluation', 'hrm', 'performance', 'motivation', 'job satisfaction', 'e-governance'],
    nepaliKeywords: ['लोक प्रशासन', 'संगठन', 'कर्मचारी', 'वित्तीय', 'सिद्धान्त', 'व्यवस्थापन', 'नेतृत्व', 'निर्णय', 'योजना', 'समन्वय', 'नियन्त्रण', 'प्रतिनिधित्व', 'अधिकार', 'जिम्मेवारी', 'पदक्रम', 'नीति', 'कार्यान्वयन', 'मूल्याङ्कन', 'कर्मचारी व्यवस्थापन'],
    weight: 1.0,
  },
  'ethics': {
    keywords: ['ethics', 'moral', 'philosophy', 'integrity', 'corruption', 'transparency', 'accountability', 'conflict of interest', 'code of conduct', 'professional', 'ethical', 'virtue', 'duty', 'responsibility', 'honesty', 'fairness', 'justice', 'right', 'wrong', 'good governance', 'anti-corruption', 'whistleblower', 'caac', 'ciaa', 'commission', 'ombudsman'],
    nepaliKeywords: ['नैतिकता', 'नैतिक', 'सत्यनिष्ठा', 'भ्रष्टाचार', 'पारदर्शिता', 'जवाफदेहिता', 'स्वार्थ', 'आचार संहिता', 'पेशा', 'कर्तव्य', 'ईमान्दारी', 'न्याय', 'अच्छो शासन', 'भ्रष्टाचार विरोधी', 'लोकतान्त्रिक तरिकाले', 'निगरानी'],
    weight: 1.0,
  },
  'computer-it': {
    keywords: ['computer', 'it', 'information technology', 'software', 'hardware', 'network', 'database', 'programming', 'internet', 'html', 'css', 'javascript', 'python', 'java', 'c++', 'sql', 'windows', 'linux', 'android', 'ios', 'app', 'website', 'cloud', 'cyber', 'security', 'firewall', 'vpn', 'encryption', 'data', 'algorithm', 'binary', 'ram', 'cpu', 'gpu', 'server', 'client', 'email', 'wifi', 'bluetooth', 'usb', 'http', 'api'],
    nepaliKeywords: ['कम्प्युटर', 'सफ्टवेयर', 'हार्डवेयर', 'नेटवर्क', 'डाटाबेस', 'प्रोग्रामिङ', 'इन्टरनेट', 'सुरक्षा', 'वेबसाइट', 'क्लाउड', 'साइबर', 'डाटा', 'एल्गोरिदम'],
    weight: 1.0,
  },
  'environment': {
    keywords: ['environment', 'ecology', 'pollution', 'conservation', 'climate change', 'biodiversity', 'forest', 'wildlife', 'water', 'air', 'soil', 'deforestation', 'desertification', 'sustainable', 'renewable', 'solar', 'wind', 'hydropower', 'recycling', 'waste', 'ozone', 'greenhouse', 'carbon', 'emission', 'organic', 'endangered', 'species', 'habitat', 'wetland', 'national park', 'reserve'],
    nepaliKeywords: ['वातावरण', 'पारिस्थितिक', 'प्रदूषण', 'संरक्षण', 'जलवायु परिवर्तन', 'जैवविविधता', 'वन', 'वन्यजन्तु', 'पानी', 'हावा', 'माटो', 'वन विनाश', 'दिगो', 'नवीकरणयोग्य', 'सौर्य', 'जलविद्युत', 'रिसाइकल', 'फोहोर', 'ओजोन', 'ग्रीनहाउस', 'कार्बन', 'संरक्षित क्षेत्र', 'राष्ट्रिय निकुञ्ज', 'आरक्ष'],
    weight: 1.0,
  },
  'social-development': {
    keywords: ['social', 'development', 'education', 'health', 'gender', 'inclusion', 'poverty', 'welfare', 'child', 'women', 'disability', 'marginalized', 'indigenous', 'dalit', 'minority', 'rights', 'equity', 'equality', 'empowerment', 'community', 'rural', 'urban', 'migration', 'remittance', 'employment', 'labor', 'unemployment', 'hdi', 'mdg', 'sdg', 'ngo', 'ingo', 'civil society', 'social security', 'pension', 'insurance'],
    nepaliKeywords: ['सामाजिक विकास', 'शिक्षा', 'स्वास्थ्य', 'लिङ्ग', 'समावेशी', 'गरिबी', 'कल्याण', 'बाल', 'महिला', 'अपाङ्ग', 'हासिल नपारेको', 'जाति', 'दलित', 'अल्पसंख्यक', 'अधिकार', 'समानता', 'सशक्तिकरण', 'समुदाय', 'ग्रामीण', 'शहरी', 'बसाइँसराई', 'रोजगार', 'श्रम', 'एनजीओ', 'आईएनजीओ', 'सामाजिक सुरक्षा', 'पेन्सन', 'बिमा', 'लक्ष्य', 'एसडीजी'],
    weight: 1.0,
  },
}

// ─── Subject Classification ─────────────────────────────────────────

export function classifySubject(
  text: string
): { subject: LoksewaSubject; confidence: number } {
  const lower = text.toLowerCase()

  let bestSubject: LoksewaSubject = 'general-knowledge'
  let bestScore = 0

  for (const [subject, entry] of Object.entries(SUBJECT_KEYWORDS)) {
    let score = 0

    for (const kw of entry.keywords) {
      const regex = new RegExp(`\\b${kw}\\b`, 'gi')
      const matches = lower.match(regex)
      if (matches) {
        score += matches.length * entry.weight
      }
    }

    for (const kw of entry.nepaliKeywords) {
      if (text.includes(kw)) {
        score += 1.5 * entry.weight  // Nepali keywords are stronger signals
      }
    }

    if (score > bestScore) {
      bestScore = score
      bestSubject = subject as LoksewaSubject
    }
  }

  // Normalize confidence to 0-1 range
  const confidence = Math.min(bestScore / 5, 1)

  return { subject: bestSubject, confidence }
}

// ─── Chapter Classification ─────────────────────────────────────────

export function classifyChapter(
  text: string,
  subject: LoksewaSubject
): string | undefined {
  const subjectInfo = LOKSEWA_SUBJECTS.find((s) => s.id === subject)
  if (!subjectInfo) return undefined

  const lower = text.toLowerCase()

  // Try to match chapter names in the text
  let bestChapter: string | undefined
  let bestScore = 0

  for (const chapter of subjectInfo.chapters) {
    let score = 0
    const chapterLower = chapter.toLowerCase()

    if (lower.includes(chapterLower)) {
      score += 2
    }

    // Partial matching for multi-word chapters
    const chapterWords = chapterLower.split(/\s+/)
    for (const word of chapterWords) {
      if (word.length > 2 && lower.includes(word)) {
        score += 0.5
      }
    }

    if (score > bestScore) {
      bestScore = score
      bestChapter = chapter
    }
  }

  return bestChapter
}

// ─── Difficulty Classification ─────────────────────────────────────

export function classifyDifficulty(
  text: string,
  _optionsCount?: number
): Difficulty {
  const lower = text.toLowerCase()

  // Heuristics for difficulty
  const hardSignals = ['which of the following is not', 'all of the above', 'none of the above', 'except', 'निम्न मध्ये कुन', 'कुन होइन', 'बाहेक']
  const veryHardSignals = ['which of the following are correct', 'multiple correct', 'निम्न मध्ये कति', 'सही छन्', 'गलत छ']

  if (veryHardSignals.some((s) => lower.includes(s))) return 'very-hard'
  if (hardSignals.some((s) => lower.includes(s))) return 'hard'

  // Long, complex questions → harder
  const wordCount = text.split(/\s+/).length
  if (wordCount > 40) return 'hard'
  if (wordCount > 25) return 'medium'

  // Short, factual questions → easier
  return wordCount < 10 ? 'easy' : 'medium'
}

// ─── Year Extraction ────────────────────────────────────────────────

export function extractYear(text: string): number | undefined {
  // Try BS year (Nepali calendar): 2075-2090
  const bsMatch = text.match(/\b(20[7-8]\d|209\d)\s*(?:साल| BS|bs)?\b/)
  if (bsMatch) {
    const year = parseInt(bsMatch[1])
    if (year >= 2070 && year <= 2090) return year
  }

  // Try AD year converted hints
  const adPatterns = [
    /\b(20[1-3]\d)\s*(?:AD|ad|CE|ce)\b/,
    /\b(20[1-3]\d)\s*[\/\\]\s*\d+/,
  ]

  for (const pattern of adPatterns) {
    const match = text.match(pattern)
    if (match) {
      const adYear = parseInt(match[1])
      // Convert AD to BS (approx: +57)
      const bsYear = adYear + 57
      if (bsYear >= 2070 && bsYear <= 2090) return bsYear
    }
  }

  return undefined
}

// ─── Batch Classification (classify multiple questions at once) ─────

export function classifyBatchText(
  text: string
): { subject: LoksewaSubject; confidence: number; chapter?: string } {
  const { subject, confidence } = classifySubject(text)
  const chapter = classifyChapter(text, subject)
  return { subject, confidence, chapter }
}
