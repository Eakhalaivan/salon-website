-- Additional performance indexes to prevent table scans for frequently filtered endpoints

-- Improve Product endpoints (filtered by type and is_active)
CREATE INDEX idx_products_type_active ON products(type, is_active);
CREATE INDEX idx_products_deleted ON products(deleted_at);

-- Improve Services filtering
CREATE INDEX idx_services_category_active ON services(category_id, is_active);

-- Improve Users lookup by email
CREATE INDEX idx_users_email ON users(email);

-- Improve Attendance filtering by date
CREATE INDEX idx_attendance_date ON staff_attendance(date, branch_id);
