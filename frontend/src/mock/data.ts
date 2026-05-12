export interface Item {
  id: number
  name: string
  type: string
  category: string
  location: string
  status: string
  purchase_date: string
  price: number
  depreciation_period: number
  department: string
  base: string
  description?: string
}

export interface TransferRequest {
  id: number
  item_id: number
  item_name: string
  from_location: string
  to_location: string
  from_department: string
  to_department: string
  reason: string
  status: string
  applicant: string
  approved_by?: string
  approved_at?: string
  created_at: string
}

export interface PaymentPlan {
  id: number
  item_id: number
  payment_date: string
  amount: number
  status: string
}

export interface Base {
  id: number
  name: string
  code: string
  budget: number
}

export const bases: Base[] = [
  { id: 1, name: '上海基地', code: 'SH', budget: 5000000 },
  { id: 2, name: '苏州基地', code: 'SZ', budget: 3000000 },
  { id: 3, name: '杭州基地', code: 'HZ', budget: 4000000 }
]

export const items: Item[] = [
  { id: 1, name: 'CNC加工中心', type: 'machinery', category: '生产设备', location: 'A车间-1区', status: 'in_use', purchase_date: '2024-01-15', price: 500000, depreciation_period: 10, department: '生产部', base: '上海基地', description: '高精度CNC加工中心' },
  { id: 2, name: '注塑机', type: 'machinery', category: '生产设备', location: 'B车间-2区', status: 'in_use', purchase_date: '2024-03-20', price: 350000, depreciation_period: 8, department: '生产部', base: '上海基地', description: '全自动注塑机' },
  { id: 3, name: '叉车', type: 'vehicle', category: '运输设备', location: '仓库', status: 'idle', purchase_date: '2024-05-10', price: 80000, depreciation_period: 5, department: '物流部', base: '上海基地', description: '电动叉车' },
  { id: 4, name: '办公电脑', type: 'electronic', category: '办公用品', location: '办公楼-3层', status: 'in_use', purchase_date: '2024-06-01', price: 8000, depreciation_period: 3, department: '财务部', base: '上海基地', description: 'Dell OptiPlex 7090' },
  { id: 5, name: '打印机', type: 'electronic', category: '办公用品', location: '办公楼-2层', status: 'maintenance', purchase_date: '2024-02-10', price: 15000, depreciation_period: 5, department: '行政部', base: '上海基地', description: 'HP LaserJet Enterprise' },
  { id: 6, name: '焊接机器人', type: 'machinery', category: '生产设备', location: 'C车间-1区', status: 'in_use', purchase_date: '2024-04-15', price: 800000, depreciation_period: 10, department: '生产部', base: '苏州基地', description: 'ABB焊接机器人' },
  { id: 7, name: '切割机', type: 'machinery', category: '生产设备', location: 'D车间-2区', status: 'in_use', purchase_date: '2024-01-20', price: 200000, depreciation_period: 8, department: '生产部', base: '苏州基地', description: '等离子切割机' },
  { id: 8, name: '空调系统', type: 'equipment', category: '基础设施', location: '办公楼', status: 'in_use', purchase_date: '2024-07-01', price: 120000, depreciation_period: 15, department: '行政部', base: '苏州基地', description: '中央空调系统' },
  { id: 9, name: '投影仪', type: 'electronic', category: '办公用品', location: '会议室', status: 'in_use', purchase_date: '2024-05-20', price: 12000, depreciation_period: 5, department: '行政部', base: '苏州基地', description: 'EPSON投影仪' },
  { id: 10, name: '冲压机', type: 'machinery', category: '生产设备', location: 'E车间-1区', status: 'in_use', purchase_date: '2024-02-28', price: 450000, depreciation_period: 10, department: '生产部', base: '杭州基地', description: '大型液压冲压机' },
  { id: 11, name: '包装机', type: 'machinery', category: '生产设备', location: 'F车间-2区', status: 'idle', purchase_date: '2024-03-15', price: 180000, depreciation_period: 8, department: '包装部', base: '杭州基地', description: '全自动包装机' },
  { id: 12, name: '服务器', type: 'electronic', category: 'IT设备', location: '机房', status: 'in_use', purchase_date: '2024-06-10', price: 60000, depreciation_period: 5, department: 'IT部', base: '杭州基地', description: 'Dell PowerEdge R750' },
  { id: 13, name: '办公桌椅', type: 'furniture', category: '办公用品', location: '办公楼-1层', status: 'in_use', purchase_date: '2024-01-05', price: 25000, depreciation_period: 5, department: '销售部', base: '杭州基地', description: '办公桌椅套装' }
]

export const transferRequests: TransferRequest[] = [
  { id: 1, item_id: 3, item_name: '叉车', from_location: '仓库', to_location: 'A车间-1区', from_department: '物流部', to_department: '生产部', reason: '生产需要临时使用', status: 'pending', applicant: '张三', created_at: '2024-06-15 10:30' },
  { id: 2, item_id: 9, item_name: '投影仪', from_location: '会议室', to_location: '培训室', from_department: '行政部', to_department: '培训部', reason: '培训需求', status: 'approved', applicant: '李四', approved_by: '管理员', approved_at: '2024-06-14 15:00', created_at: '2024-06-14 09:00' }
]

export const paymentPlans: PaymentPlan[] = [
  { id: 1, item_id: 1, payment_date: '2024-01-15', amount: 250000, status: 'paid' },
  { id: 2, item_id: 1, payment_date: '2024-07-15', amount: 250000, status: 'paid' },
  { id: 3, item_id: 2, payment_date: '2024-03-20', amount: 175000, status: 'paid' },
  { id: 4, item_id: 2, payment_date: '2024-09-20', amount: 175000, status: 'pending' },
  { id: 5, item_id: 3, payment_date: '2024-05-10', amount: 80000, status: 'paid' },
  { id: 6, item_id: 6, payment_date: '2024-04-15', amount: 400000, status: 'paid' },
  { id: 7, item_id: 6, payment_date: '2024-10-15', amount: 400000, status: 'pending' },
  { id: 8, item_id: 10, payment_date: '2024-02-28', amount: 225000, status: 'paid' },
  { id: 9, item_id: 10, payment_date: '2024-08-28', amount: 225000, status: 'pending' }
]

export const types = ['machinery', 'electronic', 'vehicle', 'equipment', 'furniture']
export const categories = ['生产设备', '办公用品', '运输设备', '基础设施', 'IT设备']
export const statuses = ['in_use', 'idle', 'maintenance', 'scrapped']
export const departments = ['生产部', '财务部', '行政部', '物流部', '包装部', 'IT部', '销售部']

export const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    in_use: '使用中',
    idle: '闲置',
    maintenance: '维护中',
    scrapped: '已报废'
  }
  return labels[status] || status
}

export const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    in_use: 'success',
    idle: 'warning',
    maintenance: 'info',
    scrapped: 'danger'
  }
  return colors[status] || 'default'
}

export const getTransferStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: '待审批',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return labels[status] || status
}