import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import AuthForm from '@/features/auth/AuthForm'
import { useAuthSession } from '@/features/auth/useAuthSession'
import { useDeleteObject, useObjects, useUpdateObject } from '@/features/content/api'
import { uploadObjectImage } from '@/features/content/objectImages'
import type { ObjectItem } from '@/features/content/types'

const ObjectItemCard = ({ item }: { item: ObjectItem }) => {
  const updateObject = useUpdateObject()
  const deleteObject = useDeleteObject()
  const [isEditing, setIsEditing] = useState(false)
  const [pendingImage, setPendingImage] = useState<File | null>(null)
  const [pendingPreview, setPendingPreview] = useState<string | null>(null)
  const [imageInputKey, setImageInputKey] = useState(0)
  const [formState, setFormState] = useState({
    category: item.category || '',
    label_en: item.label_en,
    label_ja_hira: item.label_ja_hira || '',
    label_ja_kanji: item.label_ja_kanji || '',
    label_my: item.label_my,
  })

  useEffect(() => {
    setFormState({
      category: item.category || '',
      label_en: item.label_en,
      label_ja_hira: item.label_ja_hira || '',
      label_ja_kanji: item.label_ja_kanji || '',
      label_my: item.label_my,
    })
    setPendingImage(null)
    setPendingPreview(null)
    setImageInputKey((value) => value + 1)
  }, [item])

  useEffect(() => {
    if (!pendingImage) {
      setPendingPreview(null)
      return
    }
    const previewUrl = URL.createObjectURL(pendingImage)
    setPendingPreview(previewUrl)
    return () => URL.revokeObjectURL(previewUrl)
  }, [pendingImage])

  const handleSave = async () => {
    if (!formState.label_en || !formState.label_ja_hira || !formState.label_my) return
    let imageUrl = item.image_url
    if (pendingImage) {
      imageUrl = await uploadObjectImage(pendingImage)
    }
    await updateObject.mutateAsync({
      id: item.id,
      category: formState.category || null,
      image_url: imageUrl,
      label_en: formState.label_en,
      label_ja_hira: formState.label_ja_hira,
      label_ja_kanji: formState.label_ja_kanji || null,
      label_ja: formState.label_ja_kanji || formState.label_ja_hira,
      label_my: formState.label_my,
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setPendingImage(null)
    setPendingPreview(null)
    setImageInputKey((value) => value + 1)
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
            <Label>Image</Label>
            <label
              htmlFor={`object-image-${item.id}`}
              className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white/70 p-6 text-center text-sm text-slate-600 shadow-sm transition hover:border-slate-400"
            >
              {pendingPreview ? (
                <img
                  src={pendingPreview}
                  alt="Selected object"
                  className="h-32 w-32 rounded-xl object-cover"
                />
              ) : item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.label_en}
                  className="h-32 w-32 rounded-xl object-cover"
                />
              ) : (
                <>
                  <p className="font-semibold text-slate-700">Tap to upload</p>
                  <p className="text-xs text-slate-500">Choose a clear photo.</p>
                </>
              )}
            </label>
            <Input
              key={imageInputKey}
              id={`object-image-${item.id}`}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => setPendingImage(event.target.files?.[0] ?? null)}
            />
          </div>
          <div className="space-y-2">
            <Label>English</Label>
            <Input
              value={formState.label_en}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, label_en: event.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Japanese (Hiragana)</Label>
            <Input
              value={formState.label_ja_hira}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, label_ja_hira: event.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Japanese (Kanji)</Label>
            <Input
              value={formState.label_ja_kanji}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, label_ja_kanji: event.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Burmese</Label>
            <Input
              value={formState.label_my}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, label_my: event.target.value }))
              }
            />
          </div>
          <div className="flex gap-2">
            <Button type="button" onClick={handleSave} disabled={updateObject.isPending}>
              Save
            </Button>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.label_en}
              className="h-32 w-32 rounded-xl object-cover"
            />
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
              No image.
            </div>
          )}
          <p className="text-lg font-semibold text-slate-900">{item.label_en}</p>
          <p className="text-sm text-slate-600">
            {item.label_ja_kanji || item.label_ja_hira || item.label_ja}
          </p>
          {item.label_ja_hira && item.label_ja_kanji ? (
            <p className="text-sm text-slate-500">{item.label_ja_hira}</p>
          ) : null}
          <p className="text-sm text-slate-600">{item.label_my}</p>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => deleteObject.mutate(item.id)}
            >
              Delete
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}

const ObjectList = () => {
  const objectsQuery = useObjects()
  const { session, isLoading: isAuthLoading } = useAuthSession()

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-sky-200 to-amber-200">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 p-6">
        <header className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-slate-900">Objects</h1>
            <p className="text-slate-600">Edit or remove objects in the quiz.</p>
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
              {objectsQuery.isLoading ? (
                <p className="text-sm text-slate-500">Loading...</p>
              ) : objectsQuery.data?.length ? (
                <div className="space-y-3">
                  {objectsQuery.data.map((item) => (
                    <ObjectItemCard key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No objects yet.</p>
              )}
            </CardContent>
          </Card>
        ) : (
          <AuthForm title="Sign in to manage objects" />
        )}
      </div>
    </div>
  )
}

export default ObjectList
