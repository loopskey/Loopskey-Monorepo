import { TOPIC_HUB_STATUS_GQL_NAME } from "@topicHub/enums/gql-names.enum";
import { registerEnumType } from "@nestjs/graphql";
import { TopicHubStatus } from "@prisma/client";

import "@contentUrl/enums/content-url-register.enum";

registerEnumType(TopicHubStatus, { name: TOPIC_HUB_STATUS_GQL_NAME });
