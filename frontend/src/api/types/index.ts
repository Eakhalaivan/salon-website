export interface PageResponse<T> {
  content: T[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface CustomerDto {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes?: string;
  totalPoints: number;
  familyGroupId?: number;
  isPrimaryMember: boolean;
  profilePhoto?: string;
}

export interface AppointmentDto {
  id: number;
  customerId: number;
  customerName?: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  totalPrice: number;
  totalDurationMins: number;
  notes?: string;
  services: AppointmentServiceDto[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AppointmentServiceDto {
  id?: number;
  serviceId: number;
  serviceName?: string;
  staffId: number;
  staffName?: string;
  startTime: string;
  endTime?: string;
  price?: number;
}

export interface ServiceDto {
  id: number;
  name: string;
  description: string;
  price: number;
  durationMins: number;
  genderCategory?: 'MEN' | 'WOMEN' | 'UNISEX';
  category: string;
  businessType?: 'SPA' | 'SALON' | 'BOTH';
  isActive?: boolean;
  imageUrl?: string;
}

export interface StaffDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  branchId: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface InvoiceDto {
  id: number;
  appointmentId?: number;
  customerId: number;
  branchId: number;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  status: 'PENDING' | 'PAID' | 'VOID' | 'REFUNDED';
  createdAt?: string;
}

export interface ProductDto {
  id: number;
  name: string;
  description: string;
  price: number;
  sku: string;
  stockQuantity: number;
}

export interface SubscriptionPlanDto {
  id: number;
  name: string;
  description: string;
  validityDays: number;
  price: number;
  discountRate: number;
  planType: string;
  totalSessions: number;
}

export interface SubscriptionDto {
  id: number;
  plan: SubscriptionPlanDto;
  startDate: string;
  endDate: string;
  remainingBalance: number;
  status: string;
}

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  role: string;
  branchId?: number;
}
