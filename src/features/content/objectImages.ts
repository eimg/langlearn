import { supabase } from '@/lib/supabase'

export const OBJECT_IMAGE_BUCKET = 'langlearn_public'

const getFileExtension = (file: File) => {
  const segments = file.name.split('.')
  const last = segments[segments.length - 1]
  if (last && last !== file.name) {
    return last.toLowerCase()
  }
  return 'jpg'
}

export const uploadObjectImage = async (file: File) => {
  const extension = getFileExtension(file)
  const fileName = `${crypto.randomUUID()}.${extension}`
  const filePath = `objects/${fileName}`
  const { error } = await supabase.storage.from(OBJECT_IMAGE_BUCKET).upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || undefined,
  })

  if (error) throw error

  const { data } = supabase.storage.from(OBJECT_IMAGE_BUCKET).getPublicUrl(filePath)
  return data.publicUrl
}
