# Application Overview

This document provides a high-level overview of the application's architecture, focusing on its pages, data models, and data flow patterns.

## Pages and Routes

The application's routing is based on the Next.js App Router, with pages organized logically within the `app/` directory.

### Dashboard

-   **Route**: `/`
-   **File**: `app/page.tsx`
-   **Description**: The main dashboard and landing page of the application. It displays high-level statistics and quick navigation links to other sections.

### Competencies

This feature manages core competencies.

-   **Route**: `/competencies`
-   **File**: `app/competencies/page.tsx`
-   **Description**: Displays a table of all existing competencies. Provides actions to create a new competency or navigate to the detail/edit page of an existing one.

-   **Route**: `/competencies/new`
-   **File**: `app/competencies/new/page.tsx`
-   **Description**: Contains a form to create a new competency.

-   **Route**: `/competencies/[competencyId]`
-   **File**: `app/competencies/[competencyId]/page.tsx`
-   **Description**: Shows a detailed view of a single competency, including its associated behavioral indicators and other metadata.

-   **Route**: `/competencies/[competencyId]/edit`
-   **File**: `app/competencies/[competencyId]/edit/page.tsx`
-   **Description**: Provides a form to edit the details of an existing competency.

### Behavioral Indicators

This feature manages the behavioral indicators linked to competencies.

-   **Route**: `/behavioral-indicators`
-   **File**: `app/behavioral-indicators/page.tsx`
-   **Description**: Displays a table of all behavioral indicators. Allows users to create new indicators and manage existing ones.

-   **Route**: `/behavioral-indicators/new`
-   **File**: `app/behavioral-indicators/new/page.tsx`
-   **Description**: Contains a form for creating a new behavioral indicator.

-   **Route**: `/behavioral-indicators/[indicatorId]`
-   **File**: `app/behavioral-indicators/[indicatorId]/page.tsx`
-   **Description**: Presents a detailed view of a specific behavioral indicator, showing its description, level, and associated questions.

-   **Route**: `/behavioral-indicators/[indicatorId]/edit`
-   **File**: `app/behavioral-indicators/[indicatorId]/edit/page.tsx`
-   **Description**: Contains a form to edit the details of an existing behavioral indicator.

### Assessment Questions

This feature is for managing the questions used in assessments.

-   **Route**: `/assessment-questions`
-   **File**: `app/assessment-questions/page.tsx`
-   **Description**: Shows a table of all assessment questions, allowing for management and creation.

-   **Route**: `/assessment-questions/new`
-   **File**: `app/assessment-questions/new/page.tsx`
-   **Description**: Provides a form to create a new assessment question.

-   **Route**: `/assessment-questions/[questionId]`
-   **File**: `app/assessment-questions/[questionId]/page.tsx`
-   **Description**: Displays the full details of a single assessment question.

-   **Route**: `/assessment-questions/[questionId]/edit`
-   **File**: `app/assessment-questions/[questionId]/edit/page.tsx`
-   **Description**: Allows for editing an existing assessment question.

### Miscellaneous

-   **Route**: `/stats-demo`
-   **File**: `app/stats-demo/page.tsx`
-   **Description**: A page dedicated to demonstrating statistical components and charts.

-   **Route**: `/*`
-   **File**: `app/not-found.tsx`
-   **Description**: A global 404 page that is displayed for any route that does not match an existing page.

## Data Models (Interfaces)

The core data structures of the application are defined in the `app/interfaces/` directory. Below are the primary models.

```typescript
// app/interfaces/domain-interfaces.ts

export interface Competency {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface BehavioralIndicator {
  id: string;
  competencyId: string;
  name: string;
  description: string;
  level: number;
  createdAt: string;
}

export interface AssessmentQuestion {
  id: string;
  indicatorId: string;
  questionText: string;
  responseType: 'text' | 'scale';
  createdAt: string;
}
```

## Data Flow by Page

The application uses a consistent data flow pattern for reading and writing data, tailored for each feature.

### General Data Flow Patterns

-   **Read Operations**: Data is fetched in Server Components using `async/await` in the `src/services/api.ts` file. This leverages Next.js server-side rendering and caching capabilities. Loading states are managed via React `<Suspense>`.
-   **Write Operations**: Mutations are initiated in Client Components. A service function from `api.ts` is called, which communicates with the backend. Upon success, this service calls a Server Action from `src/app/actions.ts` that uses `revalidatePath` to invalidate the cache and trigger a data refresh.

### `/competencies`

-   **Read Flow**:
    1.  The Server Component at `app/competencies/page.tsx` calls `competenciesApi.getCompetencies()` from `src/services/api.ts`.
    2.  The API service fetches the list of competencies from the backend.
    3.  The fetched data is passed as a prop to the `<CompetenciesTable />` Client Component for rendering.
-   **Write Flow**:
    1.  **Creation**: Navigating to `/competencies/new` renders the `<CompetencyForm />` component. On submission, it calls `competenciesApi.createCompetency()`.
    2.  **Editing**: Navigating to `/competencies/[competencyId]/edit` renders the `<EditCompetencyForm />`. On submission, it calls `competenciesApi.updateCompetency()`.
    3.  **Revalidation**: Both creation and update trigger a server action that calls `revalidatePath('/competencies')`, refreshing the data on the main competencies page.

### `/behavioral-indicators`

-   **Read Flow**:
    1.  The Server Component at `app/behavioral-indicators/page.tsx` calls `indicatorsApi.getIndicators()`.
    2.  The API service fetches the list of indicators.
    3.  The data is passed to the `<IndicatorsTable />` Client Component.
-   **Write Flow**:
    1.  **Creation**: The `/behavioral-indicators/new` page uses `<IndicatorForm />`, which calls `indicatorsApi.createIndicator()` on submit.
    2.  **Editing**: The `/behavioral-indicators/[indicatorId]/edit` page uses `<EditIndicatorForm />`, which calls `indicatorsApi.updateIndicator()`.
    3.  **Revalidation**: The process concludes with a server action that calls `revalidatePath('/behavioral-indicators')` to ensure the indicator list is up-to-date.

### `/assessment-questions`

-   **Read Flow**:
    1.  The Server Component at `app/assessment-questions/page.tsx` calls `questionsApi.getQuestions()`.
    2.  The API service fetches the list of questions.
    3.  The data is passed to the `<QuestionsTable />` Client Component.
-   **Write Flow**:
    1.  **Creation**: The `/assessment-questions/new` page uses `<QuestionForm />`, which calls `questionsApi.createQuestion()` on submit.
    2.  **Editing**: The `/assessment-questions/[questionId]/edit` page uses `<EditQuestionForm />`, which calls `questionsApi.updateQuestion()`.
    3.  **Revalidation**: A server action is triggered to call `revalidatePath('/assessment-questions')`, refreshing the data.

## Backend API Communication (`src/services/api.ts`)

The `src/services/api.ts` file provides a centralized and consistent layer for all communication with the backend RESTful API.

### The `fetchApi` Wrapper

A core component of this service is the `fetchApi` utility function. It wraps the native `fetch` API to provide several key functionalities:

-   **URL Construction**: It automatically prepends the backend base URL (`http://localhost:8080/api`) to all requests.
-   **Headers**: It sets default headers, such as `Content-Type: application/json`.
-   **Caching and Revalidation**: It intelligently manages Next.js caching. For `GET` requests, it uses `cache` to memoize requests and can be configured with revalidation periods and tags.
-   **Error Handling**: It provides uniform error handling by checking the response status and throwing a standardized error if the request was not successful.

Here is a simplified representation of the `fetchApi` wrapper:

```typescript
// src/services/api.ts

async function fetchApi(path: string, options: RequestInit = {}) {
  const url = `http://localhost:8080/api${path}`;

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    next: { revalidate: 3600 }, // Example: cache for 1 hour
  };

  const response = await fetch(url, { ...defaultOptions, ...options });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }

  return response.json();
}
```

### Service Functions

Specific API calls are abstracted into service functions that use `fetchApi`. This keeps the application code clean and easy to maintain.

```typescript
// Example: Fetching all competencies

export const competenciesApi = {
  getCompetencies: async (): Promise<Competency[]> => {
    return fetchApi('/competencies');
  },
  // ... other competency-related functions
};
```

## Form Validation

Form validation is handled client-side using a schema-based approach to ensure data integrity before it is sent to the backend.

### Schema-Based Validation with Zod

The application uses the `zod` library to define validation schemas. For each feature with a form, there is a corresponding `validation.ts` file (e.g., `app/competencies/validation.ts`) that exports a schema for that data type.

This approach provides a single source of truth for the validation rules of a data model.

### How It Works

1.  **Schema Definition**: A `zod` schema is created to define the shape, data types, and constraints for a form. For example, it can specify that a `name` field is a string with a minimum length of 3.
2.  **Form Integration**: The form components (e.g., `<CompetencyForm />`) use the `react-hook-form` library with `@hookform/resolvers/zod` to connect the form's state to the validation schema.
3.  **User Feedback**: As the user interacts with the form, `react-hook-form` validates the input against the `zod` schema and provides instant feedback on any validation errors, improving the user experience.

Here is an example of a validation schema:

```typescript
// app/competencies/validation.ts

import { z } from 'zod';

export const competencySchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters long.' }),
  description: z.string().optional(),
});

export type CompetencyFormData = z.infer<typeof competencySchema>;
```

## Reusable Table Components

The application employs a powerful and reusable table component system to display data consistently across different features.

### Generic Table (`app/components/Table.tsx`)

At the core of this system is a generic, reusable table component built with `shadcn/ui` and Radix UI primitives. This component is not concerned with the data itself, but rather with the structure and style of the table.

-   **Purpose**: To provide a consistent, styled, and accessible foundation for all data tables.
-   **Composition**: It exports a set of styled components that map to standard HTML table elements: `<Table>`, `<TableHeader>`, `<TableBody>`, `<TableRow>`, `<TableHead>`, and `<TableCell>`.
-   **Loading State**: It is complemented by `app/components/TableSkeleton.tsx`, a skeleton loading component that provides a placeholder UI while data is being fetched. This is used within a React `<Suspense>` boundary to prevent layout shifts and improve perceived performance.

### Feature-Specific Tables

For each data type (e.g., Competencies), there is a dedicated table component (e.g., `app/competencies/components/CompetenciesTable.tsx`) that consumes the generic `Table`.

These feature-specific tables are **Client Components** and are responsible for:

-   **Column Definition**: Defining the table columns, headers, and how the data for each item is rendered into the cells.
-   **Data Mapping**: Receiving an array of data (e.g., `competencies: Competency[]`) as a prop and mapping each item to a `<TableRow>`.
-   **Row Actions**: Implementing an "Actions" column, typically using a `<DropdownMenu>` component for each row to provide options like "View Details," "Edit," or "Delete."
-   **Interactivity**: Handling client-side interactions such as sorting, filtering, and pagination (if applicable).

### How They Are Used Together

The data flow for displaying a table is as follows:

1.  A **Server Component** (e.g., `app/competencies/page.tsx`) fetches the required data from the backend.
2.  The page wraps the feature-specific table component (e.g., `<CompetenciesTable />`) in a `<Suspense>` boundary, with the `<TableSkeleton />` as the fallback.
3.  The fetched data is passed as a prop to the feature-specific table component.
4.  The feature-specific table component then uses the generic `<Table>` primitives to render the final, styled table with the data.
