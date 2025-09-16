import { questionDifficulties } from '@/drizzle/schema';
import { getJobInfo } from '@/features/jobInfos/db';
import {
  getQuestion,
  getQuestions,
  insertQuestion,
} from '@/features/questions/db';
import { canCreateQuestion } from '@/features/questions/permissions';
import { PLAN_LIMIT_MESSAGE } from '@/lib/errorToast';
import {
  generateAiQuestion,
  generateAiQuestionFeedback,
} from '@/services/ai/questions';
import { getCurrentUser } from '@/services/clerk/lib/getCurrentUser';
import { createDataStreamResponse } from 'ai';
import z from 'zod';

const schema = z.object({
  prompt: z.string().min(1),
  questionId: z.string().min(1),
});

export async function POST(req: Request) {
  const body = await req.json();

  const result = schema.safeParse(body);

  if (!result.success) {
    return new Response('Error generating your feedback', { status: 400 });
  }

  const { prompt: answer, questionId } = result.data;
  const { userId } = await getCurrentUser();

  if (userId == null) {
    return new Response('You are not logged in', { status: 401 });
  }

  const question = await getQuestion(questionId, userId);

  if (question == null) {
    return new Response('You do not have permission to do this', {
      status: 403,
    });
  }

  const res = generateAiQuestionFeedback({
    question: question.text,
    answer,
  });

  return res.toDataStreamResponse({ sendUsage: false });
}
