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
  label: string;
  name: string;
  options?: string[];
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
    helper: "Share the chapter, relationship, or collaboration you want to explore.",
    label: "What kind of chapter, relationship, or collaboration are you considering?"
  },
  traveler: {
    helper: "One sentence is enough: what kind of China do you want to understand?",
    label: "What kind of China do you want to understand?"
  }
};

const travelerDetails: DetailField[] = [
  { label: "Name", name: "name" },
  { label: "Where are you from?", name: "origin" },
  { label: "Approximate timing", name: "timing" },
  { label: "Number of travelers", name: "travelers" },
  { label: "Trip length", name: "tripLength" },
  {
    label: "Route interest",
    name: "routeInterest",
    options: ["Shanxi", "Shaolin", "Huizhou", "Shanghai", "Beijing", "Chengdu", "Not sure yet"],
    type: "select"
  },
  {
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
    label: "Support needed",
    name: "supportNeeded",
    options: [
      "Route advisory",
      "Hosted private route",
      "Fully held China chapter",
      "Food, movement, and local interpretation",
      "Apps, payments, and translation support",
      "Not sure yet"
    ],
    type: "select"
  },
  { label: "Food preferences", name: "foodPreferences", type: "textarea" },
  { label: "Comfort level", name: "comfortLevel" },
  { label: "Hotel direction", name: "hotelDirection" },
  { label: "Transport preference", name: "transportPreference" },
  { label: "Host style", name: "hostStyle" },
  { label: "Language needs", name: "languageNeeds" },
  { label: "Things to avoid", name: "avoidances", type: "textarea" },
  { label: "Sensitive or important notes", name: "sensitiveNotes", type: "textarea" }
];

const hostDetails: DetailField[] = [
  { label: "Name", name: "name" },
  { label: "City / region", name: "cityRegion" },
  { label: "Languages", name: "languages" },
  { label: "Areas of local knowledge", name: "knowledgeAreas", type: "textarea" },
  {
    label: "Availability",
    name: "availability",
    options: ["Occasional hosting", "Weekend or evening hosting", "Specialist-only hosting", "Chapter-building role", "Not sure yet"],
    type: "select"
  },
  { label: "Host style", name: "hostStyle" },
  { label: "Relevant background", name: "background", type: "textarea" },
  { label: "Boundaries / what you do not want to do", name: "boundaries", type: "textarea" },
  { label: "Why you want to host", name: "motivation", type: "textarea" }
];

const partnerDetails: DetailField[] = [
  { label: "Name", name: "name" },
  { label: "Organization", name: "organization" },
  { label: "City / region", name: "cityRegion" },
  {
    label: "Partnership type",
    name: "partnershipType",
    options: ["Local chapter partner", "Hospitality partner", "Cultural institution", "Education / research", "Brand or private client work", "Not sure yet"],
    type: "select"
  },
  { label: "Local network", name: "localNetwork", type: "textarea" },
  { label: "Route/chapter idea", name: "chapterIdea", type: "textarea" },
  { label: "Operational role", name: "operationalRole" },
  { label: "Notes", name: "notes", type: "textarea" }
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
  return "Submit private inquiry";
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
          <p>These details help route fit, but they are not required.</p>
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
          rows={3}
          value={value}
        />
      ) : (
        <input
          name={field.name}
          onChange={(event) => onChange(field.name, event.target.value)}
          type="text"
          value={value}
        />
      )}
    </label>
  );
}
