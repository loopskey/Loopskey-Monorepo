import { getStaticInfoMetadata } from "@templates/static-info-page.utils";
import ContactPageClient from "./ContactPageClient";

export const metadata = getStaticInfoMetadata("contact");

const ContactPage = () => <ContactPageClient />;

export default ContactPage;
