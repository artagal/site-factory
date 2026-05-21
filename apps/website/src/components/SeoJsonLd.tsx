export function SeoJsonLd({
  data,
  id
}: {
  data: Record<string, unknown> | null;
  id: string;
}) {
  if (!data) {
    return null;
  }

  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data)
      }}
    />
  );
}
