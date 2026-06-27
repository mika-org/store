'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, ArrowLeft } from 'lucide-react';

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotInput = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotInput>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotInput) => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw new Error(error.message);
      }

      setSuccessMsg('Reset password link has been sent to your email.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send reset email.');
    } finally {
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
          <h2 className="text-xl font-semibold text-foreground">Reset your password</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            We will email you a link to reset your password.
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
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
              Email address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              disabled={isLoading}
              {...register('email')}
              className={errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
            />
            {errors.email && (
              <p className="mt-1.5 text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-3">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </Button>

            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
