import { supabase } from './supabase';

export const STORAGE_BUCKET = 'product-images';
export const DIGITAL_PRODUCTS_BUCKET = 'digital-products';

export async function uploadProductImage(file: File, productId: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${productId}-${Date.now()}.${fileExt}`;
  const filePath = `products/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);

  return data.publicUrl;
}

export async function deleteProductImage(imageUrl: string): Promise<void> {
  const path = imageUrl.split(`${STORAGE_BUCKET}/`)[1];
  if (!path) return;

  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path]);

  if (error) {
    throw error;
  }
}

export async function uploadMultipleImages(files: File[], productId: string): Promise<string[]> {
  const uploadPromises = files.map((file) => uploadProductImage(file, productId));
  return Promise.all(uploadPromises);
}

export async function uploadDigitalProduct(
  file: File,
  productId: string
): Promise<{ filePath: string; storageUrl: string; fileSize: number; fileType: string }> {
  const fileExt = file.name.split('.').pop();
  const sanitizedFileName = file.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
  const fileName = `${productId}-${Date.now()}-${sanitizedFileName}`;
  const filePath = `products/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(DIGITAL_PRODUCTS_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from(DIGITAL_PRODUCTS_BUCKET).getPublicUrl(filePath);

  return {
    filePath,
    storageUrl: data.publicUrl,
    fileSize: file.size,
    fileType: file.type,
  };
}

export async function deleteDigitalProduct(filePath: string): Promise<void> {
  const { error } = await supabase.storage.from(DIGITAL_PRODUCTS_BUCKET).remove([filePath]);

  if (error) {
    throw error;
  }
}
