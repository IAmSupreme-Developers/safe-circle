import { supabase } from '@/lib/supabase'
import { uploadFile, generateUniqueId } from '@/lib/mediaUploadService'

// Set NEXT_PUBLIC_USE_PHP_UPLOAD=true in .env.local to use the PHP server instead of Supabase Storage
const USE_PHP = process.env.NEXT_PUBLIC_USE_PHP_UPLOAD === 'true'

export async function uploadPostImage(
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  if (USE_PHP) {
    const id = generateUniqueId('post')
    const result = await uploadFile(file, id, 'posts', 'image', onProgress)
    if (!result.success || !result.url) throw new Error(result.error ?? 'Upload failed')
    return result.url
  }

  // Supabase Storage — path: {userId}/posts/{timestamp}.{ext}
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const ext = file.name.split('.').pop()
  const path = `${user.id}/posts/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage.from('media').upload(path, file)
  if (error) throw new Error(error.message)
  const { data } = supabase.storage.from('media').getPublicUrl(path)
  return data.publicUrl
}
