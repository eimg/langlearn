import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { supabase } from '@/lib/supabase'
import type {
  NewObjectInput,
  NewPhraseInput,
  ObjectItem,
  Phrase,
  UpdateObjectInput,
  UpdatePhraseInput,
} from './types'

const phrasesKey = ['phrases']
const objectsKey = ['objects']

const fetchPhrases = async (): Promise<Phrase[]> => {
  const { data, error } = await supabase
    .from('phrases')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

const fetchObjects = async (): Promise<ObjectItem[]> => {
  const { data, error } = await supabase
    .from('objects')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

const insertPhrase = async (payload: NewPhraseInput): Promise<Phrase> => {
  const { data, error } = await supabase.from('phrases').insert(payload).select('*').single()
  if (error) throw error
  return data
}

const updatePhrase = async ({ id, ...payload }: UpdatePhraseInput): Promise<Phrase> => {
  const { data, error } = await supabase
    .from('phrases')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  return data
}

const deletePhrase = async (id: string): Promise<void> => {
  const { error } = await supabase.from('phrases').delete().eq('id', id)
  if (error) throw error
}

const insertObject = async (payload: NewObjectInput): Promise<ObjectItem> => {
  const { data, error } = await supabase.from('objects').insert(payload).select('*').single()
  if (error) throw error
  return data
}

const updateObject = async ({ id, ...payload }: UpdateObjectInput): Promise<ObjectItem> => {
  const { data, error } = await supabase
    .from('objects')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  return data
}

const deleteObject = async (id: string): Promise<void> => {
  const { error } = await supabase.from('objects').delete().eq('id', id)
  if (error) throw error
}

export const usePhrases = () => useQuery({ queryKey: phrasesKey, queryFn: fetchPhrases })

export const useObjects = () => useQuery({ queryKey: objectsKey, queryFn: fetchObjects })

export const useCreatePhrase = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: insertPhrase,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: phrasesKey }),
  })
}

export const useUpdatePhrase = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updatePhrase,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: phrasesKey }),
  })
}

export const useDeletePhrase = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deletePhrase,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: phrasesKey }),
  })
}

export const useCreateObject = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: insertObject,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: objectsKey }),
  })
}

export const useUpdateObject = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateObject,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: objectsKey }),
  })
}

export const useDeleteObject = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteObject,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: objectsKey }),
  })
}
