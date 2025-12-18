
import { Story, AdminImage } from "../types";

const STORIES_KEY = "vn_companion_stories";
const IMAGES_KEY = "vn_companion_images";

export const IMAGE_KEYS = {
  AUTH_HERO: 'AUTH_HERO',
  DASHBOARD_HERO: 'DASHBOARD_HERO',
  DASHBOARD_READING: 'DASHBOARD_READING',
  DASHBOARD_STORIES: 'DASHBOARD_STORIES',
  DASHBOARD_DICTIONARY: 'DASHBOARD_DICTIONARY',
  DASHBOARD_GAMES: 'DASHBOARD_GAMES',
  GAMES_HERO: 'GAMES_HERO',
  GAME_RUNG_CHUONG_VANG: 'GAME_RUNG_CHUONG_VANG',
  GAME_VUA_TIENG_VIET: 'GAME_VUA_TIENG_VIET',
  GAME_DUOI_HINH_BAT_CHU: 'GAME_DUOI_HINH_BAT_CHU',
};

const DEFAULT_STORIES: Story[] = [
  {
    id: '1',
    title: 'Thánh Gióng',
    duration: '5 phút',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDBWmZQHrocpbDAKCXuiBy3bq74U8DVD4gv3AjYtH2uypfLrgZkJ0I_5X2Jdl4cRZQXRQz4ovcvO_I3jUfIpnvALxy5NLut1Dok1epJ0Kw0lXLnIOxQkGudY2SYcuiQFWydbiT5NrqJf1AkF8LwXQVhh6h9XmXrkf1SsfquR32kbs7UahlXoDjLJKz3CTk-Tb514wwgwPZ6S3mRpIhe7n2KE6tvHbNOx47GL6cW-3Re913eahH0UfXBNWXQs6eHCDAzCtKWzRFFhQ',
    summary: 'Truyền thuyết về người anh hùng làng Gióng.',
    content: `Vào đời Hùng Vương thứ sáu, ở làng Gióng có hai vợ chồng ông lão chăm chỉ làm ăn và ăn ở phúc đức nhưng mãi không có con. \n\nMột hôm bà ra đồng thấy một vết chân rất to, liền đặt bàn chân mình lên ướm thử để xem thua kém bao nhiêu. Không ngờ về nhà bà thụ thai và mười hai tháng sau sinh được một cậu con trai khôi ngô tuấn tú.\n\nKỳ lạ thay, cậu bé ấy lên ba tuổi mà vẫn không biết nói, biết cười, đặt đâu nằm đấy. Bấy giờ có giặc Ân đến xâm phạm bờ cõi nước ta. Thế giặc mạnh, nhà vua lo sợ, bèn sai sứ giả đi khắp nơi rao tìm người tài giỏi cứu nước.\n\nĐứa bé nghe tin, bỗng dưng cất tiếng nói: "Mẹ ra mời sứ giả vào đây". Sứ giả vào, đứa bé bảo: "Ông về tâu vua sắm cho ta một con ngựa sắt, một cái roi sắt và một tấm áo giáp sắt, ta sẽ phá tan lũ giặc này".`
  },
  {
    id: '2',
    title: 'Cây Tre Trăm Đốt',
    duration: '4 phút',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAx1Tce1F-Uu26VOXcKgXvrTInaiUa2X0QMwGC3z8bJB-XxxVCCBKN46pNljnd7-C7nHcYdTs1E46kaShnlT-B-S7Dv2L41GTmtOu-SLWWTH_Pr0kk7J1hQrXRVIsFi2y6qTfrdpoNGNLl7CGu--fsytImJW_PZTjRgz9_f56dALxB-1Rhv8zbcU0nsIB5Lc7_xyQ8QpTeCjgrATAashWhzazM0k2ipg2USIlpLvxgqAIhN4NO08IMGXFSCS4gTCwHmJEomTgg2BA',
    summary: 'Câu chuyện về lòng trung thực và phép màu của ông Bụt.',
    content: 'Ngày xửa ngày xưa, có một anh nông dân nghèo đi cày thuê cho lão phú ông. Lão hứa nếu anh làm việc chăm chỉ trong ba năm, lão sẽ gả con gái cho...'
  }
];

const DEFAULT_IMAGES: AdminImage[] = [
  { id: 'auth-hero', key: IMAGE_KEYS.AUTH_HERO, url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAs8ES2d4qfX1CPkR3tdK1bo394PZgw34Zgj19ewQ7rGS1yPGYaO2dL7wtIHNEA-kSIE8gjz-Dvqey0eYkrZUNA0WYbwu3iAe1lMExYtTA8cGSlW7t3tIBSF4uhgp4Fj6P65E3rCNrr3Br5wabJA5yD8iKVHIUnmbDcjgcwohxd01hqhAfHkGbpsfW7rVneezm8-9aYVsCYSm5h7tHyi8FyK2YmKct1SvWyzEo9593AJTmidvHNDKBkExupDDxMZwZ6NtUUjQc45g', description: 'Hình minh họa trang Đăng nhập', category: 'System' },
  { id: 'dash-hero', key: IMAGE_KEYS.DASHBOARD_HERO, url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3p1Js7q-qE3ZzD7ykqRn59jFSLb6L4txqXpEW1cd028lqvEe-lqg5oF6h8NsvYjOVXc3FhqgQ_DRVvt5QPLbV1fX0-9DR6sqQXj6srnN3U0FpVONxI2qNfZA-RvcugujCMkUrGmBhPpzoteXxBkVTRe3DbVOsa17CrOZc16RAJ-Uqz3Y0lx_I0Y2QtSn76ISI_RC-Zh7CWnLBpfg5aQ97Ay7wNxIsq6xcD2E3t0O0wRk1pUvmBQCPFaAURGGTh3FeNErzY4Zp1Q', description: 'Hình minh họa trang Chủ', category: 'System' },
  { id: 'dash-reading', key: IMAGE_KEYS.DASHBOARD_READING, url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDm7DEgbI8CzwYbAqgXhxGyCO0jHp0rLfxvoeTuZjQ2jpWQv5DUncTEGRkzO-UaOng7h9jFvUPTwKEmheqaFoVLlDfaCkxxY0b5DT9dvefLWv1CHSXLamV_xFt5WDRe2RvFooVwkWawS2c7eYGnHyVXa8K3b_VxPf28O_rVPJM60dT6CZepJmYCnYMcNtVIxuQXzusQYTtn9QTOSJCB1aA2KK-YOjbDJepJfILlD9aoaQN82FxhA8iFNKrLmLNiaNasjzhgTS6lRQ', description: 'Thẻ Luyện đọc', category: 'System' },
  { id: 'dash-stories', key: IMAGE_KEYS.DASHBOARD_STORIES, url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2j5kA6qbv7Im4ELQ4ph2OJt2R0k20w_n78E-shcr40XtCjShCWPxTpUVI2jAJUBH3WdqEeJ53AZEiVSuVsyViOnYgI63uUF9NuObyQg5Arkb9qL11bZHeOEIGvAcIUMVw3kLvhAY2XMXCFLo89EiV74K12fX1bU5Nwy-ie5x68M7EY-u-dLiMvJITSwTtI4enkrCeU6Yr1CgrIdk89ftzFhQkDguBhzTYvDIUSQU6x67qHvjuYLC0Viygf4bw0iOJO75MYF74_Q', description: 'Thẻ Kể chuyện', category: 'System' },
  { id: 'dash-dict', key: IMAGE_KEYS.DASHBOARD_DICTIONARY, url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5tapRLSBvwi1m0pxzYtx7gvQabmhfOEn2xMHbk6RwNhtrPLTHVVMl8OEqI2GBZQ_lVjbxfi52MhPQ7nOS9EphvCGHe5tCtdmrgFbe2thx_i7hwVAQWSwLpb-IkXMkYZtDPnwylwnUnWVKb7vUIwKuV2J0SHZbhLG7vlWfKw4U65SU5RGBDhCMXV5D8cIXNSKgwDYavsBde7S3JKWOaay6KFTi-jvWnhxcpl1J8UwQN41-NJ-hJ6yRPbzWpEL616mZCWfzvSweLQ', description: 'Thẻ Tra từ điển', category: 'System' },
  { id: 'dash-games', key: IMAGE_KEYS.DASHBOARD_GAMES, url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJGNlzpyt67Oy2lmy2gJsgXuNvjjPXgnGZtEwe5zfIbEM-hHCi87oxJCgrNRVjRbW2V0aI_7WM0QbEWmiVIFoL6UFIomOXCBHQSBk_S8ekNuY3gamOIu8MoPMKyN9xFRWUv6GoeYMQd-vI_u8UOom0P_S-RHujXd60gr_LjAEHrqijfjfwL9RuDVWJQyYjrwpOHh43ZkAO2qCVz5YMiobphmIJhRyvQzpElooSO0nrT9rhbZ7zgF9zAWydYQhQeEDX46LAusvugA', description: 'Thẻ Trò chơi', category: 'System' },
  { id: 'games-hero', key: IMAGE_KEYS.GAMES_HERO, url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCsH-LYWBG-MzY_1rlCHgrdPr4R3wmNyyNvFZiNhp80smdJq2b1k_V2rhD4Ub_SUPYS3VkyiZV5G0-Tp2suhXthIza4FaxZvg2lGjL5MJoAcFDMBofnqABHOpZwHsXs79iFoul_-Y-cnZNrB3M5xJ8h863dW3ILXE3g9flgEu7zQSzbwyuBMvGVRVDZILH2EFMpLV63deIXIaAHxtjtQplWuisJkOGwViKppYlVsyeY9ekpJu54YzXd6mX03bwnjQfy2-e4p1OMKw', description: 'Hình minh họa trang Trò chơi', category: 'System' },
  { id: 'game-rcv', key: IMAGE_KEYS.GAME_RUNG_CHUONG_VANG, url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAa5zXtyMeeyVwM8dGtmbVlgclcUbzlU5O7cQgY3I0iX0QwUc-vhU7ApQ4e1LYuVkijrvEmI8KxHK6KPPHQy3FEcJmWIVZRfkxpJjkiTRVwpEtz51IJ_9LOvWrrqNnBWWjDEN97Wkoq4E9WzPf85CpY5OLloI0b04xMa7YfEqKf24_LBqVUMOOUqNMscdHT7oCIw8KjEP2ew-YxAxzqeNwp_sljWNrK4irTFszn8bu_JH9j7QdWNTVE-VoxfEfRp2U2HCv6Q5GDMg', description: 'Hình trò chơi Rung Chuông Vàng', category: 'System' },
  { id: 'game-vtv', key: IMAGE_KEYS.GAME_VUA_TIENG_VIET, url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlNn1eZLKN6rt2m4uiDEaTHzK2gC4HlEhlgaXWDc1s9UHnxJhHGJ_qQLIOMCltppSxT3K_tJf-v8WAl3Fv9FKadELdvrqbNwdU58k7GQ6lO8fhrujRCDAwEySn84F8rLf_rt0lVsc5SbGGCcEHfPanErqmN0pPiK5Jp6HtTjArgBZYGPTOL12IQboTrGPfmOcACjwYRP8vDTOuqA6MnMnDeAh0kz0y-QR_Psjm1NjyjVrf5Y8PPCFO9rPjUCKXpwpow7KyDvK-bw', description: 'Hình trò chơi Vua Tiếng Việt', category: 'System' },
  { id: 'game-dhbc', key: IMAGE_KEYS.GAME_DUOI_HINH_BAT_CHU, url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqrUvoIZfr_ga_cClK1o54tevcwhDhVkf9aMUNRTFJ-tDxSg4XOd3L3mAV60EpLjwbxO-nkBMPKazaBgy-nEZhcQhG2i8Q9DN79pNdnushaEqh-DzMM0SlqPxzjLaOopSC3krQj0X3ZZudxOu9mvC0USNB3xhJEWbAVCic7UuPPW32arJln33_ODrdnHVlri_23FZIXWJ4qePEIF8z3RMmhNydLHOpZwFg6QQber6wMQVomuEsZDCXyfEQGcZiLVkK8W1T31XD6w', description: 'Hình trò chơi Đuổi Hình Bắt Chữ', category: 'System' },
];

export const dataService = {
  getStories: (): Story[] => {
    const data = localStorage.getItem(STORIES_KEY);
    return data ? JSON.parse(data) : DEFAULT_STORIES;
  },
  saveStories: (stories: Story[]) => {
    localStorage.setItem(STORIES_KEY, JSON.stringify(stories));
  },
  getImages: (): AdminImage[] => {
    const data = localStorage.getItem(IMAGES_KEY);
    return data ? JSON.parse(data) : DEFAULT_IMAGES;
  },
  saveImages: (images: AdminImage[]) => {
    localStorage.setItem(IMAGES_KEY, JSON.stringify(images));
  },
  getSystemImage: (key: string, fallback: string): string => {
    const images = dataService.getImages();
    const found = images.find(img => img.key === key);
    return found ? found.url : fallback;
  }
};
