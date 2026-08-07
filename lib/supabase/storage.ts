import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

const MEDIA_BUCKET = "media";

let bucketReady: Promise<void> | null = null;

/// Idempotently ensures the shared public "media" bucket exists (used for
/// product images, brand logos, banner images). Memoized per server
/// instance so repeated uploads don't re-check on every call.
function ensureMediaBucket(): Promise<void> {
  if (!bucketReady) {
    bucketReady = (async () => {
      const supabase = createAdminClient();
      const { data } = await supabase.storage.getBucket(MEDIA_BUCKET);
      if (!data) {
        await supabase.storage.createBucket(MEDIA_BUCKET, { public: true });
      }
    })();
  }
  return bucketReady;
}

/// Uploads a file to `path` inside the media bucket and returns its public
/// URL. `path` should already be unique (caller is responsible for
/// prefixing with an id/uuid to avoid collisions).
export async function uploadFile(file: File, path: string): Promise<string> {
  await ensureMediaBucket();
  const supabase = createAdminClient();

  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, file, { upsert: true });

  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);

  return publicUrl;
}

export async function deleteFile(path: string): Promise<void> {
  const supabase = createAdminClient();
  await supabase.storage.from(MEDIA_BUCKET).remove([path]);
}

/// Extracts the storage path from a public media URL, for deleting a file
/// when only its stored URL is known (e.g. from a ProductImage row).
export function pathFromPublicUrl(url: string): string | null {
  const marker = `/object/public/${MEDIA_BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(url.slice(index + marker.length));
}
