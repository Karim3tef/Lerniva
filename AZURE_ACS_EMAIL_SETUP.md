# Azure Communication Services Email Setup

This project supports Azure Communication Services (ACS) Email for:
- Email verification
- Password reset
- Admin announcement emails

## 1. Install dependency

Already added in `apps/api/package.json`:

```json
"@azure/communication-email": "^1.1.0"
```

## 2. Configure API env

Edit `apps/api/.env`:

```env
EMAIL_PROVIDER=azure
AZURE_COMMUNICATION_CONNECTION_STRING=endpoint=https://<resource-name>.communication.azure.com/;accesskey=<access-key>
AZURE_COMMUNICATION_SENDER_ADDRESS=DoNotReply@<your-verified-domain>

EMAIL_FROM=Lerniva <DoNotReply@<your-verified-domain>>
EMAIL_VERIFICATION_REQUIRED=true
EMAIL_VERIFICATION_TOKEN_HOURS=24
```

Notes:
- `AZURE_COMMUNICATION_SENDER_ADDRESS` must be a sender address verified/configured in ACS Email.
- `EMAIL_FROM` is still used for SMTP mode; keep it aligned with your sender.

## 3. Restart API

```bash
npm run dev:api
```

## 4. Verify flow

1. Register a new user via `POST /api/auth/register`
2. Confirm email using `/verify-email?token=...`
3. Test password reset via `POST /api/auth/forgot-password`
4. (Admin) Test `POST /api/admin/announcements/email`

## 5. Docker compose env mapping

`docker-compose.yml` now passes:
- `EMAIL_PROVIDER`
- `AZURE_COMMUNICATION_CONNECTION_STRING`
- `AZURE_COMMUNICATION_SENDER_ADDRESS`

So you can set these in your env file and run:

```bash
docker compose up --build
```
