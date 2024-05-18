"use client"
import React from 'react'
import PizzaCard from '../card/pizza-card'
import useSWR from 'swr'
import { getPopularPizzas } from '@/actions/pizzas'

const SpecialOffer = ({isCenter}) => {
    const {data:pizzas} = useSWR('popularPizzas',getPopularPizzas)
    console.log(pizzas);
    return (
        <div className='flex justify-center items-center flex-col'>
            <p className={`text-center py-10 text-4xl font-bold`}>
                Special Offer
            </p>

            <div className={`flex flex-wrap justify-center  gap-6`}>
                {
                    pizzas?.map((pizza)=>(
                        <PizzaCard key={pizza.id}
                                pizza={pizza}
                        />
                    ))
                }
            </div>
          

        
        </div>
    )
}

export default SpecialOffer