import type { Metadata } from "next";
import Landing from "@/components/pai/Landing";

export const metadata: Metadata = {
  title: "Present.ai — AI presentations, designed by you",
  description:
    "Present.ai turns a prompt or a document into a finished, fully editable deck. Open source, self-hosted, works with the AI model you choose.",
};

export default function Page() {
  return <Landing />;
}
