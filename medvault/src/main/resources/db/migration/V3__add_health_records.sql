-- Add lifestyle and health data fields to patients table
ALTER TABLE patients ADD COLUMN IF NOT EXISTS smoking_habit VARCHAR(50);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS alcohol_habit VARCHAR(50);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS diet_type VARCHAR(50);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS physical_activity VARCHAR(50);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS sleep_hours VARCHAR(50);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS stress_level VARCHAR(50);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS sleep_quality VARCHAR(50);

-- Health data columns
ALTER TABLE patients ADD COLUMN IF NOT EXISTS weight DOUBLE PRECISION;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS height DOUBLE PRECISION;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS bmi DOUBLE PRECISION;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS blood_pressure_systolic INTEGER;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS blood_pressure_diastolic INTEGER;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS pulse_rate INTEGER;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS temperature DOUBLE PRECISION;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS respiratory_rate INTEGER;

-- Add identification_id to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS identification_id VARCHAR(50) UNIQUE;

-- Create health_documents table
CREATE TABLE IF NOT EXISTS health_documents (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    document_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(50),
    document_url TEXT NOT NULL,
    document_date DATE,
    doctor_name VARCHAR(255),
    hospital_name VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_health_documents_patient ON health_documents(patient_id);
CREATE INDEX IF NOT EXISTS idx_health_documents_type ON health_documents(document_type);
