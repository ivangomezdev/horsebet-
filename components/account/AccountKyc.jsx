"use client";
import { useEffect, useState } from "react";
import {
  LockKeyhole,
  Upload,
  BadgeCheck,
  FileImage,
  ShieldCheck,
} from "lucide-react";
import CountryField from "../auth/CountryField";
import { apiRequest } from "../auth/AuthProvider";
import { kycLabels, documentLabels } from "../../data/account";
const empty = {
  fullName: "",
  birthDate: "",
  country: "",
  address: "",
  city: "",
  postalCode: "",
  politicallyExposed: false,
};
export default function AccountKyc({ data, canEdit, onSaved }) {
  const [form, setForm] = useState(empty),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [fields, setFields] = useState({}),
    [links, setLinks] = useState({});
  useEffect(() => {
    setForm(
      data?.kycDraft || {
        ...empty,
        country: data?.profile?.country_code || "",
      },
    );
  }, [data]);
  const status = data?.kyc?.status || "not_started",
    locked = ["in_review", "verified"].includes(status),
    saved = Boolean(data?.kycDraft),
    hasIdentity = data?.files?.some((file) => file.kind === "identity_front");
  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setFields({});
    try {
      await apiRequest("/api/account/kyc/", { action: "save", data: form });
      await onSaved("Datos de verificación guardados.");
    } catch (problem) {
      setError(problem.message);
      setFields(problem.fields || {});
    } finally {
      setBusy(false);
    }
  };
  const upload = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await apiRequest(
        "/api/account/files/",
        new FormData(event.currentTarget),
      );
      event.target.reset();
      await onSaved("Documento guardado en almacenamiento privado.");
    } catch (problem) {
      setError(problem.message);
    } finally {
      setBusy(false);
    }
  };
  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      await apiRequest("/api/account/kyc/", { action: "submit" });
      await onSaved("Verificación enviada. Su estado es «En revisión».");
    } catch (problem) {
      setError(problem.message);
    } finally {
      setBusy(false);
    }
  };
  const openFile = async (id) => {
    try {
      const result = await apiRequest("/api/account/files/", { id }, "PUT");
      setLinks((previous) => ({ ...previous, [id]: result.url }));
    } catch (problem) {
      setError(problem.message);
    }
  };
  return (
    <div className="account-kyc">
      {error && (
        <p className="account-message account-message--error" role="alert">
          {error}
        </p>
      )}
      <section className="account-panel">
        <div className="account-panel__title">
          <div>
            <h2>KYC</h2>
            <p>
              Completa tus datos personales y carga un documento de identidad
              para solicitar la verificación de tu cuenta.
            </p>
          </div>
          <span
            className={`account-status ${status === "verified" ? "account-status--success" : "account-status--pending"}`}
          >
            {kycLabels[status]}
          </span>
        </div>
        <div className="kyc-step">
          <div className="kyc-step__intro">
            <h3>Paso 1</h3>
            <p>Información personal</p>
            <p>
              Comprueba que tus datos coincidan con el documento que
              presentarás. Se guardan cifrados y solo estarán disponibles para
              tu cuenta y el servicio de revisión autorizado.
            </p>
            <ShieldCheck size={42} />
          </div>
          <form className="kyc-form" onSubmit={save}>
            <fieldset disabled={!canEdit || busy || locked}>
              {[
                ["fullName", "Tu nombre", "text"],
                ["birthDate", "Fecha de nacimiento", "date"],
              ].map(([key, label, type]) => (
                <label key={key}>
                  {label}
                  <input
                    value={form[key]}
                    type={type}
                    required
                    maxLength={120}
                    onChange={(event) =>
                      setForm({ ...form, [key]: event.target.value })
                    }
                  />
                </label>
              ))}
              <CountryField
                label="Tu país"
                id="kyc-country"
                value={form.country}
                onChange={(country) => setForm({ ...form, country })}
              />
              {[
                ["address", "Domicilio"],
                ["city", "Ciudad"],
                ["postalCode", "Código postal"],
              ].map(([key, label]) => (
                <label key={key}>
                  {label}
                  <input
                    value={form[key]}
                    required
                    maxLength={
                      key === "address" ? 200 : key === "city" ? 100 : 20
                    }
                    onChange={(event) =>
                      setForm({ ...form, [key]: event.target.value })
                    }
                  />
                </label>
              ))}
              <label>
                Persona políticamente expuesta
                <select
                  value={form.politicallyExposed ? "yes" : "no"}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      politicallyExposed: event.target.value === "yes",
                    })
                  }
                >
                  <option value="no">No</option>
                  <option value="yes">Sí</option>
                </select>
              </label>
              {Object.values(fields).map((value, index) => (
                <small className="auth-field__error" key={index}>
                  {value}
                </small>
              ))}
              {!locked && (
                <button type="submit" className="button button--primary">
                  {busy
                    ? "Guardando…"
                    : saved
                      ? "Actualizar datos"
                      : "Guardar datos"}
                </button>
              )}
            </fieldset>
            {locked && (
              <p className="account-note">
                La información está bloqueada durante la revisión. Su estado no
                puede modificarse desde esta cuenta.
              </p>
            )}
          </form>
        </div>
      </section>
      <section
        className={`account-panel ${!saved ? "account-panel--locked" : ""}`}
      >
        <div className="account-panel__title">
          <h3>Paso 2 · Documentos</h3>
          {!saved ? <LockKeyhole size={21} /> : <FileImage size={21} />}
        </div>
        {saved ? (
          <>
            <p className="account-note">
              Imágenes JPG o PNG, hasta 3 MB. Los archivos se almacenan en un
              depósito privado.
            </p>
            {!locked && (
              <form className="kyc-upload" onSubmit={upload}>
                <fieldset disabled={!canEdit || busy}>
                  <label>
                    Tipo de documento
                    <select name="kind">
                      {Object.entries(documentLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Imagen del documento
                    <input
                      name="file"
                      type="file"
                      accept="image/jpeg,image/png"
                      required
                    />
                  </label>
                  <button className="button button--secondary" type="submit">
                    <Upload size={16} />
                    {busy ? "Subiendo…" : "Cargar documento"}
                  </button>
                </fieldset>
              </form>
            )}
            <div className="kyc-files">
              {data.files.map((file) => (
                <article key={file.id}>
                  <FileImage size={22} />
                  <div>
                    <strong>{documentLabels[file.kind]}</strong>
                    <small>
                      {Math.ceil(file.size_bytes / 1024)} KB ·{" "}
                      {new Date(file.created_at).toLocaleDateString("es-MX")}
                    </small>
                  </div>
                  {links[file.id] ? (
                    <a
                      href={links[file.id]}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Abrir imagen
                    </a>
                  ) : (
                    <button onClick={() => openFile(file.id)}>
                      Ver archivo
                    </button>
                  )}
                </article>
              ))}
            </div>
          </>
        ) : (
          <span className="account-note">
            Guarda tus datos del paso 1 para continuar.
          </span>
        )}
      </section>
      <section
        className={`account-panel ${!hasIdentity ? "account-panel--locked" : ""}`}
      >
        <div className="account-panel__title">
          <h3>Paso 3 · Revisión</h3>
          {!hasIdentity ? <LockKeyhole size={21} /> : <BadgeCheck size={21} />}
        </div>
        {hasIdentity && (
          <>
            <p className="account-note">
              El envío crea una solicitud de revisión. La aprobación debe
              realizarla el proveedor o un revisor autorizado.
            </p>
            <button
              className="button button--primary"
              disabled={!canEdit || busy || locked}
              onClick={submit}
            >
              {status === "verified"
                ? "Identidad verificada"
                : locked
                  ? "En revisión"
                  : "Enviar para revisión"}
            </button>
          </>
        )}
      </section>
    </div>
  );
}
