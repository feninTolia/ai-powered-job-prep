'use server';

import { env } from '@/data/env/server';
import { db } from '@/drizzle/db';
import { InterviewTable, JobInfoTable } from '@/drizzle/schema';
import { PLAN_LIMIT_MESSAGE, RATE_LIMIT_MESSAGE } from '@/lib/errorToast';
import { getCurrentUser } from '@/services/clerk/lib/getCurrentUser';
import arcjet, { request, tokenBucket } from '@arcjet/next';
import { and, eq } from 'drizzle-orm';
import { cacheTag } from 'next/dist/server/use-cache/cache-tag';
import { getJobInfoIdTag } from '../jobInfos/dbCache';
import { insertInterview, updateInterviewDb } from './db';
import { getInterviewIdTag } from './dbCache';
import { canCreateInterview } from './permissions';
import { generateAiInterviewFeedback } from '@/services/ai/interviews';

type ApiResponse =
  | { error: true; message: string }
  | { error: false; id: string };

const aj = arcjet({
  characteristics: ['userId'],
  key: env.ARCJET_KEY,
  rules: [
    tokenBucket({
      capacity: 12,
      refillRate: 4,
      interval: '1d',
      mode: 'LIVE',
    }),
  ],
});

export async function createInterview({
  jobInfoId,
}: {
  jobInfoId: string;
}): Promise<ApiResponse> {
  const { userId } = await getCurrentUser();

  if (userId == null) {
    return { error: true, message: "You don't have permission to do this" };
  }

  //permissions
  if (!(await canCreateInterview())) {
    return { error: true, message: PLAN_LIMIT_MESSAGE };
  }
  //rate limit
  const decision = await aj.protect(await request(), { userId, requested: 1 });
  if (decision.isDenied()) {
    return { error: true, message: RATE_LIMIT_MESSAGE };
  }

  //job info
  const jobInfo = await getJobInfo(jobInfoId, userId);
  if (jobInfo == null) {
    return { error: true, message: "You don't have permission to do this" };
  }

  //create interview
  const interview = await insertInterview({ jobInfoId, duration: '00:00:00' });
  return { error: false, id: interview.id };
}

export async function updateInterview(
  id: string,
  data: { humeChatId?: string; duration?: string }
): Promise<ApiResponse> {
  const { userId } = await getCurrentUser();

  if (userId == null) {
    return { error: true, message: "You don't have permission to do this" };
  }

  const interview = await getInterview(id, userId);

  if (interview == null) {
    return { error: true, message: "You don't have permission to do this" };
  }

  await updateInterviewDb(id, data);
  return { error: false, id: interview.id };
}

async function getJobInfo(id: string, userId: string) {
  'use cache';
  cacheTag(getJobInfoIdTag(id));

  return db.query.JobInfoTable.findFirst({
    where: and(eq(JobInfoTable.id, id), eq(JobInfoTable.userId, userId)),
  });
}

async function getInterview(id: string, userId: string) {
  'use cache';
  cacheTag(getInterviewIdTag(id));

  const interview = await db.query.InterviewTable.findFirst({
    where: eq(InterviewTable.id, id),
    with: {
      jobInfo: {
        columns: {
          userId: true,
          id: true,
          description: true,
          title: true,
          experienceLevel: true,
        },
      },
    },
  });

  if (interview == null) return null;

  cacheTag(getJobInfoIdTag(interview.jobInfo.id));
  if (interview.jobInfo.userId !== userId) return null;

  return interview;
}

export async function generateInterviewFeedback(interviewId: string) {
  const { userId, user } = await getCurrentUser({ allData: true });

  if (userId == null || user == null) {
    return { error: true, message: "You don't have permission to do this" };
  }

  const interview = await getInterview(interviewId, userId);

  if (interview == null) {
    return { error: true, message: "You don't have permission to do this" };
  }

  if (interview.humeChatId == null) {
    return { error: true, message: 'Interview has not been completed yet' };
  }

  const feedback = await generateAiInterviewFeedback({
    humeChatId: interview.humeChatId,
    jobInfo: interview.jobInfo,
    username: user?.name,
  });

  if (feedback == null) {
    return { error: true, message: 'Failed to generate feedback' };
  }

  await updateInterviewDb(interviewId, { feedback });

  return { error: false };
}
