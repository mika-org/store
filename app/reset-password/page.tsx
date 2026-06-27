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
import { Loader2 } from 'lucide-react';

const resetSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ResetInput = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetInput>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetInput) => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        throw new Error(error.message);
      }

      setSuccessMsg('Your password has been successfully reset. Redirecting...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reset password.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="text-2xl font-bold tracking-tight mb-2">
            ATELIER
          </Link>
          <h2 className="text-xl font-semibold text-foreground">Set new password</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Please enter your new password below.
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

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                New Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                disabled={isLoading}
                {...register('password')}
                className={errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {errors.password && (
                <p className="mt-1.5 text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1.5">
                Confirm New Password
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
                <p className="mt-1.5 text-xs text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Reset Password'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
