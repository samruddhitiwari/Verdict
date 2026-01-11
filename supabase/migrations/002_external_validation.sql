-- Add external_validation column for External Signal Playbook
ALTER TABLE validations 
ADD COLUMN IF NOT EXISTS external_validation jsonb;

-- Add comment for documentation
COMMENT ON COLUMN validations.external_validation IS 
'Stores AI-generated External Signal Playbook with Reddit, X (Twitter), and Discord validation guidance';
