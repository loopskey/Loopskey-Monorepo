CREATE TABLE "OutboxEvent" (
    "id" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "eventVersion" INTEGER NOT NULL DEFAULT 1,
    "aggregateType" TEXT NOT NULL,
    "aggregateId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "availableAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "correlationId" TEXT,
    CONSTRAINT "OutboxEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OutboxDelivery" (
    "eventId" TEXT NOT NULL,
    "handlerName" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OutboxDelivery_pkey" PRIMARY KEY ("eventId", "handlerName")
);

CREATE INDEX "OutboxEvent_processedAt_availableAt_idx" ON "OutboxEvent"("processedAt", "availableAt");
CREATE INDEX "OutboxEvent_aggregateType_aggregateId_idx" ON "OutboxEvent"("aggregateType", "aggregateId");
CREATE INDEX "OutboxEvent_eventName_occurredAt_idx" ON "OutboxEvent"("eventName", "occurredAt");
CREATE INDEX "OutboxDelivery_processedAt_idx" ON "OutboxDelivery"("processedAt");
ALTER TABLE "OutboxDelivery" ADD CONSTRAINT "OutboxDelivery_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "OutboxEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
