export type RuntimeSurface = "browser" | "extension" | "local-server" | "hosted-service";
export interface RuntimeCapability { surface: RuntimeSurface; canReadLocalGit: boolean; canStoreTokens: boolean; requiresPrivacyPromptForCode: boolean; }

export const runtimeCapabilities: RuntimeCapability[] = [
  { surface: "browser", canReadLocalGit: false, canStoreTokens: false, requiresPrivacyPromptForCode: true },
  { surface: "extension", canReadLocalGit: false, canStoreTokens: true, requiresPrivacyPromptForCode: true },
  { surface: "local-server", canReadLocalGit: true, canStoreTokens: true, requiresPrivacyPromptForCode: true },
  { surface: "hosted-service", canReadLocalGit: false, canStoreTokens: true, requiresPrivacyPromptForCode: true }
];

export function assertPrivacyPrompt(surface: RuntimeSurface, includesRepositoryContent: boolean): boolean {
  const capability = runtimeCapabilities.find((item) => item.surface === surface);
  return Boolean(includesRepositoryContent && capability?.requiresPrivacyPromptForCode);
}
