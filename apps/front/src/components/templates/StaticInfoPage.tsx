import pages from "@/content/footer-static-pages.json";
import type { Metadata } from "next";

type PageKey = keyof typeof pages;
type Block = { type: "heading" | "paragraph" | "listItem"; text: string };

const EMAIL = "loopskey.dev@gmail.com";

const renderText = (text: string) => {
  const index = text.indexOf(EMAIL);
  if (index === -1) return text;

  return (
    <>
      {text.slice(0, index)}
      <a className="font-medium text-primary hover:underline" href={`mailto:${EMAIL}`}>
        {EMAIL}
      </a>
      {text.slice(index + EMAIL.length)}
    </>
  );
};

export const StaticInfoPage = ({ pageKey, embedded = false }: { pageKey: PageKey; embedded?: boolean }) => {
  const page = pages[pageKey];
  const blocks = page.blocks as Block[];
  const Root = embedded ? "section" : "main";

  return (
    <Root className="relative overflow-hidden px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.12),transparent_34%),radial-gradient(circle_at_bottom_right,hsl(var(--accent)/0.1),transparent_32%)]" />
      <article className="mx-auto max-w-4xl rounded-[2rem] border border-glass-border bg-background/70 p-6 shadow-xl backdrop-blur-xl sm:p-10 lg:p-14">
        <h1 className="text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
          {page.title}
        </h1>

        <div className="mt-10 space-y-5 text-base leading-8 text-muted-foreground">
          {blocks.map((block, index) => {
            if (block.type === "heading") {
              return (
                <h2 key={`${block.text}-${index}`} className="pt-5 text-2xl font-semibold text-foreground">
                  {block.text}
                </h2>
              );
            }
            if (block.type === "listItem") {
              return (
                <ul key={`${block.text}-${index}`} className="list-disc pl-6 marker:text-primary">
                  <li>{renderText(block.text)}</li>
                </ul>
              );
            }
            return <p key={`${block.text}-${index}`}>{renderText(block.text)}</p>;
          })}
        </div>
      </article>
    </Root>
  );
};

export const getStaticInfoMetadata = (pageKey: PageKey): Metadata => {
  const page = pages[pageKey];
  const descriptionBlock = page.blocks.find(
    (block) => block.type === "paragraph",
  );

  return {
    title: `${page.title} | LoopsKey`,
    description: descriptionBlock?.text,
  };
};

export type { PageKey };
