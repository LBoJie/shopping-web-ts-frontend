export interface ApiResponse<T = any> {
  requestData: any;
  responseData: T;
}

export type Member = {
  id: number;
  account: string;
  name: string;
  phone: string;
  email: string;
  birthday: string;
  gender: string;
  role: string;
};

export type Product = {
  id: number;
  categoryId: number;
  categoryName: string;
  inventory: number;
  imgUrl: string;
  name: string;
  price: number;
  status: string;
  inPromotion?: number | null;
  descriptionHtml?: string;
  promotion: {
    id: number;
    name: string;
    discountType: string;
    discountValue: number;
    discountPrice: number;
    isActive: boolean;
  } | null;
};

export type EditProduct = {
  id: number;
  img: string;
  name: string;
  price: number;
  inventory: number;
  status: string;
};

export type CartItem = {
  productId: number;
  name: string;
  price: number;
  discountPrice: number | null;
  imgUrl: string;
  quantity: number;
  inventory: number;
  status: string;
};

export type Promotion = {
  id?: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  discountType: "PERCENTAGE";
  imgUrl: string | null;
  discountValue: number;
  productIds: number[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type OrderTimeStamp = {
  timestamp: string;
  content: string;
}[];

export type Order = {
  id: number;
  recipientAddress: string;
  recipientName: string;
  recipientPhone: string;
  status: string;
  totalAmount: number;
  createdAt: string | null;
  notes: string;
  orderTimeStamp?: OrderTimeStamp;
  orderItems: {
    imgUrl: string;
    price: number;
    productName: string;
    quantity: number;
    discountPrice: number;
    productId: number;
  }[];
};


export type Carousel = {
  id?: number
  category: number
  href: string
  imgUrl: string
  order?: number
}