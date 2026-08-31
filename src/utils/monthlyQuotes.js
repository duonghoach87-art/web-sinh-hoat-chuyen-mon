/**
 * Tiện ích cung cấp thông điệp, khẩu hiệu và chủ đề sư phạm tự động theo 12 tháng năm học
 * Dành riêng cho cấp THCS & Tổ Khoa Học Tự Nhiên
 */
export function getMonthlyPedagogicalTheme(customMotto = null) {
  const currentMonth = new Date().getMonth() + 1; // 1 - 12

  const monthlyThemes = {
    1: {
      badge: 'Tháng 1 • Sơ Kết Học Kỳ I & Khởi Động HKI',
      title: 'Tăng tốc giảng dạy - Đổi mới phương pháp',
      motto: customMotto || 'Đoàn kết - Đổi mới sinh hoạt chuyên môn theo định hướng phát triển năng lực học sinh.',
      highlight: 'Tập trung hoàn thiện đánh giá học sinh theo Thông tư 22/2021/TT-BGDĐT.'
    },
    2: {
      badge: 'Tháng 2 • Mừng Xuân Mới & Thi Đua Dạy Tốt',
      title: 'Khí thế thi đua đầu xuân mới',
      motto: customMotto || 'Mỗi giờ lên lớp là một niềm vui sáng tạo - Vững vàng chuyên môn, thân thiện học trò.',
      highlight: 'Đẩy mạnh ứng dụng thí nghiệm thực hành ảo và chuyển đổi số trong môn KHTN.'
    },
    3: {
      badge: 'Tháng 3 • Tháng Thanh Niên & Nghiên Cứu KHKT',
      title: 'Tuổi trẻ sáng tạo - Nghiên cứu khoa học kỹ thuật',
      motto: customMotto || 'Khơi dậy niềm đam mê khám phá tự nhiên và tư duy khoa học cho học sinh THCS.',
      highlight: 'Tăng cường các tiết dạy STEM / STEAM liên môn Toán, Lý, Hóa, Sinh, Tin, Công nghệ.'
    },
    4: {
      badge: 'Tháng 4 • Đợt Ôn Tập & Khảo Sát Chuyên Đề',
      title: 'Chuyên đề nâng cao chất lượng dạy học',
      motto: customMotto || 'Đổi mới kiểm tra đánh giá - Chuẩn bị tốt nhất cho kỳ kiểm tra học kỳ II.',
      highlight: 'Rà soát ma trận đề thi và ngân hàng câu hỏi chuẩn đặc tả chương trình GDPT 2018.'
    },
    5: {
      badge: 'Tháng 5 • Tổng Kết Năm Học & Tri Ân',
      title: 'Gặt hái thành công - Thi đua dạy tốt học tốt',
      motto: customMotto || 'Đoàn kết, sáng tạo, hoàn thành thắng lợi nhiệm vụ năm học của Tổ KHTN.',
      highlight: 'Tổng kết phong trào thi đua, nghiệm thu sáng kiến kinh nghiệm và báo cáo chuyên môn.'
    },
    6: {
      badge: 'Tháng 6 • Bồi Dưỡng Chuyên Môn Hè',
      title: 'Nâng cao năng lực chuyên môn và nghiệp vụ',
      motto: customMotto || 'Tự học và bồi dưỡng thường xuyên - Nền tảng cho chất lượng giáo dục bền vững.',
      highlight: 'Bồi dưỡng sách giáo khoa mới và cập nhật phương pháp dạy học hiện đại.'
    },
    7: {
      badge: 'Tháng 7 • Chuẩn Bị Cơ Sở Vật Chất & Kế Hoạch',
      title: 'Xây dựng kế hoạch giáo dục năm học mới',
      motto: customMotto || 'Chủ động xây dựng kế hoạch dạy học linh hoạt, hiệu quả, phù hợp đối tượng học sinh.',
      highlight: 'Chuẩn bị phòng thực hành bộ môn, thiết bị và hóa chất thí nghiệm KHTN.'
    },
    8: {
      badge: 'Tháng 8 • Tập Huấn Chuyên Môn Đầu Năm',
      title: 'Sẵn sàng tâm thế bước vào năm học mới',
      motto: customMotto || 'Tâm huyết, trách nhiệm, sẵn sàng cho một năm học mới đầy thắng lợi và sáng tạo.',
      highlight: 'Hoàn thiện phân công chuyên môn và kế hoạch hoạt động của Tổ Khoa học Tự nhiên.'
    },
    9: {
      badge: 'Tháng 9 • Khai Giảng & Chào Đón Năm Học Mới',
      title: 'Chào mừng năm học mới - Năm học đổi mới sáng tạo',
      motto: customMotto || 'Đoàn kết - Sáng tạo - Kỷ cương - Tình thương - Trách nhiệm trong từng tiết dạy.',
      highlight: 'Xây dựng kế hoạch bài dạy theo Công văn 5512/BGDĐT-GDTrH chuẩn chỉ ngay từ đầu năm.'
    },
    10: {
      badge: 'Tháng 10 • Tháng Hội Giảng & Thao Giảng Chuyên Môn',
      title: 'Đẩy mạnh sinh hoạt chuyên môn theo nghiên cứu bài học',
      motto: customMotto || 'Học tập đồng nghiệp, trao đổi kinh nghiệm, nâng cao hiệu quả từng giờ dạy trên lớp.',
      highlight: 'Tổ chức các chuyên đề thao giảng cấp tổ và ứng dụng công nghệ thông tin.'
    },
    11: {
      badge: 'Tháng 11 • Tri Ân Thầy Cô - Chào Mừng 20/11',
      title: 'Tôn sư trọng đạo - Thi đua Hoa điểm 10 dâng Thầy Cô',
      motto: customMotto || 'Mỗi thầy cô giáo là một tấm gương đạo đức, tự học và sáng tạo.',
      highlight: 'Đợt hội giảng chào mừng Ngày Nhà giáo Việt Nam 20/11 - Vinh danh giáo viên tiêu biểu.'
    },
    12: {
      badge: 'Tháng 12 • Ôn Tập & Kiểm Tra Cuối Học Kỳ I',
      title: 'Đánh giá thực chất - Nâng cao chất lượng giáo dục',
      motto: customMotto || 'Đánh giá khách quan, công bằng, thúc đẩy học sinh tự tin và tiến bộ.',
      highlight: 'Xây dựng ma trận đề kiểm tra cuối kỳ I và hoàn thiện hồ sơ sổ sách chuyên môn.'
    }
  };

  return monthlyThemes[currentMonth] || monthlyThemes[9];
}
