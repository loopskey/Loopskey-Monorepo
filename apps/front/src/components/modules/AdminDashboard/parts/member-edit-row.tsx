import { OrganizationMemberStatus } from "@/lib/graphql/generated";
import { TMemberEditRow } from "@/types/admin-dashboard.types";
import { numberValue } from "@/utils/function-helper";
import { useState } from "react";
import { Button } from "@ui/button";
import { Input } from "@ui/input";

import * as S from "@ui/select";

export const MemberEditRow = ({
  t,
  item,
  onSave,
  onCancel,
  departments,
}: TMemberEditRow) => {
  const [form, setForm] = useState({
    status: item.status,
    jobRole: item.jobRole ?? "",
    pdus: String(item.pdus ?? 0),
    departmentId: item.departmentId ?? "",
    compliance: String(item.compliance ?? 0),
    completedLearning: String(item.completedLearning ?? 0),
  });

  return (
    <tr className="bg-primary/5">
      <td colSpan={8} className="p-4">
        <div className="grid gap-3 rounded-3xl border border-glass-border bg-background/70 p-4 md:grid-cols-3">
          <Input
            value={form.jobRole}
            placeholder={t("adminDashboard.organizationUsers.members.role")}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, jobRole: event.target.value }))
            }
          />

          <S.Select
            value={form.status}
            onValueChange={(value) =>
              setForm((prev) => ({
                ...prev,
                status: value as OrganizationMemberStatus,
              }))
            }
          >
            <S.SelectTrigger className="rounded-2xl">
              <S.SelectValue />
            </S.SelectTrigger>
            <S.SelectContent>
              {Object.values(OrganizationMemberStatus).map((status) => (
                <S.SelectItem key={status} value={status}>
                  {status}
                </S.SelectItem>
              ))}
            </S.SelectContent>
          </S.Select>

          <S.Select
            value={form.departmentId || "none"}
            onValueChange={(value) =>
              setForm((prev) => ({
                ...prev,
                departmentId: value === "none" ? "" : value,
              }))
            }
          >
            <S.SelectTrigger className="rounded-2xl">
              <S.SelectValue
                placeholder={t(
                  "adminDashboard.organizationUsers.members.department",
                )}
              />
            </S.SelectTrigger>
            <S.SelectContent>
              <S.SelectItem value="none">
                {t("adminDashboard.organizationUsers.members.noDepartment")}
              </S.SelectItem>

              {departments.map((department) => (
                <S.SelectItem key={department.id} value={department.id}>
                  {department.title}
                </S.SelectItem>
              ))}
            </S.SelectContent>
          </S.Select>

          <Input
            type="number"
            value={form.pdus}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, pdus: event.target.value }))
            }
          />

          <Input
            type="number"
            value={form.compliance}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, compliance: event.target.value }))
            }
          />

          <Input
            type="number"
            value={form.completedLearning}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                completedLearning: event.target.value,
              }))
            }
          />

          <div className="flex gap-2 md:col-span-3">
            <Button
              radius="xl"
              variant="brand"
              type="button"
              onClick={() =>
                onSave({
                  memberId: item.id,
                  status: form.status,
                  pdus: numberValue(form.pdus),
                  compliance: numberValue(form.compliance),
                  jobRole: form.jobRole.trim() || undefined,
                  departmentId: form.departmentId || undefined,
                  completedLearning: numberValue(form.completedLearning),
                })
              }
            >
              {t("common.save")}
            </Button>

            <Button
              radius="xl"
              type="button"
              variant="glass"
              onClick={onCancel}
            >
              {t("common.cancel")}
            </Button>
          </div>
        </div>
      </td>
    </tr>
  );
};
