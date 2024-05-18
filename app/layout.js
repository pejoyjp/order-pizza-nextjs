import { Manrope, Oxygen } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ToastProvider from "@/providers/toast-provider";

import Cart from "@/components/cart";

const font = Manrope({ subsets: ["latin"],weight:['200','400','500','600','700','800']});

export const metadata = {
  title: "BlockSlice",
  description: "BlockSlice combines blockchain technology with mouthwatering pizzas, offering a secure way to satisfy your cravings",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      
      <body className={font.className}>
        <ToastProvider/>
        <Navbar/>
        <div className="md:w-[1280px] m-auto"> 
         {children}
        </div>

        <Cart/>
       
     
        <Footer/>
      </body>
    </html>
  );
}
