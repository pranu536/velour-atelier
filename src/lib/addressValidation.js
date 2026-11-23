/**
 * Validation rules and sanitizer for Indian delivery addresses
 */

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Chandigarh",
  "Puducherry",
  "Jammu and Kashmir",
  "Ladakh",
];

// Indian Phone: 10 digits starting with 6, 7, 8, 9, optional +91 prefix
const PHONE_REGEX = /^(?:\+91[\-\s]?)?[6-9]\d{9}$/;

// Indian Postal PIN Code: 6 digits, first digit non-zero (1-9)
const PIN_REGEX = /^[1-9][0-9]{5}$/;

export function validateAddress(data) {
  const errors = {};

  // Full Name
  const fullName = (data.fullName || "").trim();
  if (!fullName) {
    errors.fullName = "Full name is required.";
  } else if (fullName.length < 2) {
    errors.fullName = "Full name must be at least 2 characters.";
  } else if (fullName.length > 60) {
    errors.fullName = "Full name cannot exceed 60 characters.";
  }

  // Phone Number
  const phone = (data.phone || "").trim().replace(/[\s\-]/g, "");
  if (!phone) {
    errors.phone = "Phone number is required.";
  } else if (!PHONE_REGEX.test(phone)) {
    errors.phone = "Please enter a valid 10-digit Indian mobile number.";
  }

  // House Number / Building
  const houseNumber = (data.houseNumber || "").trim();
  if (!houseNumber) {
    errors.houseNumber = "House / Flat / Building details are required.";
  } else if (houseNumber.length > 100) {
    errors.houseNumber = "House number cannot exceed 100 characters.";
  }

  // Street / Area
  const street = (data.street || "").trim();
  if (!street) {
    errors.street = "Street / Area details are required.";
  } else if (street.length < 3) {
    errors.street = "Street address must be at least 3 characters.";
  } else if (street.length > 150) {
    errors.street = "Street address cannot exceed 150 characters.";
  }

  // Landmark (optional)
  const landmark = (data.landmark || "").trim();
  if (landmark.length > 100) {
    errors.landmark = "Landmark cannot exceed 100 characters.";
  }

  // City
  const city = (data.city || "").trim();
  if (!city) {
    errors.city = "City is required.";
  } else if (city.length < 2) {
    errors.city = "City must be at least 2 characters.";
  }

  // State
  const state = (data.state || "").trim();
  if (!state) {
    errors.state = "State is required.";
  }

  // Postal Code (PIN Code)
  const postalCode = (data.postalCode || "").trim();
  if (!postalCode) {
    errors.postalCode = "PIN code is required.";
  } else if (!PIN_REGEX.test(postalCode)) {
    errors.postalCode = "Please enter a valid 6-digit Indian PIN code.";
  }

  // Country
  const country = (data.country || "India").trim();

  // Normalize phone to format +91 XXXXXXXXXX if 10 digits
  let normalizedPhone = phone;
  if (/^[6-9]\d{9}$/.test(phone)) {
    normalizedPhone = `+91 ${phone}`;
  } else if (phone.startsWith("+91") && phone.length === 13) {
    normalizedPhone = `+91 ${phone.slice(3)}`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized: {
      fullName,
      phone: normalizedPhone,
      houseNumber,
      street,
      landmark: landmark || null,
      city,
      state,
      postalCode,
      country,
      isDefault: Boolean(data.isDefault),
    },
  };
}

