"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { jsPDF } from "jspdf";

interface PdfExportData {
  organizationName: string;
  dateRange: string;
  kpis: { label: string; value: string }[];
  stages: { name: string; count: number }[];
  companies: { name: string; count: number }[];
  averageProcessTime: number;
  hiringRate: string;
}

interface PdfExportButtonProps {
  data: PdfExportData;
}

export function PdfExportButton({ data }: PdfExportButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);

    try {
      const doc = new jsPDF();

      // Header
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("Recrutare", 14, 20);

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("Relatorio de Recrutamento", 14, 28);

      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text(`Organizacao: ${data.organizationName}`, 14, 36);
      doc.text(`Periodo: ${data.dateRange}`, 14, 42);
      doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, 14, 48);

      // Divider
      doc.setDrawColor(200, 200, 200);
      doc.line(14, 54, 196, 54);

      // KPIs
      let y = 64;
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text("Indicadores", 14, y);
      y += 10;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      data.kpis.forEach((kpi) => {
        doc.text(`${kpi.label}: ${kpi.value}`, 14, y);
        y += 7;
      });

      // Stages
      y += 8;
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("Candidatos por etapa", 14, y);
      y += 10;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      data.stages.forEach((stage) => {
        doc.text(`${stage.name}: ${stage.count}`, 14, y);
        y += 7;
      });

      // Companies
      y += 8;
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("Vagas por empresa", 14, y);
      y += 10;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      data.companies.forEach((company) => {
        doc.text(`${company.name}: ${company.count} vagas`, 14, y);
        y += 7;
      });

      // Summary
      y += 8;
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("Resumo", 14, y);
      y += 10;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Tempo medio do processo: ${
          data.averageProcessTime > 0
            ? `${data.averageProcessTime.toFixed(1)} dias`
            : "Sem dados"
        }`,
        14,
        y
      );
      y += 7;
      doc.text(`Taxa de contratacao: ${data.hiringRate}%`, 14, y);

      // Footer
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        "Gerado por Recrutare - Gestao de Talentos",
        14,
        pageHeight - 10
      );

      doc.save("relatorio-recrutare.pdf");

      toast({
        title: "PDF exportado",
        description: "O relatorio foi baixado com sucesso.",
        variant: "success",
      });
    } catch {
      toast({
        title: "Erro ao exportar",
        description: "Nao foi possivel gerar o PDF. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={loading}
      className="h-9 gap-2 rounded-xl border-neutral-200 text-xs font-medium"
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Download className="h-3.5 w-3.5" />
      )}
      Exportar PDF
    </Button>
  );
}
