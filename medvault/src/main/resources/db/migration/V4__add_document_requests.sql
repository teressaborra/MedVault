-- Create table for document access requests
CREATE TABLE IF NOT EXISTS document_access_requests (
    id BIGSERIAL PRIMARY KEY,
    health_document_id BIGINT REFERENCES health_documents(id) ON DELETE SET NULL,
    patient_id BIGINT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    requester_id BIGINT,
    requester_name VARCHAR(255),
    note TEXT,
    status VARCHAR(32) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_doc_req_patient ON document_access_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_doc_req_status ON document_access_requests(status);
