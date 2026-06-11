export interface WebAppShell {
  title: string;
  regions: string[];
}

export const shell: WebAppShell = {
  title: "Rearview",
  regions: ["outline", "story", "context"]
};
