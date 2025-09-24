import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { db } from '@/drizzle/db';
import { InterviewTable } from '@/drizzle/schema';
import { getInterviewJobInfoTag } from '@/features/interviews/dbCache';
import JobInfoBackLink from '@/features/jobInfos/components/JobInfoBackLink';
import { getJobInfoIdTag } from '@/features/jobInfos/dbCache';
import { formatDateTime } from '@/lib/formatters';
import { getCurrentUser } from '@/services/clerk/lib/getCurrentUser';
import { and, desc, eq, isNotNull } from 'drizzle-orm';
import { ArrowRight, Loader2, PlusIcon } from 'lucide-react';
import { cacheTag } from 'next/dist/server/use-cache/cache-tag';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

type Props = {
  params: Promise<{ jobInfoId: string }>;
};

const InterViewsPage = async ({ params }: Props) => {
  const { jobInfoId } = await params;
  return (
    <div className="container py-4 gap-4 h-screen-header flex flex-col items-start">
      <JobInfoBackLink jobInfoId={jobInfoId} />

      <Suspense
        fallback={<Loader2 className="size-24 animate-spin mx-auto m-auto" />}
      >
        <SuspendedPage jobInfoId={jobInfoId} />
      </Suspense>
    </div>
  );
};

export default InterViewsPage;

const SuspendedPage = async ({ jobInfoId }: { jobInfoId: string }) => {
  const { userId, redirectToSignIn } = await getCurrentUser();
  if (userId == null) return redirectToSignIn();

  const interviews = await getInterviews(jobInfoId, userId);

  if (interviews.length === 0) {
    return redirect(`/app/job-infos/${jobInfoId}/interviews/new`);
  }

  return (
    <div className="space-y-4 w-full">
      <div className="flex gap-2 justify-between">
        <h1 className="text-3xl md:text-4xl lg:text-5xl">Interviews</h1>
        <Button asChild>
          <Link href={`/app/job-infos/${jobInfoId}/interviews/new`}>
            <PlusIcon />
            New Interview
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 has-hover:*:not-hover:opacity-70">
        <Link
          href={`/app/job-infos/${jobInfoId}/interviews/new`}
          className="hover:scale-[1.02] transition-all"
        >
          <Card className="h-full border-dashed border-3 shadow-none bg-transparent hover:border-primary/50 transition-colors flex items-center justify-center">
            <CardContent className="text-lg flex items-center gap-2 text-muted-foreground">
              <PlusIcon className="size-6" />
              New Interview
            </CardContent>
          </Card>
        </Link>
        {interviews.map((interview) => (
          <Link
            key={interview.id}
            href={`/app/job-infos/${jobInfoId}/interviews/${interview.id}`}
            className="hover:scale-[1.02] transition-[transform_opacity]"
          >
            <Card className="hover:shadow-lg h-full group">
              <div className="flex items-center justify-between h-full">
                <CardHeader className="gap-1 flex-grow">
                  <CardTitle className="text-lg">
                    {formatDateTime(interview.createdAt)}
                  </CardTitle>
                  <CardDescription>{interview.duration}</CardDescription>
                </CardHeader>

                <CardContent>
                  <ArrowRight className="size-6 group-hover:text-primary transition" />
                </CardContent>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

const getInterviews = async (jobInfoId: string, userId: string) => {
  'use cache';
  cacheTag(getInterviewJobInfoTag(jobInfoId));
  cacheTag(getJobInfoIdTag(jobInfoId));

  const data = await db.query.InterviewTable.findMany({
    where: and(
      eq(InterviewTable.jobInfoId, jobInfoId),
      isNotNull(InterviewTable.humeChatId)
    ),
    with: { jobInfo: { columns: { userId: true } } },
    orderBy: desc(InterviewTable.updatedAt),
  });

  return data.filter((i) => i.jobInfo.userId === userId);
};
