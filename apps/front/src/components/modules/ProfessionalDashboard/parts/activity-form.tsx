import { PduCategory, PduSource } from "@/lib/graphql/generated";
import { FormEvent, useState } from "react";
import { PDU_CATEGORIES } from "@modules/ProfessionalDashboard/parts/target-form";
import { TActiveForm } from "@/types/professional-dashboard.types";
import { Textarea } from "@ui/textarea";
import { useI18n } from "@/hooks/useI18n";
import { Loader2 } from "lucide-react";
import { notify } from "@/hooks/notify";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Label } from "@ui/label";

import * as S from "@ui/select";

const PDU_SOURCES = [
  PduSource.Event,
  PduSource.Other,
  PduSource.Course,
  PduSource.Youtube,
  PduSource.Podcast,
  PduSource.Webinar,
  PduSource.Workshop,
];

export const ActivityForm = ({ isLoading, onSubmit }: TActiveForm) => {
  const { t } = useI18n();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [pdus, setPdus] = useState("1");
  const [category, setCategory] = useState<PduCategory>(PduCategory.Technical);
  const [source, setSource] = useState<PduSource>(PduSource.Other);
  const [description, setDescription] = useState("");

  const submitHandler = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) {
      notify.error(
        t("professionalDashboard.pduReport.activityDialog.titleRequired"),
      );
      return;
    }
    await onSubmit({
      date,
      source,
      category,
      pdus: Number(pdus),
      title: title.trim(),
      description: description.trim() || undefined,
    });
  };

  return (
    <form className="space-y-5" onSubmit={submitHandler}>
      <div className="space-y-2">
        <Label>
          {t("professionalDashboard.pduReport.activityDialog.activityTitle")}
        </Label>
        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="h-12 rounded-2xl bg-background/60"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label>
            {t("professionalDashboard.pduReport.activityDialog.date")}
          </Label>
          <Input
            type="date"
            value={date}
            className="h-12 rounded-2xl bg-background/60"
            onChange={(event) => setDate(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>
            {t("professionalDashboard.pduReport.activityDialog.pdus")}
          </Label>
          <Input
            min={0}
            step="0.5"
            type="number"
            value={pdus}
            onChange={(event) => setPdus(event.target.value)}
            className="h-12 rounded-2xl bg-background/60"
          />
        </div>

        <div className="space-y-2">
          <Label>
            {t("professionalDashboard.pduReport.activityDialog.source")}
          </Label>
          <S.Select
            value={source}
            onValueChange={(value) => setSource(value as PduSource)}
          >
            <S.SelectTrigger className="h-12 rounded-2xl bg-background/60">
              <S.SelectValue />
            </S.SelectTrigger>
            <S.SelectContent>
              {PDU_SOURCES.map((item) => (
                <S.SelectItem key={item} value={item}>
                  {item}
                </S.SelectItem>
              ))}
            </S.SelectContent>
          </S.Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>
          {t("professionalDashboard.pduReport.activityDialog.category")}
        </Label>
        <S.Select
          value={category}
          onValueChange={(value) => setCategory(value as PduCategory)}
        >
          <S.SelectTrigger className="h-12 rounded-2xl bg-background/60">
            <S.SelectValue />
          </S.SelectTrigger>
          <S.SelectContent>
            {PDU_CATEGORIES.map((item) => (
              <S.SelectItem key={item} value={item}>
                {item}
              </S.SelectItem>
            ))}
          </S.SelectContent>
        </S.Select>
      </div>

      <div className="space-y-2">
        <Label>
          {t("professionalDashboard.pduReport.activityDialog.description")}
        </Label>
        <Textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="min-h-28 rounded-2xl bg-background/60"
        />
      </div>
      <Button
        radius="xl"
        type="submit"
        variant="brand"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {t("professionalDashboard.pduReport.activityDialog.save")}
      </Button>
    </form>
  );
};
