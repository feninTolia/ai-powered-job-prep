import { Card, CardContent } from '@/components/ui/card';
import { db } from '@/drizzle/db';
import { JobInfoTable } from '@/drizzle/schema';
import JobInfoBackLink from '@/features/jobInfos/components/JobInfoBackLink';
import JobInfoFrom from '@/features/jobInfos/components/JobInfoFrom';
import { getJobInfoIdTag } from '@/features/jobInfos/dbCache';
import { getCurrentUser } from '@/services/clerk/lib/getCurrentUser';
import { and, eq } from 'drizzle-orm';
import { Loader2 } from 'lucide-react';
import { cacheTag } from 'next/dist/server/use-cache/cache-tag';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

type Props = {
  params: Promise<{ jobInfoId: string }>;
};

const JobInfoEditPage = async ({ params }: Props) => {
  const { jobInfoId } = await params;

  return (
    <div className="container my-4 max-w-5xl space-y-4">
      <JobInfoBackLink jobInfoId={jobInfoId} />
      <h1 className="text-3xl md:text-4xl ">Edit Job Description</h1>
      <Card>
        <CardContent>
          <Suspense
            fallback={<Loader2 className="size-24 animate-spin mx-auto" />}
          >
            <SuspendedForm jobInfoId={jobInfoId} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
};

export default JobInfoEditPage;

async function SuspendedForm({ jobInfoId }: { jobInfoId: string }) {
  const jobInfo = await getCurrentUser().then(
    async ({ userId, redirectToSignIn }) => {
      if (userId == null) return redirectToSignIn();

      const jobInformation = await getJobInfo(jobInfoId, userId);
      if (jobInformation == null) return notFound();
      return jobInformation;
    }
  );

  return <JobInfoFrom jobInfo={jobInfo} />;
}

export async function getJobInfo(id: string, userId: string) {
  'use cache';
  cacheTag(getJobInfoIdTag(id));

  return db.query.JobInfoTable.findFirst({
    where: and(eq(JobInfoTable.id, id), eq(JobInfoTable.userId, userId)),
  });
}
