# FlowDesk AI

**Five intelligent tools. One seamless workspace.**

FlowDesk AI is an AI-powered workplace productivity assistant designed to reduce time spent on common repetitive tasks. The application brings email drafting, meeting-note summarisation, task planning, research analysis, and conversational workplace assistance into a single responsive workspace.

> **Project status:** Four-day prototype developed for the AI Skill Accelerator Programme.

## Project Overview

Professionals across industries spend significant time drafting emails, summarising information, organising schedules, and conducting research. FlowDesk AI addresses this challenge through one integrated interface containing five focused productivity tools.

The prototype is designed to demonstrate:

- Practical use of AI in workplace workflows
- Structured prompt engineering
- Improved productivity through guided inputs and reusable outputs
- Responsible AI safeguards and human review
- A responsive, accessible user experience

AI-generated content is treated as an editable draft. Users remain responsible for verifying facts, dates, decisions, deadlines, recommendations, and professional wording before use.

## Features Implemented

### 1. Smart Email Generator

- Generates context-based professional email drafts
- Supports audience types such as client, manager, team, colleague, and supplier
- Supports formal, friendly, informal, persuasive, and concise tones
- Produces a subject line, complete email, and shorter alternative
- Includes edit, copy, regenerate, and clear controls
- Does not send emails automatically

### 2. Meeting Notes Summarizer

- Converts lengthy notes into a concise summary
- Extracts key discussion points and decisions
- Identifies action items, responsibilities, and deadlines
- Labels missing owners as `Owner not specified`
- Labels missing deadlines as `Deadline not specified`
- Avoids inventing information not present in the supplied notes

### 3. AI Task Planner / Scheduler

- Creates daily or weekly work plans
- Prioritises tasks by urgency and importance
- Suggests practical time blocks and breaks
- Identifies workload conflicts and tasks that may need postponement
- Provides time-optimisation recommendations
- Does not create events in an external calendar

### 4. AI Research Assistant

- Analyses text pasted by the user
- Produces summaries, key insights, supported recommendations, and simplified explanations
- Identifies limitations and questions requiring further investigation
- Uses only the supplied source material
- Does not claim live internet research or fabricate sources and citations
- PDF upload and website URL analysis are planned enhancements

### 5. AI Workplace Chatbot

- Provides a multi-turn conversational workplace assistant
- Maintains context during the current browser session
- Answers workplace-productivity questions
- Asks clarification questions when important context is missing
- Recommends the most suitable FlowDesk AI specialist tool
- Does not claim permanent memory or access to private workplace systems

## Responsible AI

FlowDesk AI follows these principles:

- AI outputs are drafts that require human review
- Missing information is identified instead of guessed
- Facts, names, dates, decisions, deadlines, statistics, and sources must not be fabricated
- Confidential or highly sensitive workplace information should not be entered
- Recommendations are separated from user-provided facts
- AI does not take autonomous workplace actions
- AI does not make legal, medical, financial, disciplinary, safety, or employment decisions
- Users can edit, copy, regenerate, and clear generated outputs

## Technologies and Tools Used

- **Lovable:** Application generation, UI development, routing, and iterative building
- **React:** Component-based front-end application structure
- **TypeScript:** Typed application logic
- **Vite:** Front-end development and build tooling
- **Tailwind CSS:** Responsive interface styling
- **Lovable built-in AI connector:** Secure AI-powered generation and analysis
- **Lovable Cloud:** Server-side AI execution and application hosting
- **Browser local state/storage:** Temporary, non-sensitive session information
- **GitHub:** Source control, code backup, and project history

No separate Supabase project is required for the current prototype because the MVP does not include authentication, user accounts, permanent cloud history, or shared database records.

## Setup Instructions

### Prerequisites

Install the following:

- Node.js 18 or newer
- npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-GITHUB-USERNAME/flowdesk-ai.git
cd flowdesk-ai
```

Replace `YOUR-GITHUB-USERNAME` with the GitHub account that owns the repository.

### 2. Install dependencies

```bash
npm install
```

### 3. Start the local development server

```bash
npm run dev
```

Open the local URL displayed in the terminal, commonly:

```text
http://localhost:5173
```

### 4. Create a production build

```bash
npm run build
```

### 5. Preview the production build

```bash
npm run preview
```

## Lovable and GitHub Workflow

1. Open the FlowDesk AI project in Lovable.
2. Use Project Settings to confirm the linked GitHub repository.
3. Make feature changes in small, testable steps.
4. Review each Lovable change before continuing.
5. Verify that Lovable synchronises the updated code to GitHub.
6. Use Lovable History and GitHub commits as recovery checkpoints.
7. Avoid committing API keys, credentials, or confidential test content.

## Current Prototype Limitations

- AI runtime usage depends on available Lovable credits
- PDF analysis is not part of the current MVP
- Website URL analysis and live web research are not part of the current MVP
- The chatbot stores context only for the current session
- No user authentication or permanent cloud history is included
- The application does not send emails or modify external calendars
- All generated content requires human verification

## Project Structure

The main application routes are:

```text
/
/workspace
/workspace/email
/workspace/meetings
/workspace/planner
/workspace/research
/workspace/chat
/responsible-ai
```

## Testing

Before demonstrating the application, verify:

- All routes load successfully
- All five tools are accessible from the workspace
- Required-field validation works
- Loading, success, and error states display correctly
- Generated outputs can be copied, edited, regenerated, and cleared
- The chatbot maintains current-session context
- Responsible-AI notices remain visible
- Desktop and mobile layouts do not overflow horizontally
- Existing features continue working after each update

## Author

**Yadhir Ramrethan**

## License

This project was created for educational and demonstration purposes.
