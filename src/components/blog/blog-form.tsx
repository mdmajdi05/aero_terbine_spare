'use client';

import { type ReactNode } from 'react';
import { useForm, FormProvider, type UseFormReturn, type DefaultValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { blogFormSchema, defaultFormValues, type BlogFormValues } from '@/types/blog-form';

export type { UseFormReturn, BlogFormValues };

interface Props {
  defaultValues?: DefaultValues<BlogFormValues>;
  children: (form: UseFormReturn<BlogFormValues>) => ReactNode;
}

export default function BlogForm({ defaultValues, children }: Props) {
  const form = useForm<BlogFormValues>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: defaultValues ?? defaultFormValues,
  });

  return (
    <FormProvider {...form}>
      {children(form)}
    </FormProvider>
  );
}
