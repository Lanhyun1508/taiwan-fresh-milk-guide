CREATE TABLE `announcements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(200) NOT NULL,
	`content` text NOT NULL,
	`type` enum('info','update','important') NOT NULL DEFAULT 'info',
	`isActive` boolean DEFAULT true,
	`displayOrder` int DEFAULT 0,
	`startDate` timestamp,
	`endDate` timestamp,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `announcements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `milk_brands` (
	`id` int AUTO_INCREMENT NOT NULL,
	`brandName` varchar(100) NOT NULL,
	`productName` varchar(200) NOT NULL,
	`pasteurizationType` enum('LTLT','HTST','UHT','ESL') NOT NULL,
	`volume` int NOT NULL,
	`shelfLife` int,
	`price` int,
	`origin` varchar(100),
	`ingredients` text,
	`officialWebsite` varchar(500),
	`imageUrl` varchar(500),
	`imageKey` varchar(200),
	`physicalChannels` json,
	`onlineChannels` json,
	`notes` text,
	`isOrganic` boolean DEFAULT false,
	`isImported` boolean DEFAULT false,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `milk_brands_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `submissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`submitterName` varchar(100),
	`submitterEmail` varchar(320),
	`submissionType` enum('brand','update','image') NOT NULL,
	`relatedBrandId` int,
	`content` json NOT NULL,
	`imageUrl` varchar(500),
	`imageKey` varchar(200),
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`reviewNotes` text,
	`reviewedBy` int,
	`reviewedAt` timestamp,
	`llmValidation` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `submissions_id` PRIMARY KEY(`id`)
);
