"use client";

import { FormEvent, useEffect, useId, useMemo, useRef, useState, useTransition } from "react";
import { getAnonymousSessionId, trackLocalhostEvent } from "@/components/LocalhostAnalytics";
import { buildInquiryHref } from "@/lib/inquiryLinks";
import { readInquiryFields } from "@/lib/inquiryValidation";
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

const travelerRepresentationDetails: DetailField[] = [
  {
    helper: "A trusted representative is welcome to begin the review.",
    label: "Inquiry made by",
    name: "inquiryMadeBy",
    options: [
      "Traveler directly",
      "Trusted representative",
      "Family member",
      "Executive or personal assistant",
      "Family office",
      "Travel adviser",
      "Other trusted representative"
    ],
    type: "select"
  },
  {
    helper: "Initials or a private reference are enough at first review.",
    label: "Traveler or principal",
    name: "travelerOrPrincipal",
    placeholder: "Name, initials, or private reference"
  }
];

const replyPreferenceDetails: DetailField[] = [
  {
    helper: "Email remains the default if you leave this open.",
    label: "Preferred reply",
    name: "preferredReply",
    options: [
      "Email",
      "WhatsApp",
      "WeChat",
      "Signal",
      "Phone call",
      "No preference"
    ],
    type: "select"
  },
  {
    helper: "Used only to continue this private inquiry.",
    label: "Reply details",
    name: "replyDetails",
    placeholder: "Number, username, time zone, or best call window"
  }
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

function submitLabel(intentType: LocalhostIntentType) {
  if (intentType === "host") return "Apply as a host";
  if (intentType === "partner") return "Start partner conversation";
  return "Request Private Route Review";
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
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [errorField, setErrorField] = useState<
    "email" | "name" | "shortNote" | null
  >(null);
  const [honeypot, setHoneypot] = useState("");
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [optionalDetails, setOptionalDetails] = useState<Record<string, string>>(() =>
    initialDetails(routeContext)
  );
  const [result, setResult] = useState<LocalhostInquiryResult | null>(null);
  const [representativeInquiry, setRepresentativeInquiry] = useState(false);
  const [shortNote, setShortNote] = useState(defaultMessage);
  const [startedAt] = useState(() => Date.now());
  const emailRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const shortNoteRef = useRef<HTMLTextAreaElement>(null);
  const representativePathTracked = useRef(false);

  const fields = useMemo(() => detailsForIntent(activeIntent), [activeIntent]);
  const routeLabel = routeContext ? routeLabels[routeContext] : "";
  const noteCopy = roleCopy[activeIntent];
  const activeDetailNames = new Set([
    ...fields.map((field) => field.name),
    ...replyPreferenceDetails.map((field) => field.name),
    ...(activeIntent === "traveler" ? travelerRepresentationDetails.map((field) => field.name) : [])
  ]);
  const hasVisibleDetailError = Boolean(errorDetail && (
    detailsOpen || (activeIntent === "traveler" && representativeInquiry &&
      travelerRepresentationDetails.some((field) => field.name === errorDetail))
  ));

  useEffect(() => {
    if (result?.ok) resultRef.current?.focus();
  }, [result]);

  function clearSubmissionFeedback() {
    setError("");
    setErrorField(null);
    setErrorDetail(null);
    setResult(null);
  }

  function updateDetail(name: string, value: string) {
    setOptionalDetails((current) => ({ ...current, [name]: value }));
    clearSubmissionFeedback();
  }

  function updateRepresentativeInquiry(
    enabled: boolean,
    form?: HTMLFormElement | null
  ) {
    setRepresentativeInquiry(enabled);
    setOptionalDetails((current) => {
      const next = { ...current };
      if (enabled) {
        next.inquiryMadeBy = next.inquiryMadeBy || "Trusted representative";
      } else {
        delete next.inquiryMadeBy;
        delete next.travelerOrPrincipal;
      }
      return next;
    });
    clearSubmissionFeedback();

    if (enabled && !representativePathTracked.current) {
      representativePathTracked.current = true;
      trackLocalhostEvent("representative_path_start", form || undefined);
    }
  }

  function filteredDetails() {
    return Object.fromEntries(
      Object.entries(optionalDetails).filter(([key, value]) => activeDetailNames.has(key) && value.trim())
    );
  }

  function showValidationError(
    message: string,
    field: "email" | "name" | "shortNote" | null,
    form: HTMLFormElement,
    detailKey?: string
  ) {
    setError(message);
    setErrorField(field);
    const activeDetail = !field && detailKey && activeDetailNames.has(detailKey) ? detailKey : null;
    setErrorDetail(activeDetail);
    if (activeDetail) setDetailsOpen(true);
    trackLocalhostEvent("validation_error", form);
    window.requestAnimationFrame(() => {
      if (field === "name") nameRef.current?.focus();
      if (field === "email") emailRef.current?.focus();
      if (field === "shortNote") shortNoteRef.current?.focus();
      if (!field) {
        const target = activeDetail ? form.elements.namedItem(activeDetail) : null;
        if (target instanceof HTMLElement) target.focus();
        else errorRef.current?.focus();
      }
    });
  }

  function showSubmissionError(form: HTMLFormElement) {
    setError(
      "We could not confirm receipt. Your details are still here; please try again."
    );
    setErrorField(null);
    setErrorDetail(null);
    trackLocalhostEvent("inquiry_error", form);
    window.requestAnimationFrame(() => errorRef.current?.focus());
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending || result?.ok) return;

    const form = event.currentTarget;
    clearSubmissionFeedback();
    const validatedFields = readInquiryFields({ name, email, shortNote, optionalDetails: filteredDetails() });
    if (!validatedFields.ok) {
      const { field, detailKey, message } = validatedFields.error;
      showValidationError(message, field === "details" ? null : field, form, detailKey);
      return;
    }

    trackLocalhostEvent("inquiry_submit_attempt", form);

    startTransition(async () => {
      try {
        const response = await submitLocalhostInquiry({
          createdAt: new Date().toISOString(),
          email: validatedFields.value.email,
          honeypot,
          intentType: activeIntent,
          locale: navigator.language,
          name: validatedFields.value.name,
          optionalDetails: validatedFields.value.optionalDetails,
          routeContext,
          sessionId: getAnonymousSessionId(),
          shortNote: validatedFields.value.shortNote,
          sourceLabel,
          sourcePage,
          startedAt,
          userAgent: navigator.userAgent
        });

        if (!response.ok) {
          if (response.fieldError) {
            const { field, detailKey } = response.fieldError;
            showValidationError(response.message, field === "details" ? null : field, form, detailKey);
            return;
          }
          if (response.errorCode === "delivery_unconfigured") {
            setError(response.message);
            setErrorField(null);
            window.requestAnimationFrame(() => errorRef.current?.focus());
            return;
          }
          if (/wait before sending/i.test(response.message)) {
            trackLocalhostEvent("inquiry_rate_limited", form);
          }
          const field = /name/i.test(response.message)
            ? "name"
            : /email/i.test(response.message)
              ? "email"
              : /sentence|looking/i.test(response.message)
                ? "shortNote"
                : null;
          showValidationError(response.message, field, form);
          return;
        }

        setResult(response);
        if (response.delivery === "duplicate") {
          trackLocalhostEvent("inquiry_duplicate", form);
        } else if (response.mailtoHref) {
          trackLocalhostEvent("mailto_fallback", form);
        } else if (response.delivery === "email") {
          trackLocalhostEvent("inquiry_sent", form);
        }
      } catch {
        showSubmissionError(form);
      }
    });
  }

  return (
    <form
      aria-label="Localhost private inquiry"
      className={`localhost-intake-form${compact ? " localhost-intake-form--compact" : ""}${
        embedded ? " localhost-intake-form--embedded" : ""
      }`}
      data-inquiry-form="true"
      data-representation-options="optional"
      data-reply-preference="optional"
      data-track-route={routeContext}
      data-track-source={sourceLabel || sourcePage || "private_inquiry"}
      aria-describedby={error ? "inquiry-error" : undefined}
      noValidate
      onSubmit={handleSubmit}
    >
      <h2 className="visually-hidden">Private inquiry details</h2>
      {routeContext ? (
        <div className="context-card context-card--compact" aria-label="Route interest">
          <span>Route interest</span>
          <strong>{routeLabel}</strong>
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

      <div className="intake-identity-grid">
        <label>
          <span>Name *</span>
          <input
            aria-describedby={errorField === "name" ? "inquiry-error" : undefined}
            aria-invalid={errorField === "name"}
            autoComplete="name"
            id="inquiry-name"
            name="name"
            onChange={(event) => {
              setName(event.target.value);
              clearSubmissionFeedback();
            }}
            placeholder="How should we address you?"
            ref={nameRef}
            required
            type="text"
            value={name}
          />
          {errorField === "name" ? <InquiryFieldErrorText message={error} /> : null}
        </label>

        <label>
          <span>Email *</span>
          <input
            autoComplete="email"
            aria-describedby={errorField === "email" ? "inquiry-error" : undefined}
            aria-invalid={errorField === "email"}
            inputMode="email"
            id="inquiry-email"
            name="email"
            onChange={(event) => {
              setEmail(event.target.value);
              clearSubmissionFeedback();
            }}
            placeholder="you@example.com"
            ref={emailRef}
            required
            type="email"
            value={email}
          />
          {errorField === "email" ? <InquiryFieldErrorText message={error} /> : null}
        </label>
      </div>

      <label>
        <span>{noteCopy.label} *</span>
        <textarea
          aria-describedby={errorField === "shortNote" ? "short-note-hint inquiry-error" : "short-note-hint"}
          aria-invalid={errorField === "shortNote"}
          id="inquiry-short-note"
          name="shortNote"
          onChange={(event) => {
            setShortNote(event.target.value);
            clearSubmissionFeedback();
          }}
          placeholder={
            routeContext
              ? "One sentence is enough. What should this route hold for you?"
              : "One sentence is enough."
          }
          ref={shortNoteRef}
          required
          rows={compact ? 3 : 4}
          value={shortNote}
        />
        <small id="short-note-hint">
          {routeContext
            ? "The route is already captured. Tell us what you want it to hold."
            : noteCopy.helper}
        </small>
        {errorField === "shortNote" ? <InquiryFieldErrorText message={error} /> : null}
      </label>

      <p className="privacy-boundary privacy-boundary--standalone">
        Private first review. Your note and reply details are not published or
        sent to site analytics. Do not include passport, payment, medical, or
        identity documents.
      </p>

      {showRoleTabs ? (
        <>
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
                    if (role !== "traveler") {
                      updateRepresentativeInquiry(false);
                    }
                    clearSubmissionFeedback();
                  }}
                  type="button"
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </button>
              ))}
            </div>
          </fieldset>
          {activeIntent === "traveler" && !compact ? (
            <div className="representative-intake">
              <label className="representative-toggle">
                <input
                  checked={representativeInquiry}
                  name="representativeInquiry"
                  onChange={(event) =>
                    updateRepresentativeInquiry(
                      event.currentTarget.checked,
                      event.currentTarget.form
                    )
                  }
                  type="checkbox"
                />
                <span>I am arranging this on behalf of a traveler</span>
              </label>
              {representativeInquiry ? (
                <div className="representative-details">
                  <p>
                    Assistants, family offices, and trusted advisers can begin.
                    A traveler&apos;s name is optional; initials or a private
                    reference are enough.
                  </p>
                  <div className="optional-field-grid">
                    {travelerRepresentationDetails.map((field) => (
                      <DetailFieldInput
                        field={field}
                        error={errorDetail === field.name ? error : ""}
                        key={field.name}
                        onChange={updateDetail}
                        value={optionalDetails[field.name] || ""}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </>
      ) : null}

      <button
        aria-controls="optional-route-details"
        aria-expanded={detailsOpen}
        className="optional-toggle"
        data-track-event="optional_details"
        onClick={() => setDetailsOpen((open) => !open)}
        type="button"
      >
        {detailsOpen ? "Hide route details" : "Add route details — optional"}
      </button>

      {detailsOpen ? (
        <div className="optional-details" id="optional-route-details">
          <p>Fill only what is easy now. The examples are prompts, not requirements.</p>
          <div className="optional-detail-steps">
            {activeIntent === "traveler" ? (
              <>
                <section>
                  <h3>Step 2: Route frame — optional</h3>
                  <div className="optional-field-grid">
                    {fields.slice(0, 7).map((field) => (
                      <DetailFieldInput
                        contextLocked={contextLocked}
                        field={field}
                        error={errorDetail === field.name ? error : ""}
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
                    {fields.slice(7, 11).map((field) => (
                      <DetailFieldInput
                        field={field}
                        error={errorDetail === field.name ? error : ""}
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
                    {fields.slice(11).map((field) => (
                      <DetailFieldInput
                        field={field}
                        error={errorDetail === field.name ? error : ""}
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
                      error={errorDetail === field.name ? error : ""}
                      key={field.name}
                      onChange={updateDetail}
                      value={optionalDetails[field.name] || ""}
                    />
                  ))}
                </div>
              </section>
            )}
            <section>
              <h3>
                {activeIntent === "traveler"
                  ? "Step 5: Contact context — optional"
                  : "Reply preference — optional"}
              </h3>
              <div className="optional-field-grid">
                {(activeIntent === "traveler"
                  ? [
                      ...(representativeInquiry ? [] : travelerRepresentationDetails),
                      ...replyPreferenceDetails
                    ]
                  : replyPreferenceDetails
                ).map((field) => (
                  <DetailFieldInput
                    field={field}
                    error={errorDetail === field.name ? error : ""}
                    key={field.name}
                    onChange={updateDetail}
                    value={optionalDetails[field.name] || ""}
                  />
                ))}
              </div>
            </section>
          </div>
        </div>
      ) : null}

      {error && !errorField && !hasVisibleDetailError ? (
        <p
          className="form-status form-status--error"
          id="inquiry-error"
          ref={errorRef}
          role="alert"
          tabIndex={-1}
        >
          {error}
        </p>
      ) : null}

      {result?.ok ? (
        <div
          aria-label="Inquiry result"
          className={`form-status${result.delivery === "mailto" ? "" : " form-status--success"}`}
          ref={resultRef}
          role="region"
          tabIndex={-1}
        >
          <strong aria-live="polite" role="status">{result.message}</strong>
          <p>
            {name} / {activeIntent.charAt(0).toUpperCase() + activeIntent.slice(1)} / {email}
            {routeLabel ? ` / ${routeLabel}` : null}
          </p>
          {result.inquiryId ? (
            <p className="inquiry-reference">Reference: {result.inquiryId}</p>
          ) : null}
          {result.responseWindow ? (
            <p className="response-expectation">
              {result.delivery === "mailto"
                ? `Expected reply window after you send the email: ${result.responseWindow}.`
                : `Expected reply window: ${result.responseWindow}.`}
            </p>
          ) : null}
          {optionalDetails.preferredReply ? (
            <p className="response-expectation">
              Preferred reply: {optionalDetails.preferredReply}
            </p>
          ) : null}
          {result.mailtoHref && result.preparedEmail ? (
            <PreparedInquiryEmail
              draft={result.preparedEmail}
              mailtoHref={result.mailtoHref}
            />
          ) : null}
          {result.contactEmail ? (
            <p className="contact-copy">Direct contact: {result.contactEmail}</p>
          ) : null}
        </div>
      ) : null}

      <div className={`localhost-intake-actions${detailsOpen && !compact ? " localhost-intake-actions--sticky" : ""}`}>
        <div className="localhost-intake-submit">
          <button
            className="button button--dark"
            disabled={isPending || Boolean(result?.ok)}
            type="submit"
          >
            {isPending
              ? "Preparing..."
              : result?.ok
                ? result.delivery === "mailto"
                  ? "Email ready to send"
                  : "Inquiry received"
                : submitLabel(activeIntent)}
          </button>
          <p className="submission-assurance">
            Successful direct delivery returns a private reference here. No
            payment or identity documents are requested at inquiry.
          </p>
        </div>
        {compact ? (
          <a
            className="text-link"
            href={buildInquiryHref({
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

function PreparedInquiryEmail({
  draft,
  mailtoHref
}: {
  draft: { body: string; subject: string };
  mailtoHref: string;
}) {
  const [copyMessage, setCopyMessage] = useState("");
  const draftId = useId();
  const previewRef = useRef<HTMLDetailsElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const emailText = `Subject: ${draft.subject}\n\n${draft.body}`;

  async function copyInquiry() {
    try {
      await navigator.clipboard.writeText(emailText);
      setCopyMessage("Inquiry copied. Copying does not send the email.");
    } catch {
      if (previewRef.current) previewRef.current.open = true;
      textRef.current?.focus();
      textRef.current?.select();
      setCopyMessage("Automatic copying is unavailable. Your email text is selected below.");
    }
  }

  return (
    <div className="inquiry-email-recovery">
      <div className="inline-actions">
        <a className="text-link" href={mailtoHref}>Open prepared email</a>
        <button className="text-button" onClick={copyInquiry} type="button">
          Copy inquiry
        </button>
      </div>
      <details ref={previewRef}>
        <summary>Review email text</summary>
        <label htmlFor={draftId}>
          <span>Prepared email</span>
          <textarea id={draftId} readOnly ref={textRef} rows={8} value={emailText} />
        </label>
      </details>
      {copyMessage ? <p aria-live="polite">{copyMessage}</p> : null}
    </div>
  );
}

function InquiryFieldErrorText({ message }: { message: string }) {
  return <small className="field-error" id="inquiry-error" role="alert">{message}</small>;
}

function DetailFieldInput({
  contextLocked = false,
  field,
  error = "",
  onChange,
  value
}: {
  contextLocked?: boolean;
  field: DetailField;
  error?: string;
  onChange: (name: string, value: string) => void;
  value: string;
}) {
  const disabled = contextLocked && field.name === "routeInterest";
  const errorAttributes = {
    "aria-invalid": Boolean(error),
    "aria-describedby": error ? "inquiry-error" : undefined
  };

  return (
    <label>
      <span>{field.label}</span>
      {field.type === "select" ? (
        <select
          {...errorAttributes}
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
          {...errorAttributes}
          name={field.name}
          onChange={(event) => onChange(field.name, event.target.value)}
          placeholder={field.placeholder}
          rows={3}
          value={value}
        />
      ) : (
        <input
          {...errorAttributes}
          name={field.name}
          onChange={(event) => onChange(field.name, event.target.value)}
          placeholder={field.placeholder}
          type="text"
          value={value}
        />
      )}
      {field.helper ? <small>{field.helper}</small> : null}
      {error ? <InquiryFieldErrorText message={error} /> : null}
    </label>
  );
}
