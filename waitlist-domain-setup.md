# NodeDots domain setup

Prepared: 5 October 2026

Private preview: https://nodedots-waitlist.sgukobong.chatgpt.site

The waitlist page is privately published. Making it publicly accessible requires explicit user approval after the automatic review rejected that access change. Subscriber records are stored in the private DB and no public listing endpoint exists.

## Cloudflare DNS

In Cloudflare, select the nodedots.com zone and open DNS records. Configure the apex website routing and add the verification records below. Preserve mail records and unrelated subdomains. Existing apex website A/AAAA/CNAME records must be reviewed for conflicts before changing them.

| Type | Name | Value |
|---|---|---|
| A | @ | 162.159.143.30 |
| A | @ | 172.66.3.26 |
| TXT | _openai-site-verification.nodedots.com | openai-site-verification=VCmBIwXC1EWpq8Q6kfT6DGFvKTzt5Fq8HRCvxMqnbZo |
| TXT | _cf-custom-hostname.nodedots.com | 289a7a69-b5a7-4c94-a8ec-f932596c13c1 |

Records are the exact values returned by the hosting service; do not substitute values from examples. TXT records are verification values intended for DNS publication. Cloudflare may display relative names inside the selected zone.

## Verify activation

After DNS changes, refresh the custom domain status through Sites. All required validation records must resolve, routing must match, and TLS must become active. Pending registration does not mean nodedots.com is live.

Registered domain ID: appgdom_6ac2de6a1f5481918597366ed2d92cac
Site ID: appgprj_6ac2d8d102588191bb924884ddbbbd97
Current domain status: pending
Current TLS status: initializing

## Email campaigns

The page collects signups; it does not send emails. Configure a verified email sender and a working unsubscribe/suppression workflow before sending invitations or launch updates.

