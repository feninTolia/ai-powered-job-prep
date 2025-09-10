'use client';
import { Button } from '@/components/ui/button';
import { env } from '@/data/env/client';
import { JobInfoTable } from '@/drizzle/schema';
import {
  createInterview,
  updateInterview,
} from '@/features/interviews/actions';
import { errorToast } from '@/lib/errorToast';
import CondensedMessages from '@/services/hume/components/CondensedMessages';
import { condenseChatMessages } from '@/services/hume/lib/condenseChatMessages';
import { useVoice, VoiceReadyState } from '@humeai/voice-react';
import { Loader2, Mic, MicOff, PhoneOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

type Props = {
  jobInfo: typeof JobInfoTable.$inferSelect;
  user: { name: string; imageUrl: string };
  accessToken: string;
};

export default function StartCall({ accessToken, user, jobInfo }: Props) {
  const { connect, readyState, chatMetadata, callDurationTimestamp } =
    useVoice();
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const router = useRouter();
  const durationRef = useRef(callDurationTimestamp);
  durationRef.current = callDurationTimestamp;

  //Sync  chat id
  useEffect(() => {
    if (chatMetadata?.chatId == null || interviewId == null) {
      return;
    }
    updateInterview(interviewId, { humeChatId: chatMetadata.chatId });
  }, [chatMetadata?.chatId, interviewId]);

  //Sync duration
  useEffect(() => {
    if (interviewId == null) return;

    const intervalId = setInterval(() => {
      if (durationRef.current == null) return;
      updateInterview(interviewId, { duration: durationRef.current });
    }, 10000);

    return () => clearInterval(intervalId);
  }, [interviewId]);

  //Handle disconnect
  useEffect(() => {
    if (readyState !== VoiceReadyState.CLOSED) return;
    if (interviewId == null) {
      return router.push(`/app/job-infos/${jobInfo.id}/interviews`);
    }

    if (durationRef.current != null) {
      updateInterview(interviewId, {
        duration: durationRef.current,
      });
    }
    router.push(`/app/job-infos/${jobInfo.id}/interviews/${interviewId}`);
  }, [interviewId, jobInfo.id, readyState, router]);

  if (readyState === VoiceReadyState.IDLE) {
    return (
      <div className="flex justify-center items-center h-screen-header ">
        <Button
          size="lg"
          onClick={async () => {
            const res = await createInterview({ jobInfoId: jobInfo.id });
            if (res.error) {
              return errorToast(res.message);
            }

            setInterviewId(res.id);

            connect({
              auth: { type: 'accessToken', value: accessToken },
              configId: env.NEXT_PUBLIC_HUME_CONFIG_ID,
              sessionSettings: {
                type: 'session_settings',
                variables: {
                  userName: user.name,
                  title: jobInfo.title || 'Not specified',
                  description: jobInfo.description,
                  experienceLevel: jobInfo.experienceLevel,
                },
              },
            });
          }}
        >
          Start Interview
        </Button>
      </div>
    );
  }

  if (
    readyState === VoiceReadyState.CONNECTING ||
    readyState === VoiceReadyState.CLOSED
  ) {
    return (
      <div className="h-screen-header flex items-center justify-center">
        <Loader2 className="size-24 animate-spin mx-auto m-auto" />
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-screen-header flex flex-col-reverse">
      <div className="container py-6 flex flex-col items-center justify-end gap-4">
        <Messages user={user} />
        <Controls />
      </div>
    </div>
  );
}

function Messages({ user }: { user: { name: string; imageUrl: string } }) {
  const { messages, fft } = useVoice();

  const condensedMessages = useMemo(() => {
    return condenseChatMessages(messages);
  }, [messages]);

  return (
    <CondensedMessages
      messages={condensedMessages}
      user={user}
      maxFft={Math.max(...fft)}
      className="max-w-5xl"
    />
  );
}

function Controls() {
  const { disconnect, mute, isMuted, unmute, micFft, callDurationTimestamp } =
    useVoice();
  return (
    <div className="flex gap-5 rounded border px-5 py-2 w-fit sticky bottom-6 bg-background items-center">
      <Button
        onClick={isMuted ? unmute : mute}
        variant="ghost"
        size="icon"
        className="-mx-3"
      >
        {isMuted ? <MicOff className="text-destructive" /> : <Mic />}
        <span className="sr-only">{isMuted ? 'unmute' : 'mute'}</span>
      </Button>

      <div className=" self-stretch">
        <FftVisualizer fft={micFft} />
      </div>
      <div className="text-sm text-muted-foreground tabular-nums">
        {callDurationTimestamp}
      </div>
      <Button
        onClick={disconnect}
        variant="ghost"
        size="icon"
        className="-mx-3"
      >
        <PhoneOff className="text-destructive" />
        <span className="sr-only">End Call</span>
      </Button>
    </div>
  );
}

function FftVisualizer({ fft }: { fft: number[] }) {
  return (
    <div className="flex gap-1 items-center h-full">
      {fft.map((value, index) => {
        const percent = (value / 4) * 100;
        return (
          <div
            key={index}
            className="min-h-0.5 rounded-full bg-primary/75 w-0.5"
            style={{
              height: `${percent < 10 ? 0 : percent}%`,
            }}
          />
        );
      })}
    </div>
  );
}
