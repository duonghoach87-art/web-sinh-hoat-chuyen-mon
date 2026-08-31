import { supabase } from '../lib/supabase';

/**
 * Tải file lên Supabase Storage Bucket
 * @param {File} file - Tệp tin từ form input
 * @param {string} bucketName - Tên bucket ('khtn-documents' hoặc 'khtn-avatars')
 * @param {string} folderPath - Thư mục con (VD: 'de-thi', 'van-ban', 'bien-ban')
 * @returns {Promise<{publicUrl: string, fileName: string, fileSize: number}>}
 */
export async function uploadFileToSupabase(file, bucketName = 'khtn-documents', folderPath = 'general') {
  if (!file) throw new Error('Chưa chọn tệp tin cần tải lên.');

  // Tạo tên file an toàn, tránh trùng lặp bằng UUID/timestamp
  const timestamp = Date.now();
  const cleanName = file.name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `${folderPath}/${timestamp}_${cleanName}`;

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Lỗi khi tải file lên Storage:', error);
    throw new Error(`Lỗi tải file: ${error.message}`);
  }

  // Lấy đường dẫn công khai (Public URL)
  const { data: urlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  return {
    publicUrl: urlData.publicUrl,
    fileName: file.name,
    fileSize: file.size,
    path: filePath
  };
}
