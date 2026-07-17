import { resolveEventArtworkCode } from "../../api/_shared/event-artwork.js";
import { getEventBackground } from "../eventBackgrounds";
type Props={icon:string;activity:string;title:string};
export function EventCardArtwork({icon,activity,title}:Props){const src=getEventBackground(resolveEventArtworkCode({icon,activity,title}));return <div className="glass-event-card-artwork" aria-hidden="true">{src?<img className="glass-event-card-artwork-image" src={src} alt="" decoding="async"/>:<span className="glass-event-card-artwork-fallback">{icon||"✨"}</span>}</div>}
