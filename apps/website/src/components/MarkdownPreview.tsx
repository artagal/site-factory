import type { ReactNode } from "react";

function parseInline(text: string) {
  const segments = text.split(/(\*\*[^*]+\*\*)/g);

  return segments.map((segment, index) => {
    if (segment.startsWith("**") && segment.endsWith("**")) {
      return (
        <strong key={`${segment}-${index}`} className="font-black text-ink">
          {segment.slice(2, -2)}
        </strong>
      );
    }

    return segment;
  });
}

export function MarkdownPreview({ markdown }: { markdown: string }) {
  const blocks: ReactNode[] = [];
  const listItems: string[] = [];

  const flushList = () => {
    if (listItems.length === 0) {
      return;
    }

    const items = [...listItems];
    listItems.length = 0;
    blocks.push(
      <ul key={`list-${blocks.length}`} className="my-5 list-disc space-y-2 pl-6 text-ink/72">
        {items.map((item) => (
          <li key={item}>{parseInline(item)}</li>
        ))}
      </ul>
    );
  };

  markdown
    .trim()
    .split(/\r?\n/)
    .forEach((line) => {
      const trimmed = line.trim();

      if (!trimmed) {
        flushList();
        return;
      }

      if (trimmed.startsWith("- ")) {
        listItems.push(trimmed.slice(2));
        return;
      }

      flushList();

      if (trimmed.startsWith("### ")) {
        blocks.push(
          <h3 key={trimmed} className="mt-8 text-2xl font-black text-ink">
            {parseInline(trimmed.slice(4))}
          </h3>
        );
        return;
      }

      if (trimmed.startsWith("## ")) {
        blocks.push(
          <h2 key={trimmed} className="mt-10 text-3xl font-black text-ink">
            {parseInline(trimmed.slice(3))}
          </h2>
        );
        return;
      }

      if (trimmed.startsWith("# ")) {
        blocks.push(
          <h2 key={trimmed} className="mt-10 text-3xl font-black text-ink">
            {parseInline(trimmed.slice(2))}
          </h2>
        );
        return;
      }

      blocks.push(
        <p key={`${trimmed}-${blocks.length}`} className="my-5 text-base leading-8 text-ink/72">
          {parseInline(trimmed)}
        </p>
      );
    });

  flushList();

  return <div className="mt-8 border-t border-ink/10 pt-2">{blocks}</div>;
}
