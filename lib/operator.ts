type OperatorEnvironment = Record<string, string | undefined>;

export const approvedOperator = {
  name: "Eric Yao",
  contact: "yaohaohui2014@hotmail.com"
};

export function publicOperator(environment: OperatorEnvironment) {
  const name = environment.LOCALHOST_OPERATOR_NAME?.trim() || approvedOperator.name;
  const bio = environment.LOCALHOST_OPERATOR_BIO?.trim() || "";
  const contact = environment.LOCALHOST_CONTACT_EMAIL?.trim() || approvedOperator.contact;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) return null;
  return { name, bio, contact };
}
