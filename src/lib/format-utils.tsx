export function formatStructuredText(text?: string | null) {
  if (!text) return null;

  const normalized = text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const lines = normalized
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const blocks: string[] = [];
  let current: string[] = [];

  const flush = () => {
    if (current.length > 0) {
      blocks.push(current.join("\n"));
      current = [];
    }
  };

  for (const line of lines) {
    const isNewBlock =
      /^(Período|Periodo|Ano de conclusão|Ano de conclus[aã]o)\b/i.test(line) &&
      current.length > 0;

    if (isNewBlock) {
      flush();
    }

    current.push(line);
  }

  flush();

  return blocks.map((block, index) => (
    <div
      key={index}
      className={
        index > 0
          ? "border-t border-border pt-5 mt-5"
          : ""
      }
    >
      <p className="whitespace-pre-line leading-relaxed">
        {block}
      </p>
    </div>
  ));
}
