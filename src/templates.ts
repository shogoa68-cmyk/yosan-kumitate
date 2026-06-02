import { Template } from './types'

export const TEMPLATES: Template[] = [
  {
    name: '引越し準備',
    icon: '🏠',
    description: '新居への引越しにかかる費用をまとめて見積もれます',
    groups: [
      {
        name: '賃貸初期費用',
        icon: '🔑',
        items: [
          { name: '敷金', unitPrice: 120000, quantity: 2, unit: 'ヶ月分' },
          { name: '礼金', unitPrice: 120000, quantity: 1, unit: 'ヶ月分' },
          { name: '仲介手数料', unitPrice: 120000, quantity: 1, unit: 'ヶ月分' },
          { name: '火災保険', unitPrice: 20000, quantity: 1, unit: '式' },
          { name: '鍵交換費用', unitPrice: 15000, quantity: 1, unit: '式' },
        ],
      },
      {
        name: '引越し作業費',
        icon: '🚛',
        items: [
          { name: '引越し業者', unitPrice: 80000, quantity: 1, unit: '式' },
          { name: '梱包資材', unitPrice: 3000, quantity: 1, unit: '式' },
          { name: '不用品処分', unitPrice: 10000, quantity: 1, unit: '式' },
        ],
      },
      {
        name: 'リビング',
        icon: '🛋️',
        items: [
          { name: 'ソファ', unitPrice: 80000, quantity: 1, unit: '台' },
          { name: 'テレビ台', unitPrice: 30000, quantity: 1, unit: '台' },
          { name: 'カーテン', unitPrice: 15000, quantity: 2, unit: '枚' },
          { name: '照明', unitPrice: 8000, quantity: 1, unit: '台' },
        ],
      },
      {
        name: '寝室',
        icon: '🛏️',
        items: [
          { name: 'ベッドフレーム', unitPrice: 60000, quantity: 1, unit: '台' },
          { name: 'マットレス', unitPrice: 50000, quantity: 1, unit: '枚' },
          { name: 'チェスト', unitPrice: 25000, quantity: 1, unit: '台' },
        ],
      },
      {
        name: '家電',
        icon: '📦',
        items: [
          { name: '冷蔵庫', unitPrice: 80000, quantity: 1, unit: '台' },
          { name: '洗濯機', unitPrice: 70000, quantity: 1, unit: '台' },
          { name: '電子レンジ', unitPrice: 20000, quantity: 1, unit: '台' },
          { name: '炊飯器', unitPrice: 15000, quantity: 1, unit: '台' },
        ],
      },
    ],
  },
  {
    name: '旅行',
    icon: '✈️',
    description: '旅行の費用を項目ごとに整理できます',
    groups: [
      {
        name: '交通費',
        icon: '🚄',
        items: [
          { name: '新幹線・飛行機', unitPrice: 20000, quantity: 2, unit: '人分' },
          { name: '現地交通費', unitPrice: 5000, quantity: 2, unit: '人分' },
        ],
      },
      {
        name: '宿泊費',
        icon: '🏨',
        items: [
          { name: 'ホテル・宿', unitPrice: 15000, quantity: 3, unit: '泊' },
        ],
      },
      {
        name: '食費',
        icon: '🍽️',
        items: [
          { name: '食事代', unitPrice: 3000, quantity: 6, unit: '食' },
        ],
      },
      {
        name: 'アクティビティ',
        icon: '🎡',
        items: [
          { name: '観光・入場料', unitPrice: 3000, quantity: 2, unit: '人分' },
        ],
      },
    ],
  },
  {
    name: '大型家電・家具購入',
    icon: '🛒',
    description: '大きな買い物の予算をグループ別に整理できます',
    groups: [
      {
        name: 'キッチン家電',
        icon: '🍳',
        items: [
          { name: '冷蔵庫', unitPrice: 80000, quantity: 1, unit: '台' },
          { name: '電子レンジ', unitPrice: 20000, quantity: 1, unit: '台' },
          { name: '炊飯器', unitPrice: 15000, quantity: 1, unit: '台' },
        ],
      },
      {
        name: '生活家電',
        icon: '🧺',
        items: [
          { name: '洗濯機', unitPrice: 70000, quantity: 1, unit: '台' },
          { name: '掃除機', unitPrice: 30000, quantity: 1, unit: '台' },
          { name: '空気清浄機', unitPrice: 25000, quantity: 1, unit: '台' },
        ],
      },
    ],
  },
]

export const GROUP_ICON_SUGGESTIONS = [
  '🏠', '🔑', '🚛', '🛋️', '🛏️', '📦', '🍳', '🧺', '✈️', '🚄',
  '🏨', '🍽️', '🎡', '🛒', '💄', '🐾', '🎒', '💊', '🖥️', '🚗',
]
