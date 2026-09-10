CREATE TABLE "cursos_archivados" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_email" text NOT NULL,
	"curso" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "cursos_archivados_owner_curso_idx" ON "cursos_archivados" USING btree ("owner_email","curso");