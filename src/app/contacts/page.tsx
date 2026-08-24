import type { Metadata } from "next";
import { ContactsHub } from "@/components/contacts-hub/ContactsHub";

export const metadata: Metadata = {
  title: "Links & Contact — SCREAM VISION",
  description: "Official SCREAM VISION links, marketplaces, collections and contact channels.",
};

export default function ContactsPage() {
  return <ContactsHub />;
}
