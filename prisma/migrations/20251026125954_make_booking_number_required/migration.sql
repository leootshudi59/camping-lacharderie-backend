/*
  Warnings:

  - A unique constraint covering the columns `[booking_number]` on the table `bookings` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "campingdb"."bookings" ADD COLUMN     "booking_number" VARCHAR(10);

-- CreateIndex
CREATE UNIQUE INDEX "bookings_booking_number_key" ON "campingdb"."bookings"("booking_number");
