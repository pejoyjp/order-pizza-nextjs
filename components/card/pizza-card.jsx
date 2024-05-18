// PizzaCard.js

import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from '@/lib/utils';
import useCart from '@/hooks/useCart';
import { useState } from 'react';
import toast from 'react-hot-toast';
import Link from 'next/link';

const PizzaCard = ({ pizza }) => {
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState('M');
  const [newPizza, setNewPizza] = useState();
  const [openCartDialog, setOpenCartDialog] = useState(false); // Add state for dialog visibility

  useEffect(() => {
    const initialSizeData = JSON.parse(pizza.sizeandcrust)[selectedSize];
    setNewPizza({ ...pizza, sizeandcrust: selectedSize, price: initialSizeData.price });
  }, [pizza, selectedSize]);

  const jsonPizza = JSON.parse(pizza.sizeandcrust);

  const handleAddItem = () => {
    addItem(newPizza);
    setOpenCartDialog(true); // Open cart dialog after adding item
    toast.success('Added successfully');
  };

  const handleSizeChange = (size) => {
    setSelectedSize(size);
  
    const sizeData = jsonPizza[size];
    const updatedPizza = {
      ...pizza,
      price: sizeData.price,
      sizeandcrust: size
    };
  
    setNewPizza(updatedPizza);
  };
  
  return (
    <Card className="w-[300px]">
      <CardHeader>
        <CardTitle className={cn("h-[30px]")}>
          {pizza.name}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Link href={`/pizza/pizza?pizzaId=${pizza.id}`}>
          <img src={pizza.img} className='object-cover' alt={pizza.name}/>
          <CardDescription className={cn("h-[70px]")}>
            {pizza.description}
          </CardDescription>
        </Link>
        <div className="flex gap-3">
          {Object.keys(jsonPizza).map((size) => (
            <Button 
              size="sm"
              key={size} 
              variant={selectedSize === size ? "" : "outline"}
              onClick={() => handleSizeChange(size)}
            >
              {size === "M" ? "6 Inch" :
               size === "L" ? "9 Inch":
               size === "XL" ? "12 Inch" :""
              }
            </Button>
          ))}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <p className='font-bold'>
          Price: ${jsonPizza[selectedSize].price}
        </p>
        <Button variant="outline" onClick={handleAddItem}>
          Order Now
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PizzaCard;
