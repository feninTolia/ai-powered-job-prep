import JobInfoBackLink from '@/features/jobInfos/components/JobInfoBackLink';
import { canRunResumeAnalysis } from '@/features/resumeAnalysis/permissions';
import { Loader2 } from 'lucide-react';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import ResumePageClient from './_ResumePageClient';

type Props = {
  params: Promise<{ jobInfoId: string }>;
};

export default async function ResumePage({ params }: Props) {
  const { jobInfoId } = await params;

  return (
    <div className="container py-4 space-y-4 h-screen-header flex flex-col items-start">
      <JobInfoBackLink jobInfoId={jobInfoId} />
      <Suspense fallback={<Loader2 className="animate-spin size-24 m-auto" />}>
        <SuspendedComponent jobInfoId={jobInfoId} />
      </Suspense>
    </div>
  );
}

async function SuspendedComponent({ jobInfoId }: { jobInfoId: string }) {
  if (!(await canRunResumeAnalysis())) return redirect('/app/upgrade');

  return <ResumePageClient jobInfoId={jobInfoId} />;
}
