-- Google Calendar fields on User
ALTER TABLE "User" ADD COLUMN "googleAccessToken" TEXT;
ALTER TABLE "User" ADD COLUMN "googleRefreshToken" TEXT;
ALTER TABLE "User" ADD COLUMN "googleCalendarId" TEXT;
ALTER TABLE "User" ADD COLUMN "googleConnectedAt" TIMESTAMP(3);

-- Google sync and reminder fields on Interview
ALTER TABLE "Interview" ADD COLUMN "googleEventId" TEXT;
ALTER TABLE "Interview" ADD COLUMN "reminderMinutes" INTEGER;
ALTER TABLE "Interview" ADD COLUMN "reminderSent" BOOLEAN DEFAULT false;
