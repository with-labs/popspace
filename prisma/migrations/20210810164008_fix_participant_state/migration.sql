-- AddForeignKey
ALTER TABLE "participant_states" ADD FOREIGN KEY ("actor_id") REFERENCES "actors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Custom SQL
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON "participant_states"
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_update_timestamp();
