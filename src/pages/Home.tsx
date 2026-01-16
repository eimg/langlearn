import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useObjects, usePhrases } from '@/features/content/api'
import type { ObjectItem, Phrase } from '@/features/content/types'
import QuizCard from '@/features/quiz/QuizCard'
import { useCountdownSetting } from '@/features/settings/useCountdownSetting'

type Tab = 'phrases' | 'objects'
type Language = 'en' | 'ja' | 'my'

const shuffleArray = <T,>(items: T[]) => {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

const Home = () => {
  const [activeTab, setActiveTab] = useState<Tab>('phrases')
  const [promptLanguage] = useState<Language>('en')
  const { seconds: countdownSeconds } = useCountdownSetting()
  const [revealSignal, setRevealSignal] = useState(0)

  const phrasesQuery = usePhrases()
  const objectsQuery = useObjects()

  const [phraseOrder, setPhraseOrder] = useState<Phrase[]>([])
  const [objectOrder, setObjectOrder] = useState<ObjectItem[]>([])
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [objectIndex, setObjectIndex] = useState(0)
  const [resetKey, setResetKey] = useState(0)

  useEffect(() => {
    if (phrasesQuery.data) {
      setPhraseOrder(shuffleArray(phrasesQuery.data))
      setPhraseIndex(0)
    }
  }, [phrasesQuery.data])

  useEffect(() => {
    if (objectsQuery.data) {
      setObjectOrder(shuffleArray(objectsQuery.data))
      setObjectIndex(0)
    }
  }, [objectsQuery.data])

  const currentPhrase = useMemo(
    () => phraseOrder[phraseIndex],
    [phraseOrder, phraseIndex],
  )
  const currentObject = useMemo(
    () => objectOrder[objectIndex],
    [objectOrder, objectIndex],
  )

  const currentItem = activeTab === 'phrases' ? currentPhrase : currentObject
  const isLoading =
    activeTab === 'phrases' ? phrasesQuery.isLoading : objectsQuery.isLoading
  const isError = activeTab === 'phrases' ? phrasesQuery.isError : objectsQuery.isError
  const error = activeTab === 'phrases' ? phrasesQuery.error : objectsQuery.error

  const handleNext = () => {
    if (activeTab === 'phrases') {
      if (!phraseOrder.length) return
      setPhraseIndex((value) => (value + 1) % phraseOrder.length)
    } else {
      if (!objectOrder.length) return
      setObjectIndex((value) => (value + 1) % objectOrder.length)
    }
    setRevealSignal(0)
    setResetKey((value) => value + 1)
  }

  const handlePrev = () => {
    if (activeTab === 'phrases') {
      if (!phraseOrder.length) return
      setPhraseIndex((value) => (value - 1 + phraseOrder.length) % phraseOrder.length)
    } else {
      if (!objectOrder.length) return
      setObjectIndex((value) => (value - 1 + objectOrder.length) % objectOrder.length)
    }
    setRevealSignal(0)
    setResetKey((value) => value + 1)
  }

  const handleReveal = () => {
    setRevealSignal((value) => value + 1)
  }

  const showEmpty = !currentItem && !isLoading && !isError

  return (
    <div className="flex min-h-screen w-full flex-col bg-gradient-to-br from-pink-200 via-sky-200 to-amber-200 px-4 pb-24 pt-6">
      <div className="mx-auto flex w-full max-w-md items-center justify-between">
        <div className="flex items-center gap-2 rounded-full bg-white/80 px-2 py-1 shadow-lg">
          <button
            type="button"
            onClick={() => setActiveTab('phrases')}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              activeTab === 'phrases'
                ? 'bg-pink-500 text-white shadow-md shadow-pink-200'
                : 'text-slate-600'
            }`}
          >
            Phrases
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('objects')}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              activeTab === 'objects'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-200'
                : 'text-slate-600'
            }`}
          >
            Objects
          </button>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link to="/settings">Settings</Link>
        </Button>
      </div>

      <div className="mx-auto flex w-full max-w-md flex-1 items-center justify-center py-6">
        {isLoading ? (
          <Card className="w-full">
            <CardContent className="p-6 text-center text-sm text-slate-600">
              Loading...
            </CardContent>
          </Card>
        ) : isError ? (
          <Card className="w-full">
            <CardContent className="p-6 text-center text-sm text-red-600">
              {(error as Error).message}
            </CardContent>
          </Card>
        ) : showEmpty ? (
          <Card className="w-full">
            <CardContent className="space-y-2 p-6 text-center">
              <p className="text-sm text-slate-600">No items yet.</p>
              <Button asChild variant="outline">
                <Link to="/settings">Add content</Link>
              </Button>
            </CardContent>
          </Card>
        ) : activeTab === 'phrases' && currentPhrase ? (
          <QuizCard
            mode="phrases"
            item={currentPhrase}
            promptLanguage={promptLanguage}
            countdownSeconds={countdownSeconds}
            resetKey={resetKey}
            showFooter={false}
            revealSignal={revealSignal}
          />
        ) : activeTab === 'objects' && currentObject ? (
          <QuizCard
            mode="objects"
            item={currentObject}
            promptLanguage={promptLanguage}
            countdownSeconds={countdownSeconds}
            resetKey={resetKey}
            showFooter={false}
            revealSignal={revealSignal}
          />
        ) : null}
      </div>

      <div className="sticky bottom-0 mx-auto w-full max-w-md pb-4 pt-2">
        <div className="flex items-center justify-between rounded-3xl bg-white/80 px-4 py-3 shadow-xl backdrop-blur">
          <Button variant="secondary" onClick={handlePrev}>
          Prev
          </Button>
          <Button variant="outline" onClick={handleReveal}>
          Reveal
          </Button>
          <Button onClick={handleNext}>Next</Button>
        </div>
      </div>
    </div>
  )
}

export default Home
