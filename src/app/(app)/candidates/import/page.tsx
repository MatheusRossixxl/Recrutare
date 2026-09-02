import { ResumeImportButton } from "@/components/candidates/resume-import-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ImportCandidatesPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Adicionar currículo</h2>
        <p className="text-sm text-muted-foreground">
          Envie um currículo em PDF e o sistema criará o candidato automaticamente.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Importar currículo</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col items-center justify-center gap-4 py-10">
          <p className="text-center text-sm text-muted-foreground">
            Selecione um arquivo PDF do seu computador.
            <br />
            Os dados serão extraídos automaticamente do currículo.
          </p>

          <ResumeImportButton />
        </CardContent>
      </Card>
    </div>
  );
}
