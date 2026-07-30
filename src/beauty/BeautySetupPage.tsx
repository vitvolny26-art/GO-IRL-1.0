import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, Eye, RotateCcw, Save, Share2, Sparkles } from "lucide-react";
import {
  beautySetupSteps,
  beautyWeekdayLabels,
  buildBeautyPublicProfile,
  createDefaultBeautyWorkspace,
  getBeautyStepProgress,
  validateBeautyStep,
  type BeautySetupStep,
  type BeautyWeekday,
  type BeautyWorkspace,
} from "./beautySetupModel";
import { loadBeautyWorkspace, resetBeautyWorkspace, saveBeautyWorkspace } from "./beautyWorkspaceStorage";
import "./beauty-setup.css";

const stepLabels: Record<(typeof beautySetupSteps)[number], string> = {
  pro_setup_profile: "Profil",
  pro_setup_service: "Služba",
  pro_setup_availability: "Dostupnost",
  pro_setup_review: "Kontrola",
};

const stepIndex = (step: BeautySetupStep) => beautySetupSteps.indexOf(step as (typeof beautySetupSteps)[number]);

export function BeautySetupPage() {
  const [workspace, setWorkspace] = useState<BeautyWorkspace>(() => createDefaultBeautyWorkspace());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    void loadBeautyWorkspace()
      .then((loaded) => { if (active) setWorkspace(loaded); })
      .catch(() => { if (active) setNotice("Lokální Beauty data se nepodařilo načíst. Používá se nový návrh."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (loading) return;
    const timer = window.setTimeout(() => {
      setSaving(true);
      void saveBeautyWorkspace({ ...workspace, updatedAt: new Date().toISOString() })
        .catch(() => setNotice("Lokální uložení se nepodařilo."))
        .finally(() => setSaving(false));
    }, 180);
    return () => window.clearTimeout(timer);
  }, [loading, workspace]);

  const progress = getBeautyStepProgress(workspace.currentStep);
  const publicProfile = useMemo(() => buildBeautyPublicProfile(workspace), [workspace]);

  const updateWorkspace = (updater: (current: BeautyWorkspace) => BeautyWorkspace) => {
    setWorkspace((current) => updater(current));
    setErrors([]);
  };

  const goTo = (step: BeautySetupStep) => updateWorkspace((current) => ({ ...current, currentStep: step }));

  const next = () => {
    const validationErrors = validateBeautyStep(workspace, workspace.currentStep);
    if (validationErrors.length) {
      setErrors(validationErrors);
      return;
    }
    const index = stepIndex(workspace.currentStep);
    if (index >= 0 && index < beautySetupSteps.length - 1) goTo(beautySetupSteps[index + 1]);
  };

  const back = () => {
    if (workspace.currentStep === "pro_public_preview") {
      goTo("pro_setup_published");
      return;
    }
    if (workspace.currentStep === "pro_setup_published") {
      goTo("pro_setup_review");
      return;
    }
    const index = stepIndex(workspace.currentStep);
    if (index > 0) goTo(beautySetupSteps[index - 1]);
    else window.history.back();
  };

  const publish = () => {
    const validationErrors = beautySetupSteps.flatMap((step) => validateBeautyStep(workspace, step));
    if (validationErrors.length) {
      setErrors(validationErrors);
      return;
    }
    updateWorkspace((current) => ({ ...current, published: true, currentStep: "pro_setup_published" }));
    setNotice("Mock rezervační stránka je publikovaná pouze v tomto zařízení.");
  };

  const reset = async () => {
    if (!window.confirm("Smazat pouze lokální Beauty data v tomto prohlížeči?")) return;
    await resetBeautyWorkspace();
    setWorkspace(createDefaultBeautyWorkspace());
    setErrors([]);
    setNotice("Lokální Beauty data byla resetována. Ostatní data GO IRL zůstala beze změny.");
  };

  const copyPublicLink = async () => {
    try {
      await navigator.clipboard.writeText(workspace.publicLink);
      setNotice("Fiktivní veřejný odkaz byl zkopírován.");
    } catch {
      setNotice(`Fiktivní odkaz: ${workspace.publicLink}`);
    }
  };

  const renderProfile = () => (
    <div className="beauty-form-grid">
      <label>Veřejné jméno<input value={workspace.profile.displayName} onChange={(event) => updateWorkspace((current) => ({ ...current, profile: { ...current.profile, displayName: event.target.value } }))} /></label>
      <label>Město<input value={workspace.profile.city} onChange={(event) => updateWorkspace((current) => ({ ...current, profile: { ...current.profile, city: event.target.value } }))} /></label>
      <label>Veřejná oblast<input value={workspace.profile.publicLocation} onChange={(event) => updateWorkspace((current) => ({ ...current, profile: { ...current.profile, publicLocation: event.target.value } }))} /><small>Uvidí ji každý návštěvník veřejného náhledu.</small></label>
      <label>Kontaktní údaj<input value={workspace.profile.contact} onChange={(event) => updateWorkspace((current) => ({ ...current, profile: { ...current.profile, contact: event.target.value } }))} /><small>Zůstává pouze v lokálním Professional workspace.</small></label>
      <label className="beauty-span-two">Přesná adresa<input value={workspace.profile.exactAddress} onChange={(event) => updateWorkspace((current) => ({ ...current, profile: { ...current.profile, exactAddress: event.target.value } }))} /><small>Zobrazí se až po potvrzení budoucí rezervace. Veřejný náhled ji nikdy nezobrazuje.</small></label>
    </div>
  );

  const renderService = () => (
    <div className="beauty-form-grid">
      <label className="beauty-span-two">Název služby<input value={workspace.service.name} onChange={(event) => updateWorkspace((current) => ({ ...current, service: { ...current.service, name: event.target.value } }))} /></label>
      <label>Délka, min<input type="number" min="1" value={workspace.service.durationMinutes} onChange={(event) => updateWorkspace((current) => ({ ...current, service: { ...current.service, durationMinutes: Number(event.target.value) } }))} /></label>
      <label>Cena, Kč<input type="number" min="0" value={workspace.service.priceCzk} onChange={(event) => updateWorkspace((current) => ({ ...current, service: { ...current.service, priceCzk: Number(event.target.value) } }))} /></label>
      <label>Buffer po službě, min<input type="number" min="0" value={workspace.service.bufferMinutes} onChange={(event) => updateWorkspace((current) => ({ ...current, service: { ...current.service, bufferMinutes: Number(event.target.value) } }))} /></label>
    </div>
  );

  const toggleWeekday = (weekday: BeautyWeekday) => {
    updateWorkspace((current) => {
      const selected = current.availability.weekdays.includes(weekday);
      return {
        ...current,
        availability: {
          ...current.availability,
          weekdays: selected
            ? current.availability.weekdays.filter((item) => item !== weekday)
            : [...current.availability.weekdays, weekday],
        },
      };
    });
  };

  const renderAvailability = () => (
    <div className="beauty-stack">
      <div className="beauty-note"><strong>Opakovaná dostupnost</strong><span>Určuje běžné pracovní hodiny. Jednorázové Time Blocks budou samostatná funkce v pozdější etapě.</span></div>
      <div className="beauty-weekdays" aria-label="Pracovní dny">
        {(Object.keys(beautyWeekdayLabels) as BeautyWeekday[]).map((weekday) => (
          <button key={weekday} className={workspace.availability.weekdays.includes(weekday) ? "is-selected" : ""} type="button" onClick={() => toggleWeekday(weekday)}>{beautyWeekdayLabels[weekday]}</button>
        ))}
      </div>
      <div className="beauty-form-grid">
        <label>Od<input type="time" value={workspace.availability.startTime} onChange={(event) => updateWorkspace((current) => ({ ...current, availability: { ...current.availability, startTime: event.target.value } }))} /></label>
        <label>Do<input type="time" value={workspace.availability.endTime} onChange={(event) => updateWorkspace((current) => ({ ...current, availability: { ...current.availability, endTime: event.target.value } }))} /></label>
        <label className="beauty-checkbox beauty-span-two"><input type="checkbox" checked={workspace.availability.breakEnabled} onChange={(event) => updateWorkspace((current) => ({ ...current, availability: { ...current.availability, breakEnabled: event.target.checked } }))} />Přidat pravidelnou pauzu</label>
        {workspace.availability.breakEnabled && <><label>Pauza od<input type="time" value={workspace.availability.breakStart} onChange={(event) => updateWorkspace((current) => ({ ...current, availability: { ...current.availability, breakStart: event.target.value } }))} /></label><label>Pauza do<input type="time" value={workspace.availability.breakEnd} onChange={(event) => updateWorkspace((current) => ({ ...current, availability: { ...current.availability, breakEnd: event.target.value } }))} /></label></>}
      </div>
    </div>
  );

  const renderReview = () => (
    <div className="beauty-review-list">
      <button type="button" onClick={() => goTo("pro_setup_profile")}><span><strong>{workspace.profile.displayName}</strong><small>{workspace.profile.publicLocation}</small></span><span>Upravit</span></button>
      <button type="button" onClick={() => goTo("pro_setup_service")}><span><strong>{workspace.service.name}</strong><small>{workspace.service.durationMinutes} min · {workspace.service.priceCzk} Kč · buffer {workspace.service.bufferMinutes} min</small></span><span>Upravit</span></button>
      <button type="button" onClick={() => goTo("pro_setup_availability")}><span><strong>{workspace.availability.weekdays.map((day) => beautyWeekdayLabels[day]).join(", ")}</strong><small>{workspace.availability.startTime}–{workspace.availability.endTime}</small></span><span>Upravit</span></button>
      <div className="beauty-note"><strong>Soukromé údaje</strong><span>Přesná adresa a kontakt zůstávají na tomto zařízení a nejsou součástí veřejného náhledu.</span></div>
    </div>
  );

  const renderPublished = () => (
    <div className="beauty-published">
      <div className="beauty-success"><Check /><div><strong>Lokální mock stránka je připravená</strong><span>Neodeslala se na server a funguje bez WhatsApp i bez sítě.</span></div></div>
      <div className="beauty-public-link"><span>{workspace.publicLink}</span><button type="button" onClick={copyPublicLink}><Share2 size={18} /> Kopírovat mock odkaz</button></div>
      <button className="beauty-primary" type="button" onClick={() => goTo("pro_public_preview")}><Eye size={19} /> Otevřít veřejný náhled</button>
      <button className="beauty-secondary" type="button" onClick={() => goTo("pro_setup_review")}>Upravit nastavení</button>
    </div>
  );

  const renderPublicPreview = () => (
    <div className="beauty-public-preview" aria-label="Veřejný náhled Beauty">
      <span className="beauty-preview-badge">Veřejný náhled · pouze pro čtení</span>
      <h2>{publicProfile.displayName}</h2>
      <p>{publicProfile.publicLocation}</p>
      <div className="beauty-preview-card"><strong>{publicProfile.serviceName}</strong><span>{publicProfile.durationMinutes} min</span><b>{publicProfile.priceCzk} Kč</b></div>
      <div className="beauty-preview-card"><strong>Dostupnost</strong><span>{publicProfile.weekdays.map((day) => beautyWeekdayLabels[day]).join(", ")}</span><span>{publicProfile.startTime}–{publicProfile.endTime}</span></div>
      <div className="beauty-note"><strong>Soukromí</strong><span>Přesná adresa ani kontakt nejsou v tomto náhledu zveřejněné.</span></div>
      <button className="beauty-primary" type="button" disabled>Vybrat termín · mock</button>
    </div>
  );

  const currentContent = workspace.currentStep === "pro_setup_profile"
    ? renderProfile()
    : workspace.currentStep === "pro_setup_service"
      ? renderService()
      : workspace.currentStep === "pro_setup_availability"
        ? renderAvailability()
        : workspace.currentStep === "pro_setup_review"
          ? renderReview()
          : workspace.currentStep === "pro_setup_published"
            ? renderPublished()
            : renderPublicPreview();

  if (loading) return <main className="beauty-shell"><div className="beauty-loading">Načítám lokální Beauty workspace…</div></main>;

  return (
    <main className="beauty-shell">
      <header className="beauty-topbar">
        <button className="beauty-icon-button" type="button" onClick={back} aria-label="Zpět"><ArrowLeft /></button>
        <div><span>GO IRL Beauty · local-first</span><h1>{workspace.currentStep === "pro_public_preview" ? "Veřejný náhled" : "Nastavení rezervační stránky"}</h1></div>
        <button className="beauty-icon-button" type="button" onClick={reset} aria-label="Resetovat lokální Beauty data"><RotateCcw /></button>
      </header>

      {progress && <div className="beauty-progress" aria-label={`Krok ${progress.current} ze ${progress.total}`}>
        <div>{beautySetupSteps.map((step, index) => <span key={step} className={index < progress.current ? "is-active" : ""} />)}</div>
        <p>Krok {progress.current} ze {progress.total} · {stepLabels[workspace.currentStep as (typeof beautySetupSteps)[number]]}</p>
      </div>}

      <section className="beauty-card">
        {currentContent}
        {errors.length > 0 && <div className="beauty-errors" role="alert">{errors.map((error) => <p key={error}>{error}</p>)}</div>}
        {notice && <div className="beauty-notice" role="status">{notice}</div>}
      </section>

      {progress && <footer className="beauty-actions">
        <button className="beauty-secondary" type="button" onClick={back}>Zpět</button>
        {workspace.currentStep === "pro_setup_review"
          ? <button className="beauty-primary" type="button" onClick={publish}><Sparkles size={19} /> Publikovat mock stránku</button>
          : <button className="beauty-primary" type="button" onClick={next}>Pokračovat</button>}
      </footer>}

      <div className="beauty-storage-status"><Save size={15} /> {saving ? "Ukládám lokálně…" : "Uloženo v IndexedDB tohoto zařízení"}</div>
    </main>
  );
}
