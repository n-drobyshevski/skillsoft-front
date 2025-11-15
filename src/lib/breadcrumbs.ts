
import { usePathname } from "next/navigation";

export const useBreadcrumbs = (customTitles?: Record<string, string>) => {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const breadcrumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    
    // Check if there's a custom title for this segment
    const customTitle = customTitles?.[segment as keyof typeof customTitles];
    if (customTitle) {
      return { href, label: customTitle };
    }
    
    // Default URL-based label formatting
    let label = segment
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    // Handle special cases for better readability
    switch (segment) {
      case "assessment-questions":
        label = "Assessment Questions";
        break;
      case "behavioral-indicators":
        label = "Behavioral Indicators";
        break;
      case "competencies":
        label = "Competencies";
        break;
      case "new":
        label = "New";
        break;
      case "edit":
        label = "Edit";
        break;
      default:
        // If segment looks like an ID (contains hyphens and numbers/letters), 
        // check if it's likely an entity ID
        if (/^[a-f0-9-]+$/i.test(segment) && segment.length > 10) {
          label = "Details"; // Default for entity IDs
        }
        break;
    }

    return { href, label };
  });

  let title = "";
  if (breadcrumbs.length > 0) {
    title = breadcrumbs[breadcrumbs.length - 1].label;
  }

  if (pathname.includes("/edit")) {
    title = "Edit";
  }

  return { breadcrumbs, title };
};
