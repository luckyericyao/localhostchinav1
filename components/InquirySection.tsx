type InquirySectionProps = {
  id?: string;
};

export function InquirySection({ id = "inquiry" }: InquirySectionProps) {
  return (
    <section className="section section--inquiry" id={id}>
      <div className="inquiry-shell">
        <div className="inquiry-copy">
          <p className="eyebrow">Private Route Inquiry</p>
          <h2>Plan a private way into China.</h2>
          <p>
            Tell us what kind of China you want to understand. We will shape
            the route, host, and local support around your curiosity.
          </p>
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
              <span>Where are you from?</span>
              <input name="origin" type="text" autoComplete="country-name" />
            </label>
            <label>
              <span>When are you considering China?</span>
              <input name="timing" type="text" />
            </label>
          </div>

          <label>
            <span>What kind of China do you want to understand?</span>
            <textarea name="curiosity" rows={5} />
          </label>

          <label>
            <span>I am a</span>
            <select name="role" defaultValue="">
              <option value="" disabled>
                Select one
              </option>
              <option value="traveler">Traveler</option>
              <option value="host">Host</option>
              <option value="partner">Partner</option>
            </select>
          </label>

          <div className="inquiry-actions">
            <button className="button button--dark" type="button">
              Request a Private Route
            </button>
            <p>
              A quiet intake for travelers, local hosts, and cultural partners.
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}
