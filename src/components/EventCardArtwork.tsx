import { resolveEventArtworkCode } from "../../api/_shared/event-artwork.js";
import { getEventBackground } from "../eventBackgrounds";
type Props={icon:string;activity:string;title:string};
export function EventCardArtwork({icon,activity,title}:Props){const code=resolveEventArtworkCode({icon,activity,title});const src=getEventBackground(code);return <div className={`glass-event-card-artwork artwork-${code.toLowerCase()}`} aria-hidden="true">{src?<img className="glass-event-card-artwork-image" src={src} alt="" decoding="async"/>:<span className="glass-event-card-artwork-fallback">{icon||"✨"}</span>}</div>}
