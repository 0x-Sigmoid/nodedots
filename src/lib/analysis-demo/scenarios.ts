import { buildTimeline } from "./timeline";
import type { Scenario } from "./types";
const definitions: Omit<Scenario, "events">[] = [
 {
  id:"auth", label:"Change authentication", change:"Replace Firebase Auth with Clerk",
  pr:184, branch:"auth/clerk", sha:"9f3c2ab", additions:412, deletions:198, symbols:1284, relationships:3906,
  files:["app/login/page.tsx","middleware.ts","lib/auth/user.ts","api/billing/customers.ts","tests/auth/redirect.test.ts","app/layout.tsx","lib/auth/session.ts","db/schema/users.ts","app/signup/page.tsx","lib/auth/provider.ts","package.json","package-lock.json",".env.example","README.md"],
  reportAt:6600,duration:12600,
  nodes:[
   {name:"Login",state:"confirmed",title:"Login uses the new provider",why:"The sign-in flow and server verification use the same Clerk identity.",path:"app/login/page.tsx:18",evidence:"SignIn renders the Clerk sign-in flow.",snippet:"return <SignIn />;",next:"Check the sign-in flow in the preview environment."},
   {name:"Sessions",state:"confirmed",title:"Sessions use the new identity",why:"Session checks read the new provider's user ID before serving protected routes.",path:"middleware.ts:12",evidence:"clerkMiddleware protects authenticated routes.",snippet:"export default clerkMiddleware();",next:"Verify that signed-out requests are redirected."},
   {name:"User identity",state:"confirmed",title:"The user record has been updated",why:"New users can be linked to a Clerk ID. Downstream mappings still need to agree.",path:"lib/auth/user.ts:24",evidence:"The user record reads the new provider's identity.",snippet:"const { userId } = await auth();",next:"Follow this identity into billing and existing customer records."},
   {name:"Billing",state:"conflicting",title:"Billing still expects the old ID",why:"The PR switches to Clerk. Stripe customer lookup still uses a Firebase UID, so existing customers may lose their billing link.",path:"api/billing/customers.ts:42",evidence:"Customer lookup filters by firebase_uid.",snippet:"where: { firebase_uid: user.id }",next:"Map existing Stripe customers to Clerk IDs before merging."},
   {name:"Tests",state:"missing",title:"The signed-out redirect has no test",why:"No test covers a signed-out visitor requesting a protected route after the identity migration.",path:"tests/auth/redirect.test.ts:11",evidence:"The tests cover signed-in users only.",snippet:"it('allows a signed-in user', ...);",next:"Add a test that redirects a signed-out visitor."},
  ],
  checklist:["Map existing Stripe customers to Clerk IDs.","Test signed-out redirects before merging."],
 },
 {
  id:"deletion",label:"Delete an account",change:"Remove a user and their account data",
  pr:207,branch:"account/delete",sha:"a71d8e4",additions:186,deletions:64,symbols:976,relationships:2841,
  files:["app/settings/account.tsx","api/account/route.ts","lib/billing/customer.ts","lib/storage/uploads.ts","lib/auth/sessions.ts","tests/account/delete.test.ts","db/users/delete.ts","app/settings/page.tsx","lib/account.ts"],
  reportAt:6600,duration:12600,
  nodes:[
   {name:"Delete route",state:"confirmed",title:"Deletion checks account ownership",why:"The handler scopes the database deletion to the authenticated user.",path:"api/account/route.ts:29",evidence:"The user record is removed after ownership is verified.",snippet:"await deleteUser(auth.userId);",next:"Follow deletion into billing, storage, and active sessions."},
   {name:"Billing",state:"conflicting",title:"The Stripe customer remains",why:"Deleting the user record leaves the Stripe customer and subscription active.",path:"lib/billing/customer.ts:38",evidence:"The deletion handler does not call the billing cleanup.",snippet:"await db.user.delete({ where: { id } });",next:"Cancel subscriptions and remove the linked Stripe customer."},
   {name:"File storage",state:"uncertain",title:"Uploaded files remain unaccounted for",why:"Uploads survive database deletion. No cleanup job establishes when they are removed.",path:"lib/storage/uploads.ts:46",evidence:"Stored uploads are keyed by the deleted user ID.",snippet:"const prefix = 'uploads/' + userId;",next:"Trace the storage cleanup job and verify upload removal."},
   {name:"Sessions",state:"action",title:"Active sessions stay valid",why:"Existing sessions can outlive the deleted account. Revocation is available but is not called.",path:"lib/auth/sessions.ts:31",evidence:"Account deletion does not revoke active sessions.",snippet:"await deleteUser(userId); // no revokeSessions",next:"Revoke active sessions and verify an open browser is rejected."},
   {name:"Tests",state:"missing",title:"Deletion has no end-to-end test",why:"No test establishes that billing, files, and sessions are cleaned up with the account.",path:"tests/account/delete.test.ts:11",evidence:"Coverage stops at the database delete helper.",snippet:"expect(await findUser(id)).toBeNull();",next:"Test deletion across billing, storage, and sessions."},
  ],
  checklist:["Clean up billing and uploaded files.","Revoke all active sessions.","Test the complete deletion flow."],
 },
 {
  id:"roles",label:"Add team roles",change:"Introduce an editor role for teams",
  pr:231,branch:"teams/editor-role",sha:"c4b10f2",additions:243,deletions:57,symbols:1108,relationships:3217,
  files:["prisma/schema.prisma","components/team/RoleSelector.tsx","app/api/team/[id]/route.ts","prisma/migrations/organization/migration.sql","tests/team/permissions.test.ts","lib/permissions.ts","app/team/settings.tsx","lib/team/members.ts"],
  reportAt:6600,duration:12600,
  nodes:[
   {name:"Role schema",state:"confirmed",title:"The schema accepts editor",why:"The Role enum includes the role introduced by this PR.",path:"prisma/schema.prisma:16",evidence:"The schema accepts owner, editor, and viewer.",snippet:"enum Role { owner editor viewer }",next:"Compare these values with the UI and access checks."},
   {name:"Role selector",state:"conflicting",title:"The selector and schema disagree",why:"The database accepts editor, but the interface still offers admin. A selection can fail validation.",path:"components/team/RoleSelector.tsx:9",evidence:"The selector retains the old values.",snippet:"const roles = ['owner', 'admin', 'viewer'];",next:"Align the selector values with the Role enum."},
   {name:"Delete route",state:"missing",title:"Team deletion has no authorization check",why:"DELETE /api/team/:id deletes the team without establishing that the caller is an owner.",path:"app/api/team/[id]/route.ts:22",evidence:"The handler uses the route ID without a permission check.",snippet:"await db.team.delete({ where: { id: params.id } });",next:"Require team ownership before deleting the team."},
   {name:"Organization",state:"action",title:"Existing members need a backfill",why:"organization_id is required, but the migration does not populate existing member rows.",path:"prisma/migrations/organization/migration.sql:4",evidence:"A required column is added without a data migration.",snippet:"ADD COLUMN organization_id TEXT NOT NULL;",next:"Backfill organization IDs before enforcing the constraint."},
   {name:"Tests",state:"missing",title:"Editor permission tests are missing",why:"The new role has no test showing which team actions it can perform.",path:"tests/team/permissions.test.ts:14",evidence:"Cases cover owner and viewer only.",snippet:"describe.each(['owner', 'viewer'])(...);",next:"Add allowed and denied action tests for editor."},
  ],
  checklist:["Align the selector with the schema.","Authorize team deletion and test role permissions.","Backfill organization IDs before the migration."],
 },
];
export const scenarios: Scenario[] = definitions.map((definition,index) => ({
 ...definition,events:buildTimeline(definition,184 + index * 71),
}));
