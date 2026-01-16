import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const seedPhrases = [
  {
    category: 'greetings',
    lang_en: 'Good morning',
    lang_ja: 'おはようございます',
    lang_ja_hira: 'おはようございます',
    lang_ja_kanji: 'お早うございます',
    lang_my: 'မင်္ဂလာနံနက်ခင်းပါ',
    notes: null,
  },
  {
    category: 'greetings',
    lang_en: 'Good night',
    lang_ja: 'おやすみなさい',
    lang_ja_hira: 'おやすみなさい',
    lang_ja_kanji: null,
    lang_my: 'ညအိပ်မက်ကောင်းပါစေ',
    notes: null,
  },
  {
    category: 'greetings',
    lang_en: 'Nice to meet you',
    lang_ja: 'はじめまして',
    lang_ja_hira: 'はじめまして',
    lang_ja_kanji: null,
    lang_my: 'တွေ့ရတာ ဝမ်းသာပါတယ်',
    notes: null,
  },
  {
    category: 'polite',
    lang_en: 'Thank you',
    lang_ja: 'ありがとう',
    lang_ja_hira: 'ありがとう',
    lang_ja_kanji: null,
    lang_my: 'ကျေးဇူးတင်ပါတယ်',
    notes: null,
  },
  {
    category: 'polite',
    lang_en: "You're welcome",
    lang_ja: 'どういたしまして',
    lang_ja_hira: 'どういたしまして',
    lang_ja_kanji: null,
    lang_my: 'ကြိုဆိုပါတယ်',
    notes: null,
  },
  {
    category: 'polite',
    lang_en: 'Please',
    lang_ja: 'お願いします',
    lang_ja_hira: 'おねがいします',
    lang_ja_kanji: 'お願いします',
    lang_my: 'ကျေးဇူးပြု၍',
    notes: null,
  },
  {
    category: 'polite',
    lang_en: 'Excuse me',
    lang_ja: 'すみません',
    lang_ja_hira: 'すみません',
    lang_ja_kanji: null,
    lang_my: 'ခွင့်လွှတ်ပါ',
    notes: null,
  },
  {
    category: 'smalltalk',
    lang_en: 'How are you?',
    lang_ja: '元気ですか？',
    lang_ja_hira: 'げんきですか？',
    lang_ja_kanji: '元気ですか？',
    lang_my: 'နေကောင်းလား',
    notes: null,
  },
  {
    category: 'smalltalk',
    lang_en: "I'm fine",
    lang_ja: '元気です',
    lang_ja_hira: 'げんきです',
    lang_ja_kanji: '元気です',
    lang_my: 'ကောင်းပါတယ်',
    notes: null,
  },
  {
    category: 'farewell',
    lang_en: 'Goodbye',
    lang_ja: 'さようなら',
    lang_ja_hira: 'さようなら',
    lang_ja_kanji: null,
    lang_my: 'နုတ်ဆက်ပါတယ်',
    notes: null,
  },
]

const seedObjects = []

const seed = async () => {
  const cleanupObjects = await supabase.from('objects').delete().not('id', 'is', null)
  if (cleanupObjects.error) throw cleanupObjects.error

  const cleanupPhrases = await supabase.from('phrases').delete().not('id', 'is', null)
  if (cleanupPhrases.error) throw cleanupPhrases.error

  const phrasesResult = await supabase.from('phrases').insert(seedPhrases)
  if (phrasesResult.error) throw phrasesResult.error

  if (seedObjects.length) {
    const objectsResult = await supabase.from('objects').insert(seedObjects)
    if (objectsResult.error) throw objectsResult.error
  }

  console.log('Seeded phrases and objects.')
}

seed().catch((error) => {
  console.error('Seed failed:', error.message)
  process.exit(1)
})
