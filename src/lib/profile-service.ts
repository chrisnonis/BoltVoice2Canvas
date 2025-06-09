import { useSupabase } from './supabase-provider';

export interface UserProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_public_profile: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileData {
  username?: string;
  full_name?: string;
  bio?: string;
  avatar_url?: string;
  is_public_profile?: boolean;
}

export class ProfileService {
  constructor(private supabase: any) {}

  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data: profile, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Profile not found
      }
      console.error('Error fetching profile:', error);
      throw new Error(`Failed to fetch profile: ${error.message}`);
    }

    return profile;
  }

  async updateProfile(userId: string, data: UpdateProfileData): Promise<UserProfile> {
    const { data: profile, error } = await this.supabase
      .from('profiles')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      throw new Error(`Failed to update profile: ${error.message}`);
    }

    return profile;
  }

  async uploadAvatar(userId: string, file: File): Promise<string> {
    try {
      // Create a unique filename with user ID
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = fileName; // Simplified path without subfolder

      console.log('Uploading avatar:', { fileName, filePath, fileSize: file.size });

      // First, ensure the avatars bucket exists and is public
      const { data: buckets } = await this.supabase.storage.listBuckets();
      const avatarBucket = buckets?.find(bucket => bucket.name === 'avatars');
      
      if (!avatarBucket) {
        console.log('Creating avatars bucket...');
        const { error: bucketError } = await this.supabase.storage.createBucket('avatars', {
          public: true,
          allowedMimeTypes: ['image/*'],
          fileSizeLimit: 5242880 // 5MB
        });
        
        if (bucketError) {
          console.error('Error creating bucket:', bucketError);
          throw new Error(`Failed to create storage bucket: ${bucketError.message}`);
        }
      }

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await this.supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true // Allow overwriting existing files
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      console.log('Upload successful:', uploadData);

      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        throw new Error('Failed to get public URL for uploaded image');
      }

      console.log('Public URL generated:', urlData.publicUrl);
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  }

  async createProfile(userId: string, email: string, data: Partial<UpdateProfileData> = {}): Promise<UserProfile> {
    const profileData = {
      id: userId,
      username: data.username || null,
      full_name: data.full_name || null,
      bio: data.bio || null,
      avatar_url: data.avatar_url || null,
      is_public_profile: data.is_public_profile ?? true,
    };

    const { data: profile, error } = await this.supabase
      .from('profiles')
      .insert([profileData])
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      throw new Error(`Failed to create profile: ${error.message}`);
    }

    return profile;
  }
}

// Hook to use the profile service
export const useProfileService = () => {
  const { supabase } = useSupabase();
  return new ProfileService(supabase);
};