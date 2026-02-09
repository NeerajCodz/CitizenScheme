import type {
  UserProfile,
  Scheme,
  SchemeRecommendation,
  EligibilityRules,
} from "./types";

function calculateAge(dob: string): number | null {
  if (!dob) return null;

  // Handle DD/MM/YYYY format
  const parts = dob.split("/");
  let date: Date;

  if (parts.length === 3) {
    date = new Date(
      parseInt(parts[2]),
      parseInt(parts[1]) - 1,
      parseInt(parts[0])
    );
  } else {
    date = new Date(dob);
  }

  if (isNaN(date.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < date.getDate())
  ) {
    age--;
  }
  return age;
}

function checkCriteria(
  user: UserProfile,
  rules: EligibilityRules
): { matched: string[]; missing: string[]; score: number } {
  const matched: string[] = [];
  const missing: string[] = [];
  let totalCriteria = 0;
  let metCriteria = 0;

  // Age check
  if (rules.age) {
    totalCriteria++;
    const userAge = calculateAge(user.date_of_birth || "");
    if (userAge !== null) {
      const minOk = !rules.age.min || userAge >= rules.age.min;
      const maxOk = !rules.age.max || userAge <= rules.age.max;
      if (minOk && maxOk) {
        metCriteria++;
        matched.push(
          `Age ${userAge} is within ${rules.age.min || 0}-${rules.age.max || "∞"} range`
        );
      } else {
        missing.push(
          `Age ${userAge} is outside ${rules.age.min || 0}-${rules.age.max || "∞"} range`
        );
      }
    } else {
      missing.push("Date of birth not available");
    }
  }

  // Income check
  if (rules.income?.max) {
    totalCriteria++;
    if (user.annual_income !== null && user.annual_income !== undefined) {
      if (user.annual_income <= rules.income.max) {
        metCriteria++;
        matched.push(
          `Annual income ₹${user.annual_income.toLocaleString()} is within limit`
        );
      } else {
        missing.push(
          `Annual income ₹${user.annual_income.toLocaleString()} exceeds ₹${rules.income.max.toLocaleString()} limit`
        );
      }
    } else {
      missing.push("Income information not provided");
    }
  }

  // Gender check
  if (rules.gender && rules.gender.length > 0) {
    totalCriteria++;
    if (user.gender && rules.gender.includes(user.gender)) {
      metCriteria++;
      matched.push(`Gender ${user.gender} matches requirement`);
    } else {
      missing.push(
        `Gender must be ${rules.gender.join(" or ")}`
      );
    }
  }

  // Caste check
  if (rules.caste && rules.caste.length > 0) {
    totalCriteria++;
    if (user.caste_category && rules.caste.includes(user.caste_category)) {
      metCriteria++;
      matched.push(`Category ${user.caste_category} is eligible`);
    } else {
      missing.push(
        `Category must be ${rules.caste.join(", ")}`
      );
    }
  }

  // State check
  if (rules.states && rules.states.length > 0) {
    totalCriteria++;
    const userState = user.state || user.address?.state;
    if (userState && rules.states.includes(userState)) {
      metCriteria++;
      matched.push(`State ${userState} is covered`);
    } else {
      missing.push(
        `Available in: ${rules.states.join(", ")}`
      );
    }
  }

  // Occupation check
  if (rules.occupation && rules.occupation.length > 0) {
    totalCriteria++;
    if (user.occupation && rules.occupation.includes(user.occupation)) {
      metCriteria++;
      matched.push(`Occupation ${user.occupation} qualifies`);
    } else {
      missing.push(
        `Occupation must be: ${rules.occupation.join(", ")}`
      );
    }
  }

  // Disability check
  if (rules.disability === true) {
    totalCriteria++;
    if (user.disability_status && user.disability_status !== "none") {
      metCriteria++;
      matched.push("Disability status verified");
    } else {
      missing.push("Requires disability status");
    }
  }

  // ID verification check
  if (rules.required_documents && rules.required_documents.length > 0) {
    totalCriteria++;
    if (user.id_verified) {
      metCriteria++;
      matched.push("ID document verified");
    } else {
      missing.push("ID document verification required");
    }
  }

  const score =
    totalCriteria > 0
      ? Math.round((metCriteria / totalCriteria) * 100)
      : 100; // If no criteria, everyone qualifies

  return { matched, missing, score };
}

export function getSchemeRecommendations(
  user: UserProfile,
  schemes: Scheme[]
): SchemeRecommendation[] {
  return schemes
    .map((scheme) => {
      const { matched, missing, score } = checkCriteria(
        user,
        scheme.eligibility_rules
      );
      return {
        ...scheme,
        eligibility_score: score,
        matching_criteria: matched,
        missing_criteria: missing,
      };
    })
    .sort((a, b) => b.eligibility_score - a.eligibility_score);
}
