alter table "users" add column "emailVerified" boolean not null;
alter table "users" add column "createdAt" timestamp not null;
alter table "users" add column "updatedAt" timestamp not null;
alter table "users" add column "twoFactorEnabled" boolean;
alter table "users" add column "role" text;
alter table "users" add column "banned" boolean;
alter table "users" add column "banReason" text;
alter table "users" add column "banExpires" timestamp;

alter table "tenants" add column "slug" text not null unique;
alter table "tenants" add column "logo" text;
alter table "tenants" add column  "metadata" text;

alter table "tenant_users" add column "id" uuid not null 
alter table "tenant_users" add column "role" text not null

CREATE TABLE "invitation" (
    "id" uuid NOT NULL,
    "tenant_id" uuid NOT NULL REFERENCES "tenants" ("id"),
    "email" text NOT NULL,
    "role" text,
    "status" text NOT NULL,
    "expiresAt" timestamp NOT NULL,
    "inviterId" uuid NOT NULL,
    PRIMARY KEY ("id", "tenant_id")
);

create table "session" ("id" uuid not null primary key, "expiresAt" timestamp not null, "token" text not null unique, "createdAt" timestamp not null, "updatedAt" timestamp not null, "ipAddress" text, "userAgent" text, "userId" uuid not null references "users" ("id"), "activeOrganizationId" uuid, "impersonatedBy" text);

create table "account" ("id" uuid not null primary key, "accountId" text not null, "providerId" text not null, "userId" uuid not null references "users" ("id"), "accessToken" text, "refreshToken" text, "idToken" text, "accessTokenExpiresAt" timestamp, "refreshTokenExpiresAt" timestamp, "scope" text, "password" text, "createdAt" timestamp not null, "updatedAt" timestamp not null);

create table "verification" ("id" uuid not null primary key, "identifier" text not null, "value" text not null, "expiresAt" timestamp not null, "createdAt" timestamp, "updatedAt" timestamp);

create table "invitation" ("id" uuid not null primary key ("id","tenant_id"), "tenant_id" uuid not null references "tenants" ("id"), "email" text not null, "role" text, "status" text not null, "expiresAt" timestamp not null, "inviterId" uuid not null references "users" ("id"));

create table "twoFactor" ("id" text not null primary key, "secret" text not null, "backupCodes" text not null, "userId" uuid not null references "users" ("id"));

create table "passkey" ("id" text not null primary key, "name" text, "publicKey" text not null, "userId" uuid not null references "users" ("id"), "webauthnUserID" text not null, "counter" integer not null, "deviceType" text not null, "backedUp" boolean not null, "transports" text, "createdAt" timestamp)