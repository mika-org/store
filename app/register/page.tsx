'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(8, 'Phone number must be at least 8 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
  role: z.enum(['customer', 'admin']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterInput = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'customer',
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { data: signUpData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            role: data.role,
          },
          // Redirect URL back to our app
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (signUpData.user) {
        // If email confirmation is enabled, notify user. Otherwise, log them in.
        // Usually, in development/local Supabase, it creates session automatically or requires confirm
        if (signUpData.session) {
          setSuccessMsg('Registration successful! Redirecting...');
          setTimeout(() => {
            if (data.role === 'admin') {
              router.push('/admin');
            } else {
              router.push('/');
            }
            router.refresh();
          }, 1500);
        } else {
          setSuccessMsg('Registration successful! Please check your email to confirm your account.');
          setIsLoading(false);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to register account.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[85vh] flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="text-2xl font-bold tracking-tight mb-2">
            ATELIER
          </Link>
          <h2 className="text-xl font-semibold text-foreground">Create your account</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>

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

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-3">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-1">
                Full Name
              </label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                disabled={isLoading}
                {...register('fullName')}
                className={errors.fullName ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {errors.fullName && (
                <p className="mt-1 text-xs text-destructive">{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                disabled={isLoading}
                {...register('email')}
                className={errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1">
                Phone Number
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder="081234567890"
                disabled={isLoading}
                {...register('phone')}
                className={errors.phone ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-foreground mb-1">
                Register As
              </label>
              <select
                id="role"
                disabled={isLoading}
                {...register('role')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="customer">Customer (Shop Only)</option>
                <option value="admin">Admin (Manage Shop)</option>
              </select>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  disabled={isLoading}
                  {...register('password')}
                  className={errors.password ? 'border-destructive focus-visible:ring-destructive pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                disabled={isLoading}
                {...register('confirmPassword')}
                className={errors.confirmPassword ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full mt-6" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing up...
              </>
            ) : (
              'Sign Up'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
