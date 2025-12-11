-- Extend tag_events table with purpose support
ALTER TABLE tag_events ADD COLUMN purpose_id INTEGER REFERENCES tag_purposes(id);
ALTER TABLE tag_events ADD COLUMN purpose_data TEXT;

-- Create index for purpose_id
CREATE INDEX IF NOT EXISTS idx_tag_events_purpose_id ON tag_events(purpose_id);
