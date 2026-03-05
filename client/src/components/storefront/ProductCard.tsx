import { Plus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useCart } from "@/context/CartContext";
import type { Product } from "@shared/schema";
import fishImg from "@assets/Gemini_Generated_Image_w6wqkkw6wqkkw6wq_(1)_1772713077919.png";
import prawnsImg from "@assets/Gemini_Generated_Image_5xy0sd5xy0sd5xy0_1772713090650.png";
import chickenImg from "@assets/Gemini_Generated_Image_g0ecb4g0ecb4g0ec_1772713219972.png";
import muttonImg from "@assets/Gemini_Generated_Image_8fq0338fq0338fq0_1772713565349.png";
import masalaImg from "@assets/Gemini_Generated_Image_4e60a64e60a64e60_1772713888468.png";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const isUnavailable = product.status === "unavailable";

  const getFallbackImage = (category: string) => {
    switch (category) {
      case "Prawns": return prawnsImg;
      case "Chicken": return chickenImg;
      case "Mutton": return muttonImg;
      case "Masalas": return masalaImg;
      default: return fishImg;
    }
  };

  return (
    <div className="group relative bg-card flex flex-col h-full transition-all duration-300">
      <div className="relative aspect-square w-full bg-muted/30 overflow-hidden mb-3 border border-border/20 rounded-xl">
        <img
          src={product.imageUrl || getFallbackImage(product.category)}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-700 ${
            isUnavailable ? "grayscale opacity-60" : "group-hover:scale-110"
          }`}
        />
        
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.status === "limited" && (
            <Badge variant="outline" className="bg-amber-500/90 backdrop-blur text-white border-none shadow-sm py-0.5 text-[10px] h-5">
              Limited
            </Badge>
          )}
          {product.status === "unavailable" && (
            <Badge variant="outline" className="bg-red-500/90 backdrop-blur text-white border-none shadow-sm py-0.5 text-[10px] h-5">
              Sold Out
            </Badge>
          )}
        </div>

        {product.status === "limited" && product.limitedStockNote && (
          <div className="absolute bottom-2 left-2 right-2">
             <div className="bg-black/60 backdrop-blur rounded px-2 py-1 text-[10px] font-medium text-white shadow-sm flex items-center gap-1">
                <Info className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{product.limitedStockNote}</span>
             </div>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col px-1">
        <div className="text-[10px] font-bold text-primary/80 mb-0.5 uppercase tracking-wider">{product.category}</div>
        <h3 className="font-sans font-medium text-sm text-foreground leading-tight mb-1 line-clamp-2">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between mt-auto pt-2">
          <div className="flex flex-col">
            <span className="text-base font-bold text-foreground">₹{product.price}</span>
          </div>
          <Button
            onClick={() => addToCart(product)}
            disabled={isUnavailable}
            className="rounded-full w-8 h-8 p-0 bg-primary hover:bg-primary/90 text-white shadow-md flex items-center justify-center"
            size="icon"
          >
            {isUnavailable ? <span className="text-[10px]">Out</span> : <Plus className="w-5 h-5 text-white" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
