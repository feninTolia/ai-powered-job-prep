import { env } from '@/data/env/server';
import { db } from '@/drizzle/db';
import { JobInfoTable } from '@/drizzle/schema';
import { getJobInfoIdTag } from '@/features/jobInfos/dbCache';
import { getCurrentUser } from '@/services/clerk/lib/getCurrentUser';
import { and, eq } from 'drizzle-orm';
import { fetchAccessToken } from 'hume';
import { VoiceProvider } from '@humeai/voice-react';
import { Loader2 } from 'lucide-react';
import { cacheTag } from 'next/dist/server/use-cache/cache-tag';
import { notFound, redirect } from 'next/navigation';
import { Suspense } from 'react';
import StartCall from './_StartCall';
import { canCreateInterview } from '@/features/interviews/permissions';

type Props = {
  params: Promise<{ jobInfoId: string }>;
};

export default async function NewInterviewPage({ params }: Props) {
  const { jobInfoId } = await params;
  return (
    <Suspense
      fallback={
        <div className="h-screen-header flex items-center justify-center">
          <Loader2 className="size-24 animate-spin mx-auto m-auto" />
        </div>
      }
    >
      <SuspendedComponent jobInfoId={jobInfoId} />
    </Suspense>
  );
}

async function SuspendedComponent({ jobInfoId }: { jobInfoId: string }) {
  const { userId, user, redirectToSignIn } = await getCurrentUser({
    allData: true,
  });
  if (userId == null || user == null) return redirectToSignIn();
  if (!(await canCreateInterview())) return redirect('/app/upgrade');

  const jobInfo = await getJobInfo(jobInfoId, userId);
  if (jobInfo == null) return notFound();

  const accessToken = await fetchAccessToken({
    apiKey: env.HUME_API_KEY,
    secretKey: env.HUME_SECRET_KEY,
  });

  return (
    <VoiceProvider>
      <StartCall accessToken={accessToken} jobInfo={jobInfo} user={user} />
    </VoiceProvider>
  );
}

export async function getJobInfo(id: string, userId: string) {
  'use cache';
  cacheTag(getJobInfoIdTag(id));

  return db.query.JobInfoTable.findFirst({
    where: and(eq(JobInfoTable.id, id), eq(JobInfoTable.userId, userId)),
  });
}
