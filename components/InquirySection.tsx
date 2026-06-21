type InquirySectionProps = {
  id?: string;
  compact?: boolean;
};

export function InquirySection({
  id = "inquiry",
  compact = false
}: InquirySectionProps) {
  return (
    <section className="section section--inquiry" id={id}>
      <div className="inquiry-shell">
        <div className="inquiry-copy">
          <p className="eyebrow">Private Route Inquiry</p>
          <h2>Plan a private way into China.</h2>
          <p>
            Tell us what kind of China you want to enter. We will shape the
            route, host, and local support around your curiosity.
          </p>
          {compact ? null : (
            <p className="fine-copy">
              This is a private intake, not an automated booking flow. A route
              should begin with context.
            </p>
          )}
        </div>

        <form className="inquiry-form" aria-label="Private route inquiry">
          <div className="field-pair">
            <label>
              <span>Name</span>
              <input name="name" type="text" autoComplete="name" />
            </label>
            <label>
              <span>Email</span>
              <input name="email" type="email" autoComplete="email" />
            </label>
          </div>

          <div className="field-pair">
            <label>
              <span>Where are you traveling from?</span>
              <input name="origin" type="text" autoComplete="country-name" />
            </label>
            <label>
              <span>Approximate timing</span>
              <input name="timing" type="text" />
            </label>
          </div>

          <div className="field-pair">
            <label>
              <span>Which China chapter are you interested in?</span>
              <select name="chapter" defaultValue="">
                <option value="" disabled>
                  Select one
                </option>
                <option value="shanxi">Shanxi</option>
                <option value="shaolin">Shaolin / Songshan</option>
                <option value="huizhou">Huizhou</option>
                <option value="not-sure">Not sure yet</option>
              </select>
            </label>
            <label>
              <span>Number of travelers</span>
              <input name="travelers" type="text" inputMode="numeric" />
            </label>
          </div>

          <label>
            <span>What kind of China do you want to enter?</span>
            <textarea name="curiosity" rows={4} />
          </label>

          <label>
            <span>Anything we should understand before shaping the route?</span>
            <textarea name="context" rows={4} />
          </label>

          <div className="inquiry-actions">
            <button className="button button--dark" type="button">
              Submit private route inquiry
            </button>
            <p>
              A quiet intake for travelers who want context before itinerary.
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}
