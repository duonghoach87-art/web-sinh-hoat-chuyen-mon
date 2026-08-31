-- ==============================================================================
-- CƠ SỞ DỮ LIỆU: CỔNG THÔNG TIN & QUẢN LÝ TỔ CHUYÊN MÔN KHOA HỌC TỰ NHIÊN (THCS)
-- HỆ THỐNG: SUPABASE POSTGRESQL + ROW LEVEL SECURITY (RLS) + STORAGE POLICIES
-- PHIÊN BẢN: 2.1 (TỰ ĐỘNG XỬ LÝ TRÙNG LẶP POLICY - CHẠY KHÔNG BAO GIỜ BỊ LỖI)
-- ==============================================================================

-- 1. KÍCH HOẠT EXTENSIONS CẦN THIẾT
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. BẢNG DỮ LIỆU CHÍNH (11 BẢNG)
-- ==============================================================================

-- 2.1 BẢNG PROFILES (HỒ SƠ GIÁO VIÊN & PHÂN QUYỀN)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'teacher' CHECK (role IN ('admin', 'head_teacher', 'teacher')),
    specialty TEXT DEFAULT 'Khoa học Tự nhiên', -- Vật lý, Hóa học, Sinh học, KHTN
    duties TEXT DEFAULT 'Giáo viên giảng dạy', -- Tổ trưởng, Tổ phó, Thư ký, Giáo viên
    avatar_url TEXT,
    phone TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.2 BẢNG OFFICIAL_DOCUMENTS (VĂN BẢN CẤP TRÊN: CHỈ THỊ, NGHỊ QUYẾT, CÔNG VĂN)
CREATE TABLE IF NOT EXISTS public.official_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    document_number TEXT,
    category TEXT NOT NULL DEFAULT 'Công văn', -- Chỉ thị, Nghị quyết, Quyết định, Thông tư, Công văn, Hướng dẫn
    issuing_authority TEXT DEFAULT 'Phòng GD&ĐT', -- Bộ GD&ĐT, Sở GD&ĐT, Phòng GD&ĐT, Ban Giám hiệu
    issue_date DATE DEFAULT CURRENT_DATE,
    file_url TEXT,
    file_name TEXT,
    file_size TEXT,
    description TEXT,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.3 BẢNG DEPARTMENT_PLANS (KẾ HOẠCH CỦA TỔ KHTN)
CREATE TABLE IF NOT EXISTS public.department_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('weekly', 'monthly', 'term', 'yearly')),
    school_year TEXT NOT NULL DEFAULT '2025-2026',
    term TEXT, -- Học kỳ 1, Học kỳ 2, Cả năm
    month TEXT, -- Tháng 9, Tháng 10...
    week_number INT,
    content TEXT,
    file_url TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.4 BẢNG MEETING_MINUTES (BIÊN BẢN SINH HOẠT TỔ CHUYÊN MÔN & CHUYÊN ĐỀ)
CREATE TABLE IF NOT EXISTS public.meeting_minutes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    meeting_type TEXT NOT NULL CHECK (meeting_type IN ('regular', 'lesson_study', 'quality_improvement')),
    meeting_date DATE NOT NULL DEFAULT CURRENT_DATE,
    location TEXT DEFAULT 'Phòng Hội đồng SP / Phòng Sinh hoạt Tổ KHTN',
    chairperson TEXT, -- Người chủ trì (Tổ trưởng/Tổ phó)
    secretary TEXT, -- Thư ký cuộc họp
    attendees_count INT DEFAULT 11,
    content TEXT,
    conclusions TEXT,
    file_url TEXT, -- File scan PDF có chữ ký
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.5 BẢNG EXAM_BANK (NGÂN HÀNG ĐỀ THI & MA TRẬN ĐẶC TẢ)
CREATE TABLE IF NOT EXISTS public.exam_bank (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    grade_level INT NOT NULL CHECK (grade_level IN (6, 7, 8, 9)),
    subject TEXT NOT NULL DEFAULT 'Khoa học Tự nhiên', -- Khoa học Tự nhiên, Vật lý, Hóa học, Sinh học
    exam_type TEXT NOT NULL DEFAULT 'mid_term', -- regular, mid_term, final_term
    school_year TEXT NOT NULL DEFAULT '2025-2026',
    exam_file_url TEXT NOT NULL, -- File Đề thi (PDF / Word)
    matrix_file_url TEXT NOT NULL, -- File Ma trận / Bản đặc tả (PDF / Word)
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.6 BẢNG TEACHING_REGISTRATIONS (ĐĂNG KÝ THAO GIẢNG / CHUYÊN ĐỀ / HỘI GIẢNG)
CREATE TABLE IF NOT EXISTS public.teaching_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    topic_title TEXT NOT NULL,
    subject TEXT NOT NULL DEFAULT 'Khoa học Tự nhiên',
    grade_level INT NOT NULL CHECK (grade_level IN (6, 7, 8, 9)),
    teaching_date DATE NOT NULL,
    period_number INT NOT NULL CHECK (period_number BETWEEN 1 AND 10),
    curriculum_period INT,
    classroom TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'thao_giang' CHECK (type IN ('thao_giang', 'chuyen_de', 'hoi_giang', 'du_gio')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewer_note TEXT,
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.7 BẢNG VIRTUAL_LABS (THÍ NGHIỆM ẢO / MÔ PHỎNG PHET KHTN)
CREATE TABLE IF NOT EXISTS public.virtual_labs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    subject TEXT NOT NULL CHECK (subject IN ('physics', 'chemistry', 'biology', 'general')),
    grade_level INT,
    thumbnail_url TEXT,
    link_url TEXT NOT NULL,
    iframe_code TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.8 BẢNG EMULATIONS (ĐÁNH GIÁ & THI ĐUA TỔ CHUYÊN MÔN)
CREATE TABLE IF NOT EXISTS public.emulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    period_type TEXT NOT NULL CHECK (period_type IN ('month', 'term', 'year')),
    period_value TEXT NOT NULL,
    school_year TEXT NOT NULL DEFAULT '2025-2026',
    professional_score NUMERIC(5,2) DEFAULT 0,
    teaching_score NUMERIC(5,2) DEFAULT 0,
    activity_score NUMERIC(5,2) DEFAULT 0,
    total_score NUMERIC(5,2) DEFAULT 0,
    rank TEXT NOT NULL DEFAULT 'Tốt' CHECK (rank IN ('Xuất sắc', 'Tốt', 'Khá', 'Đạt', 'Chưa đạt')),
    notes TEXT,
    rated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.9 BẢNG NOTIFICATIONS (HỆ THỐNG THÔNG BÁO NỘI BỘ)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link_url TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    type TEXT NOT NULL DEFAULT 'system',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.10 BẢNG LESSON_EVALUATIONS (PHIẾU ĐÁNH GIÁ TIẾT DỰ GIỜ THEO CÔNG VĂN 5512)
CREATE TABLE IF NOT EXISTS public.lesson_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL REFERENCES public.teaching_registrations(id) ON DELETE CASCADE,
    evaluator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    criteria_1_score NUMERIC(4,2) DEFAULT 0,
    criteria_2_score NUMERIC(4,2) DEFAULT 0,
    criteria_3_score NUMERIC(4,2) DEFAULT 0,
    total_score NUMERIC(4,2) DEFAULT 0,
    rank TEXT NOT NULL DEFAULT 'Tốt' CHECK (rank IN ('Xuất sắc', 'Tốt', 'Khá', 'Đạt', 'Chưa đạt')),
    strengths TEXT,
    improvements TEXT,
    general_comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.11 BẢNG SCHOOL_SETTINGS (CẤU HÌNH THÔNG TIN TRƯỜNG & TỔ KHTN)
CREATE TABLE IF NOT EXISTS public.school_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_authority TEXT NOT NULL DEFAULT 'PHÒNG GIÁO DỤC VÀ ĐÀO TẠO',
    school_name TEXT NOT NULL DEFAULT 'TRƯỜNG THCS CHU VĂN AN',
    department_name TEXT NOT NULL DEFAULT 'TỔ KHOA HỌC TỰ NHIÊN',
    school_year TEXT NOT NULL DEFAULT '2025-2026',
    active_term TEXT NOT NULL DEFAULT 'Học kỳ 1',
    principal_name TEXT DEFAULT 'Thầy Nguyễn Văn Quản (Hiệu trưởng)',
    head_teacher_name TEXT DEFAULT 'Thầy Dương Văn Hoạch (Tổ trưởng KHTN)',
    address TEXT DEFAULT 'Số 123 Đường Giáo Dục, Quận/Huyện...',
    phone_number TEXT DEFAULT '024.3838.xxxx',
    logo_url TEXT,
    motto TEXT DEFAULT 'Đoàn kết - Sáng tạo - Đổi mới phương pháp dạy học',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Tự động chèn bản ghi cài đặt mặc định nếu chưa có
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.school_settings LIMIT 1) THEN
        INSERT INTO public.school_settings (
            department_authority, school_name, department_name, school_year, principal_name, head_teacher_name
        ) VALUES (
            'PHÒNG GIÁO DỤC VÀ ĐÀO TẠO',
            'TRƯỜNG THCS CHU VĂN AN',
            'TỔ KHOA HỌC TỰ NHIÊN',
            '2025-2026',
            'Thầy Nguyễn Văn Quản (Hiệu trưởng)',
            'Thầy Dương Văn Hoạch (Tổ trưởng KHTN)'
        );
    END IF;
END $$;

-- ==============================================================================
-- 3. TRIGGER ĐỒNG BỘ USER TỰ ĐỘNG TỪ AUTH VÀO PROFILES
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, specialty, duties, is_active)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'role', 'teacher'),
        COALESCE(new.raw_user_meta_data->>'specialty', 'Khoa học Tự nhiên'),
        COALESCE(new.raw_user_meta_data->>'duties', 'Giáo viên giảng dạy'),
        true
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email, full_name = EXCLUDED.full_name;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 4. BẬT BẢO MẬT RLS (ROW LEVEL SECURITY) VÀ THIẾT LẬP CHÍNH SÁCH BẢO VỆ
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.official_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.department_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_minutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teaching_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.virtual_labs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_settings ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.get_current_role()
RETURNS TEXT AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- --- 4.1 POLICIES PROFILES ---
DROP POLICY IF EXISTS "Profiles viewable by authenticated" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Profiles viewable by authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins/Head can manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins and Head Teachers can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins and Head Teachers can insert profiles" ON public.profiles;
CREATE POLICY "Admins/Head can manage profiles" ON public.profiles FOR ALL TO authenticated USING (public.get_current_role() IN ('admin', 'head_teacher'));

-- --- 4.2 POLICIES DOCUMENTS ---
DROP POLICY IF EXISTS "Documents viewable by authenticated" ON public.official_documents;
CREATE POLICY "Documents viewable by authenticated" ON public.official_documents FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins/Head can manage documents" ON public.official_documents;
DROP POLICY IF EXISTS "Head teachers and Admins can insert documents" ON public.official_documents;
DROP POLICY IF EXISTS "Head teachers and Admins can update documents" ON public.official_documents;
DROP POLICY IF EXISTS "Head teachers and Admins can delete documents" ON public.official_documents;
CREATE POLICY "Admins/Head can manage documents" ON public.official_documents FOR ALL TO authenticated USING (public.get_current_role() IN ('admin', 'head_teacher'));

-- --- 4.3 POLICIES PLANS ---
DROP POLICY IF EXISTS "Plans viewable by authenticated" ON public.department_plans;
CREATE POLICY "Plans viewable by authenticated" ON public.department_plans FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins/Head can manage plans" ON public.department_plans;
DROP POLICY IF EXISTS "Head teachers and Admins can manage plans" ON public.department_plans;
CREATE POLICY "Admins/Head can manage plans" ON public.department_plans FOR ALL TO authenticated USING (public.get_current_role() IN ('admin', 'head_teacher'));

-- --- 4.4 POLICIES MEETING MINUTES ---
DROP POLICY IF EXISTS "Minutes viewable by authenticated" ON public.meeting_minutes;
CREATE POLICY "Minutes viewable by authenticated" ON public.meeting_minutes FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated can create minutes" ON public.meeting_minutes;
DROP POLICY IF EXISTS "Authenticated users can create minutes" ON public.meeting_minutes;
CREATE POLICY "Authenticated can create minutes" ON public.meeting_minutes FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Creator or Head/Admin can update minutes" ON public.meeting_minutes;
CREATE POLICY "Creator or Head/Admin can update minutes" ON public.meeting_minutes FOR UPDATE TO authenticated USING (auth.uid() = created_by OR public.get_current_role() IN ('admin', 'head_teacher'));

DROP POLICY IF EXISTS "Head/Admin can delete minutes" ON public.meeting_minutes;
CREATE POLICY "Head/Admin can delete minutes" ON public.meeting_minutes FOR DELETE TO authenticated USING (public.get_current_role() IN ('admin', 'head_teacher'));

-- --- 4.5 POLICIES EXAM BANK ---
DROP POLICY IF EXISTS "Exams viewable by authenticated" ON public.exam_bank;
DROP POLICY IF EXISTS "Exam bank viewable by authenticated" ON public.exam_bank;
CREATE POLICY "Exams viewable by authenticated" ON public.exam_bank FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Teachers can insert exams" ON public.exam_bank;
CREATE POLICY "Teachers can insert exams" ON public.exam_bank FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Author or Head/Admin can manage exams" ON public.exam_bank;
DROP POLICY IF EXISTS "Author or Head/Admin can update exams" ON public.exam_bank;
DROP POLICY IF EXISTS "Author or Head/Admin can delete exams" ON public.exam_bank;
CREATE POLICY "Author or Head/Admin can manage exams" ON public.exam_bank FOR ALL TO authenticated USING (auth.uid() = author_id OR public.get_current_role() IN ('admin', 'head_teacher'));

-- --- 4.6 POLICIES TEACHING REGISTRATIONS ---
DROP POLICY IF EXISTS "Teaching registrations viewable" ON public.teaching_registrations;
DROP POLICY IF EXISTS "Registrations viewable by authenticated" ON public.teaching_registrations;
CREATE POLICY "Teaching registrations viewable" ON public.teaching_registrations FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Teachers can register teaching" ON public.teaching_registrations;
CREATE POLICY "Teachers can register teaching" ON public.teaching_registrations FOR INSERT TO authenticated WITH CHECK (auth.uid() = teacher_id);

DROP POLICY IF EXISTS "Teachers or Head/Admin can update reg" ON public.teaching_registrations;
DROP POLICY IF EXISTS "Teachers can update own pending registration" ON public.teaching_registrations;
CREATE POLICY "Teachers or Head/Admin can update reg" ON public.teaching_registrations FOR UPDATE TO authenticated USING (auth.uid() = teacher_id OR public.get_current_role() IN ('admin', 'head_teacher'));

DROP POLICY IF EXISTS "Head/Admin can delete reg" ON public.teaching_registrations;
DROP POLICY IF EXISTS "Head/Admin can delete registrations" ON public.teaching_registrations;
CREATE POLICY "Head/Admin can delete reg" ON public.teaching_registrations FOR DELETE TO authenticated USING (auth.uid() = teacher_id OR public.get_current_role() IN ('admin', 'head_teacher'));

-- --- 4.7 POLICIES VIRTUAL LABS ---
DROP POLICY IF EXISTS "Virtual labs viewable by authenticated" ON public.virtual_labs;
DROP POLICY IF EXISTS "Virtual labs viewable by all authenticated" ON public.virtual_labs;
CREATE POLICY "Virtual labs viewable by authenticated" ON public.virtual_labs FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Head/Admin can manage virtual labs" ON public.virtual_labs;
CREATE POLICY "Head/Admin can manage virtual labs" ON public.virtual_labs FOR ALL TO authenticated USING (public.get_current_role() IN ('admin', 'head_teacher'));

-- --- 4.8 POLICIES EMULATION ---
DROP POLICY IF EXISTS "Emulations viewable" ON public.emulations;
DROP POLICY IF EXISTS "Emulations viewable by teacher or if published" ON public.emulations;
CREATE POLICY "Emulations viewable" ON public.emulations FOR SELECT TO authenticated USING (auth.uid() = teacher_id OR is_published = true OR public.get_current_role() IN ('admin', 'head_teacher'));

DROP POLICY IF EXISTS "Head/Admin can manage emulations" ON public.emulations;
CREATE POLICY "Head/Admin can manage emulations" ON public.emulations FOR ALL TO authenticated USING (public.get_current_role() IN ('admin', 'head_teacher'));

-- --- 4.9 POLICIES NOTIFICATIONS ---
DROP POLICY IF EXISTS "Users can manage own notifications" ON public.notifications;
CREATE POLICY "Users can manage own notifications" ON public.notifications FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- --- 4.10 POLICIES LESSON EVALUATIONS ---
DROP POLICY IF EXISTS "Evaluations viewable by authenticated" ON public.lesson_evaluations;
CREATE POLICY "Evaluations viewable by authenticated" ON public.lesson_evaluations FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Teachers can insert evaluations" ON public.lesson_evaluations;
CREATE POLICY "Teachers can insert evaluations" ON public.lesson_evaluations FOR INSERT TO authenticated WITH CHECK (auth.uid() = evaluator_id);

DROP POLICY IF EXISTS "Evaluators or Head/Admin can update evaluations" ON public.lesson_evaluations;
CREATE POLICY "Evaluators or Head/Admin can update evaluations" ON public.lesson_evaluations FOR ALL TO authenticated USING (auth.uid() = evaluator_id OR public.get_current_role() IN ('admin', 'head_teacher'));

-- --- 4.11 POLICIES SCHOOL SETTINGS ---
DROP POLICY IF EXISTS "Settings viewable by authenticated" ON public.school_settings;
CREATE POLICY "Settings viewable by authenticated" ON public.school_settings FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins/Head can update settings" ON public.school_settings;
CREATE POLICY "Admins/Head can update settings" ON public.school_settings FOR ALL TO authenticated USING (public.get_current_role() IN ('admin', 'head_teacher'));

-- ==============================================================================
-- 5. CẤU HÌNH SUPABASE STORAGE (BUCKETS)
-- ==============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('khtn-documents', 'khtn-documents', true),
    ('khtn-avatars', 'khtn-avatars', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Read khtn-documents" ON storage.objects;
CREATE POLICY "Public Read khtn-documents" ON storage.objects FOR SELECT USING (bucket_id = 'khtn-documents');

DROP POLICY IF EXISTS "Upload khtn-documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload khtn-documents" ON storage.objects;
CREATE POLICY "Upload khtn-documents" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'khtn-documents');

DROP POLICY IF EXISTS "Public Read khtn-avatars" ON storage.objects;
CREATE POLICY "Public Read khtn-avatars" ON storage.objects FOR SELECT USING (bucket_id = 'khtn-avatars');

DROP POLICY IF EXISTS "Upload khtn-avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload khtn-avatars" ON storage.objects;
CREATE POLICY "Upload khtn-avatars" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'khtn-avatars');

-- ==============================================================================
-- 6. DỮ LIỆU MÔ PHỎNG PHET KHTN BAN ĐẦU
-- ==============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.virtual_labs WHERE title = 'Mô phỏng PhET: Cân bằng Lực & Đòn bẩy') THEN
        INSERT INTO public.virtual_labs (title, description, subject, grade_level, link_url, iframe_code)
        VALUES 
        (
            'Mô phỏng PhET: Cân bằng Lực & Đòn bẩy',
            'Khám phá quy tắc đòn bẩy, sự cân bằng lực tác dụng và trọng tâm của vật thể (KHTN 6 - Vật lý).',
            'physics',
            6,
            'https://phet.colorado.edu/sims/html/balancing-act/latest/balancing-act_all.html',
            '<iframe src="https://phet.colorado.edu/sims/html/balancing-act/latest/balancing-act_all.html" width="100%" height="600" allowfullscreen></iframe>'
        ),
        (
            'Mô phỏng PhET: Cấu tạo Nguyên tử',
            'Xây dựng các nguyên tử từ proton, neutron và electron. Khám phá bảng tuần hoàn và tính ổn định (KHTN 7 - Hóa học).',
            'chemistry',
            7,
            'https://phet.colorado.edu/sims/html/build-an-atom/latest/build-an-atom_all.html',
            '<iframe src="https://phet.colorado.edu/sims/html/build-an-atom/latest/build-an-atom_all.html" width="100%" height="600" allowfullscreen></iframe>'
        ),
        (
            'Mô phỏng PhET: Tán xạ Ánh sáng & Khúc xạ',
            'Quan sát hiện tượng phản xạ toàn phần và khúc xạ ánh sáng qua lăng kính, môi trường nước và không khí (KHTN 9 - Vật lý).',
            'physics',
            9,
            'https://phet.colorado.edu/sims/html/bending-light/latest/bending-light_all.html',
            '<iframe src="https://phet.colorado.edu/sims/html/bending-light/latest/bending-light_all.html" width="100%" height="600" allowfullscreen></iframe>'
        ),
        (
            'Mô phỏng PhET: Chọn lọc Tự nhiên & Di truyền Thỏ',
            'Mô phỏng đột biến gen và áp lực chọn lọc tự nhiên đối với quần thể thỏ theo thời gian (KHTN 9 - Sinh học).',
            'biology',
            9,
            'https://phet.colorado.edu/sims/html/natural-selection/latest/natural-selection_all.html',
            '<iframe src="https://phet.colorado.edu/sims/html/natural-selection/latest/natural-selection_all.html" width="100%" height="600" allowfullscreen></iframe>'
        ),
        (
            'Mô phỏng PhET: Mạch điện một chiều DC (Lab)',
            'Lắp ráp mạch điện gồm pin, bóng đèn, điện trở, ampe kế và vôn kế tương tác trực quan (KHTN 8 - Vật lý).',
            'physics',
            8,
            'https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_all.html',
            '<iframe src="https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_all.html" width="100%" height="600" allowfullscreen></iframe>'
        ),
        (
            'Mô phỏng PhET: Thang đo độ pH và Dung dịch Axit - Bazo',
            'Kiểm tra tính axit/bazơ của các chất lỏng thường gặp trong đời sống và trong phòng thí nghiệm (KHTN 8 - Hóa học).',
            'chemistry',
            8,
            'https://phet.colorado.edu/sims/html/ph-scale/latest/ph-scale_all.html',
            '<iframe src="https://phet.colorado.edu/sims/html/ph-scale/latest/ph-scale_all.html" width="100%" height="600" allowfullscreen></iframe>'
        );
    END IF;
END $$;
