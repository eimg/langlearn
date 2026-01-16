export type Phrase = {
  id: string
  category: string | null
  lang_en: string
  lang_ja: string
  lang_ja_hira: string | null
  lang_ja_kanji: string | null
  lang_my: string
  notes: string | null
  created_at: string
}

export type ObjectItem = {
  id: string
  category: string | null
  image_url: string | null
  label_en: string
  label_ja: string
  label_ja_hira: string | null
  label_ja_kanji: string | null
  label_my: string
  created_at: string
}

export type NewPhraseInput = Omit<Phrase, 'id' | 'created_at'>
export type NewObjectInput = Omit<ObjectItem, 'id' | 'created_at'>

export type UpdatePhraseInput = Partial<NewPhraseInput> & { id: string }
export type UpdateObjectInput = Partial<NewObjectInput> & { id: string }
