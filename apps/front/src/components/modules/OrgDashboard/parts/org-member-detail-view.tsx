"use client";

import { OrganizationMemberStatus, Role } from "@lib/graphql/generated";
import { useOrganizationMembersTab } from "@/hooks/useOrgMemberTab";
import { FloatingTextareaField } from "@elements/floating-textarea";
import { FloatingSelectField } from "@elements/floating-select";
import { FloatingInputField } from "@elements/floating-input";
import { GlassCard } from "@elements/glass-card";
import { Progress } from "@ui/progress";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";
import { Form } from "@ui/form";

import * as S from "@ui/select";
import * as T from "@ui/tabs";
import * as L from "lucide-react";

type OrgMemberDetailViewProps = {
  hook: ReturnType<typeof useOrganizationMembersTab>;
};

export const OrgMemberDetailView = ({ hook }: OrgMemberDetailViewProps) => {
  const {
    t,
    notes,
    setNotes,
    saveNotes,
    isLoading,
    eventOptions,
    selectedMember,
    assignmentForm,
    assignLearning,
    updateMemberRole,
    closeMemberDetail,
    updateMemberStatus,
  } = hook;

  if (!selectedMember)
    return (
      <div className="space-y-6">
        <Button
          radius="xl"
          type="button"
          variant="glass"
          onClick={closeMemberDetail}
        >
          <L.ArrowLeft className="h-4 w-4" />
          {t("common.back")}
        </Button>
        <GlassCard>
          <div className="flex min-h-72 items-center justify-center text-sm text-muted-foreground">
            {t("common.loading")}
          </div>
        </GlassCard>
      </div>
    );
  const pduGoal = selectedMember.pduGoal ?? 60;
  const remainingPdus = Math.max(
    Number(pduGoal) - Number(selectedMember.pdus ?? 0),
    0,
  );

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <Button
            radius="xl"
            type="button"
            variant="glass"
            onClick={closeMemberDetail}
          >
            <L.ArrowLeft className="h-4 w-4" />
            {t("common.back")}
          </Button>

          <div className="mt-5">
            <p className="text-sm font-medium text-primary">
              {t("organizationDashboard.members.detail.title")}
            </p>

            <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
              {selectedMember.fullName ?? selectedMember.email}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="rounded-full">
                {selectedMember.status}
              </Badge>

              <Badge className="rounded-full">
                {Math.round(selectedMember.compliance)}%
              </Badge>

              <span className="text-sm text-muted-foreground">
                {selectedMember.email}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            radius="xl"
            type="button"
            variant="glass"
            disabled={isLoading}
            onClick={saveNotes}
          >
            <L.Save className="h-4 w-4" />
            {t("organizationDashboard.members.detail.saveNotes")}
          </Button>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <GlassCard>
            <div className="relative z-10">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                  <L.UserRound className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-xl font-medium">
                    {t("organizationDashboard.members.detail.settings")}
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedMember.email}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <GlassCard glow={false} className="p-5">
                  <p className="text-sm text-muted-foreground">
                    {t("organizationDashboard.members.detail.completed")}
                  </p>

                  <p className="mt-2 text-3xl font-semibold">
                    {selectedMember.completedLearning}
                  </p>
                </GlassCard>

                <GlassCard glow={false} className="p-5">
                  <p className="text-sm text-muted-foreground">
                    {t("organizationDashboard.members.detail.pdus")}
                  </p>

                  <p className="mt-2 text-3xl font-semibold">
                    {selectedMember.pdus}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {t("organizationDashboard.members.detail.goalRemaining", {
                      goal: pduGoal,
                      remaining: remainingPdus,
                    })}
                  </p>
                </GlassCard>

                <GlassCard glow={false} className="p-5">
                  <p className="text-sm text-muted-foreground">
                    {t("organizationDashboard.members.detail.compliance")}
                  </p>

                  <p className="mt-2 text-3xl font-semibold">
                    {Math.round(selectedMember.compliance)}%
                  </p>
                </GlassCard>
              </div>
            </div>
          </GlassCard>

          <T.Tabs defaultValue="settings" className="w-full">
            <div className="overflow-x-auto pb-1">
              <T.TabsList className="grid min-w-[640px] grid-cols-4 rounded-2xl md:min-w-0">
                <T.TabsTrigger value="settings">
                  {t("organizationDashboard.members.detail.tabs.settings")}
                </T.TabsTrigger>
                <T.TabsTrigger value="activity">
                  {t("organizationDashboard.members.detail.tabs.activity")}
                </T.TabsTrigger>
                <T.TabsTrigger value="assignment">
                  {t("organizationDashboard.members.detail.tabs.assignment")}
                </T.TabsTrigger>
                <T.TabsTrigger value="notes">
                  {t("organizationDashboard.members.detail.tabs.notes")}
                </T.TabsTrigger>
              </T.TabsList>
            </div>

            <T.TabsContent value="settings" className="mt-5">
              <div className="grid gap-4 md:grid-cols-2">
                <GlassCard glow={false} className="p-5">
                  <p className="font-medium">
                    {t(
                      "organizationDashboard.members.detail.complianceProgress",
                    )}
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {t(
                      "organizationDashboard.members.detail.complianceProgressHint",
                    )}
                  </p>

                  <Progress
                    className="mt-4"
                    value={selectedMember.compliance}
                  />

                  <p className="mt-2 text-sm text-muted-foreground">
                    {Math.round(selectedMember.compliance)}%
                  </p>
                </GlassCard>

                <GlassCard glow={false} className="p-5">
                  <p className="font-medium">
                    {t("organizationDashboard.members.detail.pduProgress")}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("organizationDashboard.members.detail.pduProgressHint")}
                  </p>
                  <Progress
                    className="mt-4"
                    value={selectedMember.pduProgress ?? 0}
                  />

                  <p className="mt-2 text-sm text-muted-foreground">
                    {selectedMember.pdus}/{pduGoal}
                  </p>
                </GlassCard>
              </div>

              <GlassCard glow={false} className="mt-5 p-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {t("organizationDashboard.members.detail.department")}
                    </p>
                    <p className="mt-2 font-medium">
                      {selectedMember.departmentTitle ?? "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {t("organizationDashboard.members.detail.jobRole")}
                    </p>
                    <p className="mt-2 font-medium">
                      {selectedMember.jobRole ?? "-"}
                    </p>
                  </div>
                </div>
              </GlassCard>
            </T.TabsContent>
            <T.TabsContent value="activity" className="mt-5">
              <GlassCard glow={false} className="p-5">
                <h3 className="font-medium">
                  {t("organizationDashboard.members.detail.history")}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("organizationDashboard.members.detail.historyHint")}
                </p>
                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl bg-background/45 p-4">
                    <p className="text-xs text-muted-foreground">
                      {t("organizationDashboard.members.detail.lastActivity")}
                    </p>
                    <p className="mt-1 font-medium">
                      {selectedMember.lastActivityAt ?? "-"}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-background/45 p-4">
                    <p className="text-xs text-muted-foreground">
                      {t("organizationDashboard.members.detail.lastCourse")}
                    </p>
                    <p className="mt-1 font-medium">
                      {selectedMember.lastCourseTitle ?? "-"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-background/45 p-4">
                    <p className="text-xs text-muted-foreground">
                      {t("organizationDashboard.members.detail.pduGoal")}
                    </p>

                    <p className="mt-1 font-medium">{pduGoal}</p>
                  </div>
                </div>
              </GlassCard>
            </T.TabsContent>

            <T.TabsContent value="assignment" className="mt-5">
              <GlassCard glow={false} className="p-5">
                <div className="mb-5 flex items-start gap-3">
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                    <L.Send className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">
                      {t(
                        "organizationDashboard.members.detail.tabs.assignment",
                      )}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t(
                        "organizationDashboard.members.detail.assignment.description",
                      )}
                    </p>
                  </div>
                </div>

                <Form {...assignmentForm}>
                  <form className="grid gap-4" onSubmit={assignLearning}>
                    <FloatingSelectField
                      name="eventId"
                      options={eventOptions}
                      control={assignmentForm.control}
                      label={t(
                        "organizationDashboard.members.detail.assignment.event",
                      )}
                    />

                    <FloatingInputField
                      type="date"
                      name="dueDate"
                      control={assignmentForm.control}
                      label={t(
                        "organizationDashboard.members.detail.assignment.dueDate",
                      )}
                    />

                    <FloatingTextareaField
                      name="description"
                      control={assignmentForm.control}
                      label={t(
                        "organizationDashboard.members.detail.assignment.description",
                      )}
                    />

                    <Button
                      radius="xl"
                      type="submit"
                      variant="brand"
                      disabled={isLoading}
                    >
                      <L.Send className="h-4 w-4" />
                      {t(
                        "organizationDashboard.members.detail.assignment.submit",
                      )}
                    </Button>
                  </form>
                </Form>
              </GlassCard>
            </T.TabsContent>

            <T.TabsContent value="notes" className="mt-5">
              <GlassCard glow={false} className="p-5">
                <p className="text-sm text-muted-foreground">
                  {t("organizationDashboard.members.detail.notesHint")}
                </p>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  className="mt-4 min-h-48 w-full rounded-2xl border border-border bg-background/60 p-4 outline-none focus:border-primary"
                />
                <Button
                  radius="xl"
                  variant="brand"
                  onClick={saveNotes}
                  disabled={isLoading}
                  className="mt-4"
                >
                  <L.Save className="h-4 w-4" />
                  {t("organizationDashboard.members.detail.saveNotes")}
                </Button>
              </GlassCard>
            </T.TabsContent>
          </T.Tabs>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <GlassCard className="h-fit">
            <div className="relative z-10">
              <h2 className="text-lg font-medium">
                {t("organizationDashboard.members.detail.settings")}
              </h2>

              <div className="mt-5 grid gap-4">
                <div className="rounded-3xl bg-background/45 p-4">
                  <p className="text-xs text-muted-foreground">
                    {t("organizationDashboard.members.detail.status")}
                  </p>
                  <S.Select
                    value={selectedMember.status}
                    onValueChange={(value) =>
                      updateMemberStatus(
                        selectedMember.id,
                        value as OrganizationMemberStatus,
                      )
                    }
                  >
                    <S.SelectTrigger className="mt-2 rounded-2xl">
                      <S.SelectValue />
                    </S.SelectTrigger>

                    <S.SelectContent>
                      {Object.values(OrganizationMemberStatus).map((item) => (
                        <S.SelectItem key={item} value={item}>
                          {item}
                        </S.SelectItem>
                      ))}
                    </S.SelectContent>
                  </S.Select>
                </div>

                <div className="rounded-3xl bg-background/45 p-4">
                  <p className="text-xs text-muted-foreground">
                    {t("organizationDashboard.members.detail.role")}
                  </p>

                  <S.Select
                    value={selectedMember.jobRole ?? Role.Professional}
                    onValueChange={(value) =>
                      updateMemberRole(selectedMember.id, value as Role)
                    }
                  >
                    <S.SelectTrigger className="mt-2 rounded-2xl">
                      <S.SelectValue />
                    </S.SelectTrigger>
                    <S.SelectContent>
                      <S.SelectItem value={Role.Professional}>
                        PROFESSIONAL
                      </S.SelectItem>
                      <S.SelectItem value={Role.Provider}>
                        PROVIDER
                      </S.SelectItem>
                    </S.SelectContent>
                  </S.Select>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="h-fit">
            <div className="relative z-10">
              <h2 className="text-lg font-medium">
                {t("organizationDashboard.members.detail.activity")}
              </h2>
              <div className="mt-5 grid gap-3 text-sm">
                <div className="flex items-center justify-between gap-3 rounded-2xl bg-background/45 p-3">
                  <span className="text-muted-foreground">
                    {t("organizationDashboard.members.detail.completed")}
                  </span>
                  <span className="font-semibold">
                    {selectedMember.completedLearning}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-2xl bg-background/45 p-3">
                  <span className="text-muted-foreground">
                    {t("organizationDashboard.members.detail.pdus")}
                  </span>
                  <span className="font-semibold">{selectedMember.pdus}</span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-2xl bg-background/45 p-3">
                  <span className="text-muted-foreground">
                    {t("organizationDashboard.members.detail.compliance")}
                  </span>
                  <span className="font-semibold">
                    {Math.round(selectedMember.compliance)}%
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>
        </aside>
      </section>
    </div>
  );
};
