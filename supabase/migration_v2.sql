-- ==============================================================================
-- BỔ SUNG CƠ SỞ DỮ LIỆU: 5 TÍNH NĂNG NÂNG CẤP TRỌNG TÂM (MIGRATION V2)
-- PHIÊN BẢN: 2.1 (TỰ ĐỘNG XỬ LÝ TRÙNG LẶP POLICY - CHẠY AN TOÀN TUYỆT ĐỐI)
-- ==============================================================================

-- 1. BẢNG NOTIFICATIONS (HỆ THỐNG THÔNG BÁO NỘI BỘ THỜI GIAN THỰC)
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

-- 2. BẢNG LESSON_EVALUATIONS (PHIẾU ĐÁNH GIÁ TIẾT DỰ GIỜ THEO CÔNG VĂN 5512/BGDĐT-GDTrH)
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

-- 3. BẢNG SCHOOL_SETTINGS (CẤU HÌNH THÔNG TIN TRƯỜNG & TỔ CHUYÊN MÔN KHTN)
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

-- 4. BẬT BẢO MẬT RLS (ROW LEVEL SECURITY)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own notifications" ON public.notifications;
CREATE POLICY "Users can manage own notifications" ON public.notifications FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Evaluations viewable by authenticated" ON public.lesson_evaluations;
CREATE POLICY "Evaluations viewable by authenticated" ON public.lesson_evaluations FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Teachers can insert evaluations" ON public.lesson_evaluations;
CREATE POLICY "Teachers can insert evaluations" ON public.lesson_evaluations FOR INSERT TO authenticated WITH CHECK (auth.uid() = evaluator_id);

DROP POLICY IF EXISTS "Evaluators or Head/Admin can update evaluations" ON public.lesson_evaluations;
CREATE POLICY "Evaluators or Head/Admin can update evaluations" ON public.lesson_evaluations FOR ALL TO authenticated USING (auth.uid() = evaluator_id OR public.get_current_role() IN ('admin', 'head_teacher'));

DROP POLICY IF EXISTS "Settings viewable by authenticated" ON public.school_settings;
CREATE POLICY "Settings viewable by authenticated" ON public.school_settings FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins/Head can update settings" ON public.school_settings;
CREATE POLICY "Admins/Head can update settings" ON public.school_settings FOR ALL TO authenticated USING (public.get_current_role() IN ('admin', 'head_teacher'));
