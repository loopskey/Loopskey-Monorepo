import { FormEvent, useState } from "react";
import { PDU_CATEGORIES } from "@/utils/pdu.constant";
import { TTargetForm } from "@/types/professional-dashboard.types";
import { Loader2 } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Label } from "@ui/label";

import * as GQL from "@/lib/graphql/generated";
import * as S from "@ui/select";

export const TargetForm = ({ year, isLoading, onSubmit }: TTargetForm) => {
  const { t } = useI18n();
  const [category, setCategory] = useState<GQL.PduCategory>(
    GQL.PduCategory.Technical,
  );
  const [target, setTarget] = useState("10");

  const submitHandler = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit({
      year,
      category,
      target: Number(target),
    });
  };

  return (
    <form className="space-y-5" onSubmit={submitHandler}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>
            {t("professionalDashboard.cpdPduTracker.targetsDialog.category")}
          </Label>
          <S.Select
            value={category}
            onValueChange={(value) => setCategory(value as GQL.PduCategory)}
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
            {t("professionalDashboard.cpdPduTracker.targetsDialog.target")}
          </Label>
          <Input
            min={0}
            step="0.5"
            type="number"
            value={target}
            className="h-12 rounded-2xl bg-background/60"
            onChange={(event) => setTarget(event.target.value)}
          />
        </div>
      </div>

      <Button
        radius="xl"
        variant="brand"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {t("professionalDashboard.cpdPduTracker.targetsDialog.save")}
      </Button>
    </form>
  );
};
