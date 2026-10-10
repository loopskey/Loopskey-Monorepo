import { bespokePageMetadata } from "@/utils/static-info-page.utils";

import ContactPageClient from "@templates/ContactPageClient";

export const generateMetadata = bespokePageMetadata("contactPage", "/contact");

const ContactPage = () => <ContactPageClient />;

export default ContactPage;
