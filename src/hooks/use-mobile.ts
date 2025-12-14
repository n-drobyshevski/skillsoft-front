import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
	// Initialize with SSR-safe default based on common mobile viewport
	// This prevents hydration mismatch by using consistent initial value
	const [isMobile, setIsMobile] = React.useState<boolean>(false);
	const [isHydrated, setIsHydrated] = React.useState(false);

	React.useEffect(() => {
		setIsHydrated(true);
		const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
		const onChange = () => {
			setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
		};
		mql.addEventListener("change", onChange);
		setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
		return () => mql.removeEventListener("change", onChange);
	}, []);

	return isMobile;
}

/**
 * Returns whether the component has been hydrated on the client.
 * Useful for components that need to know if they can safely use browser APIs.
 */
export function useIsHydrated() {
	const [isHydrated, setIsHydrated] = React.useState(false);

	React.useEffect(() => {
		setIsHydrated(true);
	}, []);

	return isHydrated;
}
