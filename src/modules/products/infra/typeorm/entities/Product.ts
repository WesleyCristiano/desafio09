import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

import OrdersProducts from '@modules/orders/infra/typeorm/entities/OrdersProducts';

@Entity('products')
class Product {
  
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column()
  name: string;
  
  @Column('decimal',{precision: 7, scale: 2})
  price: number;
  
  @Column('int')
  quantity: number;

  @OneToMany(()=> OrdersProducts, orderproducts=>orderproducts.product)
  order_products: OrdersProducts[];
  
  @CreateDateColumn()
  created_at: Date;
  
  @UpdateDateColumn()
  updated_at: Date;
}

export default Product;