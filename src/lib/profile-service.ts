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
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;

      console.log('Uploading avatar:', { fileName, fileSize: file.size, fileType: file.type });

      // Upload file directly - the bucket should already exist from migration
      const { data: uploadData, error: uploadError } = await this.supabase.storage
        .from('avatars')
        .upload(fileName, file, {
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
        .getPublicUrl(fileName);

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