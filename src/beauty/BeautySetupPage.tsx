import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, Eye, RotateCcw, Save, Share2, Sparkles } from "lucide-react";
import {
  beautySetupSteps,
  buildBeautyPublicProfile,
  createDefaultBeautyWorkspace,
  getBeautyStepProgress,
  validateBeautyStep,
  type BeautySetupStep,
  type BeautyValidationCode,
  type BeautyWeekday,
  type BeautyWorkspace,
} from "./beautySetupModel";
import { getBeautyCopy, readBeautyLanguage } from "./beautyI18n";
import { loadBeautyWorkspace, resetBeautyWorkspace, saveBeautyWorkspace } from "./beautyWorkspaceStorage";
import "./beauty-setup.css";

const stepIndex = (step: BeautySetupStep) => beautySetupSteps.indexOf(step as (typeof beautySetupSteps)[number]);

export function BeautySetupPage() {
  const language = readBeautyLanguage();
  const text = getBeautyCopy(language);
  const stepLabels = {
    pro_setup_profile: text.profile,
    pro_setup_service: text.service,
    pro_setup_availability: text.availability,
    pro_setup_review: text.review,
  };
  const [workspace, setWorkspace] = useState<BeautyWorkspace>(() => createDefaultBeautyWorkspace(language));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<BeautyValidationCode[]>([]);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    void loadBeautyWorkspace()
      .then((loaded) => { if (active) setWorkspace(loaded); })
      .catch(() => { if (active) setNotice(text.loadError); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [text.loadError]);

  useEffect(() => {
    if (loading) return;
    const timer = window.setTimeout(() => {
      setSaving(true);
      void saveBeautyWorkspace({ ...workspace, updatedAt: new Date().toISOString() })
        .catch(() => setNotice(text.saveError))
        .finally(() => setSaving(false));
    }, 180);
    return () => window.clearTimeout(timer);
  }, [loading, text.saveError, workspace]);

  const publicProfile = useMemo(() => buildBeautyPublicProfile(workspace), [workspace]);
  const progress = getBeautyStepProgress(workspace.currentStep);
  const update = (fn: (current: BeautyWorkspace) => BeautyWorkspace) => { setWorkspace(fn); setErrors([]); };
  const goTo = (step: BeautySetupStep) => update((current) => ({ ...current, currentStep: step }));

  const next = () => {
    const validation = validateBeautyStep(workspace, workspace.currentStep);
    if (validation.length) return setErrors(validation);
    const index = stepIndex(workspace.currentStep);
    if (index >= 0 && index < beautySetupSteps.length - 1) goTo(beautySetupSteps[index + 1]);
  };

  const back = () => {
    if (workspace.currentStep === "pro_public_preview") return goTo("pro_setup_published");
    if (workspace.currentStep === "pro_setup_published") return goTo("pro_setup_review");
    const index = stepIndex(workspace.currentStep);
    if (index > 0) goTo(beautySetupSteps[index - 1]);
    else window.location.assign("/");
  };

  const publish = () => {
    const validation = beautySetupSteps.flatMap((step) => validateBeautyStep(workspace, step));
    if (validation.length) return setErrors(validation);
    update((current) => ({ ...current, published: true, currentStep: "pro_setup_published" }));
  };

  const reset = async () => {
    if (!window.confirm(text.reset)) return;
    await resetBeautyWorkspace();
    setWorkspace(createDefaultBeautyWorkspace(language));
    setErrors([]);
    setNotice(text.resetDone);
  };

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(workspace.publicLink); setNotice(text.copied); }
    catch { setNotice(workspace.publicLink); }
  };

  const toggleDay = (day: BeautyWeekday) => update((current) => ({
    ...current,
    availability: {
      ...current.availability,
      weekdays: current.availability.weekdays.includes(day)
        ? current.availability.weekdays.filter((item) => item !== day)
        : [...current.availability.weekdays, day],
    },
  }));

  const profile = <div className="beauty-form-grid">
    <label>{text.publicName}<input value={workspace.profile.displayName} onChange={(e) => update((c) => ({ ...c, profile: { ...c.profile, displayName: e.target.value } }))} /></label>
    <label>{text.city}<input value={workspace.profile.city} onChange={(e) => update((c) => ({ ...c, profile: { ...c.profile, city: e.target.value } }))} /></label>
    <label>{text.publicArea}<input value={workspace.profile.publicLocation} onChange={(e) => update((c) => ({ ...c, profile: { ...c.profile, publicLocation: e.target.value } }))} /><small>{text.publicAreaHint}</small></label>
    <label>{text.contact}<input value={workspace.profile.contact} onChange={(e) => update((c) => ({ ...c, profile: { ...c.profile, contact: e.target.value } }))} /><small>{text.contactHint}</small></label>
    <label className="beauty-span-two">{text.exactAddress}<input value={workspace.profile.exactAddress} onChange={(e) => update((c) => ({ ...c, profile: { ...c.profile, exactAddress: e.target.value } }))} /><small>{text.exactAddressHint}</small></label>
  </div>;

  const service = <div className="beauty-form-grid">
    <label className="beauty-span-two">{text.serviceName}<input value={workspace.service.name} onChange={(e) => update((c) => ({ ...c, service: { ...c.service, name: e.target.value } }))} /></label>
    <label>{text.duration}<input type="number" min="1" value={workspace.service.durationMinutes} onChange={(e) => update((c) => ({ ...c, service: { ...c.service, durationMinutes: Number(e.target.value) } }))} /></label>
    <label>{text.price}<input type="number" min="0" value={workspace.service.priceCzk} onChange={(e) => update((c) => ({ ...c, service: { ...c.service, priceCzk: Number(e.target.value) } }))} /></label>
    <label>{text.buffer}<input type="number" min="0" value={workspace.service.bufferMinutes} onChange={(e) => update((c) => ({ ...c, service: { ...c.service, bufferMinutes: Number(e.target.value) } }))} /></label>
  </div>;

  const availability = <div className="beauty-stack">
    <div className="beauty-note"><strong>{text.recurring}</strong><span>{text.recurringHint}</span></div>
    <div className="beauty-weekdays" aria-label={text.workdays}>{(Object.keys(text.weekdays) as BeautyWeekday[]).map((day) => <button key={day} type="button" className={workspace.availability.weekdays.includes(day) ? "is-selected" : ""} onClick={() => toggleDay(day)}>{text.weekdays[day]}</button>)}</div>
    <div className="beauty-form-grid">
      <label>{text.from}<input type="time" value={workspace.availability.startTime} onChange={(e) => update((c) => ({ ...c, availability: { ...c.availability, startTime: e.target.value } }))} /></label>
      <label>{text.to}<input type="time" value={workspace.availability.endTime} onChange={(e) => update((c) => ({ ...c, availability: { ...c.availability, endTime: e.target.value } }))} /></label>
      <label className="beauty-checkbox beauty-span-two"><input type="checkbox" checked={workspace.availability.breakEnabled} onChange={(e) => update((c) => ({ ...c, availability: { ...c.availability, breakEnabled: e.target.checked } }))} />{text.addBreak}</label>
      {workspace.availability.breakEnabled && <><label>{text.from}<input type="time" value={workspace.availability.breakStart} onChange={(e) => update((c) => ({ ...c, availability: { ...c.availability, breakStart: e.target.value } }))} /></label><label>{text.to}<input type="time" value={workspace.availability.breakEnd} onChange={(e) => update((c) => ({ ...c, availability: { ...c.availability, breakEnd: e.target.value } }))} /></label></>}
    </div>
  </div>;

  const review = <div className="beauty-review-list">
    <button type="button" onClick={() => goTo("pro_setup_profile")}><span><strong>{workspace.profile.displayName}</strong><small>{workspace.profile.publicLocation}</small></span><span>{text.edit}</span></button>
    <button type="button" onClick={() => goTo("pro_setup_service")}><span><strong>{workspace.service.name}</strong><small>{workspace.service.durationMinutes} min · {workspace.service.priceCzk} Kč</small></span><span>{text.edit}</span></button>
    <button type="button" onClick={() => goTo("pro_setup_availability")}><span><strong>{workspace.availability.weekdays.map((day) => text.weekdays[day]).join(", ")}</strong><small>{workspace.availability.startTime}–{workspace.availability.endTime}</small></span><span>{text.edit}</span></button>
    <div className="beauty-note"><strong>{text.privateData}</strong><span>{text.privateHint}</span></div>
  </div>;

  const published = <div className="beauty-published">
    <div className="beauty-success"><Check /><div><strong>{text.published}</strong><span>{text.publishedHint}</span></div></div>
    <div className="beauty-public-link"><span>{workspace.publicLink}</span><button type="button" onClick={copyLink}><Share2 size={18} />{text.copyLink}</button></div>
    <button className="beauty-primary" type="button" onClick={() => goTo("pro_public_preview")}><Eye size={19} />{text.openPreview}</button>
    <button className="beauty-secondary" type="button" onClick={() => goTo("pro_setup_review")}>{text.editSetup}</button>
  </div>;

  const preview = <div className="beauty-public-preview" aria-label={text.previewTitle}>
    <span className="beauty-preview-badge">{text.publicPreview}</span>
    <h2>{publicProfile.displayName}</h2><p>{publicProfile.publicLocation}</p>
    <div className="beauty-preview-card"><strong>{publicProfile.serviceName}</strong><span>{publicProfile.durationMinutes} min</span><b>{publicProfile.priceCzk} Kč</b></div>
    <div className="beauty-preview-card"><strong>{text.available}</strong><span>{publicProfile.weekdays.map((day) => text.weekdays[day]).join(", ")}</span><span>{publicProfile.startTime}–{publicProfile.endTime}</span></div>
    <div className="beauty-note"><strong>{text.privacy}</strong><span>{text.privacyHint}</span></div>
    <button className="beauty-primary" type="button" disabled>{text.chooseTime}</button>
  </div>;

  const content = workspace.currentStep === "pro_setup_profile" ? profile : workspace.currentStep === "pro_setup_service" ? service : workspace.currentStep === "pro_setup_availability" ? availability : workspace.currentStep === "pro_setup_review" ? review : workspace.currentStep === "pro_setup_published" ? published : preview;
  if (loading) return <main className="beauty-shell"><div className="beauty-loading">{text.loading}</div></main>;

  return <main className="beauty-shell">
    <header className="beauty-topbar"><button className="beauty-icon-button" type="button" onClick={back} aria-label={text.back}><ArrowLeft /></button><div><span>GO IRL Beauty · {text.localFirst}</span><h1>{workspace.currentStep === "pro_public_preview" ? text.previewTitle : text.title}</h1></div><button className="beauty-icon-button" type="button" onClick={reset} aria-label={text.reset}><RotateCcw /></button></header>
    {progress && <div className="beauty-progress" aria-label={`${text.step} ${progress.current}`}><div>{beautySetupSteps.map((step, index) => <span key={step} className={index < progress.current ? "is-active" : ""} />)}</div><p>{text.step} {progress.current}/{progress.total} · {stepLabels[workspace.currentStep as (typeof beautySetupSteps)[number]]}</p></div>}
    <section className="beauty-card">{content}{errors.length > 0 && <div className="beauty-errors" role="alert">{errors.map((code) => <p key={code}>{text.error(code)}</p>)}</div>}{notice && <div className="beauty-notice" role="status">{notice}</div>}</section>
    {progress && <footer className="beauty-actions"><button className="beauty-secondary" type="button" onClick={back}>{text.back}</button>{workspace.currentStep === "pro_setup_review" ? <button className="beauty-primary" type="button" onClick={publish}><Sparkles size={19} />{text.publish}</button> : <button className="beauty-primary" type="button" onClick={next}>{text.continue}</button>}</footer>}
    <div className="beauty-storage-status"><Save size={15} />{saving ? text.saving : text.saved}</div>
  </main>;
}
