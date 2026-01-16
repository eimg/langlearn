import { type FormEvent, useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCreateObject, useCreatePhrase } from '@/features/content/api'
import { uploadObjectImage } from '@/features/content/objectImages'

type FormType = 'phrases' | 'objects'

const EntryForm = () => {
  const [formType, setFormType] = useState<FormType>('phrases')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [objectImageFile, setObjectImageFile] = useState<File | null>(null)
  const [objectImagePreview, setObjectImagePreview] = useState<string | null>(null)
  const [imageInputKey, setImageInputKey] = useState(0)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  const createPhrase = useCreatePhrase()
  const createObject = useCreateObject()

  useEffect(() => {
    if (!objectImageFile) {
      setObjectImagePreview(null)
      return
    }

    const previewUrl = URL.createObjectURL(objectImageFile)
    setObjectImagePreview(previewUrl)
    return () => URL.revokeObjectURL(previewUrl)
  }, [objectImageFile])

  const handlePhraseSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    const form = event.currentTarget
    const formData = new FormData(form)
    const payload = {
      category: (formData.get('category') as string) || null,
      lang_en: (formData.get('lang_en') as string).trim(),
      lang_ja_hira: (formData.get('lang_ja_hira') as string).trim(),
      lang_ja_kanji: (formData.get('lang_ja_kanji') as string).trim() || null,
      lang_ja:
        (formData.get('lang_ja_kanji') as string).trim() ||
        (formData.get('lang_ja_hira') as string).trim(),
      lang_my: (formData.get('lang_my') as string).trim(),
      notes: (formData.get('notes') as string) || null,
    }

    if (!payload.lang_en || !payload.lang_ja_hira || !payload.lang_my) {
      setError('Please fill out English, Japanese (hiragana), and Burmese.')
      return
    }

    try {
      await createPhrase.mutateAsync(payload)
      form.reset()
      setSuccess('Phrase added successfully.')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const handleObjectSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    const form = event.currentTarget
    const formData = new FormData(form)
    if (!objectImageFile) {
      setError('Please upload an image for the object.')
      return
    }
    if (!objectImageFile.type.startsWith('image/')) {
      setError('Please choose a valid image file.')
      return
    }
    if (objectImageFile.size > 20 * 1024 * 1024) {
      setError('Image must be 20MB or less.')
      return
    }

    const payload = {
      category: (formData.get('category') as string) || null,
      image_url: '',
      label_en: (formData.get('label_en') as string).trim(),
      label_ja_hira: (formData.get('label_ja_hira') as string).trim(),
      label_ja_kanji: (formData.get('label_ja_kanji') as string).trim() || null,
      label_ja:
        (formData.get('label_ja_kanji') as string).trim() ||
        (formData.get('label_ja_hira') as string).trim(),
      label_my: (formData.get('label_my') as string).trim(),
    }

    if (!payload.label_en || !payload.label_ja_hira || !payload.label_my) {
      setError('Please fill out English, Japanese (hiragana), and Burmese.')
      return
    }

    try {
      setIsUploadingImage(true)
      payload.image_url = await uploadObjectImage(objectImageFile)
      await createObject.mutateAsync(payload)
      form.reset()
      setObjectImageFile(null)
      setImageInputKey((value) => value + 1)
      setSuccess('Object added successfully.')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsUploadingImage(false)
    }
  }

  const isSubmitting = createPhrase.isPending || createObject.isPending || isUploadingImage

  return (
    <Card>
      <CardHeader className="space-y-2">
        <CardTitle className="text-lg">Entry form</CardTitle>
        <p className="text-sm text-slate-500">
          Add phrases or objects that will appear in the quizzes.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={formType === 'phrases' ? 'default' : 'outline'}
            onClick={() => setFormType('phrases')}
          >
            Phrase
          </Button>
          <Button
            type="button"
            variant={formType === 'objects' ? 'default' : 'outline'}
            onClick={() => setFormType('objects')}
          >
            Object
          </Button>
        </div>

        {formType === 'phrases' ? (
          <form className="space-y-4" onSubmit={handlePhraseSubmit}>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category (optional)</Label>
                <Input id="category" name="category" placeholder="greetings" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea id="notes" name="notes" placeholder="Use in the morning." />
              </div>
            </div>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="lang_en">English</Label>
                <Input id="lang_en" name="lang_en" placeholder="Good morning" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lang_ja_hira">Japanese (Hiragana)</Label>
                <Input
                  id="lang_ja_hira"
                  name="lang_ja_hira"
                  placeholder="おはようございます"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lang_ja_kanji">Japanese (Kanji, optional)</Label>
                <Input id="lang_ja_kanji" name="lang_ja_kanji" placeholder="お早うございます" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lang_my">Burmese</Label>
                <Input id="lang_my" name="lang_my" placeholder="မင်္ဂလာနံနက်ခင်းပါ" required />
              </div>
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {createPhrase.isPending ? 'Adding...' : 'Add phrase'}
            </Button>
          </form>
        ) : (
      <form className="space-y-4" onSubmit={handleObjectSubmit}>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category (optional)</Label>
                <Input id="category" name="category" placeholder="food" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image_file">Image</Label>
                <label
                  htmlFor="image_file"
                  className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white/70 p-6 text-center text-sm text-slate-600 shadow-sm transition hover:border-slate-400"
                >
                  {objectImagePreview ? (
                    <img
                      src={objectImagePreview}
                      alt="Selected object"
                      className="h-40 w-40 rounded-xl object-cover"
                    />
                  ) : (
                    <>
                      <p className="font-semibold text-slate-700">Tap to upload</p>
                      <p className="text-xs text-slate-500">
                        Choose a clear photo for the quiz.
                      </p>
                    </>
                  )}
                </label>
                <Input
                  key={imageInputKey}
                  id="image_file"
                  name="image_file"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) =>
                    setObjectImageFile(event.target.files?.[0] ?? null)
                  }
                  required
                />
              </div>
            </div>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="label_en">English</Label>
                <Input id="label_en" name="label_en" placeholder="Bowl of soup" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="label_ja_hira">Japanese (Hiragana)</Label>
                <Input
                  id="label_ja_hira"
                  name="label_ja_hira"
                  placeholder="すーぷのぼうる"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="label_ja_kanji">Japanese (Kanji, optional)</Label>
                <Input id="label_ja_kanji" name="label_ja_kanji" placeholder="スープのボウル" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="label_my">Burmese</Label>
                <Input id="label_my" name="label_my" placeholder="ဟင်းချိုတစ်ပန်းကန်" required />
              </div>
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isUploadingImage || createObject.isPending ? 'Uploading...' : 'Add object'}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2">
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {success ? <p className="text-sm text-emerald-600">{success}</p> : null}
      </CardFooter>
    </Card>
  )
}

export default EntryForm
