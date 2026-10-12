type TEditorialTextProps = {
  text: string;
  lang?: string;
  className?: string;
};

const PARAGRAPH_BREAK = /\n{2,}/;

const EditorialText = ({ text, lang, className }: TEditorialTextProps) => (
  <div lang={lang} className={className ?? "space-y-4"}>
    {text
      .split(PARAGRAPH_BREAK)
      .filter(Boolean)
      .map((paragraph, index) => (
        <p
          key={index}
          className="whitespace-pre-line leading-7 text-foreground/90"
        >
          {paragraph}
        </p>
      ))}
  </div>
);

export default EditorialText;
