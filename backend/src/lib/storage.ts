import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Initialize Supabase Admin client (bypass RLS)
const supabase = createClient(supabaseUrl, supabaseKey);

const BUCKET_NAME = 'images';

/**
 * Upload Base64 image to Supabase Storage
 * @param base64Data Base64 string (with or without prefix)
 * @param path File path in bucket (e.g., 'users/123/image.jpg')
 * @returns Public URL of the uploaded file
 */
export async function uploadImage(base64Data: string, path: string): Promise<string> {
    try {
        // Remove data:image/...;base64, prefix if present
        const base64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64, 'base64');

        const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(path, buffer, {
                contentType: 'image/jpeg',
                upsert: true,
            });

        if (error) {
            console.error('Supabase upload error:', error);
            throw new Error('UPLOAD_FAILED');
        }

        const { data } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(path);

        return data.publicUrl;
    } catch (error) {
        console.error('Storage upload failed:', error);
        // Fallback: return empty string or throw
        return '';
    }
}
