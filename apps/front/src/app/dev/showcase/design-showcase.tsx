"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { TableBody, TableCell, TableHead } from "@/components/ui/table";
import { CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SwatchProps = {
  token: string;
  note?: string;
  reference: string;
  className: string;
};

const Swatch = ({ token, reference, className, note }: SwatchProps) => (
  <div className="flex flex-col gap-2">
    <div
      className={`h-16 rounded-md border ${className}`}
      role="img"
      aria-label={`${token}, reference ${reference}`}
    />
    <div className="text-xs">
      <p className="font-semibold text-foreground">{token}</p>
      <p className="text-muted-foreground">{reference}</p>
      {note ? <p className="text-muted-foreground">{note}</p> : null}
    </div>
  </div>
);

type SectionProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

const Section = ({ title, description, children }: SectionProps) => (
  <section className="flex flex-col gap-4">
    <div>
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
    {children}
  </section>
);

const categoricalSeries = [
  { token: "--chart-1", reference: "#1F1F8E", className: "bg-chart-1" },
  { token: "--chart-2", reference: "#2563EB", className: "bg-chart-2" },
  { token: "--chart-3", reference: "#0F766E", className: "bg-chart-3" },
  { token: "--chart-4", reference: "#7C3AED", className: "bg-chart-4" },
  { token: "--chart-5", reference: "#C65F00", className: "bg-chart-5" },
  { token: "--chart-6", reference: "#BE185D", className: "bg-chart-6" },
  { token: "--chart-7", reference: "#0369A1", className: "bg-chart-7" },
  { token: "--chart-8", reference: "#475569", className: "bg-chart-8" },
];

const semanticSlots = [
  {
    key: "completed",
    label: "Completed",
    className: "bg-chart-semantic-success",
    reference: "#15803D",
  },
  {
    key: "onTrack",
    label: "On track",
    className: "bg-chart-semantic-on-track",
    reference: "#1F1F8E",
  },
  {
    key: "atRisk",
    label: "At risk",
    className: "bg-chart-semantic-warning",
    reference: "#B45309",
  },
  {
    key: "critical",
    label: "Critical",
    className: "bg-chart-semantic-danger",
    reference: "#DC2626",
  },
  {
    key: "notStarted",
    label: "Not started",
    className: "bg-chart-semantic-neutral",
    reference: "#64748B",
  },
];

export const DesignShowcase = () => (
  <main className="mx-auto flex max-w-5xl flex-col gap-12 bg-background px-4 py-10 md:px-6">
    <header>
      <h1 className="text-3xl font-bold text-foreground">
        Design foundation showcase
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Every surface below is the product canvas: white, with colour reserved
        for navigation, the primary action and real status.
      </p>
    </header>

    <Section
      title="Canvas and text"
      description="Body text clears 4.5:1 and secondary text clears 4.83:1 on white."
    >
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Swatch
          token="--background"
          reference="#FFFFFF"
          className="bg-background"
        />
        <Swatch token="--card" reference="#FFFFFF" className="bg-card" />
        <Swatch
          token="--foreground"
          reference="#424242"
          className="bg-foreground"
        />
        <Swatch
          token="--muted-foreground"
          reference="#6B7280"
          className="bg-muted-foreground"
        />
      </div>
    </Section>

    <Section
      title="Brand"
      description="Primary carries the sidebar and the main action. Orange is a filled surface or a mark, never body text on white."
    >
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Swatch token="--primary" reference="#1F1F8E" className="bg-primary" />
        <Swatch
          token="--primary-hover"
          reference="#18187A"
          className="bg-primary-hover"
        />
        <Swatch
          token="--brand-orange"
          reference="#F07915"
          className="bg-brand-orange"
          note="Surface only — 2.82:1"
        />
        <Swatch
          token="--brand-orange-text"
          reference="#B45309"
          className="bg-brand-orange-text"
          note="Orange text on white"
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-md bg-brand-orange px-3 py-1 text-sm font-semibold text-brand-orange-foreground">
          Dark text on orange
        </span>
        <span className="text-sm font-semibold text-brand-orange-text">
          Orange text on white
        </span>
      </div>
    </Section>

    <Section
      title="Focus"
      description="The focus ring is the same blue as the sidebar, so anything sitting on a primary surface focuses in white instead."
    >
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex-1 rounded-lg border p-4">
          <p className="mb-3 text-sm text-muted-foreground">
            On white — uses --ring
          </p>
          <Button variant="outline">Tab to me</Button>
        </div>
        <div className="flex-1 rounded-lg bg-primary p-4">
          <p className="mb-3 text-sm text-primary-foreground">
            On primary — uses --ring-on-primary
          </p>
          <button
            type="button"
            className="rounded-md border border-primary-foreground/40 px-4 py-2 text-sm font-semibold text-primary-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring-on-primary focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
          >
            Tab to me
          </button>
        </div>
      </div>
    </Section>

    <Section
      title="Buttons"
      description="Default, outline, secondary, ghost and destructive. Gradient variants are retired in phase 3, once their consumers reach zero."
    >
      <div className="flex flex-wrap gap-3">
        <Button>Default</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
        <Button disabled>Disabled</Button>
      </div>
    </Section>

    <Section
      title="Form controls"
      description="White surfaces, a visible input border, and an error state that pairs colour with text."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="showcase-name">Full name</Label>
          <Input id="showcase-name" placeholder="Ada Lovelace" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="showcase-email">Email</Label>
          <Input
            id="showcase-email"
            aria-invalid
            aria-describedby="showcase-email-error"
            defaultValue="not-an-email"
          />
          <p
            id="showcase-email-error"
            className="text-sm font-medium text-destructive"
          >
            Enter a valid email address.
          </p>
        </div>
        <div className="flex flex-col gap-2 md:col-span-2">
          <Label htmlFor="showcase-notes">Notes</Label>
          <Textarea id="showcase-notes" placeholder="Optional" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="showcase-disabled">Disabled</Label>
          <Input id="showcase-disabled" disabled defaultValue="Read only" />
        </div>
      </div>
    </Section>

    <Section
      title="Status"
      description="Colour never carries the meaning alone: every status keeps its label."
    >
      <div className="flex flex-wrap gap-3">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="destructive">Destructive</Badge>
        <span className="rounded-full bg-success-soft px-3 py-1 text-xs font-semibold text-success-soft-foreground">
          Compliant
        </span>
        <span className="rounded-full bg-warning-soft px-3 py-1 text-xs font-semibold text-warning-soft-foreground">
          At risk
        </span>
        <span className="rounded-full bg-destructive-soft px-3 py-1 text-xs font-semibold text-destructive-soft-foreground">
          Non-compliant
        </span>
      </div>
      <div className="flex flex-wrap gap-3">
        <span className="rounded-md bg-success px-3 py-1 text-sm font-semibold text-success-foreground">
          Success
        </span>
        <span className="rounded-md bg-warning px-3 py-1 text-sm font-semibold text-warning-foreground">
          Warning
        </span>
        <span className="rounded-md bg-destructive px-3 py-1 text-sm font-semibold text-destructive-foreground">
          Destructive
        </span>
      </div>
    </Section>

    <Section
      title="Chart palette"
      description="Categorical slots carry no inherent good or bad. Semantic slots are chosen by the data's key, never by array index."
    >
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {categoricalSeries.map((series) => (
          <Swatch
            key={series.token}
            token={series.token}
            reference={series.reference}
            className={series.className}
          />
        ))}
      </div>
      <ul className="flex flex-wrap gap-4">
        {semanticSlots.map((slot) => (
          <li key={slot.key} className="flex items-center gap-2 text-sm">
            <span
              aria-hidden
              className={`size-4 rounded-sm ${slot.className}`}
            />
            <span className="font-medium text-foreground">{slot.label}</span>
            <span className="text-muted-foreground">{slot.reference}</span>
          </li>
        ))}
      </ul>
      <div className="max-w-md">
        <p className="mb-2 text-sm text-muted-foreground">
          Progress uses --chart-1 on --chart-track, with the value in text so
          the track never carries meaning alone.
        </p>
        <Progress value={62} aria-label="Example progress: 62 percent" />
        <p className="mt-1 text-sm font-semibold text-foreground">62%</p>
      </div>
    </Section>

    <Section
      title="Card, tabs and table"
      description="Cards sit at 12px with a thin border and a light shadow."
    >
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="pt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Active members</CardTitle>
                <CardDescription>Across every department</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">1,284</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Loading</CardTitle>
                <CardDescription>Skeleton on white</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="members" className="pt-4">
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Ada Lovelace</TableCell>
                  <TableCell>Engineering</TableCell>
                  <TableCell>
                    <span className="rounded-full bg-success-soft px-2 py-1 text-xs font-semibold text-success-soft-foreground">
                      Compliant
                    </span>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Grace Hopper</TableCell>
                  <TableCell>Operations</TableCell>
                  <TableCell>
                    <span className="rounded-full bg-warning-soft px-2 py-1 text-xs font-semibold text-warning-soft-foreground">
                      At risk
                    </span>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </Section>

    <Section
      title="Dialog"
      description="A white panel with a plain backdrop — no heavy blur."
    >
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Open dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove member</DialogTitle>
            <DialogDescription>
              This removes the member from every group they belong to.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline">Cancel</Button>
            <Button variant="destructive">Remove</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Section>
  </main>
);
