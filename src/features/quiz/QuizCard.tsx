import { useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import type { ObjectItem, Phrase } from '@/features/content/types'

type Language = 'en' | 'ja' | 'my'

const languageLabels: Record<Language, string> = {
  en: 'English',
  ja: 'Japanese',
  my: 'Burmese',
}

const getPhraseText = (item: Phrase, language: Language) => {
  if (language === 'ja') return item.lang_ja_kanji || item.lang_ja_hira || item.lang_ja
  if (language === 'my') return item.lang_my
  return item.lang_en
}

const getObjectText = (item: ObjectItem, language: Language) => {
  if (language === 'ja') return item.label_ja_kanji || item.label_ja_hira || item.label_ja
  if (language === 'my') return item.label_my
  return item.label_en
}

const getJapaneseVariants = (primary: string, secondary: string | null) => {
  if (secondary && secondary !== primary) {
    return [primary, secondary]
  }
  return [primary]
}

type PhraseCardProps = {
  mode: 'phrases'
  item: Phrase
  promptLanguage: Language
  countdownSeconds: number
  onNext?: () => void
  onRepeat?: () => void
  resetKey: number
  showFooter?: boolean
  revealSignal?: number
}

type ObjectCardProps = {
  mode: 'objects'
  item: ObjectItem
  promptLanguage: Language
  countdownSeconds: number
  onNext?: () => void
  onRepeat?: () => void
  resetKey: number
  showFooter?: boolean
  revealSignal?: number
}

export type QuizCardProps = PhraseCardProps | ObjectCardProps

const QuizCard = ({
  mode,
  item,
  promptLanguage,
  countdownSeconds,
  onNext,
  onRepeat,
  resetKey,
  showFooter = true,
  revealSignal = 0,
}: QuizCardProps) => {
  const [remaining, setRemaining] = useState(countdownSeconds)
  const [revealed, setRevealed] = useState(false)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    setRemaining(countdownSeconds)
    setRevealed(false)
    setPaused(false)
  }, [item, countdownSeconds, resetKey])

  useEffect(() => {
    if (revealSignal > 0) {
      setRevealed(true)
    }
  }, [revealSignal])

  useEffect(() => {
    if (revealed) {
      setPaused(true)
    }
  }, [revealed])

  useEffect(() => {
    if (paused) return
    if (revealed) return
    if (remaining <= 0) {
      setRevealed(true)
      return
    }
    const timer = window.setTimeout(() => {
      setRemaining((value) => Math.max(0, value - 1))
    }, 1000)
    return () => window.clearTimeout(timer)
  }, [remaining, revealed, paused])

  const promptText = useMemo(() => {
    if (mode === 'phrases') {
      return getPhraseText(item, promptLanguage)
    }
    return getObjectText(item, promptLanguage)
  }, [item, mode, promptLanguage])

  const handleCardToggle = () => {
    setPaused((value) => !value)
  }

  const handleRevealClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    setRevealed(true)
    setPaused(true)
  }

  const handleRepeatClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    onRepeat?.()
  }

  const handleNextClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    onNext?.()
  }

  const phraseJapaneseLines =
    mode === 'phrases'
      ? getJapaneseVariants(
          item.lang_ja_kanji || item.lang_ja_hira || item.lang_ja,
          item.lang_ja_hira,
        )
      : []
  const objectJapaneseLines =
    mode === 'objects'
      ? getJapaneseVariants(
          item.label_ja_kanji || item.label_ja_hira || item.label_ja,
          item.label_ja_hira,
        )
      : []

  return (
		<Card
			className="w-full cursor-pointer"
			onClick={handleCardToggle}>
			<CardHeader className="space-y-2">
				<div className="flex flex-wrap items-center justify-between gap-2">
					<div
						className={`flex items-center justify-center rounded-full px-3 py-1.5 ${
							paused
								? "bg-red-100 text-red-700"
								: "bg-emerald-100 text-emerald-700"
						}`}>
						{paused ? (
							<svg
								aria-hidden="true"
								viewBox="0 0 24 24"
								className="h-5 w-5">
								<rect x="5" y="4" width="5" height="16" rx="1" fill="currentColor" />
								<rect x="14" y="4" width="5" height="16" rx="1" fill="currentColor" />
							</svg>
						) : (
							<svg
								aria-hidden="true"
								viewBox="0 0 24 24"
								className="h-5 w-5">
								<path d="M6 4L19 12L6 20V4Z" fill="currentColor" />
							</svg>
						)}
					</div>
					<div className="px-3 py-1 text-lg font-semibold text-amber-600">
						{remaining}s
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				{mode === "objects" && item.image_url ? (
					<div className="flex justify-center">
						<img
							src={item.image_url}
							alt={promptText}
							className="h-48 w-48 rounded-xl object-cover shadow-sm"
						/>
					</div>
				) : mode === "objects" ? (
					<div className="rounded-2xl border border-dashed border-white/80 bg-white/80 p-6 text-center text-sm text-slate-500">
						No image yet.
					</div>
				) : null}
				{mode === "objects" && revealed ? null : (
					<div className="rounded-2xl border-2 border-dashed border-white/80 bg-white/80 p-6 text-center shadow-inner">
						<p className="text-xs uppercase tracking-wide text-slate-500">
							{revealed ? "Prompt" : "Guess this"}
						</p>
						{mode === "phrases" ? (
							<p className="mt-2 text-2xl font-semibold text-slate-900">
								{promptText}
							</p>
						) : revealed ? (
							<p className="mt-2 text-2xl font-semibold text-slate-900">
								{promptText}
							</p>
						) : (
							<p className="mt-2 text-lg font-semibold text-slate-700">
								What is it?
							</p>
						)}
					</div>
				)}

				{revealed ? (
					mode === "phrases" ? (
						<div className="grid gap-3">
							{(["en", "ja", "my"] as Language[])
								.filter(language => language !== promptLanguage)
								.map(language => (
									<div
										key={language}
										className={`rounded-2xl border border-white/70 p-3 shadow-sm ${
											language === "en"
												? "bg-pink-50"
												: language === "ja"
												? "bg-sky-50"
												: "bg-amber-50"
										}`}>
										<p
											className={`text-xs uppercase tracking-wide ${
												language === "en"
													? "text-pink-600"
													: language === "ja"
													? "text-sky-600"
													: "text-amber-600"
											}`}>
											{languageLabels[language]}
										</p>
										{language === "ja" ? (
											<div className="mt-1 space-y-1 text-lg font-semibold text-slate-900">
												{phraseJapaneseLines.map(
													line => (
														<p key={line}>{line}</p>
													)
												)}
											</div>
										) : (
											<p className="mt-1 text-lg font-semibold text-slate-900">
												{getPhraseText(item, language)}
											</p>
										)}
									</div>
								))}
						</div>
					) : (
						<div className="grid gap-3">
							<div className="rounded-2xl border border-white/70 bg-pink-50 p-3 shadow-sm">
								<p className="text-xs uppercase tracking-wide text-pink-600">
									English
								</p>
								<p className="mt-1 text-lg font-semibold text-slate-900">
									{getObjectText(item, "en")}
								</p>
							</div>
							<div className="rounded-2xl border border-white/70 bg-sky-50 p-3 shadow-sm">
								<p className="text-xs uppercase tracking-wide text-sky-600">
									Japanese
								</p>
								<div className="mt-1 space-y-1 text-lg font-semibold text-slate-900">
									{objectJapaneseLines.map(line => (
										<p key={line}>{line}</p>
									))}
								</div>
							</div>
							<div className="rounded-2xl border border-white/70 bg-amber-50 p-3 shadow-sm">
								<p className="text-xs uppercase tracking-wide text-amber-600">
									Burmese
								</p>
								<p className="mt-1 text-lg font-semibold text-slate-900">
									{getObjectText(item, "my")}
								</p>
							</div>
						</div>
					)
				) : null}
			</CardContent>
			{showFooter ? (
				<CardFooter className="flex flex-wrap justify-between gap-2">
					<div className="flex flex-wrap gap-2">
						<Button
							type="button"
							variant="secondary"
							onClick={handleRevealClick}>
							Reveal now
						</Button>
						<Button
							type="button"
							variant="outline"
							onClick={handleRepeatClick}>
							Repeat
						</Button>
					</div>
					<Button
						type="button"
						onClick={handleNextClick}>
						Next
					</Button>
				</CardFooter>
			) : null}
		</Card>
  );
}

export default QuizCard
