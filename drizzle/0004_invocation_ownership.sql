ALTER TABLE invocations
ADD COLUMN user_id INTEGER REFERENCES users(id);

CREATE INDEX invocations_user_id_idx ON invocations(user_id);
