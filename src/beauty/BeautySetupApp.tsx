import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, Eye, RotateCcw } from "lucide-react";
import {
  beautySetupSteps,
  beautyWeekdayLabels,
  buildBeautyPublicProfile,
  getBeautyStepProgress,
  validateBeautyStep,
  type BeautySetupStep,
  type BeautyWeekday,
  type BeautyWorkspace,
} from "./beautySetupModel";
import { loadBeautyWorkspace, resetBeautyWorkspace, saveBeautyWorkspace } from "./beautyStorage";
import "./beauty-setup.css";

const stepLabels: Record<(typeof beautySetupSteps)[number], string> = {
  pro_setup_profile: "Profil",
  pro_setup_service: "Služba",
  pro_setup_availability: "Dostupnost",
  pro_setup_review: "Kontrola",
};

const previousStep = (step: BeautySetupStep): BeautySetupStep => {
  const index = beautySetupSteps.indexOf(step as (typeof beautySetupSteps)[number]);
  return index > 0 ? beautySetupSteps[index - 1] : "pro_setup_profile";
};

const nextStep = (step: BeautySetupStep): BeautySetupStep => {
  const index = beautySetupSteps.indexOf(step as (typeof beautySetupSteps)[number]);
  return index >= 0 && index < beautySetupSteps.length - 1 ? beautySetupSteps[index + 1] : "pro_setup_review";
};

export function BeautySetupApp() {
  const [workspace, setWorkspace] = useState<BeautyWorkspace | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => { void loadBeautyWorkspace().then(setWorkspace); }, []);

  const publicProfile = useMemo(() => workspace ? buildBeautyPublicProfile(workspace) : null, [workspace]);

  const persist = async (next: BeautyWorkspace) => {
    setSaving(true);
    try { setWorkspace(await saveBeautyWorkspace(next)); }
    finally { setSaving(false); }
  };

  if (!workspace || !publicProfile) return <main className="beauty-shell"><p>Načítám Beauty workspace…</p></main>;

  const update = (patch: Partial<BeautyWorkspace>) => setWorkspace({ ...workspace, ...patch });
  const updateProfile = (patch: Partial<BeautyWorkspace["profile"]>) => update({ profile: { ...workspace.profile, ...patch } });
  const updateService = (patch: Partial<BeautyWorkspace["service"]>) => update({ service: { ...workspace.service, ...patch } });
  const updateAvailability = (patch: Partial<BeautyWorkspace["availability"]>) => update({ availability: { ...workspace.availability, ...patch } });

  const goForward = async () => {
    const validation = validateBeautyStep(workspace, workspace.currentStep);
    setErrors(validation);
    if (validation.length) return;
    await persist({ ...workspace, currentStep: nextStep(workspace.currentStep) });
  };

  const publish = async () => {
    const validation = beautySetupSteps.flatMap((step) => validateBeautyStep(workspace, step));
    setErrors(validation);
    if (validation.length) return;
    await persist({ ...workspace, published: true, currentStep: "pro_setup_published" });
  };

  const reset = async () => {
    if (!window.confirm("Smazat pouze lokální Beauty data v tomto prohlížeči?")) return;
    setWorkspace(await resetBeautyWorkspace());
    setErrors([]);
  };

  const progress = getBeautyStepProgress(workspace.currentStep);
  const isPreview = workspace.currentStep === "pro_public_preview";
  const isPublished = workspace.currentStep === "pro_setup_published";

  return (
    <main className="beauty-shell">
      <header className="beauty-topbar">
        <a href="/" className="beauty-back"><ArrowLeft size={18} /> GO IRL</a>
        <div><strong>Beauty</strong><small>local-first · bez cloudu</small></div>
        <button type="button" className="beauty-reset" onClick={() => void reset()}><RotateCcw size={17} /> Reset</button>
      </header>

      {!isPreview && !isPublished && progress && (
        <section className="beauty-progress" aria-label="Průběh nastavení">
          <div><strong>Krok {progress.current} z {progress.total}</strong><span>{stepLabels[workspace.currentStep as (typeof beautySetupSteps)[number]]}</span></div>
          <ol>{beautySetupSteps.map((step, index) => <li key={step} className={index < progress.current ? "done" : ""}>{index + 1}</li>)}</ol>
        </section>
      )}

      {errors.length > 0 && <div className="beauty-errors" role="alert">{errors.map((error) => <p key={error}>{error}</p>)}</div>}

      {workspace.currentStep === "pro_setup_profile" && <section className="beauty-card">
        <h1>Váš profesionální profil</h1><p>Veřejná stránka ukáže jméno, město a oblast. Kontakt a přesná adresa zůstávají neveřejné.</p>
        <label>Veřejné jméno<input value={workspace.profile.displayName} onChange={(e) => updateProfile({ displayName: e.target.value })} /></label>
        <label>Město<input value={workspace.profile.city} onChange={(e) => updateProfile({ city: e.target.value })} /></label>
        <label>Veřejná oblast<input value={workspace.profile.publicLocation} onChange={(e) => updateProfile({ publicLocation: e.target.value })} /></label>
        <div className="beauty-private"><strong>Jen po potvrzení rezervace</strong>
          <label>Kontakt<input value={workspace.profile.contact} onChange={(e) => updateProfile({ contact: e.target.value })} /></label>
          <label>Přesná adresa<input value={workspace.profile.exactAddress} onChange={(e) => updateProfile({ exactAddress: e.target.value })} /></label>
        </div>
      </section>}

      {workspace.currentStep === "pro_setup_service" && <section className="beauty-card">
        <h1>První služba</h1>
        <label>Název služby<input value={workspace.service.name} onChange={(e) => updateService({ name: e.target.value })} /></label>
        <div className="beauty-grid"><label>Délka (min)<input type="number" min="1" value={workspace.service.durationMinutes} onChange={(e) => updateService({ durationMinutes: Number(e.target.value) })} /></label>
        <label>Cena (Kč)<input type="number" min="0" value={workspace.service.priceCzk} onChange={(e) => updateService({ priceCzk: Number(e.target.value) })} /></label></div>
        <label>Buffer po službě (min)<input type="number" min="0" value={workspace.service.bufferMinutes} onChange={(e) => updateService({ bufferMinutes: Number(e.target.value) })} /></label>
      </section>}

      {workspace.currentStep === "pro_setup_availability" && <section className="beauty-card">
        <h1>Pravidelná dostupnost</h1><p>Toto je opakující se týdenní pravidlo. Jednorázové bloky času přidáte později.</p>
        <div className="beauty-days">{(Object.keys(beautyWeekdayLabels) as BeautyWeekday[]).map((day) => {
          const selected = workspace.availability.weekdays.includes(day);
          return <button key={day} type="button" className={selected ? "selected" : ""} onClick={() => updateAvailability({ weekdays: selected ? workspace.availability.weekdays.filter((item) => item !== day) : [...workspace.availability.weekdays, day] })}>{beautyWeekdayLabels[day]}</button>;
        })}</div>
        <div className="beauty-grid"><label>Od<input type="time" value={workspace.availability.startTime} onChange={(e) => updateAvailability({ startTime: e.target.value })} /></label><label>Do<input type="time" value={workspace.availability.endTime} onChange={(e) => updateAvailability({ endTime: e.target.value })} /></label></div>
        <label className="beauty-check"><input type="checkbox" checked={workspace.availability.breakEnabled} onChange={(e) => updateAvailability({ breakEnabled: e.target.checked })} /> Pravidelná pauza</label>
        {workspace.availability.breakEnabled && <div className="beauty-grid"><label>Od<input type="time" value={workspace.availability.breakStart} onChange={(e) => updateAvailability({ breakStart: e.target.value })} /></label><label>Do<input type="time" value={workspace.availability.breakEnd} onChange={(e) => updateAvailability({ breakEnd: e.target.value })} /></label></div>}
      </section>}

      {workspace.currentStep === "pro_setup_review" && <section className="beauty-card">
        <h1>Zkontrolujte publikaci</h1>
        <div className="beauty-summary"><button type="button" onClick={() => void persist({ ...workspace, currentStep: "pro_setup_profile" })}>Upravit profil</button><strong>{workspace.profile.displayName}</strong><span>{workspace.profile.publicLocation}</span></div>
        <div className="beauty-summary"><button type="button" onClick={() => void persist({ ...workspace, currentStep: "pro_setup_service" })}>Upravit službu</button><strong>{workspace.service.name}</strong><span>{workspace.service.durationMinutes} min · {workspace.service.priceCzk} Kč</span></div>
        <div className="beauty-summary"><button type="button" onClick={() => void persist({ ...workspace, currentStep: "pro_setup_availability" })}>Upravit dostupnost</button><strong>{workspace.availability.weekdays.map((day) => beautyWeekdayLabels[day]).join(", ")}</strong><span>{workspace.availability.startTime}–{workspace.availability.endTime}</span></div>
        <div className="beauty-private"><strong>Neveřejné údaje</strong><p>{workspace.profile.contact}<br />{workspace.profile.exactAddress}</p></div>
      </section>}

      {isPublished && <section className="beauty-card beauty-success"><Check size={34} /><h1>Rezervační stránka je připravena</h1><p>Jde o lokální mock publikaci. Neodeslala žádná data na server.</p><code>{workspace.publicLink}</code><button type="button" className="beauty-primary" onClick={() => void persist({ ...workspace, currentStep: "pro_public_preview" })}><Eye size={18} /> Veřejný náhled</button></section>}

      {isPreview && <section className="beauty-card beauty-preview"><span>Veřejný náhled · pouze pro čtení</span><h1>{publicProfile.displayName}</h1><p>{publicProfile.publicLocation}</p><article><h2>{publicProfile.serviceName}</h2><p>{publicProfile.durationMinutes} min · {publicProfile.priceCzk} Kč</p></article><p>Dostupnost: {publicProfile.weekdays.map((day) => beautyWeekdayLabels[day]).join(", ")} · {publicProfile.startTime}–{publicProfile.endTime}</p><button type="button" onClick={() => void persist({ ...workspace, currentStep: "pro_setup_published" })}>Zpět k publikaci</button></section>}

      {!isPublished && !isPreview && <footer className="beauty-actions">
        {workspace.currentStep !== "pro_setup_profile" && <button type="button" onClick={() => void persist({ ...workspace, currentStep: previousStep(workspace.currentStep) })}>Zpět</button>}
        {workspace.currentStep === "pro_setup_review" ? <button type="button" className="beauty-primary" disabled={saving} onClick={() => void publish()}>Publikovat lokálně</button> : <button type="button" className="beauty-primary" disabled={saving} onClick={() => void goForward()}>Pokračovat</button>}
      </footer>}
    </main>
  );
}
