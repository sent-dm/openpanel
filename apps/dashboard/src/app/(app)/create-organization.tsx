'use client';

import { useState } from 'react';
import { CreateClientSuccess } from '@/components/clients/create-client-success';
import { LogoSquare } from '@/components/Logo';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/utils/cn';
import { zodResolver } from '@hookform/resolvers/zod';
import { SaveIcon, WallpaperIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { api, handleError } from '../_trpc/client';

const validation = z
  .object({
    organization: z.string().min(3),
    project: z.string().min(3),
    cors: z.string().nullable(),
    tab: z.string(),
  })
  .refine(
    (data) =>
      data.tab === 'other' || (data.tab === 'website' && data.cors !== ''),
    {
      message: 'Cors is required',
      path: ['cors'],
    }
  );

type IForm = z.infer<typeof validation>;

export function CreateOrganization() {
  const router = useRouter();
  const form = useForm<IForm>({
    resolver: zodResolver(validation),
    defaultValues: {
      organization: '',
      project: '',
      cors: '',
      tab: 'website',
    },
  });
  const mutation = api.onboarding.organziation.useMutation({
    onError: handleError,
  });
  const onSubmit: SubmitHandler<IForm> = (values) => {
    mutation.mutate({
      ...values,
      cors: values.tab === 'website' ? values.cors : null,
    });
  };

  if (mutation.isSuccess && mutation.data.client) {
    return (
      <div className="card p-4 md:p-8">
        <LogoSquare className="w-20 mb-4" />
        <h1 className="font-medium text-3xl">Nice job!</h1>
        <div className="mb-4">
          You're ready to start using our SDK. Save the client ID and secret (if
          you have any)
        </div>
        <CreateClientSuccess {...mutation.data.client} />
        <div className="flex gap-4 mt-4">
          <a
            className={cn(buttonVariants({ variant: 'secondary' }), 'flex-1')}
            href="https://docs.openpanel.dev/docs"
            target="_blank"
          >
            Read docs
          </a>
          <Button
            className="flex-1"
            onClick={() => router.refresh()}
            icon={WallpaperIcon}
          >
            Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-4 md:p-8">
      <LogoSquare className="w-20 mb-4" />
      <h1 className="font-medium text-3xl">Welcome to Openpanel</h1>
      <div className="text-lg">
        Create your organization below (can be personal or a company) and your
        first project.
      </div>
      <form
        className="mt-8 flex flex-col gap-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div>
          <Label>Organization name *</Label>
          <Input
            placeholder="Organization name"
            error={form.formState.errors.organization?.message}
            {...form.register('organization')}
          />
        </div>
        <div>
          <Label>Project name *</Label>
          <Input
            placeholder="Project name"
            error={form.formState.errors.project?.message}
            {...form.register('project')}
          />
        </div>

        <Tabs
          defaultValue="website"
          onValueChange={(val) => form.setValue('tab', val)}
          className="h-28"
        >
          <TabsList className="bg-slate-200">
            <TabsTrigger value="website">Website</TabsTrigger>
            <TabsTrigger value="other">Other</TabsTrigger>
          </TabsList>
          <TabsContent value="website">
            <Label>Cors *</Label>
            <Input
              placeholder="https://example.com"
              error={form.formState.errors.cors?.message}
              {...form.register('cors')}
            />
          </TabsContent>
          <TabsContent value="other">
            <div className="p-2 px-3 bg-white rounded text-sm">
              🔑 You will get a secret to use for your API requests.
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button
            type="submit"
            size="lg"
            icon={SaveIcon}
            loading={mutation.isLoading}
          >
            Create
          </Button>
        </div>
      </form>
    </div>
  );
}
