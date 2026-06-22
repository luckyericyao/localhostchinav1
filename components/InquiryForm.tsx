"use client";

import { FormEvent, useMemo, useState } from "react";

type InquiryRole = "Traveler" | "Host" | "Partner";

type InquiryState = {
  name: string;
  email: string;
  origin: string;
  timing: string;
  role: InquiryRole;
  route: string;
  curiosity: string;
  budget: string;
  travelers: string;
  tripLength: string;
  travelStyle: string;
  supportNeeded: string;
  hostRegion: string;
  languages: string;
  knowledgeAreas: string;
  availabilityStyle: string;
  hostMotivation: string;
  hostedBefore: string;
  organization: string;
  partnershipType: string;
  partnerRegion: string;
  buildIntent: string;
};

type InquiryErrors = Partial<Record<keyof InquiryState, string>>;

const initialState: InquiryState = {
  name: "",
  email: "",
  origin: "",
  timing: "",
  role: "Traveler",
  route: "",
  curiosity: "",
  budget: "",
  travelers: "",
  tripLength: "",
  travelStyle: "",
  supportNeeded: "",
  hostRegion: "",
  languages: "",
  knowledgeAreas: "",
  availabilityStyle: "",
  hostMotivation: "",
  hostedBefore: "",
  organization: "",
  partnershipType: "",
  partnerRegion: "",
  buildIntent: ""
};

const roleCards: Array<{ role: InquiryRole; title: string; copy: string }> = [
  {
    role: "Traveler",
    title: "I am a Traveler",
    copy: "I want a private route, host fit, and quiet support in China."
  },
  {
    role: "Host",
    title: "I am a Host",
    copy: "I can represent a city, region, or cultural field with care."
  },
  {
    role: "Partner",
    title: "I am a Partner",
    copy: "I want to build a chapter, relationship, or local collaboration."
  }
];

const routeOptions = [
  "Shanxi",
  "Shaolin",
  "Huizhou",
  "Shanghai",
  "Beijing",
  "Chengdu",
  "Not sure yet"
];

const budgetOptions = [
  "Essential private support",
  "High-comfort private travel",
  "Fully bespoke",
  "Not sure yet"
];

const travelStyleOptions = [
  "Slow cultural route",
  "High-comfort private travel",
  "Family or private group",
  "Founder / executive rhythm",
  "Returning diaspora",
  "Not sure yet"
];

const supportOptions = [
  "Route advisory",
  "Hosted private route",
  "Fully held China chapter",
  "Payment / apps / language support",
  "Food and local rhythm",
  "Not sure yet"
];

const availabilityOptions = [
  "Occasional hosting",
  "Weekend or evening hosting",
  "Specialist-only hosting",
  "Chapter-building role",
  "Not sure yet"
];

const hostedBeforeOptions = [
  "Yes, often",
  "Yes, occasionally",
  "Not formally, but I host personally",
  "Not yet"
];

const partnershipOptions = [
  "Local chapter partner",
  "Hospitality partner",
  "Cultural institution",
  "Education / research",
  "Brand or private client work",
  "Not sure yet"
];

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function InquiryForm() {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState<InquiryErrors>({});
  const [prepared, setPrepared] = useState(false);

  const originLabel =
    values.role === "Traveler" ? "Where are you from?" : "Where are you based?";
  const timingLabel =
    values.role === "Traveler"
      ? "When are you considering China?"
      : "When would you like to begin the conversation?";

  const preparedSummary = useMemo(
    () =>
      [values.role, values.name, values.email, values.route || values.hostRegion || values.partnerRegion]
        .filter(Boolean)
        .join(" / "),
    [values]
  );

  function updateField(field: keyof InquiryState, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setPrepared(false);
  }

  function setRole(role: InquiryRole) {
    setValues((current) => ({ ...current, role }));
    setErrors({});
    setPrepared(false);
  }

  function validate() {
    const nextErrors: InquiryErrors = {};

    if (!values.name.trim()) nextErrors.name = "Please share your name.";
    if (!values.email.trim()) {
      nextErrors.email = "Please share an email.";
    } else if (!isValidEmail(values.email)) {
      nextErrors.email = "Please enter a valid email.";
    }
    if (!values.origin.trim()) nextErrors.origin = "Please share where you are based.";
    if (!values.timing.trim()) nextErrors.timing = "Please share a rough timing.";

    if (values.role === "Traveler") {
      if (!values.travelers.trim()) nextErrors.travelers = "Please share group size.";
      if (!values.tripLength.trim()) nextErrors.tripLength = "Please share a rough length.";
      if (!values.route) nextErrors.route = "Please choose a route.";
      if (!values.curiosity.trim()) {
        nextErrors.curiosity = "Please tell us what you want to understand.";
      }
    }

    if (values.role === "Host") {
      if (!values.hostRegion.trim()) nextErrors.hostRegion = "Please share your city or region.";
      if (!values.languages.trim()) nextErrors.languages = "Please share your languages.";
      if (!values.knowledgeAreas.trim()) {
        nextErrors.knowledgeAreas = "Please share your local knowledge areas.";
      }
      if (!values.hostMotivation.trim()) {
        nextErrors.hostMotivation = "Please tell us why you want to host.";
      }
    }

    if (values.role === "Partner") {
      if (!values.organization.trim()) nextErrors.organization = "Please share your organization.";
      if (!values.partnershipType) nextErrors.partnershipType = "Please choose a partnership type.";
      if (!values.partnerRegion.trim()) nextErrors.partnerRegion = "Please share the region.";
      if (!values.buildIntent.trim()) {
        nextErrors.buildIntent = "Please tell us what you want to build.";
      }
    }

    return nextErrors;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    setPrepared(Object.keys(nextErrors).length === 0);
  }

  return (
    <form className="inquiry-form" aria-label="Private Localhost inquiry" onSubmit={handleSubmit}>
      <div className="entry-path-grid" role="radiogroup" aria-label="Inquiry path">
        {roleCards.map((card) => (
          <button
            aria-checked={values.role === card.role}
            className="entry-path-card"
            key={card.role}
            onClick={() => setRole(card.role)}
            role="radio"
            type="button"
          >
            <strong>{card.title}</strong>
            <span>{card.copy}</span>
          </button>
        ))}
      </div>

      <div className="field-pair">
        <label>
          <span>Name</span>
          <input
            aria-invalid={Boolean(errors.name)}
            autoComplete="name"
            name="name"
            onChange={(event) => updateField("name", event.target.value)}
            type="text"
            value={values.name}
          />
          {errors.name ? <small className="field-error">{errors.name}</small> : null}
        </label>
        <label>
          <span>Email</span>
          <input
            aria-invalid={Boolean(errors.email)}
            autoComplete="email"
            name="email"
            onChange={(event) => updateField("email", event.target.value)}
            type="email"
            value={values.email}
          />
          {errors.email ? <small className="field-error">{errors.email}</small> : null}
        </label>
      </div>

      <div className="field-pair">
        <label>
          <span>{originLabel}</span>
          <input
            aria-invalid={Boolean(errors.origin)}
            autoComplete="country-name"
            name="origin"
            onChange={(event) => updateField("origin", event.target.value)}
            type="text"
            value={values.origin}
          />
          {errors.origin ? <small className="field-error">{errors.origin}</small> : null}
        </label>
        <label>
          <span>{timingLabel}</span>
          <input
            aria-invalid={Boolean(errors.timing)}
            name="timing"
            onChange={(event) => updateField("timing", event.target.value)}
            type="text"
            value={values.timing}
          />
          {errors.timing ? <small className="field-error">{errors.timing}</small> : null}
        </label>
      </div>

      {values.role === "Traveler" ? (
        <>
          <div className="field-pair">
            <label>
              <span>Number of travelers</span>
              <input
                aria-invalid={Boolean(errors.travelers)}
                inputMode="numeric"
                name="travelers"
                onChange={(event) => updateField("travelers", event.target.value)}
                type="text"
                value={values.travelers}
              />
              {errors.travelers ? <small className="field-error">{errors.travelers}</small> : null}
            </label>
            <label>
              <span>Approximate trip length</span>
              <input
                aria-invalid={Boolean(errors.tripLength)}
                name="tripLength"
                onChange={(event) => updateField("tripLength", event.target.value)}
                type="text"
                value={values.tripLength}
              />
              {errors.tripLength ? <small className="field-error">{errors.tripLength}</small> : null}
            </label>
          </div>

          <div className="field-pair">
            <label>
              <span>Travel style</span>
              <select
                name="travelStyle"
                onChange={(event) => updateField("travelStyle", event.target.value)}
                value={values.travelStyle}
              >
                <option value="">Select one if helpful</option>
                {travelStyleOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Support needed</span>
              <select
                name="supportNeeded"
                onChange={(event) => updateField("supportNeeded", event.target.value)}
                value={values.supportNeeded}
              >
                <option value="">Select one if helpful</option>
                {supportOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="field-pair">
            <label>
              <span>Which route interests you?</span>
              <select
                aria-invalid={Boolean(errors.route)}
                name="route"
                onChange={(event) => updateField("route", event.target.value)}
                value={values.route}
              >
                <option value="" disabled>
                  Select one
                </option>
                {routeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.route ? <small className="field-error">{errors.route}</small> : null}
            </label>
            <label>
              <span>Optional budget comfort level</span>
              <select
                name="budget"
                onChange={(event) => updateField("budget", event.target.value)}
                value={values.budget}
              >
                <option value="">Select one if helpful</option>
                {budgetOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label>
            <span>What kind of China do you want to understand?</span>
            <textarea
              aria-invalid={Boolean(errors.curiosity)}
              name="curiosity"
              onChange={(event) => updateField("curiosity", event.target.value)}
              rows={4}
              value={values.curiosity}
            />
            {errors.curiosity ? (
              <small className="field-error">{errors.curiosity}</small>
            ) : null}
          </label>
        </>
      ) : null}

      {values.role === "Host" ? (
        <>
          <div className="field-pair">
            <label>
              <span>City / region</span>
              <input
                aria-invalid={Boolean(errors.hostRegion)}
                name="hostRegion"
                onChange={(event) => updateField("hostRegion", event.target.value)}
                type="text"
                value={values.hostRegion}
              />
              {errors.hostRegion ? <small className="field-error">{errors.hostRegion}</small> : null}
            </label>
            <label>
              <span>Languages</span>
              <input
                aria-invalid={Boolean(errors.languages)}
                name="languages"
                onChange={(event) => updateField("languages", event.target.value)}
                type="text"
                value={values.languages}
              />
              {errors.languages ? <small className="field-error">{errors.languages}</small> : null}
            </label>
          </div>

          <div className="field-pair">
            <label>
              <span>Local knowledge areas</span>
              <input
                aria-invalid={Boolean(errors.knowledgeAreas)}
                name="knowledgeAreas"
                onChange={(event) => updateField("knowledgeAreas", event.target.value)}
                type="text"
                value={values.knowledgeAreas}
              />
              {errors.knowledgeAreas ? (
                <small className="field-error">{errors.knowledgeAreas}</small>
              ) : null}
            </label>
            <label>
              <span>Availability style</span>
              <select
                name="availabilityStyle"
                onChange={(event) => updateField("availabilityStyle", event.target.value)}
                value={values.availabilityStyle}
              >
                <option value="">Select one if helpful</option>
                {availabilityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label>
            <span>Have you hosted international visitors before?</span>
            <select
              name="hostedBefore"
              onChange={(event) => updateField("hostedBefore", event.target.value)}
              value={values.hostedBefore}
            >
              <option value="">Select one if helpful</option>
              {hostedBeforeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Why do you want to host?</span>
            <textarea
              aria-invalid={Boolean(errors.hostMotivation)}
              name="hostMotivation"
              onChange={(event) => updateField("hostMotivation", event.target.value)}
              rows={4}
              value={values.hostMotivation}
            />
            {errors.hostMotivation ? (
              <small className="field-error">{errors.hostMotivation}</small>
            ) : null}
          </label>
        </>
      ) : null}

      {values.role === "Partner" ? (
        <>
          <div className="field-pair">
            <label>
              <span>Organization</span>
              <input
                aria-invalid={Boolean(errors.organization)}
                name="organization"
                onChange={(event) => updateField("organization", event.target.value)}
                type="text"
                value={values.organization}
              />
              {errors.organization ? (
                <small className="field-error">{errors.organization}</small>
              ) : null}
            </label>
            <label>
              <span>Partnership type</span>
              <select
                aria-invalid={Boolean(errors.partnershipType)}
                name="partnershipType"
                onChange={(event) => updateField("partnershipType", event.target.value)}
                value={values.partnershipType}
              >
                <option value="" disabled>
                  Select one
                </option>
                {partnershipOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.partnershipType ? (
                <small className="field-error">{errors.partnershipType}</small>
              ) : null}
            </label>
          </div>

          <label>
            <span>City / region</span>
            <input
              aria-invalid={Boolean(errors.partnerRegion)}
              name="partnerRegion"
              onChange={(event) => updateField("partnerRegion", event.target.value)}
              type="text"
              value={values.partnerRegion}
            />
            {errors.partnerRegion ? (
              <small className="field-error">{errors.partnerRegion}</small>
            ) : null}
          </label>

          <label>
            <span>What do you want to build?</span>
            <textarea
              aria-invalid={Boolean(errors.buildIntent)}
              name="buildIntent"
              onChange={(event) => updateField("buildIntent", event.target.value)}
              rows={4}
              value={values.buildIntent}
            />
            {errors.buildIntent ? (
              <small className="field-error">{errors.buildIntent}</small>
            ) : null}
          </label>
        </>
      ) : null}

      <div className="inquiry-actions">
        <button className="button button--dark" type="submit">
          Prepare Localhost Inquiry
        </button>
        <p>No message is sent until a secure submission channel is connected.</p>
      </div>

      {prepared ? (
        <div className="form-status form-status--success" role="status">
          <strong>Inquiry prepared.</strong>
          <p>
            Your details are ready for review: {preparedSummary}. This build
            validates and prepares the inquiry. Backend submission is not yet
            connected.
          </p>
        </div>
      ) : null}
    </form>
  );
}
