export type Grade = 8 | 9;
export type SceneKind = 'water' | 'balance' | 'budget' | 'energy' | 'savings' | 'study';

export interface Challenge {
  id: string;
  title: string;
  task: string;
  control: string;
  min: number;
  max: number;
  step: number;
  initial: number;
  unit: string;
}

export interface LabTopic {
  id: string;
  grade: Grade;
  title: string;
  category: string;
  description: string;
  scene: SceneKind;
  challenges: Challenge[];
}

export const LAB_TOPICS: LabTopic[] = [
  {
    id: '8.1',
    grade: 8,
    title: 'Cảnh báo mực nước',
    category: 'CẢM BIẾN & DỮ LIỆU',
    description: 'Quan sát nước dâng và chọn thời điểm cảnh báo cho khu dân cư ven sông.',
    scene: 'water',
    challenges: [
      {
        id: 'threshold',
        title: 'Chọn ngưỡng cảnh báo',
        task: 'Mực nước có thể dao động đến 55 cm trong điều kiện bình thường. Thử chọn ngưỡng cao hơn mức này nhưng vẫn cảnh báo trước mốc nguy hiểm 80 cm.',
        control: 'Ngưỡng cảnh báo',
        min: 45,
        max: 85,
        step: 5,
        initial: 60,
        unit: 'cm',
      },
      {
        id: 'rising-water',
        title: 'Kiểm tra khi nước dâng',
        task: 'Giữ ngưỡng cảnh báo ở 65 cm. Tăng mực nước từng bước và ghi lại mức đầu tiên làm đèn cảnh báo sáng.',
        control: 'Mực nước',
        min: 45,
        max: 90,
        step: 5,
        initial: 45,
        unit: 'cm',
      },
    ],
  },
  {
    id: '8.2',
    grade: 8,
    title: 'Cân bằng đòn bẩy',
    category: 'VẬT LÝ & THỬ NGHIỆM',
    description: 'Dùng khối lượng và khoảng cách đến điểm tựa để điều chỉnh thanh đòn bẩy.',
    scene: 'balance',
    challenges: [
      {
        id: 'balance',
        title: 'Cân bằng hai vật khác khối lượng',
        task: 'Đặt B ở ô +2. Tìm ô bên trái cho A để thanh cân bằng. Giải thích vì sao A cần xa điểm tựa hơn B.',
        control: 'Ô của A',
        min: -4,
        max: -1,
        step: 1,
        initial: -2,
        unit: 'ô',
      },
      {
        id: 'tip',
        title: 'Đổi hướng nghiêng bằng một lần dịch',
        task: 'Giữ B ở ô +1. Từ vị trí A ở ô −1, dịch A từng ô để tìm vị trí đầu tiên làm bên trái hạ.',
        control: 'Ô của A',
        min: -4,
        max: -1,
        step: 1,
        initial: -1,
        unit: 'ô',
      },
    ],
  },
  {
    id: '8.3',
    grade: 8,
    title: 'Tiền tiêu vặt trong tuần',
    category: 'TÀI CHÍNH CÁ NHÂN',
    description: 'Sắp xếp khoản chi thiết yếu và tiền tiết kiệm trong một ngân sách có hạn.',
    scene: 'budget',
    challenges: [
      {
        id: 'weekly-budget',
        title: 'Chia ngân sách một tuần',
        task: 'Em có 120 nghìn và cần 70 nghìn cho các khoản thiết yếu. Tìm mức chi linh hoạt để vẫn tiết kiệm được ít nhất 20 nghìn.',
        control: 'Chi linh hoạt',
        min: 0,
        max: 60,
        step: 5,
        initial: 35,
        unit: 'nghìn đồng',
      },
      {
        id: 'unexpected',
        title: 'Ứng phó khoản chi bất ngờ',
        task: 'Một khoản phát sinh 15 nghìn nâng chi thiết yếu lên 85 nghìn. Điều chỉnh chi linh hoạt để giữ mục tiêu tiết kiệm 20 nghìn.',
        control: 'Chi linh hoạt',
        min: 0,
        max: 60,
        step: 5,
        initial: 30,
        unit: 'nghìn đồng',
      },
    ],
  },
  {
    id: '9.1',
    grade: 9,
    title: 'Điện năng trong nhà',
    category: 'NĂNG LƯỢNG',
    description: 'So sánh lượng điện tiêu thụ khi đổi thời gian sử dụng hoặc công suất thiết bị.',
    scene: 'energy',
    challenges: [
      {
        id: 'hours',
        title: 'Rút ngắn thời gian sử dụng',
        task: 'Một thiết bị 60 W chạy 6 giờ mỗi ngày. Tìm thời gian dùng mới để giảm ít nhất một phần ba điện năng.',
        control: 'Thời gian sử dụng',
        min: 1,
        max: 8,
        step: 1,
        initial: 6,
        unit: 'giờ',
      },
      {
        id: 'power',
        title: 'So sánh công suất thiết bị',
        task: 'Giữ thời gian sử dụng 5 giờ. So sánh thiết bị 60 W với thiết bị 20 W và tính số Wh giảm được.',
        control: 'Công suất thiết bị',
        min: 10,
        max: 100,
        step: 10,
        initial: 60,
        unit: 'W',
      },
    ],
  },
  {
    id: '9.2',
    grade: 9,
    title: 'Tiết kiệm có mục tiêu',
    category: 'LẬP KẾ HOẠCH',
    description: 'Ước tính thời gian đạt mục tiêu và điều chỉnh kế hoạch khi có phát sinh.',
    scene: 'savings',
    challenges: [
      {
        id: 'target',
        title: 'Chọn mức tiết kiệm mỗi tuần',
        task: 'Mục tiêu là 300 nghìn trong tối đa 8 tuần. Tìm mức gửi nhỏ nhất trong các lựa chọn để đạt mục tiêu.',
        control: 'Mức gửi mỗi tuần',
        min: 20,
        max: 80,
        step: 5,
        initial: 30,
        unit: 'nghìn đồng',
      },
      {
        id: 'new-cost',
        title: 'Tính lại khi mục tiêu tăng',
        task: 'Chi phí tăng từ 300 lên 360 nghìn. So sánh số tuần nếu giữ mức gửi 40 nghìn và nếu tăng lên 45 nghìn mỗi tuần.',
        control: 'Mức gửi mỗi tuần',
        min: 20,
        max: 80,
        step: 5,
        initial: 40,
        unit: 'nghìn đồng',
      },
    ],
  },
  {
    id: '9.3',
    grade: 9,
    title: 'Luyện một kỹ năng mới',
    category: 'KỸ NĂNG HỌC TẬP',
    description:
      'Chia mục tiêu luyện tập thành những buổi vừa sức và điều chỉnh khi lịch thay đổi.',
    scene: 'study',
    challenges: [
      {
        id: 'routine',
        title: 'Chia thời gian luyện tập',
        task: 'Em có 4 buổi trong tuần. Chọn thời lượng như nhau để đạt 100 phút mà mỗi buổi không quá 30 phút.',
        control: 'Thời lượng mỗi buổi',
        min: 10,
        max: 40,
        step: 5,
        initial: 20,
        unit: 'phút',
      },
      {
        id: 'missed',
        title: 'Sắp lịch sau một buổi bị lỡ',
        task: 'Tuần này chỉ còn 3 buổi. Tìm cách đạt ít nhất 90 phút và so sánh thời lượng mỗi buổi với kế hoạch cũ.',
        control: 'Thời lượng mỗi buổi',
        min: 10,
        max: 40,
        step: 5,
        initial: 25,
        unit: 'phút',
      },
    ],
  },
];

export interface LabPreview {
  caption: string;
  bars: number[];
  displayValues?: string[];
  alarm?: boolean;
  waterLevel?: number;
  powerWatts?: number;
}

const money = (thousands: number) => `${(thousands * 1000).toLocaleString('vi-VN')} đ`;

export function getPreview(topic: LabTopic, challenge: Challenge, value: number): LabPreview {
  switch (topic.scene) {
    case 'water': {
      const level = challenge.id === 'threshold' ? 70 : value;
      const threshold = challenge.id === 'threshold' ? value : 65;
      const alarm = level >= threshold;
      return {
        caption: `Mực nước ${level} cm · Ngưỡng ${threshold} cm · ${alarm ? 'Đèn cảnh báo sáng' : 'Đèn cảnh báo tắt'}`,
        bars: [],
        alarm,
        waterLevel: level,
      };
    }
    case 'budget': {
      const essential = challenge.id === 'unexpected' ? 85 : 70;
      const remaining = 120 - essential - value;
      return {
        caption:
          remaining >= 0
            ? `Còn ${remaining} nghìn đồng để tiết kiệm`
            : `Vượt ngân sách ${-remaining} nghìn đồng`,
        bars: [essential / 100, value / 100, Math.max(0, remaining) / 100],
        displayValues: [money(essential), money(value), money(Math.max(0, remaining))],
      };
    }
    case 'energy': {
      const energy = challenge.id === 'hours' ? 60 * value : value * 5;
      return {
        caption: `Điện năng sử dụng · ${energy} Wh`,
        bars: [energy / 500],
        displayValues: [
          `${(energy / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 3 })} kWh`,
        ],
        powerWatts: challenge.id === 'hours' ? 60 : value,
      };
    }
    case 'savings': {
      const target = challenge.id === 'new-cost' ? 360 : 300;
      const weeks = Math.ceil(target / value);
      return {
        caption: `Cần ${weeks} tuần để đạt ${target} nghìn đồng`,
        bars: [value / 360, target / 360],
        displayValues: [money(value), money(target)],
      };
    }
    case 'study': {
      const sessions = challenge.id === 'missed' ? 3 : 4;
      return {
        caption: `${sessions} buổi × ${value} phút · Tổng ${sessions * value} phút`,
        bars: Array.from({ length: sessions }, () => value / 40),
        displayValues: Array.from({ length: sessions }, () => `${value} phút`),
      };
    }
    case 'balance':
      return { caption: '', bars: [] };
  }
}
