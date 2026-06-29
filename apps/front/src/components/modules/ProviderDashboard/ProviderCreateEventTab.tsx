"use client";

import { useProviderCreateEventTab } from "@hooks/useProviderCreateEventTab";
import { FloatingTextareaField } from "@elements/floating-textarea";
import { ProviderEventStepper } from "@modules/ProviderDashboard/parts/provider-event-stepper";
import { FloatingSelectField } from "@elements/floating-select";
import { FloatingInputField } from "@elements/floating-input";
import { isValidImageSrc } from "@utils/function-helper";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";
import { Switch } from "@ui/switch";

import Image from "next/image";

import * as L from "lucide-react";
import * as F from "@ui/form";

const ProviderCreateEventTab = () => {
  const {
    t,
    form,
    steps,
    formRhf,
    goNext,
    saveDraft,
    canGoNext,
    isLoading,
    goPrevious,
    activeStep,
    typeOptions,
    publishEvent,
    setActiveStep,
    canGoPrevious,
    toggleFreeEvent,
    categoryOptions,
    languageOptions,
    pduCategoryOptions,
    deliveryModeOptions,
  } = useProviderCreateEventTab();

  const hasValidThumbnail = isValidImageSrc(form.imageUrl);

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-medium text-primary">
            {t("providerDashboard.createEvent.eyebrow")}
          </p>
          <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
            {t("providerDashboard.createEvent.title")}
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {t("providerDashboard.createEvent.description")}
          </p>
        </div>
        <div className="flex flex-col-reverse gap-3 border-t border-glass-border pt-5 sm:flex-row sm:items-center sm:justify-between">
          <Button
            radius="xl"
            type="button"
            variant="glass"
            onClick={goPrevious}
            disabled={!canGoPrevious || isLoading}
          >
            {t("providerDashboard.createEvent.previous")}
          </Button>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            {canGoNext ? (
              <Button
                radius="xl"
                type="button"
                variant="brand"
                onClick={goNext}
                disabled={isLoading}
              >
                {t("providerDashboard.createEvent.next")}
              </Button>
            ) : (
              <>
                <Button
                  radius="xl"
                  type="button"
                  variant="glass"
                  onClick={saveDraft}
                  disabled={isLoading}
                >
                  <L.Save className="h-4 w-4" />
                  {t("providerDashboard.createEvent.saveDraft")}
                </Button>

                <Button
                  radius="xl"
                  type="button"
                  variant="brand"
                  disabled={isLoading}
                  onClick={publishEvent}
                >
                  <L.Send className="h-4 w-4" />
                  {t("providerDashboard.createEvent.publish")}
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      <ProviderEventStepper
        steps={steps}
        activeStep={activeStep}
        onChange={setActiveStep}
      />

      <F.Form {...formRhf}>
        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <GlassCard>
            {activeStep === 1 && (
              <div className="grid gap-5 md:grid-cols-2">
                <FloatingInputField
                  name="title"
                  control={formRhf.control}
                  leftIcon={<L.FileText className="h-4 w-4" />}
                  label={t("providerDashboard.createEvent.fields.title")}
                />

                <FloatingSelectField
                  name="category"
                  control={formRhf.control}
                  options={categoryOptions}
                  label={t("providerDashboard.createEvent.fields.category")}
                />

                <FloatingSelectField
                  name="type"
                  options={typeOptions}
                  control={formRhf.control}
                  label={t("providerDashboard.createEvent.fields.type")}
                />

                <FloatingSelectField
                  name="language"
                  control={formRhf.control}
                  options={languageOptions}
                  label={t("providerDashboard.createEvent.fields.language")}
                />

                <FloatingInputField
                  name="specificTopic"
                  control={formRhf.control}
                  leftIcon={<L.Tag className="h-4 w-4" />}
                  label={t(
                    "providerDashboard.createEvent.fields.specificTopic",
                  )}
                />

                <FloatingTextareaField
                  name="description"
                  control={formRhf.control}
                  className="md:col-span-2"
                  textareaClassName="min-h-32"
                  leftIcon={<L.FileText className="h-4 w-4" />}
                  label={t("providerDashboard.createEvent.fields.description")}
                />
              </div>
            )}

            {activeStep === 2 && (
              <div className="grid gap-5 md:grid-cols-2">
                <FloatingInputField
                  type="date"
                  name="startDate"
                  control={formRhf.control}
                  leftIcon={<L.CalendarDays className="h-4 w-4" />}
                  label={t("providerDashboard.createEvent.fields.startDate")}
                />

                <FloatingInputField
                  type="date"
                  name="endDate"
                  control={formRhf.control}
                  leftIcon={<L.CalendarDays className="h-4 w-4" />}
                  label={t("providerDashboard.createEvent.fields.endDate")}
                />

                <FloatingInputField
                  type="time"
                  name="startTime"
                  control={formRhf.control}
                  leftIcon={<L.Clock className="h-4 w-4" />}
                  label={t("providerDashboard.createEvent.fields.startTime")}
                />

                <FloatingInputField
                  type="time"
                  name="endTime"
                  control={formRhf.control}
                  leftIcon={<L.Clock className="h-4 w-4" />}
                  label={t("providerDashboard.createEvent.fields.endTime")}
                />

                <FloatingSelectField
                  name="deliveryMode"
                  control={formRhf.control}
                  options={deliveryModeOptions}
                  label={t("providerDashboard.createEvent.fields.deliveryMode")}
                />

                <FloatingInputField
                  min={0}
                  type="number"
                  name="capacity"
                  control={formRhf.control}
                  leftIcon={<L.Users className="h-4 w-4" />}
                  label={t("providerDashboard.createEvent.fields.capacity")}
                />

                <FloatingInputField
                  name="location"
                  control={formRhf.control}
                  leftIcon={<L.MapPin className="h-4 w-4" />}
                  label={t("providerDashboard.createEvent.fields.location")}
                />

                <FloatingInputField
                  type="url"
                  name="onlineUrl"
                  control={formRhf.control}
                  leftIcon={<L.Globe2 className="h-4 w-4" />}
                  label={t("providerDashboard.createEvent.fields.onlineUrl")}
                />
              </div>
            )}

            {activeStep === 3 && (
              <div className="grid gap-5 md:grid-cols-2">
                <div className="flex items-center justify-between rounded-3xl border border-glass-border bg-background/45 p-4 md:col-span-2">
                  <div>
                    <p className="font-medium">
                      {t("providerDashboard.createEvent.fields.freeEvent")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("providerDashboard.createEvent.fields.freeEventHint")}
                    </p>
                  </div>
                  <Switch
                    checked={form.isFree}
                    onCheckedChange={toggleFreeEvent}
                  />
                </div>

                <FloatingInputField
                  min={0}
                  step="0.01"
                  name="price"
                  type="number"
                  disabled={form.isFree}
                  control={formRhf.control}
                  leftIcon={<L.DollarSign className="h-4 w-4" />}
                  label={t("providerDashboard.createEvent.fields.price")}
                />

                <FloatingInputField
                  min={0}
                  step="0.5"
                  name="pdu"
                  type="number"
                  control={formRhf.control}
                  leftIcon={<L.FileText className="h-4 w-4" />}
                  label={t("providerDashboard.createEvent.fields.pdu")}
                />

                <FloatingSelectField
                  name="pduCategory"
                  control={formRhf.control}
                  options={pduCategoryOptions}
                  label={t("providerDashboard.createEvent.fields.pduCategory")}
                />

                <FloatingInputField
                  min={0}
                  max={100}
                  type="number"
                  name="earlyBirdDiscount"
                  control={formRhf.control}
                  leftIcon={<L.Tag className="h-4 w-4" />}
                  label={t(
                    "providerDashboard.createEvent.fields.earlyBirdDiscount",
                  )}
                />
              </div>
            )}

            {activeStep === 4 && (
              <div className="grid gap-5">
                <FloatingInputField
                  type="url"
                  name="imageUrl"
                  control={formRhf.control}
                  leftIcon={<L.ImageIcon className="h-4 w-4" />}
                  label={t("providerDashboard.createEvent.fields.imageUrl")}
                />

                <FloatingInputField
                  type="url"
                  name="promotionVideoUrl"
                  control={formRhf.control}
                  leftIcon={<L.MonitorPlay className="h-4 w-4" />}
                  label={t(
                    "providerDashboard.createEvent.fields.promotionVideoUrl",
                  )}
                />

                <FloatingInputField
                  name="speaker"
                  control={formRhf.control}
                  leftIcon={<L.UserRound className="h-4 w-4" />}
                  label={t("providerDashboard.createEvent.fields.speaker")}
                />

                <FloatingInputField
                  name="organizer"
                  control={formRhf.control}
                  leftIcon={<L.Users className="h-4 w-4" />}
                  label={t("providerDashboard.createEvent.fields.organizer")}
                />
              </div>
            )}
          </GlassCard>

          <GlassCard className="h-fit">
            <div className="flex items-center gap-2">
              <L.Eye className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-medium">
                {t("providerDashboard.createEvent.preview.title")}
              </h2>
            </div>

            <div className="mt-5 overflow-hidden rounded-3xl border border-glass-border">
              <div className="relative aspect-video overflow-hidden rounded-3xl bg-muted">
                {hasValidThumbnail ? (
                  <Image
                    fill
                    className="object-cover"
                    src={form.imageUrl.trim()}
                    alt={form.title || "Event thumbnail"}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center p-6 text-center text-sm text-muted-foreground">
                    {form.imageUrl
                      ? t("providerDashboard.createEvent.media.invalidImageUrl")
                      : t(
                          "providerDashboard.createEvent.media.thumbnailPlaceholder",
                        )}
                  </div>
                )}
              </div>

              <div className="space-y-3 p-5">
                <p className="text-xs font-medium text-primary">
                  {form.category}
                </p>
                <h3 className="text-xl font-medium">
                  {form.title ||
                    t("providerDashboard.createEvent.preview.untitled")}
                </h3>
                <p className="line-clamp-4 text-sm text-muted-foreground">
                  {form.description ||
                    t("providerDashboard.createEvent.preview.emptyDescription")}
                </p>
                <div className="flex justify-between text-sm font-medium">
                  <span>{form.pdu || 0} PDU</span>
                  <span>
                    {form.isFree
                      ? t("common.free")
                      : `${form.price || 0} ${form.currency}`}
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </F.Form>
    </div>
  );
};

export default ProviderCreateEventTab;
