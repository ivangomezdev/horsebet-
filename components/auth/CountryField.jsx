"use client";
import { useMemo } from "react";
import { getCountryCallingCode } from "libphonenumber-js";
import { countryCodes } from "../../lib/auth/validation";
export default function CountryField({
  value,
  onChange,
  phonePrefix = false,
  id = "country",
  label = "País",
}) {
  const countries = useMemo(() => {
    const names = new Intl.DisplayNames(["es"], { type: "region" });
    return countryCodes
      .map((code) => ({ code, name: names.of(code) }))
      .sort((a, b) => a.name.localeCompare(b.name, "es"));
  }, []);
  return (
    <label
      className={`country-field ${phonePrefix ? "country-field--prefix" : ""}`}
      htmlFor={id}
    >
      <span>{label}</span>
      <span className="country-field__control">
        {value && (
          <img src={`/flags/${value}.svg`} alt="" width="22" height="16" />
        )}
        <select
          id={id}
          aria-label={label}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required
        >
          <option value="">
            {phonePrefix ? "País" : "Selecciona tu país"}
          </option>
          {countries.map((country) => (
            <option key={country.code} value={country.code}>
              {phonePrefix
                ? `+${getCountryCallingCode(country.code)} · ${country.name}`
                : country.name}
            </option>
          ))}
        </select>
      </span>
    </label>
  );
}
