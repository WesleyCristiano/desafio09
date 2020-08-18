import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id)
    if(!customer){
      throw new AppError('This customer does not exists')
    }

    const ids = products.map(product=> {
      return {id: product.id}
    })
    const allProducts = await this.productsRepository.findAllById(ids)

    if(products.length !== allProducts.length){
      throw new AppError('Any product(s) in your list does not exist')
    }

    const newAddProducts = allProducts.map(product => ({
      product_id: product.id,
      price: product.price,
      quantity:
        products[products.findIndex(data => data.id === product.id)].quantity,
    }));
    allProducts.forEach(product=>{
      newAddProducts.forEach(prod=>{
        if(product.quantity < prod.quantity){
          throw new AppError(`The quantity of product ${product.name} is not enough`)
        }
      })
    })

    const order = await this.ordersRepository.create({
      customer,
      products: newAddProducts
    })

   

    await this.productsRepository.updateQuantity(newAddProducts)
    return order
  }
}

export default CreateOrderService;
