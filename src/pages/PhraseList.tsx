import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import AuthForm from '@/features/auth/AuthForm'
import { useAuthSession } from '@/features/auth/useAuthSession'
import { useDeletePhrase, usePhrases, useUpdatePhrase } from '@/features/content/api'
import type { Phrase } from '@/features/content/types'

const PhraseItemCard = ({ item }: { item: Phrase }) => {
  const updatePhrase = useUpdatePhrase()
  const deletePhrase = useDeletePhrase()
  const [isEditing, setIsEditing] = useState(false)
  const [formState, setFormState] = useState({
    category: item.category || '',
    lang_en: item.lang_en,
    lang_ja_hira: item.lang_ja_hira || '',
    lang_ja_kanji: item.lang_ja_kanji || '',
    lang_my: item.lang_my,
    notes: item.notes || '',
  })

  useEffect(() => {
    setFormState({
      category: item.category || '',
      lang_en: item.lang_en,
      lang_ja_hira: item.lang_ja_hira || '',
      lang_ja_kanji: item.lang_ja_kanji || '',
      lang_my: item.lang_my,
      notes: item.notes || '',
    })
  }, [item])

  const handleSave = async () => {
    if (!formState.lang_en || !formState.lang_ja_hira || !formState.lang_my) return
    await updatePhrase.mutateAsync({
      id: item.id,
      category: formState.category || null,
      lang_en: formState.lang_en,
      lang_ja_hira: formState.lang_ja_hira,
      lang_ja_kanji: formState.lang_ja_kanji || null,
      lang_ja: formState.lang_ja_kanji || formState.lang_ja_hira,
      lang_my: formState.lang_my,
      notes: formState.notes || null,
    })
    setIsEditing(false)
  }

  return (
    <Card className="space-y-3 p-4">
      {isEditing ? (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Category</Label>
            <Input
              value={formState.category}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, category: event.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>English</Label>
            <Input
              value={formState.lang_en}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, lang_en: event.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Japanese (Hiragana)</Label>
            <Input
              value={formState.lang_ja_hira}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, lang_ja_hira: event.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Japanese (Kanji)</Label>
            <Input
              value={formState.lang_ja_kanji}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, lang_ja_kanji: event.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Burmese</Label>
            <Input
              value={formState.lang_my}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, lang_my: event.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={formState.notes}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, notes: event.target.value }))
              }
            />
          </div>
          <div className="flex gap-2">
            <Button type="button" onClick={handleSave} disabled={updatePhrase.isPending}>
              Save
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-lg font-semibold text-slate-900">{item.lang_en}</p>
          <p className="text-sm text-slate-600">
            {item.lang_ja_kanji || item.lang_ja_hira || item.lang_ja}
          </p>
          {item.lang_ja_hira && item.lang_ja_kanji ? (
            <p className="text-sm text-slate-500">{item.lang_ja_hira}</p>
          ) : null}
          <p className="text-sm text-slate-600">{item.lang_my}</p>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => deletePhrase.mutate(item.id)}
            >
              Delete
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}

const PhraseList = () => {
  const phrasesQuery = usePhrases()
  const { session, isLoading: isAuthLoading } = useAuthSession()

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-sky-200 to-amber-200">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 p-6">
        <header className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-slate-900">Phrases</h1>
            <p className="text-slate-600">Edit or remove phrases in the quiz.</p>
          </div>
          <Button asChild variant="outline">
            <Link to="/settings">Back to Settings</Link>
          </Button>
        </header>

        {isAuthLoading ? (
          <Card>
            <CardContent className="p-4 text-sm text-slate-500">Checking session...</CardContent>
          </Card>
        ) : session ? (
          <Card>
            <CardContent className="space-y-4 p-4">
              {phrasesQuery.isLoading ? (
                <p className="text-sm text-slate-500">Loading...</p>
              ) : phrasesQuery.data?.length ? (
                <div className="space-y-3">
                  {phrasesQuery.data.map((item) => (
                    <PhraseItemCard key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No phrases yet.</p>
              )}
            </CardContent>
          </Card>
        ) : (
          <AuthForm title="Sign in to manage phrases" />
        )}
      </div>
    </div>
  )
}

export default PhraseList
