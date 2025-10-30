"use client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// Placeholder data with more realistic information
const activities = [
  { 
    id: 1, 
    user: "Alex Johnson", 
    email: "alex@example.com",
    action: "updated", 
    competency: "Team Leadership", 
    time: "2 hours ago",
    type: "edit"
  },
  { 
    id: 2, 
    user: "Sarah Chen", 
    email: "sarah@example.com",
    action: "created", 
    competency: "Digital Communication", 
    time: "5 hours ago",
    type: "create"
  },
  { 
    id: 3, 
    user: "John Miller", 
    email: "john@example.com",
    action: "archived", 
    competency: "Agile Project Management", 
    time: "1 day ago",
    type: "archive"
  },
  { 
    id: 4, 
    user: "Emily Rodriguez", 
    email: "emily@example.com",
    action: "updated", 
    competency: "Strategic Leadership", 
    time: "2 days ago",
    type: "edit"
  }
];

const getActionColor = (type: string) => {
  switch (type) {
    case "create": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200";
    case "edit": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "archive": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
};

export default function RecentActivityCard() {
  return (
    <div className="space-y-6 max-w-xl">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-center space-x-4">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="text-sm">
              {activity.user.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium leading-none truncate">
                {activity.user}
              </p>
              <Badge variant="secondary" className={`text-xs ${getActionColor(activity.type)}`}>
                {activity.action}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {activity.competency}
            </p>
            <p className="text-xs text-muted-foreground">
              {activity.time}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
