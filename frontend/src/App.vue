<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Layout,
  Menu,
  MenuItem,
  Table,
  TableColumn,
  Button,
  Dialog,
  Form,
  FormItem,
  Input,
  Select,
  SelectOption,
  DatePicker,
  InputNumber,
  Message,
  Popconfirm,
  Progress,
  Card,
  Row,
  Col,
  Tag,
  Package,
  ArrowRight,
  MapLocation,
  PieChart,
  Search,
  Plus,
  Edit,
  Trash,
  Check,
  X,
  Dashboard
} from 'element-plus'

import {
  items as mockItems,
  transferRequests as mockTransferRequests,
  paymentPlans,
  bases,
  types,
  categories,
  statuses,
  departments,
  getStatusLabel,
  getStatusColor,
  getTransferStatusLabel,
  type Item,
  type TransferRequest
} from './mock/data'

const activeMenu = ref('items')
const items = ref<Item[]>([...mockItems])
const transferRequests = ref<TransferRequest[]>([...mockTransferRequests])
const showDialog = ref(false)
const showTransferDialog = ref(false)
const isEdit = ref(false)

const searchForm = ref({ type: '', category: '', location: '', status: '', base: '', department: '' })
const transferSearchForm = ref({ status: '' })

const form = ref({
  name: '', type: '', category: '', location: '', purchase_date: '',
  price: 0, depreciation_period: 5, department: '', base: '', description: ''
})

const transferForm = ref({
  item_id: 0, from_location: '', to_location: '', from_department: '',
  to_department: '', reason: '', applicant: ''
})

const filteredItems = computed(() => {
  return items.value.filter(item => {
    if (searchForm.value.type && item.type !== searchForm.value.type) return false
    if (searchForm.value.category && item.category !== searchForm.value.category) return false
    if (searchForm.value.location && !item.location.includes(searchForm.value.location)) return false
    if (searchForm.value.status && item.status !== searchForm.value.status) return false
    if (searchForm.value.base && item.base !== searchForm.value.base) return false
    if (searchForm.value.department && item.department !== searchForm.value.department) return false
    return true
  })
})

const filteredTransferRequests = computed(() => {
  return transferRequests.value.filter(req => {
    if (transferSearchForm.value.status && req.status !== transferSearchForm.value.status) return false
    return true
  })
})

const groupedByLocation = computed(() => {
  const groups: Record<string, Item[]> = {}
  items.value.forEach(item => {
    const key = `${item.base} - ${item.location}`
    if (!groups[key]) groups[key] = []
    groups[key].push(item)
  })
  return groups
})

const totalInvestment = computed(() => {
  return items.value.reduce((sum, item) => sum + item.price, 0)
})

const totalItems = computed(() => items.value.length)

const totalPayment = computed(() => {
  return paymentPlans.reduce((sum, plan) => sum + plan.amount, 0)
})

const totalDepreciation = computed(() => {
  return items.value.reduce((sum, item) => sum + item.price / item.depreciation_period, 0)
})

const budgetSummary = computed(() => {
  return bases.map(base => {
    const usedBudget = items.value.filter(item => item.base === base.name).reduce((sum, item) => sum + item.price, 0)
    return {
      ...base,
      usedBudget,
      remainingBudget: base.budget - usedBudget,
      percentage: Math.round((usedBudget / base.budget) * 100)
    }
  })
})

const totalBudget = computed(() => {
  const total = budgetSummary.value.reduce((acc, base) => {
    acc.allocated += base.budget
    acc.used += base.usedBudget
    acc.remaining += base.remainingBudget
    return acc
  }, { allocated: 0, used: 0, remaining: 0 })
  return total
})

const investmentByBase = computed(() => {
  const summary: Record<string, { total: number; count: number; categories: Record<string, number> }> = {}
  items.value.forEach(item => {
    if (!summary[item.base]) {
      summary[item.base] = { total: 0, count: 0, categories: {} }
    }
    summary[item.base].total += item.price
    summary[item.base].count += 1
    summary[item.base].categories[item.category] = (summary[item.base].categories[item.category] || 0) + item.price
  })
  return summary
})

const paymentPlanByMonth = computed(() => {
  const plan: Record<string, { total: number; paid: number; pending: number }> = {}
  paymentPlans.forEach(p => {
    const month = p.payment_date.substring(0, 7)
    if (!plan[month]) plan[month] = { total: 0, paid: 0, pending: 0 }
    plan[month].total += p.amount
    plan[month][p.status] += p.amount
  })
  return Object.entries(plan).map(([month, data]) => ({ month, ...data }))
})

const depreciationByBase = computed(() => {
  const summary: Record<string, { total: number; items: Array<{ name: string; value: number; annual: number }> }> = {}
  items.value.forEach(item => {
    if (!summary[item.base]) summary[item.base] = { total: 0, items: [] }
    const annual = item.price / item.depreciation_period
    summary[item.base].total += annual
    summary[item.base].items.push({ name: item.name, value: item.price, annual })
  })
  return summary
})

const openDialog = (item?: Item) => {
  if (item) {
    isEdit.value = true
    form.value = { ...item, purchase_date: item.purchase_date }
  } else {
    isEdit.value = false
    form.value = { name: '', type: '', category: '', location: '', purchase_date: '', price: 0, depreciation_period: 5, department: '', base: '', description: '' }
  }
  showDialog.value = true
}

const saveItem = () => {
  if (!form.value.name || !form.value.type || !form.value.category) {
    Message.warning('请填写必填字段')
    return
  }
  if (isEdit.value) {
    const index = items.value.findIndex(i => i.id === form.value.id)
    if (index !== -1) {
      items.value[index] = { ...form.value as Item }
      Message.success('更新成功')
    }
  } else {
    const newItem: Item = {
      ...form.value as Item,
      id: Date.now(),
      status: 'in_use',
      purchase_date: form.value.purchase_date || new Date().toISOString().split('T')[0]
    }
    items.value.push(newItem)
    Message.success('创建成功')
  }
  showDialog.value = false
}

const deleteItem = (id: number) => {
  const index = items.value.findIndex(i => i.id === id)
  if (index !== -1) {
    items.value.splice(index, 1)
    Message.success('删除成功')
  }
}

const openTransferDialog = () => {
  transferForm.value = { item_id: 0, from_location: '', to_location: '', from_department: '', to_department: '', reason: '', applicant: '' }
  showTransferDialog.value = true
}

const handleItemChange = (itemId: number) => {
  const item = items.value.find(i => i.id === itemId)
  if (item) {
    transferForm.value.from_location = item.location
    transferForm.value.from_department = item.department
  }
}

const submitTransfer = () => {
  if (!transferForm.value.item_id || !transferForm.value.to_location || !transferForm.value.applicant) {
    Message.warning('请填写必填字段')
    return
  }
  const item = items.value.find(i => i.id === transferForm.value.item_id)
  const newRequest: TransferRequest = {
    id: Date.now(),
    item_id: transferForm.value.item_id,
    item_name: item?.name || '',
    from_location: transferForm.value.from_location,
    to_location: transferForm.value.to_location,
    from_department: transferForm.value.from_department,
    to_department: transferForm.value.to_department,
    reason: transferForm.value.reason,
    status: 'pending',
    applicant: transferForm.value.applicant,
    created_at: new Date().toLocaleString()
  }
  transferRequests.value.push(newRequest)
  Message.success('申请提交成功')
  showTransferDialog.value = false
}

const approveTransfer = (id: number) => {
  const index = transferRequests.value.findIndex(r => r.id === id)
  if (index !== -1) {
    transferRequests.value[index].status = 'approved'
    transferRequests.value[index].approved_by = '管理员'
    transferRequests.value[index].approved_at = new Date().toLocaleString()
    
    const itemIndex = items.value.findIndex(i => i.id === transferRequests.value[index].item_id)
    if (itemIndex !== -1) {
      items.value[itemIndex].location = transferRequests.value[index].to_location
      items.value[itemIndex].department = transferRequests.value[index].to_department
    }
    Message.success('审批通过')
  }
}

const rejectTransfer = (id: number) => {
  const index = transferRequests.value.findIndex(r => r.id === id)
  if (index !== -1) {
    transferRequests.value[index].status = 'rejected'
    Message.success('已拒绝')
  }
}

const deleteTransfer = (id: number) => {
  const index = transferRequests.value.findIndex(r => r.id === id)
  if (index !== -1) {
    transferRequests.value.splice(index, 1)
    Message.success('删除成功')
  }
}
</script>

<template>
  <Layout class="app-layout">
    <Layout.Sider width="200" style="background: #2a3f5f;">
      <div class="logo">
        <Dashboard class="logo-icon" />
        <span>投资管理平台</span>
      </div>
      <Menu
        mode="vertical"
        active-text-color="#fff"
        background-color="#2a3f5f"
        text-color="#b8c7ce"
        :default-active="activeMenu"
        @select="(key) => activeMenu = key"
      >
        <MenuItem key="items">
          <Package />
          <span>物品管理</span>
        </MenuItem>
        <MenuItem key="transfers">
          <ArrowRight />
          <span>转移申请</span>
        </MenuItem>
        <MenuItem key="location">
          <MapLocation />
          <span>定位图</span>
        </MenuItem>
        <MenuItem key="summary">
          <PieChart />
          <span>投资汇总</span>
        </MenuItem>
      </Menu>
    </Layout.Sider>
    
    <Layout>
      <Layout.Header style="padding: 0 20px; background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,.1);">
        <div class="header-title">
          {{ activeMenu === 'items' ? '物品管理' : activeMenu === 'transfers' ? '转移申请' : activeMenu === 'location' ? '物品定位图' : '投资汇总' }}
        </div>
      </Layout.Header>
      
      <Layout.Content style="padding: 20px; min-height: calc(100vh - 120px);">
        <!-- 物品管理 -->
        <div v-if="activeMenu === 'items'" class="content-card">
          <div class="search-bar">
            <Select v-model="searchForm.type" placeholder="类型" clearable style="width: 120px;">
              <SelectOption v-for="t in types" :key="t" :label="t" :value="t" />
            </Select>
            <Select v-model="searchForm.category" placeholder="分类" clearable style="width: 120px;">
              <SelectOption v-for="c in categories" :key="c" :label="c" :value="c" />
            </Select>
            <Select v-model="searchForm.base" placeholder="基地" clearable style="width: 120px;">
              <SelectOption v-for="b in bases" :key="b.name" :label="b.name" :value="b.name" />
            </Select>
            <Select v-model="searchForm.status" placeholder="状态" clearable style="width: 120px;">
              <SelectOption v-for="s in statuses" :key="s" :label="getStatusLabel(s)" :value="s" />
            </Select>
            <Button type="primary" @click="searchForm = { type: '', category: '', location: '', status: '', base: '', department: '' }">
              <Search /> 重置
            </Button>
            <Button type="success" @click="openDialog">
              <Plus /> 添加物品
            </Button>
          </div>
          
          <Table :data="filteredItems" border>
            <TableColumn prop="name" label="物品名称" />
            <TableColumn prop="type" label="类型" />
            <TableColumn prop="category" label="分类" />
            <TableColumn prop="location" label="位置" />
            <TableColumn prop="department" label="部门" />
            <TableColumn prop="base" label="基地" />
            <TableColumn prop="status" label="状态">
              <template #default="scope">
                <Tag :type="getStatusColor(scope.row.status)">{{ getStatusLabel(scope.row.status) }}</Tag>
              </template>
            </TableColumn>
            <TableColumn prop="purchase_date" label="采购日期" />
            <TableColumn prop="price" label="金额" :formatter="(row: Item) => `¥${row.price.toLocaleString()}`" />
            <TableColumn prop="depreciation_period" label="折旧年限(年)" />
            <TableColumn label="操作">
              <template #default="scope">
                <Button size="small" @click="openDialog(scope.row)"><Edit /></Button>
                <Popconfirm title="确定删除？" @confirm="deleteItem(scope.row.id)">
                  <Button size="small" type="danger"><Trash /></Button>
                </Popconfirm>
              </template>
            </TableColumn>
          </Table>
        </div>
        
        <!-- 转移申请 -->
        <div v-if="activeMenu === 'transfers'" class="content-card">
          <div class="search-bar">
            <Select v-model="transferSearchForm.status" placeholder="状态" clearable style="width: 120px;">
              <SelectOption label="待审批" value="pending" />
              <SelectOption label="已通过" value="approved" />
              <SelectOption label="已拒绝" value="rejected" />
            </Select>
            <Button type="success" @click="openTransferDialog">
              <Plus /> 发起申请
            </Button>
          </div>
          
          <Table :data="filteredTransferRequests" border>
            <TableColumn prop="item_name" label="物品名称" />
            <TableColumn prop="from_location" label="原位置" />
            <TableColumn prop="to_location" label="目标位置" />
            <TableColumn prop="from_department" label="原部门" />
            <TableColumn prop="to_department" label="目标部门" />
            <TableColumn prop="applicant" label="申请人" />
            <TableColumn prop="status" label="状态">
              <template #default="scope">
                <Tag :type="scope.row.status === 'pending' ? 'warning' : scope.row.status === 'approved' ? 'success' : 'danger'">
                  {{ getTransferStatusLabel(scope.row.status) }}
                </Tag>
              </template>
            </TableColumn>
            <TableColumn prop="reason" label="原因" />
            <TableColumn prop="created_at" label="申请时间" />
            <TableColumn prop="approved_by" label="审批人" />
            <TableColumn label="操作">
              <template #default="scope">
                <template v-if="scope.row.status === 'pending'">
                  <Button size="small" type="success" @click="approveTransfer(scope.row.id)"><Check /> 通过</Button>
                  <Button size="small" type="danger" @click="rejectTransfer(scope.row.id)"><X /> 拒绝</Button>
                </template>
                <Popconfirm v-else title="确定删除？" @confirm="deleteTransfer(scope.row.id)">
                  <Button size="small" type="danger">删除</Button>
                </Popconfirm>
              </template>
            </TableColumn>
          </Table>
        </div>
        
        <!-- 定位图 -->
        <div v-if="activeMenu === 'location'" class="content-card">
          <div class="search-bar">
            <Select v-model="searchForm.base" placeholder="选择基地" clearable style="width: 120px;">
              <SelectOption v-for="b in bases" :key="b.name" :label="b.name" :value="b.name" />
            </Select>
          </div>
          <div class="location-grid">
            <div v-for="(itemsInLocation, key) in groupedByLocation" :key="key" class="location-card">
              <div class="location-header">
                <MapLocation />
                <span class="location-name">{{ key.split(' - ')[1] }}</span>
                <span class="base-tag">{{ key.split(' - ')[0] }}</span>
              </div>
              <div class="items-list">
                <div v-for="item in itemsInLocation" :key="item.id" class="item-card" :style="{ borderLeftColor: getStatusColor(item.idle ? 'warning' : 'success') === 'success' ? '#27ae60' : '#f39c12' }">
                  <div class="item-name">{{ item.name }}</div>
                  <div class="item-meta">
                    <Tag size="small">{{ item.category }}</Tag>
                    <span>{{ item.department }}</span>
                  </div>
                  <div class="item-price">¥{{ item.price.toLocaleString() }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 投资汇总 -->
        <div v-if="activeMenu === 'summary'" class="content-card">
          <Row :gutter="16" style="margin-bottom: 20px;">
            <Col :span="6">
              <Card class="stat-card">
                <div class="stat-icon investment"></div>
                <div>
                  <div class="stat-value">¥{{ totalInvestment.toLocaleString() }}</div>
                  <div class="stat-label">投资总额</div>
                </div>
              </Card>
            </Col>
            <Col :span="6">
              <Card class="stat-card">
                <div class="stat-icon item"></div>
                <div>
                  <div class="stat-value">{{ totalItems }}</div>
                  <div class="stat-label">物品总数</div>
                </div>
              </Card>
            </Col>
            <Col :span="6">
              <Card class="stat-card">
                <div class="stat-icon payment"></div>
                <div>
                  <div class="stat-value">¥{{ totalPayment.toLocaleString() }}</div>
                  <div class="stat-label">付款计划</div>
                </div>
              </Card>
            </Col>
            <Col :span="6">
              <Card class="stat-card">
                <div class="stat-icon depreciation"></div>
                <div>
                  <div class="stat-value">¥{{ totalDepreciation.toLocaleString() }}</div>
                  <div class="stat-label">年折旧额</div>
                </div>
              </Card>
            </Col>
          </Row>
          
          <Row :gutter="16">
            <Col :span="12">
              <Card title="投资透视分析">
                <div v-for="(data, base) in investmentByBase" :key="base" class="base-summary">
                  <div class="base-header">
                    <span class="base-name">{{ base }}</span>
                    <span class="base-total">¥{{ data.total.toLocaleString() }}</span>
                  </div>
                  <div v-for="(amount, category) in data.categories" :key="category" class="category-row">
                    {{ category }}: ¥{{ amount.toLocaleString() }}
                  </div>
                </div>
              </Card>
            </Col>
            <Col :span="12">
              <Card title="预算使用情况">
                <div v-for="base in budgetSummary" :key="base.name" class="budget-item">
                  <div class="budget-header">
                    <span>{{ base.name }}</span>
                    <span class="remaining">剩余: ¥{{ base.remainingBudget.toLocaleString() }}</span>
                  </div>
                  <Progress :percentage="base.percentage" />
                  <div class="budget-detail">已用 ¥{{ base.usedBudget.toLocaleString() }} / 预算 ¥{{ base.budget.toLocaleString() }}</div>
                </div>
                <div class="total-budget">
                  总预算: ¥{{ totalBudget.allocated.toLocaleString() }} | 
                  已使用: ¥{{ totalBudget.used.toLocaleString() }} | 
                  剩余: ¥{{ totalBudget.remaining.toLocaleString() }}
                </div>
              </Card>
            </Col>
          </Row>
          
          <Row :gutter="16" style="margin-top: 20px;">
            <Col :span="12">
              <Card title="付款计划">
                <Table :data="paymentPlanByMonth" border>
                  <TableColumn prop="month" label="月份" />
                  <TableColumn prop="total" label="计划金额" :formatter="(row: { total: number }) => `¥${row.total.toLocaleString()}`" />
                  <TableColumn prop="paid" label="已支付" :formatter="(row: { paid: number }) => `¥${row.paid.toLocaleString()}`" />
                  <TableColumn prop="pending" label="待支付" :formatter="(row: { pending: number }) => `¥${row.pending.toLocaleString()}`" />
                </Table>
              </Card>
            </Col>
            <Col :span="12">
              <Card title="折旧分析">
                <div v-for="(data, base) in depreciationByBase" :key="base" class="depreciation-item">
                  <div class="depreciation-header">
                    <span>{{ base }}</span>
                    <span class="depreciation-total">年折旧: ¥{{ data.total.toLocaleString() }}</span>
                  </div>
                  <div v-for="item in data.items.slice(0, 3)" :key="item.name" class="depreciation-row">
                    {{ item.name }}: ¥{{ item.annual.toLocaleString() }}/年
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </Layout.Content>
    </Layout>
    
    <!-- 物品编辑对话框 -->
    <Dialog :title="isEdit ? '编辑物品' : '添加物品'" :visible="showDialog" @close="showDialog = false">
      <Form :model="form" label-width="100px">
        <FormItem label="物品名称"><Input v-model="form.name" /></FormItem>
        <FormItem label="类型">
          <Select v-model="form.type">
            <SelectOption v-for="t in types" :key="t" :label="t" :value="t" />
          </Select>
        </FormItem>
        <FormItem label="分类">
          <Select v-model="form.category">
            <SelectOption v-for="c in categories" :key="c" :label="c" :value="c" />
          </Select>
        </FormItem>
        <FormItem label="位置"><Input v-model="form.location" /></FormItem>
        <FormItem label="部门">
          <Select v-model="form.department">
            <SelectOption v-for="d in departments" :key="d" :label="d" :value="d" />
          </Select>
        </FormItem>
        <FormItem label="基地">
          <Select v-model="form.base">
            <SelectOption v-for="b in bases" :key="b.name" :label="b.name" :value="b.name" />
          </Select>
        </FormItem>
        <FormItem label="采购日期"><DatePicker v-model="form.purchase_date" type="date" /></FormItem>
        <FormItem label="金额"><InputNumber v-model="form.price" :min="0" /></FormItem>
        <FormItem label="折旧年限"><InputNumber v-model="form.depreciation_period" :min="1" /> 年</FormItem>
        <FormItem label="备注"><Input v-model="form.description" type="textarea" /></FormItem>
      </Form>
      <template #footer>
        <Button @click="showDialog = false">取消</Button>
        <Button type="primary" @click="saveItem">确定</Button>
      </template>
    </Dialog>
    
    <!-- 转移申请对话框 -->
    <Dialog title="发起转移申请" :visible="showTransferDialog" @close="showTransferDialog = false">
      <Form :model="transferForm" label-width="100px">
        <FormItem label="物品">
          <Select v-model="transferForm.item_id" @change="handleItemChange">
            <SelectOption v-for="item in items" :key="item.id" :label="item.name" :value="item.id" />
          </Select>
        </FormItem>
        <FormItem label="原位置"><Input v-model="transferForm.from_location" disabled /></FormItem>
        <FormItem label="目标位置"><Input v-model="transferForm.to_location" /></FormItem>
        <FormItem label="原部门"><Input v-model="transferForm.from_department" disabled /></FormItem>
        <FormItem label="目标部门">
          <Select v-model="transferForm.to_department">
            <SelectOption v-for="d in departments" :key="d" :label="d" :value="d" />
          </Select>
        </FormItem>
        <FormItem label="申请人"><Input v-model="transferForm.applicant" /></FormItem>
        <FormItem label="原因"><Input v-model="transferForm.reason" type="textarea" /></FormItem>
      </Form>
      <template #footer>
        <Button @click="showTransferDialog = false">取消</Button>
        <Button type="primary" @click="submitTransfer">提交申请</Button>
      </template>
    </Dialog>
  </Layout>
</template>

<style scoped>
.app-layout { height: 100vh; }
.logo { display: flex; align-items: center; justify-content: center; padding: 20px; color: #fff; font-size: 16px; border-bottom: 1px solid #3a536b; }
.logo-icon { margin-right: 8px; font-size: 24px; }
.header-title { font-size: 18px; font-weight: 600; color: #303133; }
.content-card { background: #fff; padding: 20px; border-radius: 8px; }
.search-bar { display: flex; gap: 15px; align-items: center; margin-bottom: 20px; flex-wrap: wrap; }

.location-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
.location-card { background: #fafafa; border-radius: 8px; padding: 15px; }
.location-header { display: flex; align-items: center; gap: 8px; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #e0e0e0; }
.location-name { font-weight: 600; }
.base-tag { margin-left: auto; font-size: 12px; background: #e0e0e0; padding: 2px 8px; border-radius: 4px; }
.items-list { display: flex; flex-direction: column; gap: 10px; }
.item-card { background: #fff; padding: 12px; border-radius: 6px; border-left: 4px solid #27ae60; }
.item-name { font-weight: 500; }
.item-meta { display: flex; gap: 10px; font-size: 12px; margin: 5px 0; }
.item-price { font-size: 13px; color: #666; }

.stat-card { display: flex; align-items: center; gap: 15px; }
.stat-icon { width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.stat-icon.investment { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.stat-icon.item { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.stat-icon.payment { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
.stat-icon.depreciation { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
.stat-value { font-size: 24px; font-weight: 600; }
.stat-label { font-size: 12px; color: #909399; }

.base-summary { margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #e0e0e0; }
.base-header { display: flex; justify-content: space-between; font-weight: 600; margin-bottom: 8px; }
.category-row { padding-left: 15px; font-size: 13px; color: #666; }

.budget-item { margin-bottom: 15px; }
.budget-header { display: flex; justify-content: space-between; margin-bottom: 5px; }
.remaining { color: #27ae60; }
.budget-detail { font-size: 12px; color: #666; margin-top: 5px; }
.total-budget { margin-top: 20px; padding-top: 15px; border-top: 1px solid #e0e0e0; font-weight: 500; }

.depreciation-item { margin-bottom: 15px; }
.depreciation-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
.depreciation-total { color: #e74c3c; }
.depreciation-row { padding-left: 15px; font-size: 13px; color: #666; }
</style>