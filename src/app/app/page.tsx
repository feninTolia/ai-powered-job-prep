import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { db } from '@/drizzle/db';
import { JobInfoTable } from '@/drizzle/schema';
import JobInfoFrom from '@/features/jobInfos/components/JobInfoFrom';
import { getJobInfoUserTag } from '@/features/jobInfos/dbCache';
import { formatExperienceLevel } from '@/features/jobInfos/lib/formatters';
import { getCurrentUser } from '@/services/clerk/lib/getCurrentUser';
import { desc, eq } from 'drizzle-orm';
import { ArrowRight, Loader2, PlusIcon } from 'lucide-react';
import { cacheTag } from 'next/dist/server/use-cache/cache-tag';
import Link from 'next/link';
import { Suspense } from 'react';
import { toast } from 'sonner';

async function getJobInfos(userId: string) {
  'use cache';
  cacheTag(getJobInfoUserTag(userId));
  try {
    return db.query.JobInfoTable.findMany({
      where: eq(JobInfoTable.userId, userId),
      orderBy: desc(JobInfoTable.updatedAt),
    });
  } catch {
    toast.error('Failed to get job info');
  }
}

export default function AppPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen-header flex items-center justify-center">
          <Loader2 className=" animate-spin size-24" />
        </div>
      }
    >
      <JobInfos />
    </Suspense>
  );
}

async function JobInfos() {
  const { redirectToSignIn, userId } = await getCurrentUser();

  if (userId == null) return redirectToSignIn();

  const jobInfos = await getJobInfos(userId);

  if (jobInfos == null || jobInfos.length === 0) {
    return <NoJobInfos />;
  }

  return (
    <div className="container my-4">
      <div className="flex gap-2 justify-between mb-6">
        <h1 className="text-3xl md:text-4xl lg:text-5xl">
          Select a job description
        </h1>
        <Button asChild>
          <Link href="/app/job-infos/new">
            <PlusIcon />
            Create Job Description
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 has-hover:*:not-hover:opacity-70">
        {jobInfos.map((jobInfo) => (
          <Link
            key={jobInfo.id}
            href={`/app/job-infos/${jobInfo.id}`}
            className="hover:scale-[1.02] transition-[transform_opacity]"
          >
            <Card className="hover:shadow-lg h-full group">
              <div className="flex items-center justify-between h-full">
                <div className="space-y-4 h-full w-5/6 flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-lg">{jobInfo.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground line-clamp-3 flex-1">
                    {jobInfo.description}
                  </CardContent>
                </div>

                <CardContent>
                  <ArrowRight className="size-6 group-hover:text-primary transition" />
                </CardContent>
              </div>
              <CardFooter className="flex gap-2 justify-start">
                <Badge variant="outline">
                  {formatExperienceLevel(jobInfo.experienceLevel)}
                </Badge>
                {jobInfo.title && (
                  <Badge variant="outline" className="flex-auto">
                    <div className="min-w-0 truncate">{jobInfo.title}</div>
                  </Badge>
                )}
              </CardFooter>
            </Card>
          </Link>
        ))}
        <Link
          href="/app/job-infos/new"
          className="hover:scale-[1.02] transition-all"
        >
          <Card className="h-full border-dashed border-3 shadow-none bg-transparent hover:border-primary/50 transition-colors flex items-center justify-center">
            <CardContent className="text-lg flex items-center gap-2 text-muted-foreground">
              <PlusIcon className="size-6" />
              New Job Description
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}

async function NoJobInfos() {
  return (
    <div className="container m-4 max-w-5xl">
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
        Welcome to Landr
      </h1>
      <p className="mt-2 text-muted-foreground mb-8">
        To get started, enter information about the type of job you are wanting
        to apply for. This can be specific information copied directly from a
        job listing or general information such as the tech stack you want to
        work in. The more specific you are in the description the closer the
        test interviews will be to the real thing.
      </p>

      <Card>
        <CardContent>
          <JobInfoFrom />
        </CardContent>
      </Card>
    </div>
  );
}
