import { getBespokePageMetadata } from "@/utils/static-info-page.utils";

import ContactPageClient from "@templates/ContactPageClient";

export const metadata = getBespokePageMetadata("contactPage", "/contact");

const ContactPage = () => <ContactPageClient />;

export default ContactPage;
