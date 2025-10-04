-- AlterTable
ALTER TABLE "campingdb"."inventories" ADD COLUMN     "campsite_id" UUID;

-- AddForeignKey
ALTER TABLE "campingdb"."inventories" ADD CONSTRAINT "inventories_campsite_id_fkey" FOREIGN KEY ("campsite_id") REFERENCES "campingdb"."campsite"("campsite_id") ON DELETE SET NULL ON UPDATE NO ACTION;
