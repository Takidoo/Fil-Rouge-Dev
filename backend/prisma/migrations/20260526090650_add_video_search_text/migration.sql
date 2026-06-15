-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "searchText" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE INDEX "Video_searchText_idx" ON "Video"("searchText");
