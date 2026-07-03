"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import {
  submitLocalhostInquiry,
  type LocalhostIntentType,
  type LocalhostInquiryResult,
  type LocalhostRouteContext
} from "@/app/actions/submitLocalhostInquiry";

type LocalhostIntakeFormProps = {
  compact?: boolean;
  contextLocked?: boolean;
  defaultMessage?: string;
  embedded?: boolean;
  intentType?: LocalhostIntentType;
  routeContext?: LocalhostRouteContext;
  showRoleTabs?: boolean;
  sourceLabel?: string;
  sourcePage?: string;
};

type DetailField = {
  helper?: string;
  label: string;
  name: string;
  options?: string[];
  placeholder?: string;
  type?: "input" | "select" | "textarea";
};

const routeLabels: Record<LocalhostRouteContext, string> = {
  beijing: "Beijing",
  "china-general": "China general",
  chengdu: "Chengdu",
  huizhou: "Huizhou",
  shanghai: "Shanghai",
  shanxi: "Shanxi",
  shaolin: "Shaolin"
};

const roleCopy: Record<LocalhostIntentType, { helper: string; label: string }> = {
  host: {
    helper: "Share the place, field, or local world you can represent with care.",
    label: "What place, city, field, or local world could you help someone enter?"
  },
  partner: {
    helper: "Share the route, relationship, or collaboration you want to explore.",
    label: "What kind of route, relationship, or collaboration are you considering?"
  },
  traveler: {
    helper: "One sentence is enough: what kind of China do you want to understand?",
    label: "What kind of China do you want to understand?"
  }
};

const travelerDetails: DetailField[] = [
  { label: "Name", name: "name", placeholder: "Your name" },
  {
    helper: "City and country are enough.",
    label: "Where are you from?",
    name: "origin",
    placeholder: "London, UK / New York, USA / Singapore"
  },
  {
    helper: "A month, season, or rough window is fine.",
    label: "When are you considering China?",
    name: "timing",
    placeholder: "October 2026, spring, or not sure yet"
  },
  {
    helper: "Include children or private group size if relevant.",
    label: "Number of travelers",
    name: "travelers",
    placeholder: "Solo, 2 adults, family of 4"
  },
  {
    helper: "Total China time or time for this route both work.",
    label: "Trip length",
    name: "tripLength",
    placeholder: "3 to 5 days, one week, or flexible"
  },
  {
    helper: "Choose a route if one already feels right.",
    label: "Route interest",
    name: "routeInterest",
    options: ["Shanxi", "Shaolin", "Huizhou", "Shanghai", "Beijing", "Chengdu", "Not sure yet"],
    type: "select"
  },
  {
    helper: "This helps us read pace and expectations.",
    label: "Travel style",
    name: "travelStyle",
    options: [
      "Slow cultural route",
      "High-comfort private travel",
      "Family or private group",
      "Founder / executive rhythm",
      "Returning diaspora",
      "Not sure yet"
    ],
    type: "select"
  },
  {
    helper: "It is fine to choose not sure yet.",
    label: "Support needed",
    name: "supportNeeded",
    options: [
      "Route advisory",
      "Hosted private route",
      "Fully held China route",
      "Food, movement, and local interpretation",
      "Apps, payments, and translation support",
      "Not sure yet"
    ],
    type: "select"
  },
  {
    helper: "Tell us what you love, avoid, or cannot eat.",
    label: "Food preferences",
    name: "foodPreferences",
    placeholder: "No pork, loves noodles, mild spice, vegetarian meals",
    type: "textarea"
  },
  {
    helper: "A plain phrase is enough.",
    label: "Comfort level",
    name: "comfortLevel",
    placeholder: "High-comfort, flexible, family-friendly, simple but clean"
  },
  {
    helper: "Name a style, standard, or hotel you like.",
    label: "Hotel direction",
    name: "hotelDirection",
    placeholder: "Quiet boutique, high-comfort international hotel, local design hotel"
  },
  {
    helper: "This helps route timing and fatigue.",
    label: "Transport preference",
    name: "transportPreference",
    placeholder: "Private car, rail when sensible, minimal long drives"
  },
  {
    helper: "Describe the kind of person you would trust beside you.",
    label: "Host style",
    name: "hostStyle",
    placeholder: "Quiet interpreter, food person, culture specialist, executive pace"
  },
  {
    helper: "Tell us what support makes China feel easier.",
    label: "Language needs",
    name: "languageNeeds",
    placeholder: "English only, some Mandarin, translation help for meals"
  },
  {
    helper: "Avoid lists are useful; they make the route better.",
    label: "Things to avoid",
    name: "avoidances",
    placeholder: "Crowds, strenuous hikes, nightlife, shopping stops, spicy food",
    type: "textarea"
  },
  {
    helper: "Share only what affects comfort, safety, privacy, or fit.",
    label: "Sensitive or important notes",
    name: "sensitiveNotes",
    placeholder: "Mobility, medical, privacy, religious, family, or business constraints",
    type: "textarea"
  }
];

const hostDetails: DetailField[] = [
  { label: "Name", name: "name", placeholder: "Your name" },
  { label: "City / region", name: "cityRegion", placeholder: "Shanghai, Taiyuan, Dengfeng, Huangshan" },
  { label: "Languages", name: "languages", placeholder: "Mandarin, English, local dialect, French" },
  {
    helper: "Specific local worlds are more useful than broad claims.",
    label: "Areas of local knowledge",
    name: "knowledgeAreas",
    placeholder: "Food, architecture, Buddhist culture, business rhythm, old neighborhoods",
    type: "textarea"
  },
  {
    label: "Availability",
    name: "availability",
    options: ["Occasional hosting", "Weekend or evening hosting", "Specialist-only hosting", "Route-building role", "Not sure yet"],
    type: "select"
  },
  { label: "Host style", name: "hostStyle", placeholder: "Quiet, scholarly, practical, food-led, executive-friendly" },
  {
    label: "Relevant background",
    name: "background",
    placeholder: "Work, study, hosting, research, hospitality, or lived local experience",
    type: "textarea"
  },
  {
    helper: "Boundaries protect both sides.",
    label: "Boundaries / what you do not want to do",
    name: "boundaries",
    placeholder: "No nightlife, no driving, no 24/7 availability, specialist-only",
    type: "textarea"
  },
  { label: "Why you want to host", name: "motivation", placeholder: "What kind of traveler or place would you like to help interpret?", type: "textarea" }
];

const partnerDetails: DetailField[] = [
  { label: "Name", name: "name", placeholder: "Your name" },
  { label: "Organization", name: "organization", placeholder: "Company, studio, institution, or independent" },
  { label: "City / region", name: "cityRegion", placeholder: "Where the relationship would be based" },
  {
    label: "Partnership type",
    name: "partnershipType",
    options: ["Local route partner", "Hospitality partner", "Cultural institution", "Education / research", "Brand or private client work", "Not sure yet"],
    type: "select"
  },
  { label: "Local network", name: "localNetwork", placeholder: "Hosts, restaurants, transport, cultural spaces, specialists, hotels", type: "textarea" },
  { label: "Route or collaboration idea", name: "chapterIdea", placeholder: "What kind of local access, route, or client need could you support?", type: "textarea" },
  { label: "Operational role", name: "operationalRole", placeholder: "Sourcing, hosting, coordination, hospitality, specialist access" },
  { label: "Notes", name: "notes", placeholder: "Anything we should understand before a conversation", type: "textarea" }
];

function detailsForIntent(intentType: LocalhostIntentType) {
  if (intentType === "host") return hostDetails;
  if (intentType === "partner") return partnerDetails;
  return travelerDetails;
}

function initialDetails(routeContext?: LocalhostRouteContext): Record<string, string> {
  if (!routeContext) return {};
  return {
    routeInterest: routeLabels[routeContext]
  };
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function submitLabel(intentType: LocalhostIntentType, sourcePage?: string) {
  if (intentType === "host") return "Apply as a host";
  if (intentType === "partner") return "Start partner conversation";
  if (sourcePage === "/") return "Begin private review";
  return "Request Private Route Review";
}

function fullIntakeHref({
  intentType,
  routeContext,
  sourceLabel,
  sourcePage
}: {
  intentType: LocalhostIntentType;
  routeContext?: LocalhostRouteContext;
  sourceLabel?: string;
  sourcePage?: string;
}) {
  const params = new URLSearchParams({ type: intentType });

  if (routeContext) params.set("route", routeContext);
  if (sourcePage) params.set("sourcePage", sourcePage);
  if (sourceLabel) params.set("sourceLabel", sourceLabel);

  return `/inquiry?${params.toString()}`;
}

export function LocalhostIntakeForm({
  compact = false,
  contextLocked = false,
  defaultMessage = "",
  embedded = false,
  intentType = "traveler",
  routeContext,
  showRoleTabs = true,
  sourceLabel,
  sourcePage
}: LocalhostIntakeFormProps) {
  const [activeIntent, setActiveIntent] = useState<LocalhostIntentType>(intentType);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [isPending, startTransition] = useTransition();
  const [optionalDetails, setOptionalDetails] = useState<Record<string, string>>(() =>
    initialDetails(routeContext)
  );
  const [result, setResult] = useState<LocalhostInquiryResult | null>(null);
  const [shortNote, setShortNote] = useState(defaultMessage);
  const [startedAt] = useState(() => Date.now());

  const fields = useMemo(() => detailsForIntent(activeIntent), [activeIntent]);
  const routeLabel = routeContext ? routeLabels[routeContext] : "";
  const noteOptional = Boolean(routeContext);
  const noteCopy = roleCopy[activeIntent];

  function updateDetail(name: string, value: string) {
    setOptionalDetails((current) => ({ ...current, [name]: value }));
    setResult(null);
  }

  function filteredDetails() {
    return Object.fromEntries(
      Object.entries(optionalDetails).filter(([, value]) => value.trim())
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);

    if (!isValidEmail(email)) {
      setError("Please enter a valid email.");
      return;
    }

    if (!noteOptional && !shortNote.trim()) {
      setError("Please add one sentence about what you are looking for.");
      return;
    }

    startTransition(async () => {
      const response = await submitLocalhostInquiry({
        createdAt: new Date().toISOString(),
        email,
        honeypot,
        intentType: activeIntent,
        locale: navigator.language,
        optionalDetails: filteredDetails(),
        routeContext,
        shortNote,
        sourceLabel,
        sourcePage,
        startedAt,
        userAgent: navigator.userAgent
      });

      if (!response.ok) {
        setError(response.message);
        return;
      }

      setResult(response);
      if (response.mailtoHref) {
        window.location.href = response.mailtoHref;
      }
    });
  }

  return (
    <form
      aria-label="Localhost private inquiry"
      className={`localhost-intake-form${compact ? " localhost-intake-form--compact" : ""}${
        embedded ? " localhost-intake-form--embedded" : ""
      }`}
      onSubmit={handleSubmit}
    >
      {routeContext ? (
        <div className="context-card" aria-label="Request context">
          <p className="eyebrow">Request context</p>
          <dl>
            <div>
              <dt>Route</dt>
              <dd>{routeLabel}</dd>
            </div>
            {sourceLabel || sourcePage ? (
              <div>
                <dt>Source</dt>
                <dd>{sourceLabel || sourcePage}</dd>
              </div>
            ) : null}
          </dl>
          <p>This context will be included automatically.</p>
        </div>
      ) : null}

      <input
        aria-hidden="true"
        autoComplete="off"
        className="intake-honeypot"
        name="companyWebsite"
        onChange={(event) => setHoneypot(event.target.value)}
        tabIndex={-1}
        type="text"
        value={honeypot}
      />

      {showRoleTabs ? (
        <fieldset className="role-tabs">
          <legend>I am a</legend>
          <div>
            {(["traveler", "host", "partner"] as const).map((role) => (
              <button
                aria-pressed={activeIntent === role}
                className="role-tab"
                disabled={contextLocked}
                key={role}
                onClick={() => {
                  setActiveIntent(role);
                  setError("");
                  setResult(null);
                }}
                type="button"
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}

      {!compact ? (
        <div className="intake-assurance">
          <p className="eyebrow">Before You Write</p>
          <ul>
            <li>One honest sentence is enough to begin.</li>
            <li>A human reviews fit, timing, route direction, and local feasibility.</li>
            <li>This prepares an email inquiry. It is not payment or instant booking.</li>
          </ul>
        </div>
      ) : null}

      <label>
        <span>Email *</span>
        <input
          autoComplete="email"
          inputMode="email"
          name="email"
          onChange={(event) => {
            setEmail(event.target.value);
            setError("");
            setResult(null);
          }}
          placeholder="you@example.com"
          type="email"
          value={email}
        />
      </label>

      <label>
        <span>{noteCopy.label}{noteOptional ? "" : " *"}</span>
        <textarea
          name="shortNote"
          onChange={(event) => {
            setShortNote(event.target.value);
            setError("");
            setResult(null);
          }}
          placeholder={noteOptional ? "Optional. Route context is already captured." : "One sentence is enough."}
          rows={compact ? 3 : 4}
          value={shortNote}
        />
        <small>
          {noteOptional
            ? "This route context is already captured. Add a short note only if useful."
            : noteCopy.helper}
        </small>
      </label>

      <button
        aria-expanded={detailsOpen}
        className="optional-toggle"
        onClick={() => setDetailsOpen((open) => !open)}
        type="button"
      >
        {detailsOpen ? "Hide route details" : "Add route details — optional"}
      </button>

      {detailsOpen ? (
        <div className="optional-details">
          <p>Fill only what is easy now. The examples are prompts, not requirements.</p>
          <div className="optional-detail-steps">
            {activeIntent === "traveler" ? (
              <>
                <section>
                  <h3>Step 2: Route frame — optional</h3>
                  <div className="optional-field-grid">
                    {fields.slice(0, 8).map((field) => (
                      <DetailFieldInput
                        contextLocked={contextLocked}
                        field={field}
                        key={field.name}
                        onChange={updateDetail}
                        value={optionalDetails[field.name] || ""}
                      />
                    ))}
                  </div>
                </section>
                <section>
                  <h3>Step 3: Taste & comfort — optional</h3>
                  <div className="optional-field-grid">
                    {fields.slice(8, 13).map((field) => (
                      <DetailFieldInput
                        field={field}
                        key={field.name}
                        onChange={updateDetail}
                        value={optionalDetails[field.name] || ""}
                      />
                    ))}
                  </div>
                </section>
                <section>
                  <h3>Step 4: Host fit — optional</h3>
                  <div className="optional-field-grid">
                    {fields.slice(13).map((field) => (
                      <DetailFieldInput
                        field={field}
                        key={field.name}
                        onChange={updateDetail}
                        value={optionalDetails[field.name] || ""}
                      />
                    ))}
                  </div>
                </section>
              </>
            ) : (
              <section>
                <h3>{activeIntent === "host" ? "Host details — optional" : "Partner details — optional"}</h3>
                <div className="optional-field-grid">
                  {fields.map((field) => (
                    <DetailFieldInput
                      field={field}
                      key={field.name}
                      onChange={updateDetail}
                      value={optionalDetails[field.name] || ""}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      ) : null}

      {error ? <p className="form-status form-status--error">{error}</p> : null}

      {result?.ok ? (
        <div className="form-status form-status--success" role="status">
          <strong>{result.message}</strong>
          <p>
            {activeIntent.charAt(0).toUpperCase() + activeIntent.slice(1)} / {email}
            {routeLabel ? ` / ${routeLabel}` : null}
          </p>
          {result.mailtoHref ? (
            <a className="text-link" href={result.mailtoHref}>
              Send prepared email
            </a>
          ) : null}
          {result.contactEmail ? (
            <p className="contact-copy">Direct contact: {result.contactEmail}</p>
          ) : null}
          {!detailsOpen ? (
            <button
              className="text-button"
              onClick={() => setDetailsOpen(true)}
              type="button"
            >
              Add more details
            </button>
          ) : null}
        </div>
      ) : null}

      <div className={`localhost-intake-actions${detailsOpen && !compact ? " localhost-intake-actions--sticky" : ""}`}>
        <button className="button button--dark" disabled={isPending} type="submit">
          {isPending ? "Sending..." : submitLabel(activeIntent, sourcePage)}
        </button>
        {compact ? (
          <a
            className="text-link"
            href={fullIntakeHref({
              intentType: activeIntent,
              routeContext,
              sourceLabel,
              sourcePage
            })}
          >
            See full intake
          </a>
        ) : null}
      </div>
    </form>
  );
}

function DetailFieldInput({
  contextLocked = false,
  field,
  onChange,
  value
}: {
  contextLocked?: boolean;
  field: DetailField;
  onChange: (name: string, value: string) => void;
  value: string;
}) {
  const disabled = contextLocked && field.name === "routeInterest";

  return (
    <label>
      <span>{field.label}</span>
      {field.type === "select" ? (
        <select
          disabled={disabled}
          name={field.name}
          onChange={(event) => onChange(field.name, event.target.value)}
          value={value}
        >
          <option value="">Select one if helpful</option>
          {field.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : field.type === "textarea" ? (
        <textarea
          name={field.name}
          onChange={(event) => onChange(field.name, event.target.value)}
          placeholder={field.placeholder}
          rows={3}
          value={value}
        />
      ) : (
        <input
          name={field.name}
          onChange={(event) => onChange(field.name, event.target.value)}
          placeholder={field.placeholder}
          type="text"
          value={value}
        />
      )}
      {field.helper ? <small>{field.helper}</small> : null}
    </label>
  );
}
