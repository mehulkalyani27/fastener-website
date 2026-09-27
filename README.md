# Fastener Platform

## Overview

A modern digital platform for a fastener company. It goes beyond a traditional marketing website by supporting product discovery, customer inquiries, structured business data, and future intelligent/automated capabilities.

## Stack

* Next.js — App Router
* TypeScript
* React
* Tailwind CSS
* Supabase — PostgreSQL/data layer

## Architecture

```text
Next.js UI
    ↓
Server Components / Server Actions
    ↓
Business Logic
    ↓
Supabase
    ↓
PostgreSQL
```

### Rendering

* Server Components by default.
* Client Components only for required interactivity/browser APIs/state.
* Keep client-side JavaScript minimal.

### Structure

Organize code by responsibility and feature.

```text
src/
├── app/            # Routes, layouts, metadata
├── components/     # Shared UI
├── features/       # Feature-specific UI/logic
├── lib/            # Shared utilities/services
├── data/           # Static/configuration data
└── types/          # Shared TypeScript types
```

Keep business logic and data access outside presentational components. Reuse shared components.

## Data

Supabase is the primary data layer.

```text
UI
 ↓
Server-side application layer
 ↓
Supabase
 ↓
PostgreSQL
```

Never expose Supabase service-role credentials to the client. Protect database operations with appropriate validation and Row Level Security.

## Design

No predefined Figma design exists. The UI will be designed during development.

Design principles:

* Premium, modern business experience
* Mobile-first and fully responsive
* Consistent visual system
* Clear information hierarchy
* Accessible interactions
* Purposeful animation
* Avoid unnecessary visual complexity

Reusable design primitives should be established and shared across the application.

## Performance & SEO

Performance and SEO are architectural requirements.

Prefer:

* Server rendering/static generation where appropriate
* `next/image`
* `next/font`
* Optimized assets
* Minimal client JavaScript
* Semantic HTML
* Next.js Metadata
* Structured data where appropriate

## Core Features

Initial platform direction:

* Business/company presentation
* Product catalogue/showcase
* Services/capabilities
* Customer inquiry/contact form
* Supabase-backed inquiry storage

Future capabilities may include:

* Admin/business dashboard
* Lead management
* Analytics
* Automation
* AI-powered features
* External integrations

Do not implement future capabilities unless explicitly requested.

## Guiding Principles

* Keep the architecture simple and scalable.
* Prefer existing capabilities over new dependencies.
* Keep responsibilities separated.
* Reuse before duplicating.
* Preserve consistency across the product.
* Do not over-engineer.
