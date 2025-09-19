import { supabase } from './supabase';

export interface UploadOptions {
  bucket: 'reports' | 'uploads' | 'avatars' | 'documents';
  path: string;
  file: File | Blob;
  upsert?: boolean;
  contentType?: string;
}

export interface DownloadOptions {
  bucket: string;
  path: string;
}

/**
 * Upload file to Supabase Storage
 */
export async function uploadFile({ bucket, path, file, upsert = false, contentType }: UploadOptions) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      contentType: contentType || file.type,
      upsert,
    });

  if (error) throw error;
  return data;
}

/**
 * Download file from Supabase Storage
 */
export async function downloadFile({ bucket, path }: DownloadOptions) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .download(path);

  if (error) throw error;
  return data;
}

/**
 * Get public URL for a file
 */
export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return data.publicUrl;
}

/**
 * Get signed URL for private file access
 */
export async function getSignedUrl(bucket: string, path: string, expiresIn = 3600) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) throw error;
  return data.signedUrl;
}

/**
 * Delete file from storage
 */
export async function deleteFile(bucket: string, paths: string | string[]) {
  const pathArray = Array.isArray(paths) ? paths : [paths];

  const { error } = await supabase.storage
    .from(bucket)
    .remove(pathArray);

  if (error) throw error;
}

/**
 * List files in a bucket/folder
 */
export async function listFiles(bucket: string, folder?: string, options?: { limit?: number; offset?: number }) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(folder, {
      limit: options?.limit || 100,
      offset: options?.offset || 0,
    });

  if (error) throw error;
  return data;
}

/**
 * Upload report with metadata
 */
export async function uploadReport(patientId: string, file: File, sessionId?: string) {
  const timestamp = Date.now();
  const extension = file.name.split('.').pop();
  const path = `patients/${patientId}/reports/${timestamp}.${extension}`;

  // Upload file
  const { data: uploadData, error: uploadError } = await uploadFile({
    bucket: 'reports',
    path,
    file,
  });

  if (uploadError) throw uploadError;

  // Create document record
  const { data: document, error: docError } = await supabase
    .from('documents')
    .insert({
      patient_id: patientId,
      kind: 'report',
      file_path: path,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
    })
    .select()
    .single();

  if (docError) throw docError;

  return {
    upload: uploadData,
    document,
  };
}

/**
 * Upload avatar image
 */
export async function uploadAvatar(userId: string, file: File) {
  const extension = file.name.split('.').pop();
  const path = `${userId}/avatar.${extension}`;

  const { data, error } = await uploadFile({
    bucket: 'avatars',
    path,
    file,
    upsert: true,
  });

  if (error) throw error;

  // Update profile with avatar URL
  const avatarUrl = getPublicUrl('avatars', path);

  await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', userId);

  return avatarUrl;
}

/**
 * Get report URL with proper access control
 */
export async function getReportUrl(patientId: string, filePath: string): Promise<string> {
  // Check if user has access to this patient's data
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  // Check access permissions (implement your logic)
  const hasAccess = await checkPatientAccess(user.id, patientId);

  if (!hasAccess) throw new Error('Access denied');

  // Generate signed URL for secure access
  return await getSignedUrl('reports', filePath, 3600); // 1 hour expiry
}

/**
 * Check if user has access to patient data
 */
async function checkPatientAccess(userId: string, patientId: string): Promise<boolean> {
  // Check if user is the patient
  const { data: patient } = await supabase
    .from('patients')
    .select('owner_user, org_id')
    .eq('id', patientId)
    .single();

  if (!patient) return false;

  // Patient owns their data
  if (patient.owner_user === userId) return true;

  // Check if user is in the same organization
  const { data: membership } = await supabase
    .from('org_memberships')
    .select('role')
    .eq('user_id', userId)
    .eq('org_id', patient.org_id)
    .single();

  return !!membership;
}