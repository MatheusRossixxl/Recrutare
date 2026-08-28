"use client";

import { useState } from "react";
import { Sparkles, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CandidateJobAnalysis } from "@/services/ai-service";

export function AIAnalysisPanel({
  applicationId,
  jobTitle,
  initialAnalysis,
}: {
  applicationId: string;
  jobTitle: string;
  initialAnalysis?: CandidateJobAnalysis | null;
}) {
  const [analysis, setAnalysis] = useState<CandidateJobAnalysis | null>(initialAnalysis ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runAnalysis() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId }),
      });
      if (!res.ok) throw new Error("Falha ao analisar candidato");
      const data = await res.json();
      setAnalysis(data);
    } catch (e) {
      setError("Não foi possível concluir a análise agora.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Sparkles className="h-4 w-4 text-primary" /> Análise com IA — {jobTitle}
        </CardTitle>
        <Button size="sm" variant="outline" onClick={runAnalysis} disabled={loading}>
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          {analysis ? "Reanalisar" : "Analisar candidato"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {error && <p className="text-destructive">{error}</p>}

        {!analysis && !loading && (
          <p className="text-muted-foreground">
            Gere uma análise de compatibilidade entre este candidato e os requisitos da vaga. A IA sugere pontos de
            atenção e perguntas de entrevista — a decisão final é sempre sua.
          </p>
        )}

        {analysis && (
          <>
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-accent text-sm font-semibold">
                {analysis.matchScore}%
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Indicador de compatibilidade (apoio, não decisório)</p>
                <p className="text-xs text-muted-foreground">{analysis.disclaimer}</p>
              </div>
            </div>

            <p>{analysis.summary}</p>

            {analysis.strengths.length > 0 && (
              <div>
                <p className="mb-1 flex items-center gap-1 text-xs font-medium text-success">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Pontos positivos
                </p>
                <ul className="list-inside list-disc space-y-0.5 text-muted-foreground">
                  {analysis.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.concerns.length > 0 && (
              <div>
                <p className="mb-1 flex items-center gap-1 text-xs font-medium text-warning">
                  <AlertTriangle className="h-3.5 w-3.5" /> Pontos de atenção
                </p>
                <ul className="list-inside list-disc space-y-0.5 text-muted-foreground">
                  {analysis.concerns.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">Requisitos encontrados</p>
                <ul className="list-inside list-disc space-y-0.5 text-muted-foreground">
                  {analysis.requirementsFound.length > 0 ? analysis.requirementsFound.map((r, i) => <li key={i}>{r}</li>) : <li>Nenhum identificado</li>}
                </ul>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">Requisitos não encontrados</p>
                <ul className="list-inside list-disc space-y-0.5 text-muted-foreground">
                  {analysis.requirementsMissing.length > 0 ? analysis.requirementsMissing.map((r, i) => <li key={i}>{r}</li>) : <li>Nenhum</li>}
                </ul>
              </div>
            </div>

            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">Perguntas sugeridas para entrevista</p>
              <ul className="list-inside list-disc space-y-0.5 text-muted-foreground">
                {analysis.suggestedQuestions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
