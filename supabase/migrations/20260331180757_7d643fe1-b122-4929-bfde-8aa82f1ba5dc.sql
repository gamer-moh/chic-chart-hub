
INSERT INTO storage.buckets (id, name, public) VALUES ('project-documents', 'project-documents', true);

CREATE POLICY "Public read documents" ON storage.objects FOR SELECT USING (bucket_id = 'project-documents');
CREATE POLICY "Auth upload documents" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'project-documents');
CREATE POLICY "Auth delete documents" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'project-documents');
