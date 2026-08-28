"use client";

import Link from "next/link";

import { CheckCircle2, XCircle, Pencil, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmActionButton } from "@/components/ui/confirm-action-button";
import { cancelInterview, markInterviewDone } from "@/lib/actions";

export function InterviewActions({
  interviewId,
  candidateName,
  status,
}: {
  interviewId: string;
  candidateName: string;
  status: string;
}) {
  if (status !== "SCHEDULED" && status !== "RESCHEDULED") {
    return null;
  }

  return (
    <div className="flex items-center gap-1">
      <Button variant="outline" size="sm" asChild>
        <Link href={`/interviews/${interviewId}/edit`}>
          <Pencil className="h-4 w-4" />
        </Link>
      </Button>

      <ConfirmActionButton
        variant="ghost"
        size="sm"
        className="bg-green-600 text-white hover:bg-green-700"
        title="Marcar entrevista como realizada?"
        description={`A entrevista com ${candidateName} será marcada como realizada.`}
        confirmLabel="Marcar como realizada"
        successMessage="Entrevista marcada como realizada."
        action={() => markInterviewDone(interviewId)}
      >
        <CheckCircle2 className="h-4 w-4" />
      </ConfirmActionButton>

      <ConfirmActionButton
        variant="ghost"
        size="sm"
        className="!bg-red-600 !text-white hover:!bg-red-700 hover:!text-white"
        title="Cancelar entrevista?"
        description={`A entrevista com ${candidateName} será marcada como cancelada.`}
        confirmLabel="Cancelar entrevista"
        successMessage="Entrevista cancelada."
        action={() => cancelInterview(interviewId)}
      >
        <XCircle className="h-4 w-4" />
      </ConfirmActionButton>    </div>
  );
}
