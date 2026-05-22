import type { ReactNode } from "react";
import { slugifyHeading } from "../lib/markdown";

function safeHref(href: string) {
  if (
    href.startsWith("/") ||
    href.startsWith("#") ||
    href.startsWith("https://") ||
    href.startsWith("http://") ||
    href.startsWith("mailto:")
  ) {
    return href;
  }

  return "#";
}

function parseInline(text: string): ReactNode[] {
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  const segments = text.split(pattern);

  return segments.map((segment, index) => {
    const key = `${segment}-${index}`;

    if (segment.startsWith("**") && segment.endsWith("**")) {
      return (
        <strong key={key} className="font-black text-ink">
          {segment.slice(2, -2)}
        </strong>
      );
    }

    if (segment.startsWith("`") && segment.endsWith("`")) {
      return (
        <code key={key} className="rounded bg-ink/10 px-1.5 py-0.5 text-[0.95em] font-bold text-ink">
          {segment.slice(1, -1)}
        </code>
      );
    }

    if (segment.startsWith("[") && segment.includes("](") && segment.endsWith(")")) {
      const label = segment.slice(1, segment.indexOf("]("));
      const href = segment.slice(segment.indexOf("](") + 2, -1);

      return (
        <a key={key} href={safeHref(href)} className="font-bold text-skyline underline underline-offset-4">
          {label}
        </a>
      );
    }

    return segment;
  });
}

export function MarkdownPreview({ markdown }: { markdown: string }) {
  const blocks: ReactNode[] = [];
  const listItems: string[] = [];
  const headingCounts = new Map<string, number>();
  let listType: "ol" | "ul" | null = null;
  let codeFence: string[] = [];
  let isInCodeFence = false;

  const flushList = () => {
    if (listItems.length === 0) {
      return;
    }

    const items = [...listItems];
    const Tag = listType === "ol" ? "ol" : "ul";
    listItems.length = 0;
    listType = null;
    blocks.push(
      <Tag
        key={`list-${blocks.length}`}
        className={`my-5 space-y-2 pl-6 text-ink/72 ${Tag === "ol" ? "list-decimal" : "list-disc"}`}
      >
        {items.map((item) => (
          <li key={item}>{parseInline(item)}</li>
        ))}
      </Tag>
    );
  };

  const flushCodeFence = () => {
    if (!codeFence.length) {
      return;
    }

    const code = codeFence.join("\n");
    codeFence = [];
    blocks.push(
      <pre
        key={`code-${blocks.length}`}
        className="my-6 overflow-x-auto rounded-lg border border-ink/10 bg-ink p-4 text-sm leading-6 text-white"
      >
        <code>{code}</code>
      </pre>
    );
  };

  const headingId = (title: string) => {
    const baseId = slugifyHeading(title.replace(/[*_`]/g, ""));
    const currentCount = headingCounts.get(baseId) ?? 0;
    headingCounts.set(baseId, currentCount + 1);

    return currentCount ? `${baseId}-${currentCount + 1}` : baseId;
  };

  markdown
    .trim()
    .split(/\r?\n/)
    .forEach((line) => {
      const trimmed = line.trim();

      if (trimmed.startsWith("```")) {
        if (isInCodeFence) {
          isInCodeFence = false;
          flushCodeFence();
        } else {
          flushList();
          isInCodeFence = true;
        }
        return;
      }

      if (isInCodeFence) {
        codeFence.push(line);
        return;
      }

      if (!trimmed) {
        flushList();
        return;
      }

      if (trimmed.startsWith("- ")) {
        if (listType === "ol") {
          flushList();
        }
        listType = "ul";
        listItems.push(trimmed.slice(2));
        return;
      }

      if (/^\d+\.\s/.test(trimmed)) {
        if (listType === "ul") {
          flushList();
        }
        listType = "ol";
        listItems.push(trimmed.replace(/^\d+\.\s/, ""));
        return;
      }

      flushList();

      if (trimmed === "---") {
        blocks.push(<hr key={`hr-${blocks.length}`} className="my-8 border-ink/10" />);
        return;
      }

      if (trimmed.startsWith("> ")) {
        blocks.push(
          <blockquote
            key={`${trimmed}-${blocks.length}`}
            className="my-6 border-l-4 border-mint bg-paper py-3 pl-5 text-base font-bold leading-7 text-ink/76"
          >
            {parseInline(trimmed.slice(2))}
          </blockquote>
        );
        return;
      }

      if (trimmed.startsWith("#### ")) {
        const title = trimmed.slice(5);
        blocks.push(
          <h4 id={headingId(title)} key={trimmed} className="mt-7 scroll-mt-24 text-xl font-black text-ink">
            {parseInline(title)}
          </h4>
        );
        return;
      }

      if (trimmed.startsWith("### ")) {
        const title = trimmed.slice(4);
        blocks.push(
          <h3 id={headingId(title)} key={trimmed} className="mt-8 scroll-mt-24 text-2xl font-black text-ink">
            {parseInline(title)}
          </h3>
        );
        return;
      }

      if (trimmed.startsWith("## ")) {
        const title = trimmed.slice(3);
        blocks.push(
          <h2 id={headingId(title)} key={trimmed} className="mt-10 scroll-mt-24 text-3xl font-black text-ink">
            {parseInline(title)}
          </h2>
        );
        return;
      }

      if (trimmed.startsWith("# ")) {
        const title = trimmed.slice(2);
        blocks.push(
          <h2 id={headingId(title)} key={trimmed} className="mt-10 scroll-mt-24 text-3xl font-black text-ink">
            {parseInline(title)}
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
  flushCodeFence();

  return <div className="mt-8 border-t border-ink/10 pt-2">{blocks}</div>;
}
