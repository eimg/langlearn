import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import AuthForm from '@/features/auth/AuthForm'
import { useAuthSession } from '@/features/auth/useAuthSession'
import { useObjects, usePhrases } from '@/features/content/api'
import type { ObjectItem, Phrase } from '@/features/content/types'
import EntryForm from '@/features/entry/EntryForm'
import { useCountdownSetting } from '@/features/settings/useCountdownSetting'
import { supabase } from '@/lib/supabase'

const PhrasePreviewCard = ({ item }: { item: Phrase }) => (
  <Card className="space-y-2 p-4">
    <p className="text-sm font-semibold text-slate-900">{item.lang_en}</p>
    <p className="text-sm text-slate-600">
      {item.lang_ja_kanji || item.lang_ja_hira || item.lang_ja}
    </p>
    <p className="text-sm text-slate-600">{item.lang_my}</p>
  </Card>
)

const ObjectPreviewCard = ({ item }: { item: ObjectItem }) => (
  <Card className="space-y-2 p-4">
    {item.image_url ? (
      <img
        src={item.image_url}
        alt={item.label_en}
        className="h-24 w-24 rounded-lg object-cover"
      />
    ) : (
      <div className="rounded-lg border border-dashed border-slate-300 p-4 text-xs text-slate-500">
        No image.
      </div>
    )}
    <p className="text-sm font-semibold text-slate-900">{item.label_en}</p>
    <p className="text-sm text-slate-600">
      {item.label_ja_kanji || item.label_ja_hira || item.label_ja}
    </p>
    <p className="text-sm text-slate-600">{item.label_my}</p>
  </Card>
)

const Settings = () => {
  const { seconds, updateSeconds, min, max } = useCountdownSetting()
  const { session, isLoading: isAuthLoading } = useAuthSession()

  const phrasesQuery = usePhrases()
  const objectsQuery = useObjects()

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-sky-200 to-amber-200">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 p-6">
        <header className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
            <p className="text-slate-600">Manage quiz content and sample data.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {session ? (
              <Button type="button" variant="outline" onClick={() => supabase.auth.signOut()}>
                Sign out
              </Button>
            ) : null}
            <Button asChild variant="outline">
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </header>

        <Card>
          <CardContent className="space-y-3 p-4">
            <p className="text-sm font-semibold text-slate-700">Countdown duration</p>
            <Input
              type="number"
              min={min}
              max={max}
              value={seconds}
              onChange={(event) => {
                const nextValue = Number(event.target.value)
                if (Number.isNaN(nextValue)) return
                updateSeconds(nextValue)
              }}
            />
            <p className="text-xs text-slate-500">Choose between {min}s and {max}s.</p>
          </CardContent>
        </Card>

        {isAuthLoading ? (
          <Card>
            <CardContent className="p-4 text-sm text-slate-500">Checking session...</CardContent>
          </Card>
        ) : session ? (
          <>
            <EntryForm />

            <Card>
              <CardContent className="space-y-4 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">Phrases</p>
              <Button asChild variant="outline" size="sm">
                <Link to="/settings/phrases">View all</Link>
              </Button>
            </div>
            {phrasesQuery.isLoading ? (
              <p className="text-sm text-slate-500">Loading...</p>
            ) : phrasesQuery.data?.length ? (
              <div className="space-y-3">
                {phrasesQuery.data.slice(0, 3).map((item) => (
                  <PhrasePreviewCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No phrases yet.</p>
            )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-4 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">Objects</p>
              <Button asChild variant="outline" size="sm">
                <Link to="/settings/objects">View all</Link>
              </Button>
            </div>
            {objectsQuery.isLoading ? (
              <p className="text-sm text-slate-500">Loading...</p>
            ) : objectsQuery.data?.length ? (
              <div className="space-y-3">
                {objectsQuery.data.slice(0, 3).map((item) => (
                  <ObjectPreviewCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No objects yet.</p>
            )}
              </CardContent>
            </Card>
          </>
        ) : (
          <AuthForm />
        )}
      </div>
    </div>
  )
}

export default Settings
