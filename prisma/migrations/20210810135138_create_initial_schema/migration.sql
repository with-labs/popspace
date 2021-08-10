-- CreateTable
CREATE TABLE "actor_events" (
    "id" BIGSERIAL NOT NULL,
    "actor_id" BIGINT,
    "session_id" BIGINT,
    "key" TEXT NOT NULL,
    "value" TEXT,
    "ip" TEXT,
    "browser" TEXT,
    "device" TEXT,
    "vendor" TEXT,
    "engine" TEXT,
    "os" TEXT,
    "os_version" TEXT,
    "engine_version" TEXT,
    "browser_version" TEXT,
    "req_url" TEXT,
    "user_agent" TEXT,
    "meta" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT timezone('utc'::text, now()),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actors" (
    "id" BIGSERIAL NOT NULL,
    "display_name" TEXT,
    "avatar_name" TEXT,
    "admin" BOOLEAN DEFAULT false,
    "verified_at" TIMESTAMPTZ(6),
    "kind" TEXT,
    "deleted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT timezone('utc'::text, now()),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT timezone('utc'::text, now()),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_camera_usage" (
    "id" BIGSERIAL NOT NULL,
    "room_id" BIGINT NOT NULL,
    "actor_id" BIGINT,
    "participant_id" BIGINT,
    "is_toggled_on" BOOLEAN NOT NULL,
    "toggled_at" TIMESTAMPTZ(6) NOT NULL,
    "last_heartbeat_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT timezone('utc'::text, now()),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_mic_usage" (
    "id" BIGSERIAL NOT NULL,
    "room_id" BIGINT NOT NULL,
    "actor_id" BIGINT,
    "participant_id" BIGINT,
    "is_toggled_on" BOOLEAN NOT NULL,
    "toggled_at" TIMESTAMPTZ(6) NOT NULL,
    "last_heartbeat_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT timezone('utc'::text, now()),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_room_participant_count" (
    "id" BIGSERIAL NOT NULL,
    "room_id" BIGINT NOT NULL,
    "participant_count" BIGINT NOT NULL,
    "measured_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT timezone('utc'::text, now()),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_room_usage" (
    "id" BIGSERIAL NOT NULL,
    "room_id" BIGINT NOT NULL,
    "actor_id" BIGINT,
    "participant_id" BIGINT,
    "began_at" TIMESTAMPTZ(6) NOT NULL,
    "last_heartbeat_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT timezone('utc'::text, now()),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_total_participant_counts" (
    "id" BIGSERIAL NOT NULL,
    "count" BIGINT NOT NULL,
    "measured_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT timezone('utc'::text, now()),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "errors" (
    "id" BIGSERIAL NOT NULL,
    "actor_id" BIGINT,
    "http_code" BIGINT,
    "noodle_code" TEXT,
    "stack" TEXT,
    "message" TEXT,
    "tag" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT timezone('utc'::text, now()),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experience_ratings" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT timezone('utc'::text, now()),
    "submitted_at" TIMESTAMPTZ(6) NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT timezone('utc'::text, now()),
    "rating" INTEGER NOT NULL,
    "feedback" TEXT,
    "actor_id" BIGINT,
    "room_id" BIGINT,
    "session_id" BIGINT,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "magic_codes" (
    "id" BIGSERIAL NOT NULL,
    "actor_id" BIGINT NOT NULL,
    "code" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "meta" JSON,
    "issued_at" TIMESTAMPTZ(6) NOT NULL,
    "expires_at" TIMESTAMPTZ(6),
    "resolved_at" TIMESTAMPTZ(6),
    "revoked_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT timezone('utc'::text, now()),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT timezone('utc'::text, now()),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" BIGSERIAL NOT NULL,
    "chat_id" BIGINT,
    "content" TEXT,
    "sender_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT timezone('utc'::text, now()),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participant_states" (
    "actor_id" BIGINT NOT NULL,
    "state" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT timezone('utc'::text, now()),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT timezone('utc'::text, now()),

    PRIMARY KEY ("actor_id")
);

-- CreateTable
CREATE TABLE "participants" (
    "id" BIGSERIAL NOT NULL,
    "actor_id" BIGINT,
    "room_id" BIGINT,
    "ip" TEXT,
    "browser" TEXT,
    "device" TEXT,
    "vendor" TEXT,
    "engine" TEXT,
    "os" TEXT,
    "os_version" TEXT,
    "engine_version" TEXT,
    "browser_version" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT timezone('utc'::text, now()),
    "updated_at" TIMESTAMPTZ(6),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pgmigrations" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "run_on" TIMESTAMP(6) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_memberships" (
    "id" BIGSERIAL NOT NULL,
    "room_id" BIGINT NOT NULL,
    "actor_id" BIGINT NOT NULL,
    "began_at" TIMESTAMPTZ(6),
    "expires_at" TIMESTAMPTZ(6),
    "revoked_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT timezone('utc'::text, now()),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT timezone('utc'::text, now()),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_participant_states" (
    "room_id" BIGINT NOT NULL,
    "actor_id" BIGINT NOT NULL,
    "state" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT timezone('utc'::text, now()),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT timezone('utc'::text, now()),

    PRIMARY KEY ("room_id","actor_id")
);

-- CreateTable
CREATE TABLE "room_routes" (
    "id" BIGSERIAL NOT NULL,
    "room_id" BIGINT NOT NULL,
    "route" TEXT NOT NULL,
    "priority_level" INTEGER NOT NULL DEFAULT 0,
    "is_vanity" BOOLEAN,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT timezone('utc'::text, now()),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT timezone('utc'::text, now()),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_states" (
    "room_id" BIGINT NOT NULL,
    "state" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT timezone('utc'::text, now()),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT timezone('utc'::text, now()),
    "wallpaper_id" BIGINT,

    PRIMARY KEY ("room_id")
);

-- CreateTable
CREATE TABLE "room_templates" (
    "id" BIGSERIAL NOT NULL,
    "creator_id" BIGINT,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT timezone('utc'::text, now()),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT timezone('utc'::text, now()),
    "data" JSONB,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_widget_states" (
    "room_id" BIGINT NOT NULL,
    "widget_id" BIGINT NOT NULL,
    "state" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT timezone('utc'::text, now()),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT timezone('utc'::text, now()),

    PRIMARY KEY ("room_id","widget_id")
);

-- CreateTable
CREATE TABLE "room_widgets" (
    "widget_id" BIGINT NOT NULL,
    "room_id" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT timezone('utc'::text, now()),

    PRIMARY KEY ("widget_id","room_id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" BIGSERIAL NOT NULL,
    "creator_id" BIGINT,
    "url_id" TEXT,
    "is_public" BOOLEAN DEFAULT true,
    "display_name" TEXT,
    "template_name" TEXT,
    "deleted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT timezone('utc'::text, now()),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT timezone('utc'::text, now()),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" BIGSERIAL NOT NULL,
    "actor_id" BIGINT NOT NULL,
    "secret" TEXT,
    "expires_at" TIMESTAMPTZ(6),
    "revoked_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT timezone('utc'::text, now()),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "slack_actions" (
    "id" BIGSERIAL NOT NULL,
    "actor_id" BIGINT,
    "action" TEXT,
    "slack_user_id" TEXT,
    "channel_id" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT timezone('utc'::text, now()),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "slack_installs" (
    "id" BIGSERIAL NOT NULL,
    "actor_id" BIGINT,
    "workspace_id" TEXT,
    "enterprise_id" TEXT,
    "slack_user_id" TEXT,
    "install_data" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT timezone('utc'::text, now()),
    "uninstalled_at" TIMESTAMPTZ(6),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallpapers" (
    "id" BIGSERIAL NOT NULL,
    "creator_id" BIGINT,
    "name" TEXT,
    "url" TEXT NOT NULL,
    "mimetype" TEXT,
    "category" TEXT,
    "artist_name" TEXT,
    "thumbnail_url" TEXT,
    "dominant_color" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT timezone('utc'::text, now()),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT timezone('utc'::text, now()),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "widget_states" (
    "widget_id" BIGINT NOT NULL,
    "state" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT timezone('utc'::text, now()),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT timezone('utc'::text, now()),

    PRIMARY KEY ("widget_id")
);

-- CreateTable
CREATE TABLE "widgets" (
    "id" BIGSERIAL NOT NULL,
    "creator_id" BIGINT,
    "_type" TEXT,
    "deleted_at" TIMESTAMPTZ(6),
    "archived_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT timezone('utc'::text, now()),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT timezone('utc'::text, now()),

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "actor_events_actor_id_index" ON "actor_events"("actor_id");

-- CreateIndex
CREATE INDEX "actor_events_browser_index" ON "actor_events"("browser");

-- CreateIndex
CREATE INDEX "actor_events_device_index" ON "actor_events"("device");

-- CreateIndex
CREATE INDEX "actor_events_engine_index" ON "actor_events"("engine");

-- CreateIndex
CREATE INDEX "actor_events_ip_index" ON "actor_events"("ip");

-- CreateIndex
CREATE INDEX "actor_events_key_index" ON "actor_events"("key");

-- CreateIndex
CREATE INDEX "actor_events_os_index" ON "actor_events"("os");

-- CreateIndex
CREATE INDEX "actor_events_session_id_index" ON "actor_events"("session_id");

-- CreateIndex
CREATE INDEX "actor_events_value_index" ON "actor_events"("value");

-- CreateIndex
CREATE INDEX "actor_events_vendor_index" ON "actor_events"("vendor");

-- CreateIndex
CREATE INDEX "actors_deleted_at_index" ON "actors"("deleted_at");

-- CreateIndex
CREATE INDEX "actors_kind_index" ON "actors"("kind");

-- CreateIndex
CREATE INDEX "analytics_camera_usage_actor_id_participant_id_index" ON "analytics_camera_usage"("actor_id", "participant_id");

-- CreateIndex
CREATE INDEX "analytics_camera_usage_is_toggled_on_index" ON "analytics_camera_usage"("is_toggled_on");

-- CreateIndex
CREATE INDEX "analytics_camera_usage_room_id_index" ON "analytics_camera_usage"("room_id");

-- CreateIndex
CREATE INDEX "analytics_camera_usage_toggled_at_index" ON "analytics_camera_usage"("toggled_at");

-- CreateIndex
CREATE INDEX "analytics_mic_usage_actor_id_participant_id_index" ON "analytics_mic_usage"("actor_id", "participant_id");

-- CreateIndex
CREATE INDEX "analytics_mic_usage_is_toggled_on_index" ON "analytics_mic_usage"("is_toggled_on");

-- CreateIndex
CREATE INDEX "analytics_mic_usage_room_id_index" ON "analytics_mic_usage"("room_id");

-- CreateIndex
CREATE INDEX "analytics_mic_usage_toggled_at_index" ON "analytics_mic_usage"("toggled_at");

-- CreateIndex
CREATE INDEX "analytics_room_participant_count_measured_at_index" ON "analytics_room_participant_count"("measured_at");

-- CreateIndex
CREATE INDEX "analytics_room_participant_count_participant_count_index" ON "analytics_room_participant_count"("participant_count");

-- CreateIndex
CREATE INDEX "analytics_room_participant_count_room_id_index" ON "analytics_room_participant_count"("room_id");

-- CreateIndex
CREATE INDEX "analytics_room_usage_actor_id_participant_id_index" ON "analytics_room_usage"("actor_id", "participant_id");

-- CreateIndex
CREATE INDEX "analytics_room_usage_began_at_last_heartbeat_at_index" ON "analytics_room_usage"("began_at", "last_heartbeat_at");

-- CreateIndex
CREATE INDEX "analytics_room_usage_room_id_index" ON "analytics_room_usage"("room_id");

-- CreateIndex
CREATE INDEX "analytics_total_participant_counts_count_index" ON "analytics_total_participant_counts"("count");

-- CreateIndex
CREATE INDEX "analytics_total_participant_counts_measured_at_index" ON "analytics_total_participant_counts"("measured_at");

-- CreateIndex
CREATE INDEX "errors_actor_id_index" ON "errors"("actor_id");

-- CreateIndex
CREATE INDEX "errors_http_code_index" ON "errors"("http_code");

-- CreateIndex
CREATE INDEX "errors_noodle_code_index" ON "errors"("noodle_code");

-- CreateIndex
CREATE INDEX "errors_tag_index" ON "errors"("tag");

-- CreateIndex
CREATE INDEX "experience_ratings_actor_id_index" ON "experience_ratings"("actor_id");

-- CreateIndex
CREATE INDEX "experience_ratings_rating_index" ON "experience_ratings"("rating");

-- CreateIndex
CREATE INDEX "experience_ratings_room_id_index" ON "experience_ratings"("room_id");

-- CreateIndex
CREATE INDEX "experience_ratings_session_id_index" ON "experience_ratings"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "magic_codes.code_unique" ON "magic_codes"("code");

-- CreateIndex
CREATE INDEX "magic_codes_action_index" ON "magic_codes"("action");

-- CreateIndex
CREATE INDEX "magic_codes_actor_id_index" ON "magic_codes"("actor_id");

-- CreateIndex
CREATE INDEX "magic_codes_code_index" ON "magic_codes"("code");

-- CreateIndex
CREATE INDEX "messages_chat_id_index" ON "messages"("chat_id");

-- CreateIndex
CREATE INDEX "messages_sender_id_index" ON "messages"("sender_id");

-- CreateIndex
CREATE INDEX "participants_actor_id_index" ON "participants"("actor_id");

-- CreateIndex
CREATE INDEX "participants_browser_index" ON "participants"("browser");

-- CreateIndex
CREATE INDEX "participants_device_index" ON "participants"("device");

-- CreateIndex
CREATE INDEX "participants_engine_index" ON "participants"("engine");

-- CreateIndex
CREATE INDEX "participants_ip_index" ON "participants"("ip");

-- CreateIndex
CREATE INDEX "participants_os_index" ON "participants"("os");

-- CreateIndex
CREATE INDEX "participants_room_id_index" ON "participants"("room_id");

-- CreateIndex
CREATE INDEX "participants_vendor_index" ON "participants"("vendor");

-- CreateIndex
CREATE INDEX "room_memberships_actor_id_index" ON "room_memberships"("actor_id");

-- CreateIndex
CREATE INDEX "room_memberships_room_id_index" ON "room_memberships"("room_id");

-- CreateIndex
CREATE UNIQUE INDEX "room_routes.route_unique" ON "room_routes"("route");

-- CreateIndex
CREATE INDEX "room_routes_room_id_priority_level_index" ON "room_routes"("room_id", "priority_level");

-- CreateIndex
CREATE INDEX "room_routes_route_index" ON "room_routes"("route");

-- CreateIndex
CREATE UNIQUE INDEX "room_templates.name_unique" ON "room_templates"("name");

-- CreateIndex
CREATE INDEX "room_templates_creator_id_index" ON "room_templates"("creator_id");

-- CreateIndex
CREATE INDEX "room_templates_name_index" ON "room_templates"("name");

-- CreateIndex
CREATE UNIQUE INDEX "room_widget_states_widget_id_unique" ON "room_widget_states"("widget_id");

-- CreateIndex
CREATE INDEX "room_widgets_room_id_index" ON "room_widgets"("room_id");

-- CreateIndex
CREATE INDEX "room_widgets_widget_id_index" ON "room_widgets"("widget_id");

-- CreateIndex
CREATE UNIQUE INDEX "room_widgets_widget_id_unique" ON "room_widgets"("widget_id");

-- CreateIndex
CREATE UNIQUE INDEX "rooms.url_id_unique" ON "rooms"("url_id");

-- CreateIndex
CREATE INDEX "rooms_creator_id_index" ON "rooms"("creator_id");

-- CreateIndex
CREATE INDEX "rooms_deleted_at_index" ON "rooms"("deleted_at");

-- CreateIndex
CREATE INDEX "rooms_template_name_index" ON "rooms"("template_name");

-- CreateIndex
CREATE INDEX "rooms_url_id_index" ON "rooms"("url_id");

-- CreateIndex
CREATE INDEX "sessions_actor_id_index" ON "sessions"("actor_id");

-- CreateIndex
CREATE INDEX "sessions_expires_at_index" ON "sessions"("expires_at");

-- CreateIndex
CREATE INDEX "sessions_revoked_at_index" ON "sessions"("revoked_at");

-- CreateIndex
CREATE INDEX "sessions_secret_index" ON "sessions"("secret");

-- CreateIndex
CREATE INDEX "slack_actions_actor_id_index" ON "slack_actions"("actor_id");

-- CreateIndex
CREATE INDEX "slack_installs_actor_id_index" ON "slack_installs"("actor_id");

-- CreateIndex
CREATE INDEX "slack_installs_enterprise_id_index" ON "slack_installs"("enterprise_id");

-- CreateIndex
CREATE INDEX "slack_installs_workspace_id_index" ON "slack_installs"("workspace_id");

-- CreateIndex
CREATE INDEX "wallpapers_creator_id_index" ON "wallpapers"("creator_id");

-- CreateIndex
CREATE INDEX "wallpapers_url_index" ON "wallpapers"("url");

-- CreateIndex
CREATE INDEX "widgets__type_index" ON "widgets"("_type");

-- CreateIndex
CREATE INDEX "widgets_archived_at_index" ON "widgets"("archived_at");

-- CreateIndex
CREATE INDEX "widgets_creator_id_index" ON "widgets"("creator_id");

-- CreateIndex
CREATE INDEX "widgets_deleted_at_index" ON "widgets"("deleted_at");

-- AddForeignKey
ALTER TABLE "actor_events" ADD FOREIGN KEY ("actor_id") REFERENCES "actors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actor_events" ADD FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_camera_usage" ADD FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_camera_usage" ADD FOREIGN KEY ("actor_id") REFERENCES "actors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_camera_usage" ADD FOREIGN KEY ("participant_id") REFERENCES "participants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_mic_usage" ADD FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_mic_usage" ADD FOREIGN KEY ("actor_id") REFERENCES "actors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_mic_usage" ADD FOREIGN KEY ("participant_id") REFERENCES "participants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_room_participant_count" ADD FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_room_usage" ADD FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_room_usage" ADD FOREIGN KEY ("actor_id") REFERENCES "actors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_room_usage" ADD FOREIGN KEY ("participant_id") REFERENCES "participants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "errors" ADD FOREIGN KEY ("actor_id") REFERENCES "actors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experience_ratings" ADD FOREIGN KEY ("actor_id") REFERENCES "actors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experience_ratings" ADD FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experience_ratings" ADD FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "magic_codes" ADD FOREIGN KEY ("actor_id") REFERENCES "actors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD FOREIGN KEY ("chat_id") REFERENCES "widgets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD FOREIGN KEY ("sender_id") REFERENCES "actors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participants" ADD FOREIGN KEY ("actor_id") REFERENCES "actors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participants" ADD FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_memberships" ADD FOREIGN KEY ("actor_id") REFERENCES "actors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_memberships" ADD FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_participant_states" ADD FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_participant_states" ADD FOREIGN KEY ("actor_id") REFERENCES "actors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_routes" ADD FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_states" ADD FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_states" ADD FOREIGN KEY ("wallpaper_id") REFERENCES "wallpapers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_templates" ADD FOREIGN KEY ("creator_id") REFERENCES "actors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_widget_states" ADD FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_widget_states" ADD FOREIGN KEY ("widget_id") REFERENCES "widgets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_widgets" ADD FOREIGN KEY ("widget_id") REFERENCES "widgets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_widgets" ADD FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD FOREIGN KEY ("creator_id") REFERENCES "actors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD FOREIGN KEY ("actor_id") REFERENCES "actors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slack_actions" ADD FOREIGN KEY ("actor_id") REFERENCES "actors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slack_installs" ADD FOREIGN KEY ("actor_id") REFERENCES "actors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallpapers" ADD FOREIGN KEY ("creator_id") REFERENCES "actors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "widget_states" ADD FOREIGN KEY ("widget_id") REFERENCES "widgets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "widgets" ADD FOREIGN KEY ("creator_id") REFERENCES "actors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CUSTOM MIGRATIONS

-- Create system user
INSERT INTO "actors" ("id", "display_name", "kind", "admin") VALUES (-5000, 'Tilde', 'system', true);

-- Update Timestamp trigger (define-updated-at)
CREATE OR REPLACE FUNCTION trigger_update_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = now() at time zone 'utc';
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

-- Actors + Source view (create-actor-events)
CREATE VIEW "actors_with_source" AS
    SELECT
        actors.*,
        actor_events.value as source
    FROM
        actors JOIN actor_events ON actors.id = actor_events.actor_id
    WHERE
        actor_events.key='sourced';

-- updated_at trigger for rooms (create-rooms)
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON rooms
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_update_timestamp();

-- updated_at trigger for room_memberships (create-room-memberships)
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON room_memberships
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_update_timestamp();

-- updated_at trigger for room_routes (create-room-routes)
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON room_routes
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_update_timestamp();

-- view for preferred room routes (create-room-routes)
CREATE VIEW "preferred_room_routes" AS
    SELECT * FROM (
        SELECT *, row_number() OVER w AS row_number_within_window
        FROM room_routes
        window  w as (partition by room_id order by priority_level desc, created_at desc)
    ) x
    WHERE row_number_within_window = 1;

-- updated_at trigger for magic_codes (create-magic-codes)
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON magic_codes
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_update_timestamp();

-- updated_at trigger for widgets (create-widgets)
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON widgets
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_update_timestamp();

-- UNICORN: models are stored in a separate schema, which Prisma doesn't support.
-- To access unicorn models we currently have to use raw DB queries, which is fine since
-- we were going to have to do that anyway.
CREATE SCHEMA unicorn;
CREATE TABLE unicorn.ops (
    collection character varying(255) not null,
    doc_id bigint not null,
    version integer not null,
    operation jsonb not null, -- {v:0, create:{...}} or {v:n, op:[...]}
    created_at timestamptz DEFAULT (now() at time zone 'utc') NOT NULL,
    PRIMARY KEY (collection, doc_id, version)
);
CREATE TABLE unicorn.snapshots (
    collection character varying(255) not null,
    doc_id bigint not null,
    doc_type character varying(255) not null,
    version integer not null,
    data jsonb not null,
    created_at timestamptz DEFAULT (now() at time zone 'utc') NOT NULL,
    PRIMARY KEY (collection, doc_id)
);

-- updated_at trigger for experience_ratings (create-experience-ratings)
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON experience_ratings
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_update_timestamp();

-- updated_at trigger for participants (create-participants)
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON participants
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_update_timestamp();

-- updated_at trigger for templates (create-templates)
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON room_templates
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_update_timestamp();

-- updated_at trigger for wallpapers (wallpapers)
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON wallpapers
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_update_timestamp();

-- nulling of wallpaper_id when a wallpaper is deleted (wallpaper-delete-trigger)
CREATE OR REPLACE FUNCTION wallpaper_delete_cleanup_trigger()
    RETURNS TRIGGER AS $$
    BEGIN
      UPDATE room_states SET wallpaper_id = NULL WHERE wallpaper_id = OLD.id;
      RETURN OLD;
    END;
    $$ LANGUAGE plpgsql;

CREATE TRIGGER wallpaper_delete_cleanup
    BEFORE DELETE ON wallpapers
    FOR EACH ROW
    EXECUTE PROCEDURE wallpaper_delete_cleanup_trigger();
