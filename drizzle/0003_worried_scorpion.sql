CREATE TABLE `videos` (
	`id` text PRIMARY KEY NOT NULL,
	`videoId` text NOT NULL,
	`platform` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`url` text NOT NULL,
	`thumbnailUrl` text NOT NULL,
	`duration` text,
	`tags` text DEFAULT '[]',
	`enrichedTags` text DEFAULT '[]',
	`views` integer,
	`rating` integer,
	`publishedAt` text NOT NULL,
	`affiliateUrl` text,
	`chromaId` text,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `videos_videoId_unique` ON `videos` (`videoId`);--> statement-breakpoint
CREATE UNIQUE INDEX `videos_url_unique` ON `videos` (`url`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_chats` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`createdAt` text NOT NULL,
	`sources` text DEFAULT '[]',
	`files` text DEFAULT '[]'
);
--> statement-breakpoint
INSERT INTO `__new_chats`("id", "title", "createdAt", "sources", "files") SELECT "id", "title", "createdAt", "sources", "files" FROM `chats`;--> statement-breakpoint
DROP TABLE `chats`;--> statement-breakpoint
ALTER TABLE `__new_chats` RENAME TO `chats`;--> statement-breakpoint
PRAGMA foreign_keys=ON;