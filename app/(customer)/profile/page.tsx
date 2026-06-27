'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, User, Save, Lock } from 'lucide-react';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(8, 'Phone number must be at least 8 digits'),
  address: z.string().min(5, 'Address must be complete'),
  city: z.string().min(2, 'City is required'),
  province: z.string().min(2, 'Province is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
});

const passwordSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ProfileInput = z.infer<typeof profileSchema>;
type PasswordInput = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const [profileLoading, setProfileLoading] = useState(true);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [pwErrorMsg, setPwErrorMsg] = useState<string | null>(null);
  const [pwSuccessMsg, setPwSuccessMsg] = useState<string | null>(null);

  const supabase = createClient();

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    setValue,
    formState: { errors: profileErrors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<PasswordInput>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setEmail(session.user.email || '');

          const { data: customer } = await supabase
            .from('customers_shop')
            .select('full_name, phone, address, city, province, postal_code')
            .eq('id', session.user.id)
            .single();

          if (customer) {
            if (customer.full_name) setValue('fullName', customer.full_name);
            if (customer.phone) setValue('phone', customer.phone);
            if (customer.address) setValue('address', customer.address);
            if (customer.city) setValue('city', customer.city);
            if (customer.province) setValue('province', customer.province);
            if (customer.postal_code) setValue('postalCode', customer.postal_code);
          }
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [setValue]);

  const onProfileSubmit = async (data: ProfileInput) => {
    setUpdatingProfile(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Not logged in.');

      const { error } = await supabase
        .from('customers_shop')
        .update({
          full_name: data.fullName,
          phone: data.phone,
          address: data.address,
          city: data.city,
          province: data.province,
          postal_code: data.postalCode,
        })
        .eq('id', session.user.id);

      if (error) throw error;
      setSuccessMsg('Profile updated successfully!');
    } catch (error: any) {
      setErrorMsg(error.message || 'Failed to update profile.');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordInput) => {
    setUpdatingPassword(true);
    setPwErrorMsg(null);
    setPwSuccessMsg(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (error) throw error;
      setPwSuccessMsg('Password updated successfully!');
      resetPasswordForm();
    } catch (error: any) {
      setPwErrorMsg(error.message || 'Failed to update password.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex justify-center items-center py-20 flex-1">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 flex-1 max-w-4xl">
      <h1 className="text-3xl font-extrabold tracking-tight mb-8">My Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar Info */}
        <div className="md:col-span-1 rounded-xl border border-border p-6 bg-muted/10 h-fit space-y-4">
          <div className="flex flex-col items-center text-center">
            <div className="rounded-full bg-primary/10 p-5 mb-3">
              <User className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-bold text-sm">Account details</h3>
            <p className="text-xs text-muted-foreground mt-1 break-all">{email}</p>
          </div>
        </div>

        {/* Edit Forms */}
        <div className="md:col-span-2 space-y-8">
          {/* Shipping & Profile Form */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Save className="h-4.5 w-4.5" /> Shipping Address Details
            </h2>

            {errorMsg && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="fullName" className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                    Full Name
                  </label>
                  <Input
                    id="fullName"
                    disabled={updatingProfile}
                    {...registerProfile('fullName')}
                    className={profileErrors.fullName ? 'border-destructive' : ''}
                  />
                  {profileErrors.fullName && (
                    <p className="mt-1 text-xs text-destructive">{profileErrors.fullName.message}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="phone" className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    disabled={updatingProfile}
                    {...registerProfile('phone')}
                    className={profileErrors.phone ? 'border-destructive' : ''}
                  />
                  {profileErrors.phone && (
                    <p className="mt-1 text-xs text-destructive">{profileErrors.phone.message}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="address" className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                    Street Address
                  </label>
                  <Input
                    id="address"
                    disabled={updatingProfile}
                    {...registerProfile('address')}
                    className={profileErrors.address ? 'border-destructive' : ''}
                  />
                  {profileErrors.address && (
                    <p className="mt-1 text-xs text-destructive">{profileErrors.address.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="city" className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                    City
                  </label>
                  <Input
                    id="city"
                    disabled={updatingProfile}
                    {...registerProfile('city')}
                    className={profileErrors.city ? 'border-destructive' : ''}
                  />
                  {profileErrors.city && (
                    <p className="mt-1 text-xs text-destructive">{profileErrors.city.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="province" className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                    Province
                  </label>
                  <Input
                    id="province"
                    disabled={updatingProfile}
                    {...registerProfile('province')}
                    className={profileErrors.province ? 'border-destructive' : ''}
                  />
                  {profileErrors.province && (
                    <p className="mt-1 text-xs text-destructive">{profileErrors.province.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="postalCode" className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                    Postal Code
                  </label>
                  <Input
                    id="postalCode"
                    disabled={updatingProfile}
                    {...registerProfile('postalCode')}
                    className={profileErrors.postalCode ? 'border-destructive' : ''}
                  />
                  {profileErrors.postalCode && (
                    <p className="mt-1 text-xs text-destructive">{profileErrors.postalCode.message}</p>
                  )}
                </div>
              </div>

              <Button type="submit" disabled={updatingProfile} className="w-full sm:w-auto">
                {updatingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Lock className="h-4.5 w-4.5" /> Update Password
            </h2>

            {pwErrorMsg && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {pwErrorMsg}
              </div>
            )}

            {pwSuccessMsg && (
              <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
                {pwSuccessMsg}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
              <div>
                <label htmlFor="newPassword" className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                  New Password
                </label>
                <Input
                  id="newPassword"
                  type="password"
                  disabled={updatingPassword}
                  {...registerPassword('newPassword')}
                  className={passwordErrors.newPassword ? 'border-destructive' : ''}
                />
                {passwordErrors.newPassword && (
                  <p className="mt-1 text-xs text-destructive">{passwordErrors.newPassword.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                  Confirm New Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  disabled={updatingPassword}
                  {...registerPassword('confirmPassword')}
                  className={passwordErrors.confirmPassword ? 'border-destructive' : ''}
                />
                {passwordErrors.confirmPassword && (
                  <p className="mt-1 text-xs text-destructive">{passwordErrors.confirmPassword.message}</p>
                )}
              </div>

              <Button type="submit" disabled={updatingPassword} className="w-full sm:w-auto">
                {updatingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Change Password
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
