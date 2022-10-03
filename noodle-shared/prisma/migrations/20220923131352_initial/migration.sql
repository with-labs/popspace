-- CreateTable
CREATE TABLE "actor_events" (
    "id" BIGINT NOT NULL PRIMARY KEY,
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
    "meta" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "actor_events_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "actors" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "actor_events_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "actors" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "display_name" TEXT,
    "avatar_name" TEXT,
    "admin" BOOLEAN DEFAULT false,
    "verified_at" DATETIME,
    "kind" TEXT,
    "deleted_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "analytics_camera_usage" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "room_id" BIGINT NOT NULL,
    "actor_id" BIGINT,
    "participant_id" BIGINT,
    "is_toggled_on" BOOLEAN NOT NULL,
    "toggled_at" DATETIME NOT NULL,
    "last_heartbeat_at" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "analytics_camera_usage_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "actors" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "analytics_camera_usage_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "participants" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "analytics_camera_usage_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "analytics_mic_usage" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "room_id" BIGINT NOT NULL,
    "actor_id" BIGINT,
    "participant_id" BIGINT,
    "is_toggled_on" BOOLEAN NOT NULL,
    "toggled_at" DATETIME NOT NULL,
    "last_heartbeat_at" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "analytics_mic_usage_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "actors" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "analytics_mic_usage_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "participants" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "analytics_mic_usage_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "analytics_room_participant_count" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "room_id" BIGINT NOT NULL,
    "participant_count" BIGINT NOT NULL,
    "measured_at" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "analytics_room_participant_count_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "analytics_room_usage" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "room_id" BIGINT NOT NULL,
    "actor_id" BIGINT,
    "participant_id" BIGINT,
    "began_at" DATETIME NOT NULL,
    "last_heartbeat_at" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "analytics_room_usage_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "actors" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "analytics_room_usage_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "participants" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "analytics_room_usage_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "analytics_total_participant_counts" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "count" BIGINT NOT NULL,
    "measured_at" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "errors" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "actor_id" BIGINT,
    "http_code" BIGINT,
    "noodle_code" TEXT,
    "stack" TEXT,
    "message" TEXT,
    "tag" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "errors_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "actors" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "experience_ratings" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submitted_at" DATETIME NOT NULL,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rating" INTEGER NOT NULL,
    "feedback" TEXT,
    "actor_id" BIGINT,
    "room_id" BIGINT,
    "session_id" BIGINT,
    CONSTRAINT "experience_ratings_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "actors" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "experience_ratings_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "experience_ratings_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "magic_codes" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "actor_id" BIGINT NOT NULL,
    "code" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "meta" TEXT,
    "issued_at" DATETIME NOT NULL,
    "expires_at" DATETIME,
    "resolved_at" DATETIME,
    "revoked_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "magic_codes_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "actors" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "messages" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "chat_id" BIGINT,
    "content" TEXT,
    "sender_id" BIGINT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "actors" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "messages_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "widgets" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "participant_states" (
    "actor_id" BIGINT NOT NULL PRIMARY KEY,
    "state" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "participant_states_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "actors" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "participants" (
    "id" BIGINT NOT NULL PRIMARY KEY,
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
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME,
    CONSTRAINT "participants_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "actors" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "participants_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "room_memberships" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "room_id" BIGINT NOT NULL,
    "actor_id" BIGINT NOT NULL,
    "began_at" DATETIME,
    "expires_at" DATETIME,
    "revoked_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "room_memberships_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "actors" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "room_memberships_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "room_participant_states" (
    "room_id" BIGINT NOT NULL,
    "actor_id" BIGINT NOT NULL,
    "state" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("room_id", "actor_id"),
    CONSTRAINT "room_participant_states_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "actors" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "room_participant_states_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "room_routes" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "room_id" BIGINT NOT NULL,
    "route" TEXT NOT NULL,
    "priority_level" INTEGER NOT NULL DEFAULT 0,
    "is_vanity" BOOLEAN,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "room_routes_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "room_states" (
    "room_id" BIGINT NOT NULL PRIMARY KEY,
    "state" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "wallpaper_id" BIGINT,
    CONSTRAINT "room_states_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "room_states_wallpaper_id_fkey" FOREIGN KEY ("wallpaper_id") REFERENCES "wallpapers" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "room_templates" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "creator_id" BIGINT,
    "name" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data" TEXT,
    CONSTRAINT "room_templates_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "actors" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "room_widget_states" (
    "room_id" BIGINT NOT NULL,
    "widget_id" BIGINT NOT NULL,
    "state" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("room_id", "widget_id"),
    CONSTRAINT "room_widget_states_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "room_widget_states_widget_id_fkey" FOREIGN KEY ("widget_id") REFERENCES "widgets" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "room_widgets" (
    "widget_id" BIGINT NOT NULL,
    "room_id" BIGINT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("widget_id", "room_id"),
    CONSTRAINT "room_widgets_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "room_widgets_widget_id_fkey" FOREIGN KEY ("widget_id") REFERENCES "widgets" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "creator_id" BIGINT,
    "url_id" TEXT,
    "is_public" BOOLEAN DEFAULT true,
    "display_name" TEXT,
    "template_name" TEXT,
    "deleted_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "rooms_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "actors" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "actor_id" BIGINT NOT NULL,
    "secret" TEXT,
    "expires_at" DATETIME,
    "revoked_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sessions_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "actors" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "slack_actions" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "actor_id" BIGINT,
    "action" TEXT,
    "slack_user_id" TEXT,
    "channel_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "slack_actions_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "actors" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "slack_installs" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "actor_id" BIGINT,
    "workspace_id" TEXT,
    "enterprise_id" TEXT,
    "slack_user_id" TEXT,
    "install_data" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uninstalled_at" DATETIME,
    CONSTRAINT "slack_installs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "actors" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "wallpapers" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "creator_id" BIGINT,
    "name" TEXT,
    "url" TEXT NOT NULL,
    "mimetype" TEXT,
    "category" TEXT,
    "artist_name" TEXT,
    "thumbnail_url" TEXT,
    "dominant_color" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "wallpapers_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "actors" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "widget_states" (
    "widget_id" BIGINT NOT NULL PRIMARY KEY,
    "state" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "widget_states_widget_id_fkey" FOREIGN KEY ("widget_id") REFERENCES "widgets" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "widgets" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "creator_id" BIGINT,
    "_type" TEXT,
    "deleted_at" DATETIME,
    "deleted_by" BIGINT,
    "archived_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "widgets_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "actors" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "survey_responses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "actor_id" BIGINT,
    "survey_name" TEXT,
    "response" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "survey_responses_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "actors" ("id") ON DELETE SET NULL ON UPDATE CASCADE
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
CREATE UNIQUE INDEX "magic_codes_code_key" ON "magic_codes"("code");

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
CREATE UNIQUE INDEX "room_routes_route_key" ON "room_routes"("route");

-- CreateIndex
CREATE INDEX "room_routes_room_id_priority_level_index" ON "room_routes"("room_id", "priority_level");

-- CreateIndex
CREATE INDEX "room_routes_route_index" ON "room_routes"("route");

-- CreateIndex
CREATE UNIQUE INDEX "room_templates_name_key" ON "room_templates"("name");

-- CreateIndex
CREATE INDEX "room_templates_creator_id_index" ON "room_templates"("creator_id");

-- CreateIndex
CREATE INDEX "room_templates_name_index" ON "room_templates"("name");

-- CreateIndex
CREATE UNIQUE INDEX "room_widget_states_widget_id_key" ON "room_widget_states"("widget_id");

-- CreateIndex
CREATE UNIQUE INDEX "room_widgets_widget_id_key" ON "room_widgets"("widget_id");

-- CreateIndex
CREATE INDEX "room_widgets_room_id_index" ON "room_widgets"("room_id");

-- CreateIndex
CREATE INDEX "room_widgets_widget_id_index" ON "room_widgets"("widget_id");

-- CreateIndex
CREATE UNIQUE INDEX "rooms_url_id_key" ON "rooms"("url_id");

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
CREATE UNIQUE INDEX "wallpapers_url_key" ON "wallpapers"("url");

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
