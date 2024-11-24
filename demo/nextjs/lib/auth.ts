import { betterAuth } from "better-auth";
import {
	bearer,
	admin,
	multiSession,
	organization,
	passkey,
	twoFactor,
	oneTap,
	oAuthProxy,
	openAPI,
} from "better-auth/plugins";
import { reactInvitationEmail } from "./email/invitation";
import { LibsqlDialect } from "@libsql/kysely-libsql";
import { reactResetPasswordEmail } from "./email/rest-password";
import { resend } from "./email/resend";
import { MysqlDialect } from "kysely";
import { nextCookies } from "better-auth/next-js";
import { customSession } from "./auth/plugins/custom-session";
import { PostgresDialect } from 'kysely'
import { Pool } from "pg"
import { v4 as uuidv4 } from 'uuid';
import { advance } from "@react-three/fiber";
import { Schema } from "zod";

const from = process.env.BETTER_AUTH_EMAIL || "delivered@resend.dev";
const to = process.env.TEST_EMAIL || "";

const db = new PostgresDialect({
    pool: new Pool({
		host: process.env.NILE_HOST,
		database: process.env.NILE_DB,
		user: process.env.NILE_USER,
		password: process.env.NILE_PASSWORD,
    }),
  })

export const auth = betterAuth({
	appName: "Better Auth Demo",
	database: {
		dialect: db,
		type: "postgres",
		
	},
	user: {
		modelName: "users",
		fields: {
		  image: "picture",
		} 
	 },
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 60,
		},
	},
	emailVerification: {
		async sendVerificationEmail({ user, url }) {
			console.log("Sending verification email to", user.email);
			const res = await resend.emails.send({
				from,
				to: to || user.email,
				subject: "Verify your email address",
				html: `<a href="${url}">Verify your email address</a>`,
			});
			console.log(res, user.email);
		},
		sendOnSignUp: true,
	},
	account: {
		accountLinking: {
			trustedProviders: ["google", "github"],
		},
	},
	emailAndPassword: {
		enabled: true,
		async sendResetPassword({ user, url }) {
			await resend.emails.send({
				from,
				to: user.email,
				subject: "Reset your password",
				react: reactResetPasswordEmail({
					username: user.email,
					resetLink: url,
				}),
			});
		},
	},
	socialProviders: {
	//	facebook: {
	//		clientId: process.env.FACEBOOK_CLIENT_ID || "",
	//		clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
	//	},
	//	github: {
	//		clientId: process.env.GITHUB_CLIENT_ID || "",
	//		clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
	//	},
		google: {
			clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
			clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
		},
	//	discord: {
	//		clientId: process.env.DISCORD_CLIENT_ID || "",
	//		clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
	//	},
	//	microsoft: {
	//		clientId: process.env.MICROSOFT_CLIENT_ID || "",
	//		clientSecret: process.env.MICROSOFT_CLIENT_SECRET || "",
	//	},
	//	twitch: {
	//		clientId: process.env.TWITCH_CLIENT_ID || "",
	//		clientSecret: process.env.TWITCH_CLIENT_SECRET || "",
	//	},
	//	twitter: {
	//		clientId: process.env.TWITTER_CLIENT_ID || "",
	//		clientSecret: process.env.TWITTER_CLIENT_SECRET || "",
	//	},
	},
	plugins: [
		organization({
			schema:{
				member:{
					modelName: "tenant_users",
					fields:{
						organizationId:"tenant_id",
						userId:"user_id",
						createdAt:"created"
					}
				},
				organization:{
					modelName: "tenants",
					fields:{
						createdAt:"created"
					}
				},
				invitation:{
					modelName: "invitation",
					fields:{
						organizationId:"tenant_id"
					}
				}
			},
			async sendInvitationEmail(data) {
				const res = await resend.emails.send({
					from,
					to: data.email,
					subject: "You've been invited to join an organization",
					react: reactInvitationEmail({
						username: data.email,
						invitedByUsername: data.inviter.user.name,
						invitedByEmail: data.inviter.user.email,
						teamName: data.organization.name,
						inviteLink:
							process.env.NODE_ENV === "development"
								? `http://localhost:3000/accept-invitation/${data.id}`
								: `${
										process.env.BETTER_AUTH_URL ||
										"https://demo.better-auth.com"
									}/accept-invitation/${data.id}`,
					}),
				});
				console.log(res, data.email);
			},
		}),
		twoFactor({
			otpOptions: {
				async sendOTP({ user, otp }) {
					await resend.emails.send({
						from,
						to: user.email,
						subject: "Your OTP",
						html: `Your OTP is ${otp}`,
					});
				},
			},
		}),
		passkey(),
		openAPI(),
		bearer(),
		admin(),
		multiSession(),
		oneTap(),
		oAuthProxy(),
		nextCookies(),
		customSession(),
	],
});
