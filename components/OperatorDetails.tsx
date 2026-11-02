import { publicOperator } from "@/lib/operator";

export function OperatorDetails() {
  const operator = publicOperator(process.env);
  if (!operator) return null;
  return (
    <section className="section section--stone" aria-labelledby="operator-heading">
      <div className="section-heading">
        <p className="eyebrow">Your Point of Contact</p>
        <h2 id="operator-heading">{operator.name}</h2>
      </div>
      <div className="editorial-copy">
        {operator.bio ? <p>{operator.bio}</p> : null}
        <a className="text-link" href={`mailto:${operator.contact}`}>{operator.contact}</a>
      </div>
    </section>
  );
}
