/**
 * HỆ THỐNG 12 TIÊU CHÍ VÀ HƯỚNG DẪN ĐÁNH GIÁ BÀI DẠY THEO CÔNG VĂN 478/SGDĐT-GDTrH-TX&CN
 * SỞ GIÁO DỤC VÀ ĐÀO TẠO LAI CHÂU (PHỤ LỤC I & PHỤ LỤC II)
 */

export const CV478_SECTIONS = [
  {
    id: 'section_1',
    name: '1. Kế Hoạch Bài Dạy',
    maxScore: 6.0,
    criteria: [
      {
        id: 'c1',
        number: 1,
        title: 'Mức độ phù hợp của các hoạt động học với mục tiêu, nội dung và phương pháp dạy học được sử dụng.',
        maxScore: 1.0,
        rubric: {
          level1: {
            scoreRange: '0.50 - 0.65 đ (50 - 65%)',
            defaultScore: 0.5,
            desc: 'Tình huống/câu hỏi/nhiệm vụ mở đầu nhằm huy động kiến thức/kĩ năng đã có của học sinh để chuẩn bị học kiến thức/kĩ năng mới nhưng chưa tạo được mâu thuẫn nhận thức để đặt ra vấn đề/câu hỏi chính của bài học. Kiến thức mới được trình bày rõ ràng, tường minh bằng kênh chữ/kênh hình/kênh tiếng; có câu hỏi/lệnh cụ thể cho học sinh hoạt động để tiếp thu kiến thức mới. Có câu hỏi/bài tập vận dụng trực tiếp những kiến thức mới học nhưng chưa nêu rõ lí do, mục đích của mỗi câu hỏi/bài tập. Có yêu cầu học sinh liên hệ thực tế/bổ sung thông tin liên quan nhưng chưa mô tả rõ sản phẩm vận dụng mà học sinh phải thực hiện.'
          },
          level2: {
            scoreRange: '0.65 - 0.80 đ (65 - 80%)',
            defaultScore: 0.75,
            desc: 'Tình huống/câu hỏi/nhiệm vụ mở đầu chỉ có thể được giải quyết một phần hoặc phỏng đoán được kết quả nhưng chưa lí giải được đầy đủ bằng kiến thức/kĩ năng đã có của học sinh; tạo được mâu thuẫn nhận thức. Kiến thức mới được thể hiện trong kênh chữ/kênh hình/kênh tiếng; có câu hỏi/lệnh cụ thể cho học sinh hoạt động để tiếp thu kiến thức mới và giải quyết được đầy đủ tình huống/câu hỏi/nhiệm vụ mở đầu. Hệ thống câu hỏi/bài tập được lựa chọn thành hệ thống; mỗi câu hỏi/bài tập có mục đích cụ thể, nhằm rèn luyện các kiến thức/kĩ năng cụ thể. Nêu rõ yêu cầu và mô tả rõ sản phẩm vận dụng mà học sinh phải thực hiện.'
          },
          level3: {
            scoreRange: '0.80 - 1.00 đ (80 - 100%)',
            defaultScore: 1.0,
            desc: 'Tình huống/câu hỏi/nhiệm vụ mở đầu gần gũi với kinh nghiệm sống của học sinh và chỉ có thể được giải quyết một phần hoặc phỏng đoán được kết quả nhưng chưa lí giải được đầy đủ bằng kiến thức/kĩ năng đã có; đặt ra được vấn đề/câu hỏi chính của bài học. Kiến thức mới được thể hiện bằng kênh chữ/kênh hình/kênh tiếng gắn với vấn đề cần giải quyết; tiếp nối với vấn đề/câu hỏi chính của bài học để học sinh tiếp thu và giải quyết được vấn đề/câu hỏi chính của bài học. Hệ thống câu hỏi/bài tập được lựa chọn thành hệ thống, gắn với tình huống thực tiễn; mỗi câu hỏi/bài tập có mục đích cụ thể, nhằm rèn luyện các kiến thức/kĩ năng cụ thể. Hướng dẫn để học sinh tự xác định vấn đề, nội dung, hình thức thể hiện của sản phẩm vận dụng.'
          }
        }
      },
      {
        id: 'c2',
        number: 2,
        title: 'Mức độ rõ ràng, chính xác của mục tiêu, nội dung, sản phẩm, cách thức tổ chức thực hiện mỗi hoạt động học của học sinh.',
        maxScore: 2.0,
        rubric: {
          level1: {
            scoreRange: '1.00 - 1.30 đ (50 - 65%)',
            defaultScore: 1.0,
            desc: 'Mục tiêu của mỗi hoạt động và sản phẩm học tập mà học sinh phải hoàn thành trong mỗi hoạt động đó được mô tả rõ ràng nhưng chưa nêu rõ phương thức hoạt động của học sinh/nhóm học sinh nhằm hoàn thành sản phẩm học tập.'
          },
          level2: {
            scoreRange: '1.30 - 1.60 đ (65 - 80%)',
            defaultScore: 1.5,
            desc: 'Mục tiêu và sản phẩm học tập mà học sinh phải hoàn thành trong mỗi hoạt động được mô tả rõ ràng; phương thức tổ chức hoạt động cho học sinh được trình bày cụ thể, thể hiện được sự phù hợp với sản phẩm học tập cần hoàn thành.'
          },
          level3: {
            scoreRange: '1.60 - 2.00 đ (80 - 100%)',
            defaultScore: 2.0,
            desc: 'Mục tiêu, cách thức hoạt động và sản phẩm học tập mà học sinh phải hoàn thành trong mỗi hoạt động được mô tả rõ ràng; cách thức tổ chức hoạt động học cho học sinh thể hiện được sự phù hợp với sản phẩm học tập và đối tượng học sinh.'
          }
        }
      },
      {
        id: 'c3',
        number: 3,
        title: 'Mức độ phù hợp của thiết bị dạy học và học liệu được sử dụng để tổ chức các hoạt động học của học sinh.',
        maxScore: 1.0,
        rubric: {
          level1: {
            scoreRange: '0.50 - 0.65 đ (50 - 65%)',
            defaultScore: 0.5,
            desc: 'Thiết bị dạy học và học liệu thể hiện được sự phù hợp với sản phẩm học tập mà học sinh phải hoàn thành nhưng chưa mô tả rõ cách thức mà học sinh hoạt động với thiết bị dạy học và học liệu đó.'
          },
          level2: {
            scoreRange: '0.65 - 0.80 đ (65 - 80%)',
            defaultScore: 0.75,
            desc: 'Thiết bị dạy học và học liệu thể hiện được sự phù hợp với sản phẩm học tập mà học sinh phải hoàn thành; cách thức mà học sinh hành động (đọc/viết/nghe/nhìn/thực hành) với thiết bị dạy học và học liệu đó được mô tả cụ thể, rõ ràng.'
          },
          level3: {
            scoreRange: '0.80 - 1.00 đ (80 - 100%)',
            defaultScore: 1.0,
            desc: 'Thiết bị dạy học và học liệu thể hiện được sự phù hợp với sản phẩm học tập mà học sinh phải hoàn thành; cách thức mà học sinh hoạt động (đọc/viết/nghe/nhìn/thực hành) với thiết bị dạy học và học liệu đó được mô tả cụ thể, rõ ràng, phù hợp với kĩ thuật dạy học tích cực được sử dụng.'
          }
        }
      },
      {
        id: 'c4',
        number: 4,
        title: 'Mức độ phù hợp của phương án kiểm tra, đánh giá trong quá trình tổ chức hoạt động học của học sinh.',
        maxScore: 2.0,
        rubric: {
          level1: {
            scoreRange: '1.00 - 1.30 đ (50 - 65%)',
            defaultScore: 1.0,
            desc: 'Phương án kiểm tra, đánh giá sản phẩm học tập mà học sinh phải hoàn thành trong mỗi hoạt động học được mô tả nhưng chưa rõ phương án kiểm tra trong quá trình hoạt động học của học sinh.'
          },
          level2: {
            scoreRange: '1.30 - 1.60 đ (65 - 80%)',
            defaultScore: 1.5,
            desc: 'Phương án kiểm tra, đánh giá quá trình hoạt động học và sản phẩm học tập của học sinh được mô tả rõ, trong đó thể hiện rõ các tiêu chí cần đạt của các sản phẩm học tập trong các hoạt động học.'
          },
          level3: {
            scoreRange: '1.60 - 2.00 đ (80 - 100%)',
            defaultScore: 2.0,
            desc: 'Phương án kiểm tra, đánh giá quá trình hoạt động học và sản phẩm học tập của học sinh được mô tả rõ, trong đó thể hiện rõ các tiêu chí cần đạt của các sản phẩm học tập trung gian và sản phẩm học tập cuối cùng của các hoạt động học.'
          }
        }
      }
    ]
  },
  {
    id: 'section_2',
    name: '2. Hoạt Động Của Giáo Viên',
    maxScore: 7.0,
    criteria: [
      {
        id: 'c5',
        number: 5,
        title: 'Mức độ chính xác, phù hợp, sinh động, hấp dẫn của nội dung, phương pháp và hình thức giao nhiệm vụ học tập cho học sinh.',
        maxScore: 2.0,
        rubric: {
          level1: {
            scoreRange: '1.00 - 1.30 đ (50 - 65%)',
            defaultScore: 1.0,
            desc: 'Câu hỏi/lệnh rõ ràng về mục tiêu, nội dung, sản phẩm học tập phải hoàn thành, đảm bảo cho phần lớn học sinh nhận thức đúng nhiệm vụ phải thực hiện.'
          },
          level2: {
            scoreRange: '1.30 - 1.60 đ (65 - 80%)',
            defaultScore: 1.5,
            desc: 'Câu hỏi/lệnh rõ ràng về mục tiêu, nội dung, sản phẩm học tập, phương thức hoạt động gắn với thiết bị dạy học và học liệu được sử dụng; đảm bảo cho hầu hết học sinh nhận thức đúng nhiệm vụ và hăng hái thực hiện.'
          },
          level3: {
            scoreRange: '1.60 - 2.00 đ (80 - 100%)',
            defaultScore: 2.0,
            desc: 'Câu hỏi/lệnh rõ ràng về mục tiêu, nội dung, sản phẩm học tập, phương thức hoạt động gắn với thiết bị dạy học và học liệu được sử dụng; đảm bảo cho 100% học sinh nhận thức đúng nhiệm vụ và hăng hái thực hiện.'
          }
        }
      },
      {
        id: 'c6',
        number: 6,
        title: 'Khả năng theo dõi, quan sát, phát hiện kịp thời những khó khăn của học sinh.',
        maxScore: 1.0,
        rubric: {
          level1: {
            scoreRange: '0.50 - 0.65 đ (50 - 65%)',
            defaultScore: 0.5,
            desc: 'Theo dõi, bao quát được quá trình hoạt động của học sinh/nhóm học sinh; phát hiện được những học sinh/nhóm học sinh có yêu cầu được giúp đỡ hoặc có biểu hiện đang gặp khó khăn.'
          },
          level2: {
            scoreRange: '0.65 - 0.80 đ (65 - 80%)',
            defaultScore: 0.75,
            desc: 'Quan sát được cụ thể quá trình hoạt động trong từng học sinh/nhóm học sinh; phát hiện được khó khăn cụ thể mà học sinh/nhóm học sinh gặp phải trong quá trình thực hiện nhiệm vụ.'
          },
          level3: {
            scoreRange: '0.80 - 1.00 đ (80 - 100%)',
            defaultScore: 1.0,
            desc: 'Quan sát được một cách chi tiết quá trình thực hiện nhiệm vụ đến từng học sinh/nhóm học sinh; chủ động phát hiện được khó khăn cụ thể và nguyên nhân mà từng học sinh/nhóm học sinh đang gặp phải trong quá trình thực hiện nhiệm vụ.'
          }
        }
      },
      {
        id: 'c7',
        number: 7,
        title: 'Mức độ phù hợp, hiệu quả của các biện pháp hỗ trợ và khuyến khích học sinh hợp tác, giúp đỡ nhau khi thực hiện nhiệm vụ học tập.',
        maxScore: 2.0,
        rubric: {
          level1: {
            scoreRange: '1.00 - 1.30 đ (50 - 65%)',
            defaultScore: 1.0,
            desc: 'Đưa ra được những gợi ý, hướng dẫn cụ thể cho học sinh/nhóm học sinh vượt qua khó khăn và hoàn thành được nhiệm vụ học tập được giao.'
          },
          level2: {
            scoreRange: '1.30 - 1.60 đ (65 - 80%)',
            defaultScore: 1.5,
            desc: 'Chỉ ra cho học sinh/nhóm học sinh những sai lầm có thể đã mắc phải dẫn đến khó khăn; đưa ra được những định hướng khái quát để học sinh/nhóm học sinh tiếp tục hoạt động và hoàn thành nhiệm vụ học tập được giao.'
          },
          level3: {
            scoreRange: '1.60 - 2.00 đ (80 - 100%)',
            defaultScore: 2.0,
            desc: 'Chỉ ra cho học sinh/nhóm học sinh những sai lầm có thể đã mắc phải dẫn đến khó khăn; đưa ra được những định hướng khái quát; khuyến khích được học sinh hợp tác, hỗ trợ lẫn nhau để hoàn thành nhiệm vụ học tập được giao.'
          }
        }
      },
      {
        id: 'c8',
        number: 8,
        title: 'Mức độ chính xác, hiệu quả trong việc tổng hợp, phân tích, đánh giá quá trình và kết quả học tập của học sinh (làm rõ kiến thức, kĩ năng cần ghi nhận).',
        maxScore: 2.0,
        rubric: {
          level1: {
            scoreRange: '1.00 - 1.30 đ (50 - 65%)',
            defaultScore: 1.0,
            desc: 'Có câu hỏi định hướng để học sinh/nhóm học sinh tích cực tham gia nhận xét, đánh giá, bổ sung, hoàn thiện sản phẩm học tập lẫn nhau trong nhóm hoặc toàn lớp; nhận xét, đánh giá về sản phẩm học tập được đông đảo học sinh tiếp thu, ghi nhận.'
          },
          level2: {
            scoreRange: '1.30 - 1.60 đ (65 - 80%)',
            defaultScore: 1.5,
            desc: 'Lựa chọn được một số sản phẩm học tập của học sinh/nhóm học sinh để tổ chức cho học sinh trình bày, báo cáo, nhận xét, đánh giá, bổ sung, hoàn thiện lẫn nhau; câu hỏi định hướng của giáo viên giúp hầu hết học sinh tích cực tham gia thảo luận; nhận xét, đánh giá về sản phẩm học tập được đông đảo học sinh tiếp thu, ghi nhận.'
          },
          level3: {
            scoreRange: '1.60 - 2.00 đ (80 - 100%)',
            defaultScore: 2.0,
            desc: 'Lựa chọn được một số sản phẩm học tập điển hình của học sinh/nhóm học sinh để tổ chức cho học sinh trình bày, báo cáo nhận xét, đánh giá, bổ sung, hoàn thiện lẫn nhau; câu hỏi định hướng của giáo viên giúp hầu hết học sinh tích cực tham gia thảo luận, tự đánh giá và hoàn thiện được sản phẩm học tập của mình và của bạn.'
          }
        }
      }
    ]
  },
  {
    id: 'section_3',
    name: '3. Hoạt Động Của Học Sinh',
    maxScore: 7.0,
    criteria: [
      {
        id: 'c9',
        number: 9,
        title: 'Khả năng tiếp nhận và sẵn sàng thực hiện nhiệm vụ học tập của học sinh trong lớp.',
        maxScore: 2.0,
        rubric: {
          level1: {
            scoreRange: '1.00 - 1.30 đ (50 - 65%)',
            defaultScore: 1.0,
            desc: 'Phần lớn học sinh tiếp nhận đúng nhiệm vụ và sẵn sàng bắt tay vào thực hiện nhiệm vụ được giao, tuy nhiên vẫn còn một số học sinh bộc lộ chưa hiểu rõ nhiệm vụ học tập được giao.'
          },
          level2: {
            scoreRange: '1.30 - 1.60 đ (65 - 80%)',
            defaultScore: 1.5,
            desc: 'Hầu hết học sinh tiếp nhận đúng và sẵn sàng thực hiện nhiệm vụ, tuy nhiên còn một vài học sinh bộc lộ thái độ chưa tự tin trong việc thực hiện nhiệm vụ học tập được giao.'
          },
          level3: {
            scoreRange: '1.60 - 2.00 đ (80 - 100%)',
            defaultScore: 2.0,
            desc: 'Tất cả học sinh tiếp nhận đúng và hăng hái, tự tin trong việc thực hiện nhiệm vụ học tập được giao.'
          }
        }
      },
      {
        id: 'c10',
        number: 10,
        title: 'Mức độ tích cực, chủ động, sáng tạo, hợp tác của học sinh trong việc thực hiện các nhiệm vụ học tập.',
        maxScore: 2.0,
        rubric: {
          level1: {
            scoreRange: '1.00 - 1.30 đ (50 - 65%)',
            defaultScore: 1.0,
            desc: 'Nhiều học sinh tỏ ra tích cực, chủ động hợp tác với nhau để thực hiện các nhiệm vụ học tập; tuy nhiên, một số học sinh có biểu hiện dựa dẫm, chờ đợi.'
          },
          level2: {
            scoreRange: '1.30 - 1.60 đ (65 - 80%)',
            defaultScore: 1.5,
            desc: 'Hầu hết học sinh tỏ ra tích cực, chủ động, hợp tác với nhau để thực hiện các nhiệm vụ học tập; còn một vài học sinh lúng túng hoặc chưa thực sự tham gia vào hoạt động nhóm.'
          },
          level3: {
            scoreRange: '1.60 - 2.00 đ (80 - 100%)',
            defaultScore: 2.0,
            desc: 'Tất cả học sinh tích cực, chủ động, hợp tác với nhau để thực hiện nhiệm vụ học tập; nhiều học sinh/nhóm học sinh có sáng tạo trong cách thức thực hiện nhiệm vụ.'
          }
        }
      },
      {
        id: 'c11',
        number: 11,
        title: 'Mức độ tham gia tích cực của học sinh trong trình bày, thảo luận về kết quả thực hiện nhiệm vụ học tập.',
        maxScore: 2.0,
        rubric: {
          level1: {
            scoreRange: '1.00 - 1.30 đ (50 - 65%)',
            defaultScore: 1.0,
            desc: 'Nhiều học sinh hăng hái, tự tin trình bày, trao đổi ý kiến/quan điểm của cá nhân; tuy nhiên, nhiều học sinh/nhóm học sinh thảo luận chưa sôi nổi; vai trò của nhóm trưởng chưa thật nổi bật; vẫn còn một số học sinh không trình bày được quan điểm của mình hoặc tỏ ra không hợp tác trong quá trình làm việc nhóm.'
          },
          level2: {
            scoreRange: '1.30 - 1.60 đ (65 - 80%)',
            defaultScore: 1.5,
            desc: 'Hầu hết học sinh hăng hái, tự tin trình bày, trao đổi ý kiến/quan điểm của cá nhân; đa số học sinh/nhóm học sinh thảo luận sôi nổi, tự tin; đa số nhóm trưởng đã biết cách điều hành thảo luận nhóm; nhưng vẫn còn một vài học sinh không tích cực trong quá trình làm việc cá nhân/nhóm.'
          },
          level3: {
            scoreRange: '1.60 - 2.00 đ (80 - 100%)',
            defaultScore: 2.0,
            desc: 'Tất cả học sinh tích cực, hăng hái, tự tin trong việc trình bày, trao đổi ý kiến, quan điểm của cá nhân; các học sinh/nhóm học sinh thảo luận sôi nổi, tự tin; các nhóm trưởng đều tỏ ra biết cách điều hành và khái quát nội dung trao đổi, thảo luận của nhóm để thực hiện nhiệm vụ học tập.'
          }
        }
      },
      {
        id: 'c12',
        number: 12,
        title: 'Mức độ đúng đắn, chính xác, phù hợp của các kết quả thực hiện nhiệm vụ học tập của học sinh.',
        maxScore: 1.0,
        rubric: {
          level1: {
            scoreRange: '0.50 - 0.65 đ (50 - 65%)',
            defaultScore: 0.5,
            desc: 'Nhiều học sinh trả lời câu hỏi/làm bài tập đúng với yêu cầu của giáo viên về thời gian, nội dung và cách thức trình bày; tuy nhiên, vẫn còn một số học sinh chưa hoàn thành hoặc không hoàn thành hết nhiệm vụ, kết quả thực hiện nhiệm vụ còn chưa chính xác, phù hợp với yêu cầu.'
          },
          level2: {
            scoreRange: '0.65 - 0.80 đ (65 - 80%)',
            defaultScore: 0.75,
            desc: 'Đa số học sinh trả lời câu hỏi/làm bài tập đúng với yêu cầu của giáo viên về thời gian, nội dung và cách thức trình bày; song vẫn còn một vài học sinh trình bày/diễn đạt kết quả chưa rõ ràng do chưa nắm vững yêu cầu.'
          },
          level3: {
            scoreRange: '0.80 - 1.00 đ (80 - 100%)',
            defaultScore: 1.0,
            desc: 'Tất cả học sinh đều trả lời câu hỏi/làm bài tập đúng với yêu cầu của giáo viên về thời gian, nội dung và cách thức trình bày; nhiều câu trả lời/đáp án mà học sinh đưa ra thể hiện sự sáng tạo trong suy nghĩ và cách thể hiện.'
          }
        }
      }
    ]
  }
];

/**
 * Xác định Mức đánh giá (1, 2, 3) của một tiêu chí thành phần
 * - Mức 1: từ 50% đến dưới 65% tiêu chí điểm tối đa
 * - Mức 2: từ 65% đến dưới 80% tiêu chí điểm tối đa
 * - Mức 3: từ 80% đến 100% tiêu chí điểm tối đa
 */
export function getCriterionLevel(score, maxScore) {
  const sc = parseFloat(score) || 0;
  const mx = parseFloat(maxScore) || 1.0;
  const ratio = sc / mx;

  if (ratio >= 0.80) return 3;
  if (ratio >= 0.65) return 2;
  if (ratio >= 0.50) return 1;
  return 0; // Dưới mức 1 (< 50%)
}

/**
 * Xác định Mức tổng thể của toàn bài dạy (Mức 1, Mức 2, Mức 3)
 * - Mức 3: từ 80% đến 100% điểm tối đa (từ 16.00 đến 20.00 đ)
 * - Mức 2: từ 65% đến dưới 80% điểm tối đa (từ 13.00 đến dưới 16.00 đ)
 * - Mức 1: từ 50% đến dưới 65% điểm tối đa (từ 10.00 đến dưới 13.00 đ)
 */
export function getOverallLessonLevel(totalScore) {
  const score = parseFloat(totalScore) || 0;
  const percentage = (score / 20.0) * 100;

  if (percentage >= 80.0) return 3; // Mức 3: 80% - 100%
  if (percentage >= 65.0) return 2; // Mức 2: 65% - 80%
  if (percentage >= 50.0) return 1; // Mức 1: 50% - 65%
  return 0; // Dưới mức đánh giá (< 50%)
}

/**
 * Hàm tính xếp loại bài dạy CHUẨN XÁC theo Mục II.2 Công văn 478/SGDĐT-GDTrH-TX&CN:
 *
 * 1. GIỎI: Tổng điểm đạt từ 18.0 điểm đến 20.0 điểm và đạt đánh giá ở Mức 3 (tức tổng điểm >= 80%)
 * 2. KHÁ: Tổng điểm đạt từ 13.5 điểm đến dưới 18.0 điểm và đạt đánh giá từ Mức 2 trở lên (tức tổng điểm >= 65%)
 * 3. TRUNG BÌNH: Tổng điểm đạt từ 10.0 điểm đến dưới 13.5 điểm và đạt đánh giá ở Mức 1 trở lên (tức tổng điểm >= 50%)
 * 4. KHÔNG ĐẠT: Tổng điểm dưới 10.0 điểm (< 50%) và không đạt mức đánh giá.
 *
 * @param {number|string} totalScore - Tổng điểm đạt được (tối đa 20.00 đ)
 * @returns {string} - 'Giỏi' | 'Khá' | 'Trung bình' | 'Không đạt'
 */
export function calculateCV478Rank(totalScore) {
  const score = parseFloat(totalScore) || 0;

  if (score >= 18.0) {
    return 'Giỏi';
  }
  if (score >= 13.5) {
    return 'Khá';
  }
  if (score >= 10.0) {
    return 'Trung bình';
  }
  return 'Không đạt';
}
