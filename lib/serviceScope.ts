export const serviceLevels = [
  {
    title: "Route Advisory",
    summary: "A route direction and practical preparation for independent travel.",
    presence: "You travel independently. A host and driver are not included by default.",
    preparation: "A written route outline, choices to resolve, and preparation notes.",
    support: "Pre-departure review. Any support during travel is agreed separately."
  },
  {
    title: "Hosted Private Route",
    summary: "A selected host for agreed visits, meals, and moments that benefit from interpretation.",
    presence: "Host dates, visits, and hours are agreed in advance; all-day accompaniment is not assumed.",
    preparation: "Route design and host matching, with a clear meeting point and plan for each hosted day.",
    support: "A coordination contact during the agreed window. A driver is arranged separately when needed."
  },
  {
    title: "Fully Held China Route",
    summary: "One coordination lead brings the route, hosts, transport, and daily arrangements together.",
    presence: "The proposal identifies who joins each day, including any independent time and separate driver.",
    preparation: "An agreed route, reservation responsibilities, transfer plan, and named coordination lead.",
    support: "Day-of changes within the agreed scope and contact hours, not 24/7 personal staffing or emergency response."
  }
] as const;
