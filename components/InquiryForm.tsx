"use client";

import { FormEvent, useMemo, useState } from "react";

type InquiryState = {
  name: string;
  email: string;
  origin: string;
  timing: string;
  role: string;
  route: string;
  curiosity: string;
  budget: string;
};

type InquiryErrors = Partial<Record<keyof InquiryState, string>>;

const initialState: InquiryState = {
  name: "",
  email: "",
  origin: "",
  timing: "",
  role: "",
  route: "",
  curiosity: "",
  budget: ""
};

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

const roleOptions = ["Traveler", "Host", "Partner"];

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function InquiryForm() {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState<InquiryErrors>({});
  const [prepared, setPrepared] = useState(false);

  const preparedSummary = useMemo(
    () =>
      [
        values.name,
        values.email,
        values.origin,
        values.timing,
        values.role,
        values.route
      ]
        .filter(Boolean)
        .join(" / "),
    [values]
  );

  function updateField(field: keyof InquiryState, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
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
    if (!values.origin.trim()) nextErrors.origin = "Please share where you are from.";
    if (!values.timing.trim()) nextErrors.timing = "Please share your timing.";
    if (!values.role) nextErrors.role = "Please choose one.";
    if (!values.route) nextErrors.route = "Please choose a route.";
    if (!values.curiosity.trim()) {
      nextErrors.curiosity = "Please tell us what you want to understand.";
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
    <form className="inquiry-form" aria-label="Private route inquiry" onSubmit={handleSubmit}>
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
          <span>Where are you from?</span>
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
          <span>When are you considering China?</span>
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

      <div className="field-pair">
        <label>
          <span>I am a</span>
          <select
            aria-invalid={Boolean(errors.role)}
            name="role"
            onChange={(event) => updateField("role", event.target.value)}
            value={values.role}
          >
            <option value="" disabled>
              Select one
            </option>
            {roleOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.role ? <small className="field-error">{errors.role}</small> : null}
        </label>
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

      <div className="inquiry-actions">
        <button className="button button--dark" type="submit">
          Prepare Private Route Inquiry
        </button>
        <p>A quiet intake for travelers, hosts, and partners who want context first.</p>
      </div>

      {prepared ? (
        <div className="form-status form-status--success" role="status">
          <strong>Inquiry prepared.</strong>
          <p>
            Your details are ready for review: {preparedSummary}. No message has
            been sent yet because a secure submission channel is not connected in
            this build.
          </p>
        </div>
      ) : null}
    </form>
  );
}
