import { getStaticInfoMetadata } from "@templates/StaticInfoPage";
import ContactPageClient from "./ContactPageClient";

export const metadata = getStaticInfoMetadata("contact");

const ContactPage = () => {
  return <ContactPageClient />;
};

export default ContactPage;
