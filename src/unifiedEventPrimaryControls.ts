import "./legacy-event-card-controls.css";
import { enableLegacyEventCardControls } from "./legacyEventCardControls";

/**
 * Preserve the existing bootstrap name while restoring the established Event
 * participant and unread-chat controls for both Event and Sport cards.
 */
export function enableUnifiedEventPrimaryControls() {
  enableLegacyEventCardControls();
}
