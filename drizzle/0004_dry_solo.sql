CREATE TABLE `affiliate_clicks` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`videoId` text,
	`platform` text NOT NULL,
	`originalUrl` text NOT NULL,
	`affiliateUrl` text NOT NULL,
	`clickedAt` text NOT NULL,
	`converted` integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE `credit_transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`type` text NOT NULL,
	`amount` integer NOT NULL,
	`reason` text,
	`metadata` text,
	`createdAt` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`sessionId` text NOT NULL,
	`credits` integer DEFAULT 100 NOT NULL,
	`totalCreditsEarned` integer DEFAULT 0,
	`totalCreditsSpent` integer DEFAULT 0,
	`createdAt` text NOT NULL,
	`lastActiveAt` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_sessionId_unique` ON `users` (`sessionId`);