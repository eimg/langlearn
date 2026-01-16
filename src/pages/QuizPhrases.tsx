import { useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import QuizCard from '@/features/quiz/QuizCard'
import { usePhrases } from '@/features/content/api'
import type { Phrase } from '@/features/content/types'
import { useCountdownSetting } from '@/features/settings/useCountdownSetting'

type Language = 'en' | 'ja' | 'my'

const shuffleArray = <T,>(items: T[]) => {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

const QuizPhrases = () => {
  const { data, isLoading, isError, error } = usePhrases()
  const [promptLanguage, setPromptLanguage] = useState<Language>('en')
  const { seconds: countdownSeconds } = useCountdownSetting()
  const [isRandom, setIsRandom] = useState(true)
  const [ordered, setOrdered] = useState<Phrase[]>([])
  const [index, setIndex] = useState(0)
  const [resetKey, setResetKey] = useState(0)

  useEffect(() => {
    if (!data) return
    const nextOrder = isRandom ? shuffleArray(data) : data
    setOrdered(nextOrder)
    setIndex(0)
    setResetKey((value) => value + 1)
  }, [data, isRandom])

  const currentItem = useMemo(() => ordered[index], [ordered, index])

  const handleNext = () => {
    if (!ordered.length) return
    setIndex((value) => (value + 1) % ordered.length)
    setResetKey((value) => value + 1)
  }

  const handleRepeat = () => {
    setResetKey((value) => value + 1)
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">Phrase quiz</h1>
        <p className="text-slate-600">
          Read the phrase, wait for the countdown, then reveal the translation.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quiz settings</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-600">
            Prompt language
            <select
              value={promptLanguage}
              onChange={(event) => setPromptLanguage(event.target.value as Language)}
              className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <option value="en">English</option>
              <option value="ja">Japanese</option>
              <option value="my">Burmese</option>
            </select>
          </label>
          <div className="space-y-2">
            <p className="text-sm text-slate-600">Order</p>
            <Button
              type="button"
              variant={isRandom ? 'default' : 'outline'}
              onClick={() => setIsRandom((value) => !value)}
            >
              {isRandom ? 'Randomized' : 'In order'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card>
          <CardContent className="p-6 text-sm text-slate-600">Loading phrases...</CardContent>
        </Card>
      ) : isError ? (
        <Card>
          <CardContent className="p-6 text-sm text-red-600">
            {(error as Error).message}
          </CardContent>
        </Card>
      ) : !currentItem ? (
        <Card>
          <CardContent className="p-6 text-sm text-slate-600">
            No phrases yet. Add some in the entry form.
          </CardContent>
        </Card>
      ) : (
        <QuizCard
          mode="phrases"
          item={currentItem}
          promptLanguage={promptLanguage}
          countdownSeconds={countdownSeconds}
          onNext={handleNext}
          onRepeat={handleRepeat}
          resetKey={resetKey}
        />
      )}
    </div>
  )
}

export default QuizPhrases
