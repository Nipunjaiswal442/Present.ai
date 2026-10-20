import { getApiErrorMessage, getApiUrl, resolveBackendAssetUrl } from "@/utils/api";

export async function requestPresentationExport(
  presentationId: string,
  format: "pptx" | "pdf"
): Promise<string> {
  const response = await fetch(
    getApiUrl(`/api/v1/ppt/presentation/${encodeURIComponent(presentationId)}/export`),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      cache: "no-store",
      body: JSON.stringify({ export_as: format }),
      signal: AbortSignal.timeout(300_000),
    }
  );
  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response, "Unable to export your presentation. Please try again."));
  }
  const result = await response.json();
  const url = resolveBackendAssetUrl(result.download_url || result.path);
  if (!url) throw new Error("The export finished without a download link. Please try again.");
  return url;
}
