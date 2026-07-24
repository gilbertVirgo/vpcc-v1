/*
 * Page transition.
 *
 * A `template.tsx` remounts on every navigation, which is what re-triggers the
 * entry animation — a `layout.tsx` would not.
 *
 * Deliberately a cross-fade with a 4px lift and nothing else. A slide or a
 * directional wipe reads as an app, not a church website, and it competes with
 * the scroll reveals already running on the content below.
 *
 * Duration and easing come from the motion tokens, so reduced motion collapses
 * this to an instant swap along with everything else.
 */
export default function Template({ children }: { children: React.ReactNode }) {
	return <div className="animate-page-in">{children}</div>;
}
