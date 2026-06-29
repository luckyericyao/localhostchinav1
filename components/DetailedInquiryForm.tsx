"use client";

import type { FormEvent, ReactNode } from "react";
import { useMemo, useState } from "react";
import { contactEmail, openInquiryMailto } from "@/lib/inquiryMail";

type InquiryRole = "Traveler" | "Host" | "Partner";

type MultiChoiceField =
  | "chinaInterests"
  | "diningStyles"
  | "foodCuriosity"
  | "foodFocus"
  | "foodRestrictions"
  | "alcoholBarCulture"
  | "mealPrivacy"
  | "dayRhythm"
  | "experienceFocus"
  | "nightlifeStyle"
  | "shoppingObjects"
  | "wellnessRecovery"
  | "transport"
  | "comfortRequirements"
  | "avoidances"
  | "practicalSupport";

type DetailedInquiryState = {
  role: InquiryRole;
  name: string;
  email: string;
  origin: string;
  timing: string;
  groupSize: string;
  tripLength: string;
  relationshipWithChina: string;
  travelingWith: string;
  route: string;
  chinaInterests: string[];
  diningStyles: string[];
  foodCuriosity: string[];
  foodFocus: string[];
  foodRestrictions: string[];
  alcoholBarCulture: string[];
  mealPrivacy: string[];
  dayRhythm: string[];
  experienceFocus: string[];
  nightlifeStyle: string[];
  shoppingObjects: string[];
  wellnessRecovery: string[];
  hotelDirection: string;
  transport: string[];
  comfortRequirements: string[];
  avoidances: string[];
  hostStyle: string;
  hostPresence: string;
  languageNeeds: string;
  practicalSupport: string[];
  finalNotes: string;
  hostRegion: string;
  hostLanguages: string;
  hostLocalWorld: string;
  hostAvailability: string;
  hostExperience: string;
  hostMotivation: string;
  organization: string;
  partnershipType: string;
  partnerRegion: string;
  partnerIntent: string;
};

type InquiryErrors = Partial<Record<keyof DetailedInquiryState, string>>;

type ChoiceGroupProps = {
  copy?: string;
  error?: string;
  name: MultiChoiceField;
  onToggle: (field: MultiChoiceField, option: string) => void;
  options: string[];
  title: string;
  values: string[];
};

type SelectFieldProps = {
  error?: string;
  label: string;
  name: keyof DetailedInquiryState;
  onChange: (field: keyof DetailedInquiryState, value: string) => void;
  options: string[];
  placeholder?: string;
  value: string;
};

type InputFieldProps = {
  error?: string;
  label: string;
  name: keyof DetailedInquiryState;
  onChange: (field: keyof DetailedInquiryState, value: string) => void;
  type?: string;
  value: string;
};

type TextAreaFieldProps = {
  label: string;
  name: keyof DetailedInquiryState;
  onChange: (field: keyof DetailedInquiryState, value: string) => void;
  placeholder?: string;
  rows?: number;
  value: string;
};

const initialState: DetailedInquiryState = {
  role: "Traveler",
  name: "",
  email: "",
  origin: "",
  timing: "",
  groupSize: "",
  tripLength: "",
  relationshipWithChina: "",
  travelingWith: "",
  route: "",
  chinaInterests: [],
  diningStyles: [],
  foodCuriosity: [],
  foodFocus: [],
  foodRestrictions: [],
  alcoholBarCulture: [],
  mealPrivacy: [],
  dayRhythm: [],
  experienceFocus: [],
  nightlifeStyle: [],
  shoppingObjects: [],
  wellnessRecovery: [],
  hotelDirection: "",
  transport: [],
  comfortRequirements: [],
  avoidances: [],
  hostStyle: "",
  hostPresence: "",
  languageNeeds: "",
  practicalSupport: [],
  finalNotes: "",
  hostRegion: "",
  hostLanguages: "",
  hostLocalWorld: "",
  hostAvailability: "",
  hostExperience: "",
  hostMotivation: "",
  organization: "",
  partnershipType: "",
  partnerRegion: "",
  partnerIntent: ""
};

const roleCards: Array<{ role: InquiryRole; title: string; copy: string }> = [
  {
    role: "Traveler",
    title: "I am a Traveler",
    copy:
      "I want a private China route shaped around food, comfort, privacy, local culture, and host fit."
  },
  {
    role: "Host",
    title: "I am a Host",
    copy: "I can represent a city, region, food culture, field, or local world with care."
  },
  {
    role: "Partner",
    title: "I am a Partner",
    copy:
      "I want to build a chapter, relationship, hospitality route, or cultural collaboration."
  }
];

const groupSizeOptions = [
  "Solo",
  "2 travelers",
  "3-4 travelers",
  "5-8 travelers",
  "Private family group",
  "Business guests or delegation",
  "Not sure yet"
];

const tripLengthOptions = [
  "Half day",
  "1 day",
  "2-3 days",
  "4-6 days",
  "1 week",
  "10+ days",
  "Not sure yet"
];

const relationshipWithChinaOptions = [
  "First time",
  "Visited before",
  "Lived in China before",
  "Returning diaspora",
  "Frequent visitor seeking deeper local access",
  "Not sure"
];

const travelingWithOptions = [
  "Solo",
  "Couple",
  "Family",
  "Friends",
  "Parents or elderly family",
  "Children",
  "Business guests",
  "Private delegation",
  "Assistant or staff coordinating"
];

const routeOptions = [
  "Shanxi",
  "Shaolin",
  "Huizhou",
  "Shanghai",
  "Beijing",
  "Chengdu",
  "Multi-city China",
  "Not sure yet"
];

const chinaInterestOptions = [
  "Ancient temples and old architecture",
  "Buddhist / Daoist / spiritual culture",
  "Food, markets, and local dining rhythm",
  "Villages, courtyards, and slower regional life",
  "Modern urban China",
  "Business and social context",
  "Family roots / diaspora return",
  "Tea, literati culture, and quiet landscapes",
  "Martial discipline / body practice",
  "Art, design, and local taste",
  "Night streets and city energy",
  "Luxury China with real local context",
  "Help me choose"
];

const diningStyleOptions = [
  "Local neighborhood restaurants",
  "Family-style regional food",
  "Street food and markets, carefully filtered",
  "Refined local dining",
  "Private room / quieter meals",
  "Chef-led or tasting-menu style",
  "Michelin / high-end Chinese dining",
  "Luxury hotel Chinese restaurant",
  "Tea house / slow afternoon",
  "Late-night food streets",
  "Private club / members-room atmosphere",
  "Mix of local and comfortable"
];

const foodCuriosityOptions = [
  "Very adventurous",
  "Local food with careful guidance",
  "Clean, comfortable, lower-risk choices",
  "Regional specialties matter most",
  "Atmosphere matters more than fame",
  "Places locals actually use",
  "Historically or culturally meaningful food",
  "A few wow meals",
  "Simple, excellent food",
  "High-comfort fallback always available"
];

const foodFocusOptions = [
  "Noodles / northern wheat-based food",
  "Dumplings / buns / breakfast culture",
  "Hotpot",
  "Tea culture",
  "Vegetarian Buddhist food",
  "Regional home-style dishes",
  "Seafood",
  "BBQ / skewers",
  "Desserts / sweets",
  "Baijiu / Fenjiu / local alcohol culture",
  "Coffee / bakeries / modern cafes",
  "Night markets",
  "Wet markets / ingredient culture",
  "Fine dining",
  "Cocktail / wine bar after dinner",
  "Help me choose by region"
];

const foodRestrictionOptions = [
  "Vegetarian",
  "Vegan",
  "Halal",
  "Kosher",
  "No pork",
  "No beef",
  "No seafood",
  "No spicy food",
  "Mild spice only",
  "Gluten-sensitive",
  "Nut allergy",
  "Shellfish allergy",
  "Food safety concerns",
  "Other"
];

const alcoholBarCultureOptions = [
  "No alcohol",
  "Light pairing only",
  "Interested in baijiu / Fenjiu culture",
  "Wine or cocktail bars",
  "Business drinking etiquette, but no pressure",
  "Private lounge / hotel bar atmosphere",
  "Avoid heavy drinking"
];

const mealPrivacyOptions = [
  "Casual open dining is fine",
  "Prefer quieter tables",
  "Prefer private rooms for key meals",
  "Need discretion for business guests",
  "Family-friendly comfort matters",
  "Mix of lively local places and private meals"
];

const dayRhythmOptions = [
  "Slow mornings",
  "Early starts",
  "Long lunches",
  "Tea / cafe breaks",
  "Full days with many stops",
  "Fewer places, more depth",
  "Flexible day-by-day rhythm",
  "Night walks",
  "Light schedule with comfort",
  "Let the host judge the rhythm locally"
];

const experienceFocusOptions = [
  "Historic architecture",
  "Temples and spiritual sites",
  "Old neighborhoods",
  "Local markets",
  "Food walks",
  "Tea culture",
  "Craft / design / small shops",
  "Museums",
  "Nature and mountain roads",
  "Martial arts / body practice",
  "Photography-friendly places",
  "Business districts and modern China",
  "Family-friendly activities",
  "Quiet courtyards and hidden interiors",
  "Private cultural access if feasible",
  "Art galleries / collector taste",
  "Luxury retail with local context",
  "Wellness / spa / recovery time"
];

const nightlifeStyleOptions = [
  "No nightlife needed",
  "Night walks and food streets",
  "Quiet hotel bar",
  "Cocktail / wine bar",
  "Jazz / live music if tasteful",
  "Private lounge / members-club feel",
  "KTV / business-social context if appropriate",
  "Stronger nightlife, but still safe and curated"
];

const shoppingObjectsOptions = [
  "No shopping",
  "Local craft and design",
  "Tea, ceramics, paper, ink, objects",
  "Fashion boutiques",
  "Luxury malls / designer stores",
  "Private shopping appointment if feasible",
  "Antiques / old objects with caution",
  "Gifts for business or family",
  "Local markets, not tourist souvenirs"
];

const wellnessRecoveryOptions = [
  "Not important",
  "Massage / spa",
  "Bathhouse / sauna if clean and tasteful",
  "Gym access",
  "Jet lag recovery time",
  "Quiet hotel afternoons",
  "Light walking only",
  "Personal trainer / recovery support if feasible"
];

const hotelDirectionOptions = [
  "Boutique hotel",
  "International 5-star",
  "High-comfort local hotel",
  "Design-led hotel",
  "Quiet luxury",
  "Family-friendly hotel",
  "Suite / larger room preferred",
  "Walkable neighborhood",
  "Best available within reason",
  "I already have hotels"
];

const transportOptions = [
  "Private car preferred",
  "High-speed train is fine",
  "Driver + host where useful",
  "Airport / train transfer support",
  "Minimal walking between stops",
  "Comfortable road time is okay",
  "Avoid long road time",
  "I can manage transport if planned clearly"
];

const comfortRequirementOptions = [
  "Clean bathrooms planned",
  "Coffee access",
  "Quiet time every day",
  "Gym / workout time",
  "Laundry help",
  "Translation support",
  "Payment app help",
  "Private car comfort",
  "Hotel quality carefully filtered",
  "Dietary control",
  "Breaks for work calls",
  "Jet lag recovery",
  "Family / elderly pacing",
  "Child-friendly planning",
  "Discretion / privacy",
  "Assistant-style logistics"
];

const avoidanceOptions = [
  "Crowds",
  "No tourist traps",
  "No forced shopping",
  "No loud guides",
  "Overly scripted explanations",
  "Too many temples in one day",
  "Too many museums",
  "Long road time",
  "Very spicy food",
  "Dirty bathrooms",
  "Unclear food safety",
  "Heavy drinking",
  "Early mornings",
  "Late nights",
  "Too much walking",
  "Luxury for the sake of luxury",
  "No fake authentic performances",
  "Being rushed",
  "Being left alone with apps / logistics"
];

const hostStyleOptions = [
  "Quiet and practical",
  "Warm and conversational",
  "Deep cultural explainer",
  "Food-focused local",
  "Architecture / history focused",
  "Business / modern China context",
  "Family-friendly and patient",
  "Young creative / urban taste",
  "Older local with regional memory",
  "High-discretion private host",
  "Translator-style support",
  "Specialist host if available"
];

const hostPresenceOptions = [
  "Full-day host support",
  "Half-day host support",
  "Meals only",
  "Key moments only",
  "Remote planning + light local support",
  "Host plus driver coordination",
  "Not sure yet"
];

const languageNeedOptions = [
  "English required",
  "Mandarin okay",
  "Bilingual preferred",
  "Simple translation support is enough",
  "I have my own translator",
  "Other language"
];

const practicalSupportOptions = [
  "Payment app setup guidance",
  "Translation",
  "Restaurant selection and ordering",
  "Private car / transport rhythm",
  "Train / airport transfer guidance",
  "Hotel area advice",
  "SIM / data / app setup",
  "Family / elderly logistics",
  "Business dining etiquette",
  "Gift / social etiquette",
  "Local scheduling",
  "Weather / crowd adjustment",
  "Shopping / sourcing help",
  "Mainly cultural context"
];

const hostAvailabilityOptions = [
  "Occasional hosting",
  "Weekend or evening hosting",
  "Specialist-only hosting",
  "Chapter-building role",
  "Not sure yet"
];

const hostExperienceOptions = [
  "Yes, often",
  "Yes, occasionally",
  "Not formally, but I host personally",
  "Not yet"
];

const hostMotivationOptions = [
  "Food and dining culture",
  "Architecture, history, or regional memory",
  "Business and modern China context",
  "Creative, design, or local taste",
  "Family-friendly hosting",
  "Specialist cultural access",
  "Still exploring fit"
];

const partnershipOptions = [
  "Local chapter partner",
  "Hospitality partner",
  "Cultural institution",
  "Education / research",
  "Brand or private client work",
  "Not sure yet"
];

const partnerIntentOptions = [
  "Build a Localhost chapter",
  "Shape private hospitality routes",
  "Connect cultural or educational access",
  "Support private clients in China",
  "Explore a trusted local partnership",
  "Still exploring fit"
];

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function InputField({
  error,
  label,
  name,
  onChange,
  type = "text",
  value
}: InputFieldProps) {
  return (
    <label>
      <span>{label}</span>
      <input
        aria-invalid={Boolean(error)}
        autoComplete={name === "email" ? "email" : name === "name" ? "name" : undefined}
        name={name}
        onChange={(event) => onChange(name, event.target.value)}
        type={type}
        value={value}
      />
      {error ? <small className="field-error">{error}</small> : null}
    </label>
  );
}

function SelectField({
  error,
  label,
  name,
  onChange,
  options,
  placeholder = "Select one if helpful",
  value
}: SelectFieldProps) {
  return (
    <label>
      <span>{label}</span>
      <select
        aria-invalid={Boolean(error)}
        name={name}
        onChange={(event) => onChange(name, event.target.value)}
        value={value}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error ? <small className="field-error">{error}</small> : null}
    </label>
  );
}

function TextAreaField({
  label,
  name,
  onChange,
  placeholder,
  rows = 5,
  value
}: TextAreaFieldProps) {
  return (
    <label>
      <span>{label}</span>
      <textarea
        name={name}
        onChange={(event) => onChange(name, event.target.value)}
        placeholder={placeholder}
        rows={rows}
        value={value}
      />
    </label>
  );
}

function ChoiceGroup({
  copy,
  error,
  name,
  onToggle,
  options,
  title,
  values
}: ChoiceGroupProps) {
  return (
    <fieldset aria-invalid={Boolean(error)} className="choice-group">
      <legend>{title}</legend>
      {copy ? <p>{copy}</p> : null}
      <div className="choice-grid">
        {options.map((option) => (
          <label className="choice-option" key={option}>
            <input
              checked={values.includes(option)}
              name={name}
              onChange={() => onToggle(name, option)}
              type="checkbox"
              value={option}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
      {error ? <small className="field-error">{error}</small> : null}
    </fieldset>
  );
}

function InquiryBlock({
  children,
  copy,
  eyebrow,
  title
}: {
  children: ReactNode;
  copy?: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <section className="inquiry-form-section">
      <div className="inquiry-form-section-heading">
        <p>{eyebrow}</p>
        <h3>{title}</h3>
        {copy ? <span>{copy}</span> : null}
      </div>
      <div className="inquiry-form-section-body">{children}</div>
    </section>
  );
}

function InquiryStage({
  children,
  copy,
  title
}: {
  children: ReactNode;
  copy: string;
  title: string;
}) {
  return (
    <section className="inquiry-stage">
      <div className="inquiry-stage-heading">
        <h2>{title}</h2>
        <p>{copy}</p>
      </div>
      <div className="inquiry-stage-body">{children}</div>
    </section>
  );
}

export function DetailedInquiryForm() {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState<InquiryErrors>({});
  const [prepared, setPrepared] = useState(false);

  const preparedSummary = useMemo(
    () =>
      [values.role, values.name, values.email, values.route || values.hostRegion || values.partnerRegion]
        .filter(Boolean)
        .join(" / "),
    [values]
  );

  const message = useMemo(() => {
    if (values.role === "Traveler") {
      return [
        values.finalNotes.trim(),
        values.route ? `Route interest: ${values.route}` : "",
        values.chinaInterests.length
          ? `China interests: ${values.chinaInterests.join(", ")}`
          : "",
        values.diningStyles.length
          ? `Dining style: ${values.diningStyles.join(", ")}`
          : "",
        values.experienceFocus.length
          ? `Experience focus: ${values.experienceFocus.join(", ")}`
          : "",
        values.hostStyle ? `Host style: ${values.hostStyle}` : ""
      ]
        .filter(Boolean)
        .join("\n");
    }

    if (values.role === "Host") {
      return [
        values.hostMotivation ? `Primary hosting fit: ${values.hostMotivation}` : "",
        values.hostLocalWorld ? `Local world: ${values.hostLocalWorld}` : "",
        values.hostRegion ? `Region: ${values.hostRegion}` : ""
      ]
        .filter(Boolean)
        .join("\n");
    }

    return [
      values.partnerIntent ? `Partnership intent: ${values.partnerIntent}` : "",
      values.partnershipType ? `Partnership type: ${values.partnershipType}` : "",
      values.partnerRegion ? `Region: ${values.partnerRegion}` : ""
    ]
      .filter(Boolean)
      .join("\n");
  }, [values]);

  function updateField(field: keyof DetailedInquiryState, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setPrepared(false);
  }

  function toggleChoice(field: MultiChoiceField, option: string) {
    setValues((current) => {
      const currentValue = current[field];
      return {
        ...current,
        [field]: currentValue.includes(option)
          ? currentValue.filter((item) => item !== option)
          : [...currentValue, option]
      };
    });
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

    if (values.role === "Traveler") {
      if (!values.origin.trim()) nextErrors.origin = "Please share where you are from.";
      if (!values.timing.trim()) nextErrors.timing = "Please share a rough timing.";
      if (!values.groupSize) nextErrors.groupSize = "Please choose a group size.";
      if (!values.tripLength) nextErrors.tripLength = "Please choose a rough length.";
      if (!values.route) nextErrors.route = "Please choose a route direction.";
      if (values.diningStyles.length === 0) {
        nextErrors.diningStyles = "Please choose at least one dining style.";
      }
      if (values.experienceFocus.length === 0) {
        nextErrors.experienceFocus = "Please choose at least one experience focus.";
      }
      if (!values.hostStyle) nextErrors.hostStyle = "Please choose a host style.";
    }

    if (values.role === "Host" && !values.hostMotivation) {
      nextErrors.hostMotivation = "Please choose the local world you can host.";
    }

    if (values.role === "Partner" && !values.partnerIntent) {
      nextErrors.partnerIntent = "Please choose the partnership intent.";
    }

    return nextErrors;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    const isValid = Object.keys(nextErrors).length === 0;
    setPrepared(isValid);

    if (!isValid) return;

    openInquiryMailto({
      role: values.role,
      name: values.name,
      email: values.email,
      message,
      source: "Detailed inquiry page",
      fields: [
        { label: "Origin / base", value: values.origin },
        { label: "Timing", value: values.timing },
        { label: "Group size", value: values.groupSize },
        { label: "Trip length", value: values.tripLength },
        { label: "Relationship with China", value: values.relationshipWithChina },
        { label: "Traveling with", value: values.travelingWith },
        { label: "Route", value: values.route },
        { label: "China interests", value: values.chinaInterests },
        { label: "Dining style", value: values.diningStyles },
        { label: "Food curiosity", value: values.foodCuriosity },
        { label: "Food focus", value: values.foodFocus },
        { label: "Food restrictions", value: values.foodRestrictions },
        { label: "Alcohol / bar culture", value: values.alcoholBarCulture },
        { label: "Meal privacy", value: values.mealPrivacy },
        { label: "Day rhythm", value: values.dayRhythm },
        { label: "Experience focus", value: values.experienceFocus },
        { label: "Nightlife style", value: values.nightlifeStyle },
        { label: "Shopping / objects", value: values.shoppingObjects },
        { label: "Wellness / recovery", value: values.wellnessRecovery },
        { label: "Hotel direction", value: values.hotelDirection },
        { label: "Transport", value: values.transport },
        { label: "Comfort requirements", value: values.comfortRequirements },
        { label: "Avoidances", value: values.avoidances },
        { label: "Host style", value: values.hostStyle },
        { label: "Host presence", value: values.hostPresence },
        { label: "Language", value: values.languageNeeds },
        { label: "Practical support", value: values.practicalSupport },
        { label: "Final notes", value: values.finalNotes },
        { label: "Host region", value: values.hostRegion },
        { label: "Host languages", value: values.hostLanguages },
        { label: "Host local world", value: values.hostLocalWorld },
        { label: "Host availability", value: values.hostAvailability },
        { label: "Hosted before", value: values.hostExperience },
        { label: "Host fit", value: values.hostMotivation },
        { label: "Organization", value: values.organization },
        { label: "Partnership type", value: values.partnershipType },
        { label: "Partner region", value: values.partnerRegion },
        { label: "Partner intent", value: values.partnerIntent }
      ]
    });
  }

  return (
    <form
      aria-label="Detailed private route inquiry"
      className="inquiry-form detailed-inquiry-form"
      onSubmit={handleSubmit}
    >
      <div aria-label="Inquiry path" className="entry-path-grid" role="radiogroup">
        {roleCards.map((card) => (
          <button
            aria-checked={values.role === card.role}
            className={`entry-path-card${card.role === "Traveler" ? " entry-path-card--primary" : ""}`}
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

      {values.role === "Traveler" ? (
        <>
          <InquiryStage
            copy="Start with who is traveling, when, and the first China you want to understand."
            title="Essential Intake"
          >
            <InquiryBlock
              copy="Start with the practical frame: timing, group shape, and how familiar China already feels."
              eyebrow="Traveler Basics"
              title="Who is entering China, and with what context?"
            >
              <div className="field-pair">
                <InputField
                  error={errors.name}
                  label="Name"
                  name="name"
                  onChange={updateField}
                  value={values.name}
                />
                <InputField
                  error={errors.email}
                  label="Email"
                  name="email"
                  onChange={updateField}
                  type="email"
                  value={values.email}
                />
              </div>
              <div className="field-pair">
                <InputField
                  error={errors.origin}
                  label="Where are you from?"
                  name="origin"
                  onChange={updateField}
                  value={values.origin}
                />
                <InputField
                  error={errors.timing}
                  label="When are you considering China?"
                  name="timing"
                  onChange={updateField}
                  value={values.timing}
                />
              </div>
              <div className="field-pair">
                <SelectField
                  error={errors.groupSize}
                  label="Number of travelers"
                  name="groupSize"
                  onChange={updateField}
                  options={groupSizeOptions}
                  placeholder="Select group size"
                  value={values.groupSize}
                />
                <SelectField
                  error={errors.tripLength}
                  label="Trip length"
                  name="tripLength"
                  onChange={updateField}
                  options={tripLengthOptions}
                  placeholder="Select trip length"
                  value={values.tripLength}
                />
              </div>
              <div className="field-pair">
                <SelectField
                  label="Relationship with China"
                  name="relationshipWithChina"
                  onChange={updateField}
                  options={relationshipWithChinaOptions}
                  value={values.relationshipWithChina}
                />
                <SelectField
                  label="Traveling with"
                  name="travelingWith"
                  onChange={updateField}
                  options={travelingWithOptions}
                  value={values.travelingWith}
                />
              </div>
            </InquiryBlock>

            <InquiryBlock
              copy="Choose the route direction and the kind of China you want a local host to help you read."
              eyebrow="Route Interest"
              title="What kind of China do you want?"
            >
              <SelectField
                error={errors.route}
                label="Route interest"
                name="route"
                onChange={updateField}
                options={routeOptions}
                placeholder="Select route interest"
                value={values.route}
              />
              <ChoiceGroup
                name="chinaInterests"
                onToggle={toggleChoice}
                options={chinaInterestOptions}
                title="What kind of China do you want?"
                values={values.chinaInterests}
              />
            </InquiryBlock>
          </InquiryStage>

          <InquiryStage
            copy="Food, day rhythm, comfort, transport, host fit, and support needs help us shape the route without flattening it into a template."
            title="Taste & Comfort Details"
          >
            <InquiryBlock
              copy="Food is often the most direct way into a place. This helps us understand risk, privacy, appetite, and table rhythm."
              eyebrow="Food Preferences"
              title="How do you want to eat?"
            >
            <ChoiceGroup
              error={errors.diningStyles}
              name="diningStyles"
              onToggle={toggleChoice}
              options={diningStyleOptions}
              title="Dining style"
              values={values.diningStyles}
            />
            <ChoiceGroup
              name="foodCuriosity"
              onToggle={toggleChoice}
              options={foodCuriosityOptions}
              title="Food curiosity"
              values={values.foodCuriosity}
            />
            <ChoiceGroup
              name="foodFocus"
              onToggle={toggleChoice}
              options={foodFocusOptions}
              title="Food focus"
              values={values.foodFocus}
            />
            <ChoiceGroup
              name="foodRestrictions"
              onToggle={toggleChoice}
              options={foodRestrictionOptions}
              title="Food restrictions"
              values={values.foodRestrictions}
            />
            <ChoiceGroup
              name="alcoholBarCulture"
              onToggle={toggleChoice}
              options={alcoholBarCultureOptions}
              title="Alcohol / bar culture"
              values={values.alcoholBarCulture}
            />
            <ChoiceGroup
              name="mealPrivacy"
              onToggle={toggleChoice}
              options={mealPrivacyOptions}
              title="Meal privacy"
              values={values.mealPrivacy}
            />
          </InquiryBlock>

          <InquiryBlock
            copy="This is the shape of your days: how much movement, how much depth, and where comfort should interrupt the schedule."
            eyebrow="Play / Experience Preferences"
            title="How do you want to spend the day?"
          >
            <ChoiceGroup
              name="dayRhythm"
              onToggle={toggleChoice}
              options={dayRhythmOptions}
              title="Day rhythm"
              values={values.dayRhythm}
            />
            <ChoiceGroup
              error={errors.experienceFocus}
              name="experienceFocus"
              onToggle={toggleChoice}
              options={experienceFocusOptions}
              title="Experience focus"
              values={values.experienceFocus}
            />
            <ChoiceGroup
              name="nightlifeStyle"
              onToggle={toggleChoice}
              options={nightlifeStyleOptions}
              title="Nightlife style"
              values={values.nightlifeStyle}
            />
            <ChoiceGroup
              name="shoppingObjects"
              onToggle={toggleChoice}
              options={shoppingObjectsOptions}
              title="Shopping / objects"
              values={values.shoppingObjects}
            />
            <ChoiceGroup
              name="wellnessRecovery"
              onToggle={toggleChoice}
              options={wellnessRecoveryOptions}
              title="Wellness / recovery"
              values={values.wellnessRecovery}
            />
          </InquiryBlock>

          <InquiryBlock
            copy="These details help us understand the background infrastructure around the journey: hotels, movement, privacy, and what to avoid."
            eyebrow="Comfort / Rich-Person Logistics"
            title="What needs to feel easy?"
          >
            <SelectField
              label="Hotel direction"
              name="hotelDirection"
              onChange={updateField}
              options={hotelDirectionOptions}
              value={values.hotelDirection}
            />
            <ChoiceGroup
              name="transport"
              onToggle={toggleChoice}
              options={transportOptions}
              title="Transport"
              values={values.transport}
            />
            <ChoiceGroup
              name="comfortRequirements"
              onToggle={toggleChoice}
              options={comfortRequirementOptions}
              title="Small comfort requirements"
              values={values.comfortRequirements}
            />
            <ChoiceGroup
              name="avoidances"
              onToggle={toggleChoice}
              options={avoidanceOptions}
              title="Avoid if possible"
              values={values.avoidances}
            />
          </InquiryBlock>

          <InquiryBlock eyebrow="Host Fit" title="What kind of host fits you?">
            <div className="field-pair">
              <SelectField
                error={errors.hostStyle}
                label="Host style"
                name="hostStyle"
                onChange={updateField}
                options={hostStyleOptions}
                placeholder="Select host style"
                value={values.hostStyle}
              />
              <SelectField
                label="Host presence"
                name="hostPresence"
                onChange={updateField}
                options={hostPresenceOptions}
                value={values.hostPresence}
              />
            </div>
            <SelectField
              label="Language"
              name="languageNeeds"
              onChange={updateField}
              options={languageNeedOptions}
              value={values.languageNeeds}
            />
          </InquiryBlock>

          <InquiryBlock
            eyebrow="Practical Support"
            title="What do you need held for you?"
          >
            <ChoiceGroup
              name="practicalSupport"
              onToggle={toggleChoice}
              options={practicalSupportOptions}
              title="Support needs"
              values={values.practicalSupport}
            />
          </InquiryBlock>

          <InquiryBlock
            eyebrow="Final Optional Notes"
            title="Anything unusually specific, sensitive, or important?"
          >
            <TextAreaField
              label="Anything unusually specific, sensitive, or important that the options did not capture?"
              name="finalNotes"
              onChange={updateField}
              placeholder="Example: I need clean bathrooms and coffee. I hate crowds. I care more about food than landmarks. I want local alcohol culture but not heavy drinking. I need private rooms for business meals."
              rows={6}
              value={values.finalNotes}
            />
          </InquiryBlock>
          </InquiryStage>
        </>
      ) : null}

      {values.role === "Host" ? (
        <InquiryBlock
          copy="Host inquiries stay shorter here. The first question is fit, judgment, and the local world you can represent."
          eyebrow="Host Inquiry"
          title="Represent a local world with care."
        >
          <div className="field-pair">
            <InputField
              error={errors.name}
              label="Name"
              name="name"
              onChange={updateField}
              value={values.name}
            />
            <InputField
              error={errors.email}
              label="Email"
              name="email"
              onChange={updateField}
              type="email"
              value={values.email}
            />
          </div>
          <div className="field-pair">
            <InputField
              label="City / region"
              name="hostRegion"
              onChange={updateField}
              value={values.hostRegion}
            />
            <InputField
              label="Languages"
              name="hostLanguages"
              onChange={updateField}
              value={values.hostLanguages}
            />
          </div>
          <div className="field-pair">
            <InputField
              label="Local knowledge areas"
              name="hostLocalWorld"
              onChange={updateField}
              value={values.hostLocalWorld}
            />
            <SelectField
              label="Availability style"
              name="hostAvailability"
              onChange={updateField}
              options={hostAvailabilityOptions}
              value={values.hostAvailability}
            />
          </div>
          <div className="field-pair">
            <SelectField
              label="Hosted international visitors before?"
              name="hostExperience"
              onChange={updateField}
              options={hostExperienceOptions}
              value={values.hostExperience}
            />
            <SelectField
              error={errors.hostMotivation}
              label="Primary hosting fit"
              name="hostMotivation"
              onChange={updateField}
              options={hostMotivationOptions}
              value={values.hostMotivation}
            />
          </div>
        </InquiryBlock>
      ) : null}

      {values.role === "Partner" ? (
        <InquiryBlock
          copy="Partner inquiries are reviewed for chapter fit, trust, and local operating reality."
          eyebrow="Partner Inquiry"
          title="Build a relationship or chapter with Localhost."
        >
          <div className="field-pair">
            <InputField
              error={errors.name}
              label="Name"
              name="name"
              onChange={updateField}
              value={values.name}
            />
            <InputField
              error={errors.email}
              label="Email"
              name="email"
              onChange={updateField}
              type="email"
              value={values.email}
            />
          </div>
          <div className="field-pair">
            <InputField
              label="Organization"
              name="organization"
              onChange={updateField}
              value={values.organization}
            />
            <SelectField
              label="Partnership type"
              name="partnershipType"
              onChange={updateField}
              options={partnershipOptions}
              value={values.partnershipType}
            />
          </div>
          <div className="field-pair">
            <InputField
              label="City / region"
              name="partnerRegion"
              onChange={updateField}
              value={values.partnerRegion}
            />
            <SelectField
              error={errors.partnerIntent}
              label="Partnership intent"
              name="partnerIntent"
              onChange={updateField}
              options={partnerIntentOptions}
              value={values.partnerIntent}
            />
          </div>
        </InquiryBlock>
      ) : null}

      <div className="inquiry-actions inquiry-actions--sticky">
        <button className="button button--dark" type="submit">
          Request Private Route Review
        </button>
        <p>
          Submit a private inquiry. We review fit, timing, and local feasibility
          before any route is confirmed.
        </p>
      </div>

      {prepared ? (
        <div className="form-status form-status--success" role="status">
          <strong>
            Inquiry prepared. Send it by email so we can review route fit,
            timing, and host availability.
          </strong>
          <p>
            {preparedSummary ? `${preparedSummary}. ` : null}
            If your email client does not open, please contact us directly at{" "}
            <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
          </p>
        </div>
      ) : null}
    </form>
  );
}
