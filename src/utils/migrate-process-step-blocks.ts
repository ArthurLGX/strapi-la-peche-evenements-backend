/**
 * Le champ `content` des étapes process est en `blocks` (Rich Text Strapi 5).
 * Si d'anciennes entrées contiennent encore une chaîne brute (ex. migration depuis `text`),
 * l'admin affiche : [Slate] initialValue is invalid! Expected a list of elements but got: "..."
 *
 * Cette fonction convertit une chaîne en structure Blocks attendue par Strapi.
 */
export function plainStringToStrapiBlocks(text: string): Record<string, unknown>[] {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) {
    return [
      {
        type: "paragraph",
        children: [{ type: "text", text: "" }],
      },
    ];
  }
  return normalized.split(/\n\s*\n/).map((chunk) => ({
    type: "paragraph",
    children: [
      {
        type: "text",
        text: chunk.replace(/\n/g, " ").trim(),
      },
    ],
  }));
}

export function isPlainStringBlocksContent(content: unknown): content is string {
  return typeof content === "string";
}
