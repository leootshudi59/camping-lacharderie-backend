-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "campingdb";

-- CreateEnum
CREATE TYPE "campingdb"."inventory_type_enum" AS ENUM ('arrival', 'departure');

-- CreateEnum
CREATE TYPE "campingdb"."issue_status_enum" AS ENUM ('open', 'in_progress', 'resolved');

-- CreateEnum
CREATE TYPE "campingdb"."order_status_enum" AS ENUM ('received', 'delivered', 'cancelled', 'paid');

-- CreateTable
CREATE TABLE "campingdb"."bookings" (
    "booking_id" UUID NOT NULL,
    "campsite_id" UUID,
    "user_id" UUID,
    "email" VARCHAR(100),
    "phone" VARCHAR(20),
    "start_date" TIMESTAMPTZ(6) NOT NULL,
    "end_date" TIMESTAMPTZ(6) NOT NULL,
    "res_name" VARCHAR(50) NOT NULL,
    "inventory_id" UUID,
    "delete_date" TIMESTAMPTZ(6),

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("booking_id")
);

-- CreateTable
CREATE TABLE "campingdb"."campsite" (
    "campsite_id" UUID NOT NULL,
    "name" VARCHAR(45) NOT NULL,
    "type" VARCHAR(45),
    "description" VARCHAR(256),
    "status" VARCHAR(10) NOT NULL,
    "image" BYTEA,

    CONSTRAINT "campsite_pkey" PRIMARY KEY ("campsite_id")
);

-- CreateTable
CREATE TABLE "campingdb"."events" (
    "event_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "start_datetime" TIMESTAMPTZ(6) NOT NULL,
    "end_datetime" TIMESTAMPTZ(6) NOT NULL,
    "location" VARCHAR(255),
    "language" CHAR(5),
    "created_by" UUID,
    "image" BYTEA,

    CONSTRAINT "events_pkey" PRIMARY KEY ("event_id")
);

-- CreateTable
CREATE TABLE "campingdb"."inventories" (
    "inventory_id" UUID NOT NULL,
    "booking_id" UUID,
    "type" "campingdb"."inventory_type_enum" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comment" VARCHAR(256),

    CONSTRAINT "inventories_pkey" PRIMARY KEY ("inventory_id")
);

-- CreateTable
CREATE TABLE "campingdb"."inventory_items" (
    "inventory_item_id" UUID NOT NULL,
    "inventory_id" UUID,
    "name" VARCHAR(150) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "condition" VARCHAR(100),
    "image" BYTEA,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("inventory_item_id")
);

-- CreateTable
CREATE TABLE "campingdb"."issues" (
    "issue_id" UUID NOT NULL,
    "booking_id" UUID,
    "title" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "status" "campingdb"."issue_status_enum" NOT NULL DEFAULT 'open',
    "resolved_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "image" BYTEA,

    CONSTRAINT "issues_pkey" PRIMARY KEY ("issue_id")
);

-- CreateTable
CREATE TABLE "campingdb"."news" (
    "news_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT,
    "published_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "edit_date" TIMESTAMPTZ(6),
    "delete_date" TIMESTAMPTZ(6),
    "image" BYTEA,
    "created_by" UUID,

    CONSTRAINT "news_pkey" PRIMARY KEY ("news_id")
);

-- CreateTable
CREATE TABLE "campingdb"."order_items" (
    "order_item_id" UUID NOT NULL,
    "order_id" UUID,
    "product_id" UUID,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("order_item_id")
);

-- CreateTable
CREATE TABLE "campingdb"."orders" (
    "order_id" UUID NOT NULL,
    "booking_id" UUID,
    "status" "campingdb"."order_status_enum" NOT NULL DEFAULT 'received',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("order_id")
);

-- CreateTable
CREATE TABLE "campingdb"."products" (
    "product_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "category" VARCHAR(50),
    "unit" VARCHAR(25) NOT NULL,
    "price" DECIMAL(8,2),
    "available" BOOLEAN NOT NULL DEFAULT true,
    "image" BYTEA,

    CONSTRAINT "products_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "campingdb"."users" (
    "user_id" UUID NOT NULL,
    "first_name" VARCHAR(50),
    "last_name" VARCHAR(50) NOT NULL,
    "email" VARCHAR(100),
    "phone" VARCHAR(20),
    "password_hash" TEXT NOT NULL,
    "role" SMALLINT NOT NULL,
    "locale" CHAR(3),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delete_date" TIMESTAMPTZ(6),

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE INDEX "idx_campsite_status" ON "campingdb"."campsite"("status");

-- CreateIndex
CREATE INDEX "idx_events_start" ON "campingdb"."events"("start_datetime");

-- CreateIndex
CREATE INDEX "idx_products_available" ON "campingdb"."products"("available");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "campingdb"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "campingdb"."users"("phone");

-- AddForeignKey
ALTER TABLE "campingdb"."bookings" ADD CONSTRAINT "bookings_campsite_id_fkey" FOREIGN KEY ("campsite_id") REFERENCES "campingdb"."campsite"("campsite_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "campingdb"."bookings" ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "campingdb"."users"("user_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "campingdb"."bookings" ADD CONSTRAINT "fk_bookings_inventory" FOREIGN KEY ("inventory_id") REFERENCES "campingdb"."inventories"("inventory_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "campingdb"."events" ADD CONSTRAINT "events_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "campingdb"."users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "campingdb"."inventories" ADD CONSTRAINT "inventories_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "campingdb"."bookings"("booking_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "campingdb"."inventory_items" ADD CONSTRAINT "inventory_items_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "campingdb"."inventories"("inventory_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "campingdb"."issues" ADD CONSTRAINT "issues_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "campingdb"."bookings"("booking_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "campingdb"."issues" ADD CONSTRAINT "issues_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "campingdb"."users"("user_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "campingdb"."news" ADD CONSTRAINT "news_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "campingdb"."users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "campingdb"."order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "campingdb"."orders"("order_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "campingdb"."order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "campingdb"."products"("product_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "campingdb"."orders" ADD CONSTRAINT "orders_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "campingdb"."bookings"("booking_id") ON DELETE CASCADE ON UPDATE NO ACTION;

