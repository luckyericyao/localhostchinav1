import Image from "next/image";

export type CulturalImageItem = {
  alt: string;
  copy: string;
  src: string;
  title: string;
};

type CulturalImageLayerProps = {
  body: string;
  eyebrow: string;
  items: readonly CulturalImageItem[];
  title: string;
  tone?: "dark" | "paper";
};

export function CulturalImageLayer({
  body,
  eyebrow,
  items,
  title,
  tone = "paper"
}: CulturalImageLayerProps) {
  return (
    <section className={`section cultural-layer cultural-layer--${tone}`}>
      <div className="section-heading section-heading--center">
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <p>{body}</p>
      </div>
      <div className={`cultural-layer-grid cultural-layer-grid--${items.length}`}>
        {items.map((item, index) => (
          <article
            className={`cultural-layer-card${
              index === 0 ? " cultural-layer-card--featured" : ""
            }`}
            key={item.src}
          >
            <div className="cultural-layer-media">
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes={
                  index === 0
                    ? "(min-width: 900px) 48vw, 100vw"
                    : "(min-width: 900px) 24vw, 100vw"
                }
              />
            </div>
            <div className="cultural-layer-copy">
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
