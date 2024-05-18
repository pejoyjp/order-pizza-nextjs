"use client"
import React from 'react'
import PizzaCard from '../card/pizza-card'
import useSWR from 'swr'
import { getAllPizzas } from '@/actions/pizzas'

const AllOffers = () => {
    const {data:pizzas} = useSWR('allPizzas',getAllPizzas)

    return (
        <div>
            <p className='py-10 text-4xl font-bold text-center'>
                All Offers
            </p>

            <div className='flex flex-wrap gap-6 justify-center md:justify-start'>
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

export default AllOffers