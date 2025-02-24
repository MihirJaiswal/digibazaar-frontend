'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import api from '@/lib/api';

const schema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  bio: z.string().max(500).optional(),
});

type User = {
  name: string;
  email: string;
  bio?: string;
  profileImage?: string;
};

type FormData = z.infer<typeof schema>;

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null); // ✅ Explicit type
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await api.post<User>('/auth/get-user-info'); // ✅ Expected type
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      await api.post('/auth/set-user-info', data);
      fetchUserInfo();
    } catch (error) {
      console.error('Error updating user info:', error);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);

    try {
      await api.post('/auth/set-user-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchUserInfo();
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3">
          <div className="mb-4">
            <img
              src={user.profileImage || '/placeholder-avatar.png'}
              alt="Profile"
              className="w-48 h-48 rounded-full object-cover mx-auto"
            />
          </div>
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="mb-4"
          />
        </div>
        <div className="w-full md:w-2/3">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="name" className="block mb-2">Name</label>
              <Input
                id="name"
                {...register('name')}
                defaultValue={user?.name} // ✅ Optional chaining
                className="w-full"
              />
              {errors.name && <p className="text-red-500">{errors.name.message}</p>}
            </div>
            <div>
              <label htmlFor="email" className="block mb-2">Email</label>
              <Input
                id="email"
                {...register('email')}
                defaultValue={user?.email} // ✅ Optional chaining
                className="w-full"
              />
              {errors.email && <p className="text-red-500">{errors.email.message}</p>}
            </div>
            <div>
              <label htmlFor="bio" className="block mb-2">Bio</label>
              <Textarea
                id="bio"
                {...register('bio')}
                defaultValue={user?.bio || ''} // ✅ Default value for optional property
                className="w-full"
              />
              {errors.bio && <p className="text-red-500">{errors.bio.message}</p>}
            </div>
            <Button type="submit">Update Profile</Button>
          </form>
        </div>
      </div>
    </div>
  );
}
