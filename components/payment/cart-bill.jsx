import React, { useState,useEffect } from 'react'
import { CardElement, useElements, useStripe  } from "@stripe/react-stripe-js";

import { CardTitle, CardDescription, CardHeader, CardFooter, Card, CardContent } from "@/components/ui/card"
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '../ui/input';
import {TruckIcon} from 'lucide-react'
import useCart from '@/hooks/useCart';
import { format } from 'date-fns';
import { uploadContactByUserId } from '@/actions/user';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
  } from "@/components/ui/dialog"

import { ethers } from 'ethers';
import { toast } from 'react-hot-toast';
import { verifytPayment } from '@/actions/payment';
import useSWR from 'swr'
import useUserId from '@/hooks/userUserId';
import { getContactsByUserId } from '@/actions/user';
import { useRouter } from 'next/navigation';
import { Textarea } from '../ui/textarea';
import { savePayment } from '@/actions/payment';
import { saveOrderPizzas } from '@/actions/order';
import { useForm } from 'react-hook-form';

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"


const CARD_ELEMENT_OPTIONS = {
  style: {
      base: {
          color: "black",
    
          fontSmoothing: "antialiased",
          
          "::placeholder": {
              color: "gray",
          },
          padding: '10px', 
      },
      invalid: {
          color: "red",
          ":focus": {
              color: "black",
          },
      },
  },
};

const CartBill = ({user}) => {
    const {carts,totalPrices,clearCart} = useCart()
    const [method,setMethod] = useState('card')
    const elements = useElements();
    const stripe = useStripe();
    const [error, setError] = useState();
    const [txs, setTxs] = useState([]);
    const [ethPrice, setEthPrice] = useState(null);
    const {userId} = useUserId()
    const [contact,setContact] = useState()
    const [open,setOpen] = useState(false)
    const [instruction,setInstruction] = useState("")
    const route = useRouter()
    const [deliveryMethod,setDeliverytMethod] = useState('Standard Delivery')
  
    const { register, handleSubmit, formState: { errors },reset } = useForm();
   
    const { data: contacts, mutate,isLoading } = useSWR(
        `${userId}contact`,
        () => getContactsByUserId(userId),
        { revalidateOnFocus: false } 
    );


    useEffect(() => {
        if (contacts && contacts.data && contacts.data.length > 0) {
            setContact(contacts.data[0]);
        }
    }, [contacts]);

  

    useEffect(() => {
        const fetchETHPrice = async () => {
            try {
                const response = await fetch('https://api.etherscan.io/api?module=stats&action=ethprice&apikey=Q3JFX965IQYAPIWU8WW83BZ2Y13CDDNX5R');
                const data = await response.json();
                if(data.status === "1" && data.message === "OK") {
                    setEthPrice(data.result.ethusd);
                } else {
                    throw new Error('Failed to fetch the ETH price');
                }
            } catch (error) {
                console.error("Error fetching ETH price:", error);
            }
        };

        fetchETHPrice();
    }, []);




  
    const onSubmit = async(data) => {
        // You can integrate the API call here to submit the data
        try{
            console.log(data);
            await uploadContactByUserId(userId,data)
            toast.success("Uploaded successfully")
            setOpen(false)
            mutate()
            reset()
    
        }catch(e){
            toast.error(e.message)
        }
    
      };

  
    const startPayment = async ({ setError, setTxs, ether, addr }) => {
        try {
            if (!window.ethereum)
                throw new Error("No crypto wallet found. Please install it.");
    
            await window.ethereum.send("eth_requestAccounts");
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            ethers.utils.getAddress(addr);
            const tx = await signer.sendTransaction({
                to: addr,
                value: ethers.utils.parseEther(ether)
            });
            setTxs([tx]);
    
            // Wait for transaction confirmation
            const receipt = await tx.wait();
    
            if (receipt.status === 1) {
                // Transaction succeeded
                return true;
            } else {
                // Transaction failed
                return false;
            }
        } catch (err) {
            setError(err.message);
            return false;
        }
    };
    

  

    const totalPriceWithShipping = totalPrices + 5

    const handleChange = (value)=>{
        setMethod(value)
        
    }

    const handleDeliveryChange = (value)=>{
        setDeliverytMethod(value)
    }


  const onEthPay = async () => {
        setError(); // Clear previous errors
        try {
            const paymentSuccessful = await startPayment({
                setError,
                setTxs,
                ether: String(totalPriceWithShipping / ethPrice),
                addr: "0x5BfD12B7310621d2A1EE0773a4c2E728C79cdd9b"
            });

            if (paymentSuccessful) {
                const data = {
                    userId,
                    instruction,
                    paymentStatus: "done",
                    totalPrice: totalPriceWithShipping,
                    status: "Processing",
                    paymentMethod: method,
                    deliveryMethod:deliveryMethod,
                    deliveryAddress: contact.address,
                    contactPhone: contact.phone_number
                };

                const paymentRes = await savePayment(data);
                const orderRes = await saveOrderPizzas(paymentRes.orderId, carts);
                console.log(orderRes);

                if (paymentRes.success && orderRes.success) {
                    toast.success(paymentRes.message);
                    clearCart();
                    route.push('/payment/payment-success');
                } else {
                    toast.error(paymentRes.error);
                }
            } else {
                toast.error("Payment failed");
            }
        } catch (e) {
            toast.error(e.message);
        }
    };


    const handleCardPay = async () => {
        const cardElement = elements?.getElement(CardElement);
        if (!stripe || !cardElement) {
            toast.error("Stripe or card element not loaded");
            return;
        }

        try {

            const { clientSecret } = await verifytPayment(10); 
            const paymentResult = await stripe.confirmCardPayment(clientSecret, {
                payment_method: { card: cardElement },
            });

            if (paymentResult.error) {
                throw new Error(paymentResult.error.message);
            } else {
                const data = {
                    userId,
                    instruction,
                    paymentStatus:"done",
                    totalPrice:totalPriceWithShipping,
                    status:"Processing",
                    paymentMethod:method,
                    deliveryMethod:deliveryMethod,
                    deliveryAddress:contact.address,
                    contactPhone:contact.phone_number
                }


                const paymentRes = await savePayment(data)

                const orderRes = await saveOrderPizzas(paymentRes.orderId,carts)
                console.log(orderRes);

                if(paymentRes.success && orderRes.success ){
                    toast.success(paymentRes.message)
                    clearCart()
                    route.push('/payment/payment-success')

                }else{
                    toast.error(paymentRes.error)
                }
            }

        } catch (error) {
        toast.error(`Payment failed: ${error.message}`);
        }
    };




  return (
    <Card className="overflow-hidden  basis-1/3" x-chunk="dashboard-05-chunk-4">
        <CardHeader className="flex flex-row items-start bg-muted/50">
            <div className="grid gap-0.5">
            <CardTitle className="group flex items-center gap-2 text-lg">
                Order 
            </CardTitle>
            <CardDescription>Date: {format(Date.now(), 'yyyy-MM-dd HH:mm')}</CardDescription>
            </div>
            <div className="ml-auto flex items-center gap-1">
            <Button className="h-8 gap-1" size="sm" variant="outline">
                <TruckIcon className="h-3.5 w-3.5" />
            </Button>
            
            </div>
        </CardHeader>
        <CardContent className="p-6 text-sm">
            <div className="grid gap-3">
            <div className="font-semibold">Order Details</div>
            <div className="grid gap-3">
                {
                    carts.map((cart)=>(
                        <Accordion type="single" collapsible className="w-full">
                            
                            <AccordionItem value="item-1" key={cart.id}>
                   
                                    <AccordionTrigger className="flex">
                                       
                                        <span className="text-muted-foreground">
                                                {cart.name} 
                                            
                                        </span>

                                        <span> x{cart.quantity}</span>

                                        <span>{ cart.sizeandcrust === "M" ? "6 " :
                                                cart.sizeandcrust === "L" ? "9" :
                                                cart.sizeandcrust === "XL" ? "12" : ""}
                                        </span>

                                        <span> ${(cart.price).toFixed(2)}</span>

                                    </AccordionTrigger>


                           
                                

                                <AccordionContent>
                                    {
                                        cart.toppings.map(topping => (

                                            topping.total_price !== 0 &&
                                           
                                            <div key={topping.name} className='flex justify-between'>
                                                <p>
                                                    {topping.name}
                                                </p>
                                        
                                                <div className='flex w-20 justify-between'>
                                                    <p>
                                                        x{topping.quantity}
                                                    </p>
                                        
                                                    <p>
                                                        ${topping.total_price}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    }
                                    
                                </AccordionContent>
                                
                            </AccordionItem>
                    
                        </Accordion>

                ))


            }
                            
               
            </div>
            <Separator className="my-2" />
            <ul className="grid gap-3">
                
                <li className="flex items-center justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>$5.00</span>
                </li>
                <li className="flex items-center justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>$0</span>
                </li>
                <li className="flex items-center justify-between font-semibold">
                    <span className="text-muted-foreground">Total</span>
                    <span>${totalPriceWithShipping.toFixed(2)}</span>
                </li>
            </ul>
            </div>
            <Separator className="my-4" />


                <Dialog open={open}>
                    <DialogTrigger asChild>
                        <div className='hover:bg-slate-200 p-2 cursor-pointer rounded-md'
                             onClick={()=>setOpen(true)}
                        >
                            <div>
                                <div className="font-semibold">Shipping Information</div>
                                <address className="grid gap-0.5 not-italic text-muted-foreground">
                                    
                                    <span>
                                        {contact?.address}
                                    </span>
                                    
                                </address>
                            </div>


                            
                            <div className="font-semibold mt-4">
                                <dt>
                                    Phone
                                </dt>

                                <dd className='not-italic text-muted-foreground'>
                                    <span>{contact?.phone_number}</span>
                                </dd>
                            
                            </div>
                    
                        </div>

                    </DialogTrigger>

                    <DialogContent className="sm:max-w-md" setOpen={setOpen}>


                        {
                            !contact ?  
                            
                            <form className=" w-full space-y-4" onSubmit={handleSubmit(onSubmit)}>
                                    <div className="w-full space-y-2">
                                        <label>
                                            Address
                                        </label>
                                        <Input placeholder="Address" 
                                        {...register("address", { required: true })}
                                                
                                        />

                                    </div>

                                    <div className="w-full space-y-2">
                                        <label>
                                            Phone Number
                                        </label>
                                        <Input placeholder="Phone Number" 
                                            {...register("phoneNumber", { required: true })}
                                        
                                        />
                                    </div>
                                
                                    <DialogFooter>
                                        <Button type="submit">Confirm</Button>
                                    </DialogFooter>
                            </form> : 

                            <div>
                                <DialogHeader>
                                    <DialogTitle>Choose your address</DialogTitle>
                                </DialogHeader>

                                {contacts?.data.map(contact=>(
                                <div key={contact.id} 
                                className='mt-2 cursor-pointer rounded-md hover:bg-slate-200'>
                                    <div className='space-y-2  p-2'
                                        onClick={()=>{
                                            setContact(contact);
                                            setOpen(false)
                                        }}
                                    >
                                        <p>
                                            address: {contact.address}
                                        </p>
                                        <p>
                                            phone: {contact.phone_number}
                                        </p>
                                    
                                    </div>
                                    <Separator/>
                                </div>
                                ))}
                            </div>
                        }

                        
                        
                    </DialogContent>

                </Dialog>
          
           




            <Separator className="my-4" />
            {
                user && 
                <div className="grid gap-3">
                    <div className="font-semibold">Customer Information</div>
                    <dl className="grid gap-3">

                        <div className="flex items-center justify-between">
                            <dt className="text-muted-foreground">Customer</dt>
                            <dd>{user.username}</dd>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <dt className="text-muted-foreground">Email</dt>
                            <dd>
                                <a href="#">{user.email}</a>
                            </dd>
                        </div>

                        <div className="">
                            <p className="text-muted-foreground">
                                Special Instructions
                            </p>

                            <Textarea onChange ={(e)=>setInstruction(e.target.value)}
                                      className="mt-3 text-sm" 
                                      value={instruction}
                            />

                              
                          
                        </div>
                    </dl>
                </div>
            }
           
            <Separator className="my-4" />

            <div className=' space-y-4'>
                <div className="flex justify-between items-center">
                    <div className="font-semibold">
                        Delivery Method
                    </div>
                    
                    <Select onValueChange={(value)=>handleDeliveryChange(value)} defaultValue={deliveryMethod}>
                        <SelectTrigger className="w-[80px]">
                            <SelectValue placeholder="Card" />
                        </SelectTrigger>

                        <SelectContent>
                            <SelectItem
                                        value="Standard Delivery">
                                Standard Delivery
                            </SelectItem>

                            <SelectItem value="Contactless Delivery">
                                Contactless Delivery
                            </SelectItem>
                        </SelectContent>

                    </Select>

                </div>
            </div>

            <Separator className="my-4" />

            <div className=' space-y-4'>
                <div className="flex justify-between items-center">
                    <div className="font-semibold">
                        Payment Method
                    </div>
                    
                    <Select onValueChange={(value)=>handleChange(value)} defaultValue={method}>
                        <SelectTrigger className="w-[80px]">
                            <SelectValue placeholder="Card" />
                        </SelectTrigger>

                        <SelectContent>
                            <SelectItem
                                        value="card">
                                Card
                            </SelectItem>

                            <SelectItem value="eth">
                                Eth
                            </SelectItem>
                        </SelectContent>

                    </Select>

                </div>

                {
                    method === "card" ? 
                    <>

                        <img src='/bg/bankcard.png' className=' rounded-md'/>
                
                            <CardElement options={CARD_ELEMENT_OPTIONS}
                                            
                            />
                

                        <div className=' w-full'>
                            <Button className="w-full"
                                     onClick={handleCardPay}
                            
                            >
                                Pay with card
                            </Button>
                        </div>
                    </>:

                    <>
                        <img src='/bg/eth.png' className='rounded-md'/>
                        <div className=' w-full'>
                            <Button className="w-full"
                                    onClick={onEthPay}
                            >
                                Pay with Eth
                            </Button>
                        </div>
                        {
                            error &&   <p className=' text-white bg-red-500 rounded-md whitespace-normal p-2 break-words'>
                                {error}
                            </p>
                        }
                      

                    
                    </>
                }
               
                

            </div>
          
        </CardContent>

        <CardFooter className="flex flex-row items-center border-t bg-muted/50 px-6 py-3">
            <div className="text-xs text-muted-foreground">
                BlockSlice©
        
            </div>
        
        </CardFooter>
    </Card>

  )
}

export default CartBill