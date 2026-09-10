# FlyQM

Responsive airline search and booking application for flights across Myanmar and the region.

**Live:** https://flyqm.com/en

## Product branches

| Branch | Application |
|---|---|
| [`main`](https://github.com/Khant26/flyqm/tree/main) | Customer booking application |
| [`api`](https://github.com/Khant26/flyqm/tree/api) | FastAPI booking and pricing service |

The original component repositories remain available. The admin dashboard is intentionally kept separate.

## Features

- One-way, round-trip, and multi-city flight search
- Airline and fare comparison
- Passenger and booking workflows
- Authentication and booking history
- English and Myanmar localization
- Multiple currency display

## Tech stack

- React 19 and Vite 7
- React Router
- Tailwind CSS
- Axios

## Local development

```bash
npm ci
npm run dev
```

Set `VITE_API_BASE_URL` in a local environment file when the API is not served from `/api`.

## Quality checks

```bash
npm run lint
npm run build
```

GitHub Actions runs lint and production-build checks on pushes and pull requests.

## License

No open-source license is currently declared. All rights are reserved unless a license is added by the repository owner.
