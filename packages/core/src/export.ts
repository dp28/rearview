import type { ReviewStory } from "./schema.js";

export function exportStoryMarkdown(story: ReviewStory): string {
  const lines = [`# ${story.title}`, "", story.summary, ""];
  for (const section of story.sections) {
    lines.push(`## ${section.title}`, "", `Risk: **${section.risk}**`, "", section.purpose, "", section.guidance, "");
    for (const file of section.files) lines.push(`- ${file.path} (${file.status}, ${file.risk})`);
    lines.push("");
  }
  return `${lines.join("\n").trim()}\n`;
}
