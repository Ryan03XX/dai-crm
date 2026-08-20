# DAI CRM

Phase 1 MVP built with React + Firebase, connected to the `dai-crm` Firebase project.

**New Lead → Follow Up → Qualified → Convert to Company + Contact + Deal → Pipeline → Won / Lost**

## Run locally

```bash
npm install
npm run dev
```

App Hosting needs `npm run build` then `npm start`, which serves `dist` on `PORT` (8080).

Enabled: Authentication (Email/Password), Firestore, Storage.

Publish security rules:

```bash
npx firebase deploy --only firestore:rules,storage
```

## Accounts

- The first registered user becomes **Admin** (can see all customers)
- Later users are **Sales** (can only see their own customers)
- Admin can change roles on the Users page

## Demo flow

1. Register and sign in
2. Create a lead
3. Log a follow-up on the lead (status becomes Contacted)
4. Change status to Qualified
5. Click **Convert to Company + Contact + Deal**
6. Drag the deal through the pipeline until Won or Lost
